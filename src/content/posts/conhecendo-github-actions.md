---
title: Conhecendo o GitHub Actions
description: Entenda o que é o GitHub Actions, como ele funciona e como usar workflows para automatizar tarefas como testes, builds e deploys direto no GitHub.
date: 2026-05-30
category: GITHUB ACTIONS
tags: [github-actions, ci-cd, workflows, automacao, devops, github]
--- 

# Conhecendo o  **GitHub Actions**  
Na prática, o **GitHub Actions** serve para criar pipelines de **CI/CD** dentro do próprio GitHub.  

Ou seja, em vez de fazer tudo manualmente toda vez que alteramos o código, podemos configurar o GitHub para executar alguns comandos automaticos quando alguma coisa acontecer no repositório.  

Por exemplo: quando eu faço um `push` para o  Github, posso criar uma automação para baixar o código, instalar dependências, rodar testes,fazer o build da aplicação, gerar uma imagem Docker e até publicar essa aplicação em algum ambiente.

Esse ambiente pode ser uma AWS, Vercel, servidor próprio ou qualquer outro lugar onde faça sentido para o projeto.

A ideia principal é simples:  

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

## O que é uma pipeline ?  
A pipeline nada mais é que uma sequência automaticvas de etapas para pegar algo "cru" e levar até um resultado final.  
Por exemplo, em um projeto real, uma pipeline poderia ter este fluxo:  

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
A grande vantagem é que esse processo passa a ser executado sempre da mesma forma. Em vez de depender de alguém lembrar todos os comandos maunalmete, o próprio Github executa tudo com base no que foi configurado.  
Isso ajuda a evitar erros, economiza tempo e deixa o processo de entrega muito mais confiável.  

## O que é um workflow?  
Dentro do GitHub Actions, que define essa automação é o **workflow**.  
O workflow é um arquivo escrito em **YAML**, onde configuramos quando a automação deve rodar, em qual máquina ela será executada e quais os comandos serão executados.  

Esse arquivo fica dentro da pasta:  
``` 
.github/workflows/ 
```  
``` 
.github/workflows/meu-primeiro-workflow.yaml
```  
Na prática, é nesse arquivo que dizemos para o GitHub:  
 > Quando acontecer um push na branch main, roda esses comandos em uma máquina Ubuntu  

A ***pipeline*** é a ideia do processo automatizado, e o workflow é o arquivo onde descrevemos essa automação dentro do GitHub Actions.  

## Estrutura Básica de um **Workflow**  
Um workflow do GitHub Actions geralmente segue uma estrutura parecida como esta:  
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
Esse exemplo ainda é bem simples, mas já mostra a base de um workflow.  
``` 
name     → nome do workflow
on       → quando o workflow será executado
jobs     → o que será executado
runs-on  → onde será executado
steps    → quais passos serão executados  
``` 
O GitHub Actions funciona basicamente assim:  
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

Ou seja, o workflow é o arquivo que organiza toda a automação.  
## Resumindo  
O GitHub Actions permite criar automações dentro do próprio GitHub.

Com ele, podemos montar pipelines para testar, validar, fazer build e até publicar uma aplicação automaticamente.

Neste primeiro contato, vimos que uma pipeline é uma sequência de etapas automatizadas, e que no GitHub Actions essa pipeline é definida através de um arquivo chamado workflow.  

O importante é guardar esta ideia:  
> GitHub Actions automatiza tarefas.  
> Pipeline é o processo automatizado.  
> Workflow é o arquivo que descreve esse processo no GitHub.