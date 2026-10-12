---
title: 'From Git to GitHub Actions: Versioning, Workflows, Jobs, and Steps'
description: >-
  Understand commits and distributed version control with Git, and learn to
  organize GitHub Actions workflows with jobs, steps, needs, and artifacts.
date: '2026-10-12'
category: CI/CD
tags:
  - git
  - github
  - github-actions
  - ci-cd
  - workflows
  - jobs
  - steps
  - artifacts
draft: false
language: en
translationOf: git-github-actions-workflows-jobs-steps
sourceHash: 84d7291dce7d4a6255d9c70dc2d6020c0660c4326a38cfa8ffbd636d294eae1c
---
When we change a project, we need to track what has changed. When these changes reach GitHub, we can also automatically run tasks to verify the code.

My study notes connect these two ideas: **recording project evolution with Git** and **organizing automation with GitHub Actions**.

In this article, we'll start with version control and move on to examples of tests, job dependencies, and file sharing.

## What is version control for?

Version control records changes to files over time. This allows you to consult previous versions, compare changes, and recover content when necessary.

Imagine a change introduced an error into the application. With an organized history, we can investigate what changed and recover a working version. This is one of the objectives presented in the [Pro Git book on version control](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control).

### Centralized and distributed

In a centralized system, a server centralizes the repository and its history. Some operations depend on access to this server.

In Git's distributed model, a full clone typically contains the repository's history locally. Thus, we can consult commits and record new changes even without a connection. Shallow clones, made with options like `--depth`, have a limited history.

GitHub hosts repositories and offers collaboration and automation features. Git is the versioning tool that also runs on our machine.

## What is a commit?

A **commit** records a project state, with a message and metadata such as author and references to previous commits. It receives an identifier that allows it to be found in the history.

For example, after changing a file:

```bash
git add app.py
git commit -m "corrige validação dos dados de entrada"
git log --oneline
```

`git add` prepares the content for the next commit. `git commit` records this content, and `git log` shows the history.

The commit resides in the local repository. To push the branch's commits to the remote:

```bash
git push origin main
```

In this example, `origin` is the name of the remote and `main` is the pushed branch.

### Where does Git store this information?

In a common local repository, the hidden `.git` folder contains the objects, references, configurations, and other data used by Git. The files we edit are in the working directory.

We can view hidden files with:

```bash
ls -a
```

The [Pro Git documentation on how Git works](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F) explains this relationship between the working directory, staging area, and repository.

## From push to automation

After pushing changes to GitHub, we can start a validation routine:

```text
Change the code → Create a commit → Push
                                         ↓
                              Automatically run tests
```

**GitHub Actions** allows you to define this routine in a workflow. I've already covered this foundation in the article [Understanding GitHub Actions](/posts/conhecendo-github-actions/).

## Workflow, job, and step

According to [GitHub's workflow documentation](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows), a workflow is an automated process defined in YAML within `.github/workflows/`.

The structure of the notes can be represented as follows:

```text
Workflow
└── Jobs
    └── Steps
```

| Concept | Role in automation |
| --- | --- |
| Workflow | Defines events and organizes jobs |
| Job | Groups tasks executed on a runner |
| Step | Executes a command or uses an action |

The **runner** is the machine that executes the job. In this article, we use GitHub-hosted Ubuntu runners.

## A workflow for testing a Python project

Consider a project with Python code, tests recognized by `pytest`, and a `requirements.txt` that includes application dependencies and `pytest` itself.

Create the `.github/workflows/ci.yml` file:

```yaml
name: CI

on: [push]

permissions:
  contents: read

jobs:
  testar:
    runs-on: ubuntu-latest

    steps:
      - name: Baixar o código
        uses: actions/checkout@v6

      - name: Configurar Python
        uses: actions/setup-python@v6
        with:
          python-version: '3.12'

      - name: Instalar dependências
        run: python -m pip install -r requirements.txt

      - name: Executar testes
        run: python -m pytest
```

`testar` identifies the job, and `runs-on` selects the runner. The `push` event starts the workflow.

The checkout makes the code available on the runner. Then, the [setup-python action](https://github.com/actions/setup-python) configures the specified Python version. The `python -m pip` and `python -m pytest` commands use this interpreter to install dependencies and run tests.

Without code, dependencies, and tests available, simply writing `run: pytest` is not enough to validate a project.

## The difference between run and uses

Use `run` to execute commands:

```yaml
- name: Verificar versão do Python
  run: python --version
```

Use `uses` to call a reusable action:

```yaml
- name: Baixar o código
  uses: actions/checkout@v6
```

In the notes, checkout appears as `@v4`; in the examples in this article, we use `@v6`.

## Order of steps and job dependencies

In a simple job like this, the steps execute in the declared order:

```yaml
steps:
  - run: echo "Primeiro"
  - run: echo "Segundo"
  - run: echo "Terceiro"
```

By default, a failure prevents subsequent steps from executing. Conditions like `if: always()` can change this behavior.

Jobs without dependencies can run in parallel. To make one job wait for another's success, we use `needs`:

```yaml
name: Dependência entre jobs

on: [push]

jobs:
  testar:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Etapa de testes — exemplo didático"

  deploy:
    needs: testar
    runs-on: ubuntu-latest
    steps:
      - run: echo "Etapa de deploy — exemplo didático"
```

The flow is `testar → success → deploy`. If `testar` fails, `deploy` will be skipped by default. Here, the commands only display messages: replace them with the actual project tasks.

These rules and options are in the [workflow syntax reference](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).

## How to share files between jobs?

On GitHub-hosted runners, each job uses a separate environment. A file created in one job does not automatically appear in another, even when `needs` is present.

To transfer files, we can use **artifacts**, according to [GitHub's data storage and sharing documentation](https://docs.github.com/en/actions/tutorials/store-and-share-data).

```yaml
name: Compartilhar arquivo

on: [push]

jobs:
  gerar:
    runs-on: ubuntu-latest
    steps:
      - name: Criar arquivo de exemplo
        run: echo "Arquivo produzido pelo primeiro job" > resultado.txt

      - name: Armazenar arquivo
        uses: actions/upload-artifact@v4
        with:
          name: resultado
          path: resultado.txt

  consumir:
    needs: gerar
    runs-on: ubuntu-latest
    steps:
      - name: Baixar arquivo
        uses: actions/download-artifact@v5
        with:
          name: resultado

      - name: Ler conteúdo
        run: cat resultado.txt
```

The first job creates and uploads the file. The second waits for its completion, downloads the artifact, and reads its content.

This same mechanism allows transferring test reports, packages, and files produced by a build. `needs` defines the dependency; artifact actions perform the transfer.

## Conclusion

Git records the project's evolution through commits and allows working with the history locally. When pushing these changes to GitHub, we can use GitHub Actions to automate code validation.

Within this automation, the workflow organizes the process, jobs divide the major stages, and steps execute the smaller tasks. Understanding this structure helps decide what should happen in sequence and what can run in parallel.

In the examples, `needs` makes one job wait for another's success, while artifacts allow sharing files between separate environments. With this foundation, we can evolve a testing routine into a pipeline with build and deploy, defining the dependencies of each stage.

## References

- [Pro Git — Version Control](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control) — introduces the fundamentals of version control and the differences between centralized and distributed systems.
- [Pro Git — What is Git?](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F) — explains commits, working directory, staging area, and repository.
- [GitHub Docs — Workflows](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows) — presents the structure of workflows and the relationship between events, jobs, and steps.
- [GitHub Docs — Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) — documents `runs-on`, `run`, `uses`, `needs`, and execution conditions.
- [GitHub — setup-python](https://github.com/actions/setup-python) — official reference for the action used to configure Python on the runner.
- [GitHub Docs — Storing and sharing data with artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data) — explains how to store files and transfer them between jobs with `upload-artifact` and `download-artifact`.
- [LINUXtips — Training](https://linuxtips.io/treinamentos/) — courses I use as a basis for my studies in DevOps, pipelines, and GitHub Actions.
