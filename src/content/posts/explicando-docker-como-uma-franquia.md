---
title: Explicando Docker como uma franquia
description: Entenda Dockerfile, imagem, container e configurações usando uma analogia simples com franquias.
date: 2026-03-31
category: DOCKER
tags: [docker, dockerfile, containers, imagens, devops]
draft: false
language: pt
---

Imagine que você abriu uma franquia de restaurantes.

Para que todas as unidades funcionem do mesmo jeito, você precisa de um padrão: o mesmo cardápio, o mesmo jeito de preparar os alimentos, os mesmos equipamentos e o mesmo processo de atendimento.

No Docker, a ideia é parecida.

Você cria um padrão de ambiente para sua aplicação. Esse padrão define o que precisa ser instalado, quais arquivos serão copiados, qual comando será executado e como a aplicação deve iniciar.

É aí que entram quatro conceitos importantes:

- `Dockerfile`
- imagem
- container
- configurações

Vamos pensar nisso como se fosse uma franquia.

## Dockerfile: o manual da franquia

Toda franquia precisa de um manual.

Esse manual explica como montar a unidade, quais ferramentas usar, quais processos seguir e o que deve acontecer quando tudo estiver pronto para funcionar.

No Docker, esse manual é o `Dockerfile`.

Ele descreve o passo a passo necessário para criar o ambiente da aplicação.

Um exemplo simples:

```dockerfile
FROM ubuntu:20.04

RUN apt update && apt install -y nginx

CMD ["nginx", "-g", "daemon off;"]