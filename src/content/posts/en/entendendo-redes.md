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
sourceHash: feb0ec0e2256a55ad856a28e2ae284acd2ae7ca647372a4f10ae15fd2313a3db
---
# Understanding Networks with **Wireshark, DNS, and VPN**

When we access a website, perform a `git push`, connect to a machine via SSH, or execute a deploy, different packets traverse the network.

For someone using the computer, the process seems simple:

```txt
Meu computador
        ↓
Internet
        ↓
Servidor
```

Behind this communication, however, there are DNS queries, IP addresses, ports, protocols, encryption, and different servers exchanging information.

Tools like **Wireshark** allow us to visualize part of this communication and help understand what truly happens when an application connects to another service.

This knowledge is important for those working with **DevOps**, especially when investigating issues involving DNS, APIs, containers, servers, pipelines, VPNs, and cloud services.

## What is a network packet?

A packet is a small unit of data transmitted over the network.

When an application needs to send information, the data is divided into packets. These packets carry information that helps the network deliver them to the correct destination.

Among this information, we typically find:

```txt
IP de origem
IP de destino
Protocolo utilizado
Porta de origem
Porta de destino
Tamanho do pacote
Informações específicas do protocolo
```

In a simplified way, communication happens like this:

```txt
Aplicação gera os dados
        ↓
Sistema operacional prepara os pacotes
        ↓
Pacotes são enviados pela interface de rede
        ↓
Roteadores encaminham os pacotes
        ↓
Servidor recebe e processa a solicitação
        ↓
Servidor envia uma resposta
```

## What is Wireshark?

**Wireshark** is a tool used to capture and analyze network packets.

It allows observing traffic entering and leaving a network interface, such as:

```txt
Wi-Fi
Ethernet
Interface de VPN
Loopback
Interfaces virtuais de containers
```

During a capture, Wireshark displays various information about the packets.

The main columns are:

```txt
Source       → origem do pacote
Destination  → destino do pacote
Protocol     → protocolo utilizado
Length       → tamanho do pacote
Info         → resumo da comunicação
```

For example, when the computer sends a query to a DNS server, we might see something like:

```txt
Source:       IP do computador
Destination:  IP do servidor DNS
Protocol:     DNS
Info:         Standard query
```

When the DNS server responds, the communication appears in the opposite direction:

```txt
Source:       IP do servidor DNS
Destination:  IP do computador
Protocol:     DNS
Info:         Standard query response
```

Therefore, the same address can appear as source or destination depending on the direction of communication.

```txt
Consulta:

Meu computador  →  Servidor DNS

Resposta:

Servidor DNS    →  Meu computador
```

## What do Wireshark's colors mean?

The colors used by Wireshark are visual rules to facilitate the identification of protocols and certain network behaviors.

One color might highlight TCP traffic, while another might represent DNS, UDP, connection terminations, or retransmissions.

This doesn't automatically mean that a particular packet is dangerous or malicious.

The colors primarily serve to visually organize the capture.

```txt
Cor diferente
        ↓
Regra de coloração do Wireshark
        ↓
Protocolo ou comportamento específico
```

It's also possible to view or modify these rules within Wireshark itself.

The most important thing is to analyze the protocol, addresses, ports, and information presented in the packet, rather than concluding something solely based on its color.

## Understanding source and destination

During a capture, Wireshark shows who sent and who received each packet.

If the computer initiates a connection with a server, we might have:

```txt
Source:       Meu computador
Destination:  Servidor
```

When the server responds:

```txt
Source:       Servidor
Destination:  Meu computador
```

In the same communication, the direction of packets changes multiple times.

```txt
Meu computador  →  Servidor
Meu computador  ←  Servidor
Meu computador  →  Servidor
Meu computador  ←  Servidor
```

This happens because there is an exchange of information.

The client sends a request, the server responds, and other packets may be used to confirm data receipt and control the connection.

## The role of DNS

**DNS**, or Domain Name System, is responsible for translating domain names into IP addresses.

When we access:

```txt
github.com
```

The computer needs to find out which IP address corresponds to this domain.

The simplified process is:

```txt
Usuário acessa github.com
        ↓
Computador consulta o servidor DNS
        ↓
Servidor DNS retorna um endereço IP
        ↓
Computador conecta ao endereço recebido
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

This happens because a modern page typically uses several services.

The website might load images, JavaScript files, stylesheets, APIs, and other resources hosted on different domains.

Therefore, accessing just one page can generate multiple DNS queries and multiple network connections.

## HTTP, HTTPS, and encryption

In an unencrypted HTTP connection, part of the transmitted information can be viewed directly during capture.

However, with **HTTPS**, the content of the communication is protected by encryption.

Wireshark can still show information such as:

```txt
IP de origem
IP de destino
Portas utilizadas
Quantidade de pacotes
Tamanho dos pacotes
Tempo da comunicação
Protocolo de transporte
```

However, it typically cannot directly show page content, passwords, messages, or data sent within the encrypted connection.

In a simplified way:

```txt
Sem criptografia:

Cliente  →  Dados legíveis  →  Servidor
```

```txt
Com HTTPS:

Cliente  →  Dados criptografados  →  Servidor
```

This does not mean the connection becomes invisible.

Communication continues to exist, and packets continue to traverse the network. What changes is that the content is protected.

## What happens without a VPN?

Without a VPN, traffic usually leaves directly through the network interface used by the computer.

```txt
Meu computador
        ↓
Roteador
        ↓
Provedor de internet
        ↓
Servidor de destino
```

The router and the ISP can detect that there is communication with certain IP addresses.

Depending on the DNS configuration and the protocol used, additional information might also be visible on the network.

In Wireshark, we can observe connections being established directly between the computer and different servers.

For example:

```txt
Meu computador  →  Servidor DNS
Meu computador  →  Servidor do GitHub
Meu computador  →  API
Meu computador  →  Servidor SSH
```

## What changes when we use a VPN?

A VPN creates an encrypted tunnel between the computer and the VPN server.

Without a VPN, the flow is similar to:

```txt
Meu computador
        ↓
Roteador
        ↓
Provedor
        ↓
Site ou servidor
```

With a VPN:

```txt
Meu computador
        ↓
Túnel criptografado
        ↓
Servidor da VPN
        ↓
Site ou servidor
```

For the local network and the ISP, the primary communication becomes between the computer and the VPN server.

```txt
Meu computador  →  Servidor da VPN
```

After that, the VPN server establishes the connection with the destination.

```txt
Servidor da VPN  →  Site
Servidor da VPN  →  API
Servidor da VPN  →  GitHub
```

Therefore, during a capture performed on the physical interface, it's common to primarily see the IP address of the VPN server.

The various accesses are being transported within the encrypted tunnel.

## Does the VPN hide all traffic?

The VPN doesn't make traffic disappear.

It changes the communication path and creates an encryption layer between the computer and the VPN server.

The router can still detect that an active connection exists.

The ISP can also detect that the computer is transmitting data to an address, which will typically be the VPN server's address.

What changes is that they don't directly see all destinations accessed within the tunnel.

```txt
Sem VPN:

Provedor observa conexões com vários destinos
```

```txt
Com VPN:

Provedor observa principalmente a conexão com a VPN
```

The VPN server, on the other hand, takes on an important position in the communication path.

Therefore, using a VPN also involves trusting the provider responsible for that service.

> A VPN changes who you need to trust. It doesn't completely eliminate the need for trust.

## Network interfaces and VPN

When a VPN is activated, the system usually creates a virtual network interface.

In Linux, we can view interfaces with commands like:

```bash
ip addr
```

or:

```bash
ip link
```

Depending on the technology used by the VPN, interfaces with names like:

```txt
tun0
wg0
nordlynx
```

The physical interface still exists:

```txt
wlan0
enp0s31f6
```

The difference is that traffic can be routed through the virtual interface before exiting through the physical interface.

```txt
Aplicação
        ↓
Interface virtual da VPN
        ↓
Criptografia
        ↓
Interface física
        ↓
Servidor da VPN
```

When capturing packets in Wireshark, the result can change depending on the selected interface.

On the physical interface, it's mainly possible to observe the encrypted tunnel.

On the virtual interface, depending on the VPN and system permissions, it might be possible to observe traffic before or after it passes through the tunnel.

## Protocols that may appear in Wireshark

During a capture, several protocols may appear.

Some of the most common are:

```txt
ARP    → descoberta de dispositivos na rede local
DNS    → resolução de nomes
TCP    → comunicação confiável entre aplicações
UDP    → comunicação mais simples e rápida
TLS    → criptografia utilizada pelo HTTPS
ICMP   → mensagens de diagnóstico, como o ping
SSH    → acesso remoto seguro
HTTP   → comunicação web sem criptografia
QUIC   → protocolo utilizado por aplicações modernas
```

Each protocol has a different responsibility within the communication.

For example:

```txt
DNS encontra o endereço IP
TCP estabelece a conexão
TLS protege o conteúdo
HTTP envia a requisição da aplicação
```

In traditional HTTPS browsing, the flow can be represented as follows:

```txt
Consulta DNS
        ↓
Endereço IP encontrado
        ↓
Conexão TCP
        ↓
Negociação TLS
        ↓
Requisição HTTPS
        ↓
Resposta do servidor
```

## Using filters in Wireshark

A capture can generate thousands of packets in a few seconds.

Therefore, filters are essential for finding only the relevant information.

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
Meu computador  →  Servidor SSH
```

In this case, it is not necessary to maintain an SSH server accessible via the internet on the local computer.

On the other hand, when we want to access our computer remotely:

```txt
Notebook fora de casa
        ↓
Internet
        ↓
Meu computador
```

The computer needs to accept inbound connections.

In this scenario, it would be necessary to correctly configure the SSH server, firewall, authentication, and routing.

Directly opening an SSH port to the internet requires considerable care.

In many cases, alternatives such as private VPN, Tailscale, WireGuard, or identity-based access services may be more suitable.

## What does this have to do with DevOps?

Networks are part of practically all DevOps activities.

An application might be functioning correctly in its code, but fail because it cannot communicate with another service.

Some common problems are:

```txt
DNS não resolve o domínio
Firewall bloqueia a porta
Container não alcança outro container
Load balancer não encaminha a requisição
Certificado TLS está inválido
Servidor não consegue acessar uma API
Pipeline não consegue baixar dependências
Aplicação não consegue conectar ao banco
Rota de rede está incorreta
VPN bloqueia ou redireciona o tráfego
```

Therefore, understanding networks helps investigate the difference between:

```txt
A aplicação está com erro
```

and:

```txt
A aplicação não consegue alcançar o serviço
```

These two problems might appear the same to the user, but they have completely different causes.

## Example of a problem in a pipeline

Imagine a pipeline needs to download a dependency.

```txt
Pipeline inicia
        ↓
Runner tenta acessar o repositório
        ↓
DNS não consegue resolver o domínio
        ↓
Download falha
        ↓
Pipeline termina com erro
```

The problem is not necessarily in the code or the workflow file.

It could be a DNS failure or a connectivity issue.

Another example:

```txt
Pipeline inicia
        ↓
Testes são executados
        ↓
Aplicação tenta acessar o banco
        ↓
Firewall bloqueia a porta 5432
        ↓
Testes falham
```

In this scenario, the database might be functioning normally, but communication between environments is blocked.

## Example with containers

In Docker environments, containers use virtual networks to communicate.

```txt
Container da aplicação
        ↓
Rede Docker
        ↓
Container do banco de dados
```

The application might try to access the database using:

```txt
localhost
```

However, within a container, `localhost` represents the container itself.

In many cases, it is necessary to use the service name:

```txt
postgres
```

or:

```txt
database
```

The flow then becomes:

```txt
Aplicação
        ↓
DNS interno do Docker
        ↓
Nome do serviço resolvido
        ↓
Conexão com o container do banco
```

Understanding DNS and network communication helps identify this type of problem.

## Example with Kubernetes

In Kubernetes, communication also depends on networks, DNS, and services.

```txt
Pod da aplicação
        ↓
Service
        ↓
Pod de destino
```

Kubernetes uses internal DNS to allow applications to find services by name.

For example:

```txt
api-service
database-service
redis-service
```

When an application cannot access another service, some possible causes are:

```txt
Service configurado incorretamente
Selector não encontra os Pods
Porta errada
NetworkPolicy bloqueando o tráfego
DNS interno com problema
Pod de destino indisponível
```

Network knowledge helps understand where communication is failing.

## Networks and observability

In DevOps, observability doesn't just mean monitoring CPU and memory.

We also need to observe how services communicate.

Some important information includes:

```txt
Tempo de resposta
Quantidade de conexões
Erros de DNS
Pacotes perdidos
Retransmissões
Latência
Portas utilizadas
Conexões recusadas
Timeouts
```

Observability tools can show metrics and logs, while Wireshark allows for a more detailed analysis of communication packets.

```txt
Métricas mostram que existe um problema
        ↓
Logs ajudam a localizar o serviço
        ↓
Captura de rede ajuda a entender a comunicação
```

## Is Wireshark a security tool?

Wireshark can be used in security, but it is not *only* a security tool.

It can also be used for:

```txt
Diagnóstico de rede
Estudo de protocolos
Investigação de falhas
Análise de desempenho
Identificação de conexões
Troubleshooting de aplicações
Aprendizado de TCP/IP
```

In security, it can help identify unusual behaviors, unexpected connections, and insecure protocols.

However, a capture needs to be analyzed within a context.

The existence of an unknown connection doesn't automatically mean the system has been compromised.

It could be an update, an external API, a browser extension, a system service, or an application dependency.

## Precautions when performing captures

Network captures can contain sensitive information.

Depending on the environment and protocols used, a capture file might record:

```txt
Endereços IP
Domínios acessados
Nomes de máquinas
Consultas DNS
Tokens sem proteção
Cookies
Cabeçalhos HTTP
Informações de infraestrutura
```

Therefore, files like `.pcap` and `.pcapng` should not be published without analysis.

Before sharing a capture, it's important to check if it contains private information or infrastructure data.

We should also only capture traffic on networks, systems, and environments for which we have authorization.

## Summary

Wireshark allows visualizing packets entering and leaving a network interface.

With it, we can analyze:

```txt
Origem e destino
Protocolos
Consultas DNS
Portas
Conexões TCP e UDP
Tráfego de VPN
Erros e retransmissões
```

When a VPN is active, traffic is forwarded through an encrypted tunnel to the VPN server.

For the local network and the ISP, the primary communication becomes with this server, while the final destinations remain within the tunnel.

For DevOps, understanding these concepts is important because many application problems are not directly in the code.

They might be in the communication between services.

The main ideas to remember are:

> Wireshark shows the packets traversing the network interface.

> Source is who sent the packet, and Destination is who received it.

> Wireshark's colors help with organization and don't necessarily represent an attack.

> DNS translates domain names into IP addresses.

> HTTPS protects the communication content but doesn't make the connection disappear.

> A VPN creates an encrypted tunnel between the computer and the VPN server.

> In DevOps, understanding networks is essential for investigating failures between applications, containers, pipelines, servers, and cloud services.
