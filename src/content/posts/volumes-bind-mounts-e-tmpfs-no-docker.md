---
title: "Volumes, bind mounts e tmpfs no Docker"
description: Entenda por que containers precisam de volumes para persistir dados e conheça as diferenças entre bind mounts, named volumes e tmpfs.
date: 2026-06-22
category: DOCKER
tags: [docker, volumes, bind-mount, tmpfs, devops]
draft: false
language: pt
series: Docker na Prática
part: 6
totalParts: 9
---

# Volumes, bind mounts e tmpfs no Docker

Containers são efêmeros por natureza: ao remover um, tudo o que foi escrito na camada de execução (RW) desaparece junto — inclusive o `echo` que fizemos lá na parte 2 desta série. Sempre que um dado precisa sobreviver ao ciclo de vida do container, ele precisa morar fora dessa camada. É para isso que existem os **volumes**.

## O que são volumes

Volumes são diretórios **externos** ao container, montados diretamente nele. Por serem externos, eles **bypassam** o sistema de camadas do container — ou seja, não seguem aquele padrão de imagem somando camada sobre camada que vimos na parte 3.

O Docker suporta três tipos principais de mount: **bind mount**, **volume nomeado** e **tmpfs**.

## Bind mount: encaixando uma pasta do host no container

```bash
docker run -ti --name testando-volumes \
  --mount type=bind,source=/home/usuario/projeto,target=/giropops-senhas \
  debian
```

Esse comando cria um container Debian e "encaixa" uma pasta real da máquina host dentro dele. A ideia por trás do bind mount é simples: *"Docker, pega essa pasta real do meu Linux e faz ela aparecer dentro do container, como se fosse outro caminho."*

| Parâmetro | Significado |
|-----------|-------------|
| `source` | a pasta da máquina real (o host) |
| `target` | o caminho onde essa pasta vai aparecer dentro do container |

Para impedir que o container escreva de volta na pasta do host, é só adicionar a opção de somente leitura:

```bash
--mount type=bind,source=/home/usuario/projeto,target=/giropops-senhas,readonly
```

## Volumes nomeados: gerenciados pelo próprio Docker

Diferente do bind mount, que aponta para um caminho específico que você escolhe no host, um volume nomeado é criado e gerenciado pelo próprio Docker — sem depender de você saber (ou se importar) onde ele fica fisicamente guardado.

```bash
docker volume ls
docker volume create meudb
docker volume inspect meudb
```

E para usar esse volume em um container:

```bash
docker run -d --name meu-container --mount type=volume,source=meudb,target=/dados debian
```

## Declarando um volume no Dockerfile

```dockerfile
SHELL ["/bin/bash", "-c"]
VOLUME /app/dados
```

- `SHELL` define qual shell o Docker vai usar para interpretar os próximos comandos `RUN`.
- `VOLUME /app/dados` avisa o Docker que aquele caminho deve ser tratado como dado persistente — quando o container grava algo ali, a ideia é que esses dados fiquem fora da camada normal do container, sobrevivendo mesmo que ele seja removido.

## tmpfs: um filesystem temporário em memória

O `tmpfs` é um tipo de mount onde o Docker cria uma área temporária **em memória RAM** dentro do container — útil para dados sensíveis ou temporários que você não quer que toquem o disco, e que somem assim que o container para.

```bash
docker run -d --name web-2 \
  --mount type=tmpfs,target=/nginx-cache \
  -p 8081:80 nginx
```

## Resumo dos três tipos

| Tipo | Onde fica o dado | Sobrevive ao container? | Uso típico |
|------|-------------------|--------------------------|------------|
| Bind mount | pasta escolhida no host | sim | desenvolvimento, compartilhar código-fonte |
| Volume nomeado | gerenciado pelo Docker | sim | dados de aplicação, bancos de dados |
| tmpfs | memória RAM | não | cache, segredos temporários |

## Conclusão

Volumes resolvem o problema de persistência container por container. Mas quando a aplicação cresce e precisa conversar com outros containers — um banco, um cache — surge outro problema: como esses containers se enxergam? É o assunto da próxima parte da série, sobre redes no Docker.

## Referências

- [Docker Docs — Volumes](https://docs.docker.com/engine/storage/volumes/) — volumes nomeados, criação e gerenciamento.
- [Docker Docs — Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/) — como montar diretórios do host dentro do container.
- [Docker Docs — tmpfs mounts](https://docs.docker.com/engine/storage/tmpfs/) — mounts temporários em memória.
- [LINUXtips — Descomplicando o Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — curso utilizado como base dos meus estudos e destas anotações.
