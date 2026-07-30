---
title: "Modo detached, docker exec e testando containers por dentro"
description: Aprenda a rodar containers em segundo plano com -d, entrar neles com docker exec, publicar portas com -p e investigar o que está acontecendo lá dentro.
date: 2026-06-12
updatedDate: 2026-07-30
category: DOCKER
tags: [docker, containers, cli, networking, devops]
draft: false
language: pt
series: Docker na Prática
part: 2
totalParts: 9
---

# Modo detached, docker exec e testando containers por dentro

Na [primeira parte desta série](/posts/gerenciando-containers-docker-no-dia-a-dia), o foco foi o ciclo de vida de um container criado no modo interativo. Mas na prática, a maioria dos containers roda em segundo plano — um servidor web não precisa (nem deve) ficar preso a um terminal. É aí que entram o modo **detached** e o comando **`exec`**.

## Rodando um container em segundo plano

```bash
docker container run -d --name meu-nginx nginx
```

A flag `-d` (*detached mode*, modo desacoplado) muda o comportamento do `run`:

- o container roda em segundo plano;
- você não fica preso ao terminal dele;
- o container continua rodando sozinho;
- o terminal volta imediatamente para você.

Antes mesmo do Nginx começar a atender requisições, a imagem executa seu **entrypoint** — um script responsável por configurar o ambiente (ajustar arquivos, variáveis, permissões) antes do processo principal subir. Vamos entender o `ENTRYPOINT` em detalhes na parte 4 desta série.

## Entrando em um container que já está rodando

Para interagir com um container em segundo plano, existe o comando `exec`:

```bash
docker container exec -ti meu-nginx bash
```

Isso abre um terminal interativo *dentro* do container já em execução. Vale notar a diferença em relação ao `attach` visto na parte anterior:

| Comando | O que faz | Ao sair com `Ctrl+D` |
|---------|-----------|------------------------|
| `attach` | conecta ao processo principal (PID 1) do container | finaliza o container inteiro |
| `exec` | inicia um **novo processo** dentro do container já em execução | encerra apenas essa sessão — o container continua rodando |

Esse comportamento é o que torna o `exec` seguro para investigar um container em produção sem correr o risco de derrubá-lo sem querer.

## Testando o container por dentro

Um uso muito comum do `exec` é rodar um comando único, sem abrir sessão interativa:

```bash
docker container exec -ti meu-nginx curl localhost
```

Aqui estamos pedindo para o próprio container fazer uma requisição HTTP para `localhost`. Como o comando roda dentro do namespace de rede do container, `localhost` aponta para o próprio container — é uma forma rápida de confirmar se a aplicação está respondendo *de dentro para dentro*, sem depender de portas publicadas.

## Publicando portas com -p

Para acessar o Nginx a partir do navegador, é preciso publicar a porta do container em uma porta da máquina host:

```bash
docker container run -d -p 8080:80 --name meu-nginx nginx
```

| Parte | Significado |
|-------|-------------|
| `8080` | porta da minha máquina (host) |
| `80` | porta do container onde o Nginx está escutando |

O formato é sempre `-p porta_do_host:porta_do_container`. Depois disso, basta acessar `IP_da_maquina:8080` no navegador — por exemplo, `192.168.1.10:8080` — para chegar até o Nginx rodando dentro do container.

## Editando um arquivo dentro do container

Com o `exec`, também dá para alterar arquivos diretamente dentro do container em execução:

```bash
docker container exec -ti meu-nginx bash
echo "opaaa" > /usr/share/nginx/html/index.html
```

Ao atualizar a página no navegador, o novo conteúdo aparece. É um bom experimento para visualizar, na prática, que o container tem seu próprio filesystem, isolado do host.

## Baixando uma imagem antecipadamente

O `docker run` baixa a imagem automaticamente se ela ainda não existir localmente, mas às vezes faz sentido baixar antes, sem criar um container:

```bash
docker pull nginx
```

## Conclusão

Com detached mode, `exec` e publicação de portas, já é possível rodar aplicações reais em segundo plano e investigá-las sem derrubá-las. O próximo passo é parar de depender de imagens prontas do Docker Hub e aprender a construir as suas próprias — é isso que vem na parte 3, com o Dockerfile.

## Referências

- [Docker Docs — docker container exec](https://docs.docker.com/reference/cli/docker/container/exec/) — como executar comandos em um container já em execução.
- [Docker Docs — Publish and expose ports](https://docs.docker.com/engine/network/#published-ports) — como funciona a publicação de portas com `-p`.
- [LINUXtips — Descomplicando o Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — curso utilizado como base dos meus estudos e destas anotações.
