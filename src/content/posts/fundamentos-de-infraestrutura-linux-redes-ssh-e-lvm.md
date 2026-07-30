---
title: "Fundamentos de infraestrutura Linux: redes, SSH, SCP e LVM"
description: Uma jornada prática pelos fundamentos de rede, acesso remoto com SSH, transferência de arquivos com SCP e gerenciamento de discos com LVM.
date: 2026-05-25
category: Linux
tags: [linux, redes, ssh, scp, lvm, aws, ec2, infraestrutura]
---

# Fundamentos de infraestrutura Linux: redes, SSH, SCP e LVM

> Antes de automatizar servidores, criar pipelines ou administrar clusters, precisamos entender as peças básicas que sustentam a infraestrutura.

Este artigo nasceu de anotações feitas durante meus estudos de Linux e Cloud Native. O objetivo era conectar assuntos que muitas vezes são aprendidos separadamente: redes, acesso remoto, transferência de arquivos, comandos de diagnóstico e gerenciamento de armazenamento.

Quando essas peças se encontram, fica mais fácil entender o que realmente acontece ao acessar uma instância na nuvem, copiar arquivos para um servidor ou aumentar o espaço disponível em um filesystem.


# Começando pela rede

Uma rede é formada por dois ou mais dispositivos conectados e capazes de trocar informações. Para que essa comunicação funcione, alguns conceitos aparecem o tempo todo.

## Endereço IP

O endereço IP identifica um dispositivo dentro de uma rede. Para os exemplos, utilizaremos um endereço reservado exclusivamente para documentação:

```text
198.51.100.10
```

Em uma máquina Linux, podemos consultar os endereços configurados com:

```bash
ip address
```

Também é comum utilizar a forma abreviada:

```bash
ip a
```

No Windows, o comando equivalente mais conhecido é:

```powershell
ipconfig
```

## Portas

O IP identifica a máquina; a porta ajuda a identificar o serviço que está atendendo nela. Alguns exemplos conhecidos são:

| Serviço | Porta padrão |
|---------|--------------|
| SSH | 22 |
| HTTP | 80 |
| HTTPS | 443 |

Uma mesma máquina pode executar vários serviços, cada um escutando em uma porta diferente.

## DNS

O DNS traduz nomes fáceis de lembrar, como `example.com`, para endereços IP. Sem ele, precisaríamos memorizar o endereço numérico de cada serviço acessado.

Para testar se uma máquina consegue alcançar outro endereço, podemos usar:

```bash
ping 198.51.100.10
```

O `ping` não valida todos os serviços da máquina, mas ajuda a verificar conectividade básica quando o protocolo ICMP está permitido.


# Acesso remoto com SSH

O **SSH (Secure Shell)** é um protocolo para comunicação remota segura. Ele segue o modelo cliente-servidor:

- o servidor executa o serviço `sshd` e normalmente escuta na porta 22;
- o cliente utiliza o comando `ssh` para iniciar a conexão;
- o tráfego entre as duas pontas é criptografado.

Uma conexão básica tem este formato:

```bash
ssh usuario@198.51.100.10
```

Em ambientes de nuvem, como uma instância EC2, é comum autenticar com um par de chaves:

```bash
ssh -i chave.pem ubuntu@198.51.100.10
```

O usuário depende da imagem utilizada. Em uma AMI Ubuntu, por exemplo, ele costuma ser `ubuntu`.

## Organizando conexões no arquivo SSH config

Quando administramos várias máquinas, repetir usuário, endereço e caminho da chave se torna cansativo. O arquivo `~/.ssh/config` permite criar aliases:

```text
Host laboratorio
  HostName 198.51.100.10
  User ubuntu
  IdentityFile ~/.ssh/chave.pem
```

Depois, a conexão fica mais simples:

```bash
ssh laboratorio
```

O mesmo arquivo pode conter vários blocos `Host`, um para cada servidor.


# Copiando arquivos com SCP

O `scp` utiliza o SSH para transferir arquivos de forma segura entre máquinas.

Para enviar um arquivo local ao servidor:

```bash
scp arquivo.txt usuario@servidor:/tmp/
```

Para trazer um arquivo remoto para o diretório atual:

```bash
scp usuario@servidor:/tmp/arquivo.txt .
```

Algumas opções úteis são:

| Opção | Função |
|-------|--------|
| `-r` | Copia diretórios recursivamente |
| `-p` | Preserva horários e permissões |
| `-v` | Exibe detalhes da operação |
| `-C` | Habilita compressão durante a transferência |
| `-q` | Reduz as mensagens exibidas |

Por exemplo, para enviar um diretório inteiro:

```bash
scp -r projeto/ usuario@servidor:/opt/
```

É importante observar a ordem dos argumentos: primeiro vem a origem e depois o destino.


# Comandos para conhecer a máquina

Antes de modificar um servidor, precisamos entender onde estamos e quais recursos ele possui.

## Diretórios e arquivos

O comando `ls` lista arquivos. Duas referências importantes aparecem com frequência:

```text
.   diretório atual
..  diretório anterior
```

Para incluir arquivos ocultos e detalhes:

```bash
ls -lha
```

## Memória

Para visualizar o consumo de memória RAM e swap:

```bash
free -h
```

## Processador

O `lscpu` mostra informações como arquitetura, quantidade de CPUs, núcleos, threads e recursos de virtualização:

```bash
lscpu
```

## Identidade e sistema

Outros comandos úteis são:

```bash
whoami
hostname
uname -a
```

Eles mostram, respectivamente, o usuário atual, o nome configurado na máquina e informações do kernel e do sistema.


# Entendendo o LVM

O **LVM (Logical Volume Manager)** adiciona uma camada de abstração entre discos físicos e filesystems. Em vez de tratar cada partição como uma estrutura rígida, podemos reunir armazenamento em grupos e criar volumes lógicos mais flexíveis.

O LVM trabalha com três camadas principais:

```text
Disco ou partição
        │
        ▼
PV — Physical Volume
        │
        ▼
VG — Volume Group
        │
        ▼
LV — Logical Volume
        │
        ▼
Filesystem e ponto de montagem
```

- **PV (Physical Volume):** disco ou partição preparado para o LVM.
- **VG (Volume Group):** conjunto de um ou mais PVs, funcionando como um pool de armazenamento.
- **LV (Logical Volume):** volume criado a partir do espaço disponível no VG.

Um Volume Group pode ser dividido em vários Logical Volumes, por exemplo:

```text
ubuntu-vg
├── lv-root
└── lv-home
```

## Consultando a estrutura

Alguns comandos ajudam a visualizar cada camada:

```bash
sudo pvs
sudo vgs
sudo lvs
```

Para enxergar discos, partições, volumes e pontos de montagem em conjunto:

```bash
lsblk
```

E para verificar o espaço utilizado pelos filesystems montados:

```bash
df -h
```


# Expandindo um volume lógico

Uma das grandes vantagens do LVM é poder aumentar volumes existentes. O processo, porém, possui duas etapas distintas:

1. aumentar o Logical Volume;
2. expandir o filesystem para utilizar o novo espaço.

Para consumir todo o espaço livre do Volume Group:

```bash
sudo lvextend -l +100%FREE /dev/mapper/ubuntu--vg-ubuntu--lv
```

Se o filesystem for ext4, podemos redimensioná-lo com:

```bash
sudo resize2fs /dev/mapper/ubuntu--vg-ubuntu--lv
```

Em filesystems XFS, o procedimento é diferente e normalmente utiliza `xfs_growfs`. Por isso, antes de executar qualquer alteração, confirme o tipo do filesystem:

```bash
df -Th
```

Também é essencial conferir o caminho correto do volume com `lsblk` ou `lvs` e manter backup dos dados importantes.


# Como tudo se conecta na prática

Imagine que uma aplicação esteja executando em uma instância EC2 e o disco esteja ficando cheio. O fluxo de investigação pode ser:

```text
Localizar o IP da instância
        │
        ▼
Acessar com SSH
        │
        ▼
Verificar discos com lsblk e df -h
        │
        ▼
Identificar PV, VG e LV
        │
        ▼
Expandir o volume lógico
        │
        ▼
Redimensionar o filesystem
        │
        ▼
Validar novamente com df -h
```

Se for necessário enviar scripts ou arquivos de configuração, o `scp` utiliza a mesma base segura do SSH para realizar a transferência.

Esse exemplo mostra por que redes, Linux, acesso remoto e armazenamento não são assuntos isolados. No dia a dia de infraestrutura, eles aparecem juntos.


# Conclusão

Estudar fundamentos cria uma base que continua útil mesmo quando as ferramentas mudam.

Entender IP, portas e DNS ajuda a diagnosticar comunicação. Conhecer SSH e SCP permite administrar máquinas com segurança. Dominar comandos de inspeção revela o estado do sistema. E compreender PV, VG e LV torna o gerenciamento de armazenamento muito menos misterioso.

Essas anotações representam justamente essa etapa: sair de comandos isolados e começar a enxergar a infraestrutura como um conjunto de camadas conectadas.


## Referências

- [LINUXtips — Linux para Cloud Native](https://linuxtips.io/linux-para-cloud-native/)
- [AWS Documentation — Connect to your Linux instance using SSH](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connect-to-linux-instance.html)
- [AWS Documentation — Amazon EC2 key pairs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html)
- [OpenBSD Manual Pages — ssh](https://man.openbsd.org/ssh)
- [OpenBSD Manual Pages — scp](https://man.openbsd.org/scp)
- [Linux man-pages — ip-address](https://man7.org/linux/man-pages/man8/ip-address.8.html)
- [Red Hat Documentation — Configuring and managing logical volumes](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/8/html/configuring_and_managing_logical_volumes/)
