---
title: 'DaemonSet in Kubernetes: Running One Pod Per Node'
description: >-
  Understand when to use a DaemonSet and learn how to create a manifest with
  Node Exporter to provide cluster node metrics.
date: '2026-08-04'
category: Kubernetes
tags:
  - kubernetes
  - daemonset
  - pods
  - node-exporter
  - prometheus
  - monitoramento
  - yaml
draft: false
language: en
translationOf: daemonset-no-kubernetes
sourceHash: de4b3b863ca7beea00e5741abc382afce89daa87729e175abe977dfe4ed37c42
---
A monitoring agent needs to monitor each machine in the cluster. If we add a new node, this agent also needs to reach it.

**DaemonSet** addresses this type of need. Based on the notes from 08/04/2026, we will understand how it works and set up an example with Node Exporter.

## What is a DaemonSet?

A DaemonSet is a controller that maintains a copy of a Pod on each eligible node. When new eligible nodes join the cluster, it creates Pods for them; when nodes are removed, the corresponding Pods are also removed.

The term **eligible node** is important: selectors, affinity, and taints can limit where Pods will run. Therefore, a DaemonSet can target all nodes or just a group of them. [Official DaemonSet documentation](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/).

## When to use?

The notes highlight three applications:

| Need | Examples |
| --- | --- |
| Per-node metrics and log collection | Prometheus Node Exporter and Fluentd |
| Network components distributed across nodes | kube-proxy and agents for solutions like Calico or Flannel |
| Per-node security observation | Falco and Sysdig agents |

Each tool has its own installation configuration. The manifest in this article is a study example with Node Exporter.

## DaemonSet and Deployment

In the [post about Deployments](/posts/entendendo-deployments/), we saw the replica management of an application. With DaemonSets, the desired quantity follows the eligible nodes, without a `replicas` field.

Consider a cluster where all nodes are eligible:

```text
3 nodes → 3 DaemonSet Pods
4 nodes → 4 DaemonSet Pods

node-1 → node-exporter
node-2 → node-exporter
node-3 → node-exporter
node-4 → node-exporter (created after the new node joins)
```

This diagram represents the desired state after reconciliation. The creation and readiness of Pods still depend on cluster conditions.

## Creating the manifest

The draft notes present a DaemonSet named `node-exporter-daemonset`, port `9100`, and the host's `/proc` and `/sys` directories.

The example below completes this structure. Save it as `node-exporter-daemonset.yaml`:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter-daemonset
  labels:
    app: node-exporter-daemonset
spec:
  selector:
    matchLabels:
      app: node-exporter-daemonset
  template:
    metadata:
      labels:
        app: node-exporter-daemonset
    spec:
      nodeSelector:
        kubernetes.io/os: linux
      hostNetwork: true
      hostPID: true
      dnsPolicy: ClusterFirstWithHostNet
      containers:
        - name: node-exporter
          image: quay.io/prometheus/node-exporter:v1.9.1
          args:
            - --path.procfs=/host/proc
            - --path.sysfs=/host/sys
            - --path.rootfs=/host/root
          ports:
            - name: metrics
              containerPort: 9100
              hostPort: 9100
          volumeMounts:
            - name: proc
              mountPath: /host/proc
              readOnly: true
            - name: sys
              mountPath: /host/sys
              readOnly: true
            - name: root
              mountPath: /host/root
              readOnly: true
              mountPropagation: HostToContainer
      volumes:
        - name: proc
          hostPath:
            path: /proc
            type: Directory
        - name: sys
          hostPath:
            path: /sys
            type: Directory
        - name: root
          hostPath:
            path: /
            type: Directory
```

### Understanding the configuration

`selector.matchLabels` corresponds to `template.metadata` labels. `template.spec` describes the Pod that will be created on each selected node.

`nodeSelector` restricts the example to Linux. We did not add tolerations for control plane taints; these nodes might be excluded from execution.

The Node Exporter shares the host's network and process namespace via `hostNetwork` and `hostPID`. Volumes make the machine's directories available at their own paths inside the container, and the `--path.*` arguments point the exporter to these paths. Mounting the root directory complements the draft for collecting filesystem information. [Node Exporter documentation](https://github.com/prometheus/node_exporter).

The image uses a fixed version to make the example reproducible. Port `9100` must be available on the nodes; with host networking, the endpoint also depends on the machine's access rules. Cluster policies might restrict `hostPath` and namespace sharing.

## Applying and verifying

With `kubectl` configured for the lab cluster, run:

```bash
kubectl apply -f node-exporter-daemonset.yaml
kubectl rollout status daemonset/node-exporter-daemonset
kubectl get daemonset node-exporter-daemonset
kubectl get pods -l app=node-exporter-daemonset -o wide
```

Check the Pods' `NODE` column to observe their distribution. In the DaemonSet summary, compare `DESIRED`, `CURRENT`, and `READY`: these help identify if all expected Pods have been created and are ready.

If a Pod fails to start, check its description and events:

```bash
kubectl describe daemonset node-exporter-daemonset
kubectl describe pod <nome-do-pod>
kubectl logs <nome-do-pod>
```

To query metrics from a running Pod, in a terminal use:

```bash
kubectl port-forward pod/<nome-do-pod> 19100:9100
```

In another terminal:

```bash
curl http://localhost:19100/metrics
```

This test directly queries an exporter. To continuously collect and store metrics, Prometheus still needs to be configured. The manifest does not install this service.

These commands are a suggested practice based on the notes; the images do not include execution outputs from this lab.

## Conclusion

The DaemonSet allows monitoring node distribution with local agents for metrics, logs, networking, or security. In the example, the template brings together the necessary configuration to run Node Exporter and query its metrics.

## References

- [Kubernetes — DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) — official documentation on DaemonSet operation, node selection, and configuration.
- [Prometheus — Node Exporter](https://github.com/prometheus/node_exporter) — documentation for the metrics exporter and its execution in containers.
- [LINUXtips — PICK](https://linuxtips.io/pick/) — Intensive Containers and Kubernetes Program used as the basis for my studies and these notes.
