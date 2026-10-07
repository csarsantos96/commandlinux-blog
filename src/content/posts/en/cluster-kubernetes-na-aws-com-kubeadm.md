---
title: 'Kubernetes Cluster: Understanding the Components and Building a Lab on AWS'
description: >-
  Understand the control plane and workers, and follow along as we create a
  Kubernetes cluster on three EC2 instances with kubeadm, containerd, and
  Flannel.
date: '2026-10-06'
category: Kubernetes
tags:
  - kubernetes
  - cluster
  - aws
  - ec2
  - kubeadm
  - containerd
  - flannel
  - linux
draft: false
language: en
translationOf: cluster-kubernetes-na-aws-com-kubeadm
sourceHash: c090b1eaa39fe1ee3fff5e450bc16d9f0581468c582937854833c415345bd729
---
**Note:** This content was produced from my notes from 10/05 and 10/06/2026 in the **PICK – Intensive Containers and Kubernetes Program**, by LINUXtips, complemented by the official documentation.

After getting to know Pods, Deployments, and probes, we need to understand the environment that runs these resources: the **Kubernetes cluster**.

Let's organize the components presented in the notes and complete the installation guide on three Ubuntu machines on AWS.

## What is a Kubernetes cluster?

A cluster brings together a control plane (**control plane**) and nodes that run workloads, typically called **workers**. The machines can be physical or virtual.

The control plane coordinates the state of the environment. Workers run Pods, which group one or more containers with shared networking and can share volumes. [Kubernetes Architecture](https://kubernetes.io/docs/concepts/architecture/).

```text
kubectl → API Server → cluster state in etcd
              │
       Controllers and Scheduler
              │
       ┌──────┴──────┐
       ▼             ▼
    worker-1      worker-2
    kubelet       kubelet
    containerd    containerd
    Pods          Pods
```

The diagram summarizes the responsibilities; components monitor the state through the API.

## Components and responsibilities

| Component | Role |
| --- | --- |
| `kube-apiserver` | Exposes the API and processes cluster requests. |
| `etcd` | Stores Kubernetes state data. |
| `kube-scheduler` | Selects a node for Pods without an assigned node yet. |
| `kube-controller-manager` | Runs controllers that reconcile the observed state with the desired state. |
| `kubelet` | Node agent that monitors the execution of Pod containers. |
| Runtime, like `containerd` | Executes containers via the CRI interface. |
| `kube-proxy` | Implements network rules for Services in this installation. |
| Network plugin, like Flannel | Configures connectivity between Pods. |

The scheduler does not continuously redistribute already running Pods. Replica recovery involves controllers and the scheduling of new Pods. etcd's fault tolerance also depends on its topology and quorum maintenance. [Official Kubernetes Components](https://kubernetes.io/docs/concepts/overview/components/).

## Ways to create a cluster

The notes mention `kubeadm`, Kubespray, kOps, minikube, kind, and managed services.

In this lab, we will use **kubeadm on EC2** to observe the component installation. In Amazon EKS, AWS manages the control plane; here, its administration is up to us.

The environment will have one control plane and two workers. A single control plane serves for study, but does not offer high availability.

## 1. Creating instances on AWS

In the EC2 console of your chosen region, open the instance launch option and configure:

| Item | Lab configuration |
| --- | --- |
| Quantity | 3 instances |
| Names | `k8s-cp`, `k8s-worker-1`, and `k8s-worker-2` |
| AMI | Ubuntu Server 24.04 LTS, x86_64 architecture |
| Type | At least 2 vCPUs and 4 GiB of RAM per instance |
| Disk | 20 GiB of EBS per machine for this example |
| Network | Same VPC and subnet, with communication via private IPs |
| Access | Key pair for SSH |

Choose a public subnet with a route to an Internet Gateway and enable a public IP for SSH access in this lab. The machines also need to reach package and image repositories. Note the private and public IP of each one. [EC2 Getting Started Guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html).

Instances, disks, and public addresses may incur charges. The Free Tier indication in the notes does not guarantee gratuity: check account eligibility and prices before starting.

### Security Group

Create a unique group, for example `k8s-lab`, and associate it with the three machines:

| Ingress | Source |
| --- | --- |
| TCP `22` | Your public IP with `/32` mask. |
| All traffic | The `k8s-lab` Security Group itself. |

This internal rule simplifies the lab and allows Kubernetes and overlay network communication between the three instances. Keep egress open to download packages and images. The operating system firewall and NACLs also need to allow this communication.

SSH is restricted to your IP; the API will be accessed from the control plane. [Security Groups Documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html).

For a configuration with specific rules, consult the [Kubernetes ports](https://kubernetes.io/docs/reference/networking/ports-and-protocols/) and network plugin requirements. Avoid exposing API Server, etcd, or kubelet to the internet.

### Connecting via SSH

On your machine, replace the key path and address:

```bash
chmod 400 chave-k8s.pem
ssh -i chave-k8s.pem ubuntu@<IP-PUBLICO-DA-INSTANCIA>
```

Repeat the access for each node. The commands in the next three steps are executed **on all three instances**, via SSH.

## 2. Preparing Linux on all nodes

Each machine needs a unique hostname. On the respective instance, use one of the names:

```bash
sudo hostnamectl set-hostname k8s-cp
```

On the workers, replace with `k8s-worker-1` and `k8s-worker-2`. Reconnect via SSH after changing the name.

Disable swap and verify:

```bash
sudo swapoff -a
swapon --show
sudo nano /etc/fstab
```

If there are swap entries in `/etc/fstab`, comment out only those lines to prevent their reactivation on boot.

Prepare the modules and parameters present in the notes:

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

## 3. Installing and configuring containerd

On new machines with the specified AMI:

```bash
sudo apt-get update
sudo apt-get install -y containerd ca-certificates curl gpg
containerd --version
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml > /dev/null
sudo nano /etc/containerd/config.toml
```

In the generated file, locate `SystemdCgroup = false` in the `runc` runtime configuration and change it to:

```toml
SystemdCgroup = true
```

Also, ensure that `cri` is not in `disabled_plugins`. The section path varies between containerd 1.x and 2.x; edit the existing option without creating a section from another version.

```bash
sudo systemctl enable --now containerd
sudo systemctl restart containerd
sudo systemctl status containerd --no-pager
```

Kubelet and the runtime must use compatible cgroup drivers. `systemd` is the configuration adopted here. [Runtimes documentation](https://kubernetes.io/docs/setup/production-environment/container-runtimes/).

## 4. Installing kubeadm, kubelet, and kubectl

This guide uses **Kubernetes 1.34**, without claiming it to be the latest. Install the same package version on all three nodes.

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

`apt-mark hold` prevents automatic updates of these packages; upgrades should be planned. Kubelet may restart while awaiting configuration done by `init` or `join`.

The notes still show `apt.kubernetes.io` and `kubernetes-xenial`. We use `pkgs.k8s.io`, organized by minor version. [Official installation for Kubernetes 1.34](https://v1-34.docs.kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/).

## 5. Initializing the control plane

Run **only on `k8s-cp`**, replacing the address with the private IP of that instance:

```bash
sudo kubeadm init \
  --kubernetes-version="$(kubeadm version -o short)" \
  --apiserver-advertise-address=<IP-PRIVADO-DO-CONTROL-PLANE> \
  --pod-network-cidr=10.244.0.0/16 \
  --cri-socket=unix:///run/containerd/containerd.sock
```

We reserve `10.244.0.0/16` for Pods and keep `10.96.0.0/12` as the default range for Services. Both must be outside the VPC ranges and networks connected to it. If there is an overlap, choose other ranges and also adjust the network manifest.

The Pods CIDR differs from the draft to match the Flannel pattern chosen in this article.

After success, configure access for the `ubuntu` user on the control plane:

```bash
mkdir -p "$HOME/.kube"
sudo cp /etc/kubernetes/admin.conf "$HOME/.kube/config"
sudo chown "$(id -u):$(id -g)" "$HOME/.kube/config"
kubectl get nodes
```

The administrative kubeconfig contains cluster access credentials. Keep it out of repositories and shared files.

## 6. Installing the Pod network

On the control plane, download a fixed version of the Flannel manifest and review it before applying:

```bash
curl -fL -o kube-flannel.yml \
  https://github.com/flannel-io/flannel/releases/download/v0.28.9/kube-flannel.yml
less kube-flannel.yml
kubectl apply -f kube-flannel.yml
kubectl get pods -n kube-flannel
```

Flannel uses `10.244.0.0/16` by default. If you changed the CIDR in `init`, adjust the `Network` field of the manifest before applying it. [Flannel project instructions](https://github.com/flannel-io/flannel#deploying-flannel-manually).

Before installing the network, the node may appear as `NotReady` and DNS Pods may be pending. Also check for the presence of CNI plugins in `/opt/cni/bin`, installed as dependencies of the Kubernetes packages.

## 7. Adding the two workers

`kubeadm init` prints a `join` command. Execute this command with `sudo` on **each worker**, keeping the real private IP of the control plane, token, and hash.

If you need to generate another command, on the control plane:

```bash
sudo kubeadm token create --print-join-command
```

The format will be similar to this; the values between `<...>` are substitutions:

```bash
sudo kubeadm join <IP-PRIVADO-DO-CONTROL-PLANE>:6443 \
  --token <TOKEN> \
  --discovery-token-ca-cert-hash sha256:<HASH> \
  --cri-socket=unix:///run/containerd/containerd.sock
```

Do not run `kubeadm init` on the workers. After joining, on the control plane:

```bash
kubectl get nodes -o wide
kubectl get pods -A
```

The goal is to find all three nodes in `Ready`. The workers' roles column may show `<none>`; this does not indicate a failure. [Creating clusters with kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/).

## 8. Testing an application

On the control plane:

```bash
kubectl create deployment nginx-lab --image=nginx:1.28.0 --replicas=2
kubectl rollout status deployment/nginx-lab
kubectl get pods -l app=nginx-lab -o wide
kubectl expose deployment nginx-lab --port=80 --target-port=80
kubectl port-forward service/nginx-lab 8080:80
```

Keep the forwarding open. In a second SSH session on the control plane:

```bash
curl http://127.0.0.1:8080
```

This local access verifies the application's response, without requiring an AWS load balancer or an additional public port. Two replicas do not, by themselves, guarantee one per worker.

To verify DNS and communication via the Service within the cluster:

```bash
kubectl run teste-rede --image=busybox:1.37.0 --restart=Never \
  --command -- sh -c 'nslookup nginx-lab; wget -qO- http://nginx-lab'
kubectl logs -f teste-rede
```

## When something doesn't work

| Symptom | What to check |
| --- | --- |
| `join` does not connect | Private IP, token, Security Group, NACL, and access to port `6443`. |
| Node in `NotReady` | Flannel Pods, CNI configuration, and IP forwarding. |
| Runtime error | Containerd service, CRI socket, and cgroup configuration. |
| Image fails to download | Internet egress, DNS, and registry access. |

Use events and logs to identify the cause:

```bash
kubectl describe node <nome-do-no>
kubectl get events -A --sort-by=.metadata.creationTimestamp
sudo journalctl -u kubelet -n 100 --no-pager
sudo journalctl -u containerd -n 100 --no-pager
```

The `journalctl` commands must be executed on the affected node. The photos record the class roadmap, without proving the result of this complete lab.

## Ending the lab

Remove test resources:

```bash
kubectl delete pod teste-rede
kubectl delete service nginx-lab
kubectl delete deployment nginx-lab
```

When you finish your study, terminate the three instances via the EC2 console and check for remaining EBS volumes and any Elastic IPs. Deleting Kubernetes objects does not remove AWS resources or stop their charges.

## Conclusion

The lab connects cluster architecture to practice: we prepared Linux and the runtime, installed Kubernetes, initialized the control plane, and added workers with a functional Pod network.

This foundation helps to understand where resources for future labs are stored, scheduled, and executed.

## References

- [Kubernetes — Cluster Architecture](https://kubernetes.io/docs/concepts/architecture/) — cluster organization.
- [Kubernetes — Components](https://kubernetes.io/docs/concepts/overview/components/) — control plane and node responsibilities.
- [Kubernetes 1.34 — Installing kubeadm](https://v1-34.docs.kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/) — requirements and packages used in the guide.
- [Kubernetes — Creating a cluster with kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/) — initialization, networking, and worker joining.
- [Kubernetes — Container Runtimes](https://kubernetes.io/docs/setup/production-environment/container-runtimes/) — CRI and cgroup configuration.
- [Kubernetes — Ports and Protocols](https://kubernetes.io/docs/reference/networking/ports-and-protocols/) — component ports.
- [Flannel — Deploying manually](https://github.com/flannel-io/flannel#deploying-flannel-manually) — Pod network installation.
- [AWS — Get started with Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html) — instance creation and access.
- [AWS — EC2 Security Groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html) — instance traffic control.
- [LINUXtips — PICK](https://linuxtips.io/pick/) — Intensive Containers and Kubernetes Program used as the basis for my studies and these notes.
