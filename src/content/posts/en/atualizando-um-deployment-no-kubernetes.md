---
title: 'Updating a Kubernetes Deployment: How to Apply Changes Safely'
description: >-
  Learn how to update a Kubernetes Deployment, understand the role of `kubectl
  apply`, and how the cluster automatically detects and applies changes.
date: '2026-07-30'
category: Kubernetes
tags:
  - kubernetes
  - deployment
  - kubectl
  - yaml
  - update
  - rollingupdate
  - devops
draft: false
language: en
translationOf: atualizando-um-deployment-no-kubernetes
sourceHash: 5c2b2ee351b64ef68146b12bc9c8c923e6633f5eb3032e1b1029ab54ebda5ab0
series: Fundamentals of Kubernetes Deployments
part: 4
totalParts: 8
---
# Updating a Kubernetes Deployment: How to Apply Changes Safely

> Many people believe that updating a Deployment means deleting everything and recreating it. In most cases, this is wrong.

One of the biggest advantages of using a **Deployment** is precisely the ease with which applications can be updated.

You change the manifest.

Apply it again.

And Kubernetes identifies exactly what has changed.

Without needing to manually remove the Deployment.

In this article, we'll understand how this process works and which commands are part of it.



# How is a Deployment Updated?

Kubernetes works declaratively.

You don't tell it **how** to update.

You tell it **how you want the Deployment to be**.

After that, Kubernetes compares the current state with the submitted manifest.

If there's any difference, it only performs the necessary changes.

The flow is similar to the following:

```text
deployment.yaml
       │
       ▼
kubectl apply
       │
       ▼
Kubernetes compares

Current state
      X
Desired state
       │
       ▼
Applies only the changes
```



# Changing a Deployment

Imagine a Deployment already exists.

Now we want to add a Namespace.

Simply modify the manifest.

Before:

```yaml
metadata:
  name: nginx-deployment
```

After:

```yaml
metadata:
  name: nginx-deployment
  namespace: giropops
```

We could also change:

- number of replicas;
- container image;
- resources;
- labels;
- strategy.

Then just apply it again.



# Applying the Changes

After modifying the manifest:

```bash
kubectl apply -f deployment.yaml
```

Explanation:

- `apply` → creates or updates resources.
- `-f` → uses a YAML file.

Expected output:

```text
deployment.apps/nginx-deployment configured
```

Notice that Kubernetes now reports **configured**.

This means the Deployment already existed and was merely updated.



# The Most Common Error with Namespaces

During your studies, it's very common to add a Namespace to the manifest.

```yaml
metadata:
  namespace: giropops
```

Then execute:

```bash
kubectl apply -f deployment.yaml
```

And receive the error:

```text
Error from server (NotFound):

namespaces "giropops" not found
```

The reason is simple.

The Namespace does not exist yet.



# Creating a Namespace

First, we create the Namespace.

```bash
kubectl create namespace giropops
```

Expected output:

```text
namespace/giropops created
```

Then we can verify.

```bash
kubectl get namespaces
```

Expected output:

```text
NAME
default
kube-system
giropops
```

Now the Deployment can be created normally.



# Generating a Namespace's YAML

Just as with Deployments, we can also generate the manifest.

```bash
kubectl create namespace giropops \
    --dry-run=client \
    -o yaml
```

Expected output:

```yaml
apiVersion: v1
kind: Namespace

metadata:
  name: giropops
```

Or save directly to a file.

```bash
kubectl create namespace giropops \
    --dry-run=client \
    -o yaml > namespace.yaml
```

Then:

```bash
kubectl apply -f namespace.yaml
```

This approach facilitates versioning in Git.



# Querying Resources within the Namespace

Once the Deployment exists within the Namespace, we need to specify this in our commands.

For example.

Instead of:

```bash
kubectl get deployments
```

We use:

```bash
kubectl get deployments -n giropops
```

Or:

```bash
kubectl get deploy -n giropops
```

Explanation:

- `-n` → abbreviation for `--namespace`.
- `giropops` → Queried Namespace.

Expected output:

```text
NAME               READY
nginx-deployment   3/3
```



# Updating the Application Image

One of the most common changes is swapping the image.

Before:

```yaml
containers:
  - name: nginx
    image: nginx:1.30.4
```

After:

```yaml
containers:
  - name: nginx
    image: nginx:1.31.0
```

After saving the file:

```bash
kubectl apply -f deployment.yaml
```

Kubernetes will automatically detect this change.

In upcoming articles, we'll see exactly how this update happens internally.



# How Does Kubernetes Identify Changes?

Every time we execute:

```bash
kubectl apply
```

Kubernetes compares the received manifest with the existing Deployment.

We can imagine this process in the following way.

```text
Old Manifest
        │
        ▼
New Manifest
        │
        ▼
Comparison
        │
        ▼
Apply only differences
```

This avoids unnecessary recreations.

It also reduces downtime.



# Summary

The complete update flow is as follows.

```text
Edit deployment.yaml
         │
         ▼
kubectl apply -f deployment.yaml
         │
         ▼
Kubernetes compares
         │
         ▼
Updates only what's necessary
```

It is precisely this characteristic that makes Deployment such a powerful resource.



# Conclusion

Updating a Deployment typically means simply altering the manifest and reapplying it.

Kubernetes automatically identifies the differences and performs the necessary modifications.

We also saw how to work with Namespaces and how to query resources within them.

In the next article in this series, we will study the default strategy used by Deployments to update applications: **RollingUpdate**, understanding how the **maxSurge** and **maxUnavailable** parameters work and why they allow applications to be updated with virtually no downtime.



## References

- [Kubernetes Documentation – Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Documentation – Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
- [Kubernetes Documentation – Declarative Object Management](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/)
- [LINUXtips – Demystifying Kubernetes](https://linuxtips.io/)
