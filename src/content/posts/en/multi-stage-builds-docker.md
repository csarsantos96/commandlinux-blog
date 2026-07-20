---
title: Multi-stage builds — much smaller Docker images
description: >-
  How to use multi-stage builds to separate build from runtime and drastically
  reduce your image size.
date: '2026-06-24'
category: DOCKER
tags:
  - dockerfile
  - multi-stage
  - otimização
draft: false
language: en
translationOf: multi-stage-builds-docker
sourceHash: 6e79203fb48b28f882ee721808560e7c330596db89a650822c08cf15f2d929dd
---
A Python application image weighing 1.2 GB is not normal — it's a lack of multi-stage builds.

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

In a real FastAPI project, this brought the image down from 1.1 GB to less than 180 MB — faster deployment, smaller attack surface, lower registry costs.
