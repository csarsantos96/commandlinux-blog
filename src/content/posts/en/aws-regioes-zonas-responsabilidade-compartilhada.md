---
title: 'AWS Regions, Zones, and Shared Responsibility'
description: >-
  Understand AWS regions, availability zones, and edge locations, and learn what
  responsibilities remain yours in the cloud.
date: '2026-09-07'
category: CLOUD
tags:
  - aws
  - cloud-practitioner
  - regioes
  - disponibilidade
  - responsabilidade-compartilhada
draft: false
language: en
translationOf: aws-regioes-zonas-responsabilidade-compartilhada
sourceHash: f053ad1b24e6a02161ccbc94dd35543714ecda7df56b0f67517761b21ea5cdf2
series: AWS for the Cloud Practitioner
part: 1
totalParts: 12
---
Placing an application in the cloud doesn't, by itself, answer where it runs, what failures it tolerates, or who should update its system. These decisions still exist.

This first article organizes three fundamentals of Amazon Web Services (AWS): resource location, availability, and shared responsibility. These concepts help both in preparing for the Cloud Practitioner, CLF-C02 exam, and in making initial architecture decisions.

## Region, zone, and edge are different things

A **region** is a geographical area where AWS maintains infrastructure. São Paulo, identified by `sa-east-1`, is an example. You choose the region when creating many of your application's resources.

Within a region, there are availability zones, or **AZs**, from *Availability Zones*. Each zone gathers one or more data centers, with physical isolation from other zones. They communicate via low-latency connections. This separation allows resources to be distributed to reduce the impact of a localized failure. [Availability Zone documentation](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-availability-zones.html).

An edge location, on the other hand, brings certain services closer to users. Amazon CloudFront uses these locations to deliver content. An edge is not a smaller region where you simply create the same resources.

| Concept | Question it helps answer | Decision example |
| --- | --- | --- |
| Region | In which geographical area will the resource be located? | Create the application in São Paulo |
| Availability Zone | How to separate resources against local failures? | Distribute servers across two zones |
| Edge location | How to bring delivery closer to the user? | Distribute content with CloudFront |

## How to choose a region

Start with project requirements: permitted data location, required services, latency for the audience, and cost. A nearby region can reduce latency, but geographical distance doesn't replace a measurement of the actual network path.

It also doesn't help to choose a region solely based on price if the necessary resource isn't available there. And a mandatory data residency restriction must be respected during selection, not treated as an optional detail. AWS presents these factors in its [guidance on regions](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html).

## Two instances don't automatically mean high availability

Imagine an application with two servers in the same zone. It might continue functioning if one server fails, but both still share the risk of unavailability for that zone.

Distributing servers across two zones reduces this dependency. However, the application must be able to serve requests using the remaining resources. If everything depends on a single unavailable database, merely duplicating the servers doesn't solve the complete problem.

The same applies to capacity: the side that remains functioning must support the load or be able to scale within an acceptable timeframe.

## Who takes care of what?

The **shared responsibility model** separates the protection of the AWS infrastructure from the configurations and data controlled by the customer. The boundary varies depending on the service used. [Official shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/).

| Responsibility | AWS | Customer |
| --- | --- | --- |
| Physical security of data centers | Yes | Does not manage this layer |
| Infrastructure hardware | Yes | Does not manage this layer |
| Operating system of a customer-managed Amazon Elastic Compute Cloud (EC2) instance | Underlying infrastructure | Updates and configuration of the guest operating system |
| Application data and access permissions | Protection of managed layers | Classification, access, and proper configuration |

A managed service transfers part of the operational work. It doesn't automatically decide who should access your documents or what permissions your application actually needs.

## A realistic scenario

Consider a hypothetical store whose audience is in Brazil. The team checks if São Paulo meets the requirements, distributes the application layer across two zones, and prepares the data layer for failures.

Cacheable content is delivered by CloudFront. When a valid copy is available at the edge, the service can respond without fetching the content from the origin again. This improves delivery but does not create a complete replica of the application. [How CloudFront works](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html).

## When to use more than one region

A multi-region architecture can meet recovery objectives or distributed audiences. It also requires dealing with replication, consistency, routing, operations, and additional costs.

It's not a requirement for every application. If the requirement is to survive a zone failure, starting with a well-designed multi-zone architecture might be sufficient. The decision comes from the availability requirement, not the number of boxes in the diagram.

## For the certification: avoid these confusions

A region is not a zone. An edge does not replace a region. Resources in multiple zones help with availability, but the application needs to leverage this distribution. And security in the cloud still includes customer responsibilities.

The focus here is to recognize the role of each concept, in line with the [official CLF-C02 guide](https://docs.aws.amazon.com/pdfs/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.pdf).

## Author's question

A company wants to reduce the impact of a zone's unavailability while keeping the application in a single region. Which approach best meets this objective?

- **A.** Place all servers in a single zone and increase their memory.
- **B.** Distribute redundant components across different zones and prepare the application for failures.
- **C.** Register a second domain for the same server.
- **D.** Use an edge location as a substitute for the application's entire infrastructure.

**Answer: B.** Distributing across zones reduces dependence on a single point of failure, provided the remaining components can maintain service.

Alternative A increases resources but maintains zone dependence. C changes names without creating redundancy. D confuses edge delivery with the execution and redundancy of the entire application.

## Summary

Choose the region based on project requirements. Use zones to separate resources subject to local failures. Use an edge when it helps with delivery. In any of these choices, verify what the service manages and what remains your responsibility.

## Official documentation

- [AWS Regions](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html)
- [Availability Zones](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-availability-zones.html)
- [Shared responsibility](https://aws.amazon.com/compliance/shared-responsibility-model/)
- [Amazon CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
