---
title: 'Dockerfile in Practice: From Your First Image to `docker build`'
description: >-
  Understand what a Dockerfile is, how its instructions become image layers, and
  build your first Docker image from scratch with `docker build`.
date: '2026-06-15'
updatedDate: '2026-07-30'
category: DOCKER
tags:
  - docker
  - dockerfile
  - imagens
  - devops
draft: false
language: en
translationOf: dockerfile-primeira-imagem-docker-build
sourceHash: 004200a5f02e8438d01cc91278d10353c75f33c222fb177540f5195d3cdb9f8b
series: Docker in Practice
part: 3
totalParts: 9
---
# Dockerfile in practice: from your first image to docker build

Until now, all containers in this series were created from ready-made Docker Hub images — `ubuntu`, `nginx`. It's time to learn how to build your own image, using a **Dockerfile**.

## What is a Dockerfile

A Dockerfile is a text file where we put instructions for Docker to **build** a container image. By convention, instructions are always written in uppercase (`FROM`, `RUN`, `CMD`...).

## How instructions become layers

Each Dockerfile instruction generates a new layer added to the previous ones. Think of it this way:

```text
Base image (ex: ubuntu)          → read-only layer
RUN apt-get install nginx        → read-only layer
COPY config-nginx                → read-only layer
────────────────────────────────
Running container                → read-write layer (on top of everything)
```

The layers generated during the build (from `FROM`, `RUN`, `COPY`...) are **read-only** and stored inside the image — they are shared among all containers created from it. Only when a container is created does Docker add a writeable (**RW**) layer on top, exclusive to that container: that's where files created or modified during execution end up, as we saw with `echo` in part 2 of this series.

## Writing your first Dockerfile

```dockerfile
FROM ubuntu:18.04
RUN apt-get update && apt-get install nginx -y
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- **`FROM ubuntu:18.04`** — defines the base image. It must be the first instruction in the Dockerfile.
- **`RUN apt-get update && apt-get install nginx -y`** — executes a command **during the build**, installing Nginx inside the image. Each `RUN` generates (and "commits") a new layer.
- **`EXPOSE 80`** — documents which port the container will listen on. This doesn't publish the port by itself: we still need the `-p` in `docker run`, as we saw in part 2.
- **`CMD ["nginx", "-g", "daemon off;"]`** — unlike `RUN`, `CMD` does not execute during the build. It defines the default command executed when the **container** starts.

## Building the image

```bash
docker image build -t meu-nginx:1.0 .
```

The `-t` gives the image a name and tag (`my-nginx:1.0`); the `.` at the end indicates that the Dockerfile and build context are in the current directory.

And to run a container from it:

```bash
docker container run -d --name meu-nginx -p 8080:80 meu-nginx:1.0
```

## A detail that prevents giant images

If each `RUN` generates a permanent layer, package cache installed in one `RUN` will continue to occupy space in the image even if you delete it in a subsequent `RUN` — the previous layer, with the cache still inside, remains there. That's why it's common to chain installation and cleanup in the **same** `RUN`:

```dockerfile
RUN apt-get update && apt-get install nginx -y && rm -rf /var/lib/apt/lists/*
```

- `rm -rf` removes files and directories: `-r` makes the removal recursive (deletes folders and everything inside them) and `-f` forces removal without asking for confirmation.
- `/var/lib/apt/lists/*` is the path where `apt` stores the list of available packages for installation.

Summarizing the command: "delete everything inside the folder where `apt` stores the package list" — after installing what was needed, this cache is no longer useful inside the final image.

## Conclusion

With `FROM`, `RUN`, `EXPOSE`, and `CMD`, it's already possible to package a simple application. But the Dockerfile has many more instructions — `ENTRYPOINT`, `ENV`, `COPY`, `VOLUME`, `USER`, and others — which we will explore in the next part of the series.

## References

- [Docker Docs — Dockerfile reference](https://docs.docker.com/reference/dockerfile/) — official reference for all Dockerfile instructions.
- [Docker Docs — docker build](https://docs.docker.com/reference/cli/docker/buildx/build/) — options for the build command.
- [Docker Docs — Dockerfile best practices](https://docs.docker.com/build/building/best-practices/) — official recommendations, including reducing the number of layers.
- [LINUXtips — Demystifying Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — course used as the basis for my studies and these notes.
