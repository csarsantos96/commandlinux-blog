---
title: 'Understanding Networks with Wireshark, DNS, and VPN'
description: >-
  Understand how network traffic works, how to analyze packets with Wireshark,
  what changes when using a VPN, and why this knowledge is important for DevOps.
date: '2026-07-15'
category: NETWORKING
tags:
  - networking
  - wireshark
  - vpn
  - dns
  - tcp-ip
  - devops
  - observabilidade
  - troubleshooting
draft: false
language: en
translationOf: entendendo-redes
sourceHash: 3000779e4274258e932ecb0e72be8c49ca4399e9a1aa9e4e9354bbbb845cc5a2
---
--------------------------------------------------------------------------------------

# Understanding Networks with **Wireshark, DNS, and VPN**

When we access a website, perform a `git push`, connect to a machine via SSH, or execute a deploy, different packets traverse the network.

For someone using a computer, the process seems simple:

```txt
My computer
        ↓
Internet
        ↓
Server
```

Behind this communication, however, there are DNS queries, IP addresses, ports, protocols, encryption, and various servers exchanging information.

Tools like **Wireshark** allow us to visualize part of this communication and help understand what truly happens when an application connects to another service.

This knowledge is important for those working with **DevOps**, especially when investigating issues involving DNS, APIs, containers, servers, pipelines, VPNs, and cloud services.

## What is a network packet?

A packet is a small unit of data transmitted over a network.

When an application needs to send information, the data is divided into packets. These packets carry information that helps the network deliver them to the correct destination.

Among this information, we typically find:

```txt
Source IP
Destination IP
Protocol used
Source port
Destination port
Packet size
Protocol-specific information
```

In a simplified way, communication happens like this:

```txt
Application generates data
        ↓
Operating system prepares packets
        ↓
Packets are sent over the network interface
        ↓
Routers forward packets
        ↓
Server receives and processes the request
        ↓
Server sends a response
```

## What is Wireshark?

**Wireshark** is a tool used to capture and analyze network packets.

It allows observation of traffic entering and exiting a network interface, such as:

```txt
Wi-Fi
Ethernet
VPN interface
Loopback
Virtual container interfaces
```

During a capture, Wireshark displays various information about the packets.

The main columns are:

```txt
Source       → packet source
Destination  → packet destination
Protocol     → protocol used
Length       → packet size
Info         → communication summary
```

For example, when the computer sends a query to a DNS server, we might see something similar to:

```txt
Source:       Computer IP
Destination:  DNS server IP
Protocol:     DNS
Info:         Standard query
```

When the DNS server responds, the communication appears in the opposite direction:

```txt
Source:       DNS server IP
Destination:  Computer IP
Protocol:     DNS
Info:         Standard query response
```

Therefore, the same address can appear as a source or a destination depending on the direction of communication.

```txt
Query:

My computer  →  DNS Server

Response:

DNS Server    →  My computer
```

## What do Wireshark's colors mean?

The colors used by Wireshark are visual rules to facilitate the identification of protocols and certain network behaviors.

One color might highlight TCP traffic, while another might represent DNS, UDP, connection terminations, or retransmissions.

This doesn't automatically mean that a particular packet is dangerous or malicious.

The colors primarily serve to visually organize the capture.

```txt
Different color
        ↓
Wireshark coloring rule
        ↓
Specific protocol or behavior
```

It's also possible to view or modify these rules within Wireshark itself.

The most important thing is to analyze the protocol, addresses, ports, and information presented in the packet, rather than concluding something based solely on the color.

## Understanding source and destination

During a capture, Wireshark shows who sent and who received each packet.

If the computer initiates a connection with a server, we might see:

```txt
Source:       My computer
Destination:  Server
```

When the server responds:

```txt
Source:       Server
Destination:  My computer
```

Within the same communication, the direction of packets changes several times.

```txt
My computer  →  Server
My computer  ←  Server
My computer  →  Server
My computer  ←  Server
```

This happens because there's an exchange of information.

The client sends a request, the server responds, and other packets may be used to confirm data receipt and control the connection.

## The role of DNS

**DNS**, or Domain Name System, is responsible for translating domain names to IP addresses.

When we access:

```txt
github.com
```

The computer needs to find out which IP address corresponds to that domain.

The simplified process is:

```txt
User accesses github.com
        ↓
Computer queries the DNS server
        ↓
DNS server returns an IP address
        ↓
Computer connects to the received address
```

In Wireshark, we can filter DNS queries using:

```txt
dns
```

We can also search for a specific domain:

```txt
dns.qry.name contains "github"
```

When accessing GitHub, queries for different domains might appear, such as:

```txt
github.com
api.github.com
avatars.githubusercontent.com
github.githubassets.com
```

This happens because a modern page typically uses multiple services.

The website might load images, JavaScript files, stylesheets, APIs, and other resources hosted on different domains.

Therefore, accessing just one page can generate multiple DNS queries and several network connections.

## HTTP, HTTPS, and encryption

In an unencrypted HTTP connection, part of the transmitted information can be viewed directly during capture.

With **HTTPS**, the communication content is protected by encryption.

Wireshark can still show information such as:

```txt
Source IP
Destination IP
Ports used
Number of packets
Packet size
Communication time
Transport protocol
```

However, it usually cannot directly show page content, passwords, messages, or data sent within the encrypted connection.

In a simplified way:

```txt
Without encryption:

Client  →  Readable data  →  Server
```

```txt
With HTTPS:

Client  →  Encrypted data  →  Server
```

This doesn't mean the connection becomes invisible.

Communication continues to exist, and packets continue to traverse the network. What changes is that the content is protected.

## What happens without a VPN?

Without a VPN, traffic usually exits directly through the network interface used by the computer.

```txt
My computer
        ↓
Router
        ↓
Internet provider
        ↓
Destination server
```

The router and the provider can perceive that there is communication with specific IP addresses.

Depending on the DNS configuration and the protocol used, additional information may also be visible on the network.

In Wireshark, we can observe connections being established directly between the computer and various servers.

For example:

```txt
My computer  →  DNS Server
My computer  →  GitHub Server
My computer  →  API
My computer  →  SSH Server
```

## What changes when we use a VPN?

A VPN creates an encrypted tunnel between the computer and the VPN server.

Without a VPN, the flow is similar to:

```txt
My computer
        ↓
Router
        ↓
Provider
        ↓
Website or server
```

With a VPN:

```txt
My computer
        ↓
Encrypted tunnel
        ↓
VPN server
        ↓
Website or server
```

For the local network and the provider, the main communication becomes between the computer and the VPN server.

```txt
My computer  →  VPN server
```

After that, the VPN server establishes the connection with the destination.

```txt
VPN server  →  Website
VPN server  →  API
VPN server  →  GitHub
```

Therefore, during a capture performed on the physical interface, it's common to primarily see the IP address of the VPN server.

The different accesses are being transported within the encrypted tunnel.

## Does the VPN hide all traffic?

The VPN doesn't make traffic disappear.

It alters the communication path and creates an encryption layer between the computer and the VPN server.

The router can still perceive that there's an active connection.

The provider can also perceive that the computer is transmitting data to some address, which will typically be the VPN server's address.

What changes is that they don't directly visualize all destinations accessed within the tunnel.

```txt
Without VPN:

Provider observes connections with multiple destinations
```

```txt
With VPN:

Provider primarily observes the connection with the VPN
```

The VPN server, on the other hand, comes to occupy an important position in the communication path.

Therefore, using a VPN also involves trusting the provider responsible for that service.

> A VPN changes who you need to trust. It doesn't completely eliminate the need for trust.

## Network interfaces and VPN

When a VPN is activated, the system typically creates a virtual network interface.

On Linux, we can view interfaces with commands like:

```bash
ip addr
```

or:

```bash
ip link
```

Depending on the technology used by the VPN, interfaces might appear with names like:

```txt
tun0
wg0
nordlynx
```

The physical interface continues to exist:

```txt
wlan0
enp0s31f6
```

The difference is that traffic can be routed through the virtual interface before exiting through the physical interface.

```txt
Application
        ↓
VPN virtual interface
        ↓
Encryption
        ↓
Physical interface
        ↓
VPN server
```

When capturing packets in Wireshark, the result can change depending on the selected interface.

On the physical interface, you can primarily observe the encrypted tunnel.

On the virtual interface, depending on the VPN and system permissions, it might be possible to observe traffic before or after it passes through the tunnel.

## Protocols that might appear in Wireshark

During a capture, various protocols might appear.

Some of the most common are:

```txt
ARP    → local network device discovery
DNS    → name resolution
TCP    → reliable communication between applications
UDP    → simpler and faster communication
TLS    → encryption used by HTTPS
ICMP   → diagnostic messages, such as ping
SSH    → secure remote access
HTTP   → unencrypted web communication
QUIC   → protocol used by modern applications
```

Each protocol has a different responsibility within the communication.

For example:

```txt
DNS finds the IP address
TCP establishes the connection
TLS protects the content
HTTP sends the application request
```

In a traditional HTTPS browsing session, the flow can be represented as follows:

```txt
DNS Query
        ↓
IP Address found
        ↓
TCP Connection
        ↓
TLS Negotiation
        ↓
HTTPS Request
        ↓
Server Response
```

## Using filters in Wireshark

A capture can generate thousands of packets in just a few seconds.

Therefore, filters are fundamental for finding only the relevant information.

To show only DNS traffic:

```txt
dns
```

To show only TCP traffic:

```txt
tcp
```

To show only UDP traffic:

```txt
udp
```

To show packets related to an IP address:

```txt
ip.addr == 192.168.1.10
```

To view only packets sent by an address:

```txt
ip.src == 192.168.1.10
```

To view only packets received by an address:

```txt
ip.dst == 192.168.1.10
```

To filter a specific port:

```txt
tcp.port == 22
```

In this case, port `22` is typically used by SSH.

To filter traditional HTTPS:

```txt
tcp.port == 443
```

To filter traffic related to a specific VPN server:

```txt
ip.addr == 169.150.226.31
```

We can also combine filters:

```txt
ip.addr == 169.150.226.31 && udp
```

Or exclude a protocol:

```txt
not arp
```

Filters help transform a huge capture into a smaller set of packets that can be analyzed more easily.

## SSH and open ports

A common misconception is thinking that using SSH always requires leaving port `22` open on the computer.

This depends on who initiates the connection.

When we use the computer to access another machine:

```bash
ssh usuario@servidor
```

The computer is initiating an outbound connection.

```txt
My computer  →  SSH Server
```

In this case, it's not necessary to maintain an internet-accessible SSH server on the local computer.

On the other hand, when we want to access our computer remotely:

```txt
Laptop away from home
        ↓
Internet
        ↓
My computer
```

The computer needs to accept inbound connections.

In this scenario, it would be necessary to correctly configure the SSH server, firewall, authentication, and routing.

Directly exposing an SSH port to the internet requires significant caution.

In many cases, alternatives such as private VPN, Tailscale, WireGuard, or identity-based access services might be more suitable.

## What does this have to do with DevOps?

Networks are part of practically all DevOps activities.

An application might be functioning correctly in the code but fail because it cannot communicate with another service.

Some common problems include:

```txt
DNS fails to resolve the domain
Firewall blocks the port
Container cannot reach another container
Load balancer does not forward the request
TLS certificate is invalid
Server cannot access an API
Pipeline cannot download dependencies
Application cannot connect to the database
Network route is incorrect
VPN blocks or redirects traffic
```

Therefore, understanding networks helps to investigate the difference between:

```txt
The application has an error
```

and:

```txt
The application cannot reach the service
```

These two problems might seem the same to the user but have completely different causes.

## Example of a problem in a pipeline

Imagine a pipeline needing to download a dependency.

```txt
Pipeline starts
        ↓
Runner tries to access the repository
        ↓
DNS fails to resolve the domain
        ↓
Download fails
        ↓
Pipeline ends with an error
```

The problem is not necessarily in the code or the workflow file.

It could be a DNS failure or a connectivity issue.

Another example:

```txt
Pipeline starts
        ↓
Tests are executed
        ↓
Application tries to access the database
        ↓
Firewall blocks port 5432
        ↓
Tests fail
```

In this scenario, the database might be functioning normally, but communication between environments is blocked.

## Example with containers

In Docker environments, containers use virtual networks to communicate.

```txt
Application container
        ↓
Docker Network
        ↓
Database container
```

The application might try to access the database using:

```txt
localhost
```

However, inside a container, `localhost` represents the container itself.

In many cases, it's necessary to use the service name:

```txt
postgres
```

or:

```txt
database
```

The flow becomes:

```txt
Application
        ↓
Docker's internal DNS
        ↓
Service name resolved
        ↓
Connection to the database container
```

Understanding DNS and network communication helps identify this type of problem.

## Example with Kubernetes

In Kubernetes, communication also depends on networks, DNS, and services.

```txt
Application Pod
        ↓
Service
        ↓
Destination Pod
```

Kubernetes uses internal DNS to allow applications to find services by name.

For example:

```txt
api-service
database-service
redis-service
```

When an application cannot access another service, some possible causes include:

```txt
Service incorrectly configured
Selector does not find the Pods
Incorrect port
NetworkPolicy blocking traffic
Internal DNS issue
Destination Pod unavailable
```

Knowledge of networks helps to understand where communication is failing.

## Networks and observability

In DevOps, observability doesn't just mean monitoring CPU and memory.

We also need to observe how services communicate.

Some important information includes:

```txt
Response time
Number of connections
DNS errors
Lost packets
Retransmissions
Latency
Ports used
Rejected connections
Timeouts
```

Observability tools can show metrics and logs, while Wireshark allows for more detailed analysis of communication packets.

```txt
Metrics show there is a problem
        ↓
Logs help locate the service
        ↓
Network capture helps understand the communication
```

## Is Wireshark a security tool?

Wireshark can be used in security, but it's not *just* a security tool.

It can also be used for:

```txt
Network diagnostics
Protocol study
Failure investigation
Performance analysis
Connection identification
Application troubleshooting
Learning TCP/IP
```

In security, it can help identify unusual behaviors, unexpected connections, and insecure protocols.

However, a capture needs to be analyzed within a context.

The existence of an unknown connection doesn't automatically mean the system has been compromised.

It could be an update, an external API, a browser extension, a system service, or an application dependency.

## Precautions when performing captures

Network captures can contain sensitive information.

Depending on the environment and protocols used, a capture file might record:

```txt
IP addresses
Accessed domains
Machine names
DNS queries
Unprotected tokens
Cookies
HTTP headers
Infrastructure information
```

Therefore, files like `.pcap` and `.pcapng` should not be published without analysis.

Before sharing a capture, it's important to verify if it contains private information or infrastructure data.

We should also only capture traffic on networks, systems, and environments for which we have authorization.

## Summary

Wireshark allows visualization of packets entering and exiting a network interface.

With it, we can analyze:

```txt
Source and destination
Protocols
DNS queries
Ports
TCP and UDP connections
VPN traffic
Errors and retransmissions
```

When a VPN is active, traffic is forwarded through an encrypted tunnel to the VPN server.

For the local network and the provider, the main communication becomes with this server, while the final destinations remain within the tunnel.

For DevOps, understanding these concepts is important because many application problems are not directly in the code.

They might be in the communication between services.

The main ideas to remember are:

> Wireshark shows the packets passing through the network interface.

> Source is who sent the packet, and Destination is who received it.

> Wireshark's colors aid organization and do not necessarily represent an attack.

> DNS transforms domain names into IP addresses.

> HTTPS protects the content of communication but doesn't make the connection disappear.

> A VPN creates an encrypted tunnel between the computer and the VPN server.

> In DevOps, understanding networks is essential for investigating failures between applications, containers, pipelines, servers, and cloud services.
