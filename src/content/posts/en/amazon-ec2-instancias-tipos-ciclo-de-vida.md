---
title: 'Amazon EC2: Instances, Types, and Lifecycle'
description: >-
  Learn what an EC2 instance is, how to choose your instance type, and what
  happens to data when restarting, stopping, or terminating a server.
date: '2026-09-07'
category: CLOUD
tags:
  - aws
  - ec2
  - cloud-practitioner
  - computacao
  - instancias
draft: false
language: en
translationOf: amazon-ec2-instancias-tipos-ciclo-de-vida
sourceHash: c208d944931db24f7ec37e541848de7d34eb48ec759bfd1a83f1517c7c20dc16
series: AWS for the Cloud Practitioner
part: 2
totalParts: 12
---
You need to run an application, choose the operating system, and install the packages it uses. On Amazon Web Services (AWS), Amazon Elastic Compute Cloud (EC2) offers compute capacity for this type of need.

The main point is to understand the trade-off: you gain control over the server, but you also take on the work of administering it.

## What is an instance?

An **EC2 instance** is a server in the cloud. In most common use, it functions as a virtual machine: it has processing, memory, network, and storage access. You install and run the necessary software in this environment.

To create one, you choose an Amazon Machine Image (AMI), the machine image that serves as the system's base, and an instance type, which defines its resource profile. The image is not the running instance. [EC2 concepts](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html).

Think of a recipe and the prepared dish: the image provides the basis for creating servers; the instance is one of those servers running. Changing an instance does not automatically update the original image.

## How to choose the instance type

A central processing unit, or CPU (*Central Processing Unit*), executes instructions. Memory holds data used by processes. Network and storage also limit performance. Therefore, looking only at the amount of processing can lead to a bad choice.

| Category | Priority | Typical scenario |
| --- | --- | --- |
| General Purpose | Balance of resources | Web applications and development |
| Compute Optimized | Processing | Calculations and CPU-intensive tasks |
| Memory Optimized | Memory capacity | In-memory databases and large caches |
| Accelerated Computing | Hardware accelerators | Model training and specialized processing |
| Storage Optimized | Local storage performance | Read and write intensive workloads |

These categories guide the choice. The specific type must be compatible with the software and the observed bottleneck. Training a model, for example, might require a graphics processing unit, or GPU (*Graphics Processing Unit*), instead of just more CPU. [Instance types](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-types.html).

## What you configure

Besides the image and type, you need to define where the instance will be created, its storage, and access rules. An instance needs appropriate network paths and permissions to communicate; being powered on does not mean it's accessible via the internet.

In the common EC2 usage model, the customer manages the guest operating system, installed programs, and their security configurations. Tools can automate this work, but selection and configuration are still necessary.

## Reboot, stop, and terminate

These operations have different consequences, especially for data.

| Operation | What happens | Storage consideration |
| --- | --- | --- |
| Reboot | Restarts the operating system | Instance store data remains during normal reboot |
| Stop | Shuts down a compatible instance to start it later | Persistent volumes remain; instance store data is lost |
| Terminate | Permanently removes the instance | Volumes may be deleted according to their configuration |

Amazon Elastic Block Store (EBS) provides persistent volumes. However, persistent does not mean impossible to delete: the `DeleteOnTermination` setting controls the fate of the volume when the instance is terminated. The root volume is usually deleted by default.

A stopped instance can also continue to incur costs for associated resources, such as volumes. [Lifecycle and billing for instance states](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html).

## When to use — and when to evaluate other options

EC2 makes sense when the application requires operating system control, specific dependencies, or processes that need to remain running.

If the need is to run a short function in response to events, evaluate AWS Lambda. If the goal is to run containers without managing the underlying servers, evaluate AWS Fargate. If it's just delivering static files, you might not even need to maintain an application server.

These alternatives do not make EC2 obsolete. They change the division of responsibilities and the environment boundaries.

## Scenario: an application with its own dependencies

Imagine an internal system that depends on specific Linux libraries and needs to run continuously. The team can create an instance from a compatible image, install the dependencies, and keep important data in persistent storage with backup.

Then, they observe actual usage. If memory runs out, increasing only processing might not help. And if the application needs to remain available during a failure, the solution requires redundancy beyond the scaling of this single machine.

## Common mistakes and review for CLF-C02

Do not confuse an image with a server, temporary storage with persistent, or stopping with deletion. Another confusion is to imagine that AWS automatically updates all packages you installed on the instance.

For the certification, practice associating the need with the compute profile: system control, memory, processing, or acceleration. Memorizing family names without understanding the workload helps little.

## Author's question

An application needs control over the operating system and keeps a large dataset in memory during processing. Which option should be evaluated first?

- **A.** A memory-optimized EC2 instance.
- **B.** A bucket used only for storing objects.
- **C.** A domain registration service.
- **D.** A storage volume without an associated compute resource.

**Answer: A.** It combines operating system control with a profile suited to the described need.

B stores objects but does not run this system. C handles domain names. D provides storage but does not replace the server that will run the application.

## Summary

EC2 offers control over compute. The image defines the server's base, the type defines its resources, and the lifecycle influences data and costs. Choose the profile based on application behavior and plan for persistence, security, and recovery from the start.

## Official documentation

- [What is Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html)
- [Instance types](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-types.html)
- [Lifecycle](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html)
- [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
