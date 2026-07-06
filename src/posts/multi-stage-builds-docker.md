---
title: Multi-stage builds - imagens Docker 10x menores
description: Como usar multi-stage builds para separar build de runtime e reduzir drasticamente o tamanho das suas imagens.
date: 2026-06-24
category: DOCKER
tags: [dockerfile, multi-stage, otimização]
---

Uma imagem de aplicação Python que pesa 1.2 GB não é normal — é falta de multi-stage build.

## O problema

Quando você instala compiladores, ferramentas de build e dependências de desenvolvimento na mesma imagem que vai para produção, tudo isso viaja junto.

## A solução

```dockerfile
# stage 1: build
FROM python:3.12-slim AS builder
WORKDIR /app
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

O `COPY --from=builder` é a chave: só o que você copiar explicitamente sai do primeiro estágio.

## Medindo o resultado

```bash
docker build -t app:antes -f Dockerfile.old .
docker build -t app:depois .
docker images | grep app
```

Em um projeto FastAPI real, isso derrubou a imagem de 1.1 GB para menos de 180 MB — deploy mais rápido, menos superfície de ataque, menos custo de registry.
