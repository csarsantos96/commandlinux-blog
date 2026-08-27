---
title: 'Expressions in Terraform: Values That Make HCL Dynamic'
description: >-
  What are expressions in Terraform and how to use references, lists, maps,
  conditionals, and functions to avoid repeated configurations.
date: '2026-08-26'
category: TERRAFORM
tags:
  - terraform
  - hcl
  - expressions
  - variables
  - functions
draft: false
language: en
translationOf: expressions-no-terraform
sourceHash: fd5c15b9c3e8374190a2dac3f661d88f2c1281245791c31e4804f360c2636339
---
In the first Terraform examples, it's common to fill arguments directly: an AMI, an instance type, and some tags. But a real configuration needs to reuse values, query attributes from other resources, and change behavior according to the environment. In HCL, we do this with **expressions**.

# What is an expression

An expression represents or calculates a value. The simplest example is a literal value:

```hcl
instance_type = "t3.micro"
```

The string `"t3.micro"` is already an expression. The same applies to numbers, booleans, lists, and maps:

```hcl
enabled = true
ports   = [80, 443]

tags = {
  Name        = "web"
  Environment = "dev"
}
```

The power of expressions appears when the value is no longer fixed and becomes derived from another part of the configuration.

# Referencing values

An expression can read variables, local values, data sources, resources, and modules:

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

Here, three different references appear:

* `data.aws_ami.ubuntu.id` reads the ID returned by a data source
* `var.instance_type` reads an input variable
* `aws_subnet.public.id` uses an attribute from another resource

Upon encountering the last reference, Terraform also understands that the instance depends on the subnet and automatically organizes the order of operations.

# Local values and functions

Local values help name an expression and avoid repetition:

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

Afterward, the values can be used in multiple resources:

```hcl
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.environment == "production" ? "t3.small" : "t3.micro"
  tags          = merge(local.common_tags, { Name = "${local.name_prefix}-web" })
}
```

This snippet combines several language features:

* `${local.name_prefix}` is an interpolation within a string
* `condition ? true_value : false_value` is a conditional expression
* `merge(...)` is a function that combines maps

When the entire string is just a reference, interpolation is not necessary. Prefer `ami = data.aws_ami.ubuntu.id` over `ami = "${data.aws_ami.ubuntu.id}"`.

# Collections and `for`

Expressions also transform lists and maps. For example, to normalize a list of names:

```hcl
variable "services" {
  type    = list(string)
  default = ["API", "WEB", "WORKER"]
}

locals {
  service_names = [for service in var.services : lower(service)]
}
```

The result of `local.service_names` will be:

```hcl
["api", "web", "worker"]
```

It's also possible to filter items:

```hcl
locals {
  long_names = [for service in var.services : lower(service) if length(service) > 3]
}
```

# Not every place accepts every expression

Expressions appear almost everywhere in the language, but some contexts require values known from the start. Backend configuration is a good example: it's processed during `terraform init`, before variables, resources, and data sources are available.

Therefore, this does not work:

```hcl
terraform {
  backend "s3" {
    bucket = var.state_bucket
  }
}
```

In this case, variable values can be provided by partial backend configuration, via a dedicated file, or using the `-backend-config` option, being careful not to store credentials in these locations.

# Testing with `terraform console`

The command below opens an interactive console to experiment with expressions in the context of the current configuration:

```bash
terraform console
```

Some possible tests:

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

This console is a quick way to validate a transformation before placing it in a resource.

# Conclusion

Expressions are what transform a static HCL file into a reusable configuration. Literal values are still expressions, but references, conditionals, functions, and `for` expressions allow connecting resources and adapting infrastructure without duplicating blocks.

The practical rule is to start simple and extract an expression when it avoids repetition or makes a relationship clearer. If the calculation becomes difficult to read, it probably deserves a name in `locals`.

## References

* [HashiCorp Developer, Expressions](https://developer.hashicorp.com/terraform/language/expressions): overview of expressions in the Terraform language.
* [HashiCorp Developer, types and values](https://developer.hashicorp.com/terraform/language/expressions/types): strings, numbers, booleans, and collections.
* [HashiCorp Developer, references](https://developer.hashicorp.com/terraform/language/expressions/references): how to access variables, resources, data sources, and local values.
* [HashiCorp Developer, `for` expressions](https://developer.hashicorp.com/terraform/language/expressions/for): transforming and filtering collections.
* [HashiCorp Developer, `terraform console` command](https://developer.hashicorp.com/terraform/cli/commands/console): interactive console for testing expressions.
* [LINUXtips, IaC and Pipeline Specialist Training](https://linuxtips.io/iac-pipeline-specialist/): IaC training with Terraform used as the basis for my studies and these notes.
