---
title: Terraform state - the file that can take down your infra
description: >-
  What Terraform state is, why it should never live on your machine, and how to
  configure a remote backend with locking.
date: '2026-06-15'
category: TERRAFORM
tags:
  - state
  - backend
  - s3
  - IaC
draft: false
language: en
translationOf: terraform-state-primeiros-passos
sourceHash: 00009203d9ef00f501086072bda12a0fb20c3deab215ca25786a75a19c80b5ca
---
The `terraform.tfstate` is the map between your code and the real world. Lose the state, lose control of your infrastructure.

## What the state stores

Every resource created, its real IDs in the cloud, dependencies, and metadata. This is how Terraform knows what needs to be created, changed, or destroyed in a `plan`.

## Why local state is dangerous

- No teamwork: everyone with a different state
- No locking: two simultaneous `apply` operations corrupt everything
- Secrets can be stored in plain text in the file

## Remote Backend with S3

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

After configuring:

```bash
terraform init -migrate-state
terraform plan
```

## Golden rules

1. State always remote, versioned, and encrypted
2. Never edit the state manually — use `terraform state mv` and similar commands
3. One state per environment (dev/staging/prod separated)

## References

- [HashiCorp Developer — Terraform state](https://developer.hashicorp.com/terraform/language/state) — documents the purpose and functioning of the state.
- [HashiCorp Developer — Backend S3](https://developer.hashicorp.com/terraform/language/backend/s3) — official reference for remote storage and locking in S3.
- [HashiCorp Developer — State Management](https://developer.hashicorp.com/terraform/cli/state) — presents the safe commands for manipulating resources in the state.
- [LINUXtips — Essentials Training](https://linuxtips.io/treinamentos-essentials/) — Terraform Essentials page, the course used as the basis for my studies and these notes.
