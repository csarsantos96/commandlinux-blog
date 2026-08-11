---
title: 'Understanding Linux Permissions: chmod, chown, and sudo in Practice'
description: >-
  Notes on Linux permissions: how to read `ls -l`, symbolic and octal chmod,
  `chown` to change owner and group, and how to securely configure sudo with
  `visudo`.
date: '2026-08-11'
category: LINUX
tags:
  - linux
  - permissoes
  - chmod
  - chown
  - sudo
  - sudoers
  - visudo
  - seguranca. vim
draft: false
language: en
translationOf: entendendo-permissoes-chmod-chown-sudo
sourceHash: 7e880c60586a57a05d56b8ce1e67be507ac92a579c209d294aebf2742aeed8a2
---
These are my notebook notes on Linux permissions, part of LINUXtips' **Linux for Cloud Native** course, within the PICK 2026 track. In the previous post, on [user administration](/posts/administrando-usuarios-no-linux), I had mentioned that the next stop would be groups and permissions. The time has come.

I've cleaned everything up here, including the stumbles I had practicing in the terminal, because writing solidifies content, and because one day this will be a quick reference when I can't remember a flag.

> The outputs presented are examples. Names, paths, and times may vary depending on the system.

# Reading the `ls -l` output

Before messing with permissions, I need to know how to read what's already there. The `ls -l` command shows everything:

```bash
ls -l /etc/hosts
```

Output:

```text
-rw-r--r-- 1 root root 221 Feb 16 10:30 /etc/hosts
```

Each part of this line tells a story:

* The first character is the file type. `-` for a regular file, `d` for a directory, `l` for a symbolic link, `c` for a character device, `b` for a block device, and `s` for a socket.
* The next nine characters are the permissions, divided into three groups of three: owner, group, and others. Each group has `r` (read), `w` (write), and `x` (execute).
* The number after the permissions is the count of hard links pointing to that inode.
* Next come the owner user and the owner group of the file.
* Then the size in bytes.
* Then the modification date.
* And finally the file name.

The detail I hadn't thought about before: the meaning of `x` changes depending on whether it's a file or a directory. In a file, `x` allows executing the file as a program. In a directory, `x` allows entering it (`cd`) and traversing the path, which is different from being able to list its contents (that's `r`).

# `chmod`: changing permissions

`chmod` (change mode) alters the permissions of a file or directory. There are two syntaxes: the symbolic, more readable, and the octal, faster to type.

## Symbolic syntax

The symbolic syntax combines a target letter (`u`, `g`, `o`, or `a`), an operator (`+` adds, `-` removes, `=` sets exactly), and the permission (`r`, `w`, `x`).

```bash
chmod u+x script.sh       # Dá execução ao dono
chmod g+rw arquivo.txt    # Dá leitura e escrita ao grupo
chmod o-rwx privado.conf  # Remove tudo dos outros
chmod a+r documento.txt   # Dá leitura a todos
```

The targets:

* `u` is user, the owner.
* `g` is group, the group.
* `o` is other, the others.
* `a` is all, all three at once.

## Octal syntax

The octal syntax is the math behind permissions. Each permission has a fixed numerical value:

```text
r = 4
w = 2
x = 1
```

By summing the values of the permissions I want, I get the digit that represents that combination:

```text
7 (4+2+1) = rwx : reads, writes, and executes. Full power
6 (4+2+0) = rw- : reads and writes, but does not execute
5 (4+0+1) = r-x : reads and executes, but does not write
4 (4+0+0) = r-- : read-only
0 (0+0+0) = --- : no permissions
```

`chmod` takes three octal digits, one for each target, always in the same order: owner, group, others.

```bash
chmod 755 script.sh
```

Here the owner gets `7` (rwx), the group gets `5` (r-x), and others get `5` (r-x). This is the default permission for an executable script: the owner does everything, the rest can read and execute, but no one other than the owner can modify the file.

```bash
chmod 644 config.txt
```

In this case, everyone can read, but only the owner can edit, and no one can execute.

## `chmod 400`, the SSH key case

A combination widely used by sysadmins, devs, and anyone who deals with SSH daily is:

```bash
chmod 400 id_rsa
```

Only the owner can read the SSH key; not even they can write to it. That's why this is the recommended permission for private SSH keys: if the group or others had any access, SSH wouldn't even allow the key to be used.

## Why avoid `777`

What I noted as a self-alert: never use `chmod 777`.

With `777`, any user on the system (including `nobody`, who usually runs web services) can read, write, and execute the file. This includes a potential attacker who has already gained a limited shell: with a `777` in front of them, they gain full control over that file, even if they entered through a small door.

# `chown`: changing owner and group

`chmod` changes what can be done with the file, but it doesn't change who the owner is. When the file belongs to the wrong person, or the wrong group, `chmod` alone doesn't solve it. That's where `chown` (change owner) comes in:

```bash
sudo chown deployer:devs /var/opt/projeto/
```

The syntax is `user:group`. This command changes the owner of the `project` directory to `deployer` and the group to `devs`, all at once.

If I want to change only the group, without touching the owner, I just omit the name before the colon:

```bash
sudo chown :devs /var/opt/projeto/
```

There's also `chgrp`, which performs exactly this second operation (changing only the group) in a dedicated way. It's worth not confusing it with `usermod`, which modifies the user's account itself (groups it belongs to, shell, home), and not the ownership of a file.

In practice, I use this command when I'm logged in as root and need to hand over a directory to another user. A real example from my notebook: I wanted the `deployer` user to own the deployment directory, and for their group to also control that path, knowing that the target directory (`project`) is inside `/var/opt`.

# `sudo`, `sudoers`, and `visudo`

The last part of the notes is about how a regular user gains permission to act as root, in a controlled manner.

## What `sudo` solves

`sudo` stands for superuser do. It's the mechanism that allows a regular user to execute commands as root, in a controlled and auditable way. Each execution via `sudo` is logged: who executed it, when, and which command. This solves a real problem: logging in directly as root doesn't leave this trail.

## Never edit `/etc/sudoers` directly

The configuration of who can use `sudo`, and with what powers, is in the `/etc/sudoers` file. And here's the warning I highlighted in big letters in my notebook: never edit this file with `vim` or `nano` directly.

If the syntax of `/etc/sudoers` breaks, `sudo` itself stops working on the system, for everyone. And since you can no longer use `sudo`, you also can't become root to fix the file yourself. It's the feeling of locking your house keys inside the car: the tool that would solve the problem got stuck along with the problem.

The safe way to edit is:

```bash
sudo visudo
```

`visudo` opens a temporary copy of `/etc/sudoers` (something like `/tmp/sudoers...`) in the default editor, but checks the syntax before truly saving. If something is wrong, it shows the problematic line and asks what to do, instead of simply saving. It never lets an invalid configuration pass through to the actual file.

## Granting sudo powers to a user

On Ubuntu, the simplest and safest way to grant `sudo` powers to a user is to add them to the `sudo` group, which already comes with the correct permission configured in `/etc/sudoers`:

```bash
sudo usermod -aG sudo deployer
```

From then on, `deployer` can run administrative commands preceded by `sudo`, but will still type their own password each time (with a default 15-minute cache between executions).

There is also another way to achieve the same result, by editing `/etc/sudoers` itself with `visudo` and adding a privilege specification line, just as it comes for `root`:

```text
# User privilege specification
root    ALL=(ALL:ALL) ALL
wine    ALL=(ALL:ALL) ALL
```

That's how I defined the `wine` user in my environment, directly via `visudo`. The effect is equivalent to `usermod -aG sudo`, but here the permission is explicitly declared for that user, line by line, instead of relying on the existing configuration for the `sudo` group.

## Sudo without a password, and why it's dangerous outside of automation

In CI/CD scenarios, like Jenkins, GitHub Actions, or Ansible, there isn't a human typing passwords. For this, `visudo` allows configuring a line like this:

```text
deployer ALL=(ALL) NOPASSWD: ALL
```

Each part of this line has a role:

* `deployer` is the user to whom the rule applies.
* The first `ALL` indicates on any host (relevant in environments with LDAP, where the same file applies to multiple machines).
* `(ALL)` means they can execute commands as any user, not just as root.
* `NOPASSWD` eliminates the need for a password.
* The last `ALL` indicates any command.

And here it's worth repeating the notebook's warning: this is dangerous. If someone compromises the `deployer` account, they have instant root access, without any second barrier. Use `NOPASSWD` only for service users in controlled environments, never for your personal daily work account.

# My experience practicing

The part about taking notes on the theory was smooth. The part about practicing in the terminal was where the real stumbles appeared, and that's where most of this truly sank in.

## The silly mistake that taught me about relative paths

I listed the contents of a directory and saw a folder called `dir2` there:

```text
drwxrwxr-x 3 wine dukebless 4.0K Aug 11 02:00 .
drwxr-x--- 3 wine dukebless 4.0K Aug 11 02:00 ..
drwxrwxr-x 3 wine dukebless 4.0K Aug 11 02:00 dir2
```

I then tried to change its permission:

```bash
chmod ug=rw dir2
```

```text
chmod: cannot access 'dir2': No such file or directory
```

At first, it seems like a nonsensical error, since `dir2` was right there in the listing. What happened was that the listing wasn't for the directory I was in at that moment, but rather one level above. `chmod`, like practically every file command in Linux, operates on the current directory, unless I specify a full path. If the target isn't exactly where I am, it simply doesn't exist from the command's perspective.

It was a direct and useful reminder: before running `chmod` or `chown`, it's worth checking with `pwd` and `ls` exactly where I am, or else using the full path, instead of relying visually on the last listing that appeared on the screen.

## The doubt about remembering everything

At some point during practice, frustration hit: the feeling that I know the content, but can't remember the right command at the exact moment I need it. I compared this to people who seem to memorize everything by heart, like which file configures what, and felt I was falling behind on that.

But by reconstructing the doubt out loud, something interesting happened: I remembered that there was a file related to `sudo`, associated it with `vim`, and remembered `visudo`, tested it, and arrived at `/etc/sudoers` on my own. This wasn't rote memorization. It was reasoning, pulling one thread from another.

And this is the key insight I want to keep here: those who seem to "know everything" usually haven't memorized anything; they've just built the habit of not needing to remember, because the system itself answers when you ask correctly. Some practical examples I use now instead of trying to keep everything in my head:

* `sudo visudo` already knows which file to open, so I don't need to remember the `/etc/sudoers` path.
* `chmod --help` and `chown --help` show the syntax immediately, without needing to guess a flag.
* `getent group group_name` shows who is in a group.
* `groups user` shows which groups a user belongs to.

The real skill isn't having the answer stored, it's knowing what question to ask the terminal.

## Testing `visudo` variations

During practice, I tried a few different ways to open the sudo configuration:

```bash
visudo
visudo /etc/sudoers
sudo visudo /etc/sudoers
sudo visudo
```

The first two failed due to lack of permission, as touching `sudoers` requires being root. The last two worked, and yielded exactly the same result. This showed, in practice, that providing the `/etc/sudoers` path after `visudo` is redundant: it already opens that file by default. The command worth sticking to is just:

```bash
sudo visudo
```

Two words. And the way I arrived at this conclusion, by testing variations and comparing the results, stuck in a way that no memorized command list would have.

# Summary

* View file owner, group, and permissions: `ls -l`
* Grant or remove symbolic permission: `chmod u+x`, `chmod g+rw`, `chmod o−rwx`, `chmod a+r`
* Set octal permission: `chmod 755`, `chmod 644`, `chmod 400`
* Change owner and group simultaneously: `chown user:group path`
* Change only the group: `chown :group path`
* Securely edit sudo configuration: `sudo visudo`
* Grant sudo powers to a user: `usermod −aG sudo user`
* Configure passwordless sudo for automation: `user ALL=(ALL) NOPASSWD: ALL` line in `sudoers`

# Conclusion

`chmod` and `chown` solve different questions: one defines what can be done with the file, the other defines who is responsible for it. The two together form the basis of any serious discussion about Linux security, long before getting to firewalls or encryption.

And `sudo` closes this cycle: instead of giving the master key (direct root login) to everyone, it allows granting power selectively, audibly, and, when well-configured, reversibly. `visudo` exists precisely so that a syntax error doesn't lead to an entire system locking up.

Regarding the practice itself, the biggest lesson wasn't any specific command. It was realizing that understanding the logic behind each piece is worth far more than trying to memorize the piece itself. I can always look up the command again. The reasoning behind why that command exists is what stays.

We spend a lot of time using commands like these daily without truly knowing what they are and what they do under the hood. Understanding what is really happening, instead of just repeating the command out of habit, makes all the difference.

## References

* `man chmod`, `man chown`, `man 5 sudoers`, `man visudo` — official documentation for the commands and file format.
* [Debian Administrator's Handbook — Managing Rights](https://debian-handbook.info/browse/stable/sect.managing-rights.html) — reference on permissions and `sudo`.
* [LINUXtips — Linux for Cloud Native](https://linuxtips.io/linux-para-cloud-native/) — course used as the basis for my studies and these notes, within the PICK track.
* [Foca GNU/Linux Guide](https://focalinux.cipsga.org.br/) — Portuguese reference on permissions, chmod, chown, and system administration.
