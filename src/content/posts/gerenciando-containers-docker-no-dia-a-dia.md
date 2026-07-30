---
title: "Gerenciando containers no dia a dia com Docker"
description: Anotações práticas sobre o ciclo de vida de um container Docker, do docker run ao docker stats, passando por logs, pause e prune.
date: 2026-06-10
updatedDate: 2026-07-30
category: DOCKER
tags: [docker, containers, cli, devops]
draft: false
language: pt
series: Docker na Prática
part: 1
totalParts: 9
---

# Gerenciando containers no dia a dia com Docker

Depois de entender [o que é um container](/posts/O-Que-e-containers) e [como o Docker organiza imagem, container e configurações](/posts/explicando-docker-como-uma-franquia), o próximo passo natural é aprender a manter esses containers vivos: criar, sair sem derrubar, pausar, monitorar e, quando não servem mais, remover.

Estas anotações nasceram justamente desse momento de estudo, testando comando por comando em containers Ubuntu.

## Criando e gerenciando os primeiros containers

Ao rodar um container interativo, três flags aparecem o tempo todo:

| Flag | Função |
|------|--------|
| `-i` | interatividade — mantém o `STDIN` aberto |
| `-t` | aloca um terminal (TTY) |
| `-it` | as duas coisas juntas — terminal interativo de verdade |

Na prática, o comando mais comum para começar é:

```bash
docker container run -it ubuntu
```

## Saindo do container sem finalizar ele

Aqui mora uma pegadinha comum: existem duas formas bem diferentes de "sair" de um container.

- **`Ctrl + P` seguido de `Ctrl + Q`** — sai do terminal do container, mas ele **continua em execução** em segundo plano.
- **`Ctrl + D`** — sai do container e **finaliza (mata) ele**.

Para voltar a um container que ainda está rodando (saiu com `Ctrl+P+Q`), basta anexar o terminal de novo:

```bash
docker container attach <id_do_container>
```

## Dando nome aos containers

Trabalhar com IDs gerados aleatoriamente cansa rápido. Dá para nomear o container na criação:

```bash
docker container run --name tostao -it ubuntu
```

E usar esse nome no lugar do ID para reconectar:

```bash
docker container attach tostao
```

Se o container foi finalizado com `Ctrl+D`, o `attach` sozinho não resolve — primeiro é preciso religá-lo e só depois anexar o terminal:

```bash
docker container start tostao
docker container attach tostao
```

## Pausando e despausando

Pausar congela os processos do container sem finalizá-los:

```bash
docker container pause tostao
docker container unpause tostao
```

## Parando e removendo

Quando o container não é mais necessário:

```bash
docker container stop tostao
docker container rm tostao
```

E para limpar de uma vez todos os containers já parados, sem precisar removê-los um a um:

```bash
docker container prune
```

## Visualizando métricas e uso de recursos

O `stats` dá um panorama geral do consumo dos containers em execução:

```bash
docker container stats
```

Algumas variações úteis:

```bash
docker container stats -a
```
Lista todos os containers (inclusive parados) e mostra as estatísticas de cada um.

```bash
docker container stats --no-stream
```
Imprime as estatísticas uma única vez, sem ficar atualizando continuamente na tela.

Já o `top` mostra todos os **processos** em execução dentro de um container específico — não estatísticas de consumo, mas o que de fato está rodando lá dentro:

```bash
docker container top tostao
```

Resumindo a diferença: `stats` mostra **quanto** de recurso está sendo usado; `top` mostra **o quê** está sendo executado.

## Consultando logs

O `docker container logs` é o primeiro lugar para investigar o que um container está fazendo:

```bash
docker container logs tostao
```

Algumas flags que aparecem com frequência:

| Flag | Função |
|------|--------|
| `--details` | mostra detalhes extras fornecidos aos logs |
| `-f`, `--follow` | acompanha a saída dos logs em tempo real |
| `-n`, `--tail` | número de linhas a exibir a partir do fim (padrão: todas) |
| `-t`, `--timestamp` | exibe o timestamp de cada linha |
| `--since` | mostra logs a partir de um timestamp (ex: `2013-01-02T13:23:37Z`) ou de forma relativa (ex: `42m` para 42 minutos atrás) |
| `--until` | mostra logs até um timestamp, absoluto ou relativo, no mesmo formato do `--since` |

## Imagem e container: o save e o personagem

Um jeito que ajudou a fixar a diferença entre imagem e container: pense em um jogo.

```bash
docker run --name tostao -it ubuntu
```

- A **imagem** (`ubuntu`) é o *save* original do jogo — o estado padrão, sempre igual, do qual tudo parte.
- O **container** (`tostao`) é o *personagem* jogando a partir daquele save — uma cópia temporária, com seu próprio progresso, que pode ser pausada, encerrada ou removida sem afetar o save original.

E, seguindo o mesmo padrão de comandos do Docker, remover uma imagem usa a mesma lógica de `container rm`:

```bash
docker image rm <nome_da_imagem>
```

## Conclusão

Nenhum desses comandos é complicado isoladamente, mas juntos formam o ciclo de vida completo de um container: criar, entrar e sair sem derrubar, pausar quando necessário, investigar pelos logs, medir consumo e, por fim, limpar o que não serve mais. É esse ciclo que se repete o tempo todo no dia a dia com Docker.

## Referências

- [Docker Docs — docker container run](https://docs.docker.com/reference/cli/docker/container/run/) — flags de execução, incluindo `-i`, `-t` e `--name`.
- [Docker Docs — docker container logs](https://docs.docker.com/reference/cli/docker/container/logs/) — opções de filtragem e acompanhamento de logs.
- [Docker Docs — docker container stats](https://docs.docker.com/reference/cli/docker/container/stats/) — métricas de uso de recursos em tempo real.
- [Docker Docs — docker container prune](https://docs.docker.com/reference/cli/docker/container/prune/) — remoção de containers parados.
- [LINUXtips — Docker Essentials](https://linuxtips.io/treinamento/docker-essentials/) — curso utilizado como base dos meus estudos e destas anotações.
