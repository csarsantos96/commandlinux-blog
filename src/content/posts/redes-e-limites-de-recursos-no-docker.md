---
title: "Redes no Docker: conectando containers e limitando recursos"
description: Aprenda a criar redes no Docker para que containers se enxerguem pelo nome, e a limitar CPU e memória com --cpus e --memory.
date: 2026-06-25
updatedDate: 2026-07-30
category: DOCKER
tags: [docker, networking, cpu, memory, devops]
draft: false
language: pt
series: Docker na Prática
part: 7
totalParts: 9
---

# Redes no Docker: conectando containers e limitando recursos

Por padrão, cada container é isolado dos demais graças ao *net namespace* — cada um tem sua própria visão de rede. Mas aplicações reais quase nunca vivem sozinhas: uma API precisa falar com um Redis, um Redis precisa ser alcançável só por quem precisa dele. Para isso existem as **redes Docker**.

## Comandos de rede

| Comando | Função |
|---------|--------|
| `docker network create` | cria uma rede |
| `docker network connect` | conecta um container já existente a uma rede |
| `docker network disconnect` | desconecta um container de uma rede |
| `docker network ls` | lista as redes existentes |
| `docker network inspect` | mostra detalhes de uma rede, incluindo containers conectados |
| `docker network rm` | remove uma rede |
| `docker network prune` | remove redes sem containers conectados |

## Criando uma rede e conectando containers

```bash
docker network create giropops-senhas
```

```bash
docker run -d --name redis \
  --network giropops-senhas \
  -p 6379:6379 redis
```

```bash
docker run -d --name giropops-senhas \
  --network giropops-senhas \
  -e REDIS_HOST=redis \
  -p 5000:5000 cesarsantos96/giropops-senhas:1.0
```

O ponto-chave: dois containers na **mesma rede** conseguem se enxergar pelo **nome**. O Docker resolve `redis` para o IP correto do container `redis` através de um DNS interno — não é preciso descobrir ou fixar IPs manualmente. É exatamente isso que a variável `REDIS_HOST=redis`, passada com `-e`, está aproveitando: ela avisa a aplicação de qual hostname usar para encontrar o banco.

## Limitando CPU e memória

Sem limites, um container com bug ou pico de uso pode consumir todos os recursos disponíveis na máquina, prejudicando os demais. Duas flags do `docker run` resolvem isso diretamente:

```bash
docker run -d --name redis \
  --network giropops-senhas \
  -p 6379:6379 \
  --cpus 1 \
  --memory 256m \
  redis
```

- **`--cpus 1`** — limita o container a usar, no máximo, 1 CPU inteira. É possível usar valores fracionados, como `--cpus 0.5`, para limitar a metade de um núcleo.
- **`--memory 256m`** — limita o consumo de memória RAM do container a 256 MB.

Para ver a lista completa de opções de limite disponíveis no `run`:

```bash
docker container run --help
```

## Conclusão

Com redes e limites de recursos, já temos containers que conversam entre si sem depender de IPs fixos, e sem risco de um deles derrubar a máquina inteira. O que falta agora é parar de digitar um `docker run` gigante toda vez — e é isso que o Docker Compose resolve, na próxima parte da série.

## Referências

- [Docker Docs — Networking overview](https://docs.docker.com/engine/network/) — como o Docker gerencia redes e DNS interno entre containers.
- [Docker Docs — Runtime options with Memory, CPUs](https://docs.docker.com/engine/containers/resource_constraints/) — todas as opções de limitação de recursos do `docker run`.
- [LINUXtips — Descomplicando o Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — curso utilizado como base dos meus estudos e destas anotações.
