---
title: Cloud Concepts for Azure Certification. Day 1 Notes
description: >-
  I started studying from scratch for the foundational Azure certification. In
  this post, I compile my notes on consumption model, multicloud, Azure Arc,
  deployment models, and shared responsibility.
date: '2026-08-06'
category: CLOUD
tags:
  - azure
  - cloud
  - az-900
  - certificacao
  - iaas
  - paas
  - saas
  - multicloud
  - terraform
  - azure-arc
draft: false
language: en
translationOf: conceitos-de-nuvem-para-a-certificacao-azure
sourceHash: a447dd1ec20dfc4cdd8ca8732fbcc84484a1bba984ca3e6b80a3995fc4784d39
---
I received a job offer that uses Azure, and to prepare, I started studying today for the platform's introductory certification. The exam is next week, so I decided to study from scratch and, at the same time, turn my notes into blog content.

This first day was all about concepts: how the cloud charges for what you use, deployment models (private, public, and hybrid), the shared responsibility model between provider and consumer, and an introduction to Azure services. No hands-on work yet, but it's the foundation that supports everything that comes next.

## Consumption-Based and Pricing Model

Cloud computing is consumption-based: you only pay for what you use and release the rest when you're done.

Therefore, this expense is treated as an **operational expense (OpEx)**, not as an **upfront investment in hardware (CapEx)**. The difference is important:

- **CapEx** is buying servers, setting up data centers, paying for capacity you might not even fully use.
- **OpEx** is renting exactly the capacity you are currently consuming, without a long-term commitment.

The practical advantage is adjusting resources to real demand: scaling up when needed, scaling down when no longer necessary, without paying for idle capacity. It also frees you from worries about power, cooling, and hardware — that's the provider's responsibility.

## Multicloud and Terraform

**Multicloud** is the scenario where you (or the company) use multiple public cloud providers simultaneously. Some reasons for this include:

- Using different resources from different providers, based on what each does best.
- Migrating from one provider to another.
- Redundancy: an application hosted on one provider and replicated on another, ensuring that if one goes down, the other takes over.

When talking about multicloud, the question immediately arises: *how do you manage resources across providers without going crazy?* That's where **Terraform** comes in, an Infrastructure as Code tool that provisions infrastructure on AWS, Azure, Google Cloud, and other providers using the same language.

Multicloud is the strategy, and Terraform is one of the tools that make it viable. Later on, I plan to dedicate a post (or a series) just to this: provisioning the same stack on two different providers and watching the magic happen.

### Azure Arc

**Azure Arc** is a set of technologies that extends Azure management and services to infrastructure running outside of Azure.

Practical example: you have a Kubernetes cluster running on AWS. Instead of managing this cluster through the AWS console, you register it with Arc and then command it — along with other resources — directly from Azure.

## Cloud Deployment Models

### Private cloud

An environment used by a single entity — in practice, the company's own data center. The advantage is control, but the cost is that the company maintains all management: maintenance, cooling, physical location, and responsible employees.

### Public cloud

An environment created, controlled, and maintained by a third-party cloud provider (Azure, AWS, Oracle Cloud, Google Cloud). These companies rent and provide services and space on their own infrastructure for other companies to contract.

### Hybrid cloud

It's a mix of the other two. Example: a company has its own data center and needs to scale horizontally for a determined period — it can add public cloud to its environment. At this point, the environment becomes hybrid: it scales horizontally as needed and then returns to its original size, according to demand.

### Some aspects of the public cloud

- No capital expenditure for scaling.
- Applications can be provisioned and deprovisioned quickly.
- You pay only for what you use.

## Shared Responsibility Model

In the shared responsibility model, security and management responsibilities are divided between the cloud provider and the consumer.

**Provider responsibilities:** physical security, power, cooling, and data center connectivity.

**Consumer responsibilities:**

- The information and data stored in the cloud.
- Devices permitted to connect to the environment (mobile phones, computers, etc.).
- Accounts and identities of people, services, and devices.

Where exactly this line is drawn depends on the contracted service model — and that's where **IaaS**, **PaaS**, and **SaaS** come in.

### IaaS, PaaS, and SaaS

| Item | IaaS | PaaS | SaaS |
|---|---|---|---|
| Physical datacenter, physical network, physical hosts | Provider | Provider | Provider |
| Operating system | Consumer | Provider | Provider |
| Applications | Consumer | Consumer | Provider |
| Identity and access | Consumer | Consumer | Provider* |

*A good example of this division: in PaaS and SaaS, identity and access are typically not shared — you continue to manage your own users, roles, and policies, while the provider runs the authentication platform (like Microsoft Entra ID). In pure SaaS, the responsibility shifts almost entirely to the provider.*

Summarizing the logic: **IaaS** places the greatest responsibility on the consumer, with the provider only handling basic issues (physical security, power, connectivity). **SaaS** reverses this — most of the responsibility rests with the provider. **PaaS** is the middle ground, distributing responsibility more evenly between the two sides.

## Basic Microsoft Azure Concepts

Azure is a cloud computing platform with an ever-expanding set of services. It can host everything from simple internet-facing web services to fully virtualized computers.

The main service groups I've seen so far:

| Category | Examples |
|---|---|
| Compute | VMs, Containers, Functions |
| Databases | SQL, CosmosDB, MySQL, PostgreSQL |
| Storage | Blob, Files, Queues, Tables |
| Networking | VNet, Load Balancer, DNS, CDN |
| IoT | IoT Hub, IoT Central, Edge Services |
| AI + ML | Azure OpenAI, AI Services, Machine Learning |

### What is cloud computing

It's the delivery of computing services over the internet. These services include IT infrastructure like compute (VMs), storage, databases, and networking.

Cloud computing services also expand traditional IT offerings to include items like IoT (Internet of Things) and ML (Machine Learning) — things that previously required dedicated teams and infrastructure and are now consumed as a service.

## Conclusion

It was a good first day: no command lines, but a conceptual foundation that will make it easier to understand the "why" behind the next steps — provisioning, identity, security, and governance in Azure.

The exam is next week, so I expect to publish more notes like these over the next few days as I progress through the rest of the content.

## References

- [Microsoft Learn — Cloud concepts (AZ-900)](https://learn.microsoft.com/pt-br/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/) — official learning path used as the basis for these notes.
- [Microsoft Learn — Shared responsibility model](https://learn.microsoft.com/pt-br/azure/security/fundamentals/shared-responsibility) — details the division of responsibilities between provider and consumer.
- [Microsoft Learn — What is Azure Arc](https://learn.microsoft.com/pt-br/azure/azure-arc/overview) — official documentation on Azure Arc.
- [Terraform — Official documentation](https://developer.hashicorp.com/terraform/docs) — Infrastructure as Code tool mentioned as an enabler for multicloud strategies.
