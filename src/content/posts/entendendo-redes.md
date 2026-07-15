---

title: Entendendo redes com Wireshark, DNS e VPN
description: Entenda como o tráfego de rede funciona, como analisar pacotes com o Wireshark, o que muda ao utilizar uma VPN e por que esses conhecimentos são importantes para DevOps.
date: 2026-07-15
category: NETWORKING
tags: [networking, wireshark, vpn, dns, tcp-ip, devops, observabilidade, troubleshooting]
-----------------------------------------------------------------------------------------

# Entendendo redes com **Wireshark, DNS e VPN**

Quando acessamos um site, fazemos um `git push`, conectamos em uma máquina por SSH ou executamos um deploy, diferentes pacotes passam pela rede.

Para quem está utilizando o computador, o processo parece simples:

```txt
Meu computador
        ↓
Internet
        ↓
Servidor
```

Por trás dessa comunicação, porém, existem consultas DNS, endereços IP, portas, protocolos, criptografia e diferentes servidores trocando informações.

Ferramentas como o **Wireshark** permitem visualizar parte dessa comunicação e ajudam a entender o que realmente acontece quando uma aplicação se conecta a outro serviço.

Esse conhecimento é importante para quem trabalha com **DevOps**, principalmente na hora de investigar problemas envolvendo DNS, APIs, containers, servidores, pipelines, VPNs e serviços em nuvem.

## O que é um pacote de rede?

Um pacote é uma pequena unidade de dados transmitida pela rede.

Quando uma aplicação precisa enviar informações, os dados são divididos em pacotes. Esses pacotes carregam informações que ajudam a rede a entregá-los ao destino correto.

Entre essas informações, normalmente encontramos:

```txt
IP de origem
IP de destino
Protocolo utilizado
Porta de origem
Porta de destino
Tamanho do pacote
Informações específicas do protocolo
```

De forma simplificada, uma comunicação acontece assim:

```txt
Aplicação gera os dados
        ↓
Sistema operacional prepara os pacotes
        ↓
Pacotes são enviados pela interface de rede
        ↓
Roteadores encaminham os pacotes
        ↓
Servidor recebe e processa a solicitação
        ↓
Servidor envia uma resposta
```

## O que é o Wireshark?

O **Wireshark** é uma ferramenta utilizada para capturar e analisar pacotes de rede.

Ele permite observar o tráfego que entra e sai de uma interface de rede, como:

```txt
Wi-Fi
Ethernet
Interface de VPN
Loopback
Interfaces virtuais de containers
```

Durante uma captura, o Wireshark apresenta várias informações sobre os pacotes.

As principais colunas são:

```txt
Source       → origem do pacote
Destination  → destino do pacote
Protocol     → protocolo utilizado
Length       → tamanho do pacote
Info         → resumo da comunicação
```

Por exemplo, quando o computador envia uma consulta para um servidor DNS, podemos ter algo parecido com:

```txt
Source:       IP do computador
Destination:  IP do servidor DNS
Protocol:     DNS
Info:         Standard query
```

Quando o servidor DNS responde, a comunicação aparece no sentido contrário:

```txt
Source:       IP do servidor DNS
Destination:  IP do computador
Protocol:     DNS
Info:         Standard query response
```

Portanto, o mesmo endereço pode aparecer como origem ou como destino dependendo do sentido da comunicação.

```txt
Consulta:

Meu computador  →  Servidor DNS

Resposta:

Servidor DNS    →  Meu computador
```

## O que significam as cores do Wireshark?

As cores utilizadas pelo Wireshark são regras visuais para facilitar a identificação dos protocolos e de determinados comportamentos da rede.

Uma cor pode destacar tráfego TCP, enquanto outra pode representar DNS, UDP, encerramentos de conexão ou retransmissões.

Isso não significa automaticamente que determinado pacote seja perigoso ou malicioso.

As cores servem principalmente para organizar visualmente a captura.

```txt
Cor diferente
        ↓
Regra de coloração do Wireshark
        ↓
Protocolo ou comportamento específico
```

Também é possível visualizar ou modificar essas regras dentro do próprio Wireshark.

O mais importante é analisar o protocolo, os endereços, as portas e as informações apresentadas no pacote, em vez de concluir algo apenas pela cor.

## Entendendo origem e destino

Durante uma captura, o Wireshark mostra quem enviou e quem recebeu cada pacote.

Se o computador inicia uma conexão com um servidor, podemos ter:

```txt
Source:       Meu computador
Destination:  Servidor
```

Quando o servidor responde:

```txt
Source:       Servidor
Destination:  Meu computador
```

Em uma mesma comunicação, o sentido dos pacotes muda várias vezes.

```txt
Meu computador  →  Servidor
Meu computador  ←  Servidor
Meu computador  →  Servidor
Meu computador  ←  Servidor
```

Isso acontece porque existe uma troca de informações.

O cliente envia uma solicitação, o servidor responde e outros pacotes podem ser utilizados para confirmar o recebimento dos dados e controlar a conexão.

## O papel do DNS

O **DNS**, ou Domain Name System, é responsável por traduzir nomes de domínio para endereços IP.

Quando acessamos:

```txt
github.com
```

O computador precisa descobrir qual endereço IP corresponde a esse domínio.

O processo simplificado é:

```txt
Usuário acessa github.com
        ↓
Computador consulta o servidor DNS
        ↓
Servidor DNS retorna um endereço IP
        ↓
Computador conecta ao endereço recebido
```

No Wireshark, podemos filtrar consultas DNS utilizando:

```txt
dns
```

Também podemos procurar um domínio específico:

```txt
dns.qry.name contains "github"
```

Ao acessar o GitHub, podem aparecer consultas para diferentes domínios, como:

```txt
github.com
api.github.com
avatars.githubusercontent.com
github.githubassets.com
```

Isso acontece porque uma página moderna normalmente utiliza vários serviços.

O site pode carregar imagens, arquivos JavaScript, folhas de estilo, APIs e outros recursos hospedados em domínios diferentes.

Portanto, acessar apenas uma página pode gerar várias consultas DNS e várias conexões de rede.

## HTTP, HTTPS e criptografia

Em uma conexão HTTP sem criptografia, parte das informações transmitidas pode ser visualizada diretamente durante a captura.

Já no **HTTPS**, o conteúdo da comunicação é protegido por criptografia.

O Wireshark ainda consegue mostrar informações como:

```txt
IP de origem
IP de destino
Portas utilizadas
Quantidade de pacotes
Tamanho dos pacotes
Tempo da comunicação
Protocolo de transporte
```

Porém, normalmente não consegue mostrar diretamente o conteúdo da página, senhas, mensagens ou dados enviados dentro da conexão criptografada.

De forma simplificada:

```txt
Sem criptografia:

Cliente  →  Dados legíveis  →  Servidor
```

```txt
Com HTTPS:

Cliente  →  Dados criptografados  →  Servidor
```

Isso não significa que a conexão fique invisível.

A comunicação continua existindo e os pacotes continuam passando pela rede. O que muda é que o conteúdo fica protegido.

## O que acontece sem uma VPN?

Sem uma VPN, o tráfego normalmente sai diretamente pela interface de rede utilizada pelo computador.

```txt
Meu computador
        ↓
Roteador
        ↓
Provedor de internet
        ↓
Servidor de destino
```

O roteador e o provedor conseguem perceber que existe uma comunicação com determinados endereços IP.

Dependendo da configuração de DNS e do protocolo utilizado, também podem existir informações adicionais visíveis na rede.

No Wireshark, podemos observar conexões sendo estabelecidas diretamente entre o computador e diferentes servidores.

Por exemplo:

```txt
Meu computador  →  Servidor DNS
Meu computador  →  Servidor do GitHub
Meu computador  →  API
Meu computador  →  Servidor SSH
```

## O que muda quando utilizamos uma VPN?

Uma VPN cria um túnel criptografado entre o computador e o servidor da VPN.

Sem VPN, o fluxo é parecido com:

```txt
Meu computador
        ↓
Roteador
        ↓
Provedor
        ↓
Site ou servidor
```

Com uma VPN:

```txt
Meu computador
        ↓
Túnel criptografado
        ↓
Servidor da VPN
        ↓
Site ou servidor
```

Para a rede local e para o provedor, a comunicação principal passa a ser entre o computador e o servidor da VPN.

```txt
Meu computador  →  Servidor da VPN
```

Depois disso, o servidor da VPN realiza a conexão com o destino.

```txt
Servidor da VPN  →  Site
Servidor da VPN  →  API
Servidor da VPN  →  GitHub
```

Por isso, durante uma captura realizada na interface física, é comum aparecer principalmente o endereço IP do servidor da VPN.

Os diferentes acessos estão sendo transportados dentro do túnel criptografado.

## A VPN esconde todo o tráfego?

A VPN não faz o tráfego desaparecer.

Ela altera o caminho da comunicação e cria uma camada de criptografia entre o computador e o servidor da VPN.

O roteador ainda consegue perceber que existe uma conexão ativa.

O provedor também consegue perceber que o computador está transmitindo dados para algum endereço, que normalmente será o endereço do servidor da VPN.

O que muda é que eles não visualizam diretamente todos os destinos acessados dentro do túnel.

```txt
Sem VPN:

Provedor observa conexões com vários destinos
```

```txt
Com VPN:

Provedor observa principalmente a conexão com a VPN
```

O servidor da VPN, por outro lado, passa a ocupar uma posição importante no caminho da comunicação.

Por isso, utilizar uma VPN também envolve confiar no provedor responsável por esse serviço.

> Uma VPN muda em quem você precisa confiar. Ela não elimina completamente a necessidade de confiança.

## Interfaces de rede e VPN

Quando uma VPN é ativada, o sistema normalmente cria uma interface de rede virtual.

No Linux, podemos visualizar as interfaces com comandos como:

```bash
ip addr
```

ou:

```bash
ip link
```

Dependendo da tecnologia utilizada pela VPN, podem aparecer interfaces com nomes como:

```txt
tun0
wg0
nordlynx
```

A interface física continua existindo:

```txt
wlan0
enp0s31f6
```

A diferença é que o tráfego pode ser encaminhado pela interface virtual antes de sair pela interface física.

```txt
Aplicação
        ↓
Interface virtual da VPN
        ↓
Criptografia
        ↓
Interface física
        ↓
Servidor da VPN
```

Ao capturar pacotes no Wireshark, o resultado pode mudar dependendo da interface selecionada.

Na interface física, é possível observar principalmente o túnel criptografado.

Na interface virtual, dependendo da VPN e das permissões do sistema, pode ser possível observar o tráfego antes ou depois de ele passar pelo túnel.

## Protocolos que podem aparecer no Wireshark

Durante uma captura, vários protocolos podem aparecer.

Alguns dos mais comuns são:

```txt
ARP    → descoberta de dispositivos na rede local
DNS    → resolução de nomes
TCP    → comunicação confiável entre aplicações
UDP    → comunicação mais simples e rápida
TLS    → criptografia utilizada pelo HTTPS
ICMP   → mensagens de diagnóstico, como o ping
SSH    → acesso remoto seguro
HTTP   → comunicação web sem criptografia
QUIC   → protocolo utilizado por aplicações modernas
```

Cada protocolo tem uma responsabilidade diferente dentro da comunicação.

Por exemplo:

```txt
DNS encontra o endereço IP
TCP estabelece a conexão
TLS protege o conteúdo
HTTP envia a requisição da aplicação
```

Em uma navegação HTTPS tradicional, o fluxo pode ser representado assim:

```txt
Consulta DNS
        ↓
Endereço IP encontrado
        ↓
Conexão TCP
        ↓
Negociação TLS
        ↓
Requisição HTTPS
        ↓
Resposta do servidor
```

## Utilizando filtros no Wireshark

Uma captura pode gerar milhares de pacotes em poucos segundos.

Por isso, os filtros são fundamentais para encontrar somente as informações relevantes.

Para mostrar apenas tráfego DNS:

```txt
dns
```

Para mostrar apenas tráfego TCP:

```txt
tcp
```

Para mostrar apenas tráfego UDP:

```txt
udp
```

Para mostrar pacotes relacionados a um endereço IP:

```txt
ip.addr == 192.168.1.10
```

Para visualizar somente pacotes enviados por um endereço:

```txt
ip.src == 192.168.1.10
```

Para visualizar somente pacotes recebidos por um endereço:

```txt
ip.dst == 192.168.1.10
```

Para filtrar uma porta específica:

```txt
tcp.port == 22
```

Nesse caso, a porta `22` é normalmente utilizada pelo SSH.

Para filtrar HTTPS tradicional:

```txt
tcp.port == 443
```

Para filtrar o tráfego relacionado a um servidor VPN específico:

```txt
ip.addr == 169.150.226.31
```

Também podemos combinar filtros:

```txt
ip.addr == 169.150.226.31 && udp
```

Ou excluir algum protocolo:

```txt
not arp
```

Os filtros ajudam a transformar uma captura enorme em um conjunto menor de pacotes que podem ser analisados com mais facilidade.

## SSH e portas abertas

Uma dúvida comum é pensar que utilizar SSH sempre exige deixar a porta `22` aberta no computador.

Isso depende de quem inicia a conexão.

Quando utilizamos o computador para acessar outra máquina:

```bash
ssh usuario@servidor
```

O computador está iniciando uma conexão de saída.

```txt
Meu computador  →  Servidor SSH
```

Nesse caso, não é necessário manter um servidor SSH acessível pela internet no computador local.

Por outro lado, quando queremos acessar o nosso computador remotamente:

```txt
Notebook fora de casa
        ↓
Internet
        ↓
Meu computador
```

O computador precisa aceitar conexões de entrada.

Nesse cenário, seria necessário configurar corretamente o servidor SSH, firewall, autenticação e roteamento.

Abrir diretamente uma porta SSH para a internet exige bastante cuidado.

Em muitos casos, alternativas como VPN privada, Tailscale, WireGuard ou serviços de acesso com identidade podem ser mais adequadas.

## O que isso tem a ver com DevOps?

Redes fazem parte de praticamente todas as atividades de DevOps.

Uma aplicação pode estar funcionando corretamente no código, mas falhar porque não consegue se comunicar com outro serviço.

Alguns problemas comuns são:

```txt
DNS não resolve o domínio
Firewall bloqueia a porta
Container não alcança outro container
Load balancer não encaminha a requisição
Certificado TLS está inválido
Servidor não consegue acessar uma API
Pipeline não consegue baixar dependências
Aplicação não consegue conectar ao banco
Rota de rede está incorreta
VPN bloqueia ou redireciona o tráfego
```

Por isso, entender redes ajuda a investigar a diferença entre:

```txt
A aplicação está com erro
```

e:

```txt
A aplicação não consegue alcançar o serviço
```

Esses dois problemas podem parecer iguais para o usuário, mas possuem causas completamente diferentes.

## Exemplo de problema em uma pipeline

Imagine que uma pipeline precise baixar uma dependência.

```txt
Pipeline inicia
        ↓
Runner tenta acessar o repositório
        ↓
DNS não consegue resolver o domínio
        ↓
Download falha
        ↓
Pipeline termina com erro
```

O problema não está necessariamente no código ou no arquivo do workflow.

Pode ser uma falha de DNS ou de conectividade.

Outro exemplo:

```txt
Pipeline inicia
        ↓
Testes são executados
        ↓
Aplicação tenta acessar o banco
        ↓
Firewall bloqueia a porta 5432
        ↓
Testes falham
```

Nesse cenário, o banco pode estar funcionando normalmente, mas a comunicação entre os ambientes está bloqueada.

## Exemplo com containers

Em ambientes com Docker, containers utilizam redes virtuais para se comunicar.

```txt
Container da aplicação
        ↓
Rede Docker
        ↓
Container do banco de dados
```

A aplicação pode tentar acessar o banco utilizando:

```txt
localhost
```

Porém, dentro de um container, `localhost` representa o próprio container.

Em muitos casos, é necessário utilizar o nome do serviço:

```txt
postgres
```

ou:

```txt
database
```

O fluxo passa a ser:

```txt
Aplicação
        ↓
DNS interno do Docker
        ↓
Nome do serviço resolvido
        ↓
Conexão com o container do banco
```

Entender DNS e comunicação de rede ajuda a identificar esse tipo de problema.

## Exemplo com Kubernetes

No Kubernetes, a comunicação também depende de redes, DNS e serviços.

```txt
Pod da aplicação
        ↓
Service
        ↓
Pod de destino
```

O Kubernetes utiliza DNS interno para permitir que aplicações encontrem serviços pelo nome.

Por exemplo:

```txt
api-service
database-service
redis-service
```

Quando uma aplicação não consegue acessar outro serviço, algumas possíveis causas são:

```txt
Service configurado incorretamente
Selector não encontra os Pods
Porta errada
NetworkPolicy bloqueando o tráfego
DNS interno com problema
Pod de destino indisponível
```

O conhecimento de redes ajuda a entender onde a comunicação está falhando.

## Redes e observabilidade

No DevOps, observabilidade não significa apenas acompanhar CPU e memória.

Também precisamos observar como os serviços se comunicam.

Algumas informações importantes são:

```txt
Tempo de resposta
Quantidade de conexões
Erros de DNS
Pacotes perdidos
Retransmissões
Latência
Portas utilizadas
Conexões recusadas
Timeouts
```

Ferramentas de observabilidade podem mostrar métricas e logs, enquanto o Wireshark permite analisar os pacotes da comunicação de forma mais detalhada.

```txt
Métricas mostram que existe um problema
        ↓
Logs ajudam a localizar o serviço
        ↓
Captura de rede ajuda a entender a comunicação
```

## O Wireshark é uma ferramenta de segurança?

O Wireshark pode ser utilizado em segurança, mas ele não é apenas uma ferramenta de segurança.

Ele também pode ser utilizado para:

```txt
Diagnóstico de rede
Estudo de protocolos
Investigação de falhas
Análise de desempenho
Identificação de conexões
Troubleshooting de aplicações
Aprendizado de TCP/IP
```

Em segurança, ele pode ajudar a identificar comportamentos incomuns, conexões inesperadas e protocolos inseguros.

Porém, uma captura precisa ser analisada dentro de um contexto.

A existência de uma conexão desconhecida não significa automaticamente que o sistema foi comprometido.

Pode ser uma atualização, uma API externa, uma extensão do navegador, um serviço do sistema ou alguma dependência da aplicação.

## Cuidados ao realizar capturas

Capturas de rede podem conter informações sensíveis.

Dependendo do ambiente e dos protocolos utilizados, um arquivo de captura pode registrar:

```txt
Endereços IP
Domínios acessados
Nomes de máquinas
Consultas DNS
Tokens sem proteção
Cookies
Cabeçalhos HTTP
Informações de infraestrutura
```

Por isso, arquivos como `.pcap` e `.pcapng` não devem ser publicados sem análise.

Antes de compartilhar uma captura, é importante verificar se ela contém informações privadas ou dados da infraestrutura.

Também devemos capturar tráfego apenas em redes, sistemas e ambientes nos quais temos autorização.

## Resumindo

O Wireshark permite visualizar os pacotes que entram e saem de uma interface de rede.

Com ele, podemos analisar:

```txt
Origem e destino
Protocolos
Consultas DNS
Portas
Conexões TCP e UDP
Tráfego de VPN
Erros e retransmissões
```

Quando uma VPN está ativa, o tráfego é encaminhado por um túnel criptografado até o servidor da VPN.

Para a rede local e para o provedor, a comunicação principal passa a ser com esse servidor, enquanto os destinos finais ficam dentro do túnel.

Para DevOps, entender esses conceitos é importante porque muitos problemas de aplicações não estão diretamente no código.

Eles podem estar na comunicação entre os serviços.

O principal é guardar estas ideias:

> O Wireshark mostra os pacotes que passam pela interface de rede.

> Source é quem enviou o pacote e Destination é quem recebeu.

> As cores do Wireshark ajudam na organização e não representam necessariamente um ataque.

> O DNS transforma nomes de domínio em endereços IP.

> O HTTPS protege o conteúdo da comunicação, mas não faz a conexão desaparecer.

> A VPN cria um túnel criptografado entre o computador e o servidor da VPN.

> Em DevOps, entender redes é essencial para investigar falhas entre aplicações, containers, pipelines, servidores e serviços em nuvem.
