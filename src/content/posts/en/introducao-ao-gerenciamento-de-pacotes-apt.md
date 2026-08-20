---
title: 'From .exe to apt install: Understanding Package Management on Linux'
description: >-
  Notes on what a package manager is, the difference from the Windows
  installation model, and how APT resolves dependencies and verifies GPG
  signatures before installing anything.
date: '2026-08-12'
category: LINUX
tags:
  - linux
  - apt
  - gerenciamento-de-pacotes
  - gpg
  - debian
  - ubuntu
draft: false
language: en
translationOf: introducao-ao-gerenciamento-de-pacotes-apt
sourceHash: 0af0dd5d7064c2999a9c46dafc32ee56e15d7c1ed10a2188ebd5d24da11444c7
---
These are my notebook notes on package management in Linux, part of the **Linux for Cloud Native** course from LINUXtips, within the PICK 2026 track. Before delving into repositories and PPAs, I thought it was worth noting why all of this exists, comparing it to the model most of us learned first: the Windows one.

> The outputs presented are examples. Names, paths, and versions may vary depending on the system.

# The Windows way to install software

On Windows, the most common flow for installing a program is: open the browser, search for the program's website, download an `.exe`, double-click it, and wait for the installer to finish. Each program resolves its own dependencies however it wants, which in practice means loose DLLs scattered throughout the system, different installers for each software, and no central guarantee that the `.exe` is truly what it claims to be.

# The Linux way to install software

On Linux, this flow practically doesn't exist. Instead of downloading executables from site to site, the system already comes with access to a repository: a catalog maintained by the distro itself (Ubuntu, Debian, Fedora, among others), with thousands of pre-compiled, tested, and digitally signed software packages with GPG.

This changes the logic entirely: instead of me trusting each individual site from which I download an installer, I trust a single chain, that of the distro, which tests the package, digitally signs it, and distributes it through the official repository.

# What is APT

**APT** (*Advanced Package Tool*) is the package manager behind this logic in Debian-based distros, like Ubuntu. In practice, it solves three problems at once:

*   **Dependencies**: if a package needs three others to work, APT figures this out automatically and installs all three together, without me having to hunt for each one manually.
*   **Installation and configuration**: it downloads the package from the configured repository and applies the installation, including the configuration steps defined by the package.
*   **Signature verification**: before installing anything, APT checks the package's GPG signature against the trusted keys known by the system. If the signature doesn't match, it refuses the installation. This is what prevents someone from simply swapping a package midway and delivering a tampered binary without me noticing.

In practice, day-to-day with APT starts with two commands:

```bash
sudo apt update
```

Updates the local list of available packages, synchronizing with what's published in the configured repositories. This doesn't install anything; it just updates the "catalog."

```bash
sudo apt install pacote
```

Installs the package, resolving its dependencies automatically.

# Why this matters

The point that made this comparison worth noting: on Windows, trust is distributed and manual; each installer is an isolated decision to trust or not trust that site, that `.exe`. On Linux, trust is centralized in the repository and GPG signature chain, which only works if I know exactly which repositories I am trusting.

And that's exactly where the next topic lies: where, in practice, APT downloads these packages from, and what happens when I decide to trust a source outside the distro's official repository.

# Summary

*   Windows model: manual trust, one `.exe` at a time, no central verification.
*   Linux model: central repository maintained by the distro, pre-compiled, tested, and GPG-signed packages.
*   `APT` (*Advanced Package Tool*): resolves dependencies, installs, configures, and verifies signatures before installing.
*   Update package catalog: `sudo apt update`
*   Install a package: `sudo apt install package`

# Conclusion

I always used `apt install` automatically, without stopping to think about what's behind it. Understanding that the real gain isn't just "not needing to look for the installer on the internet," but rather having a chain of trust and signature verification embedded in the process, changes how I think about where the packages I install on a server come from.

And this left an open question: if trust depends on the repository, what exactly defines a trustworthy repository? That's the note for the next post.

## References

*   `man apt`, `man apt-get` — official command documentation.
*   [Debian Administrator's Handbook — Package Management](https://debian-handbook.info/browse/stable/sect.apt-get.html) — reference on APT and the Debian package ecosystem.
*   [LINUXtips — Linux for Cloud Native](https://linuxtips.io/linux-para-cloud-native/) — course used as the basis for my studies and these notes, within the PICK track.
*   [Guia Foca GNU/Linux](https://focalinux.cipsga.org.br/) — Portuguese reference on package management in Linux.
