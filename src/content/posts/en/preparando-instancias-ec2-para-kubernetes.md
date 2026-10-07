---
title: Preparing AWS EC2 instances for a Kubernetes cluster
description: >-
  Configure VPC, subnet, Security Group, SSH key, and Ubuntu on the EC2
  instances that will be the control plane and workers for your Kubernetes lab.
date: '2026-10-07'
category: CLOUD
tags:
  - kubernetes
  - aws
  - ec2
  - vpc
  - security-group
  - ssh
  - ubuntu
  - containerd
draft: false
language: en
translationOf: preparando-instancias-ec2-para-kubernetes
sourceHash: ed968622129c4015aca5569102a1c1e281ac5a3fa135e2963d66f62911ecb23f
---
Before running `kubeadm init`, we need to prepare the machines that will form the cluster. They must be able to communicate, download packages, and run containers.

This article details the infrastructure preparation for the [Kubernetes lab on AWS with kubeadm](/posts/cluster-kubernetes-na-aws-com-kubeadm/), following the studies of **PICK – Programa Intensivo de Containers e Kubernetes** (Intensive Container and Kubernetes Program), from LINUXtips.

## The environment we will prepare

We will use three EC2 instances with Ubuntu: one for the control plane and two for the workers.

| Instance | Future role | Lab configuration |
| --- | --- | --- |
| `k8s-cp` | Control plane | 2 vCPUs, at least 4 GiB of RAM, and 20 GiB of disk. |
| `k8s-worker-1` | Worker | 2 vCPUs, at least 4 GiB of RAM, and 20 GiB of disk. |
| `k8s-worker-2` | Worker | 2 vCPUs, at least 4 GiB of RAM, and 20 GiB of disk. |

Choose an x86_64 type with these resources available in the region. The size is a reference for this lab; larger applications require different sizing.

We will have a single control plane, without high availability. This installation is managed by us on EC2; to learn about the cluster and complete its installation, follow the article indicated at the end.

## 1. Choosing the region and network

In the AWS console, select the region you intend to work in. Use the same region in all steps.

In the **VPC** service, check if there is a suitable VPC for the lab. You can use the default VPC, if available, or create a dedicated network.

A possible organization is:

```text
VPC: 172.31.0.0/16
└── Public Subnet: 172.31.10.0/24
    ├── k8s-cp
    ├── k8s-worker-1
    └── k8s-worker-2

Future Pods Network: 10.244.0.0/16
Future Services Network: 10.96.0.0/12
```

These addresses are examples. If using an existing VPC, keep its actual CIDRs and ensure they do not overlap with the Pods, Services, or VPN-connected network ranges.

### Checking the public subnet

In the VPC console:

1. Open **Subnets** and select the chosen subnet.
2. Check the VPC and the associated route table.
3. In the route table, verify the local VPC route and a `0.0.0.0/0` route pointing to an Internet Gateway.
4. Under **Internet Gateways**, confirm that this gateway is attached to the VPC.

For direct SSH access in this guide, each instance will also receive a public IPv4. The route to the gateway, by itself, does not provide a public address to the machine. [Internet Gateways documentation](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html).

The machines will communicate with each other using **private IPs**. The public IP will be used for administrative access from your computer.

## 2. Creating the Security Group

In the EC2 console, open **Security Groups**, choose to create a group, and configure:

- Name: `k8s-lab`.
- Description: Kubernetes lab access.
- VPC: the same one chosen for the instances.

Create the group and then edit its inbound rules:

| Type | Protocol/port | Source |
| --- | --- | --- |
| SSH | TCP `22` | Your public IP with `/32`, using the **My IP** option. |
| All traffic | All | The ID of the `k8s-lab` group itself. |

The second rule allows traffic between interfaces associated with this group, which is necessary for node communication and the Pod network. It does not authorize any internet address. Use this group exclusively for the three lab instances.

Keep outbound traffic open in this example to download packages and images. [Security Groups documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html).

SSH access is restricted to your address. It is not necessary to expose the Kubernetes API or etcd to the public to follow the lab. If your IP changes, update the SSH rule.

This broad internal rule simplifies the study. A deployment with specific rules should consider the [Kubernetes component ports](https://kubernetes.io/docs/reference/networking/ports-and-protocols/) and the chosen network plugin.

## 3. Creating the SSH key

In the EC2 console, open **Key Pairs** and create a key:

| Field | Example value |
| --- | --- |
| Name | `k8s-lab-key` |
| Type | RSA |
| Format | `.pem`, for OpenSSH |

Save the downloaded file in a private folder on your computer. The private key should not be uploaded to the blog repository or copied to the workers. [Key pair creation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/create-key-pairs.html).

## 4. Creating the three instances

In the EC2 console, choose **Launch instance**. To facilitate identification, create one machine at a time, repeating the configuration:

1. Under **Name and tags**, use `k8s-cp`, then `k8s-worker-1`, and `k8s-worker-2`.
2. Under **Application and OS Images**, choose Ubuntu Server **24.04 LTS**, x86_64, from the official Canonical source.
3. Select an instance type with the resources defined at the beginning of the article.
4. For **Key pair**, select `k8s-lab-key`.
5. In **Network settings**, choose the VPC and public subnet checked previously.
6. Enable **Auto-assign public IP** and select the existing Security Group `k8s-lab`.
7. Configure the root volume with **20 GiB**, type `gp3`. For this disposable environment, check the option to delete the volume when terminating the instance.
8. Review the settings and launch the machine.

Wait for the instances to be `Running` and pass status checks. [EC2 instance creation guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html).

Record the addresses of each node:

| Name | Private IP | Public IP |
| --- | --- | --- |
| `k8s-cp` | Copy from console | Copy from console |
| `k8s-worker-1` | Copy from console | Copy from console |
| `k8s-worker-2` | Copy from console | Copy from console |

Instances, storage, and public IPv4s may incur charges. Check your account's values and benefits; the lab does not assume Free Tier coverage.

## 5. Accessing via SSH

In your computer's terminal, adjust the key permission and connect using the actual address:

```bash
chmod 400 /caminho/k8s-lab-key.pem
ssh -i /caminho/k8s-lab-key.pem ubuntu@<IP-PUBLICO-DO-NO>
```

The Ubuntu AMI user is `ubuntu`. On the first connection, verify the host's identity according to the instance information. Repeat access for all three machines. [SSH connection prerequisites](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connection-prereqs.html).

All subsequent commands are executed **inside the instances**, via SSH.

## 6. Preparing Ubuntu on each node

### Setting unique names

Execute the corresponding command on each machine:

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

Reconnect via SSH and check with `hostname`. The EC2 `Name` tag is for identification in the console; it does not replace the Ubuntu hostname configuration.

### Updating and disabling swap

On all three new instances:

```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gpg
sudo swapoff -a
swapon --show
sudo nano /etc/fstab
```

Comment out only the swap entries, if they exist. This keeps swap disabled after reboot. If `/var/run/reboot-required` exists after the update, reboot the machine and reconnect before continuing.

### Configuring kernel modules and network

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

These parameters prepare the host for the cluster's network roadmap. Files in `/etc` preserve settings after boot.

## 7. Preparing the containerd runtime

Still on all three machines:

```bash
sudo apt-get install -y containerd
containerd --version
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml > /dev/null
sudo nano /etc/containerd/config.toml
```

In the generated configuration for the `runc` runtime, change the existing option to:

```toml
SystemdCgroup = true
```

Ensure `cri` does not appear in `disabled_plugins`. The file section changes between containerd 1.x and 2.x; use the configuration generated by the installed version.

```bash
sudo systemctl enable --now containerd
sudo systemctl restart containerd
systemctl is-active containerd
```

We expect `active` to be returned. The runtime's cgroup driver must be compatible with that of the kubelet; this guide adopts `systemd`. [Container runtimes documentation](https://kubernetes.io/docs/setup/production-environment/container-runtimes/).

## 8. Checking the preparation

On each node:

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

Check available resources, disabled swap, loaded modules, network parameters set to `1`, and active runtime. `curl` verifies HTTPS access to the repository; it does not replace an image download test.

To verify private communication, run from one node to another's private IP:

```bash
ping -c 3 <IP-PRIVADO-DO-OUTRO-NO>
```

Ping checks ICMP, not all Kubernetes ports. If it fails, check Security Group, NACLs, routes, and local firewall. Do not proceed with the installation while connectivity between machines is incorrect.

| Problem | Where to check |
| --- | --- |
| SSH times out | Public IP, route to gateway, SSH rule, and your current IP. |
| `Permission denied (publickey)` | User `ubuntu`, key path, and selected key pair. |
| Packages don't download | DNS, outbound route, public IP, and outbound rules. |
| containerd doesn't start | Configuration file and `sudo journalctl -u containerd -n 100 --no-pager`. |

## Next step: install Kubernetes

With the three machines prepared, follow the [cluster creation article with kubeadm](/posts/cluster-kubernetes-na-aws-com-kubeadm/#4-instalando-kubeadm-kubelet-e-kubectl) starting from the installation of `kubeadm`, `kubelet`, and `kubectl`.

Next comes the control plane initialization, the Pod network installation, and the workers joining. The [official kubeadm requirements](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/) help review the preparation.

The guide in this article was not executed on an AWS account for validation. When concluding the study, terminate the instances and check for remaining volumes and addresses to avoid continuous charges.

## References

- [AWS — Get started with Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html) — initial creation and management of instances.
- [AWS — Internet Gateways](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html) — routes and internet connectivity.
- [AWS — EC2 Security Groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html) — inbound and outbound rules.
- [AWS — Create key pairs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/create-key-pairs.html) — creation of the access key.
- [AWS — Connection prerequisites](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connection-prereqs.html) — SSH access preparation.
- [Kubernetes — Installing kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/) — node requirements.
- [Kubernetes — Container Runtimes](https://kubernetes.io/docs/setup/production-environment/container-runtimes/) — runtime and cgroup configuration.
- [Kubernetes — Ports and Protocols](https://kubernetes.io/docs/reference/networking/ports-and-protocols/) — communication of cluster components.
- [LINUXtips — PICK](https://linuxtips.io/pick/) — Intensive Container and Kubernetes Program that guides this study sequence.
