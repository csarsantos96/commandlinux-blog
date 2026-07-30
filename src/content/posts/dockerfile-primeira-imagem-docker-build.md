---
title: "Dockerfile na prática: da primeira imagem ao docker build"
description: Entenda o que é um Dockerfile, como suas instruções viram camadas de uma imagem e construa sua primeira imagem Docker do zero com docker build.
date: 2026-06-15
category: DOCKER
tags: [docker, dockerfile, imagens, devops]
draft: false
language: pt
series: Docker na Prática
part: 3
totalParts: 9
---

# Dockerfile na prática: da primeira imagem ao docker build

Até aqui, todos os containers desta série nasceram de imagens prontas do Docker Hub — `ubuntu`, `nginx`. Chegou a hora de aprender a construir a sua própria imagem, usando um **Dockerfile**.

## O que é um Dockerfile

Um Dockerfile é um arquivo de texto onde colocamos instruções para que o Docker possa **buildar** uma imagem de container. Por convenção, as instruções são sempre escritas em maiúsculo (`FROM`, `RUN`, `CMD`...).

## Como as instruções viram camadas

Cada instrução do Dockerfile gera uma nova camada somada às anteriores. Pense assim:

```text
Imagem base (ex: ubuntu)         → camada read-only
RUN apt-get install nginx        → camada read-only
COPY config-nginx                → camada read-only
────────────────────────────────
Container em execução            → camada read-write (por cima de tudo)
```

As camadas geradas no build (a partir de `FROM`, `RUN`, `COPY`...) são **somente leitura** e ficam guardadas dentro da imagem — elas são compartilhadas entre todos os containers criados a partir dela. Só quando um container é criado é que o Docker adiciona uma camada de escrita (**RW**) por cima, exclusiva daquele container: é ali que vão parar os arquivos criados ou alterados durante a execução, como vimos no `echo` da parte 2 desta série.

## Escrevendo o primeiro Dockerfile

```dockerfile
FROM ubuntu:18.04
RUN apt-get update && apt-get install nginx -y
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- **`FROM ubuntu:18.04`** — define a imagem base. Precisa ser a primeira instrução do Dockerfile.
- **`RUN apt-get update && apt-get install nginx -y`** — executa um comando **durante o build**, instalando o Nginx dentro da imagem. Cada `RUN` gera (e "commita") uma nova camada.
- **`EXPOSE 80`** — documenta qual porta o container vai escutar. Isso não publica a porta sozinho: continuamos precisando do `-p` no `docker run`, como vimos na parte 2.
- **`CMD ["nginx", "-g", "daemon off;"]`** — diferente do `RUN`, o `CMD` não executa durante o build. Ele define o comando padrão executado quando o **container** é iniciado.

## Buildando a imagem

```bash
docker image build -t meu-nginx:1.0 .
```

O `-t` dá um nome e uma tag para a imagem (`meu-nginx:1.0`); o `.` no final indica que o Dockerfile e o contexto de build estão no diretório atual.

E para rodar um container a partir dela:

```bash
docker container run -d --name meu-nginx -p 8080:80 meu-nginx:1.0
```

## Um detalhe que evita imagens gigantes

Se cada `RUN` gera uma camada permanente, cache de pacotes instalado num `RUN` continua ocupando espaço na imagem mesmo que você o apague em um `RUN` seguinte — a camada anterior, com o cache ainda dentro, permanece lá. Por isso é comum encadear instalação e limpeza no **mesmo** `RUN`:

```dockerfile
RUN apt-get update && apt-get install nginx -y && rm -rf /var/lib/apt/lists/*
```

- `rm -rf` remove arquivos e diretórios: o `-r` torna a remoção recursiva (apaga pastas e tudo dentro delas) e o `-f` força a remoção sem pedir confirmação.
- `/var/lib/apt/lists/*` é o caminho onde o `apt` guarda a lista de pacotes disponíveis para instalação.

Resumindo o comando: "apague tudo dentro da pasta onde o `apt` guarda a lista de pacotes" — depois de instalar o que era preciso, esse cache não serve mais para nada dentro da imagem final.

## Conclusão

Com `FROM`, `RUN`, `EXPOSE` e `CMD` já é possível empacotar uma aplicação simples. Mas o Dockerfile tem bem mais instruções — `ENTRYPOINT`, `ENV`, `COPY`, `VOLUME`, `USER` e outras — que vamos explorar na próxima parte da série.

## Referências

- [Docker Docs — Dockerfile reference](https://docs.docker.com/reference/dockerfile/) — referência oficial de todas as instruções do Dockerfile.
- [Docker Docs — docker build](https://docs.docker.com/reference/cli/docker/buildx/build/) — opções do comando de build.
- [Docker Docs — Boas práticas para Dockerfiles](https://docs.docker.com/build/building/best-practices/) — recomendações oficiais, incluindo redução do número de camadas.
- [LINUXtips — Descomplicando o Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — curso utilizado como base dos meus estudos e destas anotações.
