# Divulgação da série AWS para a Cloud Practitioner

Textos sugeridos para uso após a publicação de cada artigo. Nenhuma mensagem foi enviada ao LinkedIn. Os links abaixo são os endereços planejados; a criação local não confirma que estejam publicados. A meta description corresponde ao campo `description`, e as cinco palavras-chave correspondem a `tags`.

## 1. Regiões, zonas e responsabilidade compartilhada na AWS

- Arquivo: [aws-regioes-zonas-responsabilidade-compartilhada.md](../../src/content/posts/aws-regioes-zonas-responsabilidade-compartilhada.md)
- Slug: `aws-regioes-zonas-responsabilidade-compartilhada`
- Meta description: Entenda regiões, zonas de disponibilidade e locais de borda da AWS, e saiba quais responsabilidades continuam com você na nuvem.
- Cinco palavras-chave: aws, cloud-practitioner, regioes, disponibilidade, responsabilidade-compartilhada.

### Sugestão para o LinkedIn

Região, zona de disponibilidade e local de borda resolvem problemas diferentes. Organizei minhas anotações de AWS em uma explicação sobre localização, disponibilidade e responsabilidade compartilhada.

É parte da série do CommandLinux baseada nas minhas anotações de preparação para a AWS Cloud Practitioner. Incluí um cenário hipotético, referências oficiais e uma questão autoral comentada.

Leia: https://www.commandlinux.dev/posts/aws-regioes-zonas-responsabilidade-compartilhada/

#AWS #CloudPractitioner #CommandLinux

### Três ideias para continuar a leitura

- Amazon EC2: instâncias, tipos e ciclo de vida
- Custos do EC2: On-Demand, Spot e compromissos de uso
- EC2 Auto Scaling e load balancer: quem faz o quê?

## 2. Amazon EC2: instâncias, tipos e ciclo de vida

- Arquivo: [amazon-ec2-instancias-tipos-ciclo-de-vida.md](../../src/content/posts/amazon-ec2-instancias-tipos-ciclo-de-vida.md)
- Slug: `amazon-ec2-instancias-tipos-ciclo-de-vida`
- Meta description: Aprenda o que é uma instância EC2, como escolher seu perfil e o que acontece com os dados ao reiniciar, parar ou encerrar um servidor.
- Cinco palavras-chave: aws, ec2, cloud-practitioner, computacao, instancias.

### Sugestão para o LinkedIn

O que muda quando você reinicia, para ou encerra uma instância? Preparei um artigo sobre EC2 que liga tipos de máquina, controle do sistema e persistência dos dados.

É parte da série do CommandLinux baseada nas minhas anotações de preparação para a AWS Cloud Practitioner. Incluí um cenário hipotético, referências oficiais e uma questão autoral comentada.

Leia: https://www.commandlinux.dev/posts/amazon-ec2-instancias-tipos-ciclo-de-vida/

#AWS #CloudPractitioner #CommandLinux

### Três ideias para continuar a leitura

- Custos do EC2: On-Demand, Spot e compromissos de uso
- EC2 Auto Scaling e load balancer: quem faz o quê?
- SQS, SNS e Lambda: filas, notificações e processamento

## 3. Custos do EC2: On-Demand, Spot e compromissos de uso

- Arquivo: [aws-ec2-custos-on-demand-spot-savings-plans.md](../../src/content/posts/aws-ec2-custos-on-demand-spot-savings-plans.md)
- Slug: `aws-ec2-custos-on-demand-spot-savings-plans`
- Meta description: Compare On-Demand, Spot, Savings Plans e Reserved Instances, e entenda a diferença entre desconto, reserva de capacidade e controle de custos.
- Cinco palavras-chave: aws, ec2, custos, savings-plans, cloud-practitioner.

### Sugestão para o LinkedIn

Desconto e reserva de capacidade não são a mesma coisa. Neste post, comparo On-Demand, Spot, Savings Plans e Reserved Instances a partir da previsibilidade do uso e da tolerância a interrupções.

É parte da série do CommandLinux baseada nas minhas anotações de preparação para a AWS Cloud Practitioner. Incluí um cenário hipotético, referências oficiais e uma questão autoral comentada.

Leia: https://www.commandlinux.dev/posts/aws-ec2-custos-on-demand-spot-savings-plans/

#AWS #CloudPractitioner #CommandLinux

### Três ideias para continuar a leitura

- EC2 Auto Scaling e load balancer: quem faz o quê?
- SQS, SNS e Lambda: filas, notificações e processamento
- ECR, ECS, EKS e Fargate: contêineres na AWS sem confusão

## 4. EC2 Auto Scaling e load balancer: quem faz o quê?

- Arquivo: [aws-ec2-auto-scaling-load-balancer.md](../../src/content/posts/aws-ec2-auto-scaling-load-balancer.md)
- Slug: `aws-ec2-auto-scaling-load-balancer`
- Meta description: Entenda escala vertical e horizontal, a função do Auto Scaling e como um load balancer distribui tráfego entre instâncias da AWS.
- Cinco palavras-chave: aws, auto-scaling, load-balancer, disponibilidade, cloud-practitioner.

### Sugestão para o LinkedIn

Quem adiciona instâncias e quem distribui as requisições? Expliquei como EC2 Auto Scaling e load balancer trabalham juntos, com um diagrama e os cuidados com verificações de saúde.

É parte da série do CommandLinux baseada nas minhas anotações de preparação para a AWS Cloud Practitioner. Incluí um cenário hipotético, referências oficiais e uma questão autoral comentada.

Leia: https://www.commandlinux.dev/posts/aws-ec2-auto-scaling-load-balancer/

#AWS #CloudPractitioner #CommandLinux

### Três ideias para continuar a leitura

- SQS, SNS e Lambda: filas, notificações e processamento
- ECR, ECS, EKS e Fargate: contêineres na AWS sem confusão
- Provisionar na AWS: console, CLI, CloudFormation e serviços gerenciados

## 5. SQS, SNS e Lambda: filas, notificações e processamento

- Arquivo: [aws-sqs-sns-lambda-mensageria.md](../../src/content/posts/aws-sqs-sns-lambda-mensageria.md)
- Slug: `aws-sqs-sns-lambda-mensageria`
- Meta description: Aprenda a diferença entre SQS, SNS e Lambda e veja como combinar filas, publicação de eventos e execução de código na AWS.
- Cinco palavras-chave: aws, sqs, sns, lambda, cloud-practitioner.

### Sugestão para o LinkedIn

Uma fila guarda trabalho, um tópico distribui notificações e uma função executa código. O artigo mostra como SQS, SNS e Lambda se combinam e por que novas tentativas exigem cuidado com duplicidade.

É parte da série do CommandLinux baseada nas minhas anotações de preparação para a AWS Cloud Practitioner. Incluí um cenário hipotético, referências oficiais e uma questão autoral comentada.

Leia: https://www.commandlinux.dev/posts/aws-sqs-sns-lambda-mensageria/

#AWS #CloudPractitioner #CommandLinux

### Três ideias para continuar a leitura

- ECR, ECS, EKS e Fargate: contêineres na AWS sem confusão
- Provisionar na AWS: console, CLI, CloudFormation e serviços gerenciados
- VPC, sub-redes e regras de tráfego na AWS

## 6. ECR, ECS, EKS e Fargate: contêineres na AWS sem confusão

- Arquivo: [aws-ecr-ecs-eks-fargate-containers.md](../../src/content/posts/aws-ecr-ecs-eks-fargate-containers.md)
- Slug: `aws-ecr-ecs-eks-fargate-containers`
- Meta description: Separe registro de imagens, orquestração e computação para entender quando usar ECR, ECS, EKS e Fargate na AWS.
- Cinco palavras-chave: aws, containers, ecs, eks, fargate.

### Sugestão para o LinkedIn

ECR, ECS, EKS e Fargate aparecem juntos, mas não fazem a mesma coisa. Separei registro de imagens, orquestração e capacidade computacional para facilitar a escolha.

É parte da série do CommandLinux baseada nas minhas anotações de preparação para a AWS Cloud Practitioner. Incluí um cenário hipotético, referências oficiais e uma questão autoral comentada.

Leia: https://www.commandlinux.dev/posts/aws-ecr-ecs-eks-fargate-containers/

#AWS #CloudPractitioner #CommandLinux

### Três ideias para continuar a leitura

- Provisionar na AWS: console, CLI, CloudFormation e serviços gerenciados
- VPC, sub-redes e regras de tráfego na AWS
- Conectividade AWS: VPN, Direct Connect, Route 53 e CloudFront

## 7. Provisionar na AWS: console, CLI, CloudFormation e serviços gerenciados

- Arquivo: [aws-provisionamento-console-cli-cloudformation.md](../../src/content/posts/aws-provisionamento-console-cli-cloudformation.md)
- Slug: `aws-provisionamento-console-cli-cloudformation`
- Meta description: Entenda as formas de criar recursos na AWS e diferencie CloudFormation, Elastic Beanstalk, Batch, Lightsail e Outposts.
- Cinco palavras-chave: aws, cloudformation, automacao, infraestrutura-como-codigo, cloud-practitioner.

### Sugestão para o LinkedIn

Criar infraestrutura e implantar uma aplicação são tarefas relacionadas. Organizei console, CLI, SDK e CloudFormation, e mostrei onde entram Beanstalk, Batch, Lightsail e Outposts.

É parte da série do CommandLinux baseada nas minhas anotações de preparação para a AWS Cloud Practitioner. Incluí um cenário hipotético, referências oficiais e uma questão autoral comentada.

Leia: https://www.commandlinux.dev/posts/aws-provisionamento-console-cli-cloudformation/

#AWS #CloudPractitioner #CommandLinux

### Três ideias para continuar a leitura

- VPC, sub-redes e regras de tráfego na AWS
- Conectividade AWS: VPN, Direct Connect, Route 53 e CloudFront
- EBS, S3, EFS e FSx: escolhendo o armazenamento na AWS

## 8. VPC, sub-redes e regras de tráfego na AWS

- Arquivo: [aws-vpc-sub-redes-security-groups-nacl.md](../../src/content/posts/aws-vpc-sub-redes-security-groups-nacl.md)
- Slug: `aws-vpc-sub-redes-security-groups-nacl`
- Meta description: Aprenda como VPC, rotas, internet gateway, NAT gateway, security groups e listas de rede controlam a comunicação na AWS.
- Cinco palavras-chave: aws, vpc, redes, security-groups, cloud-practitioner.

### Sugestão para o LinkedIn

Uma porta liberada não cria uma rota. Neste artigo, organizei o caminho entre instância e internet e comparei security groups com listas de controle de acesso da sub-rede.

É parte da série do CommandLinux baseada nas minhas anotações de preparação para a AWS Cloud Practitioner. Incluí um cenário hipotético, referências oficiais e uma questão autoral comentada.

Leia: https://www.commandlinux.dev/posts/aws-vpc-sub-redes-security-groups-nacl/

#AWS #CloudPractitioner #CommandLinux

### Três ideias para continuar a leitura

- Conectividade AWS: VPN, Direct Connect, Route 53 e CloudFront
- EBS, S3, EFS e FSx: escolhendo o armazenamento na AWS
- Amazon S3: classes de armazenamento, proteção e ciclo de vida

## 9. Conectividade AWS: VPN, Direct Connect, Route 53 e CloudFront

- Arquivo: [aws-conectividade-vpn-direct-connect-route53-cloudfront.md](../../src/content/posts/aws-conectividade-vpn-direct-connect-route53-cloudfront.md)
- Slug: `aws-conectividade-vpn-direct-connect-route53-cloudfront`
- Meta description: Diferencie conexão privada, resolução de nomes e entrega global com VPN, Direct Connect, PrivateLink, Route 53, CloudFront e Global Accelerator.
- Cinco palavras-chave: aws, conectividade, direct-connect, cloudfront, cloud-practitioner.

### Sugestão para o LinkedIn

Conectar o escritório à nuvem não é o mesmo problema que entregar imagens de um site. Comparei VPN, Direct Connect e PrivateLink, além dos papéis de Route 53, CloudFront e Global Accelerator.

É parte da série do CommandLinux baseada nas minhas anotações de preparação para a AWS Cloud Practitioner. Incluí um cenário hipotético, referências oficiais e uma questão autoral comentada.

Leia: https://www.commandlinux.dev/posts/aws-conectividade-vpn-direct-connect-route53-cloudfront/

#AWS #CloudPractitioner #CommandLinux

### Três ideias para continuar a leitura

- EBS, S3, EFS e FSx: escolhendo o armazenamento na AWS
- Amazon S3: classes de armazenamento, proteção e ciclo de vida
- Backups e recuperação na AWS: snapshots, Backup e Storage Gateway

## 10. EBS, S3, EFS e FSx: escolhendo o armazenamento na AWS

- Arquivo: [aws-armazenamento-ebs-s3-efs-fsx.md](../../src/content/posts/aws-armazenamento-ebs-s3-efs-fsx.md)
- Slug: `aws-armazenamento-ebs-s3-efs-fsx`
- Meta description: Compare armazenamento em blocos, objetos e arquivos e entenda a diferença entre EBS, instance store, S3, EFS e FSx.
- Cinco palavras-chave: aws, armazenamento, ebs, efs, cloud-practitioner.

### Sugestão para o LinkedIn

Antes de escolher armazenamento, vale entender como a aplicação acessa o dado. Comparei blocos, objetos e arquivos usando EBS, instance store, S3, EFS e FSx.

É parte da série do CommandLinux baseada nas minhas anotações de preparação para a AWS Cloud Practitioner. Incluí um cenário hipotético, referências oficiais e uma questão autoral comentada.

Leia: https://www.commandlinux.dev/posts/aws-armazenamento-ebs-s3-efs-fsx/

#AWS #CloudPractitioner #CommandLinux

### Três ideias para continuar a leitura

- Amazon S3: classes de armazenamento, proteção e ciclo de vida
- Backups e recuperação na AWS: snapshots, Backup e Storage Gateway
- Bancos de dados na AWS: quando comparar RDS e DynamoDB

## 11. Amazon S3: classes de armazenamento, proteção e ciclo de vida

- Arquivo: [amazon-s3-classes-seguranca-ciclo-de-vida.md](../../src/content/posts/amazon-s3-classes-seguranca-ciclo-de-vida.md)
- Slug: `amazon-s3-classes-seguranca-ciclo-de-vida`
- Meta description: Entenda como escolher classes do S3 e combinar versionamento, permissões e ciclo de vida sem confundir durabilidade com disponibilidade.
- Cinco palavras-chave: aws, s3, armazenamento, seguranca, cloud-practitioner.

### Sugestão para o LinkedIn

A classe mais barata para guardar um objeto pode não ser a melhor para recuperá-lo. O post explica classes do S3, tempo de acesso, versionamento e ciclo de vida.

É parte da série do CommandLinux baseada nas minhas anotações de preparação para a AWS Cloud Practitioner. Incluí um cenário hipotético, referências oficiais e uma questão autoral comentada.

Leia: https://www.commandlinux.dev/posts/amazon-s3-classes-seguranca-ciclo-de-vida/

#AWS #CloudPractitioner #CommandLinux

### Três ideias para continuar a leitura

- Backups e recuperação na AWS: snapshots, Backup e Storage Gateway
- CloudWatch e CloudTrail: monitoramento e auditoria sem confusão
- Bancos de dados na AWS: quando comparar RDS e DynamoDB

## 12. Backups e recuperação na AWS: snapshots, Backup e Storage Gateway

- Arquivo: [aws-backup-snapshots-storage-gateway-recuperacao.md](../../src/content/posts/aws-backup-snapshots-storage-gateway-recuperacao.md)
- Slug: `aws-backup-snapshots-storage-gateway-recuperacao`
- Meta description: Diferencie snapshots, AWS Backup, Storage Gateway e Elastic Disaster Recovery para planejar cópias, integração híbrida e recuperação.
- Cinco palavras-chave: aws, backup, snapshots, storage-gateway, recuperacao.

### Sugestão para o LinkedIn

Ter uma cópia não comprova que uma aplicação consegue voltar no tempo necessário. Expliquei snapshots, AWS Backup, Storage Gateway e Elastic Disaster Recovery, com objetivos de recuperação.

É parte da série do CommandLinux baseada nas minhas anotações de preparação para a AWS Cloud Practitioner. Incluí um cenário hipotético, referências oficiais e uma questão autoral comentada.

Leia: https://www.commandlinux.dev/posts/aws-backup-snapshots-storage-gateway-recuperacao/

#AWS #CloudPractitioner #CommandLinux

### Três ideias para continuar a leitura

- IAM: usuários, funções e permissões mínimas na AWS
- CloudWatch e CloudTrail: monitoramento e auditoria sem confusão
- Bancos de dados na AWS: quando comparar RDS e DynamoDB

