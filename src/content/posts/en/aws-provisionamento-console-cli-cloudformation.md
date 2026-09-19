---
title: 'Provisioning on AWS: Console, CLI, CloudFormation, and Managed Services'
description: >-
  Learn how to create AWS resources and differentiate between CloudFormation,
  Elastic Beanstalk, Batch, Lightsail, and Outposts.
date: '2026-09-07'
category: CLOUD
tags:
  - aws
  - cloudformation
  - automacao
  - infraestrutura-como-codigo
  - cloud-practitioner
draft: false
language: en
translationOf: aws-provisionamento-console-cli-cloudformation
sourceHash: 03b86531b21aeaf688cf4910d00b028bc6eaa876fc42e839d4a5c5bb1d30cfcc
series: AWS for the Cloud Practitioner
part: 7
totalParts: 12
---
You can create a resource by clicking in the console, running a command, or applying an infrastructure description. The result may involve the same services, but the way you work changes significantly.

In Amazon Web Services (AWS), it's worth distinguishing **the interface used to request an operation** from **the service that manages an environment for you**.

## Interfaces access APIs

An Application Programming Interface (API) allows you to request operations from a service. The console and automation tools use these interfaces to create, query, and modify resources.

| Access method | How you work | Typical use |
| --- | --- | --- |
| AWS Management Console | Graphical interface | Explore resources and perform manual operations |
| AWS Command Line Interface (CLI) | Commands in the terminal | Queries and scripts |
| Software Development Kit (SDK) | Libraries in the application's language | Integrate code with services |
| AWS CloudFormation | Infrastructure description | Create and update resource sets |

Changing the interface does not exempt from authentication or permissions. A command does not gain access to a resource just by being executed in the terminal. The EC2 documentation gathers examples of these [access methods](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html#access-ec2).

## CloudFormation: Infrastructure described in code

Infrastructure as Code (IaC) allows you to record configurations in files that can be reviewed and versioned.

In CloudFormation, a template describes resources. A **stack** gathers the resources managed from that template. The service organizes provisioning and necessary dependencies.

This is different from maintaining a list of clicks to repeat manually. The template can be reapplied to create similar environments, with specific values for each environment. [How CloudFormation works](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html).

Changes still need to be reviewed: a property change may require resource replacement. Declaring infrastructure does not eliminate the impact of deleting or recreating something that contains data.

## Provisioning is not the same as application deployment

Provisioning creates and configures infrastructure. Deploying places a version of the application in the environment. Some tools cover parts of both processes, but the responsibilities remain distinguishable.

Imagine a team creating test and production environments. CloudFormation can describe the resources and their configurations. The team still needs to define how they build the application, how they publish versions, and how they verify if the deployment worked.

## When a managed service simplifies the work

This section also presents services that address more specific needs than a general provisioning tool.

| Service | Main need | Comparison limit |
| --- | --- | --- |
| Elastic Beanstalk | Deploy applications on supported platforms | Not just a template editor |
| AWS Batch | Schedule and execute batch processing | Not the natural choice for responding to every website click |
| Amazon Lightsail | Create environments with a simplified experience and resource bundles | Does not remove maintenance of the software you manage |
| AWS Outposts | Use AWS infrastructure in on-premises environment | Not an alternative console interface |

Elastic Beanstalk provisions resources for the application and helps manage the environment. Depending on the configuration, this includes instances, load balancing, and scaling. You remain responsible for the code and environment choices; the resources used are charged. [Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html).

Batch organizes jobs and compute capacity for batch tasks. A queue of thousands of files to process is a scenario closer to its purpose than a page that needs to respond immediately. [AWS Batch](https://docs.aws.amazon.com/batch/latest/userguide/what-is-batch.html).

Lightsail offers a simplified experience with resources grouped into plans. A small website can take advantage of this, but package predictability does not mean an absence of limits or additional costs. [Amazon Lightsail](https://docs.aws.amazon.com/lightsail/latest/userguide/what-is-amazon-lightsail.html).

Outposts extends compatible AWS infrastructure and services to on-premises facilities. It can meet local processing and low-latency needs with nearby systems; it requires physical planning and connectivity. It does not automatically make the entire regional catalog available in the data center. [AWS Outposts](https://docs.aws.amazon.com/outposts/latest/userguide/what-is-outposts.html).

## How to decide without mixing categories

If the difficulty is repeating infrastructure consistently, evaluate IaC. If the team wants to deliver an application on a supported platform with less manual assembly, evaluate Beanstalk. If you need to manage thousands of batch tasks, evaluate Batch.

Do not use a deployment platform as an automatic substitute for a data recovery strategy. And do not choose on-premises infrastructure when the project only needs conventional hosting in a region.

## Practice Question for CLF-C02

A team wants to describe AWS resources in templates and manage these resources as a reproducible unit. Which service directly addresses this objective?

- **A.** AWS CloudFormation.
- **B.** AWS Outposts.
- **C.** AWS Batch.
- **D.** Amazon Lightsail only by offering resource plans.

**Answer: A.** Templates and stacks are the infrastructure management mechanisms described in the scenario.

B addresses infrastructure extension to the on-premises environment. C organizes batch jobs. D simplifies hosting, but the characteristic mentioned does not correspond to management via templates and stacks.

## Summary

Console, CLI, and SDK are forms of interaction. CloudFormation describes and manages infrastructure. Beanstalk, Batch, Lightsail, and Outposts address specific needs for deployment, processing, simplicity, and location. For the certification, identify the problem before associating it with a service name.

## Official documentation

- [CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html)
- [Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html)
- [AWS Batch](https://docs.aws.amazon.com/batch/latest/userguide/what-is-batch.html)
- [Amazon Lightsail](https://docs.aws.amazon.com/lightsail/latest/userguide/what-is-amazon-lightsail.html)
- [AWS Outposts](https://docs.aws.amazon.com/outposts/latest/userguide/what-is-outposts.html)
