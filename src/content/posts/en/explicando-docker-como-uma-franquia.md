---
title: Explaining Docker like a Franchise
description: >-
  Understand Dockerfile, image, container, and configurations using a simple
  analogy with franchises.
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
sourceHash: b9e6b4939c44f3905adff8c59088ec8a66b725a7b4cb91a148deeef360a75b65
---
Imagine you open a restaurant franchise, and within this franchise, there's a strict standard to follow. In Docker, exactly the same thing happens.

### **Dockerfile: The Franchise Manual**

When we think of a manual, we remember that someone created a step-by-step guide that must be followed strictly. The Dockerfile defines this entire roadmap: it determines how the image should be created, generated, and executed.

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

The image is the ready-made template of the franchise; it's the standard that all "units" will follow. Like any franchise standard, the image is **immutable**. It serves as the base for creating containers, ensuring that all of them start exactly alike.

### **Containers: The Franchise Units** 

The container is the restaurant operating in practice. Each container is an instance of the image. You can have multiple containers running simultaneously:

- Unit in neighborhood A;
- Unit in neighborhood B;
- Unit in neighborhood C.  

All follow the same standard, but operate **independently**.

### **Configurations: Local Adaptations**  

Although they follow the standard, each franchise can have specific characteristics:

- Different prices;
- Specific promotions;
- Distinct environments.  

In Docker, these are the **configurations**:

- Environment variables;
- Volumes (storage);
- Ports;
- Configuration files.  

In other words: we have the same base, but with adapted behaviors.
