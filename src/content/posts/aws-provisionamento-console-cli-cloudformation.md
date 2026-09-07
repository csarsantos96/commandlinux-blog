---
title: "Provisionar na AWS: console, CLI, CloudFormation e serviços gerenciados"
description: "Entenda as formas de criar recursos na AWS e diferencie CloudFormation, Elastic Beanstalk, Batch, Lightsail e Outposts."
date: 2026-09-07
category: CLOUD
tags: [aws, cloudformation, automacao, infraestrutura-como-codigo, cloud-practitioner]
draft: false
series: "AWS para a Cloud Practitioner"
part: 7
totalParts: 12
---

⸻

Você pode criar um recurso clicando no console, executando um comando ou aplicando uma descrição da infraestrutura. O resultado pode envolver os mesmos serviços, mas a forma de trabalhar muda bastante.

Na Amazon Web Services (AWS), vale separar **a interface usada para pedir uma operação** do **serviço que administra um ambiente para você**.

## As interfaces chegam às APIs

Uma interface de programação de aplicações, ou API (*Application Programming Interface*), permite solicitar operações de um serviço. O console e as ferramentas de automação usam essas interfaces para criar, consultar e modificar recursos.

| Forma de acesso | Como você trabalha | Uso típico |
| --- | --- | --- |
| AWS Management Console | Interface gráfica | Explorar recursos e realizar operações manuais |
| AWS Command Line Interface (CLI) | Comandos no terminal | Consultas e scripts |
| Software Development Kit (SDK) | Bibliotecas na linguagem da aplicação | Integrar o código aos serviços |
| AWS CloudFormation | Descrição da infraestrutura | Criar e atualizar conjuntos de recursos |

Mudar a interface não dispensa autenticação ou permissões. Um comando não ganha acesso a um recurso apenas por ser executado no terminal. A documentação do EC2 reúne exemplos dessas [formas de acesso](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html#access-ec2).

## CloudFormation: infraestrutura descrita em código

Infraestrutura como código, ou IaC (*Infrastructure as Code*), permite registrar a configuração em arquivos que podem ser revisados e versionados.

No CloudFormation, um template descreve recursos. Uma **stack** reúne os recursos administrados a partir desse template. O serviço organiza o provisionamento e as dependências necessárias.

Isso é diferente de manter uma lista de cliques a repetir manualmente. O template pode ser reaplicado para criar ambientes semelhantes, com valores próprios para cada ambiente. [Funcionamento do CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html).

Ainda é preciso revisar mudanças: uma alteração de propriedade pode exigir substituição de recurso. Declarar infraestrutura não elimina o impacto de excluir ou recriar algo que contém dados.

## Provisionamento não é o mesmo que implantação de aplicação

Provisionar cria e configura a infraestrutura. Implantar coloca uma versão da aplicação no ambiente. Algumas ferramentas abrangem partes dos dois processos, mas as responsabilidades continuam distinguíveis.

Imagine uma equipe criando teste e produção. O CloudFormation pode descrever os recursos e suas configurações. A equipe ainda precisa definir como constrói a aplicação, como publica versões e como verifica se a implantação funcionou.

## Quando um serviço gerenciado simplifica o trabalho

As anotações também apresentam serviços que resolvem necessidades mais específicas do que uma ferramenta geral de provisionamento.

| Serviço | Necessidade principal | Limite da comparação |
| --- | --- | --- |
| Elastic Beanstalk | Implantar aplicações em plataformas suportadas | Não é apenas um editor de templates |
| AWS Batch | Agendar e executar processamento em lote | Não é a escolha natural para responder a cada clique de um site |
| Amazon Lightsail | Criar ambientes com experiência simplificada e pacotes de recursos | Não remove a manutenção do software que você administra |
| AWS Outposts | Usar infraestrutura AWS no ambiente local | Não é uma interface alternativa do console |

O Elastic Beanstalk provisiona recursos para a aplicação e ajuda a administrar o ambiente. Dependendo da configuração, isso inclui instâncias, balanceamento e escala. Você continua responsável pelo código e pelas escolhas do ambiente; os recursos utilizados são cobrados. [Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html).

O Batch organiza jobs e capacidade computacional para tarefas em lote. Uma fila de milhares de arquivos a processar é um cenário mais próximo de sua finalidade do que uma página que precisa responder imediatamente. [AWS Batch](https://docs.aws.amazon.com/batch/latest/userguide/what-is-batch.html).

Lightsail oferece uma experiência simplificada com recursos agrupados em planos. Um site pequeno pode aproveitar isso, mas previsibilidade do pacote não significa ausência de limites ou custos adicionais. [Amazon Lightsail](https://docs.aws.amazon.com/lightsail/latest/userguide/what-is-amazon-lightsail.html).

Outposts estende infraestrutura e serviços compatíveis da AWS para instalações locais. Pode atender a necessidades de processamento local e baixa latência com sistemas próximos; exige planejamento físico e conectividade. Não disponibiliza automaticamente todo o catálogo regional no data center. [AWS Outposts](https://docs.aws.amazon.com/outposts/latest/userguide/what-is-outposts.html).

## Como decidir sem misturar as categorias

Se a dificuldade é repetir a infraestrutura com consistência, avalie IaC. Se a equipe quer entregar uma aplicação numa plataforma suportada com menos montagem manual, avalie Beanstalk. Se precisa administrar milhares de tarefas em lote, avalie Batch.

Não use uma plataforma de implantação como substituto automático de uma estratégia de recuperação de dados. E não escolha infraestrutura local quando o projeto só precisa de hospedagem convencional numa região.

## Questão autoral para a CLF-C02

Uma equipe quer descrever recursos AWS em templates e gerenciar esses recursos como uma unidade reproduzível. Qual serviço atende diretamente a esse objetivo?

- **A.** AWS CloudFormation.
- **B.** AWS Outposts.
- **C.** AWS Batch.
- **D.** Amazon Lightsail apenas por oferecer planos de recursos.

**Resposta: A.** Templates e stacks são os mecanismos de gerenciamento de infraestrutura descritos no cenário.

B atende à extensão de infraestrutura para o ambiente local. C organiza trabalhos em lote. D simplifica hospedagem, mas a característica citada não corresponde ao gerenciamento por templates e stacks.

## Resumo

Console, CLI e SDK são formas de interação. CloudFormation descreve e administra infraestrutura. Beanstalk, Batch, Lightsail e Outposts atendem necessidades específicas de implantação, processamento, simplicidade e localização. Para a certificação, identifique o problema antes de associá-lo a um nome de serviço.

## Documentação oficial

- [CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html)
- [Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html)
- [AWS Batch](https://docs.aws.amazon.com/batch/latest/userguide/what-is-batch.html)
- [Amazon Lightsail](https://docs.aws.amazon.com/lightsail/latest/userguide/what-is-amazon-lightsail.html)
- [AWS Outposts](https://docs.aws.amazon.com/outposts/latest/userguide/what-is-outposts.html)
