---
title: 'Anatomy of a Deployment: understanding selector, template, and ReplicaSet'
description: >-
  Understand how a Deployment is structured and discover the role of selector,
  template, and ReplicaSet in creating and managing Pods.
date: '2026-07-30'
category: Kubernetes
tags:
  - kubernetes
  - deployment
  - replicaset
  - selector
  - labels
  - yaml
  - pods
  - devops
draft: false
language: en
translationOf: criando-deployment-atravez-do-manifesto
sourceHash: ce975ba67b9f38ecc710828f4400003c168495bbebc8066d254cf90cbfafbced
series: Kubernetes Deployment Fundamentals
part: 2
totalParts: 8
---
# Anatomy of a Deployment: understanding selector, template, and ReplicaSet
> Many people copy a Deployment manifest from the internet, and it just works. But do you really know why each field exists?

In the previous article, we understood what a **Deployment** is and how it maintains the application in the desired state.

Now is the time to open that manifest and understand how it works internally.

In this article, we will detail the most important fields of the Deployment and understand why they need to be correctly configured.



# How Does a Deployment Find Its Pods?

When a Deployment is created, it needs to know exactly which Pods belong to that application.

For this, there is the **selector** field.

The selector acts as a filter.

It looks for Pods that have a specific Label.

Without this mechanism, the Deployment would not know which Pods it should control.



# The Role of Labels

**Labels** are key-value pairs added to Kubernetes resources.

Example:

```yaml
labels:
  app: nginx-deployment
```

In this example, any resource that has the Label:

```text
app=nginx-deployment
```

can be located by the Deployment.

This is precisely what makes management possible.



# Understanding the Selector

Inside the manifest, we find:

```yaml
selector:
  matchLabels:
    app: nginx-deployment
```

The meaning is simple.

```text
"Kubernetes,
I want to control all Pods
that have:

app=nginx-deployment"
```

Whenever a Pod has this Label, it will be considered part of the Deployment.



# The Pod Template

Another extremely important field is the **template**.

It contains the "mold" used to create new Pods.

```yaml
template:
  metadata:
    labels:
      app: nginx-deployment

  spec:
    containers:
      - name: nginx
        image: nginx:1.30.4
```

Think of the template as a factory.

Every time a new Pod needs to be created, the ReplicaSet will use this model.



# The Relationship Between Selector and Template

These two fields work together.

```text
Deployment
     │
     │ creates
     ▼
ReplicaSet
     │
     │ uses the template
     ▼
New Pod
     │
     │ receives Labels
     ▼
app=nginx-deployment
     ▲
     │
selector finds the Pod
```

This is precisely why the template's Labels must be compatible with the selector.

Otherwise, the Deployment will not be able to locate the Pods it created itself.



# Complete Deployment Structure

Now that we know each part, the manifest starts to make much more sense.

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: nginx-deployment

spec:
  replicas: 3

  selector:
    matchLabels:
      app: nginx-deployment

  template:
    metadata:
      labels:
        app: nginx-deployment

    spec:
      containers:
        - name: nginx
          image: nginx:1.30.4
```

Note that the value used in `matchLabels` is exactly the same as that used within the template.

This match is mandatory.



# Adding Resource Limits

The template also defines how containers will be executed.

We can, for example, define Requests and Limits.

```yaml
containers:
  - name: nginx
    image: nginx:1.30.4

    resources:
      limits:
        cpu: "800m"
        memory: "256Mi"

      requests:
        cpu: "300m"
        memory: "64Mi"
```

Thus, all Pods created by this Deployment will be born with these configurations.



# Applying the Deployment

After creating or modifying the manifest, simply apply it again.

```bash
kubectl apply -f deployment.yaml
```

Expected result:

```text
deployment.apps/nginx-deployment configured
```

The `apply` command creates the resource if it does not exist.

If it already exists, it merely applies the necessary changes.



# Viewing the Generated Manifest

A very useful way to study Deployments is to visualize how Kubernetes stored that resource.

```bash
kubectl get deployment nginx-deployment -o yaml
```

Explaining the parameters:

- `get` → retrieves a resource.
- `deployment` → resource type.
- `nginx-deployment` → Deployment name.
- `-o yaml` → displays output in YAML format.

Expected result:

```text
apiVersion: apps/v1
kind: Deployment
metadata:
...
spec:
...
status:
...
```

This output contains various information automatically added by Kubernetes.

It's an excellent tool for studying.



# Listing Only Pods for That Deployment

Since all Pods have the same Label, we can filter them.

```bash
kubectl get pods -l app=nginx-deployment
```

Explaining:

- `get pods` → lists Pods.
- `-l` → applies a label filter.
- `app=nginx-deployment` → shows only Pods for this application.

Expected result:

```text
NAME                                  READY
nginx-deployment-xxxx-yyyy1           1/1
nginx-deployment-xxxx-yyyy2           1/1
nginx-deployment-xxxx-yyyy3           1/1
```

This is a command frequently used in daily operations.



# Does Every Deployment Create a ReplicaSet?

Yes.

Whenever we create a Deployment, a ReplicaSet is also automatically created.

We can verify this with:

```bash
kubectl get replicasets
```

Expected result:

```text
NAME                           DESIRED   READY
nginx-deployment-7b7df8dcb7    3         3
```

Most of the time, you don't create ReplicaSets manually.

The Deployment itself does this job.



# Summary

We can summarize the entire Deployment structure as follows.

```text
Deployment
│
├── selector
│      │
│      └── finds Pods
│
├── template
│      │
│      └── defines how they will be created
│
└── ReplicaSet
           │
           └── maintains the correct number of Pods
```

Each of these pieces has a different responsibility.

Together, they allow Kubernetes to keep your application running continuously.



# Conclusion

Now that we understand the structure of a Deployment, it becomes much easier to comprehend the next features.

We know who creates the Pods.

We know who finds them.

And we know who ensures they continue to exist.

In the next article in the series, we will learn the different ways to create a Deployment using both YAML manifests and the `kubectl create deployment` command, as well as understand when each approach makes more sense.



## References

- [Kubernetes Documentation — Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) — official documentation on Deployments.
- [Kubernetes Documentation — Labels and Selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) — how Labels and Selectors work.
- [Kubernetes Documentation — ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/) — replica management.
- [LINUXtips — Descomplicando Kubernetes](https://linuxtips.io/) — training used as the basis for this series.
