---
title: 'Docker Compose: Orchestrating Multiple Containers'
description: >-
  Learn to define services, networks, volumes, and resource limits in a single
  file with Docker Compose, instead of repeating `docker run` commands.
date: '2026-06-27'
updatedDate: '2026-07-30'
category: DOCKER
tags:
  - docker
  - docker-compose
  - yaml
  - devops
draft: false
language: en
translationOf: docker-compose-orquestrando-containers
sourceHash: 9a836fa2e8c23ca23f849c39d2753fad7c207d33168393ae64f335cd74e32993
series: Docker in Practice
part: 8
totalParts: 9
---
# Docker Compose: orchestrating multiple containers

In previous parts of this series, we manually created networks, volumes, and containers, one command at a time. It works, but it doesn't scale: a `docker run` command with network, ports, environment variables, and resource limits becomes a giant line that's hard to repeat without errors. **Docker Compose** solves this by describing everything in a single file.

## What is Docker Compose

Compose is used to bring up multiple containers together using a `compose.yaml` (or `docker-compose.yaml`) file:

```bash
docker compose up
```

If the file has a different name or is in another path, the `-f` (for *file*) flag tells it which one to use — "Docker Compose, use this file here":

```bash
docker compose -f meu-arquivo.yaml up
```

## A first service

```yaml
version: "3"
services:
  nginx:
    image: nginx
    ports:
      - "8080:80"
```

A service in Compose is essentially equivalent to a `docker run` command: `image` defines the image, `ports` publishes ports — the same `-p` we've used multiple times in this series, just declared in YAML.

## When the service needs a build

If the application doesn't have a ready-made image published in a registry, Compose needs a Dockerfile in the repository — someone needs to teach Docker how to build that image before running it:

```yaml
services:
  app:
    build: .
    ports:
      - "5000:5000"
```

`build: .` tells Compose to build the image from the Dockerfile in the current directory, instead of downloading a ready-made image.

## Connecting multiple services

Here, in a single file, we reproduce exactly what we did manually in the previous part with `docker network`:

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

- `environment` injects the variable the application uses to discover the Redis hostname — the same role as `-e REDIS_HOST=redis` which we used with `docker run`.
- `networks` connects the two services to the same network, so they can see each other by name, exactly like with the manual `docker network create`.
- The network itself is declared once, at the root level of the file, under `networks:`.

## Volumes in Compose

Named volumes are also declared at the root level and referenced within the service:

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

## Reserving and limiting CPU and memory

Just like `--cpus` and `--memory` in `docker run`, Compose allows declaring resource limits per service, with the added advantage of also being able to **reserve** a guaranteed minimum:

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

- **`reservations`** — the guaranteed minimum CPU and memory for the service.
- **`limits`** — the maximum ceiling it can consume.

## Conclusion

With a single file, it's now possible to describe the build, ports, environment variables, networks, volumes, and resource limits for an entire application — and bring everything up with `docker compose up`. One last question remains, applicable to both a manually run image and one orchestrated by Compose: is this image secure? This is the closing of this series, in the final part.

## References

- [Docker Docs — Docker Compose overview](https://docs.docker.com/compose/) — overview and getting started with Compose.
- [Docker Docs — Compose file reference](https://docs.docker.com/reference/compose-file/) — all file options, including `deploy.resources`.
- [LINUXtips — Descomplicando o Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — course used as the basis for my studies and these notes.
