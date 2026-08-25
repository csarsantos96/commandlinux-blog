---
title: "Entendendo permissões no Linux: chmod, chown e sudo na prática"
description: "Permissões no linux: como ler o ls -l, chmod simbólico e octal, chown para trocar dono e grupo, e como configurar o sudo com visudo com segurança."
date: 2026-08-11
category: LINUX
tags: [linux, permissoes, chmod, chown, sudo, sudoers, visudo, seguranca, vim]
---

Essas são minhas anotações de caderno sobre permissões no Linux, parte do curso **Linux para Cloud Native** da LINUXtips, dentro da trilha do PICK 2026. No post anterior, sobre [administração de usuários](/posts/administrando-usuarios-no-linux), eu tinha deixado combinado que a próxima parada seria grupos e permissões. Chegou a hora.

Passei tudo a limpo aqui, incluindo os tropeços que tive praticando no terminal, porque escrever fixa o conteúdo, e porque um dia isso vira referência rápida quando eu não lembrar de uma flag.

> As saídas apresentadas são exemplos. Nomes, caminhos e horários podem variar de acordo com o sistema.

# Lendo a saída do `ls -l`

Antes de mexer em permissão, preciso saber ler o que já existe. O comando `ls -l` mostra tudo:

```bash
ls -l /etc/hosts
```

Saída:

```text
-rw-r--r-- 1 root root 221 Feb 16 10:30 /etc/hosts
```

Cada pedaço dessa linha conta uma história:

* O primeiro caractere é o tipo do arquivo. `-` para arquivo comum, `d` para diretório, `l` para link simbólico, `c` para dispositivo de caractere, `b` para dispositivo de bloco e `s` para socket.
* Os nove caracteres seguintes são as permissões, divididas em três grupos de três: dono, grupo e outros. Cada grupo tem `r` (read, leitura), `w` (write, escrita) e `x` (execute, execução).
* O número depois das permissões é a quantidade de hard links apontando para aquele inode.
* Em seguida vêm o usuário dono e o grupo dono do arquivo.
* Depois o tamanho em bytes.
* Depois a data de modificação.
* E por fim o nome do arquivo.

O detalhe que eu não tinha parado para pensar antes: o significado do `x` muda dependendo se é arquivo ou diretório. Em um arquivo, `x` permite executar o arquivo como programa. Em um diretório, `x` permite entrar nele (`cd`) e atravessar o caminho, o que é diferente de conseguir listar o conteúdo (isso é o `r`).

# `chmod`: mudando permissões

O `chmod` (change mode) altera as permissões de um arquivo ou diretório. Existem duas sintaxes: a simbólica, mais legível, e a octal, mais rápida de digitar.

## Sintaxe simbólica

A sintaxe simbólica combina uma letra de alvo (`u`, `g`, `o` ou `a`), um operador (`+` adiciona, `-` remove, `=` define exatamente) e a permissão (`r`, `w`, `x`).

```bash
chmod u+x script.sh       # Dá execução ao dono
chmod g+rw arquivo.txt    # Dá leitura e escrita ao grupo
chmod o-rwx privado.conf  # Remove tudo dos outros
chmod a+r documento.txt   # Dá leitura a todos
```

Os alvos:

* `u` é user, o dono.
* `g` é group, o grupo.
* `o` é other, os outros.
* `a` é all, todos os três de uma vez.

## Sintaxe octal

A sintaxe octal é a matemática por trás das permissões. Cada permissão tem um valor numérico fixo:

```text
r = 4
w = 2
x = 1
```

Somando os valores das permissões que eu quero, chego no dígito que representa aquela combinação:

```text
7 (4+2+1) = rwx : lê, escreve e executa. Poder total
6 (4+2+0) = rw- : lê e escreve, mas não executa
5 (4+0+1) = r-x : lê e executa, mas não escreve
4 (4+0+0) = r-- : só leitura
0 (0+0+0) = --- : nenhuma permissão
```

O `chmod` recebe três dígitos octais, um para cada alvo, sempre na mesma ordem: dono, grupo, outros.

```bash
chmod 755 script.sh
```

Aqui o dono recebe `7` (rwx), o grupo recebe `5` (r-x) e os outros recebem `5` (r-x). Essa é a permissão padrão de um script executável: o dono faz tudo, o resto lê e executa, mas ninguém além do dono altera o arquivo.

```bash
chmod 644 config.txt
```

Nesse caso, todo mundo lê, mas só o dono edita, e ninguém executa.

## `chmod 400`, o caso da chave SSH

Uma combinação bastante usada por sysadmins, devs e qualquer pessoa que mexe com SSH no dia a dia é:

```bash
chmod 400 id_rsa
```

Só o dono lê a chave do SSH, nem ele consegue escrever. É por isso que essa é a permissão recomendada para chaves privadas SSH: se o grupo ou os outros tivessem qualquer acesso, o SSH nem deixaria usar a chave.

## Por que evitar o `777`

 O que eu anotei como um alerta pra mim mesmo: nunca usar `chmod 777`.

Com `777`, qualquer usuário do sistema (inclusive o `nobody`, que normalmente roda serviços web) pode ler, escrever e executar o arquivo. Isso inclui um eventual invasor que já conseguiu um shell limitado: com um `777` pela frente, ele ganha controle total sobre aquele arquivo, mesmo tendo entrado por uma porta pequena.

# `chown`: mudando o dono e o grupo

O `chmod` muda o que pode ser feito com o arquivo, mas não muda quem é o dono. Quando o arquivo pertence à pessoa errada, ou ao grupo errado, o `chmod` sozinho não resolve. Aí entra o `chown` (change owner):

```bash
sudo chown deployer:devs /var/opt/projeto/
```

A sintaxe é `usuário:grupo`. Esse comando muda o dono do diretório `projeto` para `deployer` e o grupo para `devs`, de uma vez só.

Se eu quiser trocar só o grupo, sem mexer no dono, basta omitir o nome antes dos dois pontos:

```bash
sudo chown :devs /var/opt/projeto/
```

Existe também o `chgrp`, que faz exatamente essa segunda operação (trocar só o grupo) de forma dedicada. Vale não confundir com o `usermod`, que mexe na conta do usuário em si (grupos que ele pertence, shell, home), e não na propriedade de um arquivo.

Na prática, uso esse comando quando estou logado como root e preciso entregar um diretório para outro usuário. Um exemplo real do meu caderno: eu queria que o usuário `deployer` fosse dono do diretório de deploy, e que o grupo dele também controlasse aquele caminho, sabendo que o diretório alvo (`projeto`) fica dentro de `/var/opt`.

# `sudo`, `sudoers` e `visudo`

A última parte das anotações é sobre como um usuário comum ganha permissão para agir como root, de forma controlada.

## O que o `sudo` resolve

`sudo` significa superuser do. É o mecanismo que permite a um usuário comum executar comandos como root, de forma controlada e auditável. Cada execução via `sudo` é logada: quem executou, quando e qual comando. Isso resolve um problema real: logar direto como root não deixa esse rastro.

## Nunca edite `/etc/sudoers` direto

A configuração de quem pode usar `sudo`, e com quais poderes, fica no arquivo `/etc/sudoers`. E aqui está o aviso que grifei bem grande no caderno: nunca edite esse arquivo com `vim` ou `nano` diretamente.

Se a sintaxe do `/etc/sudoers` ficar quebrada, o `sudo` inteiro para de funcionar no sistema, para todo mundo. E como você não consegue mais usar `sudo`, também não consegue virar root para consertar o próprio arquivo. É a sensação de trancar a chave de casa dentro do carro: a ferramenta que resolveria o problema ficou presa junto com o problema.

A forma segura de editar é:

```bash
sudo visudo
```

O `visudo` abre uma cópia temporária do `/etc/sudoers` (algo como `/tmp/sudoers...`) no editor padrão, mas checa a sintaxe antes de salvar de verdade. Se algo estiver errado, ele mostra a linha do problema e pergunta o que fazer, em vez de simplesmente salvar. Ele nunca deixa passar uma configuração inválida para o arquivo real.

## Dando poderes de sudo a um usuário

No Ubuntu, o jeito mais simples e seguro de dar poderes de `sudo` a um usuário é adicionar ele ao grupo `sudo`, que já vem com a permissão certa configurada no `/etc/sudoers`:

```bash
sudo usermod -aG sudo deployer
```

A partir daí, o `deployer` pode rodar comandos administrativos precedidos de `sudo`, mas ainda vai digitar a própria senha a cada vez (com um cache padrão de 15 minutos entre uma execução e outra).

Existe também outra forma de chegar no mesmo resultado, editando o próprio `/etc/sudoers` com `visudo` e adicionando uma linha de especificação de privilégio, do mesmo jeito que já vem para o `root`:

```text
# User privilege specification
root    ALL=(ALL:ALL) ALL
wine    ALL=(ALL:ALL) ALL
```

Foi assim que defini o usuário `wine` no meu ambiente, direto pelo `visudo`. O efeito é equivalente ao `usermod -aG sudo`, mas aqui a permissão é declarada explicitamente para aquele usuário, linha por linha, em vez de depender da configuração já existente para o grupo `sudo`.

## Sudo sem senha, e por que isso é perigoso fora de automação

Em cenários de CI/CD, como Jenkins, GitHub Actions ou Ansible, não existe um humano digitando senha. Para isso, o `visudo` permite configurar uma linha assim:

```text
deployer ALL=(ALL) NOPASSWD: ALL
```

Cada pedaço dessa linha tem um papel:

* `deployer` é o usuário ao qual a regra se aplica.
* O primeiro `ALL` indica em qualquer host (relevante em ambientes com LDAP, onde o mesmo arquivo vale para várias máquinas).
* `(ALL)` significa que ele pode executar comandos como qualquer usuário, não só como root.
* `NOPASSWD` elimina a necessidade de senha.
* O último `ALL` indica qualquer comando.

E aqui vale repetir o alerta do caderno: isso é perigoso. Se alguém comprometer a conta do `deployer`, tem acesso root instantâneo, sem nenhuma segunda barreira. Use `NOPASSWD` apenas para usuários de serviço em ambientes controlados, nunca para a sua conta pessoal de trabalho diário.

# Minha experiência praticando

A parte de anotar a teoria foi tranquila. A parte de praticar no terminal foi onde apareceram os tropeços de verdade, e foi ali que boa parte disso realmente entrou.

## O erro bobo que ensinou o caminho relativo

Listei o conteúdo de um diretório e vi uma pasta chamada `dir2` ali:

```text
drwxrwxr-x 3 wine dukebless 4.0K Aug 11 02:00 .
drwxr-x--- 3 wine dukebless 4.0K Aug 11 02:00 ..
drwxrwxr-x 3 wine dukebless 4.0K Aug 11 02:00 dir2
```

Tentei então mudar a permissão dela:

```bash
chmod ug=rw dir2
```

```text
chmod: cannot access 'dir2': No such file or directory
```

A princípio parece um erro sem sentido, já que o `dir2` estava bem ali na listagem. O que aconteceu foi que aquela listagem não era do diretório onde eu estava naquele momento, e sim de um nível acima. O `chmod`, como praticamente todo comando de arquivo no Linux, trabalha em cima do diretório atual, a não ser que eu informe um caminho completo. Se o alvo não está exatamente onde estou, ele simplesmente não existe do ponto de vista do comando.

Foi um lembrete direto e útil: antes de rodar `chmod` ou `chown`, vale conferir com `pwd` e `ls` onde exatamente estou, ou então usar o caminho completo, em vez de confiar de olho na última listagem que apareceu na tela.

## A dúvida sobre lembrar tudo

Em algum momento da prática, bateu uma frustração: a sensação de que sei o conteúdo, mas não consigo lembrar do comando certo na hora exata em que preciso dele. Comparei isso com quem parece decorar tudo de cabeça, tipo qual arquivo configura o quê, e senti que estava atrás nesse ponto.

Só que reconstruindo a própria dúvida em voz alta, aconteceu algo interessante: lembrei que existia um arquivo relacionado ao `sudo`, associei com `vim` e lembrei do  `visudo`, testei e cheguei sozinho até o `/etc/sudoers`. Isso não foi decoreba. Foi raciocínio, puxando um fio a partir de outro.

E essa é a virada de chave que quero guardar aqui: quem parece "saber tudo" normalmente não decorou nada, apenas construiu o hábito de não precisar lembrar, porque o próprio sistema responde quando você pergunta certo. Alguns exemplos práticos que uso agora em vez de tentar guardar tudo de cabeça:

* `sudo visudo` já sabe qual arquivo abrir, então não preciso lembrar do caminho `/etc/sudoers`.
* `chmod --help` e `chown --help` mostram a sintaxe na hora, sem precisar adivinhar uma flag.
* `getent group nome_do_grupo` mostra quem está em um grupo.
* `groups usuario` mostra a quais grupos um usuário pertence.

A habilidade real não é ter a resposta guardada, é saber qual pergunta fazer ao terminal.

## Testando as variações do `visudo`

Durante a prática eu tentei algumas formas diferentes de abrir a configuração do sudo:

```bash
visudo
visudo /etc/sudoers
sudo visudo /etc/sudoers
sudo visudo
```

As duas primeiras falharam por falta de permissão, já que mexer no `sudoers` exige ser root. As duas últimas funcionaram, e deram exatamente no mesmo resultado. Isso mostrou, na prática, que informar o caminho `/etc/sudoers` depois do `visudo` é redundante: ele já abre esse arquivo por padrão. O comando que vale a pena fixar é só:

```bash
sudo visudo
```

Duas palavras. E o jeito como cheguei até essa conclusão, testando as variações e comparando o resultado, grudou de um jeito que nenhuma lista de comandos decorada teria grudado.

# Resumo

* Ver o dono, o grupo e as permissões de um arquivo: `ls -l`
* Dar ou remover permissão simbólica: `chmod u+x`, `chmod g+rw`, `chmod o−rwx`, `chmod a+r`
* Definir permissão em octal: `chmod 755`, `chmod 644`, `chmod 400`
* Trocar dono e grupo ao mesmo tempo: `chown usuario:grupo caminho`
* Trocar só o grupo: `chown :grupo caminho`
* Editar a configuração do sudo com segurança: `sudo visudo`
* Dar poderes de sudo a um usuário: `usermod −aG sudo usuario`
* Configurar sudo sem senha para automação: linha `usuario ALL=(ALL) NOPASSWD: ALL` no `sudoers`

# Conclusão

O `chmod` e o `chown` resolvem perguntas diferentes: um define o que pode ser feito com o arquivo, o outro define quem é responsável por ele. Os dois juntos formam a base de qualquer discussão séria sobre segurança em Linux, muito antes de chegar em firewall ou criptografia.

E o `sudo` fecha esse ciclo: em vez de dar a chave mestra (login direto como root) para todo mundo, ele permite conceder poder de forma seletiva, auditável e, quando bem configurado, reversível. O `visudo` existe justamente para que um erro de sintaxe não vire um sistema inteiro travado.

Sobre a prática em si, o maior aprendizado não foi nenhum comando específico. Foi perceber que entender a lógica por trás de cada peça vale muito mais do que tentar decorar a peça em si. O comando eu sempre posso buscar de novo. O raciocínio de por que aquele comando existe é o que fica.

Passamos muito tempo usando comandos como esses no dia a dia sem realmente saber o que eles são e o que fazem por baixo dos panos. Entender o que está acontecendo de verdade, em vez de só repetir o comando por hábito, faz toda a diferença.


## Referências

* `man chmod`, `man chown`, `man 5 sudoers`, `man visudo` — documentação oficial dos comandos e do formato do arquivo.
* [Debian Administrator's Handbook — Managing Rights](https://debian-handbook.info/browse/stable/sect.managing-rights.html) — referência sobre permissões e `sudo`.
* [LINUXtips — Linux para Cloud Native](https://linuxtips.io/linux-para-cloud-native/) — curso utilizado como base dos meus estudos e destas anotações, dentro da trilha PICK.
* [Guia Foca GNU/Linux](https://focalinux.cipsga.org.br/) — referência em português sobre permissões, chmod, chown e administração do sistema.
