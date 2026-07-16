---
title: Automatizando a validação de Terraform utilizando scripts dentro de workflows do GitHub Actions
description: Aprenda como utilizar scripts Bash dentro de workflows do GitHub Actions para organizar melhor suas pipelines, reutilizar comandos e automatizar tarefas como a validação de projetos Terraform.
date: 2026-07-16
category: CI/CD
tags: [github-actions, terraform, shell-script, bash, automation, devops, ci-cd]
---

# Automatizando a validação de Terraform utilizando scripts dentro de workflows do GitHub Actions

Quando começamos a criar pipelines no GitHub Actions, é comum colocar todos os comandos diretamente dentro do arquivo YAML.

Embora funcione, conforme a pipeline cresce ela acaba ficando difícil de manter.

Uma alternativa muito utilizada é mover toda a lógica para um **Shell Script**, deixando o workflow apenas responsável por executar esse script.

Esse padrão melhora a organização do projeto e facilita a reutilização em diferentes pipelines.


# Estrutura do projeto

Um exemplo simples seria:

```text
.
├── .github
│   └── workflows
│       └── testa-terraform.yml
├── infra
│   ├── provider.tf
│   ├── variables.tf
│   └── ec2.tf
└── scripts
    └── valida-tf.sh
```

Cada arquivo possui uma responsabilidade específica.

- **provider.tf** configura o provider da AWS.
- **variables.tf** declara as variáveis.
- **ec2.tf** cria os recursos.
- **valida-tf.sh** executa toda a validação.
- **testa-terraform.yml** chama o script durante a pipeline.

---

# Configurando o Provider

O primeiro passo é informar qual provider será utilizado.

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
```


# Criando uma instância

Depois podemos declarar um recurso simples.

```hcl
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type

  tags = {
    Name = "HelloWorld"
  }
}
```


# Declarando variáveis

Separar as variáveis facilita bastante a reutilização do código.

```hcl
variable "ami_id" {
  type    = string
  default = "ami-xxxxxxxx"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}
```


# Criando o script de validação

Em vez de colocar todos os comandos dentro do workflow, podemos criar um arquivo Bash.

```bash
#!/usr/bin/env bash

set -euo pipefail

terraform init -backend=false

terraform validate
```

O comando

```bash
set -euo pipefail
```

é uma excelente prática porque:

- encerra o script ao primeiro erro;
- impede uso de variáveis inexistentes;
- trata corretamente erros em pipelines de comandos.


# Instalando o Terraform durante a pipeline

Caso o runner não possua o Terraform instalado, podemos baixá-lo automaticamente.

Exemplo simplificado:

```bash
curl -L "$DOWNLOAD_URL" -o terraform.zip

unzip terraform.zip

export PATH="$HOME/bin:$PATH"
```

Assim não dependemos de uma instalação prévia.


# Executando a validação

Após inicializar o projeto, basta validar a sintaxe.

```bash
terraform init -backend=false

terraform validate
```

O parâmetro

```text
-backend=false
```

é muito útil durante testes porque evita configurar um backend remoto apenas para validar a estrutura do projeto.


# Retornando o resultado para o GitHub Actions

Outra prática interessante é informar o resultado da execução utilizando o arquivo especial do GitHub Actions.

Quando tudo funciona:

```bash
echo "tf_result=success" >> "$GITHUB_OUTPUT"
```

Caso ocorra algum erro:

```bash
echo "tf_result=failure" >> "$GITHUB_OUTPUT"

exit 1
```

Dessa forma outros passos da pipeline conseguem utilizar essa informação.


# Workflow simplificado

O YAML fica extremamente pequeno.

```yaml
name: Testa Terraform

on:
  workflow_dispatch:

jobs:
  valida:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Permitir execução
        run: chmod +x scripts/valida-tf.sh

      - name: Executar validação
        run: ./scripts/valida-tf.sh
```

Observe que praticamente toda a lógica saiu do workflow.


# Vantagens dessa abordagem

Entre os principais benefícios estão:

- Workflows menores e mais legíveis;
- Scripts reutilizáveis;
- Facilidade para testar localmente;
- Separação entre infraestrutura e automação;
- Manutenção muito mais simples.


# Conclusão

Separar a lógica da pipeline em scripts Bash é uma prática bastante utilizada em projetos DevOps.

O GitHub Actions continua responsável pela orquestração da pipeline, enquanto o Shell Script concentra toda a lógica da execução.

Essa organização torna o código mais limpo, facilita testes locais e permite reutilizar o mesmo script em diferentes pipelines sem duplicar comandos.

Quanto maior o projeto, maior tende a ser o benefício dessa separação.


## Documentação oficial

- GitHub Actions: https://docs.github.com/actions
- Terraform Validate: https://developer.hashicorp.com/terraform/cli/commands/validate
- Terraform Init: https://developer.hashicorp.com/terraform/cli/commands/init
- Terraform Providers: https://developer.hashicorp.com/terraform/language/providers
- Bash Manual: https://www.gnu.org/software/bash/manual/bash.html