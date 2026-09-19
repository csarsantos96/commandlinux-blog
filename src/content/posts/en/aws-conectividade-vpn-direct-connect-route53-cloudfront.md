---
title: 'AWS Connectivity: VPN, Direct Connect, Route 53, and CloudFront'
description: >-
  Differentiate private connectivity, name resolution, and global delivery using
  VPN, Direct Connect, PrivateLink, Route 53, CloudFront, and Global
  Accelerator.
date: '2026-09-07'
category: CLOUD
tags:
  - aws
  - conectividade
  - direct-connect
  - cloudfront
  - cloud-practitioner
draft: false
language: en
translationOf: aws-conectividade-vpn-direct-connect-route53-cloudfront
sourceHash: e7258416a827cfb943b2c71a23afefc4a8d55ee532a6da271fe8c6311511e784
series: AWS for the Cloud Practitioner
part: 9
totalParts: 12
---
Connecting a remote employee, linking an office to the cloud, and delivering website images are networking needs. However, they don't necessarily use the same service.

On Amazon Web Services (AWS), a useful way to organize the options is to ask: who needs to access what, via which path, and with what performance requirements?

## Person, network, and service

A Virtual Private Network, or VPN, enables protected communication over another network. In AWS, Client VPN and Site-to-Site VPN serve different origins.

AWS Client VPN offers remote access for clients, such as an authorized employee's computer. AWS Site-to-Site VPN connects networks, such as an office network and an Amazon Virtual Private Cloud (VPC), AWS's virtual private network. [Client VPN](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/what-is.html), [Site-to-Site VPN](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html).

In the common Site-to-Site over internet scenario, encrypted tunnels connect the sides. The customer gateway resource represents information from the client side; it should not be confused with the physical or virtual equipment that actually establishes the tunnel. On the AWS side, the connection can use a virtual private gateway or other compatible options, such as Transit Gateway.

## Direct Connect: dedicated connectivity

AWS Direct Connect provides dedicated connectivity between the customer's network and AWS. It can be relevant for sustained traffic and greater predictability, but it requires connection provisioning and redundancy planning. [How Direct Connect works](https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html).

**Dedicated does not mean encrypted by default.** If there is an encryption requirement, it must be explicitly met by mechanisms compatible with the architecture. [Encryption in Direct Connect](https://docs.aws.amazon.com/directconnect/latest/UserGuide/encryption-in-transit.html).

A company can use Direct Connect as its primary connection and a VPN as an alternative. This requires routes, capacity, and failover testing; simply subscribing to both services does not create proven recovery.

## PrivateLink: private access to services

AWS PrivateLink allows accessing compatible services using private connectivity, without traversing the public internet. It is useful when the need is to consume a service, rather than indiscriminately interconnecting all networks.

Endpoints and permissions need to be configured. PrivateLink does not automatically replace every connection between an office and AWS. [PrivateLink documentation](https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html).

| Need | Option to evaluate |
| --- | --- |
| Remote access for a person | Client VPN |
| Connect office network via tunnel | Site-to-Site VPN |
| Dedicated connection between company and AWS | Direct Connect |
| Consume a compatible service via private path | PrivateLink |

## Route 53: finding the destination

The Domain Name System (DNS) allows resolving names to information needed for connection. Amazon Route 53 offers DNS, domain registration, and health checks.

Its policies can choose responses based on factors like latency, weight, or location. This does not mean that website content traverses Route 53. The service participates in the resolution; the client then connects to the indicated destination. [Route 53 documentation](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html).

## CloudFront: delivering content

Amazon CloudFront is a Content Delivery Network, or CDN. It uses edge locations and can keep cached copies, depending on the configuration, to reduce the need to fetch content from the origin.

Caching is not mandatory for every response. Dynamic and personalized content requires appropriate policies so that a user's data is not treated as shared public content. CloudFront also does not automatically copy the entire website to all edge locations when a distribution is created. [How CloudFront works](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html).

## Global Accelerator: improving the network path

AWS Global Accelerator uses the AWS global network to route traffic to application endpoints. In the standard accelerator, static addresses and endpoint selection help meet performance and availability requirements.

Its function is different from a CDN: it does not maintain a cache of images or pages as its primary mechanism. [Global Accelerator](https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html).

| Service | Role |
| --- | --- |
| Route 53 | Answer name queries and apply resolution policies |
| CloudFront | Deliver content and use caching when appropriate |
| Global Accelerator | Route traffic through the global network to endpoints |

## Scenario: public website and private administration

In a hypothetical project, visitors resolve the domain via DNS and access content through CloudFront. The administrative team uses Client VPN to reach an authorized internal system.

Both paths belong to the same project but solve distinct problems. It would not make sense to use an employee VPN as a solution to distribute public images to visitors.

Similarly, a small internal service does not automatically require Direct Connect. The decision depends on volume, predictability, deployment time, and connection requirements.

## Common errors and focus on CLF-C02

Do not confuse DNS with content proxy, dedicated connection with encryption, or network acceleration with caching. Also, identify whether the scenario describes a person, an entire network, or a service to consume.

## Author's question

A public application needs to distribute images that can be cached near users. Which service directly addresses this need?

- **A.** AWS Client VPN.
- **B.** AWS Direct Connect.
- **C.** Amazon CloudFront.
- **D.** Amazon Route 53 alone.

**Answer: C.** CloudFront offers content distribution with edge caching as per configuration.

A handles private remote access. B provides dedicated connectivity. D resolves names but does not store and deliver image content in cache.

## Summary

Choose private connectivity based on the origin and destination of access. For public applications, differentiate between finding the destination, delivering content, and optimizing the path. Each function requires its own decision.

## Official documentation

- [Client VPN](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/what-is.html)
- [Site-to-Site VPN](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html)
- [Encryption in Direct Connect](https://docs.aws.amazon.com/directconnect/latest/UserGuide/encryption-in-transit.html)
- [AWS Direct Connect](https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html)
- [PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html)
- [Route 53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html)
- [CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
- [Global Accelerator](https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html)
