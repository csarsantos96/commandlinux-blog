---
title: 'Startup Probe in Kubernetes: Giving the Application Time to Start'
description: >-
  Understand the startupProbe, its relationship with liveness and readiness, and
  practice with a slow-starting Nginx application.
date: '2026-10-05'
category: Kubernetes
tags:
  - kubernetes
  - startup-probe
  - probes
  - nginx
  - containers
  - troubleshooting
draft: false
language: en
translationOf: startup-probe-no-kubernetes
sourceHash: 17bfa771bd0f2a1701c20388538b3bdfacbdfb932f9016f41d82eee3cefe6b93
---
**Note:** This content was produced from my class notes in the **PICK – Intensive Container and Kubernetes Program**, from LINUXtips, complemented by the official Kubernetes documentation.

Some applications need time to load configurations or prepare files before they start responding. A health check that starts too early can interrupt this process.

The **Startup Probe** allows you to define a specific check for initialization. In the notes from 05/10/2026, it appears with HTTP and TCP checks.

## What does the Startup Probe check?

The `startupProbe` checks if the container has passed the configured startup test. As long as it hasn't succeeded, the liveness and readiness probes for that container are not executed.

After the first success, the startup probe stops executing for that container's run. If the container restarts, the process begins again. Reaching the failure threshold causes its termination; in a Deployment, it will be restarted according to the `Always` policy. [Documentation on probes and lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes).

Therefore, the note that it is tested “only once” refers to the initialization phase: multiple attempts can occur until it passes or reaches the limit.

## Comparing the three probes

| Probe | Guiding question for configuration | Effect of failure |
| --- | --- | --- |
| Startup | Has the application completed initialization? | Upon reaching the limit, terminates the container. |
| Liveness | Is the application still healthy? | Upon reaching the limit, terminates the container. |
| Readiness | Is the application ready to receive traffic? | Affects the Pod's readiness for Services. |

The articles on [Liveness Probe](/posts/liveness-probe-no-kubernetes/) and [Readiness Probe](/posts/readiness-probe-no-kubernetes/) detail the other two checks.

## startupProbe parameters

```yaml
startupProbe:
  httpGet:
    path: /
    port: 80
  initialDelaySeconds: 0
  periodSeconds: 5
  timeoutSeconds: 2
  failureThreshold: 24
```

| Field | Example configuration |
| --- | --- |
| `httpGet` | Queries `/` on port `80` of the Pod. |
| `initialDelaySeconds` | Does not add an initial wait. |
| `periodSeconds` | Configures 5-second intervals. |
| `timeoutSeconds` | Limits each attempt to 2 seconds. |
| `failureThreshold` | Allows up to 24 consecutive failures. |

The product `24 × 5` represents an approximate budget of 120 seconds to initialize, not an exact timer. The startup's `successThreshold` must be `1`. [Parameters documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

## Lab: Nginx with delayed startup

To make the wait visible, the example adds a `sleep 30` before starting Nginx. Save as `nginx-startup-probe.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-startup-probe
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx-startup-probe
  template:
    metadata:
      labels:
        app: nginx-startup-probe
    spec:
      containers:
        - name: nginx
          image: nginx:1.28.0
          command: ["/bin/sh", "-c"]
          args:
            - sleep 30; exec nginx -g 'daemon off;'
          ports:
            - name: http
              containerPort: 80
          startupProbe:
            httpGet:
              path: /
              port: http
            periodSeconds: 5
            timeoutSeconds: 2
            failureThreshold: 24
          livenessProbe:
            httpGet:
              path: /
              port: http
            periodSeconds: 10
            timeoutSeconds: 2
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /
              port: http
            periodSeconds: 5
            timeoutSeconds: 2
            failureThreshold: 3
```

The wait occurs inside the observed container. Using an init container for this delay would not demonstrate the same behavior, as it would execute before the Nginx container.

### Applying and observing

```bash
kubectl apply -f nginx-startup-probe.yaml
kubectl get pods -l app=nginx-startup-probe -w
```

End the watch with `Ctrl+C`. Then, check the Pod's name and its events:

```bash
kubectl get pods -l app=nginx-startup-probe
kubectl describe pod <nome-do-pod>
kubectl rollout status deployment/nginx-startup-probe
```

During the `sleep`, we expect the startup probe to find the port still closed. When Nginx starts and responds, it can pass, releasing the other checks. Observe `READY` and `RESTARTS` to verify the result.

### Triggering a failure

In the manifest, only change the `startupProbe` port to `81` and reapply:

```bash
kubectl apply -f nginx-startup-probe.yaml
kubectl get pods -l app=nginx-startup-probe -w
```

Nginx will continue listening on port `80`. Check the new Pod with `describe` to follow the failures and, after the limit, the restart. Repeated failures can result in `CrashLoopBackOff`.

Change the port back to `http` and apply the manifest again to recover the example. When finished:

```bash
kubectl delete -f nginx-startup-probe.yaml
```

These steps are a proposed practice based on the notes; the photos do not record the execution of this manifest.

## TCP alternative

To check only for port opening, replace the `httpGet` block of the startup probe with:

```yaml
tcpSocket:
  port: 80
```

Choose a single mechanism per probe. A TCP connection proves that the port accepts connections; an HTTP endpoint can represent a more specific application condition.

## Conclusion

The Startup Probe creates its own stage for initialization, allowing liveness and readiness checks to remain appropriate for the application after it starts responding.

## References

- [Kubernetes — Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) — probe configuration and parameters.
- [Kubernetes — Pod Lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes) — probes, container states, and restarts.
- [LINUXtips — PICK](https://linuxtips.io/pick/) — Intensive Container and Kubernetes Program used as the basis for my studies and these notes.
