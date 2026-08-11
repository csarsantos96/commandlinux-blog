---
title: 'umask, /etc/login.defs and special permissions: SUID, SGID and sticky bit'
description: >-
  Notes on umask, the /etc/login.defs file, and special permissions SUID, SGID,
  and sticky bit in Linux, with practical chmod examples.
date: '2026-08-11'
category: LINUX
tags:
  - linux
  - permissoes
  - umask
  - suid
  - sgid
  - stickybit
  - logindefs
draft: false
language: en
translationOf: permissoes-especiais-umask-suid-sgid-sticky-bit
sourceHash: 5ece2e5fb1086ff3bada0eec53d264a55dbc3e447df05a112765ee6be8e2820c
---
Continuing the notes on [Linux permissions](/posts/entendendo-permissoes-chmod-chown-sudo), part of the **Linux for Cloud Native** course by LINUXtips, within the PICK 2026 track, it's time to understand what happens before `chmod` comes into play: who decides the initial permission of a newly created file. And then, it's the turn of special permissions: `SUID`, `SGID`, and sticky bit.

> The outputs shown are examples. Names, paths, and times may vary depending on the system.

# `umask`: who defines the initial permissions

`umask` (user file creation mode mask) is a Unix/Linux system setting that defines which permissions are removed from newly created files and directories.

When a file is created, the system starts with a default permission, `666` for files and `777` for directories, and subtracts the `umask` mask from that value.

```text
File: 666 minus umask
Directory: 777 minus umask
```

For user `theduke`, for example, the configured `umask` is `022`. Therefore, every file created starts with `644` (`rw−r−−r−−`) and every directory created starts with `755` (`rwxr−xr−x`).

`umask` works with the same octal logic as `chmod`, but in reverse. With `chmod` I define what I want to grant. With `umask` I define what I want to remove.

* `chmod`: final, direct permission.
* `umask`: base (`666` or `777`) minus the mask.

The most important difference between the two: `umask` only affects files created from that point onwards, while `chmod` modifies an existing file.

Some examples of masks and their practical results on files:

* `umask 077` produces files `600` (`rw−−−−−−−`), access only for the owner.
* `umask 022` produces files `644` (`rw−r−−r−−`), the owner writes and the rest only reads.
* `umask 002` produces files `664` (`rw−rw−r−−`), owner and group write.

# `/etc/login.defs`: the system default

Each user can have their own `umask`, whether defined in `~/.bashrc` or another profile file, so these configurations remain independent. But when I want to change the default that applies to everyone, `umask` alone doesn't solve it, because it only defines the behavior of permission creation, not where this rule is recorded by default.

The file that defines the system's default for creation is `/etc/login.defs`:`

```bash
sudo vim /etc/login.defs
```

Some of the things you can configure there:

* `UMASK`: the system's default `umask`.
* `PASS_MAX_DAYS`: how many days until the password expires.
* `PASS_MIN_DAYS`: minimum time before the password can be changed again.
* `PASS_WARN_AGE`: how many days in advance the system warns that the password will expire.
* `UID_MIN` and `UID_MAX`: range of UID numbers that the system reserves to automatically assign to regular users when creating an account (there is an equivalent pair, `GID_MIN` and `GID_MAX`, for groups).
* `CREATE_HOME`: whether to automatically create the home folder when creating a new user.

It's worth remembering that this is the system's default configuration. If I want a different `umask` only for a specific user, without affecting anyone else, the right place is that user's `~/.bashrc`.

# Special Permissions

In addition to read, write, and execute for owner, group, and others, Linux has three special permissions: `SUID`, `SGID`, and sticky bit. All three follow the same octal logic as `chmod`, but with an extra digit in front of the usual three.

```text
bit    octal   where it appears in the symbol
SUID   4       s in place of the owner's x
SGID   2       s in place of the group's x
Sticky 1       t in place of the others' x
```

## `SUID`, the SetUID

`SUID` only makes sense for executable files. A classic example is `passwd` itself, the program that changes a user's password on the system:

```bash
whereis passwd
```

`whereis` shows the path where `passwd` is located. Looking at this path in more detail:

```bash
ls -lha /usr/bin/passwd
```

```text
-rwsr-xr-x 1 root root 140K Aug 11 2026 /usr/bin/passwd
```

This `s` in place of the owner's `x` means that this program has `SUID` enabled. When it is executed by any user, it runs as if it were `root`, even if the caller is a regular user. This is how a user without any privileges can change their own password, a file that only `root` would have permission to modify directly.

The octal value for `SUID` is `4`. To enable:

```bash
chmod 4755 programa
```

The `4` is `SUID`. Combined with `755`, the owner receives `rwx` plus `SUID`, the group receives `r−x`, and others receive `r−x`.

And here's the alert highlighted in the notebook: if an attacker manages to place a malicious script with `SUID` belonging to `root`, they gain full `root` access as soon as someone executes that script. Therefore, never put `SUID` on arbitrary scripts. It's an enormous responsibility, and that's why `SUID` should be restricted to trusted and audited binaries, like `passwd` itself.

## `SGID`, the SetGID

```bash
chmod 2755 pasta/
```

This enables `SGID` on the folder. Checking the result:

```bash
ls -lha pasta
```

```text
drwxr-sr-x 2 wine dukebless 4.0K Aug 11 2026 folder
```

The `s` appears in place of the group's `x`. The `2` is `SGID`.

Its effect on a directory: files and subfolders created within that directory inherit the directory's group, not the primary group of the user who created the file. It is widely used in folders shared by a team, where everyone needs to remain in the same group, regardless of who created each file.

## Sticky bit

```bash
chmod 1777 pasta/
```

This enables the sticky bit on the directory. The `1` is the sticky bit.

Its effect: even if everyone can write to the folder, each user can only delete or rename their own files. No one can delete another person's file, only the file owner, the folder owner, or `root`.

The classic example is `/tmp`:`

```text
drwxrwxrwt 10 root root 4.0K Aug 11 2026 /tmp
```

Everyone writes there, but one user cannot delete another's file.

The sticky bit can also be enabled symbolically:

```bash
chmod +t pasta/
```

And there's a subtle difference in the final symbol, depending on who else has execute permission in that directory:

* `t` lowercase: sticky bit enabled, and others still have execute permission (`x`).
* `T` uppercase: sticky bit enabled, but without the others' `x`.

# Summary

* See the default permission for newly created files and directories: `umask`
* Calculate the result: `666` minus `umask` for files, `777` minus `umask` for directories
* Configure the system-wide default: `sudo vim /etc/login.defs`
* Configure the default for a single user: `umask` in `~/.bashrc`
* Enable `SUID` on an executable: `chmod 4755 program`
* Enable `SGID` on a folder: `chmod 2755 folder/`
* Enable sticky bit on a folder: `chmod 1777 folder/` or `chmod +t folder/`

# Conclusion

`umask` fills a gap I hadn't noticed before: `chmod` explains how to change the permission of an existing file, but someone decides what its permission is at the exact moment it's created, and that someone is `umask`. Understanding that it works by subtraction, unlike `chmod`, which works by granting, is what made the logic truly click.

Special permissions are the part that demands the most responsibility. `SUID` and `SGID` allow a program or directory to behave as if it were another user or group, which solves legitimate problems, like `passwd`, but is also exactly the type of configuration an attacker looks for to escalate privilege. The sticky bit is the opposite of this, a protective lock, the reason why `/tmp` is shared by everyone without becoming a risk of any user deleting another's file.

We spend a lot of time using commands like these in everyday life without really knowing what they are and what they do under the hood. Understanding what's truly happening, instead of just repeating the command out of habit, makes all the difference.

## References

* `man chmod`, `man login.defs` — official documentation for the commands and configuration file.
* [Debian Administrator's Handbook — Managing Rights](https://debian-handbook.info/browse/stable/sect.managing-rights.html) — reference on special permissions.
* [LINUXtips — Linux para Cloud Native](https://linuxtips.io/linux-para-cloud-native/) — course used as the basis for my studies and these notes, within the PICK track.
* [Guia Foca GNU/Linux](https://focalinux.cipsga.org.br/) — Portuguese reference on permissions, umask, and system administration.
