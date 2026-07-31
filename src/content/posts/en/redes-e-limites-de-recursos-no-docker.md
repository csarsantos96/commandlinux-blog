---
title: 'Docker Networking: Connecting Containers and Limiting Resources'
description: >-
  Learn to create networks in Docker so containers can communicate by name, and
  how to limit CPU and memory with --cpus and --memory.
date: '2026-06-25'
updatedDate: '2026-07-30'
category: DOCKER
tags:
  - docker
  - networking
  - cpu
  - memory
  - devops
draft: false
language: en
translationOf: redes-e-limites-de-recursos-no-docker
sourceHash: 38efa1e8792df17f00e91ac94b9d95335576365c0596a1b7a332e91f68fd7415
series: Practical Docker
part: 7
totalParts: 9
---
# Docker Networks: connecting containers and limiting resources

By default, each container is isolated from the others thanks to the *net namespace* — each has its own network view. But real applications almost never live alone: an API needs to talk to a Redis, a Redis needs to be reachable only by those who need it. That's what **Docker networks** are for.

## Network commands

| Command | Function |
|---------|--------|
| `docker network create` | creates a network |
| `docker network connect` | connects an existing container to a network |
| `docker network disconnect` | disconnects a container from a network |
| `docker network ls` | lists existing networks |
| `docker network inspect` | shows network details, including connected containers |
| `docker network rm` | removes a network |
| `docker network prune` | removes networks with no connected containers |

## Creating a network and connecting containers

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

The key point: two containers on the **same network** can see each other by **name**. Docker resolves `redis` to the correct IP of the `redis` container through an internal DNS — there's no need to manually discover or fix IPs. This is exactly what the `REDIS_HOST=redis` variable, passed with `-e`, is taking advantage of: it tells the application which hostname to use to find the database.

## Limiting CPU and memory

Without limits, a container with a bug or usage spike can consume all available resources on the machine, impacting others. Two `docker run` flags directly solve this:

```bash
docker run -d --name redis \
  --network giropops-senhas \
  -p 6379:6379 \
  --cpus 1 \
  --memory 256m \
  redis
```

- **`--cpus 1`** — limits the container to use, at most, 1 full CPU. It's possible to use fractional values, such as `--cpus 0.5`, to limit to half a core.
- **`--memory 256m`** — limits the container's RAM consumption to 256 MB.

To see the complete list of limit options available for `run`:

```bash
docker container run --help
```

## Conclusion

With networks and resource limits, we now have containers that communicate with each other without relying on fixed IPs, and without the risk of one of them bringing down the entire machine. What's missing now is to stop typing a giant `docker run` command every time — and that's what Docker Compose solves, in the next part of the series.

## References

- [Docker Docs — Networking overview](https://docs.docker.com/engine/network/) — how Docker manages networks and internal DNS between containers.
- [Docker Docs — Runtime options with Memory, CPUs](https://docs.docker.com/engine/containers/resource_constraints/) — all `docker run` resource limiting options.
- [LINUXtips — Descomplicando o Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — course used as the basis for my studies and these notes.
