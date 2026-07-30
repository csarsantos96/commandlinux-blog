---
title: >-
  Understanding Kubernetes Deployments: the resource that keeps your application
  always available
description: >-
  Understand what a Deployment is, how it works, and why it's the recommended
  resource for running applications in Kubernetes.
date: '2026-07-30'
category: Kubernetes
tags:
  - kubernetes
  - deployment
  - pods
  - replicaset
  - kubectl
  - yaml
  - devops
draft: false
language: en
translationOf: entendendo-deployments
sourceHash: a01dcb5e8a36e0da523f988908cadaecd6eead3754329986189c7024d1df40d8
series: Kubernetes Deployment Fundamentals
part: 1
totalParts: 8
---
# Understanding Kubernetes Deployments: the resource that keeps your application always available

> Many people answer that a **Deployment** is just a resource for creating Pods. But that answer is incomplete.

When we start studying Kubernetes, we usually create Pods directly to understand how everything works.

This is great for learning.

But this isn't how applications are typically run in real-world environments.

In practice, we almost always use **Deployments**.

In this article, we will understand:

- what a Deployment is;
- why it exists;
- how it controls Pods;
- the relationship between Deployment, ReplicaSet, and Pods;
- how to create your first Deployment.



# What is a Deployment?

A **Deployment** is a **Kubernetes** resource responsible for automatically creating, updating, and managing Pods.

Instead of manually creating Pods, you inform Kubernetes what the desired state of the application is.

After that, the Deployment works to maintain that state.

For example.

Imagine that your application should have **3 Pods** running the NGINX image.

You don't need to create the three Pods manually.

Just create a Deployment stating that you want three replicas.

Kubernetes will do everything else.



# The Problem with Creating Pods Directly

A Pod can die.

It can be removed.

It can fail during an update.

When we create a Pod directly, we are responsible for recreating it.

In other words, there's no automatic management.

The Deployment, on the other hand, constantly monitors the application's state.

If a Pod disappears, it will be recreated automatically.



# How Does a Deployment Work Internally?

Although it might seem like the Deployment directly controls the Pods, this isn't the case.

In fact, there's another resource between them.

```text
Deployment
      │
      ▼
 ReplicaSet
      │
      ▼
    Pods
```

The flow works as follows.

- The Deployment manages a ReplicaSet.
- The ReplicaSet ensures the correct number of Pods.
- Pods run the application containers.

This separation allows Kubernetes to perform updates, rollbacks, and scaling without interrupting application management.



# A Simple Example

Imagine we want to run three NGINX Pods.

```text
Desired Goal

3 Pods running nginx
```

We create a Deployment specifying this.

If one of the Pods dies, the ReplicaSet will immediately notice.

```text
Before

Pod 1 ✅
Pod 2 ✅
Pod 3 ❌
```

The ReplicaSet automatically creates another one.

```text
After

Pod 1 ✅
Pod 2 ✅
Pod 3 ✅
```

Notice that the Deployment continues to maintain exactly the state we defined.



# Creating a Deployment

A Deployment is defined through a YAML manifest.

A simple example would be:

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: nginx-deployment

spec:
  replicas: 3

  selector:
    matchLabels:
      app: nginx

  template:
    metadata:
      labels:
        app: nginx

    spec:
      containers:
        - name: nginx
          image: nginx:latest
```

Even though it's small, this manifest is already sufficient to create an application managed by Kubernetes.

In the next articles of the series, we will detail each of these sections.



# Applying the Manifest

After saving the file as `deployment.yaml`, simply execute:

```bash
kubectl apply -f deployment.yaml
```

Explaining the command:

- `kubectl` → Kubernetes client.
- `apply` → creates or updates resources.
- `-f` → indicates that a file will be used.
- `deployment.yaml` → Deployment manifest.

Expected output:

```text
deployment.apps/nginx-deployment created
```



# Verifying Created Resources

First, we can list the Deployments.

```bash
kubectl get deployments
```

Expected output:

```text
NAME               READY   UP-TO-DATE   AVAILABLE
nginx-deployment   3/3     3            3
```

Then we can check the ReplicaSet.

```bash
kubectl get replicasets
```

Expected output:

```text
NAME                          DESIRED   CURRENT   READY
nginx-deployment-xxxxxxxxxx   3         3         3
```

Finally, we verify the Pods.

```bash
kubectl get pods
```

Expected output:

```text
NAME                                READY
nginx-deployment-xxxxxxxxxx-abc12   1/1
nginx-deployment-xxxxxxxxxx-def34   1/1
nginx-deployment-xxxxxxxxxx-ghi56   1/1
```

Notice that the Deployment automatically created a ReplicaSet, which in turn created the Pods.



# Understanding the Deployment Output

When executing:

```bash
kubectl get deployments
```

Some columns are displayed.

| Column | Meaning |
|--------|-------------|
| READY | How many Pods are ready |
| UP-TO-DATE | How many Pods are using the current version |
| AVAILABLE | How many Pods are available to receive traffic |
| AGE | Time since Deployment creation |

These information helps to quickly monitor the application's health.


# Deployment vs. Pod

This is a very common question.

| Pod | Deployment |
|------|------------|
| Runs one or more containers | Manages multiple Pods |
| Does not perform rollback | Allows rollback |
| Does not perform gradual updates | Performs Rolling Update |
| Does not automatically recreate Pods | Maintains the application in the desired state |
| Suitable for testing | Suitable for applications |

A simple analogy.

```text
Pod
↓

Employee
```

```text
Deployment
↓

Manager
```

The employee performs the work.

The manager ensures that someone is always performing the work.

If an employee is absent, another takes their place.

This is precisely the idea that the Deployment applies to Pods.



# Conclusion

The Deployment is one of the most important resources in Kubernetes.

It simplifies application management and allows the cluster to automatically maintain the desired state.

Besides creating Pods, it is also responsible for enabling updates, scalability, rollbacks, and high availability.

A good understanding of this resource greatly facilitates learning the next Kubernetes concepts.

In the next article of the series, we will delve into the structure of a Deployment and understand the role of the **ReplicaSet**, **selector**, and **template**, as well as explain why these fields need to be correctly configured.



## References

- [Kubernetes Documentation — Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) — official documentation on Deployments.
- [Kubernetes Documentation — ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/) — how ReplicaSet works.
- [Kubernetes Documentation — Deploy a Stateless Application](https://kubernetes.io/docs/tasks/run-application/run-stateless-application-deployment/) — official Deployment example.
- [LINUXtips — Descomplicando Kubernetes](https://linuxtips.io/) — training used as a basis for the studies in this series.
