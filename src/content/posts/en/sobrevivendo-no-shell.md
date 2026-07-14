---
title: 'Shell Survival: From FHS to diff, the Linux you use every day'
description: >-
  Cleaned-up study notes: directory structure, permissions, file manipulation,
  wildcards, compression, links, processes, and log reading in the terminal.
date: '2026-07-14'
category: Linux
tags:
  - linux
  - cli
  - shell
  - fhs
  - sysadmin
draft: false
language: en
translationOf: sobrevivendo-no-shell
sourceHash: 131a7e2ca47cc0198417dbab7ea983c6386f2aaa1fbd9ae19658ba5246283abc
---
These are my notebook notes as I delve deep into Linux — part of the **Linux for Cloud Native** course from LINUXtips, within the PICK 2026 track. I've compiled them here because writing is the best way to solidify learning, and because one day this will become a quick reference when I can't remember a specific flag.

The post is long on purpose: it's a comprehensive map of what you type daily in the terminal, from `ls` to `diff`.



## First Steps

Two references that appear everywhere:

- `.` → reference for the current directory
- `..` → reference for the parent directory

```bash
ls -lha /bin/ls   # lista o arquivo ls, que está dentro de /bin
```

And direct kernel reading via `/proc`:

```bash
cd /proc
cat meminfo    # situação da memória RAM e swap
cat cpuinfo    # dados do processador
```

`cpuinfo` shows:

- CPU model
- number of logical cores / threads
- current or approximate maximum frequency
- architecture (`x86_64`, for example)
- cache
- supported flags and instructions — such as virtualization (`vmx` on Intel, `svm` on AMD), `sse`, `avx`



## In Linux, Everything is a File

It's not a slogan, it's literal:

- The hard drive is represented by a file in `/dev`
- The network card also appears as a device file
- Information about running processes is exposed in structures like `/proc`
- System configurations are text files
- Logs are also text files

That's why `cat`, `grep`, and redirection work on almost everything. You don't need an API to query memory — you just need to read a file.



## Directory Tree and FHS

In Linux, there is a **single root**: `/`. Everything stems from it. No matter how many disks, partitions, or devices you have — all will be mounted at some point within this tree. No `C:`, `D:`, `E:` drives.

This structure follows the **FHS** (*Filesystem Hierarchy Standard*) standard:

| Directory | What it is |
|---|---|
| `/` | The root of everything. The starting point of the entire tree |
| `/home` | User home directories. If your user is `devops`, it will be `/home/devops`. The `~` shortcut represents your home directory |
| `/etc` | Where system configurations are located: `/etc/ssh/sshd_config`, `/etc/hostname`, `/etc/passwd` |
| `/var` | Stores frequently changing data, such as in `/var/log` |
| `/tmp` | Temporary directories |
| `/usr` | Contains programs, libraries, and documentation installed by the system |
| `/bin` and `/sbin` | Store essential binaries. In modern distros, these usually point to directories within `/usr` |
| `/proc` and `/sys` | Are virtual filesystems generated in real-time by the kernel. They display information about processes, memory, CPU, drivers, and the kernel |
| `/dev` | Contains device files. Here also is the famous `/dev/null`, the Linux black hole |
| `/mnt` and `/media` | Mount points for external devices |
| `/opt` | Third-party software, installed outside the package manager |

> **FHS Detail:** The fact that `/bin` and `/sbin` are symlinks to `/usr` is a result of the *usr-merge*, adopted by most distros in the last decade. Run `ls -l /bin` on a recent Fedora or Ubuntu and you'll see the arrow.

---

## Reading `ls -l`

```bash
ls -l   # mostra detalhes: permissões, dono, tamanho, data etc.
```

A typical line:

```
drwxr-xr-x  4  root  root  4096  Abr 15 16:09  cache
│└┬┘└┬┘└┬┘  │   │     │     │       │            │
│ │  │  │   │   │     │     │       │            └─ nome
│ │  │  │   │   │     │     │       └────────────── data de modificação
│ │  │  │   │   │     │     └────────────────────── tamanho
│ │  │  │   │   │     └──────────────────────────── grupo
│ │  │  │   │   └────────────────────────────────── dono
│ │  │  │   └────────────────────────────────────── nº de links
│ │  │  └────────────────────────────────────────── permissões: outros
│ │  └───────────────────────────────────────────── permissões: grupo
│ └──────────────────────────────────────────────── permissões: dono
└────────────────────────────────────────────────── tipo
```

The first character is the **type**:

- `-` regular file
- `d` directory
- `l` symbolic link
- `c` / `b` character / block devices

The next nine are three `rwx` (*read*, *write*, *execute*) blocks for **owner**, **group**, and **others**.


## Directory Manipulation

### `ls` — list content

| Command | What it does |
|---|---|
| `ls -a` | Lists all files, including hidden ones (those starting with `.`) |
| `ls -l` | Provides details: permissions, owner, size, date |
| `ls -h` | Makes the size "human-readable": `1K`, `20M`, `2G` instead of a huge number |
| `ls -S` | Sorts by size |
| `ls -t` | Orders by modification date |
| `ls -F` | Adds a separator to identify types (`/` directory, `*` executable, `@` link) |
| `ls -i` | Shows the inode number |
| `ls -R` | Lists recursively |
| `ls --color=auto` | Uses colors to differentiate file types, but only when the output is displayed directly in the terminal |

The combination I use instinctively:

```bash
ls -lha    # detalhado + ocultos + tamanho legível
```

The `--color=auto` detail is more interesting than it seems: if you do `ls | grep something`, the output doesn't go to the terminal, it goes to the pipe — and `ls` automatically disables colors. That's why ANSI escape codes don't leak into your `grep`.

### `mkdir` — create directories

```bash
mkdir diretorio
mkdir -p gitopops/produtos/checkout   # cria todos os diretórios intermediários
```

The `-p` means **parents**: it creates the necessary "parent" directories in the path. Even if `gitopops` doesn't exist yet, it creates it first and then descends. Bonus: with `-p` the command won't fail if the directory already exists — which is why it appears in so many automation scripts.

### `rmdir` — remove empty directories

```bash
rmdir pasta_vazia
rmdir -p Pasta2/Pasta2_2   # remove Pasta2_2 e tenta remover os pais, se ficarem vazios
```

`rmdir` **only** removes empty directories. It's a protection, not a limitation.

### `cd`, `tree` and `touch`

- `cd` = *change directory*
- `tree` = shows the directory structure in a tree format
- `touch` = creates empty files (and updates the timestamp of existing files)


## File Manipulation

### `cp` — copying

Syntax: `cp [source] [destination]`

```bash
cp original.txt copia.txt               # copiando um arquivo
cp original.txt /tmp/                    # copiando um arquivo para um diretório
cp -r projetos/ /tmp/backup-projetos/    # copiando um diretório inteiro (obrigado usar -r)
```

| Flag | What it does |
|---|---|
| `-v` | Verbose: shows on screen what is being copied |
| `-r` / `-R` | Recursive — mandatory for directories |
| `-a` | Archive mode: preserves permissions, links, and timestamps |
| `-n` | Copies without overwriting what already exists |
| `-u` | Copies only if the source is newer than the destination |
| `-s` | Creates symbolic links instead of copying |

### `mv` — moving and renaming

In Linux, moving and renaming are **the same operation**:

```bash
mv relatorio.txt /tmp/                                          # move para outro diretório
mv relatorio.txt relatorio-final.txt                            # renomeia
mv /tmp/relatorio.txt /home/devops/documentos/relatorio-v2.txt  # move e renomeia de uma vez
```

### `rm` — removing

```bash
rm arquivo-inutil.txt      # remove um arquivo
rm -r pasta-antiga/        # remove um diretório e tudo dentro dele
rm -rf pasta/              # força a remoção, sem confirmação
```

The `-r` is **recursive**: it enters all subfolders and removes everything — files, subdirectories, files within subdirectories.

The `-f` is **force**: it doesn't ask for confirmation, doesn't complain if the file doesn't exist. It simply deletes everything silently.

> ⚠️ **Be extremely careful with `rm -rf`.** It doesn't ask for confirmation, there's no trash bin, and no undo. Before running with a glob (`*`), replace `rm` with `ls` and check exactly what would be deleted.


## Wildcards

What if you want to copy all `.log` files? Or delete all `.tmp` files? This is where **wildcards** come in — patterns that the *shell* expands into filenames before the command even runs.

### `*` — anything (zero or more characters)

```bash
ls /etc/*.conf              # todos os .conf em /etc
cp *.log /tmp/backup-logs/  # copia todos os .log do diretório atual
rm /tmp/*.tmp               # remove todos os .tmp de /tmp
```

The `*` is the most used. It replaces any sequence of characters:

- `*.log` means "anything that ends with `.log`"
- `backup-*` means "anything that starts with `backup-`"

### `?` — exactly one character

```bash
ls arq_?.txt     # arq_1.txt, arq_a.txt — mas não arq_10.txt
ls arq_??.txt    # arq_10.txt, arq_ab.txt
```

### `[ ]` — one character within a set or range

```bash
ls m[a-c]*       # arquivos que começam com m e cuja segunda letra vai de a até c
ls arq_[123].txt # arq_1.txt, arq_2.txt, arq_3.txt
```

### `which` — where is the binary?

```bash
which python3    # mostra o caminho do executável que o shell vai chamar
```


## Archiving and Compressing

```bash
# Criar
tar -czf gitopops.tar.gz projetos/
#      │││
#      ││└─ file: nome do arquivo
#      │└── compactar (gzip)
#      └─── criar

# Ver o conteúdo sem extrair
tar -tf gitopops.tar.gz

# Extrair
tar -xzf backup-projeto.tar.gz
```

Mnemonic rule: **c**reate, e**x**tract, lis**t** — always accompanied by `-f` (file). `-z` is gzip; use `-j` for bzip2 and `-J` for xz.


## Symbolic Links and Hard Links

### Symlink (soft link)

It's a **pointer to another file's path**. If the original file is moved or deleted, the link breaks.

```bash
# Criando um link simbólico
ln -s /etc/nginx/nginx.conf ~/nginx-config

# Verificando
ls -l ~/nginx-config
lrwxrwxrwx 1 devops devops 23 Feb 16 10:30 nginx-config -> /etc/nginx/nginx.conf
```

The `l` at the beginning indicates a symbolic link. The arrow shows where it points. When you do `vim ~/nginx-config`, you'll be editing the original file in `/etc/nginx/nginx.conf`.

### Hard link

Points **directly to the data on the disk** (the inode), not to the path. If the original file is renamed or moved within the same filesystem, the hard link continues to work. But it **cannot** point to a directory or cross different filesystems.

```bash
# Criando um hard link
ln /etc/hostname ~/hostname-link

# Ambos apontam para o mesmo inode
ls -li /etc/hostname ~/hostname-link
```

The `-i` from `ls` shows the inode number — if it's the same for both, it's the same physical file with two names.


## Viewing and Editing Text

### `cat` — straight to the point

`cat` (*concatenate*) dumps the entire content of a file to the terminal, all at once.

```bash
cat /etc/hostname
```

It's perfect for small files: a hostname, a public key, a configuration file with a few lines. But if you run `cat` on a 10,000-line file, the output will flood the terminal and you'll lose control of what you're reading. For that case, use `less`.

| Flag | What it does |
|---|---|
| `cat -n` | Numbers **all** lines |
| `cat -b` | Numbers only lines with text |
| `cat -E` | Shows `$` at the end of each line |
| `cat -T` | Shows TAB as `^I` |

```bash
cat -n /etc/ssh/sshd_config
```

This is invaluable when someone says "the error is on line 47" and you need to go straight to the point without manually counting lines.

The `-E` and `-T` flags are lifesavers when you're hunting for invisible whitespace or bizarre line endings in a config file.

**`cat` with multiple files:** if you pass more than one name, it concatenates (hence the name) the output:

```bash
cat /etc/hostname /etc/os-release
```

Shows the content of both files, one after the other. It seems simple, but it's the basis of many operations with redirection.

**Compressed cousins:**

| Command | What it does |
|---|---|
| `zcat` | Reads a `.gz` file without decompressing |
| `bzcat` | Reads a `.bz2` file without decompressing |
| `xzcat` | Reads an `.xz` file without decompressing |

**Reversing:**

```bash
tac arquivo.txt      # mostra o arquivo de baixo para cima
tac -s "," arquivo   # inverte usando um separador específico
```

### `echo` and redirection

```bash
echo "Texto" > arquivo.txt     # sobrescreve
echo "Texto" >> arquivo.txt    # anexa ao final
```

### `less` — controlled navigation

`less` opens the file in paged mode, without dumping everything on the screen at once. You navigate calmly:

```bash
less /var/log/syslog
```

The navigation commands within `less` are essential:

| Key | What it does |
|---|---|
| `/term` | Initiates a search |
| `n` | Advances to the next occurrence |
| `N` | Returns to the previous occurrence |
| `G` | Jumps to the end of the file |
| `g` | Returns to the beginning |
| `space` | Advances one full page |
| `b` | Moves back one full page |
| `q` | Exits |

`less` is the **default pager** for many commands. When you run `man ssh` to read the SSH manual, the content opens in `less`. The same shortcuts work inside it. Knowing how to navigate in `less` is knowing how to navigate all Linux documentation.

A powerful flag is `less +F`, which transforms `less` into *follow* mode — equivalent to `tail -f`, but with the advantage of being able to pause with `Ctrl+C`, navigate the file, and then resume the flow with `F`.

```bash
less +F /var/log/syslog
```

### `more`

Also pages, but without the ability to go back. `less` is strictly superior. (Yes, that's the joke: *less is more*.)


## `head` and `tail` — precise excerpts

`head` shows the first lines of a file (10 by default):

```bash
head /etc/passwd
```

`tail` shows the last ones:

```bash
tail /var/log/syslog
```

To specify how many lines you want to see, use the `-n` flag:

```bash
head -n 5 /etc/passwd
tail -n 50 /var/log/auth.log
```

`head` is great for quickly viewing the structure of a configuration file without loading it entirely. `tail`, on the other hand, is indispensable for logs, because the most recent information is always at the end.

### `tail -f` — the real-time log monitor

This is one of the commands we'll use most in our careers. `tail -f` (*follow*) doesn't just show the last lines: it **stays open** and displays new lines as they are written to the file.

```bash
tail -f /var/log/syslog
```

The terminal becomes a live log monitor. As long as `tail -f` is running, any service that writes to syslog appears instantly on the screen. This is how you investigate problems in real-time: open the log and observe what's happening while you reproduce the error.

Combining with `grep` filters only what you're interested in:

```bash
tail -f /var/log/auth.log | grep "Failed password"
```

Now you only see failed login attempts, in real-time. Perfect for detecting brute-force attacks on SSH, for example.

The `|` (pipe) takes the output of one command and feeds it as input to the next. To exit `tail -f`, press `Ctrl+C`.


## `wc` — counting lines, words, and bytes

`wc` (*word count*) is a simple command that answers quick questions about a file's content:

```bash
wc /var/log/syslog
```

The output shows three numbers: total lines, total words, and total bytes. Most of the time, you just want the line count:

```bash
wc -l /var/log/syslog
```

This answers questions like "how many lines does this log have?", "is this configuration file large?", "how many entries are there in `/etc/passwd`?" (each line = one user).

It seems trivial, but it's one of the most used commands in scripts and pipelines:

```bash
grep -c "ERROR" app.log          # conta ocorrências direto
ps aux | grep nginx | wc -l      # quantos processos nginx estão rodando
```


## `diff` — comparing files

`diff` compares two files and shows exactly what changed between them:

```bash
diff /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
```

Lines starting with `<` exist only in the first file. Those starting with `>` exist only in the second.

When you back up a file before editing it (and you always should), `diff` shows exactly what we changed.

A more visual version is `diff -u` (*unified format*), which shows the differences with context, in the same format that Git uses:

```bash
diff -u original.conf modificado.conf
```

Lines with `-` were removed and those with `+` were added. Anyone who has used `git diff` will immediately recognize the format — because it's literally the same.


## `grep`, `sort`, and friends

- `grep` — searches for text within files or in the output of another command
- `sort` — sorts the list
- `ln` — creates links (seen above)
- `mount` — connects a disk, partition, USB drive, ISO, or filesystem to a Linux folder
- `id` — shows current user information: group and permissions



## Date and Time

```bash
date                        # mostra a data
sudo date -s "..."          # configura a data
date -u                     # mostra o horário UTC
date +%d/%m/%Y              # muda o formato de exibição
date +%d-%m-%y
```


## `df` — disk space

| Command | What it does |
|---|---|
| `df` | Shows free space on each mounted partition in the operating system |
| `df -H` | Human-readable format, using base 1000 |
| `df -h` | Human-readable format, using base 1024 |
| `df -m` | Shows everything in megabytes |
| `df -l` | Shows only local filesystems |
| `df -i` | Shows **inode** usage of the filesystem |
| `df -T` | Shows disk usage including the filesystem type |
| `df -Th` | Human-readable format **and** FS type — the most useful for daily use |

### What is an inode?

An inode is an internal **"file record"** that Linux uses to control files and directories. Each file uses 1 inode.

That's why `df -i` is important: it shows whether the system still has the capacity to create new files and directories — not just if it has free GBs. You can have 200 GBs remaining and still get `No space left on device` because the inodes ran out. It's a classic on servers full of small files, like session caches.



## Process Management and Execution

```bash
ps                  # mostra os processos rodando no terminal atual
ps -a               # todos os processos em execução em outros terminais do meu usuário
ps aux              # todos os processos do sistema, formato completo
ps aux | grep nginx # filtra por um processo específico
```

### The `/proc` filesystem

The `/proc` filesystem is a **virtual filesystem**. It's not a regular folder on the disk.

It displays information about the kernel, processes, memory, CPU, network, etc. It's like a diagnostic dashboard for Linux — each running process has a `/proc/<PID>` directory with everything about it.

Tools like `ps` and `top` have no magic: they just read `/proc` and format the output.



## Wrapping up

Nothing here is exotic, and that's precisely the point: these are the commands you type a hundred times a day without thinking — until the day you need a specific flag and can't remember it.

If I had to choose the five commands that most changed my daily routine from the list above, they would be: `tail -f | grep` (real-time investigation), `less` (navigation in any documentation), `diff -u` (before any production change), `df -Th` (the first command when something breaks), and `ls -lha` (pure instinct).

I'll keep this page open as a reference, and I suggest you create your own.

**Next notes:** permissions (`chmod`, `chown`, `umask`), package management, and systemd.



## References

- [Filesystem Hierarchy Standard (FHS 3.0)](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html) — the official specification maintained by the Linux Foundation. It is the canonical source for the directory structure.
- [The Linux Kernel Documentation — `/proc` filesystem](https://docs.kernel.org/filesystems/proc.html) — official kernel documentation on `/proc`.
- [GNU Coreutils Manual](https://www.gnu.org/software/coreutils/manual/coreutils.html) — the official manual for practically all the commands mentioned here (`ls`, `cp`, `mv`, `rm`, `cat`, `head`, `tail`, `wc`, `df`, `sort`).
- [LINUXtips — Linux for Cloud Native](https://www.linuxtips.io/) — the course that originated these notes, within the PICK track.
- And, of course: `man <command>`. The best documentation is already installed on your machine.
