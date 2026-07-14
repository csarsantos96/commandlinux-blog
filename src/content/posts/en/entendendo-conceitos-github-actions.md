---
title: 'Understanding GitHub Actions Contexts: github, env, vars, and secrets'
description: >-
  Learn how GitHub Actions contexts work, when to use `github`, `env`, `vars`,
  and `secrets`, and understand the differences between them with practical
  examples.
date: '2026-07-14'
category: CI/CD
tags:
  - GitHub Actions
  - CI/CD
  - DevOps
  - GitHub
  - Automation
draft: false
language: en
translationOf: entendendo-conceitos-github-actions
sourceHash: 46a071f111494219cb2e1ac1768bb46c016ff3bb63813a5ca8e1dba4820e13aa
---
# Understanding GitHub Actions Contexts: github, env, vars, and secrets

If you've started learning GitHub Actions, you've probably encountered expressions like these:

```yaml
${{ github.repository }}

${{ env.APP_NAME }}

${{ vars.AWS_REGION }}

${{ secrets.GEMINI_API_KEY }}
```

At first glance, they might seem like just different ways to access variables.

But there's an important difference: **each belongs to a different context**, serves a specific purpose, and is interpreted at distinct moments during workflow execution.

Understanding this difference is crucial for writing more organized, reusable, and secure workflows.

In this article, we'll explore the main GitHub Actions contexts using practical examples.



## What You'll Learn

By the end of this article, you will be able to:

- Understand what a Context is in GitHub Actions;
- Know when to use `github`, `env`, `vars`, and `secrets`;
- Understand the difference between Contexts and Environment Variables;
- Avoid common errors involving Secrets;
- Write cleaner and more secure workflows.



## What is a Context?

A **Context** is an object made available by GitHub during workflow execution.

These objects store information about the execution and can be accessed through expressions.

The syntax always follows this pattern:

```yaml
${{ contexto.propriedade }}
```

Example:

```yaml
${{ github.repository }}
```

In this example:

- `github` is the context;
- `repository` is a property of that context.

If the workflow is being executed in this repository:

```
csarsantos96/commandlinux-blog
```

this will be the output of the expression.

In practice, it works like accessing a property of an object in JavaScript.

```javascript
github.repository
```



## How GitHub Processes an Expression

A very important characteristic is that expressions like:

```yaml
${{ github.ref_name }}
```

are not interpreted by Bash.

GitHub Actions itself resolves this expression **before** sending the Job to the Runner.

This allows the use of conditions such as:

```yaml
if: ${{ github.ref_name == 'main' }}
```

In this case, GitHub decides whether the Job will execute even before the Runner starts.



## The `github` context

The `github` context contains practically all information about the Workflow execution.

Some commonly used properties are:

```yaml
${{ github.repository }}
${{ github.actor }}
${{ github.event_name }}
${{ github.workflow }}
${{ github.ref }}
${{ github.ref_name }}
${{ github.sha }}
${{ github.run_number }}
```

Example:

```yaml
steps:
  - name: Mostrar informações
    run: |
      echo "Repositório: ${{ github.repository }}"
      echo "Usuário: ${{ github.actor }}"
      echo "Evento: ${{ github.event_name }}"
      echo "Branch: ${{ github.ref_name }}"
      echo "Commit: ${{ github.sha }}"
```



## Context is not the same as an Environment Variable

This detail often causes a lot of confusion.

See these two examples.

First:

```yaml
run: echo "${{ github.ref_name }}"
```

Here, GitHub substitutes the expression before execution.

Now:

```yaml
run: echo "$GITHUB_REF_NAME"
```

In this case, Bash inside the Runner interprets the variable.

The result might be similar, but the moment each value is resolved is completely different.



## The `env` context

The `env` context represents variables defined within the workflow itself.

Example:

```yaml
env:
  APP_NAME: commandlinux

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - run: echo "${{ env.APP_NAME }}"
```

Since this variable is also exported to the Runner's environment, we can access it directly:

```yaml
run: echo "$APP_NAME"
```

The `env` context can be defined at three levels:

- Workflow
- Job
- Step

Each level can override the previous one.


## The `vars` context

Variables are configured directly in GitHub.

They can exist at the:

- Organization
- Repository
- Environment

They are ideal for non-sensitive configurations.

Examples:

```yaml
${{ vars.AWS_REGION }}

${{ vars.APP_URL }}

${{ vars.DOCKER_IMAGE }}
```

This information can be reused by multiple workflows without having to repeat values in the code.



## The `secrets` context

The `secrets` context stores confidential information.

For example, during the automatic translation of CommandLinux articles, I use a Gemini API key.

It is passed to the program in this way:

```yaml
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

steps:
  - run: node scripts/translate-post.mjs
```

The secret is never written directly into the code.



## What to Never Do

Even if GitHub tries to mask sensitive values in logs, the recommendation is never to print Secrets.

Avoid doing this:

```yaml
run: echo "${{ secrets.GEMINI_API_KEY }}"
```

The best practice is to pass the Secret directly to the application that will use it.



## Summary

| Context   | Usage                                |
|-----------|--------------------------------------|
| `github`  | Workflow execution information       |
| `env`     | Variables defined in the workflow    |
| `vars`    | Non-sensitive GitHub configurations  |
| `secrets` | Confidential information             |



## Conclusion

Contexts are one of the most important features of GitHub Actions. Understanding when to use `github`, `env`, `vars`, and `secrets` helps create more organized, reusable, and secure workflows.

Although they all seem like just "variables," each has a specific purpose and is interpreted at different moments during execution. Mastering this difference prevents common errors and makes your pipelines much more predictable.


## References

- GitHub Actions Contexts  
  https://docs.github.com/en/actions/learn-github-actions/contexts

- Expressions  
  https://docs.github.com/en/actions/learn-github-actions/expressions

- Variables  
  https://docs.github.com/en/actions/learn-github-actions/variables

- Environment Variables  
  https://docs.github.com/en/actions/learn-github-actions/environment-variables

- Secrets  
  https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions

- Workflow Syntax  
  https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
