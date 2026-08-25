---
title: "Anatomia dos repositórios do APT: sources.list, componentes e PPAs"
description: "De onde o APT baixa os pacotes, os quatro componentes de um repositório Ubuntu (main, restricted, universe, multiverse) e os cuidados ao adicionar um PPA de terceiros."
date: 2026-08-13
category: LINUX
tags: [linux, apt, sources.list, ppa, ubuntu, repositorios]
---

Continuando as anotações sobre [gerenciamento de pacotes e o APT](/posts/introducao-ao-gerenciamento-de-pacotes-apt), parte do curso **Linux para Cloud Native** da LINUXtips, dentro da trilha do PICK 2026, ficou a pergunta em aberto: se a confiança do APT depende do repositório, o que exatamente define um repositório, e o que muda quando eu confio em um fora da distro oficial?

> As saídas apresentadas são exemplos. Nomes, caminhos e versões podem variar de acordo com o sistema.

# De onde o APT baixa os pacotes

Toda a configuração de repositório do APT vive em arquivos texto simples:

```text
/etc/apt/sources.list
/etc/apt/sources.list.d/*.list
```

O `sources.list` é o arquivo principal, e o diretório `sources.list.d/` guarda arquivos `.list` adicionais, um por repositório extra configurado, o que evita ficar editando um arquivo gigante toda vez que uma fonte nova é adicionada.

Cada linha desses arquivos aponta para um repositório e, no caso do Ubuntu, para até quatro componentes diferentes dentro dele.

# Os quatro componentes de um repositório Ubuntu

## Main

Contém o software livre e de código aberto suportado oficialmente pela Canonical. É a base da distro, o que o próprio sistema depende para funcionar. Recebe correção de bugs e de segurança diretamente da Canonical, dentro do ciclo de vida do LTS (5 anos de suporte).

## Restricted

Contém drivers proprietários, o exemplo clássico é driver de placa de vídeo NVIDIA e de placa de Wi-Fi Broadcom. A Canonical oferece algum suporte de segurança para esses pacotes, mas o código-fonte não é aberto, então a Canonical não tem controle total sobre ele como tem sobre o `main`.

## Universe

Mantido pela comunidade, com uma quantidade muito maior de pacotes open source (coisas como Nginx, Docker, Node), com suporte da comunidade em vez de suporte oficial da Canonical. Se aparece um bug num pacote do `universe`, quem corrige é a comunidade, não existe garantia de qualidade ou de SLA da Canonical sobre ele.

## Multiverse

Contém software com restrição de licença ou algum problema jurídico envolvido, geralmente coisa não totalmente livre ou com questão de patente/copyright numa jurisdição específica. Instalar algo do `multiverse` é por conta e risco de quem instala.

Um efeito prático disso: quando um pacote aparece como "não encontrado" mesmo existindo, muitas vezes é porque o repositório `universe` ou `multiverse` não está habilitado naquela instalação, e não porque o pacote não existe.

# PPAs: repositórios de terceiros

Além dos quatro componentes oficiais, existem os **PPAs** (*Personal Package Archives*): repositórios mantidos por terceiros, um desenvolvedor independente, um projeto open source, ou uma empresa, hospedados fora da estrutura oficial da distro.

Para adicionar um:

```bash
sudo add-apt-repository ppa:nginx/stable
```

O ponto importante aqui: adicionar um PPA significa confiar em alguém de fora da cadeia oficial da distro. Antes de adicionar qualquer PPA vale se perguntar:

* Quem mantém esse PPA?
* Dá para confiar nessa pessoa ou organização?

Um PPA malicioso pode introduzir pacotes com *backdoor* no servidor, e como o `add-apt-repository` já cuida de importar a chave GPG do PPA automaticamente, o próprio mecanismo de confiança que protege contra pacote adulterado passa a proteger... a versão que o mantenedor do PPA decidiu publicar. A verificação de assinatura continua funcionando, só que a assinatura passa a ser de alguém de fora da distro oficial.

Por isso, antes de adicionar, vale verificar a reputação do PPA no [Launchpad](https://launchpad.net/) ou no site oficial do projeto, em vez de confiar cegamente porque um tutorial na internet mandou rodar aquele comando.

# Resumo

* Configuração de repositório: `/etc/apt/sources.list` e `/etc/apt/sources.list.d/*.list`
* `main`: software livre oficial, suportado pela Canonical, base do sistema
* `restricted`: drivers proprietários (NVIDIA, Wi-Fi Broadcom), suporte parcial
* `universe`: software open source mantido pela comunidade, sem garantia oficial da Canonical
* `multiverse`: software com restrição de licença ou problema jurídico, por conta e risco
* Pacote "não encontrado" costuma significar `universe`/`multiverse` desabilitado
* Adicionar um PPA: `sudo add-apt-repository ppa:usuario/nome`
* Antes de adicionar um PPA: checar quem mantém e a reputação no Launchpad ou site oficial

# Conclusão

O que fica dessa anotação é que "repositório configurado" não é uma caixa preta única, são camadas com níveis de confiança bem diferentes: do `main`, mantido e suportado oficialmente, até o `multiverse` e os PPAs, onde a responsabilidade pela segurança do pacote sai da Canonical e vai para quem decidiu confiar naquela fonte.

Isso muda a forma como eu vou olhar para um `add-apt-repository` copiado de um tutorial daqui para frente: não é só mais um comando para rodar, é uma decisão de estender a cadeia de confiança do sistema para uma pessoa ou organização que eu talvez nunca tenha ouvido falar antes.

## Referências

* `man apt`, `man sources.list`, `man add-apt-repository` — documentação oficial dos comandos e do formato do arquivo.
* [Ubuntu Wiki — Repositories](https://help.ubuntu.com/community/Repositories/Ubuntu) — referência sobre os componentes main, restricted, universe e multiverse.
* [Launchpad](https://launchpad.net/) — plataforma onde a maioria dos PPAs é hospedada e onde dá para checar a reputação de um mantenedor.
* [LINUXtips — Linux para Cloud Native](https://linuxtips.io/linux-para-cloud-native/) — curso utilizado como base dos meus estudos e destas anotações, dentro da trilha PICK.
* [Guia Foca GNU/Linux](https://focalinux.cipsga.org.br/) — referência em português sobre gerenciamento de pacotes no Linux.
