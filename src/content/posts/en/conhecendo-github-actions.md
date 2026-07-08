---
title: Understanding GitHub Actions
description: >-
  Understand what GitHub Actions is, how it works, and how to use workflows to
  automate tasks like testing, building, and deploying directly on GitHub.
date: '2026-05-30'
category: GITHUB ACTIONS
tags:
  - github-actions
  - ci-cd
  - workflows
  - automacao
  - devops
  - github
draft: false
language: en
translationOf: conhecendo-github-actions
sourceHash: 0b957c9d861dad8cd60e58f70320e6b014adf63f7182b20b154d9f9d4ab433f6
---
# Understanding **GitHub Actions**?
In practice, **GitHub Actions** is used to create **CI/CD** pipelines directly within GitHub.

This means that instead of doing everything manually every time we change the code, we can configure GitHub to execute some automatic commands when something happens in the repository.

For example: when I make a `push` to GitHub, I can create an automation to download the code, install dependencies, run tests, build the application, generate a Docker image, and even publish that application to an environment.

This environment could be AWS, Vercel, a self-hosted server, or any other place that makes sense for the project.

The main idea is simple:

```txt  
Eu altero o código
        ↓
Faço push para o GitHub
        ↓
O GitHub Actions executa uma pipeline
        ↓
A pipeline roda comandos automaticamente
        ↓
O projeto é testado, validado ou publicado
```

## What is a pipeline?
A pipeline is nothing more than an automatic sequence of steps to take something "raw" and transform it into a final result.
For example, in a real project, a pipeline could have this flow:

```txt  
Baixar o código
        ↓
Instalar dependências
        ↓
Rodar testes
        ↓
Fazer o build da aplicação
        ↓
Gerar uma imagem Docker
        ↓
Fazer o deploy
```
The big advantage is that this process is always executed in the same way. Instead of relying on someone to remember all the commands manually, GitHub itself executes everything based on what was configured.
This helps prevent errors, saves time, and makes the delivery process much more reliable.

## What is a workflow?
Within GitHub Actions, the element that defines this automation is the **workflow**.
The workflow is a file written in **YAML**, where we configure when the automation should run, on which machine it will be executed, and which commands will be run.

This file is located in the folder:
``` 
.github/workflows/ 
```
``` 
.github/workflows/meu-primeiro-workflow.yaml
```
In practice, it's in this file that we tell GitHub:
 > When a push occurs on the main branch, run these commands on an Ubuntu machine

The ***pipeline*** is the concept of the automated process, and the workflow is the file where we describe this automation within GitHub Actions.

## Basic Structure of a **Workflow**
A GitHub Actions workflow typically follows a structure similar to this:
``` 
name: Primeiro Workflow

on:
  push:
    branches:
      - main

jobs:
  exemplo:
    runs-on: ubuntu-latest

    steps:
      - name: Exibir mensagem
        run: echo "Meu primeiro workflow com GitHub Actions"    
```
This example is still very simple, but it already shows the basic structure of a workflow.
``` 
name     → nome do workflow
on       → quando o workflow será executado
jobs     → o que será executado
runs-on  → onde será executado
steps    → quais passos serão executados  
```
GitHub Actions basically works like this:
```
Um evento acontece no repositório
        ↓
O workflow é iniciado
        ↓
Um ou mais jobs são executados
        ↓
Cada job roda seus steps
        ↓
A automação termina com sucesso ou falha
```

In other words, the workflow is the file that organizes the entire automation.
## Summary
GitHub Actions allows you to create automations directly within GitHub.

With it, we can build pipelines to test, validate, build, and even publish an application automatically.

In this initial overview, we saw that a pipeline is a sequence of automated steps, and in GitHub Actions, this pipeline is defined through a file called a workflow.

The important thing is to keep this idea in mind:
> GitHub Actions automates tasks.
> A pipeline is the automated process.
> A workflow is the file that describes this process on GitHub.
