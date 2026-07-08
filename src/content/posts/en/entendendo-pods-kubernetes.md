---
title: Truly Understanding Kubernetes Pods
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
sourceHash: a24b6b6063e555c63fece2a6ae126572105e82c78ba630a6fed8101109f4c904
---
Everyone who starts with Kubernetes hears that "the Pod is the smallest unit of deployment." But what does that mean in practice?

## What a Pod Actually Is

A Pod is a group of one or more containers that share:

- The same **network namespace** (same IP, same interface)
- The same **volumes**
- The same lifecycle

In other words: two containers in the same Pod communicate via `localhost`. This is possible because the kubelet creates a pause container (`pause`) that holds the namespaces, and the other containers join these namespaces.

## Creating a Pod in Practice

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

## Why You Almost Never Create Pods Directly

Pods are ephemeral. If the node dies, the Pod dies with it, and no one recreates it. That's why, in daily operations, we use controllers like **Deployment** and **StatefulSet**, which ensure the desired state.

> For the CKA: know how to create Pods imperatively with `kubectl run nginx --image=nginx --dry-run=client -o yaml` — saves a lot of exam time.

## Summary

| Concept | What it shares |
| --- | --- |
| Pod | network, volumes, lifecycle |
| Container | its own filesystem, its own process |
