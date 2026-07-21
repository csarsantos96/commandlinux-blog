---
title: Understanding GitHub Actions
description: >-
  Understand what GitHub Actions is, how it works, and how to use workflows to
  automate tasks like tests, builds, and deploys directly on GitHub.
date: '2026-05-30'
category: CI/CD
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
sourceHash: e6d545527584da6ff58843fcde66c7a39d87e43ca63f0884379196c9507ec97a
---
# Understanding **GitHub Actions**
In practice, **GitHub Actions** is used to create **CI/CD** pipelines directly within GitHub.

This means that instead of doing everything manually every time we change the code, we can configure GitHub to execute some automatic commands when something happens in the repository.

For example, when I `push` to GitHub, I can create an automation to download the code, install dependencies, run tests, build the application, generate a Docker image, and even publish this application to an environment.

This environment can be AWS, Vercel, a self-hosted server, or any other place that makes sense for the project.

The main idea is simple:

```txt
I change the code
        ↓
I push to GitHub
        ↓
GitHub Actions runs a pipeline
        ↓
The pipeline runs commands automatically
        ↓
The project is tested, validated, or published
```

## What is a pipeline?
A pipeline is simply an automated sequence of steps to take something "raw" and lead it to a final result.
For example, in a real project, a pipeline could have this flow:

```txt
Download the code
        ↓
Install dependencies
        ↓
Run tests
        ↓
Build the application
        ↓
Generate a Docker image
        ↓
Deploy
```
The great advantage is that this process is always executed in the same way. Instead of relying on someone to remember all the commands manually, GitHub itself executes everything based on what was configured.
This helps prevent errors, saves time, and makes the delivery process much more reliable.

## What is a workflow?
Within GitHub Actions, what defines this automation is the **workflow**.
A workflow is a file written in **YAML**, where we configure when the automation should run, on which machine it will be executed, and what commands will be executed.

This file is located inside the folder:
``` 
.github/workflows/ 
```
``` 
.github/workflows/meu-primeiro-workflow.yaml
```
In practice, it is in this file that we tell GitHub:
 > When a push happens on the main branch, run these commands on an Ubuntu machine.

A ***pipeline*** is the concept of the automated process, and the workflow is the file where we describe this automation within GitHub Actions.

## Basic Structure of a **Workflow**
A GitHub Actions workflow usually follows a structure similar to this:
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
This example is still very simple, but it already shows the basis of a workflow.
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

In other words, the workflow is the file that organizes all the automation.
## In Summary
GitHub Actions allows you to create automations within GitHub itself.

With it, we can set up pipelines to test, validate, build, and even publish an application automatically.

In this first contact, we saw that a pipeline is a sequence of automated steps, and in GitHub Actions, this pipeline is defined through a file called a workflow.

The important thing is to remember this idea:
> GitHub Actions automates tasks.
> A pipeline is the automated process.
> A workflow is the file that describes this process in GitHub.

## References

- [GitHub Docs — Understanding GitHub Actions](https://docs.github.com/pt/actions/about-github-actions/understanding-github-actions) — presents workflows, events, jobs, runners, and steps.
- [GitHub Docs — Workflow syntax](https://docs.github.com/pt/actions/writing-workflows/workflow-syntax-for-github-actions) — official reference for workflow files.
- [LINUXtips — Training](https://linuxtips.io/treinamentos/) — courses I use as a basis for my studies in DevOps, pipelines, and GitHub Actions.
