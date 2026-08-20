---
title: 'ACLs in Linux: Access Control Beyond Owner, Group, and Others'
description: >-
  Notes on Access Control Lists (ACLs) in Linux: how to install, read with
  getfacl, grant permission to a specific user or group with setfacl, and when
  it's truly worth it.
date: '2026-08-11'
category: LINUX
tags:
  - linux
  - permissoes
  - acl
  - getfacl
  - setfacl
  - seguranca
draft: false
language: en
translationOf: acl-controle-de-acesso-no-linux
sourceHash: 79a1b379fb3a1ebe7850011d3a0cd8797153d4adb0a501e267636bc90b7c335b
---
Continuing the notes on [special permissions in Linux](/posts/permissoes-especiais-umask-suid-sgid-sticky-bit), part of LINUXtips' **Linux for Cloud Native** course, within the PICK 2026 track, it's time for a problem that `chmod` alone can't solve: what if I need to grant a different permission to a specific user, without changing the file's owner or group?

> The outputs presented are examples. Names, paths, and times may vary depending on the system.

# The limits of the owner/group/others model

The classic Linux permission model – owner, group, and others – only allows one owner and one group per file. If I need a specific user, who is neither the owner nor part of the group, to have read and write access, the "traditional" way is to add that user to the correct group, which isn't always an option, or to reorganize the entire folder structure.

This gap is precisely what ACLs (*Access Control Lists*) solve: an extra layer of permissions, on top of the usual `rwx`, which allows granting access to a specific user or group, individually, without changing the file's owner or group.

# Installation

In many distros, ACL support is already built into the file system, but the command-line tools sometimes need to be installed:

```bash
sudo apt install acl
```

# Reading ACLs with `getfacl`

To see all ACLs applied to a file or directory:

```bash
getfacl corinthians
```

```text
# file: corinthians
# owner: corinthians
# group: dukebless
# flags: ---
user::rwx
group::r-x
other::r-x
```

This shows a file without any extra ACLs yet, just the standard model: owner (`corinthians`) with `rwx`, group (`dukebless`) with `r-x`, and others with `r-x`.

# Granting permission to a specific user with `setfacl`

To explicitly grant read and write access to a user named `deployer`, without touching the file's owner or group:

```bash
setfacl -m u:deployer:rw /var/opt/proj/config/app.yml
```

* `-m` stands for *modify*, it adds or changes a rule.
* `u:deployer:rw` is the syntax: type (`u` for user, or `g` for group), the name, and the granted permission.

After applying such a rule, `getfacl` will show an extra line for that user, in addition to a new line called `mask`:

```text
# file: leonthians
# owner: leonthians
# group: users
user::rwx
user:wine:r-x
group::r-x
mask::r-x
other::r-x
```

The `mask` line deserves attention: it defines the maximum effective permission ceiling for any named user or group entry in the ACL (excluding the owner and "others"). Even if a rule grants `rwx` to a user, if the `mask` is `r-x`, the effective permission is `r-x`. It's always worth checking the `mask` after modifying an ACL, to avoid assuming a permission was granted when in practice it was limited.

# Removing an ACL

To remove only a specific user's rule:

```bash
setfacl -x u:wine arquivo
```

To remove all ACLs from a file, reverting to the standard model:

```bash
setfacl -b arquivo
```

# When it's worth using ACLs

The detail that most caught my attention in this note: ACLs are not a good practice by default; they are a tool for a specific problem.

In most Cloud Native environments, something like 90% of cases, a well-organized system with groups planned from the start doesn't need any ACLs. The owner/group/others model, combined with well-defined groups, is sufficient.

The other 10% are cases such as:

* multi-terminal hosting environments, where multiple independent users share the same machine;
* a regulatory requirement where different users need different access levels to the same set of files, and this cannot be resolved simply by reorganizing groups.

Outside of these cases, adding ACLs usually adds more complexity to manage later. A regular `ls -l` doesn't even show that an ACL is applied, only a `+` at the end of the permissions, making it easy to forget it exists.

# Summary

* Install support: `sudo apt install acl`
* View a file's ACLs: `getfacl file`
* Grant permission to a user: `setfacl -m u:user:rwx file`
* Grant permission to a group: `setfacl -m g:group:rwx file`
* Remove a user's rule: `setfacl -x u:user file`
* Remove all ACLs: `setfacl -b file`
* Keep an eye on the `mask` line, which limits the effective permission of any named entry

# Conclusion

ACLs are the kind of resource that solves a real problem, but can also be overused. Since they are "hidden" behind a discreet `+` in the `ls -l` output, it's easy to forget that a file has a special rule applied, which can become a trap for anyone debugging permissions months later without knowing that ACLs exist.

The takeaway: before you start adding `setfacl` everywhere, it's worth asking if the problem can't be solved simply by adjusting the owner, group, and a well-thought-out `chmod`. ACLs are for specific cases where those truly aren't enough, not for everyday use.

## References

* `man acl`, `man getfacl`, `man setfacl` — official documentation for the commands and ACL format.
* [Debian Administrator's Handbook — Managing Rights](https://debian-handbook.info/browse/stable/sect.managing-rights.html) — reference on permissions and ACLs.
* [LINUXtips — Linux para Cloud Native](https://linuxtips.io/linux-para-cloud-native/) — course used as the basis for my studies and these notes, within the PICK track.
* [Guia Foca GNU/Linux](https://focalinux.cipsga.org.br/) — Portuguese reference on permissions and system administration.
