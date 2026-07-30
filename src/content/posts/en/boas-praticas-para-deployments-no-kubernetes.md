---
title: >-
  Good Practices for Deployments in Kubernetes: Organizing Applications for
  Production
description: >-
  Gather all the concepts learned about Deployments and discover good practices
  for creating more organized, secure, and easy-to-maintain applications.
date: '2026-07-30'
category: Kubernetes
tags:
  - kubernetes
  - deployment
  - production
  - best-practices
  - devops
  - yaml
  - rollout
draft: false
language: en
translationOf: boas-praticas-para-deployments-no-kubernetes
sourceHash: a62a77012e3ae5a7d7a4ef1765abaf3780874391bb9344e8c9c6cc9bc28a4a46
series: Kubernetes Deployment Fundamentals
part: 8
totalParts: 8
---
# Good Practices for Deployments in Kubernetes: Organizing Applications for Production

> Knowing how to create a Deployment is important. But knowing how to keep it organized and production-ready is what truly differentiates a professional environment from a lab.

Throughout this series, we've covered practically all the fundamental features of Deployments.

We learned how to create applications, understand the manifest structure, perform updates, configure rollout strategies, and execute rollbacks.

In this final article, we'll bring all of this together and present some good practices that are part of the daily routine of DevOps and SRE teams.

---

# Recapitulatings the Deployment Lifecycle

Before discussing good practices, it's worth reviewing the complete flow.

```text
Create Deployment
        │
        ▼
Deployment creates ReplicaSet
        │
        ▼
ReplicaSet creates Pods
        │
        ▼
Application starts running
        │
        ▼
Update
        │
        ▼
New ReplicaSet
        │
        ▼
RollingUpdate
        │
        ▼
New revision
        │
        ▼
Rollback (if necessary)
```

All of this process happens automatically thanks to the Deployment.

---

# Always Use Versioned Manifests

One of the most common mistakes for beginners is creating resources using only `kubectl` commands.

While this is useful for learning, real environments typically use YAML files stored in a Git repository.

For example:

```text
kubernetes/

├── namespace.yaml

├── deployment.yaml

├── service.yaml

├── ingress.yaml

└── configmap.yaml
```

This way, it becomes much easier to review changes, restore previous versions, and collaborate as a team.

---

# Use Namespaces to Organize Resources

Avoid concentrating all applications in the `default` Namespace.

Instead, create separate environments.

```text
default

dev

staging

production

monitoring
```

This organization facilitates permissions, monitoring, and cluster administration.

---

# Give Resources Consistent Names

Avoid generic names.

For example.

Instead of:

```
deployment1
```

Prefer:

```
api-pedidos

frontend-web

nginx-ingress

payments-api
```

The more descriptive the name, the easier it will be to administer the environment.

---

# Standardize Labels

Labels are used by various Kubernetes components.

Good standardization facilitates filters and integrations.

Example.

```yaml
metadata:
  labels:
    app: api-pedidos
    environment: production
    team: plataforma
```

Then we can easily query resources.

```bash
kubectl get pods \
    -l environment=production
```

Or.

```bash
kubectl get deployments \
    -l team=plataforma
```

---

# Always Define Requests and Limits

A Deployment without resource limits can cause various problems.

It's recommended to define both.

```yaml
resources:

  requests:
    cpu: "300m"
    memory: "128Mi"

  limits:
    cpu: "800m"
    memory: "512Mi"
```

This helps the Scheduler better distribute workloads and prevents a single container from consuming excessive node resources.

---

# Use RollingUpdate Whenever Possible

For most modern applications, RollingUpdate is the best choice.

```yaml
strategy:
  type: RollingUpdate

  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

This configuration keeps the application available during virtually the entire update.

The Recreate strategy should only be reserved for applications that truly do not support two versions running simultaneously.

---

# Configure revisionHistoryLimit

Storing hundreds of revisions usually doesn't make sense.

A simple configuration is usually sufficient.

```yaml
spec:
  revisionHistoryLimit: 5
```

This way, the history remains useful without occupying unnecessary resources.

---

# Monitor Rollouts

After each update, it's a good practice to verify that everything went correctly.

```bash
kubectl rollout status deployment \
    nginx-deployment \
    -n giropops
```

Expected result.

```text
deployment "nginx-deployment" successfully rolled out
```

If there's any problem, you'll discover it immediately.

---

# Use describe for Troubleshooting

Whenever a Deployment exhibits unexpected behavior, the first command is usually:

```bash
kubectl describe deployment \
    nginx-deployment \
    -n giropops
```

It shows important information such as:

- strategy used;
- events;
- ReplicaSets;
- Pods;
- Deployment conditions;
- errors during creation.

---

# Monitor Pods

Another important habit is to continuously check the Pods during an update.

```bash
kubectl get pods \
    -n giropops
```

Or monitor in real-time.

```bash
kubectl get pods \
    -w \
    -n giropops
```

The `-w` (*watch*) parameter keeps the output automatically updated as Pods change state.

---

# Perform Rollbacks When Necessary

Not every update will be perfect.

When a problem arises.

```bash
kubectl rollout undo deployment \
    nginx-deployment \
    -n giropops
```

Or to revert to a specific revision.

```bash
kubectl rollout undo deployment \
    nginx-deployment \
    --revision=4 \
    -n giropops
```

In production environments, quickly reverting to a stable version is often much more important than trying to fix the application immediately.

---

# Checklist Before Applying a Deployment

Before executing a `kubectl apply`, it's worth checking a few items.

| Item | Verified? |
|-------|-------------|
| Correct Namespace | ✅ |
| Standardized Labels | ✅ |
| Selector compatible with the template | ✅ |
| Requests and Limits defined | ✅ |
| Update strategy chosen | ✅ |
| revisionHistoryLimit configured | ✅ |
| Correct Image | ✅ |

This small checklist helps avoid many of the most common errors.

---

# Recommended Flow

A commonly used routine in professional environments can be represented like this.

```text
Edit deployment.yaml
        │
        ▼
Review changes
        │
        ▼
Git Commit
        │
        ▼
kubectl apply
        │
        ▼
rollout status
        │
        ▼
Application running
        │
        ▼
Rollback (if necessary)
```

Notice that almost all the work happens on the YAML files.

The cluster merely receives the desired state.

---

# What to Study Next?

Now that you've mastered Deployments, some of the natural next topics within Kubernetes are:

- Services
- Ingress
- ConfigMaps
- Secrets
- Persistent Volumes
- StatefulSets
- DaemonSets
- Jobs and CronJobs
- Horizontal Pod Autoscaler (HPA)
- Kustomize
- Helm

All these resources work in conjunction with Deployments and are part of the daily routine for anyone managing Kubernetes clusters.

---

# Series Summary

During this series, we learned:

| Part | Content |
|--------|----------|
| 1 | What is a Deployment |
| 2 | Selector, Template, and ReplicaSet |
| 3 | Creating Deployments with YAML and kubectl |
| 4 | Updating Deployments |
| 5 | RollingUpdate, maxSurge, and maxUnavailable |
| 6 | Recreate Strategy |
| 7 | Revision History and Rollback |
| 8 | Good Practices for Production |

This knowledge forms a solid foundation for working with Deployments in real-world environments.

---

# Conclusion

**Deployments** are among the most important resources in Kubernetes.

They simplify application management, automate updates, maintain the desired cluster state, and offer secure mechanisms for recovery in case of failures.

More than memorizing commands, understanding the internal workings of Deployments allows for better decision-making during the development and operation of applications in production.

From this foundation, you will be prepared to advance to other fundamental resources in the Kubernetes ecosystem, building increasingly resilient, scalable, and easy-to-manage applications.

---

## References

- [Kubernetes Documentation — Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Documentation — Managing Resources](https://kubernetes.io/docs/concepts/cluster-administration/manage-deployment/)
- [Kubernetes Documentation — Workloads](https://kubernetes.io/docs/concepts/workloads/)
- [Kubernetes Documentation — Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [LINUXtips — Demystifying Kubernetes](https://linuxtips.io/)
