---
title: 'Recreate Strategy in Kubernetes: When Tearing Down All Pods Makes Sense'
description: >-
  Understand how the Recreate strategy works, when to use it, and its
  differences compared to RollingUpdate.
date: '2026-07-30'
category: Kubernetes
tags:
  - kubernetes
  - deployment
  - recreate
  - rollingupdate
  - rollout
  - strategy
  - devops
draft: false
language: en
translationOf: estrategia-recreate-no-kubernetes
sourceHash: 36d975c79cb9f8b00e565327457a66dc18694af1c6fb3a5df6e080a1e714928d
series: Fundamentals of Deployments in Kubernetes
part: 6
totalParts: 8
---
# Recreate Strategy in Kubernetes: When Tearing Down All Pods Makes Sense

> "RollingUpdate is always the best strategy." Most of the time, yes. But there are scenarios where using **Recreate** is the safer choice.

In previous articles, we saw how **RollingUpdate** updates an application without completely interrupting the service.

However, not all applications support two versions running simultaneously.

In such cases, there is another strategy called **Recreate**.

In this article, we will understand how it works, when to use it, and what its advantages and disadvantages are.

---

# What is the Recreate strategy?

**Recreate** is an update strategy available in Deployments.

Unlike RollingUpdate, it does not create new Pods while the old ones are still running.

The process happens in two stages.

1.  All old Pods are removed.
2.  Only then are the new Pods created.

Visually:

```text
Version 1

Pod 1
Pod 2
Pod 3
Pod 4

        │

All Pods are removed

        ▼

No Pods available

        ▼

Pod 1 (v2)
Pod 2 (v2)
Pod 3 (v2)
Pod 4 (v2)
```

During this interval, the application is unavailable.

---

# Comparing with RollingUpdate

The difference between the two strategies is very clear.

## RollingUpdate

```text
Old Pods

↓

Old Pods + New Pods

↓

New Pods
```

At least part of the application is always available.

---

## Recreate

```text
Old Pods

↓

No Pods

↓

New Pods
```

There is a temporary service interruption.

---

# Configuring the strategy

Inside the Deployment, simply change the `strategy` field.

Before:

```yaml
strategy:
  type: RollingUpdate
```

After:

```yaml
strategy:
  type: Recreate
```

Notice that the `rollingUpdate` block does not exist.

This happens because the `maxSurge` and `maxUnavailable` parameters belong exclusively to RollingUpdate.

---

# Applying the alteration

After modifying the manifest.

```bash
kubectl apply -f deployment.yaml
```

Expected result:

```text
deployment.apps/nginx-deployment configured
```

The next rollout will use the Recreate strategy.

---

# What happens during the update?

Imagine a Deployment with four Pods.

```text
Pod A
Pod B
Pod C
Pod D
```

When changing the application image.

```yaml
image: nginx:1.31.0
```

And executing:

```bash
kubectl apply -f deployment.yaml
```

Kubernetes will do the following.

```text
Remove

Pod A
Pod B
Pod C
Pod D
```

Then:

```text
Create

Pod A (new)
Pod B (new)
Pod C (new)
Pod D (new)
```

There is no coexistence between the two versions.

---

# Monitoring the update

During the update, we can observe the Pods.

```bash
kubectl get pods -n giropops
```

Expected result:

```text
NAME    READY

No resources found.
```

After a few seconds.

```text
NAME                        READY

nginx-deployment-xxxxx      1/1

nginx-deployment-yyyyy      1/1

nginx-deployment-zzzzz      1/1
```

It is precisely this temporary absence of Pods that characterizes Recreate.

---

# When to Use Recreate?

Despite causing unavailability, this strategy is still widely used.

Especially when it's not allowed to run two versions simultaneously.

Some examples.

-   Legacy applications.
-   Systems that block concurrent access.
-   Incompatible application versions.
-   Updates that completely modify shared structures.
-   Software that uses exclusive storage.

---

# When to Avoid Recreate?

In most modern web applications.

REST APIs.

Microservices.

Scalable applications.

Distributed systems.

In these scenarios, RollingUpdate usually offers a much better experience.

---

# RollingUpdate x Recreate

| Characteristic                | RollingUpdate | Recreate          |
|:------------------------------|:--------------|:------------------|
| Keeps the application available | ✅             | ❌                 |
| Old and new Pods coexist      | ✅             | ❌                 |
| Gradual update                | ✅             | ❌                 |
| Downtime occurs               | No            | Yes               |
| Recommended for production    | Yes           | Only when necessary |

---

# How to Check the Strategy Used?

We can inspect the Deployment.

```bash
kubectl describe deployment \
    nginx-deployment \
    -n giropops
```

Or:

```bash
kubectl get deployment \
    nginx-deployment \
    -o yaml
```

In the output, we will find:

```yaml
strategy:
  type: Recreate
```

Or.

```yaml
strategy:
  type: RollingUpdate
```

---

# Can I Change Strategy Later?

Yes.

The Deployment can be changed at any time.

For example.

Before.

```yaml
strategy:
  type: Recreate
```

After.

```yaml
strategy:
  type: RollingUpdate

  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

Just apply again.

```bash
kubectl apply -f deployment.yaml
```

The new strategy will be used in subsequent updates.

---

# Summary

```text
Deployment

│

├── RollingUpdate
│      │
│      ├── Gradual update
│      └── High availability
│
└── Recreate
       │
       ├── Removes all Pods
       ├── Creates new Pods
       └── Downtime occurs
```

---

# Conclusion

**Recreate** is a simple and efficient strategy for applications that do not allow two versions to run simultaneously.

However, it sacrifices availability during the update.

Therefore, in modern applications, **RollingUpdate** is usually the recommended strategy.

Knowing both is important to choose the correct approach in each scenario.

In the next article in the series, we will study the **Revision History** of Deployments, understand how Kubernetes records each update, and learn how to consult this history before performing a rollback.

---

## References

- [Kubernetes Documentation – Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Documentation – Deployment Strategy](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy)
- [Kubernetes Documentation – Updating a Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#updating-a-deployment)
- [LINUXtips – Descomplicando Kubernetes](https://linuxtips.io/)
