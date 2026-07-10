---
title: "Trabalhando com arquivos no Linux: hard links, leitura, logs e comparação"
description: "Aprenda a criar hard links e usar cat, less, head, tail, grep, wc e diff para visualizar, acompanhar e comparar arquivos diretamente pelo terminal."
date: 2026-07-10
category: LINUX
tags: [linux, terminal, arquivos, hard-links, cat, less, head, tail, grep, wc, diff]
---

Trabalhar com Linux significa lidar constantemente com arquivos: arquivos de configuração, logs, informações do sistema e saídas produzidas por aplicações.

Embora seja possível abrir esses arquivos em um editor de texto, muitas vezes queremos apenas responder rapidamente a perguntas como:

- Qual é o conteúdo deste arquivo?
- Quantas linhas ele possui?
- Quais foram as últimas mensagens registradas?
- O que mudou entre duas versões?
- Como acompanhar um log em tempo real?

Para cada uma dessas situações existe um comando apropriado. Neste post, veremos como utilizar `ln`, `cat`, `less`, `head`, `tail`, `grep`, `wc` e `diff`.

> As saídas apresentadas são exemplos. Nomes de usuários, datas, permissões e mensagens podem variar de acordo com o sistema.

# Criando hard links com `ln`

Antes de visualizar os arquivos, vale entender como o Linux relaciona seus nomes ao conteúdo armazenado no disco.

Internamente, um arquivo possui uma estrutura chamada **inode**. O inode guarda informações como permissões, proprietário, tamanho e localização dos dados.

O nome do arquivo funciona como uma referência para esse inode.

Um **hard link** cria outro nome apontando para o mesmo inode do arquivo original.

Considere que temos o arquivo:

```text
servidor.conf
```

Para criar um hard link:

```bash
ln servidor.conf servidor-hardlink.conf
```

Saída:

```text
Nenhuma saída é exibida quando o comando é executado com sucesso.
```

Agora existem dois nomes apontando para o mesmo conteúdo.

Podemos verificar isso utilizando `ls` com as opções `-l` e `-i`:

```bash
ls -li servidor.conf servidor-hardlink.conf
```

Saída:

```text
184233 -rw-r--r-- 2 cesar cesar 28 jul 10 09:40 servidor.conf
184233 -rw-r--r-- 2 cesar cesar 28 jul 10 09:40 servidor-hardlink.conf
```

O primeiro número apresentado é o inode:

```text
184233
```

Como os dois arquivos possuem o mesmo inode, eles representam o mesmo conteúdo armazenado no disco.

O número `2`, depois das permissões, representa a quantidade de hard links apontando para aquele inode.

Se alterarmos o conteúdo utilizando qualquer um dos nomes, a alteração poderá ser visualizada pelo outro.

```bash
echo "porta=8080" >> servidor-hardlink.conf
```

Saída:

```text
Nenhuma saída é exibida.
```

Ao visualizar o arquivo original:

```bash
cat servidor.conf
```

Saída:

```text
porta=8080
```

Isso acontece porque não existem duas cópias independentes. Existem dois nomes apontando para o mesmo inode.

## Hard link e link simbólico

Um link simbólico funciona de maneira diferente. Ele cria um arquivo especial que guarda o caminho para outro arquivo.

Para criar um link simbólico:

```bash
ln -s servidor.conf servidor-simbolico.conf
```

Saída:

```text
Nenhuma saída é exibida.
```

Comparando os três arquivos:

```bash
ls -li servidor.conf servidor-hardlink.conf servidor-simbolico.conf
```

Saída:

```text
184233 -rw-r--r-- 2 cesar cesar 28 jul 10 09:40 servidor.conf
184233 -rw-r--r-- 2 cesar cesar 28 jul 10 09:40 servidor-hardlink.conf
184240 lrwxrwxrwx 1 cesar cesar 13 jul 10 09:42 servidor-simbolico.conf -> servidor.conf
```

O link simbólico possui outro inode e começa com a letra `l` nas permissões:

```text
lrwxrwxrwx
```

Além disso, o `ls` mostra para onde ele aponta:

```text
servidor-simbolico.conf -> servidor.conf
```

Hard links possuem algumas limitações importantes:

- Devem estar no mesmo sistema de arquivos.
- Normalmente não podem ser criados para diretórios.
- Continuam funcionando mesmo que um dos nomes seja removido.
- Os dados só são removidos quando o último hard link deixa de existir.

# `cat`: visualização direta

O comando `cat`, abreviação de **concatenate**, mostra o conteúdo completo de um arquivo diretamente no terminal.

```bash
cat /etc/hostname
```

Saída:

```text
meu-servidor
```

Ele é ideal para arquivos pequenos, como:

- Nome do computador;
- Chaves públicas;
- Arquivos pequenos de configuração;
- Arquivos com poucas linhas.

Porém, devemos tomar cuidado com arquivos grandes. Executar `cat` em um arquivo com milhares de linhas pode inundar o terminal e dificultar a leitura.

## Numerando as linhas com `cat -n`

A opção `-n` adiciona o número de cada linha.

```bash
cat -n /etc/hosts
```

Saída:

```text
     1  127.0.0.1   localhost localhost.localdomain
     2  ::1         localhost localhost.localdomain
     3  192.168.1.20 servidor-lab
```

Isso é extremamente útil quando alguém informa que existe um erro em uma linha específica:

```text
O problema está na linha 47.
```

Em vez de contar manualmente, podemos localizar a linha com facilidade.

```bash
cat -n arquivo.conf
```

Saída:

```text
    45  workers=4
    46  timeout=30
    47  porta=abc
    48  debug=false
```

Nesse exemplo, conseguimos perceber rapidamente que o valor da porta na linha 47 está incorreto.

## Mostrando vários arquivos

O `cat` também pode receber vários arquivos como argumentos.

```bash
cat /etc/hostname /etc/os-release
```

Saída:

```text
meu-servidor
NAME="Fedora Linux"
ID=fedora
PRETTY_NAME="Fedora Linux"
```

O conteúdo é apresentado na mesma ordem em que os arquivos foram informados.

Isso funciona bem para arquivos pequenos, mas não é a melhor opção quando precisamos navegar pelo conteúdo com calma.

# `less`: navegação controlada

O comando `less` abre o arquivo em um modo paginado. Em vez de despejar tudo no terminal, ele permite navegar pelo conteúdo.

```bash
less /etc/passwd
```

Saída exibida dentro do paginador:

```text
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/usr/sbin/nologin
daemon:x:2:2:daemon:/sbin:/usr/sbin/nologin
adm:x:3:4:adm:/var/adm:/usr/sbin/nologin
...
/etc/passwd
```

O `less` é especialmente útil para:

- Arquivos grandes;
- Logs;
- Arquivos de configuração;
- Saídas extensas de outros comandos;
- Páginas de manual.

## Navegando dentro do `less`

| Tecla | Ação |
|---|---|
| `/texto` | Pesquisa um texto |
| `n` | Vai para a próxima ocorrência |
| `N` | Volta para a ocorrência anterior |
| `g` | Vai para o início do arquivo |
| `G` | Vai para o final do arquivo |
| `Espaço` | Avança uma página |
| `b` | Volta uma página |
| Setas | Navegam linha por linha |
| `q` | Sai do `less` |

Para procurar a palavra `root`, por exemplo, pressione:

```text
/root
```

Depois pressione `Enter`.

Para navegar para o próximo resultado:

```text
n
```

Para voltar ao resultado anterior:

```text
N
```

O `less` também é utilizado internamente por vários outros comandos. Ao executar:

```bash
man ssh
```

A documentação normalmente será aberta dentro do próprio `less`.

Saber navegar no `less` significa também saber navegar melhor pela documentação do Linux.

# `less +F`: acompanhando arquivos em tempo real

A opção `+F` coloca o `less` em modo de acompanhamento.

```bash
less +F /var/log/messages
```

Exemplo de saída:

```text
Jul 10 09:51:08 servidor systemd[1]: Started Network Manager.
Jul 10 09:51:10 servidor kernel: Network interface initialized.
Jul 10 09:51:13 servidor sshd[2143]: Server listening on port 22.
Waiting for data... (interrupt to abort)
```

Sempre que uma nova linha for adicionada ao arquivo, ela aparecerá automaticamente.

Esse modo possui uma vantagem em relação ao `tail -f`: podemos interromper temporariamente o acompanhamento pressionando:

```text
Ctrl + C
```

Depois disso, podemos navegar pelo arquivo normalmente.

Para voltar ao modo de acompanhamento, basta pressionar:

```text
F
```

# `head`: mostrando o início do arquivo

O comando `head` apresenta as primeiras linhas de um arquivo.

Por padrão, ele mostra as primeiras dez linhas.

```bash
head /etc/passwd
```

Saída:

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

Para escolher quantas linhas serão mostradas, utilizamos `-n`.

```bash
head -n 5 /etc/passwd
```

Saída:

```text
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/usr/sbin/nologin
daemon:x:2:2:daemon:/sbin:/usr/sbin/nologin
adm:x:3:4:adm:/var/adm:/usr/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/usr/sbin/nologin
```

O `head` é ótimo para verificar rapidamente a estrutura inicial de um arquivo sem carregar todo o conteúdo.

# `tail`: mostrando o final do arquivo

O comando `tail` faz o oposto do `head`: ele mostra as últimas linhas.

```bash
tail /var/log/messages
```

Saída:

```text
Jul 10 09:55:01 servidor systemd[1]: Started Session 18 of User cesar.
Jul 10 09:55:02 servidor NetworkManager[910]: Network connection activated.
Jul 10 09:55:05 servidor sshd[2201]: Accepted publickey for cesar.
Jul 10 09:55:05 servidor systemd-logind[842]: New session 18 of user cesar.
Jul 10 09:55:09 servidor systemd[1]: Started User Manager for UID 1000.
```

Assim como o `head`, o `tail` mostra dez linhas por padrão.

Para definir outra quantidade:

```bash
tail -n 3 /var/log/messages
```

Saída:

```text
Jul 10 09:55:05 servidor sshd[2201]: Accepted publickey for cesar.
Jul 10 09:55:05 servidor systemd-logind[842]: New session 18 of user cesar.
Jul 10 09:55:09 servidor systemd[1]: Started User Manager for UID 1000.
```

O `tail` é indispensável para trabalhar com logs, pois as informações mais recentes normalmente estão no final do arquivo.

# `tail -f`: monitorando logs em tempo real

A opção `-f`, de **follow**, mantém o comando aberto esperando novas linhas.

```bash
tail -f /var/log/messages
```

Saída:

```text
Jul 10 10:01:02 servidor systemd[1]: Started Application Service.
Jul 10 10:01:08 servidor app[2451]: Application initialized.
Jul 10 10:01:12 servidor app[2451]: Connection established.
```

Se algum serviço registrar uma nova mensagem, ela aparecerá instantaneamente:

```text
Jul 10 10:01:17 servidor app[2451]: Request received from 192.168.1.10.
Jul 10 10:01:18 servidor app[2451]: Request completed successfully.
```

Para encerrar o acompanhamento:

```text
Ctrl + C
```

Esse comando é muito utilizado durante investigações de problemas. Podemos reproduzir um erro enquanto observamos exatamente o que está sendo registrado no log.

## Localização dos logs

A localização dos arquivos pode variar de acordo com a distribuição.

Em sistemas Fedora, RHEL e derivados, é comum encontrar:

```text
/var/log/messages
/var/log/secure
```

Em sistemas Debian, Ubuntu e derivados, é comum encontrar:

```text
/var/log/syslog
/var/log/auth.log
```

Alguns sistemas armazenam a maior parte dos registros no journal do `systemd`. Nesse caso, podemos acompanhar as mensagens com:

```bash
journalctl -f
```

Saída:

```text
jul 10 10:04:12 servidor systemd[1]: Starting Application Service...
jul 10 10:04:13 servidor systemd[1]: Started Application Service.
jul 10 10:04:13 servidor app[2604]: Application ready.
```

# Combinando `tail` com `grep`

Um log pode receber dezenas ou centenas de mensagens por segundo. Para mostrar apenas as linhas que nos interessam, podemos combinar `tail` e `grep`.

Em Fedora ou RHEL:

```bash
tail -f /var/log/secure | grep "Failed password"
```

Em Debian ou Ubuntu:

```bash
tail -f /var/log/auth.log | grep "Failed password"
```

Saída:

```text
Jul 10 10:08:21 servidor sshd[2740]: Failed password for invalid user admin from 203.0.113.25 port 51514 ssh2
Jul 10 10:08:29 servidor sshd[2740]: Failed password for root from 203.0.113.25 port 51520 ssh2
```

O caractere `|` é chamado de **pipe**.

Ele pega a saída do comando da esquerda:

```bash
tail -f /var/log/secure
```

E utiliza essa saída como entrada para o comando da direita:

```bash
grep "Failed password"
```

Assim, o terminal mostra apenas as tentativas de login que falharam. O ruído vai embora e sobra o que realmente interessa — quase um modo silencioso para logs tagarelas.

# `wc`: contando linhas, palavras e bytes

O comando `wc`, abreviação de **word count**, apresenta informações sobre o conteúdo de um arquivo.

Considere um arquivo chamado `app.log` com o seguinte conteúdo:

```text
INFO servidor iniciado
ERROR login falhou
INFO nova tentativa
```

Executando:

```bash
wc app.log
```

Saída:

```text
3 9 61 app.log
```

Os três valores representam, respectivamente:

```text
linhas palavras bytes arquivo
```

Portanto, o arquivo possui:

- 3 linhas;
- 9 palavras;
- 61 bytes.

## Contando somente as linhas

Na maioria das vezes queremos apenas saber quantas linhas existem.

Para isso, utilizamos `-l`:

```bash
wc -l app.log
```

Saída:

```text
3 app.log
```

Outras opções úteis:

| Opção | Informação |
|---|---|
| `-l` | Quantidade de linhas |
| `-w` | Quantidade de palavras |
| `-c` | Quantidade de bytes |
| `-m` | Quantidade de caracteres |

Para contar somente as palavras:

```bash
wc -w app.log
```

Saída:

```text
9 app.log
```

Para contar os bytes:

```bash
wc -c app.log
```

Saída:

```text
61 app.log
```

O `wc` responde rapidamente perguntas como:

- Quantas linhas existem neste log?
- Qual é o tamanho textual deste arquivo?
- Quantas entradas existem nesta lista?
- Quantas linhas possui este arquivo de configuração?

# `diff`: comparando arquivos

O comando `diff` compara dois arquivos e mostra exatamente o que mudou entre eles.

Considere o arquivo `original.conf`:

```text
porta=8080
debug=false
workers=2
```

E o arquivo `modificado.conf`:

```text
porta=9090
debug=true
workers=2
```

Para comparar:

```bash
diff original.conf modificado.conf
```

Saída:

```text
1,2c1,2
< porta=8080
< debug=false
---
> porta=9090
> debug=true
```

As linhas iniciadas com `<` existem no primeiro arquivo:

```text
< porta=8080
< debug=false
```

As linhas iniciadas com `>` existem no segundo arquivo:

```text
> porta=9090
> debug=true
```

O trecho:

```text
1,2c1,2
```

indica que as linhas 1 e 2 do primeiro arquivo foram alteradas para as linhas 1 e 2 do segundo.

Quando os arquivos são iguais, o `diff` não apresenta nenhuma saída.

```bash
diff original.conf copia-original.conf
```

Saída:

```text
Nenhuma saída significa que os arquivos são iguais.
```

# `diff -u`: formato unificado

Uma forma mais visual de utilizar o comando é com a opção `-u`, que ativa o formato unificado.

```bash
diff -u original.conf modificado.conf
```

Saída:

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

Nesse formato:

- Linhas iniciadas com `-` foram removidas;
- Linhas iniciadas com `+` foram adicionadas;
- Linhas sem esses símbolos são utilizadas como contexto.

Quem já utilizou:

```bash
git diff
```

provavelmente reconhecerá imediatamente esse formato.

# Fazendo backup antes de editar

Antes de modificar um arquivo importante, é uma boa prática criar uma cópia.

```bash
cp original.conf original.conf.bak
```

Saída:

```text
Nenhuma saída é exibida quando a cópia é realizada com sucesso.
```

Depois de editar o arquivo, podemos comparar a versão atual com o backup:

```bash
diff -u original.conf.bak original.conf
```

Saída:

```diff
--- original.conf.bak	2026-07-10 10:20:00
+++ original.conf	2026-07-10 10:25:00
@@ -1,3 +1,3 @@
-porta=8080
+porta=9090
 debug=false
 workers=2
```

Essa prática é especialmente útil antes de alterar arquivos como:

```text
/etc/ssh/sshd_config
/etc/fstab
/etc/hosts
```

Assim, caso alguma configuração apresente problemas, conseguimos identificar exatamente o que foi alterado.

# Qual comando utilizar?

| Situação | Comando |
|---|---|
| Criar outro nome para o mesmo inode | `ln` |
| Criar um link simbólico | `ln -s` |
| Mostrar um arquivo pequeno | `cat` |
| Mostrar o número das linhas | `cat -n` |
| Navegar por um arquivo grande | `less` |
| Mostrar as primeiras linhas | `head` |
| Mostrar as últimas linhas | `tail` |
| Acompanhar um arquivo em tempo real | `tail -f` |
| Acompanhar logs do systemd | `journalctl -f` |
| Filtrar linhas específicas | `grep` |
| Contar linhas, palavras ou bytes | `wc` |
| Comparar dois arquivos | `diff` |
| Comparar no formato parecido com Git | `diff -u` |

# Conclusão

Os comandos apresentados resolvem grande parte das tarefas diárias envolvendo arquivos no Linux.

O `cat` permite visualizar rapidamente arquivos pequenos, enquanto o `less` oferece uma navegação controlada para conteúdos maiores. O `head` e o `tail` ajudam a inspecionar partes específicas, e o `tail -f` transforma o terminal em um monitor de logs em tempo real.

Quando precisamos filtrar informações, o `grep` pode ser combinado com outros comandos através de pipes. Já o `wc` responde rapidamente quantas linhas, palavras ou bytes existem em um arquivo.

Por fim, o `diff` permite comparar versões e descobrir exatamente o que foi alterado, algo essencial ao trabalhar com arquivos de configuração.

Dominar esses comandos não significa apenas decorar opções. Significa aprender a investigar o sistema, encontrar informações e entender o que está acontecendo sem depender de uma interface gráfica.