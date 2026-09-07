---
title: "Backups e recuperação na AWS: snapshots, Backup e Storage Gateway"
description: "Diferencie snapshots, AWS Backup, Storage Gateway e Elastic Disaster Recovery para planejar cópias, integração híbrida e recuperação."
date: 2026-09-07
category: CLOUD
tags: [aws, backup, snapshots, storage-gateway, recuperacao]
draft: false
series: "AWS para a Cloud Practitioner"
part: 12
totalParts: 12
---

⸻

Uma aplicação pode ter armazenamento persistente e ainda perder dados por exclusão, corrupção ou uma mudança errada. E possuir uma cópia não prova que o sistema consegue voltar a funcionar no tempo necessário.

Na Amazon Web Services (AWS), snapshots, políticas de backup, integração híbrida e recuperação de servidores atendem partes diferentes desse problema.

## Snapshot: um ponto de recuperação do volume

Um snapshot do Amazon Elastic Block Store (EBS) registra dados de um volume para permitir sua recuperação. Os snapshots são incrementais: depois do primeiro, novos snapshots armazenam os blocos alterados necessários, enquanto a AWS administra a composição dos dados para restaurar o volume.

No uso regional comum, um snapshot permite criar um volume em outra zona da mesma região. Para restaurar em outra região, é necessário copiar o snapshot para lá. Isso não move o volume original entre zonas. [Snapshots do EBS](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html).

Também é preciso considerar a consistência da aplicação. Uma cópia de blocos não representa automaticamente uma cópia logicamente consistente de toda transação que estava em andamento.

## Automatizar snapshots ou centralizar backups?

O Amazon Data Lifecycle Manager (DLM), gerenciador de ciclo de vida de dados, automatiza operações como criação e retenção de snapshots do EBS por políticas. Ele ajuda a evitar uma rotina dependente de cliques manuais. [Documentação do DLM](https://docs.aws.amazon.com/ebs/latest/userguide/snapshot-lifecycle.html).

O AWS Backup oferece gerenciamento centralizado de backups para recursos suportados. Planos definem quando proteger recursos e por quanto tempo manter pontos de recuperação; é necessário associar os recursos e configurar as permissões apropriadas. [AWS Backup](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html).

| Necessidade | Recurso a avaliar |
| --- | --- |
| Recuperar um volume a partir de um ponto no tempo | Snapshot EBS |
| Automatizar o ciclo de snapshots EBS | DLM |
| Centralizar políticas de backup de vários recursos suportados | AWS Backup |

Evite sobrepor políticas sem intenção: duas rotinas protegendo os mesmos dados podem aumentar cópias e custos sem melhorar o objetivo de recuperação.

## Storage Gateway: ligar armazenamento local à nuvem

AWS Storage Gateway atende integração entre aplicações locais e armazenamento na AWS. A modalidade depende da interface esperada pela aplicação.

O Amazon S3 File Gateway apresenta arquivos por Network File System (NFS) ou Server Message Block (SMB). Por trás dessa interface, os arquivos são armazenados como objetos no Amazon Simple Storage Service (S3), com cache local para acessos. Isso permite integrar uma aplicação que já trabalha com compartilhamentos de arquivos. [S3 File Gateway](https://docs.aws.amazon.com/filegateway/latest/files3/what-is-file-s3.html).

| Modalidade | Interface | Uso típico |
| --- | --- | --- |
| S3 File Gateway | Arquivos por NFS ou SMB | Enviar e acessar arquivos armazenados como objetos S3 |
| Volume Gateway | Blocos por Internet Small Computer Systems Interface (iSCSI) | Volumes locais integrados a armazenamento e snapshots na nuvem |
| Tape Gateway | Biblioteca de fitas virtuais | Integrar aplicações de backup que trabalham com fitas |

Volume Gateway e Tape Gateway possuem seus próprios modelos de armazenamento e recuperação. Não são nomes alternativos para o File Gateway. [Volume Gateway](https://docs.aws.amazon.com/storagegateway/latest/vgw/WhatIsStorageGateway.html), [Tape Gateway](https://docs.aws.amazon.com/storagegateway/latest/tgw/WhatIsStorageGateway.html).

## Recuperar servidores com Elastic Disaster Recovery

AWS Elastic Disaster Recovery, identificado como DRS, mantém replicação para apoiar a recuperação de servidores na AWS. A equipe prepara a configuração de recuperação, testa e inicia os procedimentos necessários quando ocorre um incidente. [Documentação do Elastic Disaster Recovery](https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html).

Ele não é apenas um cofre de backups nem uma proteção automática contra qualquer erro. Se uma corrupção acontecer na origem, ela também pode afetar dados replicados. Pontos anteriores, isolamento e procedimentos de recuperação precisam fazer parte da estratégia.

## Dois objetivos que orientam a escolha

O objetivo de ponto de recuperação, ou RPO (*Recovery Point Objective*), expressa quanto de perda de dados no tempo o negócio aceita. O objetivo de tempo de recuperação, ou RTO (*Recovery Time Objective*), expressa quanto tempo o sistema pode levar para voltar. [Definição dos objetivos de recuperação](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_planning_for_recovery_objective_defined_recovery.html).

Num exemplo hipotético, a empresa aceita perder até uma hora de alterações e precisa retornar em até quatro horas. A frequência de proteção e o processo de restauração precisam demonstrar que conseguem atender a esses objetivos.

Esses valores são requisitos do exemplo, não promessas de resultado de um serviço. Testar restauração inclui verificar dados, permissões, rede e funcionamento da aplicação.

## Quando usar e quando não usar

Use snapshots para pontos de recuperação de volumes, Backup para políticas centralizadas e Storage Gateway quando aplicações locais precisam de integração com armazenamento na nuvem. Avalie DRS quando o problema é recuperar servidores e aplicações replicados.

Não introduza um gateway híbrido se a aplicação já acessa diretamente o armazenamento adequado e não precisa dessa interface. E não confunda replicação, backup e alta disponibilidade: cada mecanismo cobre riscos e tempos diferentes.

## Questão autoral para a CLF-C02

Uma empresa mantém uma aplicação local que grava arquivos por SMB. Ela quer armazenar esses arquivos como objetos no S3 e manter cache local. Qual opção atende ao cenário?

- **A.** S3 File Gateway.
- **B.** Tape Gateway, porque qualquer arquivo precisa ser convertido em fita.
- **C.** DLM, porque apresenta compartilhamentos SMB.
- **D.** Um snapshot EBS isolado, porque funciona como servidor de arquivos local.

**Resposta: A.** O S3 File Gateway oferece a interface de arquivos e a integração descritas.

B atende a fluxos baseados em fitas virtuais. C automatiza ciclos de snapshots, não compartilhamentos SMB. D é um ponto de recuperação de volume, não um serviço de acesso a arquivos locais.

## Resumo

Uma cópia é parte do plano, não sua comprovação. Defina o que precisa recuperar, a perda aceitável e o tempo de retorno. Escolha mecanismos compatíveis e valide a restauração. Para a certificação, diferencie proteção de volumes, política centralizada, integração híbrida e recuperação de servidores.

## Documentação oficial

- [Snapshots EBS](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html)
- [Data Lifecycle Manager](https://docs.aws.amazon.com/ebs/latest/userguide/snapshot-lifecycle.html)
- [AWS Backup](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html)
- [S3 File Gateway](https://docs.aws.amazon.com/filegateway/latest/files3/what-is-file-s3.html)
- [Volume Gateway](https://docs.aws.amazon.com/storagegateway/latest/vgw/WhatIsStorageGateway.html)
- [Tape Gateway](https://docs.aws.amazon.com/storagegateway/latest/tgw/WhatIsStorageGateway.html)
- [Elastic Disaster Recovery](https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html)
- [Objetivos de recuperação](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_planning_for_recovery_objective_defined_recovery.html)
