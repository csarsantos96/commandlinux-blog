---
title: 'Readiness Probe in Kubernetes: When Running Doesn''t Mean Ready'
description: >-
  Understand how the Readiness Probe signals if a container is ready to receive
  traffic, and see this behavior in a demonstration with Nginx.
date: '2026-10-02'
category: Kubernetes
tags:
  - kubernetes
  - readiness-probe
  - probes
  - nginx
  - containers
  - troubleshooting
draft: false
language: en
translationOf: readiness-probe-no-kubernetes
sourceHash: e86248d9ff82bca948c5c54a0e1f1028fc99f2c6a8c7ee4038e6ac35ecc4d954
---
**Note:** This content was produced from my class notes in **PICK – Intensive Containers and Kubernetes Program**, from LINUXtips, complemented by the official Kubernetes documentation.

A Pod appearing as `Running` doesn't mean the application inside it is ready to receive requests.

The process might be running while the application loads configurations, initializes components, or waits for a dependency needed to serve users.

The **Readiness Probe** allows Kubernetes to monitor this readiness. To understand its role, let's look at a demonstration with Nginx: first with the check passing, and then with an intentional failure.

## What does the Readiness Probe check?

Readiness is a per-container check that signals whether it's ready to serve requests.

When a container is no longer ready, this affects the Pod's `Ready` condition. In the normal traffic forwarding of a Service that selects this Pod, it stops being considered a ready destination to receive traffic. The checks continue, allowing detection of when the application becomes available again.

This behavior helps prevent requests from being forwarded to an application that is still initializing or temporarily unable to serve them. [Official documentation on readiness](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

The quality of this signal depends on the chosen test. A successful response on the Nginx homepage demonstrates that page responded; in a real application, a readiness endpoint might check the conditions necessary to serve requests.

## Readiness and liveness have different roles

In the [Liveness Probe post](/posts/liveness-probe-no-kubernetes/), we saw how a health check failure can trigger a container restart.

Readiness has another purpose: to signal whether it can receive traffic at that moment.

| Probe | What it signals | Effect of failure |
| --- | --- | --- |
| `livenessProbe` | Whether the container passes the defined health test. | May trigger container restart. |
| `readinessProbe` | Whether the container is ready to serve requests. | Affects Pod readiness. |

A readiness failure, by itself, does not restart the container. This difference is clear in the demonstration: Nginx continues running, but the Pod stops being ready.

## How the check is defined

In the notes, one example uses an HTTP request:

```yaml
readinessProbe:
  httpGet:
    path: /
    port: 80
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 8
  successThreshold: 2
  failureThreshold: 3
```

In this case, the kubelet queries the `/` path on port `80` of the Pod. The other fields define the times and the number of consecutive results used to evaluate readiness.

| Field | Meaning in the example |
| --- | --- |
| `initialDelaySeconds: 10` | Initial wait of 10 seconds after container start. |
| `periodSeconds: 10` | Configured interval of 10 seconds between checks. |
| `timeoutSeconds: 8` | Maximum time of 8 seconds for each attempt. |
| `successThreshold: 2` | Two consecutive successes to consider the probe successful after a failure. |
| `failureThreshold: 3` | Three consecutive failures to consider the probe unsuccessful after passing. |

The timeout limits the duration of an attempt; it does not represent a pause before the next one. If the connection is refused immediately, the attempt can fail before this limit.

While the container is not ready, the readiness check may be executed more frequently than the configured interval. A container with a configured readiness starts without readiness and needs to pass the check. [Documentation of parameters](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

## The Nginx demonstration

In the lab log, the Deployment had one Nginx replica with two checks: an HTTP liveness on port `80` and a readiness that executed `curl` inside the container.

The readiness-responsible snippet was:

```yaml
readinessProbe:
  exec:
    command:
      - curl
      - -f
      - http://localhost:80/
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
  successThreshold: 1
```

Here, `exec` executes the command inside the container, and `localhost` refers to the Pod's own network. The test depends on `curl` being available in the image and returning exit code `0`. The `-f` option makes HTTP error responses, such as `404` and `500`, result in command failure.

This example uses a 5-second timeout and one success to acknowledge recovery, while the previous HTTP example uses 8 seconds and two successes. These are different configurations of the same readiness mechanism.

With the URL pointing to the port where Nginx was responding, the Pod query recorded:

```text
NAME                                               READY   STATUS    RESTARTS   AGE
nginx-deployment-readiness-probe-5654bc46b5-hz6nd    1/1     Running   0          15s
```

The `1/1` indicates that the single container was ready. `Running` shows the Pod's phase, and `RESTARTS 0` reports no restarts.

The `describe` log also confirmed readiness and both probes:

```text
Ready:          True
Restart Count:  0
Liveness:       http-get http://:80/ delay=10s timeout=5s period=10s #success=1 #failure=3
Readiness:      exec [curl -f http://localhost:80/] delay=10s timeout=5s period=10s #success=1 #failure=3
```

## What happens when readiness fails?

To demonstrate the difference between running and readiness, the readiness URL was changed to a port where Nginx was not listening:

```yaml
exec:
  command:
    - curl
    - -f
    - http://localhost:81/
```

The application continued on port `80`, and liveness continued checking that port. Only the readiness target changed to `81`.

Since this change occurred in the Deployment template, a new Pod was created. In the log, even after five minutes, it remained unready:

```text
NAME                                               READY   STATUS    RESTARTS   AGE
nginx-deployment-readiness-probe-5654bc46b5-hz6nd    1/1     Running   0          20m
nginx-deployment-readiness-probe-778d697956-8jq7h    0/1     Running   0          5m10s
```

The new Pod exhibits exactly the behavior we want to observe: **`Running`, `READY 0/1`, and no restarts**.

Nginx can continue responding on the correct port while readiness fails by querying the wrong port. This also demonstrates that a misconfigured probe can signal a lack of readiness even when the process is functioning.

The outputs recorded in the notes show this state but do not include the failure events of the new Pod. These events would be the evidence to confirm the specific error found by the probe.

## Why did the old Pod keep appearing?

Even with a desired replica, two Pods can temporarily exist during a RollingUpdate.

The Deployment can create a new Pod and keep the old one available while waiting for the new version to become ready. In the demonstration, the old one appears as `1/1`, while the new one remains `0/1`.

This behavior shows how readiness also participates in updates: as long as the new Pod is not ready, the rollout cannot complete normally. [Deployments documentation](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/).

## The effect on traffic

If a Service selected these Pods, the old one, still ready, could continue serving, while the new one would be out of the normal traffic forwarding.

The demonstration recorded in the notes includes the Deployment and Pod states, but neither a Service nor a request test. The effect on traffic explains the purpose of readiness but was not measured in these outputs.

Readiness also does not block direct access to the Pod's IP. It guides the selection of ready destinations by the Service, which has specific options like `publishNotReadyAddresses` to publish addresses even without readiness. [Services documentation](https://kubernetes.io/docs/concepts/services-networking/service/).

When the check passes again, the container can recover readiness according to the `successThreshold`. In the `exec` example, one success is enough to acknowledge this recovery.

## Conclusion

These notes from the PICK class show how the Readiness Probe participates in evaluating container readiness.

The Readiness Probe allows Kubernetes to differentiate between a running application and an application ready to receive requests.

In the demonstration, the incorrect port caused the new Pod to remain `READY 0/1`, even while `Running` and without restarts. This result highlights the role of readiness: to signal readiness and help control which Pods should serve traffic.

Therefore, choosing a check that represents the application's readiness and correctly configuring its parameters is essential to prevent a Pod from receiving requests before it can serve them.

1.  **Liveness:** “Is the application working?” If it repeatedly fails, the container is restarted.
2.  **Readiness:** “Is the application ready to receive traffic?” If it fails, the Pod stops receiving traffic from Services, but the container continues running.

## References

-   [Kubernetes — Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) — explains probes and their parameters.
-   [Kubernetes — Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) — documents updates and Pod availability.
-   [Kubernetes — Services](https://kubernetes.io/docs/concepts/services-networking/service/) — presents traffic forwarding to Pods.
-   [LINUXtips — PICK](https://linuxtips.io/pick/) — Intensive Containers and Kubernetes Program used as the basis for my studies and these notes.
