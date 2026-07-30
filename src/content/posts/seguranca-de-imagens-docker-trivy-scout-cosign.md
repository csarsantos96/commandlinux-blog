---
title: "Segurança de imagens Docker: Trivy, Docker Scout, distroless e assinatura com cosign"
description: Feche o ciclo de aprendizado de Docker aprendendo a escanear vulnerabilidades com Trivy e Docker Scout, reduzir a superfície de ataque com imagens distroless e assinar imagens com cosign.
date: 2026-06-29
category: DOCKER
tags: [docker, security, trivy, sbom, distroless, cosign, devops]
draft: false
language: pt
series: Docker na Prática
part: 9
totalParts: 9
---

# Segurança de imagens Docker: Trivy, Docker Scout, distroless e assinatura com cosign

Depois de aprender a construir, conectar e orquestrar containers ao longo desta série, falta responder uma pergunta que fica fácil de esquecer no meio do caminho: **essa imagem é segura?**

## Reduzindo a superfície de ataque com imagens distroless

Uma imagem `distroless` é uma imagem Docker ultra enxuta, feita para rodar a aplicação com o mínimo possível dentro do container — sem shell, sem gerenciador de pacotes, sem as ferramentas de um sistema operacional completo.

```dockerfile
FROM gcr.io/distroless/static
COPY meu-app /meu-app
CMD ["/meu-app"]
```

A ideia é direta: **menor imagem + menos vulnerabilidades expostas + mais segurança**. Se um binário malicioso conseguisse rodar dentro desse container, ele não teria nem um shell disponível para se mover a partir dali. O projeto [Chainguard](https://www.chainguard.dev/) segue essa mesma filosofia, mantendo imagens base minimalistas e constantemente atualizadas contra CVEs conhecidas.

## Verificando vulnerabilidades com Trivy

O [Trivy](https://trivy.dev/) escaneia uma imagem camada por camada, procurando vulnerabilidades conhecidas (CVEs) nos pacotes instalados:

```bash
trivy image nome-da-imagem
```

## Docker Scout

O Docker Scout é a ferramenta de análise de imagens integrada ao próprio Docker CLI. Além de listar vulnerabilidades, ela também sugere correções:

```bash
docker scout cves nome-da-imagem
docker scout recommendations giropops-senhas:1.0
```

- `cves` lista as vulnerabilidades conhecidas encontradas na imagem.
- `recommendations` sugere ajustes — como trocar a imagem base por uma versão mais recente ou mais enxuta — para reduzir os riscos encontrados.

Por trás dessas análises está o conceito de **SBOM** (*Software Bill of Materials*): uma lista completa de todos os componentes e pacotes que compõem a imagem. É esse inventário que ferramentas como Trivy e Docker Scout usam como base para cruzar com bancos de dados de vulnerabilidades conhecidas.

## Assinando imagens com cosign

Escanear vulnerabilidades garante que os componentes da imagem são seguros. Mas existe outra pergunta: como garantir que a imagem que está rodando em produção é *exatamente* a mesma que você buildou — e não uma versão adulterada em algum ponto entre o build e o deploy (um registry comprometido, por exemplo)?

O [cosign](https://docs.sigstore.dev/), parte do projeto Sigstore, resolve isso assinando digitalmente as imagens.

Gerando o par de chaves:

```bash
cosign generate-key-pair
```

Esse comando gera dois arquivos: `cosign.key` (a chave privada, que assina) e `cosign.pub` (a chave pública, que qualquer pessoa pode usar para verificar a assinatura).

Assinando a imagem:

```bash
cosign sign nome-da-imagem
```

Com a imagem assinada, um pipeline de deploy pode ser configurado para só aceitar rodar imagens cuja assinatura seja validada com a chave pública correspondente — barrando qualquer imagem que tenha sido trocada no caminho.

## Conclusão

Do primeiro `docker container run` até a assinatura de imagens com cosign, esta série percorreu o ciclo de vida completo de uma aplicação containerizada: criar e gerenciar containers, construir imagens próprias, garantir que elas continuem saudáveis, persistir dados, conectar serviços em rede, orquestrar tudo com Compose e, por fim, verificar que o que está rodando em produção é confiável.

## Referências

- [Trivy Docs](https://trivy.dev/latest/docs/) — instalação e uso do scanner de vulnerabilidades.
- [Docker Docs — Docker Scout](https://docs.docker.com/scout/) — análise de vulnerabilidades e SBOM integradas ao Docker CLI.
- [Chainguard — Distroless images](https://www.chainguard.dev/) — imagens base minimalistas mantidas continuamente contra CVEs.
- [Sigstore — cosign](https://docs.sigstore.dev/cosign/signing/signing_with_containers/) — assinatura e verificação de imagens de container.
- [LINUXtips — Descomplicando o Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — curso utilizado como base dos meus estudos e destas anotações.
