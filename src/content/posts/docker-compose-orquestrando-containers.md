---
title: "Docker Compose: orquestrando múltiplos containers"
description: Aprenda a descrever serviços, redes, volumes e limites de recursos em um único arquivo com o Docker Compose, em vez de repetir comandos docker run.
date: 2026-06-27
updatedDate: 2026-07-30
category: DOCKER
tags: [docker, docker-compose, yaml, devops]
draft: false
language: pt
series: Docker na Prática
part: 8
totalParts: 9
---

# Docker Compose: orquestrando múltiplos containers

Nas partes anteriores desta série, criamos redes, volumes e containers manualmente, um comando de cada vez. Funciona, mas não escala: um `docker run` com rede, portas, variáveis de ambiente e limites de recursos vira uma linha gigante e difícil de repetir sem erro. O **Docker Compose** resolve isso descrevendo tudo em um único arquivo.

## O que é o Docker Compose

O Compose serve para subir vários containers juntos usando um arquivo `compose.yaml` (ou `docker-compose.yaml`):

```bash
docker compose up
```

Se o arquivo tiver outro nome ou estiver em outro caminho, a flag `-f` (de *file*) informa qual usar — "Docker Compose, use este arquivo aqui":

```bash
docker compose -f meu-arquivo.yaml up
```

## Um primeiro serviço

```yaml
version: "3"
services:
  nginx:
    image: nginx
    ports:
      - "8080:80"
```

Um serviço no Compose equivale, basicamente, a um `docker run`: `image` define a imagem, `ports` publica portas — o mesmo `-p` que já usamos várias vezes nesta série, só que declarado em YAML.

## Quando o serviço precisa de build

Se a aplicação não tem uma imagem pronta publicada em um registry, o Compose precisa de um Dockerfile no repositório — alguém precisa ensinar o Docker a montar essa imagem antes de rodar:

```yaml
services:
  app:
    build: .
    ports:
      - "5000:5000"
```

`build: .` diz ao Compose para buildar a imagem a partir do Dockerfile no diretório atual, em vez de baixar uma imagem pronta.

## Conectando múltiplos serviços

Aqui reproduzimos, em um único arquivo, exatamente o que fizemos manualmente na parte anterior com `docker network`:

```yaml
version: "3"
services:
  giropops-senhas:
    image: cesarsantos96/giropops-senhas:1.0
    ports:
      - "5000:5000"
    environment:
      - REDIS_HOST=redis
    networks:
      - giropops

  redis:
    image: redis
    ports:
      - "6379:6379"
    networks:
      - giropops

networks:
  giropops:
    driver: bridge
```

- `environment` injeta a variável que a aplicação usa para descobrir o hostname do Redis — o mesmo papel do `-e REDIS_HOST=redis` que usamos com `docker run`.
- `networks` conecta os dois serviços na mesma rede, para que eles se enxerguem pelo nome, exatamente como no `docker network create` manual.
- A rede em si é declarada uma única vez, no nível raiz do arquivo, em `networks:`.

## Volumes no Compose

Volumes nomeados também são declarados no nível raiz e referenciados dentro do serviço:

```yaml
services:
  giropops-senhas:
    image: cesarsantos96/giropops-senhas:1.0
    environment:
      - REDIS_HOST=redis
    volumes:
      - strigus:/strigus
    networks:
      - giropops

networks:
  giropops:
    driver: bridge

volumes:
  strigus:
```

## Reservando e limitando CPU e memória

Assim como `--cpus` e `--memory` no `docker run`, o Compose permite declarar limites de recursos por serviço, com a vantagem de também poder **reservar** um mínimo garantido:

```yaml
services:
  app:
    build: .
    volumes:
      - strigus:/strigus
    deploy:
      resources:
        reservations:
          cpus: '0.25'
          memory: 128M
        limits:
          cpus: '0.5'
          memory: 256M
```

- **`reservations`** — o mínimo de CPU e memória garantido para o serviço.
- **`limits`** — o teto máximo que ele pode consumir.

## Conclusão

Com um único arquivo, agora é possível descrever build, portas, variáveis de ambiente, redes, volumes e limites de recursos de uma aplicação inteira — e subir tudo com `docker compose up`. Falta uma última pergunta, que vale tanto para uma imagem rodada manualmente quanto para uma orquestrada pelo Compose: essa imagem é segura? É o fechamento desta série, na última parte.

## Referências

- [Docker Docs — Docker Compose overview](https://docs.docker.com/compose/) — visão geral e primeiros passos com o Compose.
- [Docker Docs — Compose file reference](https://docs.docker.com/reference/compose-file/) — todas as opções do arquivo, incluindo `deploy.resources`.
- [LINUXtips — Descomplicando o Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — curso utilizado como base dos meus estudos e destas anotações.
