---
title: "Cluster Kubernetes: entendendo os componentes e criando um laboratório na AWS"
description: Conheça o control plane e os workers e acompanhe a criação de um cluster Kubernetes em três instâncias EC2 com kubeadm, containerd e Flannel.
date: 2026-10-06
category: Kubernetes
tags: [kubernetes, cluster, aws, ec2, kubeadm, containerd, flannel, linux]
---

> **Nota:** Este conteúdo foi produzido a partir das minhas anotações de 05 e 06/10/2026 no **PICK – Programa Intensivo de Containers e Kubernetes**, da LINUXtips, complementadas pela documentação oficial.

Depois de conhecer Pods, Deployments e probes, precisamos entender o ambiente que executa esses recursos: o **cluster Kubernetes**.

Vamos organizar os componentes apresentados nas anotações e completar o roteiro de instalação em três máquinas Ubuntu na AWS.

## O que é um cluster Kubernetes?

Um cluster reúne um plano de controle (**control plane**) e nós que executam as cargas de trabalho, normalmente chamados de **workers**. As máquinas podem ser físicas ou virtuais.

O control plane coordena o estado do ambiente. Os workers executam os Pods, que agrupam um ou mais containers com rede compartilhada e podem compartilhar volumes. [Arquitetura do Kubernetes](https://kubernetes.io/docs/concepts/architecture/).

```text
kubectl → API Server → estado do cluster no etcd
              │
       Controladores e Scheduler
              │
       ┌──────┴──────┐
       ▼             ▼
    worker-1      worker-2
    kubelet       kubelet
    containerd    containerd
    Pods          Pods
```

O desenho resume as responsabilidades; os componentes acompanham o estado por meio da API.

## Componentes e responsabilidades

| Componente | Papel |
| --- | --- |
| `kube-apiserver` | Expõe a API e processa as solicitações ao cluster. |
| `etcd` | Armazena os dados de estado do Kubernetes. |
| `kube-scheduler` | Seleciona um nó para Pods ainda sem nó atribuído. |
| `kube-controller-manager` | Executa controladores que reconciliam o estado observado com o desejado. |
| `kubelet` | Agente do nó que acompanha a execução dos containers dos Pods. |
| Runtime, como `containerd` | Executa os containers por meio da interface CRI. |
| `kube-proxy` | Implementa regras de rede para Services nesta instalação. |
| Plugin de rede, como Flannel | Configura a conectividade entre os Pods. |

O scheduler não redistribui continuamente os Pods já em execução. A recuperação de réplicas envolve controladores e o agendamento de novos Pods. A tolerância a falhas do etcd também depende de sua topologia e da manutenção de quorum. [Componentes oficiais do Kubernetes](https://kubernetes.io/docs/concepts/overview/components/).

## Formas de criar um cluster

As anotações citam `kubeadm`, Kubespray, kOps, minikube, kind e serviços gerenciados.

Neste laboratório usaremos **kubeadm sobre EC2** para observar a instalação dos componentes. No Amazon EKS, a AWS gerencia o control plane; aqui, sua administração fica conosco.

O ambiente terá um control plane e dois workers. Um único control plane serve ao estudo, mas não oferece alta disponibilidade.

## 1. Criando as instâncias na AWS

No console EC2 da região escolhida, abra a opção de iniciar instâncias e configure:

| Item | Configuração do laboratório |
| --- | --- |
| Quantidade | 3 instâncias |
| Nomes | `k8s-cp`, `k8s-worker-1` e `k8s-worker-2` |
| AMI | Ubuntu Server 24.04 LTS, arquitetura x86_64 |
| Tipo | Pelo menos 2 vCPUs e 4 GiB de RAM por instância |
| Disco | 20 GiB de EBS por máquina para este exemplo |
| Rede | Mesma VPC e subnet, com comunicação pelos IPs privados |
| Acesso | Key pair para SSH |

Escolha uma subnet pública com rota para um Internet Gateway e habilite IP público para o acesso SSH deste laboratório. As máquinas também precisam alcançar os repositórios de pacotes e imagens. Anote o IP privado e o público de cada uma. [Guia de primeiros passos do EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html).

As instâncias, discos e endereços públicos podem gerar cobranças. A indicação de Free Tier no caderno não garante gratuidade: confira a elegibilidade da conta e os preços antes de iniciar.

### Security Group

Crie um grupo exclusivo, por exemplo `k8s-lab`, e associe às três máquinas:

| Entrada | Origem |
| --- | --- |
| TCP `22` | Seu IP público com máscara `/32`. |
| Todo o tráfego | O próprio Security Group `k8s-lab`. |

Essa regra interna simplifica o laboratório e permite a comunicação do Kubernetes e da rede overlay entre as três instâncias. Mantenha saída liberada para baixar pacotes e imagens. O firewall do sistema operacional e as NACLs também precisam permitir essa comunicação.

O SSH fica restrito ao seu IP; a API será acessada a partir do control plane. [Documentação de Security Groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html).

Para uma configuração com regras específicas, consulte as [portas do Kubernetes](https://kubernetes.io/docs/reference/networking/ports-and-protocols/) e os requisitos do plugin de rede. Evite expor API Server, etcd ou kubelet à internet.

### Conectando por SSH

Na sua máquina, substitua o caminho da chave e o endereço:

```bash
chmod 400 chave-k8s.pem
ssh -i chave-k8s.pem ubuntu@<IP-PUBLICO-DA-INSTANCIA>
```

Repita o acesso para cada nó. Os comandos das próximas três etapas são executados **nas três instâncias**, via SSH.

## 2. Preparando o Linux em todos os nós

Cada máquina precisa ter hostname único. Na respectiva instância, use um dos nomes:

```bash
sudo hostnamectl set-hostname k8s-cp
```

Nos workers, substitua por `k8s-worker-1` e `k8s-worker-2`. Reconecte por SSH após mudar o nome.

Desative o swap e confira:

```bash
sudo swapoff -a
swapon --show
sudo nano /etc/fstab
```

Se houver entradas de swap em `/etc/fstab`, comente apenas essas linhas para impedir sua reativação no boot.

Prepare os módulos e parâmetros presentes nas anotações:

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

## 3. Instalando e configurando o containerd

Em máquinas novas com a AMI indicada:

```bash
sudo apt-get update
sudo apt-get install -y containerd ca-certificates curl gpg
containerd --version
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml > /dev/null
sudo nano /etc/containerd/config.toml
```

No arquivo gerado, localize `SystemdCgroup = false` na configuração do runtime `runc` e altere para:

```toml
SystemdCgroup = true
```

Confira também que `cri` não está em `disabled_plugins`. O caminho da seção varia entre containerd 1.x e 2.x; edite a opção existente, sem criar uma seção de outra versão.

```bash
sudo systemctl enable --now containerd
sudo systemctl restart containerd
sudo systemctl status containerd --no-pager
```

O kubelet e o runtime devem usar drivers de cgroup compatíveis. O `systemd` é a configuração adotada aqui. [Documentação de runtimes](https://kubernetes.io/docs/setup/production-environment/container-runtimes/).

## 4. Instalando kubeadm, kubelet e kubectl

Este roteiro usa a linha **Kubernetes 1.34**, sem afirmar que ela seja a mais recente. Instale a mesma versão de pacotes nos três nós.

```bash
sudo mkdir -p -m 755 /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.34/deb/Release.key \
  | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.34/deb/ /' \
  | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
sudo systemctl enable kubelet
kubeadm version -o short
kubectl version --client
```

O `apt-mark hold` evita atualizações automáticas desses pacotes; upgrades devem ser planejados. O kubelet pode reiniciar enquanto aguarda a configuração feita por `init` ou `join`.

As anotações ainda mostram `apt.kubernetes.io` e `kubernetes-xenial`. Usamos `pkgs.k8s.io`, organizado por versão minor. [Instalação oficial para Kubernetes 1.34](https://v1-34.docs.kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/).

## 5. Inicializando o control plane

Execute **somente em `k8s-cp`**, substituindo o endereço pelo IP privado dessa instância:

```bash
sudo kubeadm init \
  --kubernetes-version="$(kubeadm version -o short)" \
  --apiserver-advertise-address=<IP-PRIVADO-DO-CONTROL-PLANE> \
  --pod-network-cidr=10.244.0.0/16 \
  --cri-socket=unix:///run/containerd/containerd.sock
```

Reservamos `10.244.0.0/16` para os Pods e mantemos `10.96.0.0/12` como faixa padrão de Services. Ambas devem ficar fora das faixas da VPC e das redes conectadas a ela. Se houver sobreposição, escolha outras faixas e ajuste também o manifesto de rede.

O CIDR de Pods difere do rascunho para acompanhar o padrão do Flannel escolhido neste artigo.

Após o sucesso, configure o acesso do usuário `ubuntu` no control plane:

```bash
mkdir -p "$HOME/.kube"
sudo cp /etc/kubernetes/admin.conf "$HOME/.kube/config"
sudo chown "$(id -u):$(id -g)" "$HOME/.kube/config"
kubectl get nodes
```

O kubeconfig administrativo contém credenciais de acesso ao cluster. Guarde-o fora de repositórios e arquivos compartilhados.

## 6. Instalando a rede dos Pods

No control plane, baixe uma versão fixa do manifesto do Flannel e revise antes de aplicar:

```bash
curl -fL -o kube-flannel.yml \
  https://github.com/flannel-io/flannel/releases/download/v0.28.9/kube-flannel.yml
less kube-flannel.yml
kubectl apply -f kube-flannel.yml
kubectl get pods -n kube-flannel
```

O Flannel usa `10.244.0.0/16` por padrão. Se você mudou o CIDR no `init`, ajuste o campo `Network` do manifesto antes de aplicá-lo. [Instruções do projeto Flannel](https://github.com/flannel-io/flannel#deploying-flannel-manually).

Antes de instalar a rede, o nó pode aparecer como `NotReady` e os Pods de DNS podem aguardar. Confira também a presença dos plugins CNI em `/opt/cni/bin`, instalados como dependências dos pacotes Kubernetes.

## 7. Adicionando os dois workers

O `kubeadm init` imprime um comando `join`. Execute esse comando com `sudo` em **cada worker**, mantendo o IP privado do control plane, token e hash reais.

Se precisar gerar outro comando, no control plane:

```bash
sudo kubeadm token create --print-join-command
```

O formato será semelhante a este; os valores entre `<...>` são substituições:

```bash
sudo kubeadm join <IP-PRIVADO-DO-CONTROL-PLANE>:6443 \
  --token <TOKEN> \
  --discovery-token-ca-cert-hash sha256:<HASH> \
  --cri-socket=unix:///run/containerd/containerd.sock
```

Não execute `kubeadm init` nos workers. Depois do ingresso, no control plane:

```bash
kubectl get nodes -o wide
kubectl get pods -A
```

O objetivo é encontrar os três nós em `Ready`. A coluna de roles dos workers pode mostrar `<none>`; isso não indica falha. [Criação de clusters com kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/).

## 8. Testando uma aplicação

No control plane:

```bash
kubectl create deployment nginx-lab --image=nginx:1.28.0 --replicas=2
kubectl rollout status deployment/nginx-lab
kubectl get pods -l app=nginx-lab -o wide
kubectl expose deployment nginx-lab --port=80 --target-port=80
kubectl port-forward service/nginx-lab 8080:80
```

Mantenha o encaminhamento aberto. Em uma segunda sessão SSH no control plane:

```bash
curl http://127.0.0.1:8080
```

Esse acesso local verifica a resposta da aplicação, sem exigir um balanceador AWS ou uma porta pública adicional. Duas réplicas não garantem, por si só, uma por worker.

Para verificar DNS e comunicação pelo Service dentro do cluster:

```bash
kubectl run teste-rede --image=busybox:1.37.0 --restart=Never \
  --command -- sh -c 'nslookup nginx-lab; wget -qO- http://nginx-lab'
kubectl logs -f teste-rede
```

## Quando algo não funcionar

| Sintoma | O que conferir |
| --- | --- |
| `join` não conecta | IP privado, token, Security Group, NACL e acesso à porta `6443`. |
| Nó em `NotReady` | Pods do Flannel, configuração CNI e encaminhamento IP. |
| Erro de runtime | Serviço containerd, socket CRI e configuração de cgroups. |
| Imagem não baixa | Saída para internet, DNS e acesso ao registro. |

Use os eventos e logs para identificar a causa:

```bash
kubectl describe node <nome-do-no>
kubectl get events -A --sort-by=.metadata.creationTimestamp
sudo journalctl -u kubelet -n 100 --no-pager
sudo journalctl -u containerd -n 100 --no-pager
```

Os comandos com `journalctl` devem ser executados no nó afetado. As fotos registram o roteiro de aula, sem comprovar o resultado deste laboratório completo.

## Encerrando o laboratório

Remova os recursos de teste:

```bash
kubectl delete pod teste-rede
kubectl delete service nginx-lab
kubectl delete deployment nginx-lab
```

Ao terminar o estudo, encerre as três instâncias pelo console EC2 e confira volumes EBS remanescentes e eventuais Elastic IPs. Apagar os objetos Kubernetes não remove os recursos da AWS nem encerra suas cobranças.

## Conclusão

O laboratório conecta a arquitetura do cluster à prática: preparamos o Linux e o runtime, instalamos o Kubernetes, inicializamos o control plane e adicionamos os workers com uma rede de Pods funcional.

Essa base ajuda a entender onde os recursos dos próximos laboratórios são armazenados, agendados e executados.

## Referências

- [Kubernetes — Cluster Architecture](https://kubernetes.io/docs/concepts/architecture/) — organização do cluster.
- [Kubernetes — Components](https://kubernetes.io/docs/concepts/overview/components/) — responsabilidades do control plane e dos nós.
- [Kubernetes 1.34 — Installing kubeadm](https://v1-34.docs.kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/) — requisitos e pacotes utilizados no roteiro.
- [Kubernetes — Creating a cluster with kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/) — inicialização, rede e ingresso dos workers.
- [Kubernetes — Container Runtimes](https://kubernetes.io/docs/setup/production-environment/container-runtimes/) — CRI e configuração de cgroups.
- [Kubernetes — Ports and Protocols](https://kubernetes.io/docs/reference/networking/ports-and-protocols/) — portas dos componentes.
- [Flannel — Deploying manually](https://github.com/flannel-io/flannel#deploying-flannel-manually) — instalação da rede dos Pods.
- [AWS — Get started with Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html) — criação e acesso às instâncias.
- [AWS — EC2 Security Groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html) — controle de tráfego das instâncias.
- [LINUXtips — PICK](https://linuxtips.io/pick/) — Programa Intensivo de Containers e Kubernetes utilizado como base dos meus estudos e destas anotações.
