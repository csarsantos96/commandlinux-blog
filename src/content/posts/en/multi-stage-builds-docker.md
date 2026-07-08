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
sourceHash: 7c4ed547e8c337feb0a099591b7e52105a775f82b5e445e10b008e24f8bc9b14
---
A Python application image weighing 1.2 GB is not normal — it's a lack of multi-stage build.

## The problem

When you install compilers, build tools, and development dependencies in the same image that goes to production, all of it travels together.

## The solution

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

The `COPY --from=builder` is the key: only what you explicitly copy leaves the first stage.

## Measuring the result

```bash
docker build -t app:antes -f Dockerfile.old .
docker build -t app:depois .
docker images | grep app
```

In a real FastAPI project, this brought the image down from 1.1 GB to less than 180 MB — faster deployment, smaller attack surface, lower registry costs.
