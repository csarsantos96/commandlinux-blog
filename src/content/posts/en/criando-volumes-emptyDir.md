---
title: Configuring emptyDir volumes in Kubernetes Pods
description: >-
  Learn how to create and mount a temporary emptyDir volume in a Kubernetes Pod,
  define its storage limit, and test its functionality.
date: '2026-07-21'
category: Kubernetes
tags:
  - kubernetes
  - volumes
  - emptydir
  - pods
  - kubectl
  - yaml
draft: false
language: en
translationOf: criando-volumes-emptyDir
sourceHash: 68fca01733b101de3e19b13e257875a539e79d1d9065e7bbb3dc86de43c61a7a
series: Kubernetes Fundamentals
part: 4
totalParts: 4
---
------------------------------

# Configuring emptyDir volumes in Kubernetes Pods

Containers are, by nature, ephemeral. This means that files created within a container's filesystem can be lost when the container is recreated.

In some situations, however, we need to store temporary files during a Pod's execution or share data between containers that are part of the same Pod.

For these cases, Kubernetes provides the `emptyDir` volume.

In this article, we will create a Pod using an Nginx image, mount an `emptyDir` volume in the `/giropops` directory, and test its functionality.

## What is an emptyDir volume?

An `emptyDir` is a temporary volume created when the Pod starts.

As the name indicates, it starts as an empty directory. The Pod's containers can mount this volume and use the space to store temporary files.

An important characteristic is that the volume belongs to the **Pod**, and not directly to the container.

Therefore:

*   if the container restarts, the files remain available;
*   if the Pod is removed, the files are deleted;
*   if another Pod is created, it will receive a new empty `emptyDir`.

This type of volume should not be used to store information that needs to remain available after the Pod is deleted.

## Creating the Pod manifest

Let's create the `pod-emptydir.yaml` file with the following content:

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: coringao
  name: coringao

spec:
  containers:
    - image: nginx
      name: webserver

      volumeMounts:
        - mountPath: /giropops
          name: primeiro-emptydir

      resources:
        limits:
          cpu: "1.5"
          memory: "128Mi"
        requests:
          cpu: "0.5"
          memory: "64Mi"

  dnsPolicy: ClusterFirst
  restartPolicy: Always

  volumes:
    - name: primeiro-emptydir
      emptyDir:
        sizeLimit: "256Mi"
```

In this manifest, we create a Pod named `coringao` containing a single container named `webserver`.

The container uses the official Nginx image:

```yaml
image: nginx
name: webserver
```

We also define CPU and memory requests and limits:

```yaml
resources:
  limits:
    cpu: "1.5"
    memory: "128Mi"
  requests:
    cpu: "0.5"
    memory: "64Mi"
```

The container requests half a CPU core and `64 MiB` of memory, being able to use a maximum of `1.5` CPU and `128 MiB` of memory.

## Declaring the emptyDir volume

The volume is declared within `spec.volumes`:

```yaml
volumes:
  - name: primeiro-emptydir
    emptyDir:
      sizeLimit: "256Mi"
```

The `name` field identifies the volume within the Pod:

```yaml
name: primeiro-emptydir
```

The `emptyDir` field, on the other hand, tells Kubernetes that we want to create a temporary volume:

```yaml
emptyDir:
```

We also define a storage limit of `256 MiB`:

```yaml
sizeLimit: "256Mi"
```

By default, `emptyDir` uses the temporary storage available on the node where the Pod is running.

## Mounting the volume in the container

Declaring a volume does not mean it will be automatically available inside the container.

We need to mount it using `volumeMounts`:

```yaml
volumeMounts:
  - mountPath: /giropops
    name: primeiro-emptydir
```

The `mountPath` field indicates which directory in the container the volume will be mounted to:

```yaml
mountPath: /giropops
```

The `name` field, on the other hand, must be exactly the same as the name provided in `spec.volumes`:

```yaml
name: primeiro-emptydir
```

The association happens by name:

```yaml
volumeMounts:
  - name: primeiro-emptydir
```

```yaml
volumes:
  - name: primeiro-emptydir
```

If the names are different, Kubernetes will not be able to identify which volume should be mounted in the container.

## Validating the manifest

Before creating the resource, we can validate the file locally using:

```bash
kubectl apply --dry-run=client -f pod-emptydir.yaml
```

If the manifest is correct, output similar to this will be shown:

```text
pod/coringao created (dry run)
```

The `--dry-run=client` validates the manifest structure without creating the Pod in the cluster.

## Creating the Pod

After validation, we apply the manifest:

```bash
kubectl apply -f pod-emptydir.yaml
```

The expected output is:

```text
pod/coringao created
```

We can monitor the Pod's status with:

```bash
kubectl get pods
```

Example:

```text
NAME       READY   STATUS    RESTARTS   AGE
coringao   1/1     Running   0          10s
```

When the `STATUS` field is `Running`, the container is executing.

## Entering the container

To verify if the volume was mounted correctly, we can open a terminal inside the container:

```bash
kubectl exec -ti coringao -- sh
```

Inside the container, we execute:

```bash
ls
```

The `/giropops` directory will appear among the available directories:

```text
bin
boot
dev
docker-entrypoint.d
docker-entrypoint.sh
etc
giropops
home
lib
lib64
media
mnt
opt
proc
root
run
sbin
srv
sys
tmp
usr
var
```

This indicates that the volume was mounted at the path defined in the manifest.

## Creating files in emptyDir

Now we can create files inside the volume:

```bash
touch /giropops/CORINTHIANS
touch /giropops/VAI
```

Next, we list the content:

```bash
ls /giropops
```

The output will be:

```text
CORINTHIANS  VAI
```

We can also use one item per line:

```bash
ls -1 /giropops
```

Output:

```text
CORINTHIANS
VAI
```

The files were written to the `emptyDir` volume, not directly to the container's writable layer.

## Checking the volume mount

Another way to check if the volume is mounted is to use:

```bash
kubectl exec coringao -- mount
```

We can filter only the mount related to the `/giropops` directory:

```bash
kubectl exec coringao -- mount | grep giropops
```

We can also check the available space:

```bash
kubectl exec coringao -- df -h /giropops
```

## Modifying an existing Pod

During configuration, it can happen that a Pod with the same name already exists.

When trying to add the volume or modify fields such as container name, resources, and mounts, Kubernetes may show the following error:

```text
The Pod "coringao" is invalid: spec: Forbidden:
pod updates may not change fields
```

This happens because much of a Pod's specification is immutable after it is created.

For example, we cannot directly add a new volume to a Pod that is already running.

In this case, we need to remove the old Pod:

```bash
kubectl delete pod coringao
```

Then, we recreate the resource using the updated manifest:

```bash
kubectl apply -f pod-emptydir.yaml
```

There is also the command:

```bash
kubectl replace --force -f pod-emptydir.yaml
```

The `--force` removes the existing resource and creates another based on the new manifest.

In real environments, we typically don't manage individual Pods this way. We usually use resources like `Deployment`, which are responsible for creating and replacing Pods automatically.

## Common errors when configuring volumeMounts

A common error is to use `volumeMount` in the singular:

```yaml
volumeMount:
```

The correct field is `volumeMounts`, in the plural:

```yaml
volumeMounts:
```

Another possible error is incorrectly writing the `sizeLimit` field.

Incorrect:

```yaml
sizeLImit: "256Mi"
```

Correct:

```yaml
sizeLimit: "256Mi"
```

Kubernetes manifest fields are case-sensitive.

It is also important to ensure that the name provided in `volumeMounts` is the same as the name declared in `volumes`.

Incorrect:

```yaml
volumeMounts:
  - name: primeiro-volume
```

```yaml
volumes:
  - name: primeiro-emptydir
```

Correct:

```yaml
volumeMounts:
  - name: primeiro-emptydir
```

```yaml
volumes:
  - name: primeiro-emptydir
```

## Testing emptyDir behavior

The main concept of `emptyDir` is that the volume follows the Pod's lifecycle.

If only the container restarts, the files remain in the volume.

However, if the Pod is deleted:

```bash
kubectl delete pod coringao
```

And created again:

```bash
kubectl apply -f pod-emptydir.yaml
```

The new volume will be created empty.

When executing:

```bash
kubectl exec coringao -- ls -1 /giropops
```

The `CORINTHIANS` and `VAI` files will no longer be available.

This happens because the new Pod has a new instance of the `emptyDir` volume.

We can summarize its behavior as follows:

```text
Container restart  → data remains
Pod deletion       → data is removed
New Pod creation   → a new emptyDir is created
```

## When to use emptyDir?

`emptyDir` can be used for:

*   storing temporary files;
*   maintaining caches during Pod execution;
*   sharing files between containers in the same Pod;
*   saving intermediate processing results;
*   making files produced by one container available to another container.

For example, one container can generate files within the volume while another container processes them or makes them available via a web server.

Since the volume does not survive Pod deletion, it is not suitable for databases, important uploads, or any information that needs to be stored permanently.

For persistent data, we should use resources like `PersistentVolume` and `PersistentVolumeClaim`.

## Conclusion

In this article, we created a Pod using the Nginx image and configured a temporary `emptyDir` volume.

The volume was declared in `spec.volumes`:

```yaml
volumes:
  - name: primeiro-emptydir
    emptyDir:
      sizeLimit: "256Mi"
```

Then, it was mounted in the container via `volumeMounts`:

```yaml
volumeMounts:
  - mountPath: /giropops
    name: primeiro-emptydir
```

We also entered the container, verified the `/giropops` directory, and created the `CORINTHIANS` and `VAI` files to test data writing.

The most important point to remember is that `emptyDir` follows the Pod's lifecycle: it survives a container restart, but its data is removed when the Pod ceases to exist.

# References

## Official documentation

Kubernetes Documentation. Volumes — emptyDir. Available at: https://kubernetes.io/docs/concepts/storage/volumes/#emptydir

Kubernetes Documentation. Configure a Pod to Use a Volume for Storage. Available at: https://kubernetes.io/docs/tasks/configure-pod-container/configure-volume-storage/

Kubernetes Documentation. Ephemeral Volumes. Available at: https://kubernetes.io/docs/concepts/storage/ephemeral-volumes/

Kubernetes Documentation. Local Ephemeral Storage. Available at: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#local-ephemeral-storage

Kubernetes Documentation. Resource Management for Pods and Containers. Available at: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/

Kubernetes Documentation. kubectl apply. Available at: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_apply/

Kubernetes Documentation. kubectl exec. Available at: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_exec/

Kubernetes Documentation. kubectl delete. Available at: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_delete/

## Supplemental material

LINUXtips. PICK – Intensive Containers and Kubernetes Program. Available at: https://linuxtips.io/pick/

LINUXtips. Demystifying Kubernetes. Available at: https://linuxtips.io/courses/
