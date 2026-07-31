---
title: 'Volumes, bind mounts, and tmpfs in Docker'
description: >-
  Understand why containers need volumes to persist data and learn the
  differences between bind mounts, named volumes, and tmpfs.
date: '2026-06-22'
updatedDate: '2026-07-30'
category: DOCKER
tags:
  - docker
  - volumes
  - bind-mount
  - tmpfs
  - devops
draft: false
language: en
translationOf: volumes-bind-mounts-e-tmpfs-no-docker
sourceHash: f375d0887969e1dbb295f1e6b79148e48be15738faea223ea9b135c53ad9f5ea
series: Docker in Practice
part: 6
totalParts: 9
---
# Volumes, bind mounts, and tmpfs in Docker

Containers are ephemeral by nature: when you remove one, everything written to its runtime layer (RW) disappears with it — even the `echo` we did back in part 2 of this series. Whenever data needs to survive a container's lifecycle, it needs to reside outside this layer. This is where **volumes** come in.

## What are volumes

Volumes are directories **external** to the container, mounted directly into it. Because they are external, they **bypass** the container's layering system — meaning they don't follow the image pattern of stacking layer upon layer that we saw in part 3.

Docker supports three main types of mounts: **bind mount**, **named volume**, and **tmpfs**.

## Bind mount: slotting a host folder into the container

```bash
docker run -ti --name testando-volumes \
  --mount type=bind,source=/home/usuario/projeto,target=/giropops-senhas \
  debian
```

This command creates a Debian container and "slots in" a real folder from the host machine into it. The idea behind bind mount is simple: *"Docker, take this real folder from my Linux and make it appear inside the container, as if it were another path."*

| Parameter | Meaning |
|-----------|---------|
| `source` | the real machine's folder (the host) |
| `target` | the path where this folder will appear inside the container |

To prevent the container from writing back to the host folder, just add the read-only option:

```bash
--mount type=bind,source=/home/usuario/projeto,target=/giropops-senhas,readonly
```

## Named volumes: managed by Docker itself

Unlike bind mounts, which point to a specific path you choose on the host, a named volume is created and managed by Docker itself — without you needing to know (or care) where it's physically stored.

```bash
docker volume ls
docker volume create meudb
docker volume inspect meudb
```

And to use this volume in a container:

```bash
docker run -d --name meu-container --mount type=volume,source=meudb,target=/dados debian
```

## Declaring a volume in the Dockerfile

```dockerfile
SHELL ["/bin/bash", "-c"]
VOLUME /app/dados
```

- `SHELL` defines which shell Docker will use to interpret subsequent `RUN` commands.
- `VOLUME /app/dados` informs Docker that this path should be treated as persistent data — when the container writes something there, the idea is for this data to reside outside the normal container layer, surviving even if the container is removed.

## tmpfs: a temporary in-memory filesystem

`tmpfs` is a type of mount where Docker creates a temporary area **in RAM** within the container — useful for sensitive or temporary data that you don't want to touch the disk, and that disappears as soon as the container stops.

```bash
docker run -d --name web-2 \
  --mount type=tmpfs,target=/nginx-cache \
  -p 8081:80 nginx
```

## Summary of the three types

| Type          | Where data resides      | Survives container? | Typical use                        |
|---------------|-------------------------|---------------------|------------------------------------|
| Bind mount    | folder chosen on host   | yes                 | development, sharing source code   |
| Named volume  | managed by Docker       | yes                 | application data, databases        |
| tmpfs         | RAM                     | no                  | cache, temporary secrets           |

## Conclusion

Volumes solve the problem of persistence on a container-by-container basis. But when the application grows and needs to communicate with other containers — a database, a cache — another problem arises: how do these containers see each other? That's the topic of the next part of the series, about Docker networking.

## References

- [Docker Docs — Volumes](https://docs.docker.com/engine/storage/volumes/) — named volumes, creation, and management.
- [Docker Docs — Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/) — how to mount host directories inside the container.
- [Docker Docs — tmpfs mounts](https://docs.docker.com/engine/storage/tmpfs/) — temporary in-memory mounts.
- [LINUXtips — Descomplicando o Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — course used as the basis for my studies and these notes.
