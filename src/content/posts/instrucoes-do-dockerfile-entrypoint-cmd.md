---
title: "Todas as instruções do Dockerfile e a diferença entre ENTRYPOINT e CMD"
description: Um guia de referência para as principais instruções do Dockerfile e uma explicação prática de como ENTRYPOINT e CMD trabalham juntos.
date: 2026-06-17
category: DOCKER
tags: [docker, dockerfile, entrypoint, devops]
draft: false
language: pt
series: Docker na Prática
part: 4
totalParts: 9
---

# Todas as instruções do Dockerfile e a diferença entre ENTRYPOINT e CMD

Na [parte anterior](/posts/dockerfile-primeira-imagem-docker-build), construímos uma imagem simples com `FROM`, `RUN`, `EXPOSE` e `CMD`. O Dockerfile tem várias outras instruções — cada uma resolvendo um problema específico de como a imagem é montada e como o container se comporta ao iniciar.

## Guia de referência das instruções

| Instrução | O que faz |
|-----------|-----------|
| `FROM` | indica qual imagem será utilizada como base. Precisa ser a primeira linha do Dockerfile |
| `RUN` | executa um comando em uma nova camada no topo da imagem e "commita" a alteração, disponível para as próximas instruções |
| `COPY` | copia novos arquivos e diretórios do contexto de build e adiciona ao filesystem do container |
| `ADD` | copia arquivos, diretórios, arquivos TAR ou arquivos remotos (URLs) para o filesystem do container — mais poderoso que o `COPY`, mas também menos previsível |
| `CMD` | define o comando padrão executado quando o container é iniciado. Diferente do `RUN`, que roda durante o build, o `CMD` só roda em tempo de execução |
| `ENTRYPOINT` | configura o container para rodar como um executável fixo. Quando esse executável termina, o container também termina |
| `ENV` | define variáveis de ambiente disponíveis dentro do container |
| `EXPOSE` | informa qual porta o container estará ouvindo (documentação — não publica a porta sozinho) |
| `LABEL` | adiciona metadados à imagem, como versão, descrição e autor |
| `MAINTAINER` | define o autor da imagem (instrução antiga, hoje substituída por `LABEL`) |
| `USER` | determina qual usuário será utilizado ao rodar a imagem. Por padrão é o `root` |
| `VOLUME` | cria um ponto de montagem no container, marcando aquele caminho como dado persistente |
| `WORKDIR` | muda do diretório raiz (`/`) para o diretório especificado |

## ENTRYPOINT vs CMD

Esse é o ponto que mais gera confusão, então vale destrinchar com calma.

- **`ENTRYPOINT`** é o comando principal — o "coração" do container, o que ele sempre vai executar ao iniciar. Pense nele como algo imutável.
- **`CMD`**, usado sozinho, define um comando padrão que pode ser totalmente sobrescrito na hora do `docker run`.

O detalhe importante aparece quando os dois estão **juntos** no mesmo Dockerfile: nesse caso, o `CMD` deixa de ser um comando e passa a fornecer apenas os **parâmetros** para o `ENTRYPOINT`.

```dockerfile
ENTRYPOINT ["/usr/sbin/apachectl"]
CMD ["-D", "FOREGROUND"]
```

- `ENTRYPOINT` é o comando fixo que sempre roda: `/usr/sbin/apachectl`.
- `CMD` é o argumento padrão passado a ele: `-D FOREGROUND`.

Isso é útil porque o `CMD` ainda pode ser sobrescrito ao rodar o container (`docker run minha-imagem -D BACKGROUND`, por exemplo), enquanto o `ENTRYPOINT` permanece garantido — o container sempre vai rodar o Apache, o que muda são só os parâmetros.

Um exemplo mais próximo do dia a dia, com Nginx:

```dockerfile
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
```

Aqui o `ENTRYPOINT` transforma o container definitivamente em "um Nginx". O `daemon off;` do `CMD` serve para que o Nginx rode em primeiro plano (*foreground*) — sem isso, o processo se colocaria em segundo plano e o container, sem nenhum processo em primeiro plano para acompanhar, seria encerrado imediatamente.

## Passando variáveis do build para o container com ARG e ENV

`ARG` define uma variável disponível **apenas durante o build**. Para que ela também fique acessível dentro do container em tempo de execução, é preciso "promovê-la" para uma `ENV`:

```dockerfile
ARG GIROPOPS
ENV GIROPOPS=$GIROPOPS
```

## Inspecionando o resultado

Depois de buildar a imagem, dá para conferir tudo o que foi configurado — `Entrypoint`, `Cmd`, `Env`, `ExposedPorts` — com:

```bash
docker container inspect meu-nginx
```

## Conclusão

Com essas instruções, um Dockerfile deixa de ser só "instalar um pacote e rodar um comando" e passa a descrever de verdade como uma aplicação deve se comportar dentro do container: qual usuário usar, quais variáveis injetar, quais dados persistir e qual processo é, de fato, o dono do container.

Se o objetivo for reduzir o tamanho final da imagem — por exemplo, quando a aplicação precisa de ferramentas de build que não deveriam ir para produção —, vale complementar esta leitura com o post sobre [multi-stage builds](/posts/multi-stage-builds-docker), que separa a etapa de build da etapa de execução dentro do mesmo Dockerfile.

Na próxima parte da série, vamos ensinar o Docker a desconfiar do próprio container com `HEALTHCHECK`.

## Referências

- [Docker Docs — Dockerfile reference](https://docs.docker.com/reference/dockerfile/) — referência oficial de todas as instruções, incluindo `ENTRYPOINT` e `CMD`.
- [Docker Docs — docker container inspect](https://docs.docker.com/reference/cli/docker/container/inspect/) — inspeção detalhada de um container.
- [LINUXtips — Descomplicando o Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — curso utilizado como base dos meus estudos e destas anotações.
