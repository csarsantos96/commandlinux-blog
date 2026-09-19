---
title: 'EBS, S3, EFS, and FSx: Choosing Storage on AWS'
description: >-
  Compare block, object, and file storage and understand the difference between
  EBS, instance store, S3, EFS, and FSx.
date: '2026-09-07'
category: CLOUD
tags:
  - aws
  - armazenamento
  - ebs
  - efs
  - cloud-practitioner
draft: false
language: en
translationOf: aws-armazenamento-ebs-s3-efs-fsx
sourceHash: 3f23837330d5121e1bfba40db6d5c5cb54d2e1da67b0dba67b4c2941fd81fcf8
series: AWS for the Cloud Practitioner
part: 10
totalParts: 12
---
Storing a website image, installing a server's operating system, and sharing a folder between applications are all storage needs. But applications access this data in different ways.

In Amazon Web Services (AWS), the choice starts with the access model: blocks, objects, or files. Capacity and price come after this basic compatibility.

## Three access models

In **block** storage, the operating system works with a device that can receive partitions and a file system. It's the model closest to a disk connected to a server.

In **object** storage, the application uses operations on objects identified by keys. A photo can be an object; the application requests its upload or download via the service interface.

In **file** storage, the application accesses a directory and file structure, usually mounted over the network. This model can serve applications that already expect shared file paths.

| Need | Service or resource to evaluate |
| --- | --- |
| Persistent volume for an instance | Amazon Elastic Block Store (EBS) |
| Temporary local storage | Instance store |
| Objects like images, documents, and backups | Amazon Simple Storage Service (S3) |
| Shared file system for Linux | Amazon Elastic File System (EFS) |
| File system with specific technology | Amazon FSx family |

## EBS and instance store: persistence is the central difference

EBS provides block volumes for Amazon Elastic Compute Cloud (EC2) instances. The volume is connected over the network and resides in an Availability Zone. To attach it normally to an instance, both must be in the same zone. [EBS overview](https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html).

Instance store uses local host storage. It is suitable for temporary data that can be reconstructed, such as intermediate processing files. It should not be the only copy of important data.

A normal reboot preserves your data, but stopping or terminating the instance causes it to be lost. With EBS, stopping the instance preserves the volumes; terminating can delete them depending on the configuration. [Instance lifecycle](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html).

Also, do not confuse persistence with backup. A file accidentally deleted can disappear from a perfectly healthy persistent volume.

## S3: objects within buckets

A bucket organizes objects. A key like `imagens/capa.png` identifies an object; the slashes can represent an organization by prefixes, without transforming the object interface into a local disk.

This comparison discusses S3 object access. Integrations that offer file interfaces over S3 data need to be evaluated separately; one should not assume that operations on objects have the same semantics as a file system.

S3 is an option for images, documents, backups, and data used by other applications. It does not depend on keeping an instance running to store objects. [General purpose buckets](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html).

## EFS: shared files

EFS provides a managed file system, accessible using Network File System (NFS), a network file system protocol. Multiple Linux instances can mount the same system and access shared files.

This helps when the application expects a network folder. However, sharing storage does not automatically resolve write conflicts: the application still needs to coordinate concurrent changes. There are also regional and single-zone options, with different resilience characteristics. [EFS documentation](https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html).

## FSx: which technology does the application require?

FSx is a family of file services, not a single universal storage type.

| Variant | Typical need |
| --- | --- |
| FSx for Windows File Server | Windows shares with Server Message Block (SMB) and Active Directory integration |
| FSx for Lustre | High-performance processing, such as simulations and data analysis |
| FSx for NetApp ONTAP | Applications that need ONTAP features and compatibility |
| FSx for OpenZFS | Workloads that need an OpenZFS-based file system |

Do not choose a variant just because the application runs on Linux or Windows. Confirm the required protocol, features, availability, and behavior. [FSx for Windows File Server](https://docs.aws.amazon.com/fsx/latest/WindowsGuide/what-is.html), [FSx system types](https://docs.aws.amazon.com/fsx/latest/APIReference/API_FileSystem.html).

## Scenario: servers that need the same files

A hypothetical application has three Linux instances and needs all of them to read the same files via file system paths. EFS is an option to consider.

If the application can work directly with objects, S3 can serve in another way. If the files are only temporary and reconstructible, local storage might be sufficient. The access requirement determines the comparison.

Do not assume that attaching an EBS volume to multiple instances creates a secure shared folder. There are specific multi-attach features, but they require compatible types and write coordination. They are not equivalent to the general use of a shared file system. [EBS Multi-Attach](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes-multi.html).

## Author's question for CLF-C02

Multiple Linux instances simultaneously need to mount the same managed file system using NFS. Which option best fits?

- **A.** Instance store of a single instance.
- **B.** Amazon EFS.
- **C.** A common EBS volume treated as a shared folder across zones.
- **D.** A name resolution service.

**Answer: B.** EFS supports shared access via NFS.

A is local and temporary storage. C assigns a role and scope to the volume that it does not offer in that manner. D does not store application files.

## Summary

Blocks address the disk model. Objects address access by keys and storage operations. Files address applications that expect a shared system. For certification, recognize these models; in practice, complete the choice with persistence, availability, and recovery.

## Official documentation

- [Amazon EBS](https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html)
- [EBS Multi-Attach](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes-multi.html)
- [Lifecycle and storage](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html)
- [S3 Buckets](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html)
- [Amazon EFS](https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html)
- [FSx for Windows File Server](https://docs.aws.amazon.com/fsx/latest/WindowsGuide/what-is.html)
- [FSx system types](https://docs.aws.amazon.com/fsx/latest/APIReference/API_FileSystem.html)
