---
title: 'Detached Mode, Docker Exec, and Testing Containers from Within'
description: >-
  Learn how to run containers in the background with -d, access them with docker
  exec, publish ports with -p, and investigate what's happening inside.
date: '2026-06-12'
updatedDate: '2026-07-30'
category: DOCKER
tags:
  - docker
  - containers
  - cli
  - networking
  - devops
draft: false
language: en
translationOf: docker-exec-modo-detached-e-portas
sourceHash: a5433bfbb25ae5ae98fbec96dd8093690b544586482dd0a5de7004c4121cad75
series: Docker in Practice
part: 2
totalParts: 9
---
# Detached mode, docker exec, and testing containers from within

In the [first part of this series](/posts/gerenciando-containers-docker-no-dia-a-dia), the focus was on the lifecycle of a container created in interactive mode. But in practice, most containers run in the background — a web server doesn't need (nor should it) be tied to a terminal. This is where **detached** mode and the **`exec`** command come in.

## Running a container in the background

```bash
docker container run -d --name meu-nginx nginx
```

The `-d` flag (*detached mode*) changes the behavior of `run`:

- the container runs in the background;
- you are not tied to its terminal;
- the container continues to run on its own;
- the terminal returns to you immediately.

Even before Nginx starts serving requests, the image executes its **entrypoint** — a script responsible for configuring the environment (adjusting files, variables, permissions) before the main process starts up. We will understand `ENTRYPOINT` in detail in part 4 of this series.

## Entering an already running container

To interact with a background container, there is the `exec` command:

```bash
docker container exec -ti meu-nginx bash
```

This opens an interactive terminal *inside* the already running container. It's worth noting the difference compared to `attach` seen in the previous part:

| Command | What it does | When exiting with `Ctrl+D` |
|---------|--------------|----------------------------|
| `attach` | connects to the container's main process (PID 1) | terminates the entire container |
| `exec` | starts a **new process** inside the already running container | ends only this session — the container keeps running |

This behavior is what makes `exec` safe for investigating a container in production without risking accidentally bringing it down.

## Testing the container from within

A very common use of `exec` is to run a single command, without opening an interactive session:

```bash
docker container exec -ti meu-nginx curl localhost
```

Here we are asking the container itself to make an HTTP request to `localhost`. Since the command runs within the container's network namespace, `localhost` points to the container itself — it's a quick way to confirm if the application is responding *from within*, without relying on published ports.

## Publishing ports with -p

To access Nginx from the browser, you need to publish the container's port to a port on the host machine:

```bash
docker container run -d -p 8080:80 --name meu-nginx nginx
```

| Part | Meaning |
|------|---------|
| `8080` | port on my machine (host) |
| `80` | port on the container where Nginx is listening |

The format is always `-p host_port:container_port`. After that, just access `MACHINE_IP:8080` in the browser — for example, `192.168.1.10:8080` — to reach Nginx running inside the container.

## Editing a file inside the container

With `exec`, you can also modify files directly inside the running container:

```bash
docker container exec -ti meu-nginx bash
echo "opaaa" > /usr/share/nginx/html/index.html
```

When you refresh the page in the browser, the new content appears. It's a good experiment to visualize, in practice, that the container has its own filesystem, isolated from the host.

## Downloading an image in advance

The `docker run` command automatically downloads the image if it doesn't already exist locally, but sometimes it makes sense to download it beforehand, without creating a container:

```bash
docker pull nginx
```

## Conclusion

With detached mode, `exec`, and port publishing, it's now possible to run real applications in the background and investigate them without bringing them down. The next step is to stop relying on ready-made Docker Hub images and learn how to build your own — that's what's coming in part 3, with the Dockerfile.

## References

- [Docker Docs — docker container exec](https://docs.docker.com/reference/cli/docker/container/exec/) — how to execute commands in an already running container.
- [Docker Docs — Publish and expose ports](https://docs.docker.com/engine/network/#published-ports) — how port publishing with `-p` works.
- [LINUXtips — Descomplicando o Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — course used as the basis for my studies and these notes.
