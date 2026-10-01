---
title: 'Liveness Probe in Kubernetes: Verifying and Restarting Containers'
description: >-
  Learn to configure a TCP livenessProbe in Nginx, understand its parameters,
  and observe restarts and CrashLoopBackOff when testing an incorrect port.
date: '2026-10-01'
category: Kubernetes
tags:
  - kubernetes
  - liveness-probe
  - probes
  - nginx
  - containers
  - troubleshooting
draft: false
language: en
translationOf: liveness-probe-no-kubernetes
sourceHash: a4de6896ef30b674d3008f47ef87833fe0a7c661ec21c266ef1a51f037aab1fc
---
A container might be running, yet the application inside it stops responding.

In this lab, we'll configure a **Liveness Probe** on Nginx and change the check port to observe how Kubernetes reacts to a failure.

## Probes are configured per container

Probes are part of each container's configuration within the Pod.

If a Pod has two containers and we want to check both, we need to define a probe for each. A liveness failure for one container triggers that container's restart.

In this example, we'll have a Deployment with one replica and an Nginx container.

## Understanding the parameters

We will use the following configuration:

```yaml
livenessProbe:
  tcpSocket:
    port: 80
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

| Field | Function in the example |
| --- | --- |
| `tcpSocket` | Attempts to establish a TCP connection on port 80. |
| `initialDelaySeconds` | Waits 10 seconds after container startup before beginning checks. |
| `periodSeconds` | Defines a 10-second interval between checks. |
| `timeoutSeconds` | Defines a maximum of 5 seconds for each check. |
| `failureThreshold` | After 3 consecutive failures, considers liveness unsuccessful and triggers a restart. |

`timeoutSeconds` does not define a wait before retrying. If the connection is refused immediately, the check can fail before 5 seconds.

However, `failureThreshold` does not limit the total number of restarts: it defines how many consecutive failures are needed to trigger each restart. [Official documentation on probe configuration](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/).

## Creating the Deployment

Create the `nginx-deployment.yaml` file:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx-deployment
spec:
  replicas: 1
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
          image: nginx:1.19.1
          resources:
            limits:
              cpu: "0.5"
              memory: 256Mi
            requests:
              cpu: "0.25"
              memory: 128Mi
          livenessProbe:
            tcpSocket:
              port: 80
            initialDelaySeconds: 10
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
```

We kept the image used in the annotations to reproduce the lab. The `requests` block is at the same indentation level as `limits`, both within `resources`.

Apply the manifest:

```bash
kubectl apply -f nginx-deployment.yaml
```

Check the Deployment's Pods:

```bash
kubectl get pods -l app=nginx-deployment
```

In the execution recorded in the annotations, the Pod started with no restarts:

```text
NAME                              READY   STATUS    RESTARTS   AGE
nginx-deployment-5dd8fbcb6c-cl7zh   1/1     Running   0          25s
```

Names and times may vary in your cluster.

## Checking the probe with describe

Use the name returned in the previous command:

```bash
kubectl describe pod nginx-deployment-5dd8fbcb6c-cl7zh
```

In the container section, observe:

```text
Restart Count: 0
Liveness: tcp-socket :80 delay=10s timeout=5s period=10s ##success=1 ##failure=3
```

These fields show the restart count and the liveness configuration applied.

## Causing a failure on port 81

To test, change only the probe port in the manifest:

```yaml
livenessProbe:
  tcpSocket:
    port: 81
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

The Nginx in this lab continues to listen on port 80. Changing the probe does not change the application's port.

Reapply the file and monitor the Pods:

```bash
kubectl apply -f nginx-deployment.yaml
kubectl get pods -l app=nginx-deployment 
```

The change in the Deployment template initiates an update and creates a new Pod. Therefore, check the name again before running `describe`.

In the lab record, the new Pod already showed two restarts:

```text
NAME                               READY   STATUS    RESTARTS       AGE
nginx-deployment-5565dfc44d-zmf5q    1/1     Running   2 (39s ago)    119s
```

## Identifying the cause in the events

Inspect the new Pod:

```bash
kubectl describe pod nginx-deployment-5565dfc44d-zmf5q
```

In the annotations, the `Events` section recorded:

```text
Warning  Unhealthy  Liveness probe failed: dial tcp 10.244.1.16:81: connect: connection refused
Normal   Killing    Container nginx failed liveness probe, will be restarted
```

The first message shows that the connection to port 81 was refused. The second confirms that the liveness failure triggered the container's restart.

Since the configuration continues to point to the incorrect port, the problem repeats after each restart.

## Observing CrashLoopBackOff

After several attempts, the lab showed:

```text
NAME                               READY   STATUS             RESTARTS      AGE
nginx-deployment-5565dfc44d-zmf5q    0/1     CrashLoopBackOff   5 (7s ago)    4m7s
```

In this context, `CrashLoopBackOff` indicates that the container is experiencing repeated restarts, with a delay before the next attempt. The `describe` command helps identify the cause: in this test, the incorrect liveness port.

## Correcting the test

Revert the probe port to `80` in the file and apply again:

```bash
kubectl apply -f nginx-deployment.yaml
kubectl rollout status deployment/nginx-deployment
kubectl get pods -l app=nginx-deployment
```

Check the new Pod with `kubectl describe pod <pod-name>` and monitor the restart count to verify recovery.

## What does the TCP check prove?

A successful TCP probe indicates that a connection could be opened on the configured port. It does not validate all application functionalities.

For applications that require a more specific check, an HTTP probe can query a health endpoint. Applications with slow startup times can also use a `startupProbe` before liveness checks. [Official documentation on probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/).

## Conclusion

In this lab, we configured a TCP liveness probe on port 80, checked its parameters with `describe`, and caused a failure by changing the check to port 81.

The events and restart count showed Kubernetes' reaction. The test also demonstrated that an incorrect probe configuration can lead to continuous restarts, even when the application process is running.

---

## References

- [Kubernetes — Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/)
- [Kubernetes — Liveness, Readiness, and Startup Probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
- [LINUXtips — Kubernetes Essentials](https://linuxtips.io/treinamento/kubernetes-essentials/) — course used as the basis for my studies and this series of notes.
