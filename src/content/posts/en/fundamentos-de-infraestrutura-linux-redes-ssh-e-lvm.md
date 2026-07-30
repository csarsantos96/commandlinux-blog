---
title: 'Linux Infrastructure Fundamentals: Networking, SSH, SCP, and LVM'
description: >-
  A practical journey through networking fundamentals, remote access with SSH,
  file transfer with SCP, and disk management with LVM.
date: '2026-05-25'
category: Linux
tags:
  - linux
  - redes
  - ssh
  - scp
  - lvm
  - aws
  - ec2
  - infraestrutura
draft: false
language: en
translationOf: fundamentos-de-infraestrutura-linux-redes-ssh-e-lvm
sourceHash: 158199ad57940477c9d9a0101b257d3fc1303a40f941b0f71f0f7f919c3a1447
---
# Linux Infrastructure Fundamentals: Networking, SSH, SCP, and LVM

> Before automating servers, creating pipelines, or managing clusters, we need to understand the basic components that underpin the infrastructure.

This article originated from notes taken during my Linux and Cloud Native studies. The goal was to connect topics often learned separately: networking, remote access, file transfer, diagnostic commands, and storage management.

When these pieces come together, it becomes easier to understand what truly happens when accessing a cloud instance, copying files to a server, or increasing available space on a filesystem.


# Starting with Networking

A network consists of two or more connected devices capable of exchanging information. For this communication to work, some concepts appear constantly.

## IP Address

The IP address identifies a device within a network. For the examples, we will use an address reserved exclusively for documentation:

```text
198.51.100.10
```

On a Linux machine, we can query configured addresses with:

```bash
ip address
```

It's also common to use the abbreviated form:

```bash
ip a
```

On Windows, the best-known equivalent command is:

```powershell
ipconfig
```

## Ports

The IP identifies the machine; the port helps identify the service running on it. Some well-known examples are:

| Service | Default Port |
|---------|--------------|
| SSH | 22 |
| HTTP | 80 |
| HTTPS | 443 |

The same machine can run multiple services, each listening on a different port.

## DNS

DNS translates easy-to-remember names, such as `example.com`, into IP addresses. Without it, we would need to memorize the numeric address of every service accessed.

To test if a machine can reach another address, we can use:

```bash
ping 198.51.100.10
```

`ping` doesn't validate all machine services, but it helps check basic connectivity when the ICMP protocol is allowed.


# Remote Access with SSH

**SSH (Secure Shell)** is a protocol for secure remote communication. It follows the client-server model:

- the server runs the `sshd` service and typically listens on port 22;
- the client uses the `ssh` command to initiate the connection;
- traffic between the two ends is encrypted.

A basic connection has this format:

```bash
ssh usuario@198.51.100.10
```

In cloud environments, such as an EC2 instance, it's common to authenticate with a key pair:

```bash
ssh -i chave.pem ubuntu@198.51.100.10
```

The user depends on the image used. On an Ubuntu AMI, for example, it is usually `ubuntu`.

## Organizing Connections in the SSH config file

When managing multiple machines, repeating the user, address, and key path becomes tiresome. The `~/.ssh/config` file allows creating aliases:

```text
Host laboratorio
  HostName 198.51.100.10
  User ubuntu
  IdentityFile ~/.ssh/chave.pem
```

Then, the connection becomes simpler:

```bash
ssh laboratorio
```

The same file can contain multiple `Host` blocks, one for each server.


# Copying Files with SCP

`scp` uses SSH to securely transfer files between machines.

To send a local file to the server:

```bash
scp arquivo.txt usuario@servidor:/tmp/
```

To retrieve a remote file to the current directory:

```bash
scp usuario@servidor:/tmp/arquivo.txt .
```

Some useful options are:

| Option | Function |
|-------|--------|
| `-r` | Copies directories recursively |
| `-p` | Preserves timestamps and permissions |
| `-v` | Displays operation details |
| `-C` | Enables compression during transfer |
| `-q` | Reduces displayed messages |

For example, to send an entire directory:

```bash
scp -r projeto/ usuario@servidor:/opt/
```

It's important to note the order of arguments: source comes first, then destination.


# Commands to Get to Know the Machine

Before modifying a server, we need to understand where we are and what resources it has.

## Directories and Files

The `ls` command lists files. Two important references appear frequently:

```text
.   current directory
..  parent directory
```

To include hidden files and details:

```bash
ls -lha
```

## Memory

To view RAM and swap memory consumption:

```bash
free -h
```

## Processor

`lscpu` shows information such as architecture, number of CPUs, cores, threads, and virtualization features:

```bash
lscpu
```

## Identity and System

Other useful commands are:

```bash
whoami
hostname
uname -a
```

They show, respectively, the current user, the machine's configured name, and kernel and system information.


# Understanding LVM

**LVM (Logical Volume Manager)** adds a layer of abstraction between physical disks and filesystems. Instead of treating each partition as a rigid structure, we can gather storage into groups and create more flexible logical volumes.

LVM works with three main layers:

```text
Disk or partition
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
Filesystem and mount point
```

- **PV (Physical Volume):** a disk or partition prepared for LVM.
- **VG (Volume Group):** a collection of one or more PVs, functioning as a storage pool.
- **LV (Logical Volume):** a volume created from the space available in the VG.

A Volume Group can be divided into several Logical Volumes, for example:

```text
ubuntu-vg
├── lv-root
└── lv-home
```

## Querying the Structure

Some commands help visualize each layer:

```bash
sudo pvs
sudo vgs
sudo lvs
```

To see disks, partitions, volumes, and mount points together:

```bash
lsblk
```

And to check the space used by mounted filesystems:

```bash
df -h
```


# Expanding a Logical Volume

One of the great advantages of LVM is the ability to extend existing volumes. The process, however, involves two distinct steps:

1. extend the Logical Volume;
2. expand the filesystem to use the new space.

To consume all free space in the Volume Group:

```bash
sudo lvextend -l +100%FREE /dev/mapper/ubuntu--vg-ubuntu--lv
```

If the filesystem is ext4, we can resize it with:

```bash
sudo resize2fs /dev/mapper/ubuntu--vg-ubuntu--lv
```

For XFS filesystems, the procedure is different and typically uses `xfs_growfs`. Therefore, before executing any changes, confirm the filesystem type:

```bash
df -Th
```

It is also essential to verify the correct volume path with `lsblk` or `lvs` and maintain backups of important data.


# How Everything Connects in Practice

Imagine an application is running on an EC2 instance, and the disk is getting full. The investigation flow might be:

```text
Locate the instance IP
        │
        ▼
Access with SSH
        │
        ▼
Check disks with lsblk and df -h
        │
        ▼
Identify PV, VG, and LV
        │
        ▼
Expand the logical volume
        │
        ▼
Resize the filesystem
        │
        ▼
Validate again with df -h
```

If it's necessary to send scripts or configuration files, `scp` uses the same secure SSH foundation to perform the transfer.

This example shows why networking, Linux, remote access, and storage are not isolated topics. In daily infrastructure work, they appear together.


# Conclusion

Studying fundamentals builds a foundation that remains useful even as tools change.

Understanding IP, ports, and DNS helps diagnose communication. Knowing SSH and SCP allows secure machine administration. Mastering inspection commands reveals the system's state. And comprehending PV, VG, and LV makes storage management much less mysterious.

These notes precisely represent this stage: moving beyond isolated commands and starting to see infrastructure as a set of connected layers.


## References

- [LINUXtips — Linux para Cloud Native](https://linuxtips.io/linux-para-cloud-native/)
- [AWS Documentation — Connect to your Linux instance using SSH](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connect-to-linux-instance.html)
- [AWS Documentation — Amazon EC2 key pairs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html)
- [OpenBSD Manual Pages — ssh](https://man.openbsd.org/ssh)
- [OpenBSD Manual Pages — scp](https://man.openbsd.org/scp)
- [Linux man-pages — ip-address](https://man7.org/linux/man-pages/man8/ip-address.8.html)
- [Red Hat Documentation — Configuring and managing logical volumes](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/8/html/configuring_and_managing_logical_volumes/)
