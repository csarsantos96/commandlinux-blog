---
title: "Custos do EC2: On-Demand, Spot e compromissos de uso"
description: "Compare On-Demand, Spot, Savings Plans e Reserved Instances, e entenda a diferença entre desconto, reserva de capacidade e controle de custos."
date: 2026-09-07
category: CLOUD
tags: [aws, ec2, custos, savings-plans, cloud-practitioner]
draft: false
series: "AWS para a Cloud Practitioner"
part: 3
totalParts: 12
---

⸻

Escolher uma máquina adequada é só uma parte do custo de computação. Também importa por quanto tempo ela será usada, se o uso é previsível e se o trabalho pode ser interrompido.

No Amazon Elastic Compute Cloud (EC2), da Amazon Web Services (AWS), existem formas diferentes de pagar pela capacidade. O maior desconto anunciado não é necessariamente a melhor escolha para uma aplicação.

## Comece pela previsibilidade e pela tolerância a interrupções

Uma aplicação experimental pode ter demanda incerta. Um sistema usado todos os dias pode manter consumo estável. Já um processamento em lote pode aceitar interrupções se conseguir retomar o trabalho depois.

Esses três cenários pedem avaliações diferentes.

| Modelo | Ideia principal | Quando considerar |
| --- | --- | --- |
| On-Demand | Uso sem compromisso de longo prazo | Demanda incerta, testes e necessidade de flexibilidade |
| Spot | Uso de capacidade disponível que pode ser retomada | Tarefas tolerantes a interrupções |
| Savings Plans | Compromisso de gasto por hora por um ou três anos | Consumo elegível previsível |
| Reserved Instances | Benefício de cobrança associado a atributos de instâncias | Uso previsível com configuração compatível |

On-Demand é a referência de preço dessas comparações. Não significa “desconto pequeno”. Spot exige que a aplicação lide com a retomada de capacidade; desconto não compensa um trabalho que perde todo o resultado quando é interrompido. [Opções de compra do EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html).

## Savings Plans e Reserved Instances não são a mesma coisa

Nos Savings Plans, o compromisso é uma quantidade de gasto por hora. A abrangência do benefício depende do tipo de plano. É preciso avaliar o consumo elegível e a flexibilidade necessária antes de assumir o compromisso. [Funcionamento dos Savings Plans](https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html).

Uma Reserved Instance, ou RI, não é uma máquina extra que você liga. É um benefício de cobrança aplicado a uso compatível com seus atributos. Existem diferenças de escopo: uma reserva regional não reserva capacidade; uma reserva zonal pode incluir esse benefício na zona escolhida. [Reserved Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-reserved-instances.html).

Portanto, **economizar na cobrança** e **garantir capacidade disponível** são necessidades distintas. O EC2 também oferece reservas de capacidade para atender a segunda necessidade.

## E os Dedicated Hosts?

Dedicated Hosts disponibilizam um servidor físico dedicado ao cliente, com controle útil para determinados requisitos de licenciamento e isolamento.

Eles não são apenas “uma instância com desconto maior”. A pergunta aqui é se existe uma necessidade de host dedicado. Para a maioria dos estudos iniciais, basta separar essa decisão de isolamento da decisão sobre duração do compromisso financeiro.

## Nenhuma modalidade elimina falhas

Instâncias que não são Spot não estão sujeitas à mesma retomada de capacidade característica de Spot. Isso não significa funcionamento eterno: falhas e eventos de manutenção continuam possíveis. [Eventos programados do EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/monitoring-instances-status-check_sched.html).

Também não se deve assumir que parar uma máquina elimina compromissos financeiros já contratados. A decisão de comprar um compromisso precisa considerar a utilização durante o período inteiro.

## Estimar, analisar e alertar

As anotações separam três ferramentas que vale manter distintas:

| Ferramenta | Pergunta principal |
| --- | --- |
| AWS Pricing Calculator | Quanto esta arquitetura pode custar nas condições informadas? |
| AWS Cost Explorer | Como o custo e o uso estão se comportando? |
| AWS Budgets | Quando devo ser avisado sobre um limite definido? |

A calculadora depende das premissas informadas; não é uma garantia de valor final. O Cost Explorer permite analisar o histórico e previsões. O Budgets acompanha limites e pode emitir alertas; apenas criar um orçamento não estabelece um teto rígido que interrompe toda a cobrança. Ações automatizadas exigem configuração e têm escopo próprio. [Cost Explorer](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html), [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html).

## Cenário: processamento de arquivos

Uma equipe hipotética recebe arquivos para processar durante a noite. Cada tarefa salva o progresso e pode ser repetida sem duplicar o resultado final.

Spot pode ser uma opção para esse processamento, desde que a equipe aceite variação na disponibilidade e planeje as interrupções. Se houver um prazo rígido, também precisa considerar capacidade alternativa.

Já um componente com consumo constante pode justificar a avaliação de um compromisso. Não dá para calcular uma economia concreta sem conhecer região, tipo de instância, duração e demais recursos usados.

## Erros comuns e foco na CLF-C02

Evite escolher por desconto isolado, tratar RI como outra categoria de hardware ou interpretar Budgets como bloqueio universal de gastos. Inclua no raciocínio armazenamento, tráfego e outros recursos da arquitetura.

Na certificação, relacione o modelo às condições do enunciado: flexibilidade, previsibilidade, compromisso e tolerância a interrupções.

## Questão autoral

Uma empresa executa tarefas em lote que podem ser interrompidas e retomadas. Ela quer aproveitar capacidade disponível com desconto, sem compromisso de longo prazo. Qual opção corresponde melhor ao cenário?

- **A.** Dedicated Host, porque todo processamento em lote exige hardware exclusivo.
- **B.** Reserved Instances, porque dispensam compromisso.
- **C.** Instâncias Spot, com tratamento de interrupções na aplicação.
- **D.** AWS Budgets, porque fornece capacidade computacional com desconto.

**Resposta: C.** Spot atende ao uso de capacidade disponível por tarefas que toleram interrupção.

A inventa uma exigência de isolamento. B está errada porque RIs envolvem compromisso. D confunde acompanhamento de orçamento com fornecimento de computação.

## Resumo

On-Demand prioriza flexibilidade. Spot exige tolerância a interrupções. Savings Plans e RIs precisam de uso previsível para que o compromisso faça sentido. Reserva de capacidade, isolamento físico e controle de custos são decisões relacionadas, mas diferentes.

## Documentação oficial

- [Opções de compra](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html)
- [Savings Plans](https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html)
- [Reserved Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-reserved-instances.html)
- [Pricing Calculator, referência no guia EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html#ec2-pricing)
- [Cost Explorer](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html)
- [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)
