---
title: 'Backups and Recovery on AWS: Snapshots, Backup, and Storage Gateway'
description: >-
  Differentiate snapshots, AWS Backup, Storage Gateway, and Elastic Disaster
  Recovery for planning copies, hybrid integration, and recovery.
date: '2026-09-07'
category: CLOUD
tags:
  - aws
  - backup
  - snapshots
  - storage-gateway
  - recuperacao
draft: false
language: en
translationOf: aws-backup-snapshots-storage-gateway-recuperacao
sourceHash: 4fea6a6cab38d1b5abf229d84ceca8b8ca24056011fbeea937f9372cb0beac63
series: AWS for Cloud Practitioners
part: 12
totalParts: 12
---
An application can have persistent storage and still lose data due to deletion, corruption, or a wrong change. And owning a copy doesn't prove that the system can resume operation within the necessary time.

In Amazon Web Services (AWS), snapshots, backup policies, hybrid integration, and server recovery address different parts of this problem.

## Snapshot: A Volume Recovery Point

An Amazon Elastic Block Store (EBS) snapshot records data from a volume to allow its recovery. Snapshots are incremental: after the first, new snapshots store the necessary changed blocks, while AWS manages the data composition to restore the volume.

In common regional use, a snapshot allows you to create a volume in another zone within the same region. To restore in another region, you need to copy the snapshot there. This does not move the original volume between zones. [EBS Snapshots](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html).

It is also necessary to consider application consistency. A block copy does not automatically represent a logically consistent copy of every ongoing transaction.

## Automate Snapshots or Centralize Backups?

Amazon Data Lifecycle Manager (DLM) automates operations such as EBS snapshot creation and retention through policies. It helps avoid a routine dependent on manual clicks. [DLM Documentation](https://docs.aws.amazon.com/ebs/latest/userguide/snapshot-lifecycle.html).

AWS Backup offers centralized backup management for supported resources. Plans define when to protect resources and for how long to retain recovery points; it is necessary to associate the resources and configure appropriate permissions. [AWS Backup](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html).

| Need | Resource to evaluate |
| --- | --- |
| Recover a volume from a point in time | EBS Snapshot |
| Automate the EBS snapshot lifecycle | DLM |
| Centralize backup policies for various supported resources | AWS Backup |

Avoid unintentionally overlapping policies: two routines protecting the same data can increase copies and costs without improving the recovery objective.

## Storage Gateway: Connecting On-Premises Storage to the Cloud

AWS Storage Gateway provides integration between on-premises applications and AWS storage. The mode depends on the interface expected by the application.

Amazon S3 File Gateway presents files via Network File System (NFS) or Server Message Block (SMB). Behind this interface, files are stored as objects in Amazon Simple Storage Service (S3), with local caching for access. This allows integration with an application that already works with file shares. [S3 File Gateway](https://docs.aws.amazon.com/filegateway/latest/files3/what-is-file-s3.html).

| Mode | Interface | Typical Use |
| --- | --- | --- |
| S3 File Gateway | Files via NFS or SMB | Send and access files stored as S3 objects |
| Volume Gateway | Blocks via Internet Small Computer Systems Interface (iSCSI) | On-premises volumes integrated with cloud storage and snapshots |
| Tape Gateway | Virtual tape library | Integrate backup applications that work with tapes |

Volume Gateway and Tape Gateway have their own storage and recovery models. They are not alternative names for File Gateway. [Volume Gateway](https://docs.aws.amazon.com/storagegateway/latest/vgw/WhatIsStorageGateway.html), [Tape Gateway](https://docs.aws.amazon.com/storagegateway/latest/tgw/WhatIsStorageGateway.html).

## Recovering Servers with Elastic Disaster Recovery

AWS Elastic Disaster Recovery, identified as DRS, maintains replication to support server recovery in AWS. The team prepares the recovery configuration, tests it, and initiates the necessary procedures when an incident occurs. [Elastic Disaster Recovery Documentation](https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html).

It is not just a backup vault nor automatic protection against every error. If corruption occurs at the source, it can also affect replicated data. Earlier points, isolation, and recovery procedures must be part of the strategy.

## Two Objectives Guiding the Choice

The Recovery Point Objective (RPO) expresses how much data loss over time the business accepts. The Recovery Time Objective (RTO) expresses how long the system can take to recover. [Definition of Recovery Objectives](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_planning_for_recovery_objective_defined_recovery.html).

In a hypothetical example, the company accepts losing up to an hour of changes and needs to recover within four hours. The protection frequency and restoration process must demonstrate that they can meet these objectives.

These values are example requirements, not service outcome promises. Testing restoration includes verifying data, permissions, network, and application functionality.

## When to Use and When Not to Use

Use snapshots for volume recovery points, Backup for centralized policies, and Storage Gateway when on-premises applications need integration with cloud storage. Evaluate DRS when the problem is recovering replicated servers and applications.

Do not introduce a hybrid gateway if the application already directly accesses the appropriate storage and does not need that interface. And do not confuse replication, backup, and high availability: each mechanism covers different risks and times.

## Author's Question for CLF-C02

A company maintains an on-premises application that writes files via SMB. It wants to store these files as objects in S3 and maintain local cache. Which option addresses this scenario?

- **A.** S3 File Gateway.
- **B.** Tape Gateway, because any file needs to be converted to tape.
- **C.** DLM, because it presents SMB shares.
- **D.** An isolated EBS snapshot, because it functions as a local file server.

**Answer: A.** The S3 File Gateway offers the file interface and integration described.

B addresses virtual tape-based workflows. C automates snapshot lifecycles, not SMB shares. D is a volume recovery point, not a local file access service.

## Summary

A copy is part of the plan, not its proof. Define what needs to be recovered, the acceptable loss, and the recovery time. Choose compatible mechanisms and validate the restoration. For certification, differentiate between volume protection, centralized policy, hybrid integration, and server recovery.

## Official Documentation

- [EBS Snapshots](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html)
- [Data Lifecycle Manager](https://docs.aws.amazon.com/ebs/latest/userguide/snapshot-lifecycle.html)
- [AWS Backup](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html)
- [S3 File Gateway](https://docs.aws.amazon.com/filegateway/latest/files3/what-is-file-s3.html)
- [Volume Gateway](https://docs.aws.amazon.com/storagegateway/latest/vgw/WhatIsStorageGateway.html)
- [Tape Gateway](https://docs.aws.amazon.com/storagegateway/latest/tgw/WhatIsStorageGateway.html)
- [Elastic Disaster Recovery](https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html)
- [Recovery Objectives](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_planning_for_recovery_objective_defined_recovery.html)
