---
title: Multi-stage builds — much smaller Docker images
description: >-
  How to use multi-stage builds to separate build from runtime and drastically
  reduce the size of your images.
date: '2026-06-24'
category: DOCKER
tags:
  - dockerfile
  - multi-stage
  - otimização
draft: false
language: en
translationOf: multi-stage-builds-docker
sourceHash: e6696eaa4197f13e2d6a41e9a1c50c0ff7e403c107b4df67351abea5e2f8c511
---
A Python application image that weighs 1.2 GB is not normal — it's a lack of multi-stage builds.

## The Problem

When you install compilers, build tools, and development dependencies in the same image that goes to production, all of it travels together.

## The Solution

```dockerfile
# stage 1: build
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# stage 2: runtime
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

`COPY --from=builder` is the key: only what you explicitly copy leaves the first stage.

## Measuring the Result

```bash
docker build -t app:antes -f Dockerfile.old .
docker build -t app:depois .
docker images | grep app
```

In a real FastAPI project, this brought the image down from 1.1 GB to less than 180 MB — faster deployments, smaller attack surface, lower registry costs.

## References

- [Docker Docs — Multi-stage builds](https://docs.docker.com/build/building/multi-stage/) — documents the creation of images with multiple stages.
- [Docker Docs — Best practices for Dockerfiles](https://docs.docker.com/build/building/best-practices/) — official recommendations for smaller and more secure images.
- [LINUXtips — Demystifying Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — course used as the basis for my studies on Dockerfiles and image optimization.
