---
title: "EBS, S3, EFS e FSx: escolhendo o armazenamento na AWS"
description: "Compare armazenamento em blocos, objetos e arquivos e entenda a diferença entre EBS, instance store, S3, EFS e FSx."
date: 2026-09-07
category: CLOUD
tags: [aws, armazenamento, ebs, efs, cloud-practitioner]
draft: false
series: "AWS para a Cloud Practitioner"
part: 10
totalParts: 12
---

⸻

Guardar uma imagem de site, instalar o sistema operacional de um servidor e compartilhar uma pasta entre aplicações são necessidades de armazenamento. Mas a aplicação acessa esses dados de formas diferentes.

Na Amazon Web Services (AWS), escolher começa pelo modelo de acesso: blocos, objetos ou arquivos. Capacidade e preço vêm depois dessa compatibilidade básica.

## Três modelos de acesso

No armazenamento em **blocos**, o sistema operacional trabalha com um dispositivo que pode receber partições e um sistema de arquivos. É o modelo mais próximo de um disco conectado ao servidor.

No armazenamento em **objetos**, a aplicação usa operações sobre objetos identificados por chaves. Uma foto pode ser um objeto; a aplicação solicita seu envio ou sua leitura pela interface do serviço.

No armazenamento em **arquivos**, a aplicação acessa uma estrutura de diretórios e arquivos, geralmente montada pela rede. Esse modelo pode atender aplicações que já esperam caminhos de arquivos compartilhados.

| Necessidade | Serviço ou recurso a avaliar |
| --- | --- |
| Volume persistente para uma instância | Amazon Elastic Block Store (EBS) |
| Armazenamento local temporário | Instance store |
| Objetos como imagens, documentos e backups | Amazon Simple Storage Service (S3) |
| Sistema de arquivos compartilhado para Linux | Amazon Elastic File System (EFS) |
| Sistema de arquivos com tecnologia específica | Família Amazon FSx |

## EBS e instance store: persistência é a diferença central

EBS fornece volumes em blocos para instâncias do Amazon Elastic Compute Cloud (EC2). O volume é conectado pela rede e fica em uma zona de disponibilidade. Para anexá-lo normalmente a uma instância, ambos precisam estar na mesma zona. [Visão geral do EBS](https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html).

O instance store usa armazenamento local do host. Ele é adequado a dados temporários que podem ser reconstruídos, como arquivos intermediários de processamento. Não deve ser a única cópia de dados importantes.

Um reboot normal preserva seus dados, mas parar ou encerrar a instância faz com que sejam perdidos. No EBS, parar a instância preserva os volumes; encerrar pode excluí-los conforme a configuração. [Ciclo de vida da instância](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html).

Também não confunda persistência com backup. Um arquivo excluído por engano pode desaparecer de um volume persistente perfeitamente saudável.

## S3: objetos dentro de buckets

Um bucket organiza objetos. Uma chave como `imagens/capa.png` identifica um objeto; as barras podem representar uma organização por prefixos, sem transformar a interface de objetos em um disco local.

Este comparativo trata do acesso por objetos do S3. Integrações que oferecem interfaces de arquivos sobre dados em S3 precisam ser avaliadas separadamente; não se deve presumir que operações sobre objetos têm a mesma semântica de um sistema de arquivos.

O S3 é uma opção para imagens, documentos, cópias de segurança e dados usados por outras aplicações. Ele não depende de manter uma instância ligada para armazenar os objetos. [Buckets de uso geral](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html).

## EFS: arquivos compartilhados

EFS fornece um sistema de arquivos gerenciado, acessível usando Network File System (NFS), protocolo de sistema de arquivos em rede. Várias instâncias Linux podem montar o mesmo sistema e acessar os arquivos compartilhados.

Isso ajuda quando a aplicação espera uma pasta de rede. Porém, compartilhar armazenamento não resolve automaticamente conflitos de escrita: a aplicação ainda precisa coordenar alterações concorrentes. Também há opções regionais e de zona única, com características de resiliência diferentes. [Documentação do EFS](https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html).

## FSx: qual tecnologia a aplicação exige?

FSx é uma família de serviços de arquivos, não um único tipo universal de armazenamento.

| Variante | Necessidade típica |
| --- | --- |
| FSx for Windows File Server | Compartilhamentos Windows com Server Message Block (SMB) e integração com Active Directory |
| FSx for Lustre | Processamento de alto desempenho, como simulações e análise de dados |
| FSx for NetApp ONTAP | Aplicações que precisam dos recursos e da compatibilidade do ONTAP |
| FSx for OpenZFS | Cargas que precisam de um sistema de arquivos baseado em OpenZFS |

Não escolha uma variante apenas porque a aplicação roda em Linux ou Windows. Confirme protocolo, recursos, disponibilidade e comportamento necessário. [FSx for Windows File Server](https://docs.aws.amazon.com/fsx/latest/WindowsGuide/what-is.html), [Tipos de sistemas FSx](https://docs.aws.amazon.com/fsx/latest/APIReference/API_FileSystem.html).

## Cenário: servidores que precisam dos mesmos arquivos

Uma aplicação hipotética tem três instâncias Linux e precisa que todas leiam os mesmos arquivos por caminhos de sistema de arquivos. EFS é uma opção a avaliar.

Se a aplicação puder trabalhar diretamente com objetos, S3 pode atender de outra forma. Se os arquivos forem apenas temporários e reconstruíveis, armazenamento local pode ser suficiente. O requisito de acesso determina a comparação.

Não presuma que anexar um volume EBS a várias instâncias cria uma pasta compartilhada segura. Existem recursos específicos de anexação múltipla, mas eles exigem tipos compatíveis e coordenação de escrita. Não equivalem ao uso geral de um sistema de arquivos compartilhado. [EBS Multi-Attach](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes-multi.html).

## Questão autoral para a CLF-C02

Várias instâncias Linux precisam montar simultaneamente o mesmo sistema de arquivos gerenciado usando NFS. Qual opção corresponde melhor?

- **A.** Instance store de uma única instância.
- **B.** Amazon EFS.
- **C.** Um volume EBS comum tratado como pasta compartilhada entre zonas.
- **D.** Um serviço de resolução de nomes.

**Resposta: B.** EFS atende ao acesso compartilhado por NFS.

A é armazenamento local e temporário. C atribui ao volume uma função e um alcance que ele não oferece dessa maneira. D não armazena os arquivos da aplicação.

## Resumo

Blocos atendem ao modelo de disco. Objetos atendem ao acesso por chaves e operações de armazenamento. Arquivos atendem a aplicações que esperam um sistema compartilhado. Para a certificação, reconheça esses modelos; na prática, complete a escolha com persistência, disponibilidade e recuperação.

## Documentação oficial

- [Amazon EBS](https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html)
- [EBS Multi-Attach](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes-multi.html)
- [Ciclo de vida e armazenamento](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html)
- [Buckets S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html)
- [Amazon EFS](https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html)
- [FSx for Windows File Server](https://docs.aws.amazon.com/fsx/latest/WindowsGuide/what-is.html)
- [Tipos de sistemas FSx](https://docs.aws.amazon.com/fsx/latest/APIReference/API_FileSystem.html)
