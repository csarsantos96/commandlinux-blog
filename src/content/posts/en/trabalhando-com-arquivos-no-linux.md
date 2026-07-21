---
title: 'Working with Files in Linux: Hard Links, Viewing, Logs, and Comparison'
description: >-
  Learn to create hard links and use cat, less, head, tail, grep, wc, and diff
  to view, follow, and compare files directly from the terminal.
date: '2026-07-10'
category: LINUX
tags:
  - linux
  - terminal
  - arquivos
  - hard-links
  - cat
  - less
  - head
  - tail
  - grep
  - wc
  - diff
draft: false
language: en
translationOf: trabalhando-com-arquivos-no-linux
sourceHash: 3bb0f2497b63646a3053a631f84c3ca1174ffd18f41644fba93a5b87a1668c0f
---
Working with Linux means constantly dealing with files: configuration files, logs, system information, and application outputs.

While it's possible to open these files in a text editor, often we just want to quickly answer questions like:

- What is the content of this file?
- How many lines does it have?
- What were the last messages logged?
- What changed between two versions?
- How to follow a log in real-time?

For each of these situations, there's an appropriate command. In this post, we'll see how to use `ln`, `cat`, `less`, `head`, `tail`, `grep`, `wc`, and `diff`.

> The outputs presented are examples. User names, dates, permissions, and messages may vary depending on the system.

# Creating Hard Links with `ln`

Before viewing files, it's worth understanding how Linux relates their names to the content stored on disk.

Internally, a file has a structure called an **inode**. The inode stores information like permissions, owner, size, and data location.

The file name acts as a reference to this inode.

A **hard link** creates another name pointing to the same inode as the original file.

Consider we have the file:

```text
servidor.conf
```

To create a hard link:

```bash
ln servidor.conf servidor-hardlink.conf
```

Output:

```text
No output is displayed when the command is executed successfully.
```

Now there are two names pointing to the same content.

We can verify this using `ls` with the `-l` and `-i` options:

```bash
ls -li servidor.conf servidor-hardlink.conf
```

Output:

```text
184233 -rw-r--r-- 2 cesar cesar 28 jul 10 09:40 servidor.conf
184233 -rw-r--r-- 2 cesar cesar 28 jul 10 09:40 servidor-hardlink.conf
```

The first number displayed is the inode:

```text
184233
```

Since both files have the same inode, they represent the same content stored on disk.

The number `2`, after the permissions, represents the quantity of hard links pointing to that inode.

If we change the content using any of the names, the change will be visible through the other.

```bash
echo "porta=8080" >> servidor-hardlink.conf
```

Output:

```text
No output is displayed.
```

When viewing the original file:

```bash
cat servidor.conf
```

Output:

```text
porta=8080
```

This happens because there aren't two independent copies. There are two names pointing to the same inode.

## Hard Link vs. Symbolic Link

A symbolic link works differently. It creates a special file that stores the path to another file.

To create a symbolic link:

```bash
ln -s servidor.conf servidor-simbolico.conf
```

Output:

```text
No output is displayed.
```

Comparing the three files:

```bash
ls -li servidor.conf servidor-hardlink.conf servidor-simbolico.conf
```

Output:

```text
184233 -rw-r--r-- 2 cesar cesar 28 jul 10 09:40 servidor.conf
184233 -rw-r--r-- 2 cesar cesar 28 jul 10 09:40 servidor-hardlink.conf
184240 lrwxrwxrwx 1 cesar cesar 13 jul 10 09:42 servidor-simbolico.conf -> servidor.conf
```

The symbolic link has a different inode and starts with the letter `l` in the permissions:

```text
lrwxrwxrwx
```

Furthermore, `ls` shows where it points:

```text
servidor-simbolico.conf -> servidor.conf
```

Hard links have some important limitations:

- They must be on the same file system.
- They usually cannot be created for directories.
- They continue to function even if one of the names is removed.
- The data is only removed when the last hard link ceases to exist.

# `cat`: Direct Viewing

The `cat` command, short for **concatenate**, shows the full content of a file directly in the terminal.

```bash
cat /etc/hostname
```

Output:

```text
meu-servidor
```

It's ideal for small files, such as:

- Computer name;
- Public keys;
- Small configuration files;
- Files with few lines.

However, we should be careful with large files. Running `cat` on a file with thousands of lines can flood the terminal and make reading difficult.

## Numbering Lines with `cat -n`

The `-n` option adds the number to each line.

```bash
cat -n /etc/hosts
```

Output:

```text
     1  127.0.0.1   localhost localhost.localdomain
     2  ::1         localhost localhost.localdomain
     3  192.168.1.20 servidor-lab
```

This is extremely useful when someone reports an error on a specific line:

```text
The problem is on line 47.
```

Instead of counting manually, we can easily locate the line.

```bash
cat -n arquivo.conf
```

Output:

```text
    45  workers=4
    46  timeout=30
    47  porta=abc
    48  debug=false
```

In this example, we can quickly notice that the port value on line 47 is incorrect.

## Showing Multiple Files

`cat` can also take multiple files as arguments.

```bash
cat /etc/hostname /etc/os-release
```

Output:

```text
meu-servidor
NAME="Fedora Linux"
ID=fedora
PRETTY_NAME="Fedora Linux"
```

The content is presented in the same order as the files were provided.

This works well for small files, but it's not the best option when we need to navigate the content carefully.

# `less`: Controlled Navigation

The `less` command opens the file in a paginated mode. Instead of dumping everything to the terminal, it allows you to navigate through the content.

```bash
less /etc/passwd
```

Output displayed within the pager:

```text
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/usr/sbin/nologin
daemon:x:2:2:daemon:/sbin:/usr/sbin/nologin
adm:x:3:4:adm:/var/adm:/usr/sbin/nologin
...
/etc/passwd
```

`less` is especially useful for:

- Large files;
- Logs;
- Configuration files;
- Extensive outputs from other commands;
- Manual pages.

## Navigating within `less`

| Key | Action |
|---|
| `/texto` | Searches for text |
| `n` | Goes to the next occurrence |
| `N` | Goes back to the previous occurrence |
| `g` | Goes to the beginning of the file |
| `G` | Goes to the end of the file |
| `Espaço` | Advances one page |
| `b` | Goes back one page |
| Arrows | Navigates line by line |
| `q` | Exits `less` |

To search for the word `root`, for example, press:

```text
/root
```

Then press `Enter`.

To navigate to the next result:

```text
n
```

To go back to the previous result:

```text
N
```

`less` is also used internally by several other commands. When executing:

```bash
man ssh
```

The documentation will normally open within `less` itself.

Knowing how to navigate in `less` also means knowing how to better navigate Linux documentation.

# `less +F`: Following Files in Real-time

The `+F` option puts `less` in follow mode.

```bash
less +F /var/log/messages
```

Example output:

```text
Jul 10 09:51:08 servidor systemd[1]: Started Network Manager.
Jul 10 09:51:10 servidor kernel: Network interface initialized.
Jul 10 09:51:13 servidor sshd[2143]: Server listening on port 22.
Waiting for data... (interrupt to abort)
```

Whenever a new line is added to the file, it will appear automatically.

This mode has an advantage over `tail -f`: we can temporarily stop following by pressing:

```text
Ctrl + C
```

After that, we can navigate the file normally.

To return to follow mode, just press:

```text
F
```

# `head`: Showing the Beginning of the File

The `head` command displays the first lines of a file.

By default, it shows the first ten lines.

```bash
head /etc/passwd
```

Output:

```text
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/usr/sbin/nologin
daemon:x:2:2:daemon:/sbin:/usr/sbin/nologin
adm:x:3:4:adm:/var/adm:/usr/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/usr/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown
halt:x:7:0:halt:/sbin:/sbin/halt
mail:x:8:12:mail:/var/spool/mail:/usr/sbin/nologin
operator:x:11:0:operator:/root:/usr/sbin/nologin
```

To choose how many lines to show, we use `-n`.

```bash
head -n 5 /etc/passwd
```

Output:

```text
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/usr/sbin/nologin
daemon:x:2:2:daemon:/sbin:/usr/sbin/nologin
adm:x:3:4:adm:/var/adm:/usr/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/usr/sbin/nologin
```

`head` is great for quickly checking the initial structure of a file without loading its entire content.

# `tail`: Showing the End of the File

The `tail` command does the opposite of `head`: it shows the last lines.

```bash
tail /var/log/messages
```

Output:

```text
Jul 10 09:55:01 servidor systemd[1]: Started Session 18 of User cesar.
Jul 10 09:55:02 servidor NetworkManager[910]: Network connection activated.
Jul 10 09:55:05 servidor sshd[2201]: Accepted publickey for cesar.
Jul 10 09:55:05 servidor systemd-logind[842]: New session 18 of user cesar.
Jul 10 09:55:09 servidor systemd[1]: Started User Manager for UID 1000.
```

Just like `head`, `tail` shows ten lines by default.

To define a different quantity:

```bash
tail -n 3 /var/log/messages
```

Output:

```text
Jul 10 09:55:05 servidor sshd[2201]: Accepted publickey for cesar.
Jul 10 09:55:05 servidor systemd-logind[842]: New session 18 of user cesar.
Jul 10 09:55:09 servidor systemd[1]: Started User Manager for UID 1000.
```

`tail` is indispensable for working with logs, as the most recent information is usually at the end of the file.

# `tail -f`: Monitoring Logs in Real-time

The `-f` option, short for **follow**, keeps the command open, waiting for new lines.

```bash
tail -f /var/log/messages
```

Output:

```text
Jul 10 10:01:02 servidor systemd[1]: Started Application Service.
Jul 10 10:01:08 servidor app[2451]: Application initialized.
Jul 10 10:01:12 servidor app[2451]: Connection established.
```

If any service logs a new message, it will appear instantly:

```text
Jul 10 10:01:17 servidor app[2451]: Request received from 192.168.1.10.
Jul 10 10:01:18 servidor app[2451]: Request completed successfully.
```

To stop following:

```text
Ctrl + C
```

This command is widely used during problem investigations. We can reproduce an error while observing exactly what is being logged.

## Log Locations

File locations may vary depending on the distribution.

On Fedora, RHEL, and derivative systems, it's common to find:

```text
/var/log/messages
/var/log/secure
```

On Debian, Ubuntu, and derivative systems, it's common to find:

```text
/var/log/syslog
/var/log/auth.log
```

Some systems store most records in `systemd`'s journal. In this case, we can follow messages with:

```bash
journalctl -f
```

Output:

```text
jul 10 10:04:12 servidor systemd[1]: Starting Application Service...
jul 10 10:04:13 servidor systemd[1]: Started Application Service.
jul 10 10:04:13 servidor app[2604]: Application ready.
```

# Combining `tail` with `grep`

A log can receive dozens or hundreds of messages per second. To show only the lines that interest us, we can combine `tail` and `grep`.

On Fedora or RHEL:

```bash
tail -f /var/log/secure | grep "Failed password"
```

On Debian or Ubuntu:

```bash
tail -f /var/log/auth.log | grep "Failed password"
```

Output:

```text
Jul 10 10:08:21 servidor sshd[2740]: Failed password for invalid user admin from 203.0.113.25 port 51514 ssh2
Jul 10 10:08:29 servidor sshd[2740]: Failed password for root from 203.0.113.25 port 51520 ssh2
```

The `|` character is called a **pipe**.

It takes the output of the left command:

```bash
tail -f /var/log/secure
```

And uses that output as input for the right command:

```bash
grep "Failed password"
```

Thus, the terminal only shows failed login attempts. The noise goes away, and what truly matters remains — almost a silent mode for chatty logs.

# `wc`: Counting Lines, Words, and Bytes

The `wc` command, short for **word count**, provides information about a file's content.

Consider a file named `app.log` with the following content:

```text
INFO servidor iniciado
ERROR login falhou
INFO nova tentativa
```

Executing:

```bash
wc app.log
```

Output:

```text
3 9 61 app.log
```

The three values represent, respectively:

```text
lines words bytes file
```

Therefore, the file has:

- 3 lines;
- 9 words;
- 61 bytes.

## Counting Only Lines

Most of the time, we only want to know how many lines exist.

For this, we use `-l`:

```bash
wc -l app.log
```

Output:

```text
3 app.log
```

Other useful options:

| Option | Information |
|---|
| `-l` | Number of lines |
| `-w` | Number of words |
| `-c` | Number of bytes |
| `-m` | Number of characters |

To count only words:

```bash
wc -w app.log
```

Output:

```text
9 app.log
```

To count bytes:

```bash
wc -c app.log
```

Output:

```text
61 app.log
```

`wc` quickly answers questions like:

- How many lines are in this log?
- What is the textual size of this file?
- How many entries are in this list?
- How many lines does this configuration file have?

# `diff`: Comparing Files

The `diff` command compares two files and shows exactly what changed between them.

Consider the `original.conf` file:

```text
porta=8080
debug=false
workers=2
```

And the `modificado.conf` file:

```text
porta=9090
debug=true
workers=2
```

To compare:

```bash
diff original.conf modificado.conf
```

Output:

```text
1,2c1,2
< porta=8080
< debug=false
---
> porta=9090
> debug=true
```

Lines starting with `<` exist in the first file:

```text
< porta=8080
< debug=false
```

Lines starting with `>` exist in the second file:

```text
> porta=9090
> debug=true
```

The segment:

```text
1,2c1,2
```

indicates that lines 1 and 2 of the first file were changed to lines 1 and 2 of the second.

When files are identical, `diff` displays no output.

```bash
diff original.conf copia-original.conf
```

Output:

```text
No output means the files are identical.
```

# `diff -u`: Unified Format

A more visual way to use the command is with the `-u` option, which activates the unified format.

```bash
diff -u original.conf modificado.conf
```

Output:

```diff
--- original.conf	2026-07-10 10:15:00
+++ modificado.conf	2026-07-10 10:18:00
@@ -1,3 +1,3 @@
-porta=8080
-debug=false
+porta=9090
+debug=true
 workers=2
```

In this format:

- Lines starting with `-` were removed;
- Lines starting with `+` were added;
- Lines without these symbols are used as context.

Anyone who has used:

```bash
git diff
```

will probably immediately recognize this format.

# Backing Up Before Editing

Before modifying an important file, it's good practice to create a copy.

```bash
cp original.conf original.conf.bak
```

Output:

```text
No output is displayed when the copy is successful.
```

After editing the file, we can compare the current version with the backup:

```bash
diff -u original.conf.bak original.conf
```

Output:

```diff
--- original.conf.bak	2026-07-10 10:20:00
+++ original.conf	2026-07-10 10:25:00
@@ -1,3 +1,3 @@
-porta=8080
+porta=9090
 debug=false
 workers=2
```

This practice is especially useful before changing files like:

```text
/etc/ssh/sshd_config
/etc/fstab
/etc/hosts
```

Thus, if any configuration presents problems, we can identify exactly what was changed.

# Which Command to Use?

| Situation | Command |
|---|
| Create another name for the same inode | `ln` |
| Create a symbolic link | `ln -s` |
| Show a small file | `cat` |
| Show line numbers | `cat -n` |
| Navigate a large file | `less` |
| Show the first lines | `head` |
| Show the last lines | `tail` |
| Follow a file in real-time | `tail -f` |
| Follow systemd logs | `journalctl -f` |
| Filter specific lines | `grep` |
| Count lines, words, or bytes | `wc` |
| Compare two files | `diff` |
| Compare in a Git-like format | `diff -u` |

# Conclusion

The commands presented solve most daily tasks involving files in Linux.

`cat` allows quick viewing of small files, while `less` offers controlled navigation for larger content. `head` and `tail` help inspect specific parts, and `tail -f` turns the terminal into a real-time log monitor.

When we need to filter information, `grep` can be combined with other commands via pipes. `wc` quickly answers how many lines, words, or bytes are in a file.

Finally, `diff` allows comparing versions and discovering exactly what was changed, which is essential when working with configuration files.

Mastering these commands doesn't just mean memorizing options. It means learning to investigate the system, find information, and understand what's happening without relying on a graphical interface.

## References

- [GNU Coreutils Manual](https://www.gnu.org/software/coreutils/manual/coreutils.html) — documents commands like `ln`, `cat`, `head`, `tail`, and `wc`.
- [GNU Grep Manual](https://www.gnu.org/software/grep/manual/grep.html) — documents text searching and filtering with `grep`.
- [GNU Diffutils Manual](https://www.gnu.org/software/diffutils/manual/diffutils.html) — documents file comparison with `diff`.
- [LINUXtips — Linux for Cloud Native](https://linuxtips.io/linux-para-cloud-native/) — course used as the basis for my studies and these notes on Linux.
