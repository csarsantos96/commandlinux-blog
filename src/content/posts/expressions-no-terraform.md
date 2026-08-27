---
title: "Expressions no Terraform: Valores Que Tornam o HCL Dinâmico"
description: "O que são expressions no Terraform e como usar referências, listas, mapas, condicionais e funções para evitar configurações repetidas."
date: 2026-08-26
category: TERRAFORM
tags: [terraform, hcl, expressions, variables, functions]
---

Nos primeiros exemplos de Terraform, é comum preencher os argumentos diretamente: uma AMI, um tipo de instância e algumas tags. Mas uma configuração real precisa reaproveitar valores, consultar atributos de outros recursos e mudar de comportamento conforme o ambiente. Em HCL, fazemos isso com **expressions**.

# O que é uma expression

Uma expression representa ou calcula um valor. O exemplo mais simples é um valor literal:

```hcl
instance_type = "t3.micro"
```

A string `"t3.micro"` já é uma expression. O mesmo vale para números, booleanos, listas e mapas:

```hcl
enabled = true
ports   = [80, 443]

tags = {
  Name        = "web"
  Environment = "dev"
}
```

O poder das expressions aparece quando o valor deixa de ser fixo e passa a ser derivado de outra parte da configuração.

# Referenciando valores

Uma expression pode ler variáveis, valores locais, data sources, recursos e módulos:

```hcl
variable "instance_type" {
  type    = string
  default = "t3.micro"
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public.id
}

output "public_ip" {
  value = aws_instance.web.public_ip
}
```

Aqui aparecem três referências diferentes:

* `data.aws_ami.ubuntu.id` lê o ID retornado por um data source
* `var.instance_type` lê uma variável de entrada
* `aws_subnet.public.id` usa um atributo de outro recurso

Ao encontrar a última referência, o Terraform também entende que a instância depende da subnet e organiza a ordem das operações automaticamente.

# Valores locais e funções

Os valores locais ajudam a dar nome a uma expression e evitar repetição:

```hcl
variable "environment" {
  type = string
}

locals {
  name_prefix = "commandlinux-${var.environment}"

  common_tags = {
    Project     = "commandlinux"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
```

Depois, os valores podem ser usados em vários recursos:

```hcl
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.environment == "production" ? "t3.small" : "t3.micro"
  tags          = merge(local.common_tags, { Name = "${local.name_prefix}-web" })
}
```

Esse trecho combina alguns recursos da linguagem:

* `${local.name_prefix}` é uma interpolação dentro de uma string
* `condição ? valor_verdadeiro : valor_falso` é uma expression condicional
* `merge(...)` é uma função que combina mapas

Quando toda a string é apenas uma referência, não é necessário usar interpolação. Prefira `ami = data.aws_ami.ubuntu.id` a `ami = "${data.aws_ami.ubuntu.id}"`.

# Coleções e `for`

Expressions também transformam listas e mapas. Por exemplo, para normalizar uma lista de nomes:

```hcl
variable "services" {
  type    = list(string)
  default = ["API", "WEB", "WORKER"]
}

locals {
  service_names = [for service in var.services : lower(service)]
}
```

O resultado de `local.service_names` será:

```hcl
["api", "web", "worker"]
```

Também é possível filtrar itens:

```hcl
locals {
  long_names = [for service in var.services : lower(service) if length(service) > 3]
}
```

# Nem todo lugar aceita qualquer expression

Expressions aparecem em quase toda a linguagem, mas alguns contextos exigem valores conhecidos desde o início. A configuração de backend é um bom exemplo: ela é processada durante o `terraform init`, antes de variáveis, recursos e data sources estarem disponíveis.

Por isso, isto não funciona:

```hcl
terraform {
  backend "s3" {
    bucket = var.state_bucket
  }
}
```

Nesse caso, valores variáveis podem ser fornecidos por configuração parcial do backend, por arquivo próprio ou pela opção `-backend-config`, tomando cuidado para não gravar credenciais nesses locais.

# Testando com `terraform console`

O comando abaixo abre um console interativo para experimentar expressions no contexto da configuração atual:

```bash
terraform console
```

Alguns testes possíveis:

```hcl
> upper("terraform")
"TERRAFORM"

> 2 * 3
6

> [for value in [1, 2, 3] : value * 2]
[
  2,
  4,
  6,
]
```

Esse console é uma forma rápida de validar uma transformação antes de colocá-la num recurso.

# Conclusão

Expressions são o que transforma um arquivo HCL estático em uma configuração reutilizável. Valores literais continuam sendo expressions, mas referências, condicionais, funções e expressões `for` permitem conectar recursos e adaptar a infraestrutura sem duplicar blocos.

A regra prática é começar simples e extrair uma expression quando ela evita repetição ou torna uma relação mais clara. Se o cálculo fica difícil de ler, provavelmente merece um nome em `locals`.

## Referências

* [HashiCorp Developer, Expressions](https://developer.hashicorp.com/terraform/language/expressions): visão geral das expressions na linguagem Terraform.
* [HashiCorp Developer, tipos e valores](https://developer.hashicorp.com/terraform/language/expressions/types): strings, números, booleanos e coleções.
* [HashiCorp Developer, referências](https://developer.hashicorp.com/terraform/language/expressions/references): como acessar variáveis, recursos, data sources e valores locais.
* [HashiCorp Developer, expressões `for`](https://developer.hashicorp.com/terraform/language/expressions/for): transformação e filtragem de coleções.
* [HashiCorp Developer, comando `terraform console`](https://developer.hashicorp.com/terraform/cli/commands/console): console interativo para testar expressions.
* [LINUXtips, Treinamento IaC e Pipeline Specialist](https://linuxtips.io/iac-pipeline-specialist/): treinamento de IaC com Terraform utilizado como base dos meus estudos e destas anotações.
