---
title: "Do Git ao GitHub Actions: versionamento, workflows, jobs e steps"
description: "Entenda commits e versionamento distribuído com Git e aprenda a organizar workflows do GitHub Actions com jobs, steps, needs e artifacts."
date: 2026-10-12
category: CI/CD
tags: [git, github, github-actions, ci-cd, workflows, jobs, steps, artifacts]
---

Quando alteramos um projeto, precisamos acompanhar o que mudou. Quando essas mudanças chegam ao GitHub, também podemos executar tarefas automaticamente para verificar o código.

Minhas anotações de estudo conectam essas duas ideias: **registrar a evolução do projeto com Git** e **organizar uma automação com GitHub Actions**.

Neste artigo, vamos partir do versionamento e chegar a exemplos de testes, dependências entre jobs e compartilhamento de arquivos.

## Para que serve o versionamento?

O controle de versão registra alterações nos arquivos ao longo do tempo. Isso permite consultar versões anteriores, comparar mudanças e recuperar conteúdo quando necessário.

Imagine que uma alteração deixou a aplicação com erro. Com um histórico organizado, podemos investigar o que mudou e recuperar uma versão que funcionava. Esse é um dos objetivos apresentados no [livro Pro Git sobre controle de versão](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control).

### Centralizado e distribuído

Em um sistema centralizado, um servidor concentra o repositório e seu histórico. Algumas operações dependem do acesso a esse servidor.

No modelo distribuído do Git, um clone completo normalmente contém o histórico do repositório localmente. Assim, podemos consultar commits e registrar novas alterações mesmo sem conexão. Clones rasos, feitos com opções como `--depth`, têm um histórico limitado.

O GitHub hospeda repositórios e oferece recursos de colaboração e automação. O Git é a ferramenta de versionamento que também funciona na nossa máquina.

## O que é um commit?

Um **commit** registra um estado do projeto, com uma mensagem e metadados como autor e referência aos commits anteriores. Ele recebe um identificador que permite encontrá-lo no histórico.

Por exemplo, depois de alterar um arquivo:

```bash
git add app.py
git commit -m "corrige validação dos dados de entrada"
git log --oneline
```

O `git add` prepara o conteúdo para o próximo commit. O `git commit` registra esse conteúdo, e o `git log` mostra o histórico.

O commit fica no repositório local. Para enviar os commits da branch ao remoto:

```bash
git push origin main
```

Nesse exemplo, `origin` é o nome do remoto e `main` é a branch enviada.

### Onde o Git guarda essas informações?

Em um repositório local comum, a pasta oculta `.git` contém os objetos, referências, configurações e outros dados usados pelo Git. Os arquivos que editamos ficam no diretório de trabalho.

Podemos visualizar arquivos ocultos com:

```bash
ls -a
```

A [documentação do Pro Git sobre o funcionamento do Git](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F) explica essa relação entre diretório de trabalho, área de preparação e repositório.

## Do push à automação

Depois de enviar as alterações ao GitHub, podemos iniciar uma rotina de validação:

```text
Alterar o código → Criar um commit → Fazer push
                                         ↓
                              Executar testes automaticamente
```

O **GitHub Actions** permite definir essa rotina em um workflow. Já apresentei essa base no artigo [Conhecendo o GitHub Actions](/posts/conhecendo-github-actions/).

## Workflow, job e step

Segundo a [documentação de workflows do GitHub](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows), o workflow é um processo automatizado definido em YAML dentro de `.github/workflows/`.

A estrutura das anotações pode ser representada assim:

```text
Workflow
└── Jobs
    └── Steps
```

| Conceito | Papel na automação |
| --- | --- |
| Workflow | Define os eventos e organiza os jobs |
| Job | Agrupa tarefas executadas em um runner |
| Step | Executa um comando ou utiliza uma action |

O **runner** é a máquina que executa o job. Neste artigo, usamos runners Ubuntu hospedados pelo GitHub.

## Um workflow para testar um projeto Python

Considere um projeto com código Python, testes reconhecidos pelo `pytest` e um `requirements.txt` que inclui as dependências da aplicação e o próprio `pytest`.

Crie o arquivo `.github/workflows/ci.yml`:

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

`testar` identifica o job, e `runs-on` seleciona o runner. O evento `push` inicia o workflow.

O checkout disponibiliza o código no runner. Depois, a [action setup-python](https://github.com/actions/setup-python) configura a versão indicada do Python. Os comandos `python -m pip` e `python -m pytest` usam esse interpretador para instalar dependências e executar os testes.

Sem código, dependências e testes disponíveis, apenas escrever `run: pytest` não é suficiente para validar um projeto.

## A diferença entre run e uses

Use `run` para executar comandos:

```yaml
- name: Verificar versão do Python
  run: python --version
```

Use `uses` para chamar uma action reutilizável:

```yaml
- name: Baixar o código
  uses: actions/checkout@v6
```

Nas anotações, o checkout aparece como `@v4`; nos exemplos deste artigo, usamos `@v6`.

## Ordem dos steps e dependências entre jobs

Em um job simples como este, os steps executam na ordem declarada:

```yaml
steps:
  - run: echo "Primeiro"
  - run: echo "Segundo"
  - run: echo "Terceiro"
```

Por padrão, uma falha impede os steps seguintes de executar. Condições como `if: always()` podem alterar esse comportamento.

Jobs sem dependências podem executar em paralelo. Para fazer um job aguardar o sucesso de outro, usamos `needs`:

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

O fluxo é `testar → sucesso → deploy`. Se `testar` falhar, `deploy` será ignorado por padrão. Aqui, os comandos apenas exibem mensagens: substitua-os pelas tarefas reais do projeto.

Essas regras e opções estão na [referência de sintaxe dos workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).

## Como compartilhar arquivos entre jobs?

Nos runners hospedados pelo GitHub, cada job usa um ambiente separado. Um arquivo criado em um job não aparece automaticamente em outro, mesmo quando existe `needs`.

Para transferir arquivos, podemos usar **artifacts**, conforme a [documentação de armazenamento e compartilhamento de dados do GitHub](https://docs.github.com/en/actions/tutorials/store-and-share-data).

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

O primeiro job cria e envia o arquivo. O segundo aguarda sua conclusão, baixa o artifact e lê seu conteúdo.

Esse mesmo mecanismo permite transferir relatórios de testes, pacotes e arquivos produzidos por um build. `needs` define a dependência; as actions de artifacts fazem a transferência.

## Conclusão

O Git registra a evolução do projeto por meio dos commits e permite trabalhar com o histórico localmente. Ao enviar essas alterações ao GitHub, podemos usar o GitHub Actions para automatizar a validação do código.

Dentro dessa automação, o workflow organiza o processo, os jobs dividem as grandes etapas e os steps executam as tarefas menores. Entender essa estrutura ajuda a decidir o que deve acontecer em sequência e o que pode executar em paralelo.

Nos exemplos, `needs` faz um job aguardar o sucesso de outro, enquanto os artifacts permitem compartilhar arquivos entre ambientes separados. Com essa base, podemos evoluir uma rotina de testes para uma pipeline com build e deploy, definindo as dependências de cada etapa.

## Referências

- [Pro Git — Controle de versão](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control) — apresenta os fundamentos do versionamento e as diferenças entre sistemas centralizados e distribuídos.
- [Pro Git — O que é Git?](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F) — explica commits, diretório de trabalho, área de preparação e repositório.
- [GitHub Docs — Workflows](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows) — apresenta a estrutura dos workflows e a relação entre eventos, jobs e steps.
- [GitHub Docs — Sintaxe de workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) — documenta `runs-on`, `run`, `uses`, `needs` e as condições de execução.
- [GitHub — setup-python](https://github.com/actions/setup-python) — referência oficial da action utilizada para configurar o Python no runner.
- [GitHub Docs — Armazenar e compartilhar dados com artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data) — explica como armazenar arquivos e transferi-los entre jobs com `upload-artifact` e `download-artifact`.
- [LINUXtips — Treinamentos](https://linuxtips.io/treinamentos/) — cursos que utilizo como base dos meus estudos em DevOps, pipelines e GitHub Actions.
