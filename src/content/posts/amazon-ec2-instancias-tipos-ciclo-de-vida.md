---
title: "Amazon EC2: instâncias, tipos e ciclo de vida"
description: "Aprenda o que é uma instância EC2, como escolher seu perfil e o que acontece com os dados ao reiniciar, parar ou encerrar um servidor."
date: 2026-09-07
category: CLOUD
tags: [aws, ec2, cloud-practitioner, computacao, instancias]
draft: false
series: "AWS para a Cloud Practitioner"
part: 2
totalParts: 12
---

⸻

Você precisa executar uma aplicação, escolher o sistema operacional e instalar os pacotes que ela usa. Na Amazon Web Services (AWS), o Amazon Elastic Compute Cloud (EC2) oferece capacidade computacional para esse tipo de necessidade.

O ponto principal é entender a troca: você ganha controle sobre o servidor, mas também assume o trabalho de administrá-lo.

## O que é uma instância?

Uma **instância EC2** é um servidor na nuvem. No uso mais comum, ela funciona como uma máquina virtual: tem processamento, memória, rede e acesso a armazenamento. Você instala e executa o software necessário nesse ambiente.

Para criá-la, escolhe uma Amazon Machine Image (AMI), a imagem de máquina que serve como base do sistema, e um tipo de instância, que define seu perfil de recursos. A imagem não é a instância em execução. [Conceitos do EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html).

Pense numa receita e no prato preparado: a imagem fornece a base para criar servidores; a instância é um desses servidores funcionando. Alterar uma instância não atualiza automaticamente a imagem original.

## Como escolher o tipo de instância

Uma unidade central de processamento, ou CPU (*Central Processing Unit*), executa instruções. A memória mantém os dados usados pelos processos. Rede e armazenamento também limitam o desempenho. Portanto, olhar apenas para a quantidade de processamento pode levar a uma escolha ruim.

| Categoria | Prioridade | Situação típica |
| --- | --- | --- |
| Uso geral | Equilíbrio entre recursos | Aplicações web e desenvolvimento |
| Otimizada para computação | Processamento | Cálculos e tarefas intensivas em CPU |
| Otimizada para memória | Capacidade de memória | Bancos em memória e caches grandes |
| Computação acelerada | Aceleradores de hardware | Treinamento de modelos e processamento especializado |
| Otimizada para armazenamento | Desempenho de armazenamento local | Cargas intensivas em leitura e escrita |

Essas categorias orientam a escolha. O tipo concreto precisa ser compatível com o software e com o gargalo observado. Treinar um modelo, por exemplo, pode exigir uma unidade de processamento gráfico, ou GPU (*Graphics Processing Unit*), em vez de somente mais CPU. [Tipos de instância](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-types.html).

## O que você configura

Além da imagem e do tipo, é necessário definir onde a instância será criada, seu armazenamento e as regras de acesso. Uma instância precisa de caminhos de rede e permissões adequadas para se comunicar; estar ligada não significa estar acessível pela internet.

No modelo comum de uso do EC2, o cliente administra o sistema operacional convidado, os programas instalados e suas configurações de segurança. Ferramentas podem automatizar esse trabalho, mas a escolha e a configuração continuam necessárias.

## Reiniciar, parar e encerrar

Essas operações têm consequências diferentes, especialmente para os dados.

| Operação | O que acontece | Atenção ao armazenamento |
| --- | --- | --- |
| Reiniciar, ou reboot | Reinicia o sistema operacional | Dados do instance store permanecem no reboot normal |
| Parar, ou stop | Desliga uma instância compatível para iniciá-la depois | Volumes persistentes permanecem; dados do instance store são perdidos |
| Encerrar, ou terminate | Remove a instância definitivamente | Volumes podem ser excluídos conforme sua configuração |

O Amazon Elastic Block Store (EBS) fornece volumes persistentes. Porém, persistente não significa impossível de excluir: a configuração `DeleteOnTermination` controla o destino do volume ao encerrar a instância. O volume raiz costuma ser excluído por padrão.

Uma instância parada também pode continuar gerando custos de recursos associados, como volumes. [Ciclo de vida e cobrança por estado](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html).

## Quando usar — e quando avaliar outra opção

O EC2 faz sentido quando a aplicação exige controle do sistema operacional, dependências específicas ou processos que precisam permanecer em execução.

Se a necessidade é executar uma função curta em resposta a eventos, avalie AWS Lambda. Se o objetivo é executar contêineres sem administrar os servidores subjacentes, avalie AWS Fargate. Se é apenas entregar arquivos estáticos, talvez nem seja necessário manter um servidor de aplicação.

Essas alternativas não tornam EC2 obsoleto. Elas mudam a divisão de responsabilidades e os limites do ambiente.

## Cenário: uma aplicação com dependências próprias

Imagine um sistema interno que depende de bibliotecas específicas do Linux e precisa executar continuamente. A equipe pode criar uma instância a partir de uma imagem compatível, instalar as dependências e manter os dados importantes em armazenamento persistente com backup.

Depois, observa o uso real. Se faltar memória, aumentar somente o processamento pode não ajudar. E se a aplicação precisar continuar disponível durante uma falha, a solução exige redundância além do dimensionamento dessa única máquina.

## Erros comuns e revisão para a CLF-C02

Não confunda imagem com servidor, armazenamento temporário com persistente, nem parada com exclusão. Outra confusão é imaginar que a AWS atualiza automaticamente todos os pacotes que você instalou na instância.

Para a certificação, pratique associar a necessidade ao perfil de computação: controle do sistema, memória, processamento ou aceleração. Decorar nomes de famílias sem entender a carga ajuda pouco.

## Questão autoral

Uma aplicação precisa de controle sobre o sistema operacional e mantém um grande conjunto de dados em memória durante o processamento. Qual opção merece ser avaliada primeiro?

- **A.** Uma instância EC2 otimizada para memória.
- **B.** Um bucket usado apenas para armazenar objetos.
- **C.** Um serviço de registro de domínios.
- **D.** Um volume de armazenamento sem recurso de computação associado.

**Resposta: A.** Ela combina controle sobre o sistema operacional com um perfil voltado à necessidade descrita.

B armazena objetos, mas não executa esse sistema. C cuida de nomes de domínio. D fornece armazenamento, mas não substitui o servidor que executará a aplicação.

## Resumo

EC2 oferece controle sobre computação. A imagem define a base do servidor, o tipo define seus recursos e o ciclo de vida influencia dados e custos. Escolha o perfil pelo comportamento da aplicação e planeje persistência, segurança e recuperação desde o início.

## Documentação oficial

- [O que é Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html)
- [Tipos de instância](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-types.html)
- [Ciclo de vida](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html)
- [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
