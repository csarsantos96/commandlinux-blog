---
title: "Regiões, zonas e responsabilidade compartilhada na AWS"
description: "Entenda regiões, zonas de disponibilidade e locais de borda da AWS, e saiba quais responsabilidades continuam com você na nuvem."
date: 2026-09-07
category: CLOUD
tags: [aws, cloud-practitioner, regioes, disponibilidade, responsabilidade-compartilhada]
draft: false
series: "AWS para a Cloud Practitioner"
part: 1
totalParts: 12
---

⸻

Colocar uma aplicação na nuvem não responde, sozinho, onde ela roda, quais falhas suporta ou quem deve atualizar seu sistema. Essas decisões continuam existindo.

Este primeiro artigo organiza três fundamentos da Amazon Web Services (AWS): localização dos recursos, disponibilidade e responsabilidade compartilhada. São conceitos que ajudam tanto na preparação para a Cloud Practitioner, exame CLF-C02, quanto nas primeiras decisões de arquitetura.

## Região, zona e borda são coisas diferentes

Uma **região** é uma área geográfica na qual a AWS mantém infraestrutura. São Paulo, identificada por `sa-east-1`, é um exemplo. Você escolhe a região ao criar muitos dos recursos da sua aplicação.

Dentro de uma região existem zonas de disponibilidade, ou **AZs**, de *Availability Zones*. Cada zona reúne um ou mais data centers, com isolamento físico em relação às outras zonas. Elas se comunicam por conexões de baixa latência. Essa separação permite distribuir recursos para reduzir o impacto de uma falha localizada. [Documentação de zonas de disponibilidade](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-availability-zones.html).

Já um local de borda, ou *edge location*, aproxima determinados serviços dos usuários. O Amazon CloudFront usa esses locais para entregar conteúdo. Uma borda não é uma região menor onde você simplesmente cria os mesmos recursos.

| Conceito | Pergunta que ajuda a responder | Exemplo de decisão |
| --- | --- | --- |
| Região | Em qual área geográfica o recurso ficará? | Criar a aplicação em São Paulo |
| Zona de disponibilidade | Como separar recursos contra falhas locais? | Distribuir servidores entre duas zonas |
| Local de borda | Como aproximar a entrega do usuário? | Distribuir conteúdo com CloudFront |

## Como escolher uma região

Comece pelos requisitos do projeto: localização permitida dos dados, serviços necessários, latência para o público e custo. Uma região próxima pode reduzir latência, mas a distância geográfica não substitui uma medição do caminho real da rede.

Também não adianta escolher uma região apenas pelo preço se o recurso necessário não está disponível nela. E uma restrição obrigatória de residência de dados precisa ser respeitada durante a seleção, não tratada como um detalhe opcional. A AWS apresenta esses fatores na [orientação sobre regiões](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html).

## Duas instâncias não significam automaticamente alta disponibilidade

Imagine uma aplicação com dois servidores na mesma zona. Ela pode continuar funcionando se um servidor falhar, mas ambos ainda compartilham o risco de indisponibilidade daquela zona.

Distribuir os servidores entre duas zonas reduz essa dependência. Entretanto, a aplicação precisa conseguir atender usando os recursos restantes. Se todos dependem de um único banco de dados indisponível, duplicar somente os servidores não resolve o problema completo.

O mesmo vale para capacidade: o lado que continua funcionando precisa suportar a carga ou conseguir crescer dentro do tempo aceitável.

## Quem cuida de quê?

O modelo de **responsabilidade compartilhada** separa a proteção da infraestrutura da AWS das configurações e dos dados que o cliente controla. O limite varia conforme o serviço utilizado. [Modelo oficial de responsabilidade compartilhada](https://aws.amazon.com/compliance/shared-responsibility-model/).

| Responsabilidade | AWS | Cliente |
| --- | --- | --- |
| Segurança física dos data centers | Sim | Não administra essa camada |
| Hardware da infraestrutura | Sim | Não administra essa camada |
| Sistema operacional de uma instância Amazon Elastic Compute Cloud (EC2) administrada pelo cliente | Infraestrutura subjacente | Atualizações e configuração do sistema convidado |
| Dados e permissões de acesso da aplicação | Proteção das camadas gerenciadas | Classificação, acesso e configuração adequada |

Um serviço gerenciado transfere parte do trabalho operacional. Ele não decide automaticamente quem deveria acessar seus documentos ou quais permissões sua aplicação realmente precisa.

## Um cenário realista

Considere uma loja hipotética cujo público está no Brasil. A equipe verifica se São Paulo atende aos requisitos, distribui a camada de aplicação entre duas zonas e prepara a camada de dados para falhas.

Conteúdos que podem ser armazenados em cache são entregues pelo CloudFront. Quando uma cópia válida está disponível na borda, o serviço pode responder sem buscar novamente o conteúdo na origem. Isso melhora a entrega, mas não cria uma réplica completa da aplicação. [Funcionamento do CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html).

## Quando usar mais de uma região

Uma arquitetura em várias regiões pode atender objetivos de recuperação ou públicos distribuídos. Ela também exige lidar com replicação, consistência, roteamento, operação e custos adicionais.

Não é uma obrigação para toda aplicação. Se o requisito é sobreviver à falha de uma zona, começar com uma arquitetura bem projetada em múltiplas zonas pode ser suficiente. A decisão vem do requisito de disponibilidade, não da quantidade de caixas no diagrama.

## Para a certificação: evite estas confusões

Região não é zona. Borda não substitui região. Recursos em múltiplas zonas ajudam na disponibilidade, mas a aplicação precisa aproveitar essa distribuição. E segurança na nuvem continua incluindo responsabilidades do cliente.

O foco aqui é reconhecer o papel de cada conceito, em linha com o [guia oficial da CLF-C02](https://docs.aws.amazon.com/pdfs/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.pdf).

## Questão autoral

Uma empresa quer reduzir o impacto da indisponibilidade de uma zona, mantendo a aplicação em uma única região. Qual abordagem atende melhor a esse objetivo?

- **A.** Colocar todos os servidores em uma única zona e aumentar sua memória.
- **B.** Distribuir componentes redundantes entre zonas diferentes e preparar a aplicação para falhas.
- **C.** Registrar um segundo domínio para o mesmo servidor.
- **D.** Usar um local de borda como substituto de toda a infraestrutura da aplicação.

**Resposta: B.** A distribuição entre zonas reduz a dependência de um único local de falha, desde que os componentes restantes consigam manter o atendimento.

A alternativa A aumenta recursos, mas mantém a dependência da zona. C altera nomes, sem criar redundância. D confunde entrega na borda com execução e redundância de toda a aplicação.

## Resumo

Escolha a região pelos requisitos do projeto. Use zonas para separar recursos sujeitos a falhas locais. Use borda quando ela ajudar na entrega. Em qualquer uma dessas escolhas, verifique o que o serviço gerencia e o que continua sob sua responsabilidade.

## Documentação oficial

- [Regiões da AWS](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html)
- [Zonas de disponibilidade](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-availability-zones.html)
- [Responsabilidade compartilhada](https://aws.amazon.com/compliance/shared-responsibility-model/)
- [Amazon CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
