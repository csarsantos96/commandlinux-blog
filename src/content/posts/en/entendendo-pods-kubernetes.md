---
title: Truly Understanding Pods in Kubernetes
description: >-
  What a Pod is under the hood, why it exists, and how Linux namespaces make it
  all possible.
date: '2026-07-01'
category: KUBERNETES
tags:
  - pods
  - kubectl
  - containers
  - CKA
draft: false
language: en
translationOf: entendendo-pods-kubernetes
sourceHash: 8b4799dbb19972e86aac5a5875eddc2186419da4186c1c3ef5f10f0dfb4fe8b2
---
Everyone who starts with Kubernetes hears that "the Pod is the smallest unit of deployment". But what does that mean in practice?

## What a Pod actually is

A Pod is a group of one or more containers that share:

- The same **network namespace** (same IP, same interface)
- The same **volumes**
- The same lifecycle

In other words: two containers in the same Pod communicate via `localhost`. This is possible because the kubelet creates a pause container (`pause`) that holds the namespaces, and the other containers join these namespaces.

## Creating a Pod in practice

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-demo
  labels:
    app: web
spec:
  containers:
    - name: nginx
      image: nginx:1.27
      ports:
        - containerPort: 80
```

Applying and inspecting:

```bash
kubectl apply -f pod.yaml
kubectl get pods -o wide
kubectl describe pod nginx-demo
```

## Why you almost never create Pods directly

Pods are ephemeral. If the node dies, the Pod dies with it, and no one recreates it. That's why, in daily operations, we use controllers like **Deployment** and **StatefulSet**, which ensure the desired state.

> For the CKA: know how to create Pods imperatively with `kubectl run nginx --image=nginx --dry-run=client -o yaml` — it saves a lot of exam time.

## Summary

| Concept | What it shares |
| --- | --- |
| Pod | network, volumes, lifecycle |
| Container | own filesystem, own process |

## References

- [Kubernetes — Pods](https://kubernetes.io/pt-br/docs/concepts/workloads/pods/) — documents the Pod model, networking, and lifecycle.
- [Kubernetes — Workloads](https://kubernetes.io/docs/concepts/workloads/) — presents the controllers used to manage Pods.
- [LINUXtips — PICK](https://linuxtips.io/pick/) — Intensive Containers and Kubernetes Program used as the basis for my studies and these notes.
