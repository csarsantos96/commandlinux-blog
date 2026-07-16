---
title: Automating Terraform Validation with GitHub Actions and Shell Script
description: >-
  Learn how to separate Terraform validation logic into Bash scripts and use
  them within a GitHub Actions workflow to create more organized and reusable
  pipelines.
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
sourceHash: 14c4cf61c71707a6b39902f79f1110ad4b9ee6e32f8d37dd95a74f33f10ea526
---
# Automating Terraform Validation with GitHub Actions and Shell Script

When we start creating pipelines in GitHub Actions, it's common to put all commands directly inside the YAML file.

While this works, as the pipeline grows, it becomes difficult to maintain.

A widely used alternative is to move all the logic to a **Shell Script**, leaving the workflow solely responsible for executing that script.

This pattern improves project organization and facilitates reuse across different pipelines.

---

# Project Structure

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
- **variables.tf** declares the variables.
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

---

# Creating an Instance

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

---

# Declaring Variables

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

---

# Creating the Validation Script

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

is an excellent practice because it:

- terminates the script on the first error;
- prevents the use of nonexistent variables;
- correctly handles errors in command pipelines.

---

# Installing Terraform during the pipeline

If the runner does not have Terraform installed, we can download it automatically.

Simplified example:

```bash
curl -L "$DOWNLOAD_URL" -o terraform.zip

unzip terraform.zip

export PATH="$HOME/bin:$PATH"
```

This way, we don't depend on a prior installation.

---

# Executing the Validation

After initializing the project, simply validate the syntax.

```bash
terraform init -backend=false

terraform validate
```

The parameter

```text
-backend=false
```

is very useful during testing because it avoids configuring a remote backend just to validate the project structure.

---

# Returning the Result to GitHub Actions

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

---

# Simplified Workflow

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

Notice that almost all the logic has moved out of the workflow.

---

# Advantages of this Approach

Among the main benefits are:

- Smaller and more readable workflows;
- Reusable scripts;
- Easy to test locally;
- Separation between infrastructure and automation;
- Much simpler maintenance.

---

# Conclusion

Separating pipeline logic into Bash scripts is a widely used practice in DevOps projects.

GitHub Actions remains responsible for pipeline orchestration, while the Shell Script concentrates all the execution logic.

This organization makes the code cleaner, facilitates local testing, and allows the same script to be reused across different pipelines without duplicating commands.

The larger the project, the greater the benefit of this separation tends to be.

---

## Official Documentation

- GitHub Actions: https://docs.github.com/actions
- Terraform Validate: https://developer.hashicorp.com/terraform/cli/commands/validate
- Terraform Init: https://developer.hashicorp.com/terraform/cli/commands/init
- Terraform Providers: https://developer.hashicorp.com/terraform/language/providers
- Bash Manual: https://www.gnu.org/software/bash/manual/bash.html
