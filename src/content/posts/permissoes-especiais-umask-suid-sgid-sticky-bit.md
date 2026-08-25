---
title: "umask, /etc/login.defs e permissões especiais: SUID, SGID e sticky bit"
description: "Umask, o arquivo /etc/login.defs e as permissões especiais SUID, SGID e sticky bit no Linux, com exemplos práticos de chmod."
date: 2026-08-11
category: LINUX
tags: [linux, permissoes, umask, suid, sgid, stickybit, logindefs]
---

Continuando as anotações sobre [permissões no Linux](/posts/entendendo-permissoes-chmod-chown-sudo), parte do curso **Linux para Cloud Native** da LINUXtips, dentro da trilha do PICK 2026, chegou a vez de entender o que acontece antes do `chmod` entrar em cena: quem decide a permissão inicial de um arquivo recém criado. E depois, a vez das permissões especiais: `SUID`, `SGID` e sticky bit.

> As saídas apresentadas são exemplos. Nomes, caminhos e horários podem variar de acordo com o sistema.

# `umask`: quem define a permissão de nascimento

`umask` (user file creation mode mask) é uma configuração do sistema Unix/Linux que define quais permissões são removidas de arquivos e diretórios recém criados.

Quando um arquivo é criado, o sistema parte de uma permissão padrão, `666` para arquivo e `777` para diretório, e subtrai a máscara do `umask` daquele valor.

```text
Arquivo: 666 menos umask
Diretório: 777 menos umask
```

No usuário `theduke`, por exemplo, o `umask` configurado é `022`. Por isso, todo arquivo criado nasce com `644` (`rw−r−−r−−`) e todo diretório criado nasce com `755` (`rwxr−xr−x`).

O `umask` funciona com a mesma lógica octal do `chmod`, só que ao contrário. No `chmod` eu defino o que quero conceder. No `umask` eu defino o que quero tirar.

* `chmod`: permissão final, direta.
* `umask`: base (`666` ou `777`) menos a máscara.

A diferença mais importante entre os dois: o `umask` afeta só os arquivos criados a partir dali em diante, enquanto o `chmod` altera um arquivo que já existe.

Alguns exemplos de máscara e o resultado prático em arquivos:

* `umask 077` produz arquivos `600` (`rw−−−−−−−`), acesso só para o dono.
* `umask 022` produz arquivos `644` (`rw−r−−r−−`), o dono escreve e o resto só lê.
* `umask 002` produz arquivos `664` (`rw−rw−r−−`), dono e grupo escrevem.

# `/etc/login.defs`: o padrão do sistema

Cada usuário pode ter o próprio `umask`, seja definido no `~/.bashrc` seja em outro arquivo de perfil, então essas configurações ficam independentes por conta. Mas quando eu quero mexer no padrão que vale para todo mundo, o `umask` sozinho não resolve, porque ele só define o comportamento de nascimento das permissões, não onde essa regra fica registrada por padrão.

O arquivo que define o padrão do sistema para criação é o `/etc/login.defs`:

```bash
sudo vim /etc/login.defs
```

Algumas das coisas que dá para configurar ali:

* `UMASK`: o `umask` padrão do sistema.
* `PASS_MAX_DAYS`: de quantos em quantos dias a senha expira.
* `PASS_MIN_DAYS`: tempo mínimo antes de poder trocar a senha de novo.
* `PASS_WARN_AGE`: com quantos dias de antecedência o sistema avisa que a senha vai expirar.
* `UID_MIN` e `UID_MAX`: faixa de números de UID que o sistema reserva para atribuir automaticamente aos usuários comuns na hora de criar uma conta (existe o par equivalente, `GID_MIN` e `GID_MAX`, para grupos).
* `CREATE_HOME`: se cria automaticamente a pasta home ao criar um usuário novo.

Vale lembrar que essa é a configuração padrão do sistema. Se eu quiser um `umask` diferente só para um usuário específico, sem mexer em ninguém mais, o lugar certo é o `~/.bashrc` daquele usuário.

# Permissões especiais

Além de leitura, escrita e execução para dono, grupo e outros, o Linux tem três permissões especiais: `SUID`, `SGID` e sticky bit. As três seguem a mesma lógica octal do `chmod`, mas com um dígito extra na frente dos três de sempre.

```text
bit    octal   onde aparece no símbolo
SUID   4       s no lugar do x do dono
SGID   2       s no lugar do x do grupo
Sticky 1       t no lugar do x dos outros
```

## `SUID`, o SetUID

`SUID` só faz sentido em arquivos executáveis. Um exemplo clássico é o próprio `passwd`, o programa que troca a senha de um usuário no sistema:

```bash
whereis passwd
```

O `whereis` mostra o caminho onde o `passwd` está. Olhando esse caminho com mais detalhe:

```bash
ls -lha /usr/bin/passwd
```

```text
-rwsr-xr-x 1 root root 140K Aug 11 2026 /usr/bin/passwd
```

Esse `s` no lugar do `x` do dono significa que esse programa está com o `SUID` habilitado. Quando ele for executado por qualquer usuário, ele roda como se fosse o `root`, mesmo que quem o chamou seja um usuário comum. É assim que um usuário sem privilégio nenhum consegue trocar a própria senha, um arquivo que só o `root` teria permissão de alterar diretamente.

O valor do `SUID` em octal é `4`. Para ativar:

```bash
chmod 4755 programa
```

O `4` é o `SUID`. Combinado com `755`, o dono recebe `rwx` mais `SUID`, o grupo recebe `r−x` e os outros recebem `r−x`.

E aqui vale o alerta grifado no caderno: se um atacante conseguir colocar um script malicioso com `SUID` pertencente ao `root`, ele ganha acesso `root` completo assim que alguém executar aquele script. Por isso, nunca coloque `SUID` em script arbitrário. É uma responsabilidade enorme, e por isso o `SUID` deve ficar restrito a binários confiáveis e auditados, como o próprio `passwd`.

## `SGID`, o SetGID

```bash
chmod 2755 pasta/
```

Isso ativa o `SGID` na pasta. Conferindo o resultado:

```bash
ls -lha pasta
```

```text
drwxr-sr-x 2 wine dukebless 4.0K Aug 11 2026 pasta
```

O `s` aparece no lugar do `x` do grupo. O `2` é o `SGID`.

O efeito dele num diretório: arquivos e subpastas criados dentro daquele diretório herdam o grupo do diretório, e não o grupo primário de quem criou o arquivo. É muito usado em pastas compartilhadas por uma equipe, onde todo mundo precisa continuar no mesmo grupo, independente de quem criou cada arquivo.

## Sticky bit

```bash
chmod 1777 pasta/
```

Isso ativa o sticky bit no diretório. O `1` é o sticky bit.

O efeito dele: mesmo que todo mundo possa escrever na pasta, cada usuário só pode apagar ou renomear os próprios arquivos. Ninguém apaga o arquivo de outra pessoa, só o dono do arquivo, o dono da pasta ou o `root`.

O exemplo clássico é o `/tmp`:

```text
drwxrwxrwt 10 root root 4.0K Aug 11 2026 /tmp
```

Todo mundo escreve lá, mas um usuário não consegue deletar o arquivo do outro.

O sticky bit também pode ser ativado de forma simbólica:

```bash
chmod +t pasta/
```

E existe uma diferença sutil no símbolo final, dependendo de quem mais tem permissão de execução naquele diretório:

* `t` minúsculo: sticky bit ligado, e os outros ainda têm permissão de execução (`x`).
* `T` maiúsculo: sticky bit ligado, mas sem o `x` dos outros.

# Resumo

* Ver o padrão de permissão de arquivos e diretórios recém criados: `umask`
* Calcular o resultado: `666` menos `umask` para arquivo, `777` menos `umask` para diretório
* Configurar o padrão do sistema inteiro: `sudo vim /etc/login.defs`
* Configurar o padrão de só um usuário: `umask` no `~/.bashrc`
* Ativar `SUID` num executável: `chmod 4755 programa`
* Ativar `SGID` numa pasta: `chmod 2755 pasta/`
* Ativar sticky bit numa pasta: `chmod 1777 pasta/` ou `chmod +t pasta/`

# Conclusão

O `umask` fecha um buraco que eu não tinha percebido antes: o `chmod` explica como mudar a permissão de um arquivo que já existe, mas alguém decide qual é a permissão dele no exato momento em que nasce, e esse alguém é o `umask`. Entender que ele trabalha por subtração, ao contrário do `chmod`, que trabalha por concessão, foi o que fez a lógica realmente encaixar.

As permissões especiais são a parte que mais pede responsabilidade. `SUID` e `SGID` permitem que um programa ou diretório se comporte como se fosse outro usuário ou outro grupo, o que resolve problemas legítimos, como o `passwd`, mas também é exatamente o tipo de configuração que um atacante procura para escalar privilégio. O sticky bit já é o oposto disso, uma trava de proteção, o motivo pelo qual o `/tmp` é compartilhado por todo mundo sem virar um risco de qualquer usuário apagar o arquivo do outro.

Passamos muito tempo usando comandos como esses no dia a dia sem realmente saber o que eles são e o que fazem por baixo dos panos. Entender o que está acontecendo de verdade, em vez de só repetir o comando por hábito, faz toda a diferença.

## Referências

* `man chmod`, `man login.defs` — documentação oficial dos comandos e do arquivo de configuração.
* [Debian Administrator's Handbook — Managing Rights](https://debian-handbook.info/browse/stable/sect.managing-rights.html) — referência sobre permissões especiais.
* [LINUXtips — Linux para Cloud Native](https://linuxtips.io/linux-para-cloud-native/) — curso utilizado como base dos meus estudos e destas anotações, dentro da trilha PICK.
* [Guia Foca GNU/Linux](https://focalinux.cipsga.org.br/) — referência em português sobre permissões, umask e administração do sistema.
