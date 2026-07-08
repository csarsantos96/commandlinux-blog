---
title: How containers work under the hood
description: >-
  Understand how Docker and the Linux kernel use cgroups and namespaces to
  isolate processes, network, users, filesystems, and resources within
  containers.
date: '2026-01-15'
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
sourceHash: 7eb8b94fe5c8da7b14568a4604cae3cfd3bed06275ea4e4c3ba35bcf4c21cf4d
---
# **What is a Container?**

A `Container` is a way to isolate processes and resources to run an application. It's a grouping of an application along with its dependencies, which share the host operating system's kernel.

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

Another interesting point in using containers is portability. It doesn't matter in which environment you created your container. It can be run in any other environment that has Docker installed. But portability is only one part of what makes containers so useful. When multiple containers are running on the same machine, it's necessary to prevent one of them from consuming all available resources and harming the others.

This is where **`cgroups`** (*control groups*) come in. They are Linux kernel features responsible for controlling and accounting for resource usage by process groups, such as CPU, memory, disk I/O, and the number of processes.

In practice, cgroups allow you to define limits for each container. This way, an application with an error or consumption peak doesn't use all the host's memory or processing, leaving other containers without resources.

Despite this, cgroups do not perform isolation between containers. Their function is to control and limit the amount of resources each process group can consume. The actual isolation is carried out by namespaces, which ensure each container has its own view of the operating system.

While cgroups control **how much** resource a container can use, **`namespaces`** control **what it can see** in the system.

It is through namespaces that each container has its own view of processes, network, users, hostname, and filesystem, even while sharing the same Linux kernel with other containers.

## Namespace:
Namespaces were added to the Linux kernel in version `2.6.24`, and they are what enable process isolation when we are using **Docker**. They are responsible for ensuring that each container has its own environment. That is, each container will have its own process tree, mount points, etc., preventing one container from interfering with the execution of another.

## PID namespace:
The PID namespace allows each container to have its own process identifiers. This means the container has a PID for a running process, and when you look for that process on the host machine, it will be found, but with a different identification, i.e., with a different PID.

## Net namespace:
The Net namespace allows each container to have its own network interface and its own ports. For communication between containers to be possible, a pair of virtual interfaces is created: one responsible for the container's interface (normally using the name `eth0`) and another responsible for an interface on the host, usually called `veth` (`veth` + a random identifier). These two interfaces are linked via the Docker bridge on the host, allowing communication between containers through packet routing.

## Mnt namespace:
It's the evolution of `chroot`. With the Mnt namespace, each container can own its own mount point, as well as its root filesystem. It ensures that a process executed in one filesystem cannot access another filesystem mounted by a different Mnt namespace.

## IPC namespace:
It provides isolated System V IPC, in addition to its own POSIX message queue.

## UTS namespace:
Responsible for providing isolation of the hostname, domain name, operating system version, among other system information.

## User namespace:
It is the most recent namespace added to the Linux Kernel, available since version `3.8`. It is responsible for maintaining the mapping of user IDs in each container.
