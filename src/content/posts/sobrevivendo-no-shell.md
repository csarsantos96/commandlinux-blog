---
title: "Sobrevivendo no shell: do FHS ao diff, o Linux que você usa todo dia"
description: "Anotações de estudo passadas a limpo: estrutura de diretórios, permissões, manipulação de arquivos, wildcards, compactação, links, processos e leitura de logs no terminal."
date: 2026-07-14
category: "LINUX"
tags: ["linux", "cli", "shell", "fhs", "sysadmin"]
---

Essas são minhas anotações de caderno enquanto estudo Linux a fundo — parte do curso **Linux para Cloud Native**, da LINUXtips, dentro da trilha do PICK 2026. Passei tudo a limpo aqui porque escrever é a melhor forma de fixar, e porque um dia isso vira referência rápida quando eu não lembrar de uma flag.

O post é longo de propósito: é o mapa completo do que se digita todo dia no terminal, do `ls` ao `diff`.



## Primeiros passos

Duas referências que aparecem em todo lugar:

- `.` → referência para o diretório atual
- `..` → referência para o diretório anterior (pai)

```bash
ls -lha /bin/ls   # lista o arquivo ls, que está dentro de /bin
```

E a leitura direta do kernel via `/proc`:

```bash
cd /proc
cat meminfo    # situação da memória RAM e swap
cat cpuinfo    # dados do processador
```

O `cpuinfo` mostra:

- modelo da CPU
- quantidade de núcleos lógicos / threads
- frequência atual ou máxima aproximada
- arquitetura (`x86_64`, por exemplo)
- cache
- flags e instruções suportadas — como virtualização (`vmx` na Intel, `svm` na AMD), `sse`, `avx`



## No Linux, tudo é um arquivo

Não é slogan, é literal:

- O disco rígido é representado por um arquivo em `/dev`
- A placa de rede também aparece como arquivo de dispositivo
- Informações sobre processos em execução ficam expostas em estruturas como `/proc`
- Configurações do sistema são arquivos de texto
- Logs também são arquivos de texto

É por isso que `cat`, `grep` e redirecionamento funcionam em praticamente tudo. Você não precisa de uma API para consultar a memória — só precisa ler um arquivo.



## Árvore de diretórios e o FHS

No Linux existe uma **única raiz**: `/`. Tudo parte dela. Não importa quantos discos, partições ou dispositivos você tenha — todos serão montados em algum ponto dentro dessa árvore. Nada de `C:`, `D:`, `E:`.

Essa estrutura segue o padrão **FHS** (*Filesystem Hierarchy Standard*):

| Diretório | O que é |
|---|---|
| `/` | A raiz de tudo. O ponto de partida da árvore inteira |
| `/home` | Diretórios pessoais dos usuários. Se seu usuário é `devops`, será `/home/devops`. O atalho `~` representa o seu |
| `/etc` | Onde fica a configuração do sistema: `/etc/ssh/sshd_config`, `/etc/hostname`, `/etc/passwd` |
| `/var` | Guarda os dados que mudam com frequência, como em `/var/log` |
| `/tmp` | Diretórios temporários |
| `/usr` | Contém programas, bibliotecas e documentação instalados pelo sistema |
| `/bin` e `/sbin` | Guardam binários essenciais. Em distros modernas, normalmente apontam para diretórios dentro de `/usr` |
| `/proc` e `/sys` | São filesystems virtuais gerados em tempo real pelo kernel. Exibem informações de processos, memória, CPU, drivers e kernel |
| `/dev` | Contém arquivos de dispositivo. Aqui também está o famoso `/dev/null`, o buraco negro do Linux |
| `/mnt` e `/media` | Pontos de montagem para dispositivos externos |
| `/opt` | Software de terceiros, instalado fora do gerenciador de pacotes |

> **Detalhe do FHS:** o fato de `/bin` e `/sbin` serem symlinks para dentro do `/usr` é resultado do *usr-merge*, adotado pela maioria das distros na última década. Faça `ls -l /bin` numa Fedora ou Ubuntu recente e você vai ver a seta.

---

## Lendo o `ls -l`

```bash
ls -l   # mostra detalhes: permissões, dono, tamanho, data etc.
```

Uma linha típica:

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

O primeiro caractere é o **tipo**:

- `-` arquivo comum
- `d` diretório
- `l` link simbólico
- `c` / `b` dispositivos de caractere / bloco

Os nove seguintes são três blocos de `rwx` (*read*, *write*, *execute*) para **dono**, **grupo** e **outros**.


## Manipulação de diretórios

### `ls` — listar conteúdo

| Comando | O que faz |
|---|---|
| `ls -a` | Lista todos os arquivos, inclusive os ocultos (os que começam com `.`) |
| `ls -l` | Traz o detalhamento: permissões, dono, tamanho, data |
| `ls -h` | Deixa o tamanho "humano": `1K`, `20M`, `2G` em vez de número gigante |
| `ls -S` | Classifica pelo tamanho |
| `ls -t` | Ordena por data de modificação |
| `ls -F` | Coloca um separador para identificar tipos (`/` diretório, `*` executável, `@` link) |
| `ls -i` | Mostra o número do inode |
| `ls -R` | Lista recursivamente |
| `ls --color=auto` | Usa cores para diferenciar tipos de arquivo, mas só quando a saída está sendo exibida diretamente no terminal |

A combinação que eu uso por reflexo:

```bash
ls -lha    # detalhado + ocultos + tamanho legível
```

O detalhe do `--color=auto` é mais interessante do que parece: se você fizer `ls | grep algo`, a saída não vai para o terminal, vai para o pipe — e o `ls` desliga as cores automaticamente. É por isso que os códigos de escape ANSI não vazam para o seu `grep`.

### `mkdir` — criar diretórios

```bash
mkdir diretorio
mkdir -p gitopops/produtos/checkout   # cria todos os diretórios intermediários
```

O `-p` significa **parents**: ele cria os diretórios "pais" necessários no caminho. Mesmo que `gitopops` ainda não exista, ele cria primeiro e depois desce. Bônus: com `-p` o comando não falha se o diretório já existir — por isso ele aparece em tanto script de automação.

### `rmdir` — remover diretórios vazios

```bash
rmdir pasta_vazia
rmdir -p Pasta2/Pasta2_2   # remove Pasta2_2 e tenta remover os pais, se ficarem vazios
```

O `rmdir` **só** remove diretório vazio. É uma proteção, não uma limitação.

### `cd`, `tree` e `touch`

- `cd` = *change directory*
- `tree` = mostra a estrutura do diretório em árvore
- `touch` = cria arquivos vazios (e atualiza o timestamp de arquivos existentes)


## Manipulação de arquivos

### `cp` — copiando

Sintaxe: `cp [origem] [destino]`

```bash
cp original.txt copia.txt               # copiando um arquivo
cp original.txt /tmp/                    # copiando um arquivo para um diretório
cp -r projetos/ /tmp/backup-projetos/    # copiando um diretório inteiro (obrigado usar -r)
```

| Flag | O que faz |
|---|---|
| `-v` | Verbose: mostra na tela o que está sendo copiado |
| `-r` / `-R` | Recursivo — obrigatório para diretórios |
| `-a` | Modo *archive*: preserva permissões, links e timestamps |
| `-n` | Copia sem sobrescrever o que já existe |
| `-u` | Copia só se a origem for mais nova que o destino |
| `-s` | Cria links simbólicos em vez de copiar |

### `mv` — movendo e renomeando

No Linux, mover e renomear são **a mesma operação**:

```bash
mv relatorio.txt /tmp/                                          # move para outro diretório
mv relatorio.txt relatorio-final.txt                            # renomeia
mv /tmp/relatorio.txt /home/devops/documentos/relatorio-v2.txt  # move e renomeia de uma vez
```

### `rm` — removendo

```bash
rm arquivo-inutil.txt      # remove um arquivo
rm -r pasta-antiga/        # remove um diretório e tudo dentro dele
rm -rf pasta/              # força a remoção, sem confirmação
```

O `-r` é **recursivo**: ele entra em todas as subpastas e remove tudo — arquivos, subdiretórios, arquivos dentro dos subdiretórios.

O `-f` é **força**: não pede confirmação, não reclama se o arquivo não existir. Simplesmente apaga tudo silenciosamente.

> ⚠️ **Cuidado extremo com `rm -rf`.** Não pede confirmação, não tem lixeira e não tem desfazer. Antes de rodar com glob (`*`), troque o `rm` por `ls` e confira exatamente o que seria apagado.


## Wildcards (curingas)

E se você quiser copiar todos os arquivos `.log`? Ou deletar todos os `.tmp`? Para isso existem os **wildcards** — padrões que o *shell* expande em nomes de arquivos antes de o comando sequer rodar.

### `*` — qualquer coisa (zero ou mais caracteres)

```bash
ls /etc/*.conf              # todos os .conf em /etc
cp *.log /tmp/backup-logs/  # copia todos os .log do diretório atual
rm /tmp/*.tmp               # remove todos os .tmp de /tmp
```

O `*` é o mais usado. Ele substitui qualquer sequência de caracteres:

- `*.log` significa "qualquer coisa que termine com `.log`"
- `backup-*` significa "qualquer coisa que comece com `backup-`"

### `?` — exatamente um caractere

```bash
ls arq_?.txt     # arq_1.txt, arq_a.txt — mas não arq_10.txt
ls arq_??.txt    # arq_10.txt, arq_ab.txt
```

### `[ ]` — um caractere dentro de um conjunto ou intervalo

```bash
ls m[a-c]*       # arquivos que começam com m e cuja segunda letra vai de a até c
ls arq_[123].txt # arq_1.txt, arq_2.txt, arq_3.txt
```

### `which` — onde está o binário?

```bash
which python3    # mostra o caminho do executável que o shell vai chamar
```


## Empacotando e compactando

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

Regra mnemônica: **c**reate, e**x**tract, lis**t** — sempre acompanhados de `-f` (file). O `-z` é gzip; use `-j` para bzip2 e `-J` para xz.


## Links simbólicos e hard links

### Symlink (soft link)

É um **ponteiro para um caminho** de outro arquivo. Se o arquivo original for movido ou deletado, o link quebra.

```bash
# Criando um link simbólico
ln -s /etc/nginx/nginx.conf ~/nginx-config

# Verificando
ls -l ~/nginx-config
lrwxrwxrwx 1 devops devops 23 Feb 16 10:30 nginx-config -> /etc/nginx/nginx.conf
```

O `l` no início indica link simbólico. A seta mostra para onde ele aponta. Quando você fizer `vim ~/nginx-config`, estará editando o arquivo original em `/etc/nginx/nginx.conf`.

### Hard link

Aponta **diretamente para os dados no disco** (o inode), não para o caminho. Se o arquivo original for renomeado ou movido dentro do mesmo filesystem, o hard link continua funcionando. Mas ele **não pode** apontar para diretório nem cruzar filesystems diferentes.

```bash
# Criando um hard link
ln /etc/hostname ~/hostname-link

# Ambos apontam para o mesmo inode
ls -li /etc/hostname ~/hostname-link
```

O `-i` do `ls` mostra o número do inode — se for o mesmo nos dois, é o mesmo arquivo físico com dois nomes.


## Visualizando e editando texto

### `cat` — direto ao ponto

O `cat` (*concatenate*) despeja o conteúdo inteiro de um arquivo no terminal, de uma vez.

```bash
cat /etc/hostname
```

É perfeito para arquivos pequenos: um hostname, uma chave pública, um arquivo de configuração de poucas linhas. Mas se você rodar `cat` em um arquivo de 10.000 linhas, a saída vai inundar o terminal e você vai perder o controle do que está lendo. Para esse caso, use o `less`.

| Flag | O que faz |
|---|---|
| `cat -n` | Numera **todas** as linhas |
| `cat -b` | Numera só as linhas com texto |
| `cat -E` | Mostra `$` no fim de cada linha |
| `cat -T` | Mostra TAB como `^I` |

```bash
cat -n /etc/ssh/sshd_config
```

Isso é ouro quando alguém diz "o erro está na linha 47" e você precisa ir direto ao ponto sem contar linhas na mão.

Os `-E` e `-T` salvam vidas quando você está caçando espaço em branco invisível ou fim de linha bizarro num arquivo de config.

**`cat` com múltiplos arquivos:** se você passar mais de um nome, ele concatena (daí o nome) a saída:

```bash
cat /etc/hostname /etc/os-release
```

Mostra o conteúdo dos dois arquivos, um depois do outro. Parece simples, mas é a base de muitas operações com redirecionamento.

**Primos compactados:**

| Comando | O que faz |
|---|---|
| `zcat` | Lê arquivo `.gz` sem descompactar |
| `bzcat` | Lê arquivo `.bz2` sem descompactar |
| `xzcat` | Lê arquivo `.xz` sem descompactar |

**Invertendo:**

```bash
tac arquivo.txt      # mostra o arquivo de baixo para cima
tac -s "," arquivo   # inverte usando um separador específico
```

### `echo` e redirecionamento

```bash
echo "Texto" > arquivo.txt     # sobrescreve
echo "Texto" >> arquivo.txt    # anexa ao final
```

### `less` — navegação controlada

O `less` abre o arquivo em modo paginado, sem despejar tudo na tela de uma vez. Você navega com calma:

```bash
less /var/log/syslog
```

Os comandos de navegação dentro do `less` são essenciais:

| Tecla | O que faz |
|---|---|
| `/termo` | Inicia uma busca |
| `n` | Avança para a próxima ocorrência |
| `N` | Volta à ocorrência anterior |
| `G` | Pula para o final do arquivo |
| `g` | Volta ao início |
| `espaço` | Avança uma página inteira |
| `b` | Recua uma página inteira |
| `q` | Sai |

O `less` é o **paginador padrão** de vários comandos. Quando você roda `man ssh` para ler o manual do SSH, o conteúdo abre no `less`. Os mesmos atalhos funcionam ali dentro. Saber navegar no `less` é saber navegar em toda a documentação do Linux.

Uma flag poderosa é o `less +F`, que transforma o `less` em modo *follow* — equivalente ao `tail -f`, mas com a vantagem de poder pausar com `Ctrl+C`, navegar pelo arquivo e depois retomar o fluxo com `F`.

```bash
less +F /var/log/syslog
```

### `more`

Também pagina, mas sem a função de voltar. O `less` é estritamente superior. (Sim, a piada é essa mesma: *less is more*.)


## `head` e `tail` — recortes cirúrgicos

O `head` mostra as primeiras linhas de um arquivo (10 por padrão):

```bash
head /etc/passwd
```

O `tail` mostra as últimas:

```bash
tail /var/log/syslog
```

Para especificar quantas linhas você quer ver, use a flag `-n`:

```bash
head -n 5 /etc/passwd
tail -n 50 /var/log/auth.log
```

O `head` é ótimo para visualizar rapidamente a estrutura de um arquivo de configuração sem carregar ele inteiro. Já o `tail` é indispensável para logs, porque a informação mais recente está sempre no final.

### `tail -f` — o monitor de logs em tempo real

Esse é um dos comandos que mais vamos usar na carreira. O `tail -f` (*follow*) não apenas mostra as últimas linhas: ele **fica aberto** e mostra novas linhas conforme elas são escritas no arquivo.

```bash
tail -f /var/log/syslog
```

O terminal vira um monitor de logs ao vivo. Enquanto o `tail -f` estiver rodando, qualquer serviço que escreva no syslog aparece instantaneamente na tela. É assim que se investiga problema em tempo real: abre o log e observa o que está acontecendo enquanto você reproduz o erro.

Combinar com `grep` filtra apenas o que te interessa:

```bash
tail -f /var/log/auth.log | grep "Failed password"
```

Agora você vê apenas tentativas de login que falharam, em tempo real. Perfeito para detectar força bruta no SSH, por exemplo.

O `|` (pipe) pega a saída de um comando e joga como entrada para o próximo. Para sair do `tail -f`, aperte `Ctrl+C`.


## `wc` — contando linhas, palavras e bytes

O `wc` (*word count*) é um comando simples que responde perguntas rápidas sobre o conteúdo de um arquivo:

```bash
wc /var/log/syslog
```

A saída mostra três números: total de linhas, total de palavras e total de bytes. Na maioria das vezes, você só quer a contagem de linhas:

```bash
wc -l /var/log/syslog
```

Isso responde a perguntas como "quantas linhas tem esse log?", "esse arquivo de configuração é grande?", "quantas entradas existem no `/etc/passwd`?" (cada linha = um usuário).

Parece trivial, mas é um dos comandos mais usados em scripts e pipelines:

```bash
grep -c "ERROR" app.log          # conta ocorrências direto
ps aux | grep nginx | wc -l      # quantos processos nginx estão rodando
```


## `diff` — comparando arquivos

O `diff` compara dois arquivos e mostra exatamente o que mudou entre eles:

```bash
diff /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
```

As linhas que começam com `<` existem apenas no primeiro arquivo. As que começam com `>` existem apenas no segundo.

Quando você faz backup de um arquivo antes de editá-lo (e sempre deve fazer), o `diff` mostra exatamente o que alteramos.

Uma versão mais visual é o `diff -u` (*unified format*), que mostra as diferenças com contexto, no mesmo formato que o Git usa:

```bash
diff -u original.conf modificado.conf
```

As linhas com `-` foram removidas e as com `+` foram adicionadas. Quem já usou `git diff` vai reconhecer o formato imediatamente — porque é literalmente o mesmo.


## `grep`, `sort` e amigos

- `grep` — procura texto dentro de arquivos ou na saída de outro comando
- `sort` — ordena a lista
- `ln` — cria links (visto acima)
- `mount` — conecta um disco, partição, pen drive, ISO ou sistema de arquivos a uma pasta do Linux
- `id` — mostra informações do usuário atual: grupo e permissões



## Data e hora

```bash
date                        # mostra a data
sudo date -s "..."          # configura a data
date -u                     # mostra o horário UTC
date +%d/%m/%Y              # muda o formato de exibição
date +%d-%m-%y
```


## `df` — espaço em disco

| Comando | O que faz |
|---|---|
| `df` | Mostra o espaço livre em cada partição montada no sistema operacional |
| `df -H` | Formato "humano", usando base 1000 |
| `df -h` | Formato humano, usando base 1024 |
| `df -m` | Mostra tudo em megabytes |
| `df -l` | Mostra apenas sistemas de arquivos locais |
| `df -i` | Mostra o uso de **inodes** do sistema de arquivos |
| `df -T` | Mostra o uso do disco incluindo o tipo do sistema de arquivos |
| `df -Th` | Formato humano **e** tipo de FS — o mais útil no dia a dia |

### O que é inode?

Um inode é uma espécie de **"ficha interna"** que o Linux usa para controlar arquivos e diretórios. Cada arquivo usa 1 inode.

Por isso o `df -i` importa: ele mostra se o sistema ainda tem capacidade para criar novos arquivos e diretórios — não apenas se tem GB livres. Dá para ter 200 GB sobrando e mesmo assim receber `No space left on device` porque os inodes acabaram. É um clássico em servidor cheio de arquivos pequenos, tipo cache de sessão.



## Gerenciamento e execução de processos

```bash
ps                  # mostra os processos rodando no terminal atual
ps -a               # todos os processos em execução em outros terminais do meu usuário
ps aux              # todos os processos do sistema, formato completo
ps aux | grep nginx # filtra por um processo específico
```

### O `/proc`

O `/proc` é um **sistema de arquivos virtual**. Ele não é uma pasta comum no disco.

Ele mostra informações do kernel, processos, memória, CPU, rede, etc. É tipo um painel de diagnóstico do Linux — cada processo em execução tem um diretório `/proc/<PID>` com tudo sobre ele.

Ferramentas como `ps` e `top` não têm mágica nenhuma: elas apenas leem o `/proc` e formatam a saída.



## Fechando

Nada aqui é exótico, e esse é exatamente o ponto: são os comandos que você digita cem vezes por dia sem pensar — até o dia em que precisa de uma flag específica e não lembra.

Se eu tivesse que escolher os cinco que mais mudaram meu dia a dia da lista acima, seriam: `tail -f | grep` (investigação em tempo real), `less` (navegação em qualquer documentação), `diff -u` (antes de qualquer mudança em produção), `df -Th` (o primeiro comando quando algo quebra) e `ls -lha` (puro reflexo).

Deixo essa página aberta como referência, e sugiro que você monte a sua.

**Próximas anotações:** permissões (`chmod`, `chown`, `umask`), gerenciamento de pacotes e systemd.



## Referências

- [Filesystem Hierarchy Standard (FHS 3.0)](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html) — a especificação oficial mantida pela Linux Foundation. É a fonte canônica para a estrutura de diretórios.
- [The Linux Kernel Documentation — `/proc` filesystem](https://docs.kernel.org/filesystems/proc.html) — documentação oficial do kernel sobre o `/proc`.
- [GNU Coreutils Manual](https://www.gnu.org/software/coreutils/manual/coreutils.html) — o manual oficial de praticamente todos os comandos citados aqui (`ls`, `cp`, `mv`, `rm`, `cat`, `head`, `tail`, `wc`, `df`, `sort`).
- [LINUXtips — Linux para Cloud Native](https://www.linuxtips.io/) — o curso que originou essas anotações, dentro da trilha PICK.
- E, claro: `man <comando>`. A melhor documentação já está instalada na sua máquina.