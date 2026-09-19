---
title: 'Amazon S3: Storage Classes, Protection, and Lifecycle'
description: >-
  Understand how to choose S3 classes and combine versioning, permissions, and
  lifecycle without confusing durability with availability.
date: '2026-09-07'
category: CLOUD
tags:
  - aws
  - s3
  - armazenamento
  - seguranca
  - cloud-practitioner
draft: false
language: en
translationOf: amazon-s3-classes-seguranca-ciclo-de-vida
sourceHash: ce2e74867014c0237d58309059eab10ccfe100cf65e624d2090633e58339722c
series: AWS for the Cloud Practitioner
part: 11
totalParts: 12
---
An image accessed daily and a file stored for years do not need the same combination of cost and retrieval. In Amazon Simple Storage Service (S3), from Amazon Web Services (AWS), storage classes help adjust this choice.

Before selecting the cheapest class, ask how often the object will be read and how long the application can wait to retrieve it.

## Durability is not availability

**Durability** refers to data preservation. **Availability** refers to the ability to access the service and data when needed.

An object might be preserved in an archive class and require restoration before reading. Similarly, a class that stores data in a single zone has a different fault tolerance profile than a class that distributes data across zones.

It is also necessary to distinguish physical failure from authorized deletion. High durability does not prevent an application with permission from deleting an object.

## Classes for different access patterns

In classes with IA in the name, the acronym stands for *Infrequent Access*. The table summarizes the classes present in the notes and is not intended to list the entire service catalog.

| Class | Usage Profile | Access |
| --- | --- | --- |
| S3 Standard | Frequent access | Low latency |
| S3 Intelligent-Tiering | Variable or unknown frequency | Depends on the tier used |
| S3 Standard-IA | Infrequent access, but fast read required | Low latency, with retrieval charge |
| S3 One Zone-IA | Infrequent access to re-creatable data | Low latency, in a single zone |
| S3 Glacier Instant Retrieval | Rarely accessed archive, with immediate read | Milliseconds |
| S3 Glacier Flexible Retrieval | Archive that accepts wait time | Restoration in minutes or hours, depending on mode |
| S3 Glacier Deep Archive | Long-term archive that accepts longer wait time | Restoration in hours, depending on mode |

Also check minimum duration, minimum billable size, and retrieval and transition costs. The price per stored capacity alone does not represent the total cost. [S3 Storage Classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html).

## Intelligent-Tiering does not always mean immediate access

Intelligent-Tiering monitors access patterns and moves objects between tiers. Its immediate access tiers support low-latency reads, but there are optional archive tiers that require restoration.

Therefore, enabling optional archiving changes the retrieval commitment. It's a good option to evaluate for uncertain frequency, provided that the enabled features are compatible with the acceptable wait time. [How Intelligent-Tiering works](https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering-overview.html).

## Lifecycle follows data age

Lifecycle rules can move objects between classes or expire them. They are useful when the pattern is known: for example, documents frequently accessed initially and rarely thereafter.

The design needs to consider transition and retention restrictions. Moving an object for a short time to a class with a minimum duration might not generate the expected savings.

A policy can also delete data. Before applying it, define which objects and versions it affects. An incorrect filter can impact much more content than planned.

## Versioning, access, and encryption

Versioning keeps object versions and helps recover from accidental overwrites and deletions. In a versioned bucket, a simple deletion typically creates a delete marker; it is not equivalent to permanently removing all versions. Versions also consume storage and can be deleted by those with permission. [S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html).

AWS Identity and Access Management (IAM), the identity and access management service, and bucket policies help define who can perform operations. S3 Block Public Access helps prevent unintended public exposure.

Encryption protects data but does not replace authorization. If an identity has legitimate access to the object and the necessary keys, the encrypted object can still be read by that identity. The customer needs to configure permissions and protection compatible with the usage. [S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html).

## Scenario: portal documents and images

A hypothetical portal maintains public images and internal documents. The team separates permissions to avoid exposing documents just because images need to be delivered to visitors.

Recent documents have fast read access. Older ones can move to an archive class if retrieval can wait. However, an image that needs to appear immediately on a page should not depend on a lengthy restoration.

To distribute public content, you can use Amazon CloudFront with a private S3 origin and Origin Access Control. A private bucket does not prevent this design; authorization must allow access from the distribution service. [Buckets and Public Access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html).

## Common errors and CLF-C02 focus

Do not treat all Glacier classes as equally slow. Do not assume all classes use multiple zones. Avoid associating the lowest storage price with the lowest total cost, and do not use versioning as a substitute for access control.

In certification, the most useful indicators are access frequency, retrieval time, ability to recreate data, and need for protection.

## Author's question

A company archives rarely accessed documents but requires reads to occur in milliseconds, without a prior restoration step. Which class matches this profile?

- **A.** S3 Glacier Deep Archive.
- **B.** S3 Glacier Flexible Retrieval.
- **C.** An optional asynchronous archive tier of Intelligent-Tiering.
- **D.** S3 Glacier Instant Retrieval.

**Answer: D.** This class combines archiving with millisecond access.

A and B require restoration before reading. C also represents asynchronous access, incompatible with the requirement. The final cost choice still depends on volume and retrieval frequency.

## Summary

Choose the class by frequency and acceptable wait time. Use lifecycle for known patterns and check the enabled tiers in Intelligent-Tiering. Combine versioning with appropriate permissions: preserving data, making it available, and controlling access are distinct problems.

## Official documentation

- [Storage Classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)
- [Intelligent-Tiering](https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering-overview.html)
- [Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html)
- [Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [Buckets and Configurations](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html)
