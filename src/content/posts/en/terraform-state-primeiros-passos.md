---
title: Terraform state - the file that can bring down your infrastructure
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
sourceHash: f0fd99c20231df83820d2f80db53f4aa08399dfda937e62ce6232846c93530f6
---
The `terraform.tfstate` is the map between your code and the real world. Lose the state, lose control of your infrastructure.

## What the state stores

Every resource created, their real IDs in the cloud, dependencies, and metadata. This is how Terraform knows what to create, change, or destroy in a `plan`.

## Why local state is dangerous

- No teamwork: everyone has a different state
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

## Golden Rules

1. State always remote, versioned, and encrypted
2. Never edit the state manually — use `terraform state mv` and similar commands
3. One state per environment (dev/staging/prod separated)
