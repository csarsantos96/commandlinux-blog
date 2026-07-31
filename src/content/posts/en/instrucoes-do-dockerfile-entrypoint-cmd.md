---
title: All Dockerfile Instructions and the Difference Between ENTRYPOINT and CMD
description: >-
  A reference guide for the main Dockerfile instructions and a practical
  explanation of how ENTRYPOINT and CMD work together.
date: '2026-06-17'
updatedDate: '2026-07-30'
category: DOCKER
tags:
  - docker
  - dockerfile
  - entrypoint
  - devops
draft: false
language: en
translationOf: instrucoes-do-dockerfile-entrypoint-cmd
sourceHash: 974ed3564880aa53c9e9c64ca981a0e6ecfd6bf3aa46cd7f6aeceaedc65ed085
series: Docker in Practice
part: 4
totalParts: 9
---
# All Dockerfile Instructions and the Difference Between ENTRYPOINT and CMD

In the [previous part](/posts/dockerfile-primeira-imagem-docker-build), we built a simple image using `FROM`, `RUN`, `EXPOSE`, and `CMD`. The Dockerfile has several other instructions — each solving a specific problem related to how the image is assembled and how the container behaves upon startup.

## Instruction Reference Guide

| Instruction | What it does |
|-----------|-----------|
| `FROM` | indicates which image will be used as the base. Must be the first line of the Dockerfile |
| `RUN` | executes a command in a new layer on top of the image and "commits" the change, available for subsequent instructions |
| `COPY` | copies new files and directories from the build context and adds them to the container's filesystem |
| `ADD` | copies files, directories, TAR archives, or remote files (URLs) to the container's filesystem — more powerful than `COPY`, but also less predictable |
| `CMD` | defines the default command executed when the container starts. Unlike `RUN`, which runs during the build, `CMD` only runs at runtime |
| `ENTRYPOINT` | configures the container to run as a fixed executable. When this executable terminates, the container also terminates |
| `ENV` | defines environment variables available inside the container |
| `EXPOSE` | informs which port the container will be listening on (documentation — doesn't publish the port by itself) |
| `LABEL` | adds metadata to the image, such as version, description, and author |
| `MAINTAINER` | defines the author of the image (old instruction, now replaced by `LABEL`) |
| `USER` | determines which user will be used when running the image. By default it's `root` |
| `VOLUME` | creates a mount point in the container, marking that path as persistent data |
| `WORKDIR` | changes from the root directory (`/`) to the specified directory |

## ENTRYPOINT vs CMD

This is the point that causes the most confusion, so it's worth breaking it down carefully.

- `ENTRYPOINT` is the main command — the "heart" of the container, what it will always execute upon startup. Think of it as immutable.
- `CMD`, used alone, defines a default command that can be completely overridden at `docker run` time.

The important detail appears when both are **together** in the same Dockerfile: in this case, `CMD` ceases to be a command and instead only provides the **parameters** for the `ENTRYPOINT`.

```dockerfile
ENTRYPOINT ["/usr/sbin/apachectl"]
CMD ["-D", "FOREGROUND"]
```

- `ENTRYPOINT` is the fixed command that always runs: `/usr/sbin/apachectl`.
- `CMD` is the default argument passed to it: `-D FOREGROUND`.

This is useful because `CMD` can still be overridden when running the container (`docker run my-image -D BACKGROUND`, for example), while `ENTRYPOINT` remains guaranteed — the container will always run Apache; only the parameters change.

A more everyday example, with Nginx:

```dockerfile
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
```

Here, `ENTRYPOINT` definitively turns the container into "an Nginx". The `daemon off;` in `CMD` ensures that Nginx runs in the foreground — without it, the process would move to the background, and the container, lacking any foreground process to keep track of, would terminate immediately.

## Passing build variables to the container with ARG and ENV

`ARG` defines a variable available **only during the build**. For it to also be accessible inside the container at runtime, it needs to be "promoted" to an `ENV`:

```dockerfile
ARG GIROPOPS
ENV GIROPOPS=$GIROPOPS
```

## Inspecting the result

After building the image, you can check everything that was configured — `Entrypoint`, `Cmd`, `Env`, `ExposedPorts` — with:

```bash
docker container inspect meu-nginx
```

## Conclusion

With these instructions, a Dockerfile is no longer just "installing a package and running a command" and truly begins to describe how an application should behave inside the container: which user to use, which variables to inject, which data to persist, and which process is, in fact, the owner of the container.

If the goal is to reduce the final image size — for example, when the application needs build tools that shouldn't go into production —, it's worth complementing this reading with the post on [multi-stage builds](/posts/multi-stage-builds-docker), which separates the build stage from the execution stage within the same Dockerfile.

In the next part of the series, we'll teach Docker to be wary of its own container with `HEALTHCHECK`.

## References

- [Docker Docs — Dockerfile reference](https://docs.docker.com/reference/dockerfile/) — official reference for all instructions, including `ENTRYPOINT` and `CMD`.
- [Docker Docs — docker container inspect](https://docs.docker.com/reference/cli/docker/container/inspect/) — detailed inspection of a container.
- [LINUXtips — Descomplicando o Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — course used as the basis for my studies and these notes.
