---
title: Como os containers funcionam por baixo do capô
description: Entenda como Docker e o kernel Linux usam cgroups e namespaces para isolar processos, rede, usuários, sistema de arquivos e recursos dentro de containers.
date: 2026-01-15
category: DOCKER
tags: [docker, containers, linux, cgroups, namespaces, kernel]
---

# **O que é um Container ?**  

`Container` é uma forma de isolar processos e recursos para executar uma aplicação. É um agrupamento de uma aplicação junto com suas dependências, que compartilham o kernel do sistema operacional do host.  
  
  ```mermaid
flowchart LR
    subgraph FISICA["Máquina física"]
        direction TB

        subgraph APPS_F["Aplicações"]
            direction LR
            F1["App 1"]
            F2["App 2"]
            F3["App 3"]
        end

        FOS["Sistema operacional"]
        FHW["Servidor / Hardware"]

        F1 --> FOS
        F2 --> FOS
        F3 --> FOS
        FOS --> FHW
    end

    subgraph VMS["Máquinas virtuais"]
        direction TB

        subgraph VM_APPS["VMs"]
            direction LR
            VM1["VM 1<br/>App + SO"]
            VM2["VM 2<br/>App + SO"]
            VM3["VM 3<br/>App + SO"]
        end

        HYP["Hypervisor"]
        VOS["Sistema operacional"]
        VHW["Servidor / Hardware"]

        VM1 --> HYP
        VM2 --> HYP
        VM3 --> HYP
        HYP --> VOS
        VOS --> VHW
    end

    subgraph CONTAINERS["Containers"]
        direction TB

        subgraph C_APPS["Aplicações isoladas"]
            direction LR
            C1["App 1"]
            C2["App 2"]
            C3["App 3"]
        end

        DOCKER["Docker Engine"]
        COS["Sistema operacional do host"]
        CHW["Servidor / Hardware"]

        C1 --> DOCKER
        C2 --> DOCKER
        C3 --> DOCKER
        DOCKER --> COS
        COS --> CHW
    end

    FOS -->|Virtualização| HYP
    VOS -->|Containers| DOCKER  
```  
  
Outro ponto interessante na utilização de containers é a portabilidade. Não importa em qual ambiente você criou o seu container. Ele poderá ser executado em qualquer outro ambiente que possua o Docker instalado. Mas a portabilidade é apenas uma parte do que torna os containers tão úteis. Quando vários containers estão rodando na mesma máquina, é necessário impedir que um deles consuma todos os recursos disponíveis e prejudique os demais.

É nesse ponto que entram os **`cgroups`** (*control groups*). Eles são recursos do kernel Linux responsáveis por controlar e contabilizar o uso de recursos por grupos de processos, como CPU, memória, I/O de disco e quantidade de processos.

NNa prática, os cgroups permitem definir limites para cada container. Assim, uma aplicação com erro ou pico de consumo não utiliza toda a memória ou processamento do host e deixa os outros containers sem recursos.

Apesar disso, os cgroups não realizam o isolamento entre os containers. Sua função é controlar e limitar a quantidade de recursos que cada grupo de processos pode consumir. O isolamento propriamente dito é realizado pelos namespaces, que fazem com que cada container tenha sua própria visão do sistema operacional.



Enquanto os cgroups controlam **quanto** de recurso um container pode utilizar, os **`namespaces`** controlam **o que ele consegue enxergar** no sistema.

É por meio dos namespaces que cada container possui sua própria visão de processos, rede, usuários, hostname e sistema de arquivos, mesmo compartilhando o mesmo kernel Linux com outros containers.  
  
  ## Namespace:  
  Namespaces foi adicionados no kernel Linux na versão `2.6.24` e são eles que permitem o isolamento de processos quando estamos utilizando o **Docker**. São responsáveis por fazer com que cada container possua seu próprio ambiente. ou seja, cada container terá a sua árvore de processos, pontos de montages e etc. Fazendo com que um container não interfira na execução do outro.  
    
  ## PID namespace:  
  O PID namespace permite que cada container tenha seus próprios identificadores de processo. Isso faz com que o container possua um PID para um processo em execução e, quando você procurar por esse processo na máquina host, ele será encontrado, porém com outra identificação, ou seja, com outro PID.  

  ## Net namespace:  
  O Net namespace permite que cada container possua sua própria interface de rede e suas próprias portas. Para que seja possível a comunicação entre os containers, é criado um par de interfaces virtuais: uma responsável pela interface do container (normalmente utilizando o nome `eth0`) e outra responsável por uma interface no host, normalmente chamada de `veth` (`veth` + um identificador aleatório). Essas duas interfaces estão ligadas através da bridge do Docker no host, permitindo a comunicação entre os containers por meio do roteamento de pacotes.  

  ## Mnt namespace:  
  É a evolução do `chroot`. Com o Mnt namespace, cada container pode ser dono do seu próprio ponto de montagem, bem como do seu sistema de arquivos raiz. Ele garante que um processo executado em um sistema de arquivos não consiga acessar outro sistema de arquivos montado por outro Mnt namespace.

    

 ## IPC namespace:  
Ele provê um System V IPC isolado, além de uma fila de mensagens POSIX própria.

  ## UTS namespace:  
Responsável por prover o isolamento do hostname, do nome de domínio, da versão do sistema operacional, entre outras informações do sistema.

   ## User namespace:  
   É o namespace mais recente adicionado ao Kernel Linux, disponível desde a versão `3.8`. Ele é responsável por manter o mapeamento de identificação de usuários em cada container.

## Referências

- [Docker Docs — O que é um container?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/) — introdução oficial ao funcionamento dos containers.
- [Linux Kernel — Control Groups v2](https://docs.kernel.org/admin-guide/cgroup-v2.html) — documenta o controle e a contabilização de recursos pelo kernel.
- [Linux manual pages — namespaces(7)](https://man7.org/linux/man-pages/man7/namespaces.7.html) — visão geral dos namespaces do Linux.
- [LINUXtips — Docker Essentials](https://linuxtips.io/treinamento/docker-essentials/) — curso utilizado como base dos meus estudos e destas anotações.
