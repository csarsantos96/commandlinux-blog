---
title: Entendendo Pods no Kubernetes de verdade
description: O que é um Pod por baixo do capô, por que ele existe e como namespaces do Linux tornam tudo isso possível.
date: 2026-07-01
category: KUBERNETES
tags: [pods, kubectl, containers, CKA]
---

Todo mundo que começa em Kubernetes ouve que "o Pod é a menor unidade de deploy". Mas o que isso significa na prática?

## O que é um Pod, de fato

Um Pod é um grupo de um ou mais containers que compartilham:

- O mesmo **network namespace** (mesmo IP, mesma interface)
- Os mesmos **volumes**
- O mesmo ciclo de vida

Ou seja: dois containers no mesmo Pod conversam via `localhost`. Isso é possível porque o kubelet cria um container de pausa (`pause`) que segura os namespaces, e os demais containers entram nesses namespaces.

## Criando um Pod na prática

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

Aplicando e inspecionando:

```bash
kubectl apply -f pod.yaml
kubectl get pods -o wide
kubectl describe pod nginx-demo
```

## Por que você quase nunca cria Pods diretamente

Pods são efêmeros. Se o node morre, o Pod morre junto e ninguém o recria. Por isso, no dia a dia usamos controladores como **Deployment** e **StatefulSet**, que garantem o estado desejado.

> Para o CKA: saiba criar Pods imperativamente com `kubectl run nginx --image=nginx --dry-run=client -o yaml` — economiza muito tempo de prova.

## Resumo

| Conceito | O que compartilha |
| --- | --- |
| Pod | rede, volumes, ciclo de vida |
| Container | filesystem próprio, processo próprio |

## Referências

- [Kubernetes — Pods](https://kubernetes.io/pt-br/docs/concepts/workloads/pods/) — documenta o modelo, a rede e o ciclo de vida dos Pods.
- [Kubernetes — Workloads](https://kubernetes.io/docs/concepts/workloads/) — apresenta os controladores utilizados para gerenciar Pods.
- [LINUXtips — PICK](https://linuxtips.io/pick/) — Programa Intensivo de Containers e Kubernetes utilizado como base dos meus estudos e destas anotações.
