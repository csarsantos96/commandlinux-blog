---
title: "Entendendo Contextos no GitHub Actions: github, env, vars e secrets"
description: "Aprenda como funcionam os contextos do GitHub Actions, quando utilizar github, env, vars e secrets e entenda as diferenças entre eles com exemplos práticos."
date: 2026-07-14
category: "CI/CD"
tags: [GitHub Actions, CI/CD, DevOps,GitHub, Automation]
---

# Entendendo Contextos no GitHub Actions: github, env, vars e secrets

Se você começou a estudar GitHub Actions, provavelmente já encontrou expressões como estas:

```yaml
${{ github.repository }}

${{ env.APP_NAME }}

${{ vars.AWS_REGION }}

${{ secrets.GEMINI_API_KEY }}
```

À primeira vista elas parecem apenas formas diferentes de acessar variáveis.

Mas existe uma diferença importante: **cada uma pertence a um contexto diferente**, possui um propósito específico e é interpretada em momentos distintos da execução do workflow.

Entender essa diferença é fundamental para escrever workflows mais organizados, reutilizáveis e seguros.

Neste artigo vamos explorar os principais contextos do GitHub Actions utilizando exemplos práticos.



## O que você vai aprender

Ao final deste artigo você será capaz de:

- Entender o que é um Contexto no GitHub Actions;
- Saber quando utilizar `github`, `env`, `vars` e `secrets`;
- Entender a diferença entre Contextos e Variáveis de Ambiente;
- Evitar erros comuns envolvendo Secrets;
- Escrever workflows mais limpos e seguros.



## O que é um Contexto?

Um **Contexto** é um objeto disponibilizado pelo GitHub durante a execução do workflow.

Esses objetos armazenam informações sobre a execução e podem ser acessados através de expressões.

A sintaxe sempre segue este padrão:

```yaml
${{ contexto.propriedade }}
```

Exemplo:

```yaml
${{ github.repository }}
```

Neste exemplo:

- `github` é o contexto;
- `repository` é uma propriedade desse contexto.

Se o workflow estiver sendo executado neste repositório:

```
csarsantos96/commandlinux-blog
```

essa será a saída da expressão.

Na prática, funciona como acessar uma propriedade de um objeto em JavaScript.

```javascript
github.repository
```



## Como o GitHub processa uma expressão

Uma característica muito importante é que expressões como:

```yaml
${{ github.ref_name }}
```

não são interpretadas pelo Bash.

Quem resolve essa expressão é o próprio GitHub Actions **antes** de enviar o Job para o Runner.

Isso permite utilizar condições como:

```yaml
if: ${{ github.ref_name == 'main' }}
```

Nesse caso, o GitHub decide se o Job será executado antes mesmo do Runner iniciar.



## O contexto `github`

O contexto `github` contém praticamente todas as informações sobre a execução do Workflow.

Algumas propriedades bastante utilizadas são:

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

Exemplo:

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



## Contexto não é o mesmo que Variável de Ambiente

Esse detalhe costuma gerar bastante confusão.

Veja estes dois exemplos.

Primeiro:

```yaml
run: echo "${{ github.ref_name }}"
```

Aqui o GitHub substitui a expressão antes da execução.

Agora:

```yaml
run: echo "$GITHUB_REF_NAME"
```

Nesse caso quem interpreta a variável é o Bash dentro do Runner.

O resultado pode ser parecido, mas o momento em que cada valor é resolvido é completamente diferente.



## O contexto `env`

O contexto `env` representa variáveis definidas dentro do próprio workflow.

Exemplo:

```yaml
env:
  APP_NAME: commandlinux

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - run: echo "${{ env.APP_NAME }}"
```

Como essa variável também é exportada para o ambiente do Runner, podemos acessá-la diretamente:

```yaml
run: echo "$APP_NAME"
```

O contexto `env` pode ser definido em três níveis:

- Workflow
- Job
- Step

Cada nível pode sobrescrever o anterior.


## O contexto `vars`

As Variables são configuradas diretamente no GitHub.

Elas podem existir no nível:

- Organização
- Repositório
- Environment

São ideais para configurações que não são sensíveis.

Exemplos:

```yaml
${{ vars.AWS_REGION }}

${{ vars.APP_URL }}

${{ vars.DOCKER_IMAGE }}
```

Essas informações podem ser reutilizadas por vários workflows sem precisar repetir valores no código.



## O contexto `secrets`

O contexto `secrets` armazena informações confidenciais.

Por exemplo, durante a tradução automática dos artigos do CommandLinux utilizo uma chave da API do Gemini.

Ela é passada para o programa desta forma:

```yaml
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

steps:
  - run: node scripts/translate-post.mjs
```

O segredo nunca fica escrito diretamente no código.



## O que nunca fazer

Mesmo que o GitHub tente mascarar valores sensíveis nos logs, a recomendação é nunca imprimir Secrets.

Evite fazer isto:

```yaml
run: echo "${{ secrets.GEMINI_API_KEY }}"
```

A melhor prática é passar o Secret diretamente para a aplicação que irá utilizá-lo.



## Resumo

| Contexto | Utilização |
|----------|------------|
| `github` | Informações da execução do workflow |
| `env` | Variáveis definidas no workflow |
| `vars` | Configurações do GitHub que não são sensíveis |
| `secrets` | Informações confidenciais |



## Conclusão

Os Contextos são uma das funcionalidades mais importantes do GitHub Actions. Entender quando utilizar `github`, `env`, `vars` e `secrets` ajuda a criar workflows mais organizados, reutilizáveis e seguros.

Embora todos pareçam apenas "variáveis", cada um possui um propósito específico e é interpretado em momentos diferentes da execução. Dominar essa diferença evita erros comuns e torna seus pipelines muito mais previsíveis.


## Referências

- [GitHub Docs — Contextos](https://docs.github.com/pt/actions/learn-github-actions/contexts) — documenta os contextos disponíveis nos workflows.
- [GitHub Docs — Expressões](https://docs.github.com/pt/actions/learn-github-actions/expressions) — explica a sintaxe e as funções das expressões.
- [GitHub Docs — Variáveis](https://docs.github.com/pt/actions/learn-github-actions/variables) — documenta variáveis padrão e de configuração.
- [GitHub Docs — Uso de secrets](https://docs.github.com/pt/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions) — orienta o armazenamento e o uso seguro de credenciais.
- [GitHub Docs — Sintaxe de workflow](https://docs.github.com/pt/actions/using-workflows/workflow-syntax-for-github-actions) — referência completa da estrutura de workflows.
- [LINUXtips — Treinamentos](https://linuxtips.io/treinamentos/) — cursos que utilizo como base dos meus estudos em DevOps, pipelines e GitHub Actions.
