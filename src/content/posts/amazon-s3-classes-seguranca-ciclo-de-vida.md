---
title: "Amazon S3: classes de armazenamento, proteção e ciclo de vida"
description: "Entenda como escolher classes do S3 e combinar versionamento, permissões e ciclo de vida sem confundir durabilidade com disponibilidade."
date: 2026-09-07
category: CLOUD
tags: [aws, s3, armazenamento, seguranca, cloud-practitioner]

draft: false
series: "AWS para a Cloud Practitioner"
part: 11
totalParts: 12
---

⸻

Uma imagem acessada diariamente e um arquivo guardado por anos não precisam da mesma combinação de custo e recuperação. No Amazon Simple Storage Service (S3), da Amazon Web Services (AWS), as classes de armazenamento ajudam a ajustar essa escolha.

Antes de selecionar a classe mais barata, pergunte com que frequência o objeto será lido e quanto tempo a aplicação pode esperar para recuperá-lo.

## Durabilidade não é disponibilidade

**Durabilidade** trata da preservação dos dados. **Disponibilidade** trata da possibilidade de acessar o serviço e os dados quando necessário.

Um objeto pode estar preservado em uma classe de arquivo e exigir restauração antes da leitura. Da mesma forma, uma classe que armazena dados em uma única zona tem um perfil de resistência a falhas diferente de uma classe que distribui dados entre zonas.

Também é preciso separar falha física de exclusão autorizada. Alta durabilidade não impede uma aplicação com permissão de excluir o objeto.

## Classes para padrões de acesso diferentes

Nas classes com IA no nome, a sigla significa *Infrequent Access*, ou acesso infrequente. A tabela resume as classes presentes nas anotações e não pretende listar todo o catálogo do serviço.

| Classe | Perfil de uso | Acesso |
| --- | --- | --- |
| S3 Standard | Acesso frequente | Baixa latência |
| S3 Intelligent-Tiering | Frequência variável ou desconhecida | Depende da camada usada |
| S3 Standard-IA | Pouco acesso, mas leitura rápida necessária | Baixa latência, com cobrança de recuperação |
| S3 One Zone-IA | Pouco acesso a dados recriáveis | Baixa latência, em uma zona |
| S3 Glacier Instant Retrieval | Arquivo raramente consultado, com leitura imediata | Milissegundos |
| S3 Glacier Flexible Retrieval | Arquivo que aceita espera | Restauração em minutos ou horas, conforme modalidade |
| S3 Glacier Deep Archive | Arquivamento prolongado que aceita espera maior | Restauração em horas, conforme modalidade |

Consulte também duração mínima, tamanho mínimo faturável e custos de recuperação e transição. O preço por capacidade armazenada não representa sozinho o custo total. [Classes de armazenamento do S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html).

## Intelligent-Tiering não significa sempre acesso imediato

O Intelligent-Tiering acompanha padrões de acesso e move objetos entre camadas. Suas camadas de acesso imediato atendem a leituras de baixa latência, mas existem camadas opcionais de arquivo que exigem restauração.

Portanto, habilitar arquivamento opcional muda o compromisso de recuperação. É uma boa opção a avaliar para frequência incerta, desde que os recursos habilitados sejam compatíveis com a espera aceitável. [Funcionamento do Intelligent-Tiering](https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering-overview.html).

## Ciclo de vida acompanha a idade do dado

Regras de ciclo de vida podem mover objetos entre classes ou expirá-los. Elas são úteis quando o padrão é conhecido: por exemplo, documentos consultados com frequência no início e raramente depois.

O desenho precisa considerar as restrições de transição e retenção. Mover um objeto por pouco tempo para uma classe com duração mínima pode não gerar a economia esperada.

Uma política também pode excluir dados. Antes de aplicá-la, defina quais objetos e versões ela alcança. Um filtro errado pode afetar muito mais conteúdo do que o planejado.

## Versionamento, acesso e criptografia

O versionamento mantém versões de objetos e ajuda a recuperar sobrescritas e exclusões acidentais. Em um bucket versionado, uma exclusão simples normalmente cria um marcador de exclusão; ela não equivale a remover permanentemente todas as versões. Versões também consomem armazenamento e podem ser excluídas por quem tem permissão. [Versionamento do S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html).

O AWS Identity and Access Management (IAM), serviço de gerenciamento de identidades e acessos, e as políticas de bucket ajudam a definir quem pode executar operações. S3 Block Public Access ajuda a impedir exposição pública indevida.

Criptografia protege dados, mas não substitui autorização. Se uma identidade possui acesso legítimo ao objeto e às chaves necessárias, o objeto cifrado ainda pode ser lido por ela. O cliente precisa configurar permissões e proteção compatíveis com o uso. [Práticas de segurança do S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html).

## Cenário: documentos e imagens de um portal

Um portal hipotético mantém imagens públicas e documentos internos. A equipe separa permissões para não expor documentos apenas porque as imagens precisam ser entregues aos visitantes.

Os documentos recentes têm leitura rápida. Os antigos podem passar para uma classe de arquivo se a recuperação puder esperar. Já uma imagem que precisa aparecer imediatamente na página não deve depender de uma restauração demorada.

Para distribuir conteúdo público, é possível usar Amazon CloudFront com origem S3 privada e controle de acesso à origem. Um bucket privado não impede esse desenho; a autorização deve permitir o acesso do serviço de distribuição. [Buckets e acesso público](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html).

## Erros comuns e foco na CLF-C02

Não trate todas as classes Glacier como igualmente lentas. Não suponha que todas as classes usam várias zonas. Evite associar o menor preço de armazenamento ao menor custo total e não use versionamento como substituto de controle de acesso.

Na certificação, os sinais mais úteis são frequência de acesso, tempo de recuperação, possibilidade de recriar dados e necessidade de proteção.

## Questão autoral

Uma empresa arquiva documentos raramente acessados, mas exige que a leitura ocorra em milissegundos, sem uma etapa prévia de restauração. Qual classe corresponde a esse perfil?

- **A.** S3 Glacier Deep Archive.
- **B.** S3 Glacier Flexible Retrieval.
- **C.** Uma camada opcional de arquivo assíncrono do Intelligent-Tiering.
- **D.** S3 Glacier Instant Retrieval.

**Resposta: D.** Essa classe combina arquivamento com acesso em milissegundos.

A e B exigem restauração antes da leitura. C também representa acesso assíncrono, incompatível com a exigência. A escolha final de custo ainda depende de volume e frequência de recuperação.

## Resumo

Escolha a classe pela frequência e pela espera aceitável. Use ciclo de vida para padrões conhecidos e confira as camadas habilitadas no Intelligent-Tiering. Combine versionamento com permissões adequadas: preservar dados, disponibilizá-los e controlar acesso são problemas distintos.

## Documentação oficial

- [Classes de armazenamento](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)
- [Intelligent-Tiering](https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering-overview.html)
- [Versionamento](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html)
- [Práticas de segurança](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [Buckets e configurações](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html)
