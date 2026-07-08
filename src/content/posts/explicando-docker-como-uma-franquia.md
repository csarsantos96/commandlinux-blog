---
title: Explicando Docker como uma franquia
description: Entenda Dockerfile, imagem, container e configurações usando uma analogia simples com franquias.
date: 2026-03-31
category: DOCKER
tags: [docker, dockerfile, containers, imagens, devops]
draft: false
language: pt
---

Imagine que você abra uma franquia de restaurantes e, nessa franquia, exista um padrão rigoroso a ser seguido. No Docker, acontece exatamente a mesma coisa.  

### **Dockerfile: O Manual da Franquia**  

Quando pensamos em um manual, lembramos que alguém criou um passo a passo que deve ser seguido à risca. O Dockerfile define todo esse roteiro: ele determina como a imagem deve ser criada, gerada e executada.

Join The Writer's Circle event
Exemplo de diretrizes:

- Qual base usar (ex: Ubuntu);
- Quais ferramentas instalar (ex: Nginx);
- O que deve rodar ao iniciar.  
  
**Dockerfile**  

``` 
FROM ubuntu:20.04
RUN apt update && apt install -y nginx
CMD ["nginx", "-g", "daemon off;"]
O Docker lê esse manual, executa o passo a passo e gera uma Imagem.  
``` 

### **Imagem: O Modelo Padrão**  

A imagem é o modelo pronto da franquia; é o padrão que todas as “unidades” vão seguir. Como todo padrão de franquia, a imagem é **imutável**. Ela serve como a base para criar os containers, garantindo que todos comecem exatamente iguais.

### **Containers: As Unidades da Franquia** 

O container é o restaurante funcionando na prática. Cada container é uma instância da imagem. Você pode ter vários containers rodando ao mesmo tempo:

- Unidade no bairro A;
- Unidade no bairro B;
- Unidade no bairro C.  

Todos seguem o mesmo padrão, mas funcionam de forma **independente**.

### **Configurações: As Adaptações Locais**  

Embora sigam o padrão, cada franquia pode ter particularidades:

- Preços diferentes;
- Promoções específicas;
- Ambientes distintos.  

No Docker, isso são as **configurações**:

- Variáveis de ambiente;
- Volumes (armazenamento);
- Portas;
- Arquivos de configuração.  

Ou seja: temos a mesma base, mas com comportamentos adaptados.