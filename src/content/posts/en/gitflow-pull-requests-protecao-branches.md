---
title: 'Understanding GitFlow, Pull Requests, and Branch Protection'
description: >-
  Learn how to organize development with GitFlow, create Pull Requests, protect
  important branches, and define reviewers with CODEOWNERS.
date: '2026-06-22'
category: CI/CD
tags:
  - git
  - github
  - gitflow
  - pull-request
  - branch-protection
  - codeowners
draft: false
language: en
translationOf: gitflow-pull-requests-protecao-branches
sourceHash: 1371e20eac3062d1ff4a314206d8c97c4db30319ba606a56a9f78bfabc7a3257
---
When working alone on a small project, it's common to make all changes directly to the main branch.

The flow typically looks like this:

```bash
git add .
git commit -m "adiciona nova funcionalidade"
git push origin main
```

This process can work for personal projects, but it starts to present problems when multiple people work on the same repository.

Imagine a team where:

- one person works on the front-end;
- another develops the back-end;
- another handles infrastructure;
- another configures GitHub Actions workflows.

If everyone pushes changes directly to `main`, the chances of conflicts, failures, and unreviewed code reaching production increase.

To organize this process, we can use:

- GitFlow;
- feature branches;
- Pull Requests;
- branch protection;
- CODEOWNERS.

# What is GitFlow?

GitFlow is a branch organization model in Git.

It defines a standardized way to separate code that is in production, code that is under development, and features that are still being built.

In the traditional model, the main branches are:

```text
main
develop
feature
release
hotfix
```

Each one has a different responsibility.

# `main` Branch

The `main` branch represents the stable code of the project.

Normally, it contains the version that is ready for production or that has already been published.

```
main
└── stable version of the project
```

For this reason, it is not recommended to develop features directly on it.

`main` should only receive changes that have already been:

- developed;
- reviewed;
- tested;
- approved.

# `develop` Branch

The `develop` branch gathers the features being prepared for the next version.

```
develop
└── next version of the project
```

Different feature branches are integrated into `develop`.

When the next version is stable, it can proceed to a release branch or be integrated into `main`, depending on the flow adopted by the project.

# `feature` Branches

Feature branches are used to develop new functionalities.

For example:

```text
feature/login
```

```text
feature/login-google
```

```text
feature/cadastro-usuario
```

Each feature is developed in isolation.

This allows one person to work on the login screen while another develops the registration, without one change directly interfering with the other.

A common flow would be:

```text
develop
   └── feature/login
```

Once the feature is ready, it returns to `develop` via a Pull Request.

# Creating a feature branch

First, we access the development branch:

```bash
git checkout develop
```

We update the local code:

```bash
git pull origin develop
```

Then, we create the new branch:

```bash
git checkout -b feature/login
```

We can also use the more recent command:

```bash
git switch -c feature/login
```

After developing the feature, we add the files:

```bash
git add .
```

We create the commit:

```bash
git commit -m "feat: adiciona tela de login"
```

And we push the branch to the remote repository:

```bash
git push -u origin feature/login
```

Now the branch will be available on GitHub.

# `release` Branches

`release` branches are used to prepare a new version of the project.

Example:

```text
release/1.2.0
```

At this stage, large features are typically not added.

The branch is used to:

- perform final tests;
- fix minor issues;
- update the project version;
- prepare documentation;
- validate publication.

When the version is ready, it can be integrated into `main`.

# `hotfix` Branches

`hotfix` branches are used to fix urgent problems that are already in production.

Example:

```text
hotfix/corrigir-login
```

Since the problem is occurring in the current version of the system, the branch is usually created from `main`.

```bash
git checkout main
git pull origin main
git checkout -b hotfix/corrigir-login
```

After the fix:

```bash
git add .
git commit -m "fix: corrige erro no login"
git push -u origin hotfix/corrigir-login
```

The fix can then be integrated back into `main` and also into `develop`, preventing the problem from reappearing in the next version.

# GitFlow Overview

The flow can be represented as follows:

```mermaid
flowchart TD
    A[main] --> B[develop]
    B --> C[feature/login]
    B --> D[feature/cadastro]
    C --> B
    D --> B
    B --> E[release/1.0.0]
    E --> A
    A --> F[hotfix/corrigir-login]
    F --> A
    F --> B
```

The main idea is to separate each type of change.

```text
main
└── stable code

develop
└── next version

feature/*
└── new features

release/*
└── version preparation

hotfix/*
└── urgent fixes
```

# What is a Pull Request?

A `Pull Request`, also known as a `PR`, is a proposal to integrate changes from one branch into another.

For example:

```text
feature/login → develop
```

In this case, we are proposing that the code developed in the `feature/login` branch be integrated into the `develop` branch.

In projects that do not use the `develop` branch, the flow might be:

```text
feature/login → main
```

A Pull Request creates a review step before the merge.

Other people can:

- analyze the changes;
- leave comments;
- request corrections;
- check the tests;
- approve the code;
- block the merge if there is a problem.

# Creating a Pull Request

After pushing the branch:

```bash
git push -u origin feature/login
```

We can open a Pull Request on GitHub.

In this Pull Request, we choose:

```text
base: develop
compare: feature/login
```

This means:

```text
target branch: develop
source branch: feature/login
```

The title could be:

```text
feat: adds login screen
```

And the description could explain:

```markdown
## O que foi desenvolvido?

Foi criada a tela de login da aplicação.

## Alterações

- criação do formulário;
- validação dos campos;
- integração com a API;
- tratamento de mensagens de erro.

## Como testar?

1. Execute a aplicação.
2. Acesse `/login`.
3. Informe um usuário válido.
4. Verifique o redirecionamento.
```

A good description greatly facilitates the work of whoever will review the code.

# Pull Request Flow

```mermaid
flowchart TD
    A[Desenvolver funcionalidade] --> B[Criar commits]
    B --> C[Enviar branch para o GitHub]
    C --> D[Abrir Pull Request]
    D --> E[Revisar o código]
    E --> F{Alterações necessárias?}
    F -- Sim --> G[Corrigir o código]
    G --> B
    F -- Não --> H[Aprovar Pull Request]
    H --> I[Realizar merge]
```

A Pull Request is not just a button to merge branches.

It also serves as a:

- decision history;
- discussion space;
- review process;
- record of changes;
- integration point with automated tests.

# What is branch protection?

Branch protection is a set of rules used to prevent dangerous changes on important branches.

Typically, we protect branches like:

```text
main
develop
```

Without a protection rule, someone could run:

```bash
git push origin main
```

This would allow pushing code directly to the main branch, without review or tests.

In a team, this type of change can break the application for everyone.

# Branch protection rules

Protection rules can require that:

- changes are submitted via Pull Request;
- the Pull Request has one or more approvals;
- project tests pass;
- the branch is up to date before merging;
- all comments are resolved;
- the code has no conflicts;
- designated owners review the code;
- commits are signed;
- the branch cannot be deleted;
- direct pushes are blocked.

A protected flow can work like this:

```text
feature/login
      ↓
Pull Request
      ↓
Code Review
      ↓
Automated Tests
      ↓
Approval
      ↓
Merge into main
```

# Why protect `main`?

The main branch represents the most important version of the repository.

If anyone can change it directly, problems can occur such as:

- broken code;
- incomplete features;
- exposed credentials;
- ignored tests;
- important files deleted;
- difficult-to-resolve conflicts;
- production failures.

Branch protection transforms `main` into a controlled area.

No one enters through the window. Everyone goes through the Pull Request.

# Example rule for `main`

A common configuration might require:

```text
Require Pull Request before merging
Require at least one approval
Require tests to pass
Require comments to be resolved
Block direct push
Prevent branch deletion
```

With this, even if someone tries to execute:

```bash
git push origin main
```

GitHub will be able to block the operation.

# What is CODEOWNERS?

The `CODEOWNERS` file allows you to define owners for different parts of the project.

It tells GitHub who should review a change depending on the modified files.

We can understand its function like this:

> When someone changes this part of the project, request a review from these people.

The file can be created at:

```text
.github/CODEOWNERS
```

# CODEOWNERS Example

Imagine a project with this structure:

```text
frontend/
backend/
infra/
docs/
.github/
```

The file could be:

```
*                     @cesarsantos96
/frontend/            @dev-frontend
/backend/             @dev-backend
/infra/               @dev-infra
/docs/                 @cesarsantos96
/.github/              @cesarsantos96
```

In this example:

- changes in the front-end request the front-end owner;
- changes in the back-end request the back-end owner;
- infrastructure changes request the infrastructure owner;
- changes in workflows request a specific review;
- the `*` defines a default owner.

# Using teams in CODEOWNERS

In a GitHub organization, we can also use teams:

```text
/frontend/     @empresa/time-frontend
/backend/      @empresa/time-backend
/infra/        @empresa/time-devops
/.github/      @empresa/time-devops
```

Thus, when someone changes a file within `backend`, GitHub can automatically request a review from the responsible team.

# CODEOWNERS and branch protection

CODEOWNERS becomes even more useful when used in conjunction with protection rules.

The rule can require approval from the owners defined in the file.

The flow then works like this:

```mermaid
flowchart TD
    A[Alteração no backend] --> B[Pull Request criado]
    B --> C[GitHub lê o CODEOWNERS]
    C --> D[Responsável pelo backend é solicitado]
    D --> E[Revisão do código]
    E --> F{Aprovado?}
    F -- Não --> G[Solicitar correções]
    F -- Sim --> H[Merge liberado]
```

# Complete Flow

Using GitFlow, Pull Requests, branch protection, and CODEOWNERS, the process can look like this:

```mermaid
flowchart TD
    A[Atualizar develop] --> B[Criar feature/login]
    B --> C[Desenvolver funcionalidade]
    C --> D[Criar commits]
    D --> E[Enviar branch para o GitHub]
    E --> F[Abrir Pull Request]
    F --> G[CODEOWNERS solicita revisores]
    F --> H[Testes automatizados]
    G --> I{Revisão aprovada?}
    H --> J{Testes passaram?}
    I -- Não --> K[Realizar correções]
    J -- Não --> K
    K --> D
    I -- Sim --> L[Validação final]
    J -- Sim --> L
    L --> M[Merge na branch protegida]
```

Each tool has a responsibility:

```text
GitFlow
└── organizes branches

Pull Request
└── organizes review and integration

Branch Protection
└── defines mandatory rules

CODEOWNERS
└── defines who should review
```

# Conclusion

GitFlow helps organize development through branches with different responsibilities.

Feature branches isolate new functionalities. Release branches prepare new versions, while hotfix branches correct urgent problems in production.

Pull Requests create a review step before code integration.

Protection rules prevent direct changes to important branches, and the `CODEOWNERS` file helps direct each change to the correct owners.

When these tools are used together, development becomes more organized, secure, and predictable.

The code stops following this path:

```text
change → main
```

And starts following a controlled process:

```text
branch → commit → Pull Request → review → tests → approval → merge
```
