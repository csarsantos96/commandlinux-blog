---
title: Understanding Control Plane and Workers
description: >-
  What a Pod is under the hood, why it exists, and how Linux namespaces make it
  all possible.
date: '2026-07-07'
category: KUBERNETES
tags:
  - pods
  - kubectl
  - containers
  - CKA
  - Control Plane
  - Workers
draft: false
language: en
translationOf: Entendendo-Control-Plane
sourceHash: 731c2a8e5574d2917ac30c62bc9ddbdaeddabc713163df38c285cd8cce875c6f
---
In `Kubernetes`, the cluster is basically divided into two parts:

### **Control Plane** = The cluster's brain
### **Workers** = Machines that do the heavy lifting.

<br>


# **Control Plane**
The Control Plane decides what happens in the clusters. It doesn't usually run the application directly, but it manages the entire environment.

### <center> **Basic Kubernetes Architecture**</center>

```mermaid
flowchart LR

    subgraph CP["Control Plane - Node"]
        direction TB

        ETCD[("etcd<br/>Estado do cluster")]
        API["kube-apiserver"]
        SCHED["kube-scheduler"]
        CM["kube-controller-manager"]

        API <--> ETCD
        SCHED <--> API
        CM <--> API
    end

    subgraph W1["Worker Node"]
        direction TB

        KUBELET["kubelet"]
        PROXY["kube-proxy"]
    end

    API <--> KUBELET
```

## **etcd**
It stores all information. The entire real state of the `cluster`. It only communicates with the `kube API SERVER`.

## **kube API SERVER**
Only it has default permission to communicate with etcd. Its function is to retrieve the status of the `cluster` as a whole. It will communicate with everyone. All `cluster` communication happens through the `kube API SERVER`.

## **kube scheduler**
It is responsible for managing where each of the containers will run; it is the controller responsible for new containers, and it knows the capacity of the nodes.

## **kube controller manager**
It is the manager of all controllers; it ensures the state of the `cluster`. It is the `cluster`'s controller.
  
<br>


# **Workers**

## **kubelet**
It is the Kubernetes agent within the node, and every `Kubernetes` node will have a `kubelet`. It checks if everything is okay and communicates with the `kube APISERVER`, receiving the Pod specifications for that node and reporting the status back.

## **kube proxy**
Every node will have a `kube proxy`. It enables communication between `pods` and the outside world; it observes cluster resources and configures network rules on the node.

<br>


# **Ports Used by Kubernetes Components**


## Ports Used by Kubernetes Components

| Component | Default Port | Protocol |
|---|---:|---|
| kube-apiserver | 6443 | TCP |
| etcd | 2379–2380 | TCP |
| kube-scheduler | 10259 | TCP |
| kube-controller-manager | 10257 | TCP |
| kubelet | 10250 | TCP |
| kube-proxy | 10256 | TCP |

## Application Exposure Ports

| Resource | Default Port | Protocol |
|---|---:|---|
| NodePort Service | 30000–32767 | TCP or UDP |

<br>
