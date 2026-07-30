---
title: >-
  Revision History and Rollback in Kubernetes: Restoring Previous Versions of a
  Deployment
description: >-
  Learn how Kubernetes records each Deployment update, view revision history,
  and safely perform rollbacks.
date: '2026-07-30'
category: Kubernetes
tags:
  - kubernetes
  - deployment
  - rollout
  - rollback
  - revisionhistorylimit
  - devops
draft: false
language: en
translationOf: historico-de-revisoes-e-rollback-no-kubernetes
sourceHash: 747c08fa69368034713d8498ed783b9ab7d938763a24707e43ce0af43b702162
series: Kubernetes Deployments Fundamentals
part: 7
totalParts: 8
---
# Revision History and Rollback in Kubernetes: Restoring Previous Versions of a Deployment

> What if the new application version has a problem right after deployment? Will you have to manually edit the manifest to roll back?

Fortunately, no.

One of the most useful features of **Deployments** is maintaining a history of changes. This history allows you to track each update and, when necessary, quickly revert to a previous version using **rollback**.

In this article, we'll understand how Kubernetes records these revisions, view a Deployment's history, and learn how to restore previous versions.

---

# What is a Revision?

Whenever a change in the Deployment generates a new version of the Pods, Kubernetes creates a **new revision**.

Each revision represents a specific state of that Deployment.

Imagine the following update sequence.

```text
Revision 1

nginx:1.30.4

        │

Update

        ▼

Revision 2

nginx:1.31.0

        │

Update

        ▼

Revision 3

nginx:1.31.1
```

Each significant change generates a new revision that can be consulted later.

---

# What Triggers a New Revision?

Not every change creates a new revision.

Typically, changes to the Pod template generate a new version.

For example:

- image changes;
- environment variable changes;
- resource changes (CPU and memory);
- adding or removing containers;
- volume modifications;
- changes to template Labels.

These modifications cause a new ReplicaSet to be created.

---

# Viewing the History

To view existing revisions, we use:

```bash
kubectl rollout history deployment \
    nginx-deployment \
    -n giropops
```

Explaining:

- `rollout history` → displays the revision history.
- `deployment` → resource type.
- `nginx-deployment` → Deployment name.
- `-n giropops` → Namespace.

Expected output:

```text
deployment.apps/nginx-deployment

REVISION  CHANGE-CAUSE

1         <none>

2         <none>

3         <none>
```

Each number represents a revision stored by the Deployment.

---

# Viewing a Specific Revision

It's also possible to view an individual revision.

```bash
kubectl rollout history deployment \
    nginx-deployment \
    --revision=2 \
    -n giropops
```

Expected output:

```text
Pod Template

Image:
nginx:1.31.0

...
```

This command is very helpful when we need to find out exactly which version was being used.

---

# Tracking an Update

Before performing a rollback, we usually check if the rollout completed successfully.

```bash
kubectl rollout status deployment \
    nginx-deployment \
    -n giropops
```

Expected output:

```text
deployment "nginx-deployment" successfully rolled out
```

If there's any problem during the update, this command will also indicate that the rollout is still in progress.

---

# Performing a Rollback

Imagine we updated the application.

Before:

```text
Revision 2

nginx:1.30.4
```

After:

```text
Revision 3

nginx:1.31.0
```

Right after the deploy, we noticed a problem.

We can revert to the previous revision using:

```bash
kubectl rollout undo deployment \
    nginx-deployment \
    -n giropops
```

Expected output:

```text
deployment.apps/nginx-deployment rolled back
```

Kubernetes will automatically restore the previous revision.

---

# Restoring a Specific Revision

We can also revert directly to a specific revision.

For example.

```bash
kubectl rollout undo deployment \
    nginx-deployment \
    --revision=2 \
    -n giropops
```

Explaining:

- `undo` → undoes an update.
- `--revision=2` → reverts exactly to revision 2.

Expected output:

```text
deployment.apps/nginx-deployment rolled back
```

It's important to understand one detail.

Kubernetes **doesn't "go back in time"**.

It uses the configuration stored in that revision to create a **new rollout**.

In other words, a rollback also generates a new revision in the history.

Example:

```text
Revision 1

↓

Revision 2

↓

Revision 3

↓

Rollback to Revision 2

↓

Revision 4
```

Revision 4 has the same configuration as Revision 2, but it's considered a new revision.

This behavior facilitates audits and change tracking.

---

# How Rollback Works Internally?

The flow can be represented as follows.

```text
Deployment

        │

Revision 1

        │

Revision 2

        │

Revision 3

        │

Rollback

        ▼

New ReplicaSet

        ▼

Revision 4
```

Notice that Kubernetes never directly reuses an old ReplicaSet.

It creates a new rollout based on that revision's configuration.

---

# Limiting the Number of Revisions

The Deployment can store multiple revisions.

However, maintaining a very large history consumes unnecessary resources.

To control this, there's the `revisionHistoryLimit` field.

```yaml
spec:
  revisionHistoryLimit: 5
```

In this example, Kubernetes will only keep the five most recent revisions.

The oldest ones will be automatically removed.

---

# When to Use revisionHistoryLimit?

This parameter is quite useful in production environments.

Some examples.

| Scenario | Suggested Value |
|---------|----------------|
| Labs | 2 to 3 |
| Small Applications | 5 |
| Production | 10 |
| Highly Critical Environments | As per company policy |

There's no universal value.

The choice depends on the deployment frequency and the need for auditing.

---

# Command Summary

| Command | Function |
|---------|--------|
| `kubectl rollout status` | Tracks the update |
| `kubectl rollout history` | Lists revisions |
| `kubectl rollout history --revision` | Shows a specific revision |
| `kubectl rollout undo` | Reverts to the previous revision |
| `kubectl rollout undo --revision` | Reverts to a specific revision |

---

# Summary

```text
Deployment

│

├── Revision 1

├── Revision 2

├── Revision 3

│

└── Rollback

        │

        ▼

New revision created
```

Each significant update generates a new revision.

When needed, we can quickly revert to previous versions using just one command.

---

# Conclusion

The revision history is one of the most valuable features of Deployments.

It offers traceability, facilitates audits, and allows for quickly recovering a stable application version in case of issues.

We also saw that rollback doesn't directly reuse an old revision: it creates a new rollout based on that configuration, preserving the entire Deployment history.

In the next and final article of the series, we will bring together all the concepts studied and explore best practices for working with Deployments in production environments, including manifest organization, Namespace usage, update strategies, and day-to-day recommendations.

---

## References

- [Kubernetes Documentation – Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Documentation – Rollback to a Previous Revision](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-to-a-previous-revision)
- [Kubernetes Documentation – kubectl rollout](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#rollout)
- [LINUXtips – Descomplicando Kubernetes](https://linuxtips.io/)
