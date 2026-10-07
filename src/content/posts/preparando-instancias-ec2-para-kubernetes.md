---
title: "Preparando instâncias EC2 na AWS para um cluster Kubernetes"
description: Configure VPC, subnet, Security Group, chave SSH e Ubuntu nas instâncias EC2 que serão o control plane e os workers do seu laboratório Kubernetes.
date: 2026-10-07
category: CLOUD
tags: [kubernetes, aws, ec2, vpc, security-group, ssh, ubuntu, containerd]
---

Antes de executar `kubeadm init`, precisamos preparar as máquinas que vão formar o cluster. Elas devem conseguir se comunicar, baixar pacotes e executar os containers.

Este artigo detalha a preparação da infraestrutura para o [laboratório de Kubernetes na AWS com kubeadm](/posts/cluster-kubernetes-na-aws-com-kubeadm/), seguindo os estudos do **PICK – Programa Intensivo de Containers e Kubernetes**, da LINUXtips.

## O ambiente que vamos preparar

Usaremos três instâncias EC2 com Ubuntu: uma para o control plane e duas para os workers.

| Instância | Função futura | Configuração do laboratório |
| --- | --- | --- |
| `k8s-cp` | Control plane | 2 vCPUs, pelo menos 4 GiB de RAM e 20 GiB de disco. |
| `k8s-worker-1` | Worker | 2 vCPUs, pelo menos 4 GiB de RAM e 20 GiB de disco. |
| `k8s-worker-2` | Worker | 2 vCPUs, pelo menos 4 GiB de RAM e 20 GiB de disco. |

Escolha um tipo x86_64 com esses recursos disponível na região. O tamanho é uma referência para este laboratório; aplicações maiores exigem outro dimensionamento.

Teremos um único control plane, sem alta disponibilidade. Esta instalação é administrada por nós sobre EC2; para conhecer o cluster e concluir sua instalação, siga o artigo indicado ao final.

## 1. Escolhendo a região e a rede

No console AWS, selecione a região em que pretende trabalhar. Use a mesma região em todas as etapas.

No serviço **VPC**, confira se existe uma VPC adequada ao laboratório. Você pode usar a VPC padrão, se ela estiver disponível, ou criar uma rede dedicada.

Uma organização possível é:

```text
VPC: 172.31.0.0/16
└── Subnet pública: 172.31.10.0/24
    ├── k8s-cp
    ├── k8s-worker-1
    └── k8s-worker-2

Rede futura de Pods: 10.244.0.0/16
Rede futura de Services: 10.96.0.0/12
```

Esses endereços são exemplos. Se usar uma VPC existente, mantenha seus CIDRs reais e confira que eles não se sobrepõem às faixas de Pods, Services ou redes conectadas por VPN.

### Conferindo a subnet pública

No console VPC:

1. Abra **Subnets** e selecione a subnet escolhida.
2. Confira a VPC e a tabela de rotas associada.
3. Na tabela de rotas, verifique a rota local da VPC e uma rota `0.0.0.0/0` apontando para um Internet Gateway.
4. Em **Internet Gateways**, confira se esse gateway está anexado à VPC.

Para o acesso direto por SSH deste roteiro, cada instância também receberá um IPv4 público. A rota para o gateway, sozinha, não fornece um endereço público à máquina. [Documentação de Internet Gateways](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html).

As máquinas conversarão entre si pelos **IPs privados**. O IP público será usado para o acesso administrativo a partir do seu computador.

## 2. Criando o Security Group

No console EC2, abra **Security Groups**, escolha criar um grupo e configure:

- Nome: `k8s-lab`.
- Descrição: acesso ao laboratório Kubernetes.
- VPC: a mesma escolhida para as instâncias.

Crie o grupo e depois edite suas regras de entrada:

| Tipo | Protocolo/porta | Origem |
| --- | --- | --- |
| SSH | TCP `22` | Seu IP público com `/32`, usando a opção **My IP**. |
| Todo o tráfego | Todos | O ID do próprio grupo `k8s-lab`. |

A segunda regra permite tráfego entre as interfaces associadas a esse grupo, necessário para a comunicação dos nós e da rede de Pods. Ela não autoriza qualquer endereço da internet. Use esse grupo exclusivamente nas três instâncias do laboratório.

Mantenha a saída liberada neste exemplo para baixar pacotes e imagens. [Documentação de Security Groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html).

O acesso SSH fica restrito ao seu endereço. Não é necessário abrir a API Kubernetes ou o etcd ao público para seguir o laboratório. Se o seu IP mudar, atualize a regra de SSH.

Essa regra interna ampla simplifica o estudo. Uma implantação com regras específicas deve considerar as [portas dos componentes Kubernetes](https://kubernetes.io/docs/reference/networking/ports-and-protocols/) e do plugin de rede escolhido.

## 3. Criando a chave SSH

No console EC2, abra **Key Pairs** e crie uma chave:

| Campo | Valor do exemplo |
| --- | --- |
| Nome | `k8s-lab-key` |
| Tipo | RSA |
| Formato | `.pem`, para OpenSSH |

Guarde o arquivo baixado em uma pasta privada no seu computador. A chave privada não deve ser enviada ao repositório do blog nem copiada para os workers. [Criação de key pairs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/create-key-pairs.html).

## 4. Criando as três instâncias

No console EC2, escolha **Launch instance / Iniciar instância**. Para facilitar a identificação, crie uma máquina por vez, repetindo a configuração:

1. Em **Name and tags**, use `k8s-cp`, depois `k8s-worker-1` e `k8s-worker-2`.
2. Em **Application and OS Images**, escolha Ubuntu Server **24.04 LTS**, x86_64, de origem oficial da Canonical.
3. Selecione um tipo de instância com os recursos definidos no início do artigo.
4. Em **Key pair**, selecione `k8s-lab-key`.
5. Em **Network settings**, escolha a VPC e a subnet pública conferidas anteriormente.
6. Habilite **Auto-assign public IP** e selecione o Security Group existente `k8s-lab`.
7. Configure o volume raiz com **20 GiB**, tipo `gp3`. Para este ambiente descartável, confira a opção de excluir o volume ao encerrar a instância.
8. Revise as configurações e inicie a máquina.

Espere as instâncias ficarem em `Running` e passarem nas verificações de status. [Guia de criação de instâncias EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html).

Registre os endereços de cada nó:

| Nome | IP privado | IP público |
| --- | --- | --- |
| `k8s-cp` | Copiar do console | Copiar do console |
| `k8s-worker-1` | Copiar do console | Copiar do console |
| `k8s-worker-2` | Copiar do console | Copiar do console |

As instâncias, o armazenamento e os IPv4 públicos podem gerar cobranças. Confira os valores e os benefícios da sua conta; o laboratório não pressupõe cobertura pelo Free Tier.

## 5. Acessando por SSH

No terminal do seu computador, ajuste a permissão da chave e conecte usando o endereço real:

```bash
chmod 400 /caminho/k8s-lab-key.pem
ssh -i /caminho/k8s-lab-key.pem ubuntu@<IP-PUBLICO-DO-NO>
```

O usuário da AMI Ubuntu é `ubuntu`. Na primeira conexão, confira a identidade do host conforme as informações da instância. Repita o acesso nas três máquinas. [Pré-requisitos de conexão SSH](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connection-prereqs.html).

Todos os comandos a seguir são executados **dentro das instâncias**, via SSH.

## 6. Preparando o Ubuntu em cada nó

### Definindo nomes únicos

Execute o comando correspondente em cada máquina:

```bash
# Somente no control plane
sudo hostnamectl set-hostname k8s-cp
```

```bash
# Somente no primeiro worker
sudo hostnamectl set-hostname k8s-worker-1
```

```bash
# Somente no segundo worker
sudo hostnamectl set-hostname k8s-worker-2
```

Reconecte por SSH e confira com `hostname`. A tag `Name` do EC2 serve para identificação no console; ela não substitui a configuração do hostname do Ubuntu.

### Atualizando e desativando o swap

Nas três instâncias novas:

```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gpg
sudo swapoff -a
swapon --show
sudo nano /etc/fstab
```

Comente apenas as entradas de swap, caso existam. Isso mantém o swap desativado após reiniciar. Se `/var/run/reboot-required` existir após a atualização, reinicie a máquina e reconecte antes de continuar.

### Configurando módulos e rede do kernel

```bash
cat <<'EOF' | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

cat <<'EOF' | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward = 1
EOF

sudo sysctl --system
```

Esses parâmetros preparam o host para o roteiro de rede do cluster. Os arquivos em `/etc` mantêm as configurações após o boot.

## 7. Preparando o runtime containerd

Ainda nas três máquinas:

```bash
sudo apt-get install -y containerd
containerd --version
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml > /dev/null
sudo nano /etc/containerd/config.toml
```

Na configuração gerada para o runtime `runc`, altere a opção existente para:

```toml
SystemdCgroup = true
```

Confira que `cri` não aparece em `disabled_plugins`. A seção do arquivo muda entre containerd 1.x e 2.x; use a configuração gerada pela versão instalada.

```bash
sudo systemctl enable --now containerd
sudo systemctl restart containerd
systemctl is-active containerd
```

Esperamos o retorno `active`. O driver de cgroup do runtime deve ser compatível com o do kubelet; este roteiro adota `systemd`. [Documentação sobre container runtimes](https://kubernetes.io/docs/setup/production-environment/container-runtimes/).

## 8. Conferindo a preparação

Em cada nó:

```bash
hostname
nproc
free -h
df -h /
swapon --show
lsmod | grep -E 'overlay|br_netfilter'
sysctl net.ipv4.ip_forward
sysctl net.bridge.bridge-nf-call-iptables
systemctl is-active containerd
curl -I https://pkgs.k8s.io
```

Confira recursos disponíveis, swap desativado, módulos carregados, parâmetros de rede em `1` e runtime ativo. O `curl` verifica acesso HTTPS ao repositório; ele não substitui um teste de download de imagem.

Para verificar comunicação privada, execute de um nó para o IP privado de outro:

```bash
ping -c 3 <IP-PRIVADO-DO-OUTRO-NO>
```

O ping verifica ICMP, não todas as portas do Kubernetes. Se falhar, confira Security Group, NACLs, rotas e firewall local. Não prossiga com a instalação enquanto a conectividade entre as máquinas estiver incorreta.

| Problema | Onde conferir |
| --- | --- |
| SSH dá timeout | IP público, rota para o gateway, regra de SSH e seu IP atual. |
| `Permission denied (publickey)` | Usuário `ubuntu`, caminho da chave e key pair selecionado. |
| Pacotes não baixam | DNS, rota de saída, IP público e regras de saída. |
| containerd não inicia | Arquivo de configuração e `sudo journalctl -u containerd -n 100 --no-pager`. |

## Próximo passo: instalar o Kubernetes

Com as três máquinas preparadas, siga o [artigo de criação do cluster com kubeadm](/posts/cluster-kubernetes-na-aws-com-kubeadm/#4-instalando-kubeadm-kubelet-e-kubectl) a partir da instalação de `kubeadm`, `kubelet` e `kubectl`.

Depois vêm a inicialização do control plane, a instalação da rede de Pods e o ingresso dos workers. Os [requisitos oficiais do kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/) ajudam a revisar a preparação.

O roteiro deste artigo não foi executado em uma conta AWS para validação. Ao encerrar o estudo, termine as instâncias e confira volumes e endereços remanescentes para evitar cobranças contínuas.

## Referências

- [AWS — Get started with Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html) — criação e gerenciamento inicial das instâncias.
- [AWS — Internet Gateways](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html) — rotas e conectividade com a internet.
- [AWS — EC2 Security Groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html) — regras de entrada e saída.
- [AWS — Create key pairs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/create-key-pairs.html) — criação da chave de acesso.
- [AWS — Connection prerequisites](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connection-prereqs.html) — preparação do acesso SSH.
- [Kubernetes — Installing kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/) — requisitos dos nós.
- [Kubernetes — Container Runtimes](https://kubernetes.io/docs/setup/production-environment/container-runtimes/) — configuração do runtime e de cgroups.
- [Kubernetes — Ports and Protocols](https://kubernetes.io/docs/reference/networking/ports-and-protocols/) — comunicação dos componentes do cluster.
- [LINUXtips — PICK](https://linuxtips.io/pick/) — Programa Intensivo de Containers e Kubernetes que orienta esta sequência de estudos.
