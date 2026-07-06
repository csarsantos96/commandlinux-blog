---
title: Hardlinks vs symlinks - o que o inode revela
description: A diferença real entre hard links e links simbólicos no Linux, explicada a partir de inodes, com exemplos práticos e pegadinhas comuns.
date: 2026-07-06
category: LINUX
tags: [inode, filesystem, ln, hardlink, symlink]
---

Para entender links no Linux, primeiro é preciso desfazer uma ideia errada: **um arquivo não é o nome dele**. O nome é só uma entrada em um diretório apontando para um inode — e o inode é quem realmente guarda o arquivo: permissões, dono, timestamps, tamanho e os ponteiros para os blocos de dados no disco.

Quando você entende isso, hardlink e symlink deixam de ser decoreba.

## O inode é o arquivo de verdade

Veja o número do inode de qualquer arquivo:

```bash
touch original.txt
ls -li original.txt
# 1834027 -rw-r--r-- 1 cesar cesar 0 jul  6 10:00 original.txt
```

Esse `1834027` é o inode. O nome `original.txt` é apenas um apelido registrado no diretório atual apontando para ele. E aquele `1` depois das permissões? É o **contador de links**: quantos nomes apontam para esse inode.

## Hardlink: dois nomes, um único arquivo

```bash
ln original.txt copia.txt
ls -li
# 1834027 -rw-r--r-- 2 cesar cesar 0 jul  6 10:00 copia.txt
# 1834027 -rw-r--r-- 2 cesar cesar 0 jul  6 10:00 original.txt
```

Repare: **mesmo inode**, e o contador subiu para `2`. Não existe "original" e "cópia" — são dois nomes com exatamente o mesmo status apontando para o mesmo conteúdo. Escreveu por um, o outro reflete na hora. Ocupam espaço de um arquivo só.

E a parte que derruba gente em entrevista:

```bash
rm original.txt
cat copia.txt   # continua funcionando perfeitamente
```

O `rm` não apaga arquivos — ele remove **nomes** (a syscall se chama `unlink`, não à toa). Os dados só são liberados quando o contador de links chega a zero *e* nenhum processo mantém o arquivo aberto. É por isso que um log gigante deletado pode continuar enchendo o disco até o processo que o mantém aberto ser reiniciado.

Limitações do hardlink:

- Não pode apontar para diretórios (evitaria loops no filesystem)
- Não atravessa filesystems — inodes são únicos **por filesystem**, então não dá para criar hardlink de `/home` para algo em `/mnt/backup` se forem partições diferentes

## Symlink: um arquivo que contém um caminho

```bash
ln -s original.txt atalho.txt
ls -li
# 1834099 lrwxrwxrwx 1 cesar cesar 12 jul  6 10:05 atalho.txt -> original.txt
# 1834027 -rw-r--r-- 1 cesar cesar  0 jul  6 10:00 original.txt
```

Tudo diferente: **outro inode**, tipo `l`, e o tamanho (12 bytes) é literalmente o comprimento da string `original.txt`. Um symlink é um arquivinho especial cujo conteúdo é um caminho. O kernel resolve esse caminho a cada acesso.

Consequência direta: se o alvo some, o symlink quebra.

```bash
rm original.txt
cat atalho.txt
# cat: atalho.txt: No such file or directory
```

Em troca dessa fragilidade, o symlink faz o que o hardlink não pode: aponta para diretórios e atravessa filesystems.

> Pegadinha clássica: symlinks relativos são resolvidos **a partir do diretório onde o link está**, não de onde você executa o comando. Ao criar links dentro de scripts, prefira `ln -s "$(realpath alvo)" link` ou tenha certeza do caminho relativo.

## Onde cada um aparece no mundo real

Symlinks estão por toda parte no Linux:

```bash
ls -l /etc/alternatives/          # sistema de alternativas do Debian/Ubuntu
ls -l /usr/lib/x86_64-linux-gnu/ | grep '\->'   # versionamento de bibliotecas (libfoo.so -> libfoo.so.1.2.3)
```

Deploys estilo Capistrano/blue-green usam um symlink `current -> releases/2026-07-06/` — publicar uma versão nova é trocar um link, e rollback é apontar de volta. Atômico e instantâneo.

Hardlinks brilham em backups incrementais: o `rsync --link-dest` cria snapshots diários onde arquivos inalterados são hardlinks para o backup anterior. Dez snapshots de 50 GB quase idênticos ocupam pouco mais de 50 GB.

## Resumo

| | Hardlink | Symlink |
| --- | --- | --- |
| Inode | O mesmo do alvo | Próprio |
| Se o alvo é removido | Conteúdo sobrevive | Link quebra |
| Aponta para diretório | Não | Sim |
| Atravessa filesystems | Não | Sim |
| Espaço em disco | Zero extra | Alguns bytes (o caminho) |
| Comando | `ln alvo nome` | `ln -s alvo nome` |

Se ficou na dúvida em qual usar: symlink é o padrão para 90% dos casos (visível, flexível, óbvio no `ls -l`). Hardlink é a ferramenta certa quando você quer que o conteúdo sobreviva à remoção de qualquer um dos nomes — ou quer deduplicar sem gastar disco.