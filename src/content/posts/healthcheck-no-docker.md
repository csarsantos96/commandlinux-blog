---
title: "HEALTHCHECK: ensinando o Docker a desconfiar do próprio container"
description: Entenda por que um container pode estar em execução e mesmo assim não estar saudável, e como a instrução HEALTHCHECK resolve esse ponto cego.
date: 2026-06-19
updatedDate: 2026-07-30
category: DOCKER
tags: [docker, dockerfile, healthcheck, devops]
draft: false
language: pt
series: Docker na Prática
part: 5
totalParts: 9
---

# HEALTHCHECK: ensinando o Docker a desconfiar do próprio container

Um container pode aparecer como `Up` em `docker container ls` e, mesmo assim, estar com a aplicação travada lá dentro — processo vivo, mas não respondendo a nada. Por padrão, o Docker só sabe dizer se o processo principal ainda está de pé, não se ele está de fato funcionando. É esse ponto cego que a instrução `HEALTHCHECK` resolve.

## O que é o HEALTHCHECK

`HEALTHCHECK` é uma instrução que pode ser definida no Dockerfile (ou em um serviço do `docker-compose.yml`) para dizer ao Docker Engine como verificar se o processo dentro do container está de fato saudável — e não apenas rodando.

Resumindo em uma frase: *"Ei Docker, a partir de agora, não confie apenas no fato de eu estar ligado. Teste-me."*

## Um exemplo prático

```dockerfile
HEALTHCHECK --timeout=2s CMD curl --fail localhost || exit 1
```

Vamos separar cada parte:

- **`--timeout=2s`** — é o limite da paciência. O Docker faz a pergunta e espera no máximo 2 segundos pela resposta. Se a aplicação demorar mais que isso, o teste já é considerado uma falha.
- **`CMD curl --fail localhost`** — é a pergunta real: uma tentativa de acessar a própria aplicação rodando dentro do container. A flag `--fail` é importante aqui: sem ela, o `curl` considera "sucesso" qualquer resposta que conseguir baixar — inclusive um erro HTTP 404. Com `--fail`, respostas de erro também fazem o `curl` retornar um código de falha, tornando o teste mais confiável.
- **`|| exit 1`** — é o plano de contingência. Se o `curl` falhar, o `exit 1` é executado, enviando um sinal de erro para o Docker.

## Onde o resultado aparece

O status do healthcheck fica visível direto na listagem de containers:

```bash
docker container ls
```

Um container saudável aparece como `Up ... (healthy)`; um que está falhando, como `Up ... (unhealthy)`. Logo depois de iniciar, ele pode aparecer como `(health: starting)`, enquanto o Docker ainda não teve tempo de rodar a primeira verificação.

Para investigar o histórico das últimas checagens:

```bash
docker container inspect meu-nginx
```

As informações ficam na seção `State.Health` da saída, incluindo o status atual e o log das últimas tentativas.

## Buildando e rodando

```bash
docker image build -t meu-nginx:2.0 .
docker container run -d -p 8080:80 --name meu-nginx meu-nginx:2.0
```

## Conclusão

O `HEALTHCHECK` transforma "o container está rodando" em "o container está funcionando" — uma distinção que faz toda a diferença quando outra ferramenta (um orquestrador, um load balancer, o próprio `docker-compose`) precisa decidir se deve continuar mandando tráfego para aquele container ou substituí-lo.

Na próxima parte da série, tratamos de outro problema que aparece assim que um container é reiniciado: como fazer os dados sobreviverem a ele, com volumes.

## Referências

- [Docker Docs — Dockerfile reference: HEALTHCHECK](https://docs.docker.com/reference/dockerfile/#healthcheck) — sintaxe completa da instrução, incluindo `--interval`, `--retries` e `--start-period`.
- [Docker Docs — docker container inspect](https://docs.docker.com/reference/cli/docker/container/inspect/) — como consultar o histórico de health checks de um container.
- [LINUXtips — Descomplicando o Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — curso utilizado como base dos meus estudos e destas anotações.
