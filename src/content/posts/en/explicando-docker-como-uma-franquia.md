---
title: Explaining Docker as a Franchise
description: >-
  Understand Dockerfile, image, container, and configurations using a simple
  franchise analogy.
date: '2026-03-31'
category: DOCKER
tags:
  - docker
  - dockerfile
  - containers
  - imagens
  - devops
draft: false
language: en
translationOf: explicando-docker-como-uma-franquia
sourceHash: 4c219705b2d2985bf7947df61fa4215fb4cd914c7863c4ad8517205c0d312845
---
Imagine opening a restaurant franchise where a strict standard must be followed. In Docker, it's exactly the same.

### **Dockerfile: The Franchise Manual**

When we think of a manual, we remember someone created a step-by-step guide that must be followed strictly. The Dockerfile defines this entire roadmap: it determines how the image should be created, built, and run.

Join The Writer's Circle event
Example guidelines:

- Which base to use (e.g., Ubuntu);
- Which tools to install (e.g., Nginx);
- What should run on startup.  

**Dockerfile**  

``` 
FROM ubuntu:20.04
RUN apt update && apt install -y nginx
CMD ["nginx", "-g", "daemon off;"]
O Docker lê esse manual, executa o passo a passo e gera uma Imagem.  
``` 

### **Image: The Standard Template**  

The image is the ready-made franchise template; it's the standard that all "units" will follow. Like any franchise standard, the image is **immutable**. It serves as the base for creating containers, ensuring that all of them start exactly alike.

### **Containers: The Franchise Units** 

A container is the restaurant operating in practice. Each container is an instance of the image. You can have multiple containers running simultaneously:

- Unit in Neighborhood A;
- Unit in Neighborhood B;
- Unit in Neighborhood C.  

All follow the same standard, but operate **independently**.

### **Configurations: Local Adaptations**  

Although they follow the standard, each franchise can have particularities:

- Different prices;
- Specific promotions;
- Distinct environments.  

In Docker, these are the **configurations**:

- Environment variables;
- Volumes (storage);
- Ports;
- Configuration files.  

In other words: we have the same base, but with adapted behaviors.

## References

- [Docker Docs — What is an image?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/) — explains images, layers, and Dockerfiles.
- [Docker Docs — What is a container?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/) — presents the relationship between images and containers.
- [LINUXtips — Docker Essentials](https://linuxtips.io/treinamento/docker-essentials/) — course used as the basis for my studies and these notes.
