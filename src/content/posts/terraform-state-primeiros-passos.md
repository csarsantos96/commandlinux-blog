---
title: Terraform state - o arquivo que pode derrubar sua infra
description: O que é o state do Terraform, por que ele nunca deve viver na sua máquina e como configurar um backend remoto com lock.
date: 2026-06-15
category: TERRAFORM
tags: [state, backend, s3, IaC]
---

O `terraform.tfstate` é o mapa entre o seu código e o mundo real. Perdeu o state, perdeu o controle da infraestrutura.

## O que o state guarda

Cada recurso criado, seus IDs reais na nuvem, dependências e metadados. É assim que o Terraform sabe o que precisa criar, alterar ou destruir num `plan`.

## Por que state local é perigoso

- Sem trabalho em equipe: cada um com um state diferente
- Sem lock: dois `apply` simultâneos corrompem tudo
- Segredos podem ficar gravados em texto plano no arquivo

## Backend remoto com S3

```hcl
terraform {
  backend "s3" {
    bucket       = "meu-terraform-state"
    key          = "prod/network.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
```

Depois de configurar:

```bash
terraform init -migrate-state
terraform plan
```

## Regras de ouro

1. State sempre remoto, versionado e criptografado
2. Nunca edite o state na mão — use `terraform state mv` e afins
3. Um state por ambiente (dev/staging/prod separados)

## Referências

- [HashiCorp Developer — Terraform state](https://developer.hashicorp.com/terraform/language/state) — documenta a finalidade e o funcionamento do state.
- [HashiCorp Developer — Backend S3](https://developer.hashicorp.com/terraform/language/backend/s3) — referência oficial para armazenamento remoto e locking no S3.
- [HashiCorp Developer — Gerenciamento do state](https://developer.hashicorp.com/terraform/cli/state) — apresenta os comandos seguros para manipular recursos no state.
- [LINUXtips — Treinamentos Essentials](https://linuxtips.io/treinamentos-essentials/) — página do Terraform Essentials, curso utilizado como base dos meus estudos e destas anotações.
