---
title: Automating Terraform validation using scripts within GitHub Actions workflows
description: >-
  Learn how to use Bash scripts within GitHub Actions workflows to better
  organize your pipelines, reuse commands, and automate tasks like Terraform
  project validation.
date: '2026-07-16'
category: CI/CD
tags:
  - github-actions
  - terraform
  - shell-script
  - bash
  - automation
  - devops
  - ci-cd
draft: false
language: en
translationOf: automatizando-validacao-do-terraform
sourceHash: 509efcf4dce97d4141b3f4e7f521d0ed78200e01841505e128493e030f927f1a
---
# Automating Terraform validation using scripts within GitHub Actions workflows

When we start creating pipelines in GitHub Actions, it's common to put all commands directly inside the YAML file.

While this works, as the pipeline grows, it becomes difficult to maintain.

A commonly used alternative is to move all the logic into a **Shell Script**, leaving the workflow solely responsible for executing that script.

This pattern improves project organization and facilitates reuse across different pipelines.


# Project structure

A simple example would be:

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

Each file has a specific responsibility.

- **provider.tf** configures the AWS provider.
- **variables.tf** declares variables.
- **ec2.tf** creates the resources.
- **valida-tf.sh** performs all validation.
- **testa-terraform.yml** calls the script during the pipeline.

---

# Configuring the Provider

The first step is to inform which provider will be used.

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


# Creating an instance

Then we can declare a simple resource.

```hcl
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type

  tags = {
    Name = "HelloWorld"
  }
}
```


# Declaring variables

Separating variables greatly facilitates code reuse.

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


# Creating the validation script

Instead of putting all commands inside the workflow, we can create a Bash file.

```bash
#!/usr/bin/env bash

set -euo pipefail

terraform init -backend=false

terraform validate
```

The command

```bash
set -euo pipefail
```

is an excellent practice because:

- terminates the script on the first error;
- prevents the use of non-existent variables;
- correctly handles errors in command pipelines.


# Installing Terraform during the pipeline

If the runner does not have Terraform installed, we can download it automatically.

Simplified example:

```bash
curl -L "$DOWNLOAD_URL" -o terraform.zip

unzip terraform.zip

export PATH="$HOME/bin:$PATH"
```

This way, we don't depend on a prior installation.


# Running the validation

After initializing the project, simply validate the syntax.

```bash
terraform init -backend=false

terraform validate
```

The parameter

```text
-backend=false
```

is very useful during tests because it avoids configuring a remote backend just to validate the project structure.


# Returning the result to GitHub Actions

Another interesting practice is to report the execution result using the special GitHub Actions file.

When everything works:

```bash
echo "tf_result=success" >> "$GITHUB_OUTPUT"
```

If an error occurs:

```bash
echo "tf_result=failure" >> "$GITHUB_OUTPUT"

exit 1
```

This way, other pipeline steps can use this information.


# Simplified workflow

The YAML becomes extremely small.

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

Notice that virtually all logic has moved out of the workflow.


# Advantages of this approach

Among the main benefits are:

- Smaller and more readable workflows;
- Reusable scripts;
- Ease of local testing;
- Separation between infrastructure and automation;
- Much simpler maintenance.


# Conclusion

Separating pipeline logic into Bash scripts is a common practice in DevOps projects.

GitHub Actions remains responsible for pipeline orchestration, while the Shell Script concentrates all execution logic.

This organization makes the code cleaner, facilitates local testing, and allows reusing the same script in different pipelines without duplicating commands.

The larger the project, the greater the benefit of this separation tends to be.


## References

- [GitHub Docs — GitHub Actions](https://docs.github.com/pt/actions) — official documentation for the automation platform.
- [HashiCorp Developer — `terraform validate`](https://developer.hashicorp.com/terraform/cli/commands/validate) — official reference for the validation command.
- [HashiCorp Developer — `terraform init`](https://developer.hashicorp.com/terraform/cli/commands/init) — official reference for initializing the working directory.
- [HashiCorp Developer — Providers](https://developer.hashicorp.com/terraform/language/providers) — documents provider configuration.
- [GNU Bash Manual](https://www.gnu.org/software/bash/manual/bash.html) — official documentation for the Bash language and shell.
- [LINUXtips — Treinamentos](https://linuxtips.io/treinamentos/) — courses I use as a basis for my studies in Terraform, pipelines, and GitHub Actions.
