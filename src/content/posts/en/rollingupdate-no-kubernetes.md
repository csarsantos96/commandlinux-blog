---
title: 'RollingUpdate in Kubernetes: Updating Applications Without Downtime'
description: >-
  Understand how the RollingUpdate strategy works and learn to configure
  maxSurge and maxUnavailable to securely update applications.
date: '2026-07-30'
category: Kubernetes
tags:
  - kubernetes
  - deployment
  - rollingupdate
  - maxsurge
  - maxunavailable
  - rollout
  - devops
draft: false
language: en
translationOf: rollingupdate-no-kubernetes
sourceHash: 571efce90f525bd77e154877a870e93a2aed4a4759a6e307f42651abf91e6ce3
series: Fundamentals of Deployments in Kubernetes
part: 5
totalParts: 8
---
# RollingUpdate in Kubernetes: Updating Applications Without Downtime

> How does Kubernetes manage to update an application without taking down all Pods at once?

This is one of the biggest advantages of using a **Deployment**.

When we change an image, add resources, or modify any manifest configuration, Kubernetes doesn't remove all Pods immediately.

Instead, it performs a gradual update.

This strategy is called **RollingUpdate**.

In this article, we will understand how it works and the role of the **maxSurge** and **maxUnavailable** parameters.



# What is RollingUpdate?

**RollingUpdate** is the default strategy used by Deployments.

Its goal is to gradually replace old Pods with new ones.

Thus, the application remains available for virtually the entire update.

Visually, the process happens like this.

```text
Before

Pod 1 (v1)
Pod 2 (v1)
Pod 3 (v1)
Pod 4 (v1)

        │

RollingUpdate

        ▼

Pod 1 (v2)
Pod 2 (v2)
Pod 3 (v2)
Pod 4 (v2)
```

Instead of removing all old Pods, Kubernetes performs this swap gradually.



# Configuring the Strategy

Inside the Deployment, we find the `strategy` field.

```yaml
strategy:
  type: RollingUpdate

  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 2
```

In this snippet, we are telling Kubernetes how we want the update to be performed.

The two most important parameters are:

- `maxSurge`
- `maxUnavailable`

Let's understand each of them.



# What is maxSurge?

**maxSurge** defines how many extra Pods can temporarily exist during an update.

Imagine a Deployment with:

```text
10 Pods
```

If we configure:

```yaml
maxSurge: 1
```

During the update, Kubernetes can create:

```text
10 old Pods
+
1 new Pod
=
11 Pods
```

These extra Pods exist only during the RollingUpdate.

After the update, the Deployment returns to the desired quantity.



# What is maxUnavailable?

**maxUnavailable** defines how many Pods can be unavailable during the update.

For example.

```yaml
maxUnavailable: 2
```

With a Deployment containing ten replicas.

```text
10 Pods
```

Kubernetes can remove up to two Pods before creating new ones.

Thus, we will have:

```text
8 available Pods

2 Pods being replaced
```

In other words.

Even during the update, at least eight Pods will continue to respond to requests.



# Understanding the Process Step by Step

Let's imagine again a Deployment with ten replicas.

```text
Initial state

10 old
0 new
```

With:

```yaml
maxSurge: 1
maxUnavailable: 2
```

Kubernetes starts by creating a new Pod.

```text
10 old

1 new

Total = 11 Pods
```

Now it can remove up to two old Pods.

```text
8 old

1 new

Total = 9 Pods
```

As two slots opened up, it creates two more new Pods.

```text
8 old

3 new

Total = 11 Pods
```

Then it removes more old Pods.

Creates new ones again.

And continues repeating this process until all are using the new version.



# Visualizing the RollingUpdate

The behavior can be represented like this.

```text
10 old

↓

11 Pods
(10 old + 1 new)

↓

9 Pods
(8 old + 1 new)

↓

11 Pods
(8 old + 3 new)

↓

...

↓

10 new Pods
```

This update happens automatically.

In most cases, users don't even notice that the application has been updated.



# Applying an Update

After changing the manifest.

```yaml
image: nginx:1.31.0
```

We apply it again.

```bash
kubectl apply -f deployment.yaml
```

Expected result:

```text
deployment.apps/nginx-deployment configured
```

At this point, the RollingUpdate begins.



# Monitoring the Update

While the Deployment is being updated, we can observe the Pods.

```bash
kubectl get pods -n giropops
```

Expected result:

```text
NAME                            READY

nginx-xxxxx                     Running

nginx-yyyyy                     Terminating

nginx-zzzzz                     Running
```

You will see old Pods being terminated while new Pods appear.



# Monitoring the Rollout

There is a specific command to monitor the update's progress.

```bash
kubectl rollout status deployment \
    -n giropops \
    nginx-deployment
```

Explaining:

- `rollout status` → monitors the update.
- `deployment` → resource type.
- `-n giropops` → Namespace.
- `nginx-deployment` → Deployment name.

Expected result:

```text
Waiting for deployment...

deployment "nginx-deployment" successfully rolled out
```

This command is widely used during production deployments.



# When to Change maxSurge?

A higher value makes the update finish faster.

However.

It also consumes more cluster resources.

Example.

```yaml
maxSurge: 3
```

In this case, Kubernetes can create up to three extra Pods during the process.

This reduces the update time.

But it requires more CPU and memory.



# When to Change maxUnavailable?

This parameter controls the minimum availability of the application.

The higher this number.

The faster the update tends to be.

On the other hand.

Fewer Pods will remain serving users.

In critical applications, this value is usually low.



# Summary

```text
RollingUpdate

│

├── Updates gradually

├── Avoids downtime

├── Creates new Pods

├── Removes old Pods

└── Keeps the application available
```

The two parameters work as follows.

| Parameter | Function |
|----------|----------|
| `maxSurge` | Maximum number of extra Pods during the update |
| `maxUnavailable` | Maximum number of unavailable Pods during the update |



# Conclusion

RollingUpdate is one of the most important features of Deployments.

It allows applications to be updated practically without interrupting the service.

By correctly combining **maxSurge** and **maxUnavailable**, we can control the balance between update speed and application availability.

In the next article, we will learn about the **Recreate** strategy, understand how it works, and discover in which scenarios it still makes sense, even though it causes a period of downtime.



## References

- [Kubernetes Documentation – Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Documentation – Rolling Update](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/)
- [Kubernetes Documentation – Update a Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#updating-a-deployment)
- [LINUXtips – Descomplicando Kubernetes](https://linuxtips.io/)
