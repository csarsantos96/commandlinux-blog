---
title: How containers work under the hood
description: >-
  Understand how Docker and the Linux kernel use cgroups and namespaces to
  isolate processes, network, users, filesystem, and resources within
  containers.
date: '2026-07-07'
category: DOCKER
tags:
  - docker
  - containers
  - linux
  - cgroups
  - namespaces
  - kernel
draft: false
language: en
translationOf: O-Que-e-containers
sourceHash: 0c09e76b1979cf378198c8ef462b6e86f51977234011378596982cc226f533a6
---
# **What is a Container?**  

A `Container` is a way to isolate processes and resources to run an application. It's a grouping of an application along with its dependencies, sharing the host operating system's kernel.  
  
  ```mermaid
flowchart LR
    subgraph FISICA["Physical Machine"]
        direction TB

        subgraph APPS_F["Applications"]
            direction LR
            F1["App 1"]
            F2["App 2"]
            F3["App 3"]
        end

        FOS["Operating System"]
        FHW["Server / Hardware"]

        F1 --> FOS
        F2 --> FOS
        F3 --> FOS
        FOS --> FHW
    end

    subgraph VMS["Virtual Machines"]
        direction TB

        subgraph VM_APPS["VMs"]
            direction LR
            VM1["VM 1<br/>App + OS"]
            VM2["VM 2<br/>App + OS"]
            VM3["VM 3<br/>App + OS"]
        end

        HYP["Hypervisor"]
        VOS["Operating System"]
        VHW["Server / Hardware"]

        VM1 --> HYP
        VM2 --> HYP
        VM3 --> HYP
        HYP --> VOS
        VOS --> VHW
    end

    subgraph CONTAINERS["Containers"]
        direction TB

        subgraph C_APPS["Isolated Applications"]
            direction LR
            C1["App 1"]
            C2["App 2"]
            C3["App 3"]
        end

        DOCKER["Docker Engine"]
        COS["Host Operating System"]
        CHW["Server / Hardware"]

        C1 --> DOCKER
        C2 --> DOCKER
        C3 --> DOCKER
        DOCKER --> COS
        COS --> CHW
    end

    FOS -->|Virtualization| HYP
    VOS -->|Containers| DOCKER  
```  
  
Another interesting point about using containers is portability. It doesn't matter what environment you created your container in. It can be run in any other environment that has Docker installed. But portability is just one part of what makes containers so useful. When multiple containers are running on the same machine, it's necessary to prevent one of them from consuming all available resources and harming the others.

This is where **`cgroups`** (*control groups*) come in. They are Linux kernel features responsible for controlling and accounting for resource usage by groups of processes, such as CPU, memory, disk I/O, and process count.

In practice, cgroups allow you to define limits for each container. This way, an application with an error or consumption spike won't use all the host's memory or processing, leaving other containers without resources.

Despite this, cgroups do not perform isolation between containers. Their function is to control and limit the amount of resources each process group can consume. The actual isolation is performed by namespaces, which ensure each container has its own view of the operating system.



While cgroups control **how much** of a resource a container can use, **`namespaces`** control **what it can see** within the system.

It is through namespaces that each container has its own view of processes, network, users, hostname, and filesystem, even while sharing the same Linux kernel with other containers.  
  
  ## Namespace:  
  Namespaces were added to the Linux kernel in version `2.6.24` and are what enable process isolation when using the **Docker**. They are responsible for ensuring each container has its own environment, meaning each container will have its own process tree, mount points, etc., preventing one container from interfering with another's execution.  
    
  ## PID namespace:  
  The PID namespace allows each container to have its own process identifiers. This means the container has a PID for a running process, and when you look for that process on the host machine, it will be found, but with a different identification, i.e., a different PID.  

  ## Net namespace:  
  The Net namespace allows each container to have its own network interface and its own ports. To enable communication between containers, a pair of virtual interfaces is created: one responsible for the container's interface (typically named `eth0`) and another responsible for an interface on the host, usually called `veth` (`veth` + a random identifier). These two interfaces are linked via the Docker bridge on the host, allowing communication between containers through packet routing.  

  ## Mnt namespace:  
  It's an evolution of `chroot`. With the Mnt namespace, each container can own its own mount point, as well as its root filesystem. It ensures that a process executing in one filesystem cannot access another filesystem mounted by a different Mnt namespace.

    

 ## IPC namespace:  
It provides isolated System V IPC, in addition to its own POSIX message queue.

  ## UTS namespace:  
Responsible for providing isolation for hostname, domain name, operating system version, among other system information.

   ## User namespace:  
   It is the most recent namespace added to the Linux Kernel, available since version `3.8`. It is responsible for maintaining user ID mapping in each container.
