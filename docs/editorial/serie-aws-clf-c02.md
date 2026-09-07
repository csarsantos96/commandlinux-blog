# Série AWS para a Cloud Practitioner: análise editorial

## Fonte e recorte

Fonte principal: 24 páginas de `Aws part 1 .pdf` e 19 páginas de `Aws part 2.pdf`, lidas visualmente. São fotografias de anotações manuscritas; rasuras e trechos ilegíveis não foram usados como afirmações. As instruções da tarefa vêm da conversa, não dos documentos.

O tema central é a escolha de serviços da Amazon Web Services (AWS) para computação, redes e armazenamento. O foco adotado é a AWS Certified Cloud Practitioner, exame CLF-C02. O material também prepara conceitos para estudos posteriores de arquitetura, mas não constitui uma cobertura completa de nenhuma certificação.

A parte 1 concentra computação, preços, elasticidade, mensageria, contêineres, infraestrutura global e provisionamento. A parte 2 aprofunda redes, armazenamento, classes de objetos e recuperação. Bancos de dados aparecem principalmente como lembretes e um título ainda sem desenvolvimento; não há base suficiente para um artigo próprio sobre o assunto.

## Correções e complementos identificados antes da redação

| Local nas anotações | Ajuste editorial | Confirmação oficial |
| --- | --- | --- |
| Parte 1, p. 6: tabela de interrupções | “Não” deve significar ausência da retomada específica de capacidade Spot, não ausência de falhas ou manutenção. On-Demand é a referência de preço, não uma modalidade de “desconto baixo”. | [Eventos programados do EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/monitoring-instances-status-check_sched.html) |
| Parte 1, pp. 5–6: descontos | Savings Plans envolvem compromisso de gasto por hora durante um ou três anos. Reserved Instances são um benefício de cobrança; somente determinadas reservas também oferecem reserva de capacidade. | [Savings Plans](https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html), [Reserved Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-reserved-instances.html) |
| Parte 1, pp. 6–9: escala e balanceamento | Mudar o tipo de uma instância existente normalmente exige parada. O balanceador distribui tráfego; quem ajusta a quantidade de instâncias é o Auto Scaling. | [Alteração de tipo](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-resize.html), [Auto Scaling](https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html) |
| Parte 1, pp. 8–9: verificações de saúde | “Envia apenas para recursos saudáveis” tem exceção: se todos os destinos de um grupo estiverem não saudáveis, o Application Load Balancer pode encaminhar para todos, comportamento chamado fail-open. | [Verificações de saúde](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html) |
| Parte 1, pp. 12–13: Lambda | Sem administrar servidores não significa sem responsabilidade, sem limites ou sem custos adicionais. Na integração com filas, o Lambda consulta a fila por um mapeamento de origem de eventos. | [Lambda com filas](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html), [Limites](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) |
| Parte 1, p. 20: escolha de região | Requisitos de residência de dados são restrições do projeto, não um fator que se descarta por conveniência de preço. Não se presume obrigação legal específica. | [Regiões](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html) |
| Parte 2, p. 3: grupo de segurança padrão | O grupo padrão permite entrada de recursos associados ao próprio grupo. Um grupo novo, criado pelo usuário, começa sem regras de entrada. | [Grupo padrão](https://docs.aws.amazon.com/vpc/latest/userguide/default-security-group.html) |
| Parte 2, p. 3: portas de retorno | A faixa de portas efêmeras depende do cliente e do sistema operacional; não é sempre uma faixa universal. | [Listas de controle de acesso de rede](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) |
| Parte 1, pp. 23–24; parte 2, p. 1: saída para internet | O exemplo com tradução de endereços descreve saída IPv4 por gateway público. Há outras opções para IPv6 e acesso privado a serviços. Sub-rede pública não torna automaticamente toda instância acessível. | [Internet gateway](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html), [NAT gateways](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html) |
| Parte 2, pp. 1 e 5: conexão dedicada | AWS Direct Connect não cifra o tráfego por padrão. Previsibilidade e dedicação não equivalem a criptografia. | [Criptografia no Direct Connect](https://docs.aws.amazon.com/directconnect/latest/UserGuide/encryption-in-transit.html) |
| Parte 2, p. 8: armazenamento persistente | Reiniciar, parar e encerrar são operações diferentes. Volumes persistentes podem ser excluídos ao encerrar uma instância, conforme sua configuração. | [Ciclo de vida de instâncias](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html) |
| Parte 2, pp. 10–13: armazenamento de objetos | A distribuição entre zonas depende da classe; One Zone é uma exceção. Durabilidade não é disponibilidade. As camadas opcionais de arquivo do Intelligent-Tiering exigem restauração. | [Classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html), [Intelligent-Tiering](https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering-overview.html) |
| Parte 2, pp. 17–19: backup e recuperação | Replicação não impede que erros e corrupção sejam replicados. Recuperação exige pontos adequados, configuração e testes; não é uma garantia automática contra qualquer desastre. | [Elastic Disaster Recovery](https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html), [AWS Backup](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html) |

## Conceitos que faltavam ou precisavam de desenvolvimento

Imagem de máquina versus instância; persistência e encerramento; compromisso financeiro versus capacidade reservada; estado de sessão na escala horizontal; processamento idempotente; retenção e nova entrega de mensagens; responsabilidade sobre permissões mesmo em serviços gerenciados; diferença entre resolução de nomes e caminho do tráfego; durabilidade versus disponibilidade; objetivos de recuperação e testes de restauração.

Para completar a preparação da certificação em outros materiais, ainda será necessário aprofundar identidade, suporte, governança, bancos de dados, observabilidade e economia de nuvem. Os lembretes da primeira página não foram transformados artificialmente em artigos completos.

## Ordem de publicação e estrutura proposta

Cada post apresenta um problema, ensina o funcionamento, compara escolhas, traz um cenário hipotético e termina com erros comuns, revisão para a certificação, questão autoral comentada, resumo e fontes. Os títulos abaixo são os títulos sugeridos e implementados.

| Parte | Título | Estrutura específica | Base principal |
| --- | --- | --- | --- |
| 1 | [Regiões, zonas e responsabilidade compartilhada na AWS](../../src/content/posts/aws-regioes-zonas-responsabilidade-compartilhada.md) | Localização, falhas, escolha de região e responsabilidades | Parte 1, pp. 19–22; parte 2, p. 4 |
| 2 | [Amazon EC2: instâncias, tipos e ciclo de vida](../../src/content/posts/amazon-ec2-instancias-tipos-ciclo-de-vida.md) | Máquina virtual, imagem, dimensionamento e persistência | Parte 1, pp. 2–3; parte 2, pp. 7–8 |
| 3 | [Custos do EC2: On-Demand, Spot e compromissos de uso](../../src/content/posts/aws-ec2-custos-on-demand-spot-savings-plans.md) | Modelos de compra, capacidade e ferramentas de custo | Parte 1, pp. 1 e 5–6 |
| 4 | [EC2 Auto Scaling e load balancer: quem faz o quê?](../../src/content/posts/aws-ec2-auto-scaling-load-balancer.md) | Escala vertical e horizontal, distribuição e saúde | Parte 1, pp. 6–9 |
| 5 | [SQS, SNS e Lambda: filas, notificações e processamento](../../src/content/posts/aws-sqs-sns-lambda-mensageria.md) | Desacoplamento, publicação, execução e falhas | Parte 1, pp. 10–13 |
| 6 | [ECR, ECS, EKS e Fargate: contêineres na AWS sem confusão](../../src/content/posts/aws-ecr-ecs-eks-fargate-containers.md) | Registro, orquestração e capacidade computacional | Parte 1, pp. 13–15 |
| 7 | [Provisionar na AWS: console, CLI, CloudFormation e serviços gerenciados](../../src/content/posts/aws-provisionamento-console-cli-cloudformation.md) | Interfaces, infraestrutura como código e implantação | Parte 1, pp. 4, 15–18 e 22–23 |
| 8 | [VPC, sub-redes e regras de tráfego na AWS](../../src/content/posts/aws-vpc-sub-redes-security-groups-nacl.md) | Rotas, internet, grupos de segurança e listas de rede | Parte 1, pp. 23–24; parte 2, pp. 1–4 |
| 9 | [Conectividade AWS: VPN, Direct Connect, Route 53 e CloudFront](../../src/content/posts/aws-conectividade-vpn-direct-connect-route53-cloudfront.md) | Conexão privada, resolução de nomes e entrega global | Parte 2, pp. 1 e 4–6 |
| 10 | [EBS, S3, EFS e FSx: escolhendo o armazenamento na AWS](../../src/content/posts/aws-armazenamento-ebs-s3-efs-fsx.md) | Blocos, objetos, arquivos e persistência | Parte 2, pp. 6–10 e 13–15 |
| 11 | [Amazon S3: classes de armazenamento, proteção e ciclo de vida](../../src/content/posts/amazon-s3-classes-seguranca-ciclo-de-vida.md) | Frequência de acesso, restauração, versionamento e permissões | Parte 2, pp. 10–13 |
| 12 | [Backups e recuperação na AWS: snapshots, Backup e Storage Gateway](../../src/content/posts/aws-backup-snapshots-storage-gateway-recuperacao.md) | Cópias, replicação, integração híbrida e recuperação | Parte 2, pp. 8–9 e 16–19 |

## Entrega

Os artigos estão em `src/content/posts/`, categoria `CLOUD`, série `AWS para a Cloud Practitioner`, com `part` e `totalParts` para a navegação existente. O título é renderizado pelo layout a partir do frontmatter; por isso o corpo começa com o separador solicitado e usa subtítulos de nível dois, evitando dois títulos principais.

Datas representam a criação dos textos, não laboratórios ou aprovação. Os cenários são hipotéticos. Os arquivos estão habilitados para exibição no próximo build; criar os arquivos não publica o site por si só.

Slug, meta description, cinco palavras-chave, sugestões para o LinkedIn e três continuações por post estão em `divulgacao-serie-aws-clf-c02.md`. Esse material é separado dos artigos públicos.
