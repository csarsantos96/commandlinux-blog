---
title: Conceitos de nuvem para a certificação Azure. Anotações do dia 1
description: Comecei do zero os estudos para a certificação inicial da Azure. Neste post reúno minhas anotações sobre modelo de consumo, multicloud, Azure Arc, modelos de implantação e responsabilidade compartilhada.
date: 2026-08-06
category: CLOUD
tags: [azure, cloud, az-900, certificacao, iaas, paas, saas, multicloud, terraform, azure-arc]
---

Recebi uma proposta de trabalho que usa Azure e, pra me preparar, comecei hoje a estudar para a certificação inicial da plataforma. A prova é semana que vem, então resolvi estudar do zero e ao mesmo tempo transformar as anotações em conteúdo pro blog.

Esse primeiro dia foi só sobre conceitos: como a nuvem cobra pelo que você usa, os modelos de implantação (privada, pública e híbrida), o modelo de responsabilidade compartilhada entre provedor e consumidor, e uma introdução aos serviços do Azure. Nada de mão na massa ainda, mas é a base que sustenta tudo o que vem depois.

## Modelo baseado em consumo e preço

A computação em nuvem é baseada em consumo: você paga somente pelo que usa e libera o restante quando termina.

Por isso, esse gasto é tratado como **despesa operacional (OpEx)**, e não como **investimento antecipado em hardware (CapEx)**. A diferença é importante:

- **CapEx** é comprar servidor, montar datacenter, pagar por capacidade que talvez você nem precise usar por completo.
- **OpEx** é alugar exatamente a capacidade que você está consumindo agora, sem compromisso de longo prazo.

A vantagem prática é ajustar os recursos à demanda real: sobe quando precisa, corta quando não precisa mais, sem pagar por capacidade ociosa. Também tira da sua mão a preocupação com energia, refrigeração e hardware — isso fica por conta do provedor.

## Multicloud e Terraform

**Multicloud** é o cenário em que você (ou a empresa) usa vários provedores de nuvem pública ao mesmo tempo. Alguns motivos para isso acontecer:

- Usar recursos diferentes de provedores diferentes, conforme o que cada um faz melhor.
- Estar migrando de um provedor para outro.
- Redundância: uma aplicação hospedada em um provedor e replicada em outro, garantindo que se um cair o outro assume.

Ao falar de multicloud, aparece logo a pergunta: *como gerenciar recursos em provedores sem enlouquecer?* É aí que entra o **Terraform**, uma ferramenta de Infrastructure as Code que provisiona infraestrutura na AWS, Azure, Google Cloud e outros provedores usando a mesma linguagem.

Multicloud é a estratégia, e o Terraform é uma das ferramentas que tornam ela viável. Mais pra frente pretendo dedicar um post (ou uma série) só pra isso: provisionar a mesma stack em dois provedores diferentes e ver a mágica acontecer.

### Azure Arc

**Azure Arc** é um conjunto de tecnologias que estende o gerenciamento e os serviços do Azure para infraestrutura que roda fora do Azure.

Exemplo prático: você tem um cluster Kubernetes rodando na AWS. Em vez de gerenciar esse cluster pelo console da AWS, você o registra no Arc e passa a comandá-lo — junto com outros recursos — a partir do próprio Azure.

## Modelos de implantação de nuvem

### Nuvem privada

Ambiente usado por uma única entidade — na prática, o próprio datacenter da empresa. A vantagem é o controle, mas o preço é que a empresa mantém todo o gerenciamento: manutenção, refrigeração, local físico e funcionários responsáveis por isso.

### Nuvem pública

Ambiente criado, controlado e mantido por um provedor de nuvem de terceiros (Azure, AWS, Oracle Cloud, Google Cloud). Essas empresas alugam e disponibilizam serviços e espaço na própria infraestrutura para outras empresas contratarem.

### Nuvem híbrida

É a mistura das outras duas. Exemplo: uma empresa tem seu próprio datacenter e precisa escalar horizontalmente por um período determinado — ela pode adicionar nuvem pública ao seu ambiente. Nesse momento o ambiente se torna híbrido: cresce horizontalmente enquanto é preciso e depois volta ao tamanho original, conforme a demanda.

### Alguns aspectos da nuvem pública

- Nenhuma despesa de capital para escalar.
- Aplicativos podem ser provisionados e desprovisionados rapidamente.
- Você paga apenas pelo que usa.

## Modelo de responsabilidade compartilhada

No modelo de responsabilidade compartilhada, as responsabilidades de segurança e gerenciamento são divididas entre o provedor de nuvem e o consumidor.

**Responsabilidades do provedor:** segurança física, energia, refrigeração e conectividade do datacenter.

**Responsabilidades do consumidor:**

- As informações e os dados armazenados na nuvem.
- Os dispositivos com permissão para se conectar ao ambiente (celulares, computadores etc.).
- As contas e identidades de pessoas, serviços e dispositivos.

Onde exatamente essa linha é traçada depende do modelo de serviço contratado — e é aí que entram **IaaS**, **PaaS** e **SaaS**.

### IaaS, PaaS e SaaS

| Item | IaaS | PaaS | SaaS |
|---|---|---|---|
| Datacenter físico, rede física, hosts físicos | Provedor | Provedor | Provedor |
| Sistema operacional | Consumidor | Provedor | Provedor |
| Aplicativos | Consumidor | Consumidor | Provedor |
| Identidade e acesso | Consumidor | Consumidor | Provedor* |

*\*Um bom exemplo dessa divisão: no PaaS e no SaaS, identidade e acesso normalmente não são compartilhados — você continua gerenciando seus próprios usuários, funções e políticas, enquanto o provedor executa a plataforma de autenticação (como o Microsoft Entra ID). Já no SaaS puro, a responsabilidade passa a ser quase inteiramente do provedor.*

Resumindo a lógica: **IaaS** coloca a maior responsabilidade sobre o consumidor, com o provedor cuidando só das questões básicas (segurança física, energia, conectividade). **SaaS** inverte isso — a maior parte da responsabilidade fica com o provedor. **PaaS** é o meio-termo, distribuindo a responsabilidade de forma mais equilibrada entre os dois lados.

## Conceitos básicos do Microsoft Azure

O Azure é uma plataforma de computação em nuvem com um conjunto de serviços em constante expansão. Ele pode hospedar desde serviços web simples voltados para a internet até computadores totalmente virtualizados.

Os principais grupos de serviço que vi até agora:

| Categoria | Exemplos |
|---|---|
| Compute | VMs, Containers, Functions |
| Databases | SQL, CosmosDB, MySQL, PostgreSQL |
| Storage | Blob, Files, Queues, Tables |
| Networking | VNet, Load Balancer, DNS, CDN |
| IoT | IoT Hub, IoT Central, Edge Services |
| AI + ML | Azure OpenAI, AI Services, Machine Learning |

### O que é computação em nuvem

É a entrega de serviços de computação pela internet. Esses serviços incluem infraestrutura de TI como computação (VMs), armazenamento, banco de dados e rede.

Os serviços de computação em nuvem também expandem as ofertas tradicionais de TI para incluir itens como IoT (Internet das Coisas) e ML (Machine Learning) — coisas que antes exigiam times e infraestrutura próprios e hoje são consumidas como serviço.

## Conclusão

Foi um bom primeiro dia: nenhuma linha de comando, mas uma base conceitual que vai facilitar entender o "porquê" das próximas etapas — provisionamento, identidade, segurança e governança no Azure.

A prova é semana que vem, então devo publicar mais anotações como essa ao longo dos próximos dias, conforme for avançando pelo restante do conteúdo.

## Referências

- [Microsoft Learn — Conceitos de nuvem (AZ-900)](https://learn.microsoft.com/pt-br/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/) — trilha oficial usada como base destas anotações.
- [Microsoft Learn — Modelo de responsabilidade compartilhada](https://learn.microsoft.com/pt-br/azure/security/fundamentals/shared-responsibility) — detalha a divisão de responsabilidades entre provedor e consumidor.
- [Microsoft Learn — O que é o Azure Arc](https://learn.microsoft.com/pt-br/azure/azure-arc/overview) — documentação oficial sobre o Azure Arc.
- [Terraform — Documentação oficial](https://developer.hashicorp.com/terraform/docs) — ferramenta de Infrastructure as Code citada como viabilizadora de estratégias multicloud.
