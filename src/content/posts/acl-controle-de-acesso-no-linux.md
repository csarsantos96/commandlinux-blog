---
title: "ACLs no Linux: controle de acesso além do dono, grupo e outros"
description: "Access Control Lists (ACLs) no Linux: como instalar, ler com getfacl, conceder permissão a um usuário ou grupo específico com setfacl e quando isso realmente vale a pena."
date: 2026-08-11
category: LINUX
tags: [linux, permissoes, acl, getfacl, setfacl, seguranca]
---

Continuando as anotações sobre [permissões especiais no Linux](/posts/permissoes-especiais-umask-suid-sgid-sticky-bit), parte do curso **Linux para Cloud Native** da LINUXtips, dentro da trilha do PICK 2026, chegou a vez de um problema que `chmod` sozinho não resolve: e se eu precisar dar uma permissão diferente para um usuário específico, sem mexer no dono nem no grupo do arquivo?

> As saídas apresentadas são exemplos. Nomes, caminhos e horários podem variar de acordo com o sistema.

# O limite do modelo dono/grupo/outros

O modelo clássico de permissões do Linux, dono, grupo e outros, só permite um dono e um grupo por arquivo. Se eu preciso que um usuário específico, que não é o dono nem faz parte do grupo, tenha acesso de leitura e escrita, o jeito "tradicional" é colocar esse usuário no grupo certo, o que nem sempre é uma opção, ou reorganizar a estrutura de pastas inteira.

É exatamente essa lacuna que as ACLs (*Access Control Lists*) resolvem: uma camada extra de permissões, por cima do `rwx` de sempre, que permite conceder acesso a um usuário ou grupo específico, individualmente, sem alterar o dono nem o grupo do arquivo.

# Instalando

Em muitas distros o suporte a ACL já vem pronto no sistema de arquivos, mas as ferramentas de linha de comando às vezes precisam ser instaladas:

```bash
sudo apt install acl
```

# Lendo ACLs com `getfacl`

Para ver todas as ACLs aplicadas a um arquivo ou diretório:

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

Esse é o retrato de um arquivo sem nenhuma ACL extra ainda, só o modelo padrão: dono (`corinthians`) com `rwx`, grupo (`dukebless`) com `r-x` e outros com `r-x`.

# Concedendo permissão a um usuário específico com `setfacl`

Para dar acesso de leitura e escrita, explicitamente, a um usuário chamado `deployer`, sem tocar no dono nem no grupo do arquivo:

```bash
setfacl -m u:deployer:rw /var/opt/proj/config/app.yml
```

* `-m` é de *modify*, adiciona ou altera uma regra.
* `u:deployer:rw` é a sintaxe: tipo (`u` de usuário, ou `g` de grupo), o nome, e a permissão concedida.

Depois de aplicar uma regra assim, o `getfacl` passa a mostrar uma linha extra para aquele usuário, além de uma linha nova chamada `mask`:

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

A linha `mask` merece atenção: ela define o teto máximo de permissão efetiva para qualquer entrada nomeada de usuário ou grupo na ACL (menos o dono e "outros"). Mesmo que uma regra conceda `rwx` a um usuário, se a `mask` estiver em `r-x`, o efetivo é `r-x`. Vale sempre conferir a `mask` depois de mexer numa ACL, para não achar que uma permissão foi concedida quando na prática ela foi limitada.

# Removendo uma ACL

Para remover só a regra de um usuário específico:

```bash
setfacl -x u:wine arquivo
```

Para remover todas as ACLs de um arquivo, voltando ao modelo padrão:

```bash
setfacl -b arquivo
```

# Quando vale a pena usar ACL

O detalhe que mais me chamou atenção nessa anotação: ACL não é uma boa prática por padrão, é uma ferramenta para um problema específico.

Na maioria dos ambientes Cloud Native, algo como 90% dos casos, um sistema bem organizado, com grupos pensados desde o início, não precisa de nenhuma ACL. O modelo dono/grupo/outros, combinado com grupos bem definidos, já resolve.

Os outros 10% são casos como:

* ambiente de hospedagem multiterminal, onde vários usuários independentes compartilham a mesma máquina;
* um requisito regulatório onde usuários diferentes precisam de níveis de acesso diferentes sobre o mesmo conjunto de arquivos, sem que isso possa ser resolvido só reorganizando grupos.

Fora desses casos, adicionar ACL costuma ser mais complexidade para gerenciar depois, um `ls -l` comum nem mostra que existe uma ACL aplicada, só um `+` no final das permissões, o que facilita esquecer que ela existe.

# Resumo

* Instalar o suporte: `sudo apt install acl`
* Ver as ACLs de um arquivo: `getfacl arquivo`
* Conceder permissão a um usuário: `setfacl -m u:usuario:rwx arquivo`
* Conceder permissão a um grupo: `setfacl -m g:grupo:rwx arquivo`
* Remover a regra de um usuário: `setfacl -x u:usuario arquivo`
* Remover todas as ACLs: `setfacl -b arquivo`
* Ficar de olho na linha `mask`, que limita a permissão efetiva de qualquer entrada nomeada

# Conclusão

ACL é o tipo de recurso que resolve um problema real, mas que também é fácil de usar demais. Como ela fica "escondida" atrás de um `+` discreto na saída do `ls -l`, é fácil esquecer que um arquivo tem uma regra especial aplicada, e isso vira uma pegadinha para quem for debugar permissão meses depois sem saber que ACL existe.

O aprendizado que fica: antes de sair adicionando `setfacl` em tudo, vale perguntar se o problema não se resolve só ajustando dono, grupo e um `chmod` bem pensado. ACL é para o caso específico em que isso realmente não é suficiente, não para o dia a dia.

## Referências

* `man acl`, `man getfacl`, `man setfacl` — documentação oficial dos comandos e do formato de ACL.
* [Debian Administrator's Handbook — Managing Rights](https://debian-handbook.info/browse/stable/sect.managing-rights.html) — referência sobre permissões e ACL.
* [LINUXtips — Linux para Cloud Native](https://linuxtips.io/linux-para-cloud-native/) — curso utilizado como base dos meus estudos e destas anotações, dentro da trilha PICK.
* [Guia Foca GNU/Linux](https://focalinux.cipsga.org.br/) — referência em português sobre permissões e administração do sistema.
