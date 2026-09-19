---
title: 'EC2 Costs: On-Demand, Spot, and Usage Commitments'
description: >-
  Compare On-Demand, Spot, Savings Plans, and Reserved Instances, and understand
  the difference between discount, capacity reservation, and cost control.
date: '2026-09-07'
category: CLOUD
tags:
  - aws
  - ec2
  - custos
  - savings-plans
  - cloud-practitioner
draft: false
language: en
translationOf: aws-ec2-custos-on-demand-spot-savings-plans
sourceHash: bbb311c779c76f9fc3310ac239c4c91b1615019e6c033ef8e7685e18c8277a33
series: AWS for the Cloud Practitioner
part: 3
totalParts: 12
---
Choosing an appropriate machine is only one part of the computing cost. How long it will be used, whether the usage is predictable, and if the work can be interrupted also matter.

In Amazon Elastic Compute Cloud (EC2) from Amazon Web Services (AWS), there are different ways to pay for capacity. The largest advertised discount is not necessarily the best choice for an application.

## Start with Predictability and Interruption Tolerance

An experimental application might have uncertain demand. A system used daily might maintain stable consumption. A batch process, on the other hand, can accept interruptions if it can resume work afterward.

These three scenarios call for different evaluations.

| Model | Main Idea | When to Consider |
| --- | --- | --- |
| On-Demand | Usage without long-term commitment | Uncertain demand, testing, and need for flexibility |
| Spot | Use of available capacity that can be reclaimed | Interruption-tolerant tasks |
| Savings Plans | Hourly spend commitment for one or three years | Predictable eligible consumption |
| Reserved Instances | Billing benefit associated with instance attributes | Predictable usage with compatible configuration |

On-Demand is the pricing reference for these comparisons. It doesn't mean "small discount". Spot requires the application to handle capacity reclamation; a discount doesn't compensate for work that loses all its results when interrupted. [EC2 purchasing options](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html).

## Savings Plans and Reserved Instances Are Not the Same Thing

With Savings Plans, the commitment is an hourly spend amount. The scope of the benefit depends on the plan type. It's necessary to evaluate eligible consumption and required flexibility before committing. [How Savings Plans work](https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html).

A Reserved Instance, or RI, is not an extra machine you turn on. It's a billing benefit applied to usage compatible with its attributes. There are scope differences: a regional reservation doesn't reserve capacity; a zonal reservation might include this benefit in the chosen zone. [Reserved Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-reserved-instances.html).

Therefore, **saving on billing** and **ensuring available capacity** are distinct needs. EC2 also offers capacity reservations to address the second need.

## What about Dedicated Hosts?

Dedicated Hosts provide a physical server dedicated to the customer, with useful control for specific licensing and isolation requirements.

They are not just "an instance with a bigger discount". The question here is whether there's a need for a dedicated host. For most initial studies, it's enough to separate this isolation decision from the decision about the duration of the financial commitment.

## No Modality Eliminates Failures

Instances that are not Spot are not subject to the same capacity reclamation characteristic of Spot. This doesn't mean eternal operation: failures and maintenance events are still possible. [EC2 scheduled events](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/monitoring-instances-status-check_sched.html).

One should also not assume that stopping a machine eliminates already contracted financial commitments. The decision to purchase a commitment needs to consider utilization throughout the entire period.

## Estimate, Analyze, and Alert

The notes separate three tools worth keeping distinct:

| Tool | Main Question |
| --- | --- |
| AWS Pricing Calculator | How much might this architecture cost under the specified conditions? |
| AWS Cost Explorer | How are cost and usage performing? |
| AWS Budgets | When should I be notified about a defined limit? |

The calculator depends on the stated assumptions; it is not a guarantee of the final value. Cost Explorer allows analyzing history and forecasts. Budgets monitors limits and can issue alerts; merely creating a budget does not establish a hard cap that stops all billing. Automated actions require configuration and have their own scope. [Cost Explorer](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html), [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html).

## Scenario: File Processing

A hypothetical team receives files to process overnight. Each task saves progress and can be repeated without duplicating the final result.

Spot can be an option for this processing, provided the team accepts variations in availability and plans for interruptions. If there's a strict deadline, they also need to consider alternative capacity.

Conversely, a component with constant consumption might justify evaluating a commitment. It's not possible to calculate concrete savings without knowing the region, instance type, duration, and other resources used.

## Common Mistakes and Focus on CLF-C02

Avoid choosing based on isolated discounts, treating RIs as another hardware category, or interpreting Budgets as a universal spending block. Include storage, traffic, and other architectural resources in your reasoning.

In the certification, relate the model to the conditions in the statement: flexibility, predictability, commitment, and interruption tolerance.

## Author's Question

A company runs batch tasks that can be interrupted and resumed. It wants to leverage available capacity at a discount, without a long-term commitment. Which option best matches the scenario?

- **A.** Dedicated Host, because all batch processing requires exclusive hardware.
- **B.** Reserved Instances, because they don't require commitment.
- **C.** Spot Instances, with interruption handling in the application.
- **D.** AWS Budgets, because it provides discounted compute capacity.

**Answer: C.** Spot caters to the use of available capacity for tasks that tolerate interruption.

A invents an isolation requirement. B is incorrect because RIs involve commitment. D confuses budget tracking with compute provision.

## Summary

On-Demand prioritizes flexibility. Spot requires interruption tolerance. Savings Plans and RIs need predictable usage for the commitment to make sense. Capacity reservation, physical isolation, and cost control are related but different decisions.

## Official Documentation

- [Purchasing options](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html)
- [Savings Plans](https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html)
- [Reserved Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-reserved-instances.html)
- [Pricing Calculator, EC2 guide reference](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html#ec2-pricing)
- [Cost Explorer](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html)
- [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)
