---
title: "Da VM à EC2: três desafios práticos de Linux para Cloud Native"
description: "Minha jornada nos três primeiros desafios do Linux para Cloud Native: SSH entre ambientes, organização do filesystem, rsync, Vim, VS Code Remote SSH e logs em tempo real."
date: 2026-07-27
category: LINUX
tags: [linux, cloud-native, ssh, vim, vscode, rsync, python, redis]
draft: false
---

# Da VM à EC2: três desafios práticos de Linux para Cloud Native

Estudar Linux de verdade vai muito além de decorar comandos. A parte mais importante é entender **onde cada comando se encaixa em um fluxo real de trabalho**.

Nos três primeiros desafios da formação Linux para Cloud Native, montei um pequeno ambiente híbrido com uma VM local e uma instância EC2, organizei a aplicação seguindo uma estrutura inspirada no FHS, transferi arquivos com `rsync`, editei código diretamente no servidor e acompanhei logs em tempo real.

Neste post, registro os principais passos, os erros que apareceram e o que aprendi em cada etapa.

> **Nota de segurança:** endereços IP e outras informações de infraestrutura foram censurados nas imagens antes da publicação. Chaves privadas, tokens e senhas nunca devem aparecer em screenshots ou repositórios.



## Desafio 1 — Setup híbrido com VM, EC2 e SSH

O primeiro objetivo foi preparar dois ambientes Linux:

- uma VM Ubuntu local;
- uma instância Ubuntu na AWS EC2;
- acesso aos dois ambientes por SSH;
- aliases no arquivo `~/.ssh/config`;
- autenticação por chave;
- atualização dos pacotes nos dois servidores.

A ideia era evitar comandos enormes como:

```bash
ssh -i ~/.ssh/minha-chave.pem usuario@endereco-do-servidor
```

Com aliases configurados, o acesso ficou mais simples:

```bash
ssh vm
ssh ec2
```

Um exemplo de configuração segura seria:

```text
Host vm
    HostName ENDERECO_DA_VM
    User usuario-da-vm
    IdentityFile ~/.ssh/id_ed25519

Host ec2
    HostName ENDERECO_DA_EC2
    User ubuntu
    IdentityFile ~/.ssh/chave-ec2.pem
```

Os valores reais de `HostName` não devem ser publicados.

### Validando os ambientes

Depois de conectar, usei comandos simples para confirmar em qual máquina estava:

```bash
whoami
hostname
pwd
```

Também executei a atualização dos pacotes nos dois terminais:

```bash
sudo apt update
```

![VM local e EC2 acessadas por SSH, com informações sensíveis censuradas](./images/cap1-ssh-hibrido-censurado-final.png)

### O que aprendi

O arquivo `~/.ssh/config` não é apenas uma conveniência. Ele centraliza os parâmetros de conexão e reduz erros ao acessar diferentes máquinas.

Também ficou mais claro que:

- a VM local e a EC2 são ambientes independentes;
- cada máquina possui usuários, processos e filesystem próprios;
- uma chave privada deve permanecer apenas no computador autorizado;
- o arquivo da chave deve ter permissões restritas, normalmente `chmod 600`;
- nomes de hosts, IPs públicos, tokens e conteúdo de chaves não devem aparecer em posts ou screenshots.



## Desafio 2 — Shell, FHS, diretórios e transferência com rsync

No segundo desafio, preparei uma estrutura para a aplicação `giropops-status` em `/opt`.

A estrutura criada foi:

```text
/opt/giropops-status/
├── app/
├── backups/
├── config/
└── logs/
```

O comando utilizado foi:

```bash
sudo mkdir -p /opt/giropops-status/{app,backups,config,logs}
```

A opção `-p` faz o `mkdir` criar os diretórios intermediários quando necessário e não retornar erro caso eles já existam.

Depois, ajustei o proprietário dos diretórios:

```bash
sudo chown -R "$USER":"$USER" /opt/giropops-status
```

### Conferindo com `ls -lah`

Para validar a estrutura, utilizei:

```bash
ls -lah /opt/giropops-status
```

Cada opção tem uma função:

- `-l`: exibe a listagem detalhada;
- `-a`: inclui arquivos ocultos;
- `-h`: apresenta tamanhos em formato legível, como `4K` e `32M`.

### Transferindo a aplicação

Usei `rsync` para transferir os arquivos entre os ambientes:

```bash
rsync -av origem/ destino/
```

As opções principais foram:

- `-a`: modo arquivo, preservando atributos importantes;
- `-v`: modo verboso, mostrando os arquivos processados.

Em outra etapa, empacotei os arquivos e transferi o arquivo compactado:

```bash
tar -czf /tmp/giropops-app.tar.gz .
rsync -avz /tmp/giropops-app.tar.gz ec2:/tmp/
```

![Estrutura da aplicação e transferência com rsync](./images/cap2-estrutura-rsync-censurado-final.png)

### O detalhe da barra final no rsync

Um aprendizado importante foi a diferença entre:

```bash
rsync -av pasta/ destino/
```

e:

```bash
rsync -av pasta destino/
```

Com a barra final, o `rsync` copia **o conteúdo** de `pasta`. Sem a barra, ele copia **o próprio diretório** para dentro do destino.

É um caractere pequeno com potencial para criar uma árvore de diretórios digna de filme de ficção científica.



## Desafio 3 — Vim, VS Code Remote SSH e logs em tempo real

No terceiro desafio, trabalhei com edição de arquivos diretamente no servidor.

As principais tarefas foram:

- navegar pelo código com `less`;
- procurar funções dentro do arquivo;
- alterar `APP_VERSION` usando Vim;
- instalar um `.vimrc`;
- editar o `<title>` pelo VS Code Remote SSH;
- criar um ambiente virtual Python;
- instalar e iniciar o Redis;
- executar a aplicação Flask;
- acompanhar os logs com `tail -f`.

### Navegando com less

Para abrir o arquivo:

```bash
less app.py
```

Dentro do `less`, procurei uma função digitando:

```text
/def check_service
```

Os atalhos utilizados foram:

- `n`: próxima ocorrência;
- `N`: ocorrência anterior;
- `q`: sair.

Também listei as variáveis de ambiente esperadas pela aplicação:

```bash
grep '^[A-Z_]* = os.environ' app.py
```

### Alterando a versão com Vim

Abri o arquivo diretamente no servidor:

```bash
vim app.py
```

No Vim, alterei o valor padrão de `APP_VERSION`, salvei e saí com:

```vim
:wq
```

Depois validei a alteração:

```bash
grep -n 'APP_VERSION' app.py
```

### Configurando o `.vimrc`

O pacote do exercício trouxe um arquivo didático:

```bash
cp /opt/giropops-status/app/dotfiles/vimrc.example ~/.vimrc
```

A configuração habilitou recursos como:

```vim
set number
set tabstop=4
set shiftwidth=4
set expandtab
set autoindent
syntax on
filetype plugin indent on
```

![Validação da APP_VERSION, tag title e configurações do vimrc](./images/cap3-vimrc-evidencias-censurado-final.png)

### Editando remotamente com VS Code

No computador local, instalei a extensão **Remote - SSH**, da Microsoft.

Depois:

1. abri a paleta com `Ctrl+Shift+P`;
2. selecionei `Remote-SSH: Connect to Host`;
3. escolhi o alias `vm`;
4. abri `/opt/giropops-status/app`;
5. editei `templates/index.html`;
6. salvei a alteração diretamente na VM.

O terminal integrado do VS Code já estava conectado ao servidor, então validei com:

```bash
hostname
pwd
whoami
grep -n '<title>' templates/index.html
```

![Arquivo index.html aberto diretamente na VM pelo VS Code Remote SSH](./images/cap3-vscode-remote-censurado-final.png)

### Python, Redis e ambiente virtual

Criei um ambiente virtual para evitar instalar dependências no Python do sistema:

```bash
cd /opt/giropops-status/app
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Confirmei o interpretador ativo:

```bash
which python
which pip
python --version
```

Para o armazenamento da aplicação, instalei o Redis:

```bash
sudo apt install -y redis-server
sudo systemctl enable --now redis-server
redis-cli ping
```

O retorno esperado foi:

```text
PONG
```

### Logging configurável e tail -f

A versão atualizada da aplicação aceita as variáveis:

```bash
LOG_FILE=/tmp/giropops-logs/app.log
LOG_LEVEL=INFO
```

Iniciei a aplicação em segundo plano:

```bash
mkdir -p /tmp/giropops-logs

LOG_FILE=/tmp/giropops-logs/app.log LOG_LEVEL=INFO python3 app.py &
```

Em outro terminal, acompanhei o arquivo em tempo real:

```bash
tail -f /tmp/giropops-logs/app.log
```

Para filtrar somente eventos de check:

```bash
tail -f /tmp/giropops-logs/app.log |
grep --line-buffered -i 'check'
```

Também testei as rotas da API:

```bash
curl -X POST   -H 'Content-Type: application/json'   -d '{"name":"google","url":"https://google.com"}'   http://localhost:5000/api/services

curl -X POST http://localhost:5000/api/check
```

A aplicação retornou HTTP `201` no cadastro e HTTP `200` na verificação, marcando o serviço como `UP`.

<!-- Opcional: adicione aqui uma screenshot dos dois terminais,
um com tail -f e outro executando as requisições curl.

![Logs acompanhados em tempo real](./images/cap3-tail-f.png)
-->

Quando terminei, saí do `tail` com `Ctrl+C` e parei a aplicação no terminal em que ela foi iniciada:

```bash
kill %1
```



## Erros que apareceram no caminho

Nem tudo funcionou de primeira — e essa foi uma das melhores partes do laboratório.

### O arquivo vimrc.example não existia na VM

A primeira tentativa retornou:

```text
cp: cannot stat '.../vimrc.example': No such file or directory
```

O arquivo existia no projeto local, mas não tinha sido sincronizado para a VM. A solução foi localizar o arquivo e copiar novamente a pasta `dotfiles`.

### O ambiente virtual não foi criado

O Python informou que `ensurepip` não estava disponível. Instalei os pacotes necessários:

```bash
sudo apt install -y python3-venv python3-full
rm -rf .venv
python3 -m venv .venv
```

### A porta 5000 já estava ocupada

Ao iniciar uma segunda instância da aplicação, o Flask respondeu:

```text
Address already in use
Port 5000 is in use by another program.
```

Identifiquei o processo:

```bash
sudo ss -ltnp | grep ':5000'
jobs -l
```

E encerrei a instância anterior:

```bash
kill %1
```

### O LOG_FILE não funcionava na versão antiga

A variável `LOG_FILE` não criava o arquivo porque o `app.py` inicial ainda não implementava `FileHandler`.

Confirmei com:

```bash
grep -nE 'LOG_FILE|LOG_LEVEL|FileHandler|basicConfig' app.py
```

Depois de sincronizar a versão atualizada, o código passou a configurar o logging corretamente.



## Conclusão

Esses três desafios conectaram vários conceitos que normalmente são estudados de forma isolada:

- SSH e autenticação por chave;
- VM local e infraestrutura em nuvem;
- filesystem Linux e diretórios em `/opt`;
- transferência de arquivos com `rsync`;
- edição com Vim e VS Code Remote SSH;
- isolamento de dependências com `venv`;
- Redis como serviço do sistema;
- logs configuráveis;
- diagnóstico de processos e portas.

Mais do que executar comandos, o exercício mostrou uma rotina próxima do trabalho real: preparar servidores, transferir aplicações, editar arquivos remotamente, validar serviços e investigar erros.

É nesse ponto que o terminal deixa de ser apenas uma tela preta e começa a virar uma ferramenta de engenharia.
