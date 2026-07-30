---
title: Managing Containers Day-to-Day with Docker
description: >-
  Practical notes on the lifecycle of a Docker container, from docker run to
  docker stats, including logs, pause, and prune.
date: '2026-06-10'
updatedDate: '2026-07-30'
category: DOCKER
tags:
  - docker
  - containers
  - cli
  - devops
draft: false
language: en
translationOf: gerenciando-containers-docker-no-dia-a-dia
sourceHash: 548a02556e3fa8148fd4dc542af9734ee298b2892dbb20e24ee17e46b94051e3
---
# Managing Containers Day-to-Day with Docker

After understanding [what a container is](/posts/O-Que-e-containers) and [how Docker organizes images, containers, and configurations](/posts/explicando-docker-como-uma-franquia), the next natural step is to learn how to keep these containers alive: create, exit without terminating, pause, monitor, and, when no longer needed, remove.

These notes came precisely from that study moment, testing command by command on Ubuntu containers.

## Creating and Managing Your First Containers

When running an interactive container, three flags appear constantly:

| Flag | Function |
|------|----------|
| `-i` | interactivity — keeps `STDIN` open |
| `-t` | allocates a terminal (TTY) |
| `-it` | both combined — a truly interactive terminal |

In practice, the most common command to get started is:

```bash
docker container run -it ubuntu
```

## Exiting the Container Without Terminating It

Here lies a common pitfall: there are two very different ways to "exit" a container.

- **`Ctrl + P` followed by `Ctrl + Q`** — exits the container's terminal, but it **continues running** in the background.
- **`Ctrl + D`** — exits the container and **terminates (kills) it**.

To return to a container that is still running (exited with `Ctrl+P+Q`), simply reattach the terminal:

```bash
docker container attach <id_do_container>
```

## Naming Containers

Working with randomly generated IDs quickly becomes tiresome. You can name the container during creation:

```bash
docker container run --name tostao -it ubuntu
```

And use that name instead of the ID to reconnect:

```bash
docker container attach tostao
```

If the container was terminated with `Ctrl+D`, `attach` alone won't work — you first need to restart it and only then attach the terminal:

```bash
docker container start tostao
docker container attach tostao
```

## Pausing and Unpausing

Pausing freezes the container's processes without terminating them:

```bash
docker container pause tostao
docker container unpause tostao
```

## Stopping and Removing

When the container is no longer needed:

```bash
docker container stop tostao
docker container rm tostao
```

And to clean up all stopped containers at once, without having to remove them one by one:

```bash
docker container prune
```

## Viewing Metrics and Resource Usage

`stats` provides an overview of resource consumption for running containers:

```bash
docker container stats
```

Some useful variations:

```bash
docker container stats -a
```
Lists all containers (including stopped ones) and shows statistics for each.

```bash
docker container stats --no-stream
```
Prints the statistics once, without continuously updating on the screen.

`top` shows all **processes** running inside a specific container — not resource consumption statistics, but what is actually running inside:

```bash
docker container top tostao
```

Summarizing the difference: `stats` shows **how much** resource is being used; `top` shows **what** is being executed.

## Consulting Logs

`docker container logs` is the first place to investigate what a container is doing:

```bash
docker container logs tostao
```

Some frequently appearing flags:

| Flag | Function |
|------|----------|
| `--details` | show extra details provided to the logs |
| `-f`, `--follow` | follow log output in real time |
| `-n`, `--tail` | number of lines to display from the end (default: all) |
| `-t`, `--timestamp` | display the timestamp for each line |
| `--since` | show logs from a timestamp (e.g., `2013-01-02T13:23:37Z`) or relatively (e.g., `42m` for 42 minutes ago) |
| `--until` | show logs until a timestamp, absolute or relative, in the same format as `--since` |

## Image and Container: The Save Game and the Character

A way that helped solidify the difference between an image and a container: think of a game.

```bash
docker run --name tostao -it ubuntu
```
- The **image** (`ubuntu`) is the game's original *save* — the standard, always-the-same state from which everything begins.
- The **container** (`tostao`) is the *character* playing from that save — a temporary copy, with its own progress, which can be paused, stopped, or removed without affecting the original save.

And, following the same Docker command pattern, removing an image uses the same logic as `container rm`:

```bash
docker image rm <nome_da_imagem>
```

## Conclusion

None of these commands are complicated in isolation, but together they form the complete lifecycle of a container: create, enter and exit without termination, pause when necessary, investigate through logs, measure consumption, and finally, clean up what is no longer needed. This is the cycle that repeats constantly in day-to-day Docker operations.

## References

- [Docker Docs — docker container run](https://docs.docker.com/reference/cli/docker/container/run/) — execution flags, including `-i`, `-t`, and `--name`.
- [Docker Docs — docker container logs](https://docs.docker.com/reference/cli/docker/container/logs/) — log filtering and following options.
- [Docker Docs — docker container stats](https://docs.docker.com/reference/cli/docker/container/stats/) — real-time resource usage metrics.
- [Docker Docs — docker container prune](https://docs.docker.com/reference/cli/docker/container/prune/) — removal of stopped containers.
- [LINUXtips — Docker Essentials](https://linuxtips.io/treinamento/docker-essentials/) — course used as the basis for my studies and these notes.
