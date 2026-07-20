---
title: Terraform state - the file that can bring down your infra
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
sourceHash: 8a30251d3c96b2d7486663b1b038db9cad652ad4726c5319e1da3d362cb94199
---
The `terraform.tfstate` is the map between your code and the real world. Lose the state, lose control of your infrastructure.

## What the state stores

Every resource created, its real cloud IDs, dependencies, and metadata. This is how Terraform knows what needs to be created, changed, or destroyed in a `plan`.

## Why local state is dangerous

- No teamwork: everyone has a different state
- No lock: two simultaneous `apply` commands corrupt everything
- Secrets can be saved in plain text in the file

## Remote backend with S3

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
