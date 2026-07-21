---
title: Creating and Managing Pods with kubectl and YAML Manifests
description: >-
  Learn how to generate YAML manifests, create Pods, and use the main kubectl
  commands to manage resources in Kubernetes.
date: '2026-07-20'
category: Kubernetes
tags:
  - kubernetes
  - kubectl
  - pods
  - yaml
  - manifests
  - devops
draft: false
language: en
translationOf: conhecendo-manifestos-yaml
sourceHash: 7a1fcf27ee9bd7e6e2e1450bfad439520d9f898c1453d22db1101bc8dd2dc79c
series: Kubernetes Fundamentals
part: 2
totalParts: 4
---
> This article is a continuation of the post **Understanding Pods and kubectl**. If you haven't read the first part yet, I recommend starting there to grasp the fundamental concepts before moving on to YAML manifests.

# Understanding YAML Manifests and Managing Pods with kubectl

In the previous article, we learned about Pods and how to create our first resource using the `kubectl run` command.

While this command is extremely useful for studies and quick tests, it doesn't represent the most common way to work with Kubernetes in production environments.

In practice, most applications are created via **YAML manifests** that are versioned in a Git repository.

In this article, we will learn how to automatically generate these manifests using `kubectl`, understand their structure, create a Pod with multiple containers, and explore some of the most used commands for managing Pods.



# Generating a YAML Manifest

Imagine we want to create a Pod using the Nginx image.

We could execute directly:

```bash
kubectl run corinthians --image=nginx
```

However, there's a much better way to do this.

```bash
kubectl run corinthians \
  --image=nginx \
  --port=80 \
  --dry-run=client \
  -o yaml > pod.yaml
```

This command doesn't create any resources.

It merely generates the YAML manifest and saves its content into the `pod.yaml` file.

Let's understand each option.



# The `--image` Parameter

```bash
--image=nginx
```

Defines which image will be used by the container.

When the Pod is created, Kubernetes will try to locate this image in a container registry.

If it doesn't exist locally, it will be downloaded automatically.



# The `--port` Parameter

```bash
--port=80
```

Informs that the container uses port 80.

This causes the manifest to contain:

```yaml
ports:
  - containerPort: 80
```

It's important to remember that this option **does not publish** the application.

For that, it will still be necessary to create a Service.



# The `--dry-run=client` Parameter

This is one of the most useful options during studies.

```bash
--dry-run=client
```

The term **dry-run** means to execute a simulation.

Instead of sending a request to Kubernetes, `kubectl` assembles the resource locally.

In practice, the following happens:

```text
kubectl
      │
      ▼
Assembles the object
      │
      ▼
Generates the YAML
      │
      ▼
Does not create any resource
```

Since the entire simulation happens within `kubectl` itself, we use the `client` option.



# The `-o yaml` Parameter

The `-o` option stands for **output**.

```bash
-o yaml
```

It tells `kubectl` that we want to view the resource in YAML format.

The result will be similar to the following:

```yaml
apiVersion: v1
kind: Pod

metadata:
  labels:
    run: corinthians
  name: corinthians

spec:
  containers:
  - image: nginx
    name: corinthians
    ports:
    - containerPort: 80

  dnsPolicy: ClusterFirst
  restartPolicy: Always
```



# The `>` Operator

The final part of the command often causes confusion.

```bash
> pod.yaml
```

This does not belong to Kubernetes.

This operator is part of the Linux shell.

It redirects the command's output to a file.

Without it, the YAML would be displayed directly in the terminal.

With it, all content will be saved to `pod.yaml`.



# Understanding the Manifest Structure

Now that the file has been created, we can understand its structure.

## apiVersion

Defines which API version will be used.

```yaml
apiVersion: v1
```



## kind

Informs which resource will be created.

```yaml
kind: Pod
```



## metadata

Stores resource identification information.

```yaml
metadata:
  name: corinthians
  labels:
    run: corinthians
```



## spec

This is the most important part of the manifest.

It describes the desired state of the resource.

Inside it, we find:

- containers;
- ports;
- restart policies;
- DNS;
- volumes;
- resources.



## containers

Lists all containers belonging to the Pod.

```yaml
containers:
- image: nginx
  name: corinthians
```

If Sidecars exist, they will also appear in this list.



## restartPolicy

```yaml
restartPolicy: Always
```

Defines Kubernetes' behavior if the container terminates.

By default, Pods created this way use `Always`.



## dnsPolicy

```yaml
dnsPolicy: ClusterFirst
```

This policy indicates that the Pod will use the cluster's own DNS service.



# Creating the Pod

After reviewing the manifest, simply apply it.

```bash
kubectl apply -f pod.yaml
```

Expected result:

```text
pod/corinthians created
```

Now Kubernetes will send this manifest to the API Server and initiate the Pod creation process.

# Creating a Pod with Multiple Containers

Until now, we have worked with a Pod containing only one container.

However, a Pod can also run two or more containers simultaneously.

In the example below, we will create a Pod named `corinthians` with two containers:

- one container using the Nginx image;
- one container using the BusyBox image.

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: corinthians
  name: corinthians
spec:
  containers:
  - image: nginx
    name: corinthians
    resources: {}

  - image: busybox
    name: busybox
    args:
    - sleep
    - "700"

  dnsPolicy: ClusterFirst
  restartPolicy: Always
```

The first container runs Nginx.

The second uses the BusyBox image and executes the command:

```bash
sleep 700
```

This command keeps the container active for 700 seconds. Without a running process, the BusyBox container would terminate shortly after starting.

After applying the manifest:

```bash
kubectl apply -f pod.yaml
```

We can query the Pod with additional information:

```bash
kubectl get pods -o wide
```

Result:

```text
NAME          READY   STATUS    RESTARTS        AGE    IP           NODE
corinthians   2/2     Running   9 (2m18s ago)   4h5m   10.244.2.5   giropops-worker
```

The `READY` column shows:

```text
2/2
```

This means the Pod has two containers, and both are ready.

The `NODE` column shows that the Pod is running on the Node:

```text
giropops-worker
```

We can represent this structure as follows:

```text
Kubernetes Cluster
└── Node: giropops-worker
    └── Pod: corinthians
        ├── Container: corinthians
        │   └── Image: nginx
        └── Container: busybox
            └── Command: sleep 700
```

It's important to understand that containers are not run directly by the Node as separate resources.

Both containers are inside the same Pod, and the Pod itself is running on the Node.

They also share:

- the same IP address;
- the same network interface;
- the same lifecycle;
- the volumes defined in the Pod.

In this example, the IP address `10.244.2.5` belongs to the Pod.

## Understanding BusyBox Restarts

In the command output, the `RESTARTS` column shows that the containers have already restarted:

```text
9 (2m18s ago)
```

This happens because BusyBox executes:

```bash
sleep 700
```

After 700 seconds, this process terminates.

Since the manifest uses:

```yaml
restartPolicy: Always
```

Kubernetes restarts the container.

That's why the number of restarts increases over time.

## Managing Specific Containers

When a Pod has multiple containers, we need to specify which container we want to access.

To view Nginx logs:

```bash
kubectl logs corinthians -c corinthians
```

To query BusyBox:

```bash
kubectl logs corinthians -c busybox
```

We can also execute commands inside a specific container.

In the Nginx container:

```bash
kubectl exec -it corinthians -c corinthians -- sh
```

In the BusyBox container:

```bash
kubectl exec -it corinthians -c busybox -- sh
```

The `-c` option specifies the name of the container to be used.

# Querying Pods

The first command we usually execute is:

```bash
kubectl get pods
```

We can also get additional information.

```bash
kubectl get pods -o wide
```

This option shows information such as:

- IP address;
- node where the Pod is running.



# Getting Details

If it's necessary to investigate a specific resource:

```bash
kubectl describe pod corinthians
```

This command displays:

- events;
- conditions;
- containers;
- image;
- volumes;
- IP;
- Node;
- status.

It's one of the most used commands during troubleshooting processes.



# Viewing Logs

To view a container's logs, we use:

```bash
kubectl logs corinthians
```

If we want to follow the logs in real-time:

```bash
kubectl logs -f corinthians
```

If the Pod has multiple containers, it will be necessary to specify which one we want to query.

```bash
kubectl logs corinthians -c busybox
```



# Executing Commands Inside the Container

Many times it will be necessary to access a container to perform tests or investigations.

For this, we use `kubectl exec`.

```bash
kubectl exec -it corinthians -- sh
```

This command creates a new process inside the container.

After that, we can execute commands normally.

```bash
ls

env

hostname

cat /etc/os-release
```

In practice, `kubectl exec` is much more used than `kubectl attach`.



# Understanding kubectl attach

The `attach` command has a different behavior.

While `exec` creates a new process, `attach` connects our terminal to the container's main process.

```bash
kubectl attach -it corinthians
```

In most situations, we use `exec`.

`attach` is usually only used for interactive applications that are already awaiting terminal input.



# Removing the Pod

To remove the resource:

```bash
kubectl delete pod corinthians
```

After a few seconds, it will cease to exist in the cluster.



# Summary

Throughout this article, we learned a commonly used daily workflow.

```text
kubectl run
        │
        ▼
--dry-run=client
        │
        ▼
-o yaml
        │
        ▼
pod.yaml
        │
        ▼
kubectl apply
        │
        ▼
kubectl get
        │
        ▼
kubectl describe
        │
        ▼
kubectl logs
        │
        ▼
kubectl exec
        │
        ▼
kubectl delete
```

This workflow represents the foundation of working with Kubernetes and will be used for almost all subsequent resources we study, such as Deployments, Services, ConfigMaps, and Ingress.

In future articles, we will move on to more complex declarative resources and understand how real applications run within a Kubernetes cluster.

## References

- [Kubernetes — Declarative Management of Kubernetes Objects](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/) — explains the use of configuration files and `kubectl apply`.
- [Kubernetes — kubectl Reference](https://kubernetes.io/docs/reference/kubectl/) — documents the commands used to create, inspect, and remove resources.
- [Kubernetes — Pods](https://kubernetes.io/pt-br/docs/concepts/workloads/pods/) — documents the structure and lifecycle of Pods.
- [LINUXtips — Kubernetes Essentials](https://linuxtips.io/treinamento/kubernetes-essentials/) — course used as the basis for my studies and this series of notes.
