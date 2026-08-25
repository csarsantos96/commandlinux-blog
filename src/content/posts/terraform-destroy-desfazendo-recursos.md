---
title: "Terraform Destroy: Desfazendo o Que Foi Criado"
description: "O comando terraform destroy: como ele monta o plano de remoção, o que o símbolo de destruição significa na saída e como gerar e aplicar um plano de destruição separado."
date: 2026-08-25
category: TERRAFORM
tags: [terraform, destroy, plan, aws, state]
---

Depois de [colocar `init`, `plan` e `apply` em prática](/posts/terraform-init-plan-apply-na-pratica), faltava a última peça do ciclo: desfazer o que o Terraform criou. Essas são as anotações sobre o `terraform destroy`, incluindo um detalhe que já me confundiu antes: a região do provider.

# Um lembrete sobre a região do provider

Ao trabalhar com AWS, a região é uma informação importante em qualquer operação, inclusive na hora de destruir recursos. Se a região não estiver configurada explicitamente no código, o Terraform pode acabar usando uma região padrão definida no ambiente, e não a que você imagina.

Isso pode causar confusão, porque um recurso não pode ser encontrado (ou destruído) numa região diferente daquela em que ele realmente foi criado. Vale sempre conferir o bloco `provider` antes de rodar qualquer comando destrutivo.

# Terraform Destroy

```bash
terraform destroy
```

O comando `terraform destroy` é usado para destruir os recursos gerenciados pelo Terraform, ou seja, tudo que está registrado no state file daquele projeto.

Antes de destruir qualquer coisa, o Terraform mostra um plano de destruição e pede confirmação, exatamente como faz o `apply`. Na saída do comando, os recursos que serão removidos aparecem marcados com o símbolo `-`, o mesmo símbolo usado no `plan` para indicar destruição.

Essa confirmação existe justamente para dar uma última chance de revisar o que vai sumir antes de o comando seguir em frente.

# Gerando um plano de destruição separado

Também é possível gerar um plano de destruição antes de aplicar a remoção dos recursos, sem depender da confirmação interativa do `terraform destroy`:

```bash
terraform plan -destroy -out destruir
```

Esse comando cria um arquivo de plano indicando exatamente o que será destruído, do mesmo jeito que o `terraform plan -out` salva um plano de criação ou alteração.

Depois, esse plano pode ser aplicado com:

```bash
terraform apply destruir
```

O `apply` reconhece que aquele arquivo é um plano de destruição e executa a remoção dos recursos listados nele, sem precisar montar o plano de novo na hora.

## Por que separar plan e apply na destruição

A mesma lógica do `plan -out` vale aqui: salvando o plano de destruição num arquivo, o que será removido fica registrado e revisável antes da execução. Isso é especialmente útil em pipelines automatizadas, onde faz sentido ter uma etapa humana revisando o plano antes de uma etapa separada aplicar a destruição, sem depender de um prompt interativo no meio do processo.

# O que o destroy não alcança

O `terraform destroy` só sabe destruir o que está no state file. Recursos criados manualmente pelo console da AWS, ou por qualquer outra ferramenta fora do Terraform, simplesmente não aparecem nesse plano, porque o Terraform não tem conhecimento deles. É mais um motivo para manter o state file atualizado e, em ambientes reais, remoto: falei sobre isso no post [Terraform state, o arquivo que pode derrubar sua infra](/posts/terraform-state-primeiros-passos).

# Conclusão

O `terraform destroy` fecha o ciclo que começa no `write` e passa pelo `plan` e pelo `apply`: assim como criar e alterar, remover também passa por um plano revisável antes de qualquer coisa acontecer de verdade. A parte que mais vale guardar é essa: o símbolo `-` na saída do plano é o mesmo aviso, seja ele parte de um `apply` comum ou de um `destroy` dedicado, e vale sempre parar e ler antes de confirmar.

## Referências

* [HashiCorp Developer, comando `terraform destroy`](https://developer.hashicorp.com/terraform/cli/commands/destroy): referência oficial do comando de destruição de recursos.
* [HashiCorp Developer, comando `terraform plan`](https://developer.hashicorp.com/terraform/cli/commands/plan): documenta a opção `destroy`, usada para gerar um plano de remoção.
* [HashiCorp Developer, comando `terraform apply`](https://developer.hashicorp.com/terraform/cli/commands/apply): explica como aplicar um arquivo de plano salvo, seja de criação ou de destruição.
* [HashiCorp Developer, Terraform state](https://developer.hashicorp.com/terraform/language/state): documenta por que o destroy só alcança o que está registrado no state.
* [LINUXtips, Treinamentos Essentials](https://linuxtips.io/treinamentos-essentials/): página do curso de IaC/Terraform utilizado como base dos meus estudos e destas anotações.
