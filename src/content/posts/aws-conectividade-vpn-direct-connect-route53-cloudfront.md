---
title: "Conectividade AWS: VPN, Direct Connect, Route 53 e CloudFront"
description: "Diferencie conexão privada, resolução de nomes e entrega global com VPN, Direct Connect, PrivateLink, Route 53, CloudFront e Global Accelerator."
date: 2026-09-07
category: CLOUD
tags: [aws, conectividade, direct-connect, cloudfront, cloud-practitioner]
draft: false
series: "AWS para a Cloud Practitioner"
part: 9
totalParts: 12
---

⸻

Conectar um funcionário remoto, ligar o escritório à nuvem e entregar imagens de um site são necessidades de rede. Porém, elas não usam necessariamente o mesmo serviço.

Na Amazon Web Services (AWS), uma forma útil de organizar as opções é perguntar: quem precisa acessar o quê, por qual caminho e com qual requisito de desempenho?

## Pessoa, rede e serviço

Uma rede privada virtual, ou VPN (*Virtual Private Network*), permite comunicação protegida sobre outra rede. Na AWS, Client VPN e Site-to-Site VPN atendem origens diferentes.

O AWS Client VPN oferece acesso remoto para clientes, como o computador de um funcionário autorizado. O AWS Site-to-Site VPN conecta redes, como a rede do escritório e uma Amazon Virtual Private Cloud (VPC), a rede virtual privada da AWS. [Client VPN](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/what-is.html), [Site-to-Site VPN](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html).

No cenário comum de Site-to-Site sobre internet, túneis cifrados conectam os lados. O recurso customer gateway representa informações do lado do cliente; não deve ser confundido com o equipamento físico ou virtual que efetivamente estabelece o túnel. No lado AWS, a conexão pode usar um virtual private gateway ou outras opções compatíveis, como Transit Gateway.

## Direct Connect: conectividade dedicada

AWS Direct Connect fornece conectividade dedicada entre a rede do cliente e a AWS. Pode ser relevante para tráfego sustentado e maior previsibilidade, mas exige provisionamento de conexão e planejamento de redundância. [Funcionamento do Direct Connect](https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html).

**Dedicado não significa cifrado por padrão.** Se houver requisito de criptografia, ele deve ser atendido explicitamente por mecanismos compatíveis com a arquitetura. [Criptografia no Direct Connect](https://docs.aws.amazon.com/directconnect/latest/UserGuide/encryption-in-transit.html).

Uma empresa pode usar Direct Connect como conexão principal e uma VPN como alternativa. Isso exige rotas, capacidade e testes de comutação; apenas contratar os dois serviços não cria uma recuperação comprovada.

## PrivateLink: acesso privado a serviços

AWS PrivateLink permite acessar serviços compatíveis usando conectividade privada, sem passar pela internet pública. É útil quando a necessidade é consumir um serviço, e não interligar indiscriminadamente todas as redes.

Os endpoints e as permissões precisam ser configurados. PrivateLink não substitui automaticamente toda conexão entre escritório e AWS. [Documentação do PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html).

| Necessidade | Opção a avaliar |
| --- | --- |
| Acesso remoto de uma pessoa | Client VPN |
| Conectar a rede do escritório por túnel | Site-to-Site VPN |
| Conexão dedicada entre empresa e AWS | Direct Connect |
| Consumir um serviço compatível por caminho privado | PrivateLink |

## Route 53: encontrar o destino

O Domain Name System (DNS), sistema de nomes de domínio, permite resolver nomes para informações necessárias à conexão. O Amazon Route 53 oferece DNS, registro de domínios e verificações de saúde.

Suas políticas podem escolher respostas conforme fatores como latência, peso ou localização. Isso não significa que o conteúdo do site atravessa o Route 53. O serviço participa da resolução; o cliente depois se conecta ao destino indicado. [Documentação do Route 53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html).

## CloudFront: entregar conteúdo

Amazon CloudFront é uma rede de distribuição de conteúdo, ou CDN (*Content Delivery Network*). Ele usa locais de borda e pode manter cópias em cache, conforme a configuração, para reduzir a necessidade de buscar conteúdo na origem.

Cache não é obrigatório para toda resposta. Conteúdo dinâmico e personalizado precisa de políticas adequadas para que dados de um usuário não sejam tratados como conteúdo público compartilhado. CloudFront também não copia automaticamente todo o site para todas as bordas quando uma distribuição é criada. [Como funciona o CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html).

## Global Accelerator: melhorar o caminho de rede

AWS Global Accelerator usa a rede global da AWS para encaminhar tráfego a endpoints de aplicação. No acelerador padrão, endereços estáticos e seleção de endpoints ajudam a atender requisitos de desempenho e disponibilidade.

Sua função é diferente da de uma CDN: ele não mantém um cache de imagens ou páginas como mecanismo principal. [Global Accelerator](https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html).

| Serviço | Papel |
| --- | --- |
| Route 53 | Responder consultas de nomes e aplicar políticas de resolução |
| CloudFront | Entregar conteúdo e usar cache quando apropriado |
| Global Accelerator | Encaminhar tráfego pela rede global para endpoints |

## Cenário: site público e administração privada

Num projeto hipotético, visitantes resolvem o domínio por DNS e acessam conteúdo pelo CloudFront. A equipe administrativa usa Client VPN para alcançar um sistema interno autorizado.

Os dois caminhos pertencem ao mesmo projeto, mas resolvem problemas distintos. Não faria sentido usar uma VPN de funcionários como solução para distribuir imagens públicas aos visitantes.

Da mesma forma, um serviço interno pequeno não exige automaticamente Direct Connect. A decisão depende de volume, previsibilidade, prazo de implantação e requisitos de conexão.

## Erros comuns e foco na CLF-C02

Não confunda DNS com proxy de conteúdo, conexão dedicada com criptografia ou aceleração de rede com cache. Identifique também se o cenário descreve uma pessoa, uma rede inteira ou um serviço a consumir.

## Questão autoral

Uma aplicação pública precisa distribuir imagens que podem ser armazenadas em cache perto dos usuários. Qual serviço atende diretamente a essa necessidade?

- **A.** AWS Client VPN.
- **B.** AWS Direct Connect.
- **C.** Amazon CloudFront.
- **D.** Amazon Route 53 sozinho.

**Resposta: C.** CloudFront oferece distribuição de conteúdo com cache na borda conforme a configuração.

A atende acesso remoto privado. B fornece conectividade dedicada. D resolve nomes, mas não armazena e entrega o conteúdo das imagens em cache.

## Resumo

Escolha conectividade privada pela origem e pelo destino do acesso. Para aplicações públicas, diferencie encontrar o destino, entregar conteúdo e otimizar o caminho. Cada função pede uma decisão própria.

## Documentação oficial

- [Client VPN](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/what-is.html)
- [Site-to-Site VPN](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html)
- [Criptografia no Direct Connect](https://docs.aws.amazon.com/directconnect/latest/UserGuide/encryption-in-transit.html)
- [AWS Direct Connect](https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html)
- [PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html)
- [Route 53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html)
- [CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
- [Global Accelerator](https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html)
