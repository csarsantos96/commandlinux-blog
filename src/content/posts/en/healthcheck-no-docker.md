---
title: 'HEALTHCHECK: Teaching Docker to Distrust Its Own Container'
description: >-
  Understand why a container might be running and still not be healthy, and how
  the HEALTHCHECK instruction solves this blind spot.
date: '2026-06-19'
updatedDate: '2026-07-30'
category: DOCKER
tags:
  - docker
  - dockerfile
  - healthcheck
  - devops
draft: false
language: en
translationOf: healthcheck-no-docker
sourceHash: fbe391ffe44fe68d0a802b633ca9b7b810a43292e36b1dad55b9884bb9b4a5b4
series: Docker in Practice
part: 5
totalParts: 9
---
# HEALTHCHECK: teaching Docker to distrust its own container

A container might show as `Up` in `docker container ls` and still have the application inside frozen — the process is alive, but not responding to anything. By default, Docker can only tell if the main process is still running, not if it's actually functioning. The `HEALTHCHECK` instruction resolves this blind spot.

## What is HEALTHCHECK

`HEALTHCHECK` is an instruction that can be defined in the Dockerfile (or in a `docker-compose.yml` service) to tell the Docker Engine how to verify if the process inside the container is actually healthy — and not just running.

Summarizing in one sentence: *"Hey Docker, from now on, don't just trust that I'm on. Test me."*

## A practical example

```dockerfile
HEALTHCHECK --timeout=2s CMD curl --fail localhost || exit 1
```

Let's break down each part:

- **`--timeout=2s`** — is the patience limit. Docker asks the question and waits a maximum of 2 seconds for a response. If the application takes longer than that, the test is already considered a failure.
- **`CMD curl --fail localhost`** — is the actual question: an attempt to access the application running inside the container itself. The `--fail` flag is important here: without it, `curl` considers any response it manages to download as "success" — including an HTTP 404 error. With `--fail`, error responses also make `curl` return a failure code, making the test more reliable.
- **`|| exit 1`** — is the contingency plan. If `curl` fails, `exit 1` is executed, sending an error signal to Docker.

## Where the result appears

The healthcheck status is visible directly in the container list:

```bash
docker container ls
```

A healthy container appears as `Up ... (healthy)`; one that is failing, as `Up ... (unhealthy)`. Right after starting, it might appear as `(health: starting)`, while Docker hasn't had time to run the first check yet.

To investigate the history of the last checks:

```bash
docker container inspect meu-nginx
```

The information is in the `State.Health` section of the output, including the current status and the log of the last attempts.

## Building and running

```bash
docker image build -t meu-nginx:2.0 .
docker container run -d -p 8080:80 --name meu-nginx meu-nginx:2.0
```

## Conclusion

`HEALTHCHECK` transforms "the container is running" into "the container is functioning" — a distinction that makes all the difference when another tool (an orchestrator, a load balancer, `docker-compose` itself) needs to decide whether to continue sending traffic to that container or replace it.

In the next part of the series, we'll address another problem that arises as soon as a container is restarted: how to make data survive it, with volumes.

## References

- [Docker Docs — Dockerfile reference: HEALTHCHECK](https://docs.docker.com/reference/dockerfile/#healthcheck) — complete instruction syntax, including `--interval`, `--retries`, and `--start-period`.
- [Docker Docs — docker container inspect](https://docs.docker.com/reference/cli/docker/container/inspect/) — how to query a container's health check history.
- [LINUXtips — Descomplicando o Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — course used as the basis for my studies and these notes.
