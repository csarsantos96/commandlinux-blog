---
title: Limiting CPU and Memory Consumption of Pods in Kubernetes
description: >-
  Learn how to configure requests and limits in Kubernetes Pods, understand how
  the Scheduler uses these values, and why CPU and memory limits are important.
date: '2026-07-21'
category: Kubernetes
tags:
  - kubernetes
  - pods
  - resources
  - requests
  - limits
  - cpu
  - memory
draft: false
language: en
translationOf: limitando-o-consumo-de-recursos
sourceHash: b771182903a9703d9c49d74748d84fb1ffa2050ed72deaf58947090b7f6eba15
series: Kubernetes Fundamentals
part: 3
totalParts: 4
---
> This article is a continuation of the **Kubernetes Fundamentals** series. In previous posts, we learned what Pods are, how to create them using `kubectl`, and how to generate YAML manifests. Now, we will see how to control container resource consumption.

> **Note:** This content was produced from my studies in **PICK – Intensive Container and Kubernetes Program** by LINUXtips, complemented by the official Kubernetes documentation.

# Limiting CPU and Memory Consumption of Pods in Kubernetes

When running applications in a Kubernetes cluster, it's important to prevent a single container from consuming all available Node resources.

To achieve this, Kubernetes allows you to define how much CPU and memory a container **requests** and how much it **can use at most**.

These configurations are made through the `resources` block.



# Creating a Manifest

Building on the manifest created in the previous article, we can create a new version to add resource limits.

```text
cp pod.yaml pod-limitado.yaml
```

Then, simply edit the new file.



# Manifest Structure

Our Pod will look similar to the example below:

```yaml
apiVersion: v1
kind: Pod

metadata:
  name: timao

spec:
  containers:
    - name: ubuntu
      image: ubuntu

      args:
        - sleep
        - "1800"

      resources:
        requests:
          cpu: "300m"
          memory: "64Mi"

        limits:
          cpu: "500m"
          memory: "128Mi"
```

After saving the file, we can apply it to the cluster.

```bash
kubectl apply -f pod-limitado.yaml
```



# The resources block

All configuration related to resource consumption is located within:

```yaml
resources:
```

This block has two main sections:

- `requests`
- `limits`

Although they seem similar, they have different functions.



# Requests

**Requests** represent the minimum amount of resources that the container asks the cluster for.

```yaml
resources:
  requests:
    cpu: "300m"
    memory: "64Mi"
```

These values are used by the **Scheduler** during Pod scheduling.

Before choosing a Node, the Scheduler checks if there is enough capacity to meet the requested resources.

We can think of requests as a **minimum guarantee**.

If we specify:

```yaml
cpu: "300m"
```

we are requesting approximately **300 millicores**, or about **30% of a CPU core**.

Whereas:

```yaml
memory: "64Mi"
```

requests **64 MiB (Mebibytes)** of RAM for the container.



# Limits

While requests represent the guaranteed minimum amount, **limits** define the maximum allowed consumption.

```yaml
resources:
  limits:
    cpu: "500m"
    memory: "128Mi"
```

When the container reaches these values, the behavior depends on the resource.

## CPU Limit

When the CPU limit is exceeded, the container is **not terminated**.

The Kernel reduces the processing time available to it, a process known as **CPU Throttling**.

In practice, the application continues to function, but with reduced performance.

## Memory Limit

With memory, the behavior is different.

If the container exceeds the defined limit, the Kernel terminates the process to protect the rest of the system.

In Kubernetes, we will usually see the status:

```text
OOMKilled
```

This is one of the most common problems found in applications that do not have limits configured correctly.



# Verifying the Pod

After creating the resource, we can view its configurations using:

```bash
kubectl describe pod timao
```

If it's necessary to access the container:

```bash
kubectl exec -it timao -- sh
```

Inside it, we can use some commands to inspect the environment.

View processes:

```bash
ps -ef
```

View memory usage:

```bash
free -m
```

These commands help understand the container's behavior during testing.



# Conclusion

Configuring **requests** and **limits** is one of the most important practices in Kubernetes.

While **requests** guarantee the minimum necessary resources for the Scheduler to correctly place the Pod on a Node, **limits** prevent a container from using resources beyond what is allowed.

This configuration makes the cluster more predictable, improves resource sharing among applications, and reduces problems caused by excessive CPU and memory consumption.



# References

## Official Documentation

- Kubernetes Documentation. **Resource Management for Pods and Containers**. Available at: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/

- Kubernetes Documentation. **Assign CPU Resources to Containers and Pods**. Available at: https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/

- Kubernetes Documentation. **Assign Memory Resources to Containers and Pods**. Available at: https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/

- Kubernetes Documentation. **kubectl apply**. Available at: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_apply/

- Kubernetes Documentation. **kubectl describe**. Available at: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_describe/

## Complementary Material

- LINUXtips. **PICK – Intensive Container and Kubernetes Program**. Available at: https://linuxtips.io/pick/

- LINUXtips. **Demystifying Kubernetes**. Available at: https://linuxtips.io/courses/
