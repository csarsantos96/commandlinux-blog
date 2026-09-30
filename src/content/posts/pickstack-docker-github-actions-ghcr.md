---
title: "Do ambiente local ao GHCR: Docker e GitHub Actions na prática com o PICKStack"
description: "Como subi o PICKStack, investiguei portas, variáveis e rotas, e adaptei uma pipeline para publicar seis imagens no GHCR com Cosign e SBOM."
date: 2026-09-30
category: DOCKER
tags: [docker, compose, github-actions, ghcr, cosign, sbom, pick, linuxtips]
draft: false
language: pt
---

# Do ambiente local ao GHCR: Docker e GitHub Actions na prática com o PICKStack

Durante os estudos do PICK 2026 da LINUXtips, trabalhei com o PICKStack para praticar Docker e GitHub Actions. Subi a aplicação localmente, investiguei problemas de configuração e adaptei a pipeline para publicar seis imagens no GitHub Container Registry, o GHCR.

O PICKStack é um projeto fornecido no contexto da formação. Minha parte foi adaptar e validar o ambiente e a automação. O código que usei está no [meu repositório de estudos](https://github.com/csarsantos96/linuxtips-workspace/tree/5e134a6/projetos/pick-2026/fase-1-mes-03-docker).

Entre o primeiro `docker compose up` e a execução da pipeline, apareceram problemas bem concretos: portas ocupadas, uma variável ausente no terminal e uma rota que chegava ao serviço com o caminho errado.

## Primeiro, entender o que precisava subir

A aplicação tem quatro serviços de negócio, `auth-svc`, `focus-svc`, `cards-svc` e `trilha-svc`, além do `api-gateway`, que recebe as chamadas do frontend e encaminha para os serviços. Esses cinco componentes usam Deno, um ambiente de execução de JavaScript e TypeScript.

O frontend usa SvelteKit, com pnpm para gerenciar as dependências e executar scripts. A infraestrutura reúne Postgres para os dados relacionais, Redis para cache, NATS para mensageria e MinIO para armazenamento de objetos.

Comecei pela infraestrutura com Docker Compose, que descreve e inicia esses containers a partir de um arquivo YAML. Os comandos abaixo partem da pasta do projeto dentro do repositório:

```bash
cd projetos/pick-2026/fase-1-mes-03-docker

docker compose -f infra/docker-compose.dev.yml --profile infra up -d
docker compose -f infra/docker-compose.dev.yml --profile infra ps
```

O profile `infra` seleciona os datastores. Isso permitiu verificar essa parte antes de iniciar a aplicação.

## As portas já tinham dono

Redis precisava da porta `6379`, mas havia um Valkey local usando essa porta. O Postgres instalado na máquina também ocupava a `5432`.

Usei `ss` para identificar os processos que estavam escutando:

```bash
sudo ss -ltnp '( sport = :6379 or sport = :5432 )'
```

Depois de identificar os responsáveis, parei os serviços locais. O nome da unidade varia conforme a instalação, então esse passo depende do que aparecer na máquina de quem estiver reproduzindo.

Recriei os containers para corrigir a publicação das portas:

```bash
docker compose -f infra/docker-compose.dev.yml --profile infra \
  up -d --force-recreate postgres redis
```

Também confirmei os schemas `auth`, `focus`, `cards` e `trilha` no Postgres. Com os valores de desenvolvimento definidos no Compose, a consulta pode ser feita assim:

```bash
docker compose -f infra/docker-compose.dev.yml exec postgres \
  psql -U pickstack -d pickstack -c '\dn'
```

O guia mencionava `db-bootstrap.sh` e as tasks `db:migrate` e `db:seed`, mas elas não estavam disponíveis na versão que inspecionei. Nos logs, vi as migrations sendo executadas ao iniciar os serviços e o seed de trilhas no startup. Foi necessário conferir o comportamento do código para entender como o banco era preparado naquela versão.

## O frontend tinha dois ajustes separados

Depois da infraestrutura, construí e executei o stack em containers:

```bash
docker compose -f infra/docker-compose.dev.yml --profile web up -d --build
```

Corrigi o import do plugin do SvelteKit no `vite.config.ts` para:

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
```

Também ajustei a publicação da porta do frontend. O processo dentro do container escutava em `3000`, então o mapeamento precisava ser `5173:3000`:

```yaml
ports:
  - "${WEB_PORT:-5173}:3000"
```

A porta à esquerda é a que acesso na máquina. A da direita é a porta do processo no container. Publicar `5173:5173` não resolveria se a aplicação estivesse escutando em `3000`.

## Containers para os dados, terminais para os serviços

Depois usei outro modo de trabalho: mantive os datastores em containers e executei os cinco serviços com `deno task dev`, cada um em seu terminal. No frontend, usei `pnpm dev`.

Ao trocar de modo, é preciso parar os containers da aplicação para liberar suas portas, mantendo a infraestrutura:

```bash
docker compose -f infra/docker-compose.dev.yml --profile web \
  stop auth-svc focus-svc cards-svc trilha-svc api-gateway web
```

Dentro da rede do Compose, um serviço encontra o Postgres pelo nome `postgres`. Um processo iniciado no meu terminal acessa a porta publicada em `localhost`. Configurei as variáveis em cada terminal antes de iniciar o respectivo serviço.

Este é um exemplo para o `auth-svc`, com valores fictícios de desenvolvimento compatíveis com os padrões do Compose. Partindo da pasta do projeto:

```bash
export DATABASE_URL='postgres://pickstack:pickstack-dev@localhost:5432/pickstack'
export REDIS_URL='redis://localhost:6379'
export NATS_URL='nats://localhost:4222'
export MINIO_ENDPOINT='localhost:9000'
export MINIO_ACCESS_KEY='pickstack'
export MINIO_SECRET_KEY='pickstack-dev'
export JWT_ISSUER='pickstack-local'
export JWT_AUDIENCE='pickstack'
export DEFAULT_TENANT_ID='local-dev'
export SERVICE_NAME='auth-svc'
export PG_SCHEMA='auth'
export PORT='8081'
export JWT_SECRET='exemplo-local-apenas-para-estudo'

cd services/auth-svc
deno task dev
```

Os valores de conexão precisam corresponder aos datastores de quem estiver reproduzindo. Nos outros terminais, configurei o ambiente comum e ajustei os valores específicos:

| Serviço | `PG_SCHEMA` | `PORT` |
| --- | --- | --- |
| `auth-svc` | `auth` | `8081` |
| `focus-svc` | `focus` | `8082` |
| `cards-svc` | `cards` | `8083` |
| `trilha-svc` | `trilha` | `8084` |
| `api-gateway` | Não se aplica | `8080` |

O `SERVICE_NAME` acompanha o nome de cada serviço. No terminal do gateway, também configurei os endereços dos quatro upstreams, os serviços que recebem as requisições encaminhadas:

```bash
export AUTH_SVC_URL='http://localhost:8081'
export FOCUS_SVC_URL='http://localhost:8082'
export CARDS_SVC_URL='http://localhost:8083'
export TRILHA_SVC_URL='http://localhost:8084'
```

No terminal do frontend, a partir da pasta do projeto:

```bash
cd web
pnpm install
PUBLIC_API_URL=http://localhost:8080 pnpm dev
```

As variáveis declaradas no Compose configuram os containers conforme `environment` e `env_file`. Elas não são exportadas para os processos que inicio em outros terminais. A [documentação do Compose sobre variáveis de ambiente](https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/) explica essas formas de configuração.

## O cadastro retornava 500 mesmo com health checks respondendo

Os health checks consultados responderam HTTP `200`. Mesmo assim, ao testar o cadastro pela interface, recebi HTTP `500`.

A resposta trouxe a causa:

```text
JWT_SECRET ausente ou muito curto (min. 16 chars)
```

Faltava `JWT_SECRET` no processo do `auth-svc`. JWT é o formato de token usado nesse fluxo de autenticação; o serviço precisava do segredo para assiná-lo.

Configurei a variável no terminal do `auth-svc` e reiniciei o serviço. O exemplo anterior já inclui essa correção. Exportar a variável em outro terminal não alterava o ambiente do processo que estava em execução.

Esse caso mostrou um limite das verificações: receber `200` no health check e ter testes passando não garantia que o cadastro funcionava com a configuração daquele ambiente. Eu ainda precisava executar o fluxo pela interface.

## O gateway precisava preservar parte do caminho

Outro ajuste estava no roteamento. Uma chamada para `/api/auth/login` precisava chegar ao `auth-svc` como `/auth/login`.

Para autenticação, removi apenas `/api`. Remover `/api/auth` também apagava uma parte do caminho que o serviço esperava receber.

Nos outros módulos, a regra era diferente: o gateway removia o prefixo `/api/<módulo>`. Conferir a rota de entrada e o caminho esperado pelo upstream foi o que permitiu corrigir o encaminhamento.

## O que consegui validar localmente

Os testes dos serviços ficaram assim:

| Serviço | Testes aprovados |
| --- | ---: |
| auth | 9 |
| focus | 3 |
| cards | 8 |
| trilha | 4 |
| gateway | 5 |
| **Total** | **29** |

O teste de integração do focus inicialmente foi ignorado porque `DATABASE_URL` não estava configurada no terminal dos testes. Depois de configurar a variável, ele passou. Um teste ignorado precisava ser investigado antes de entrar nessa conta.

No frontend, `pnpm test` não encontrou arquivos de teste. Portanto, não considerei isso uma suíte aprovada. Pela interface, testei cadastro, login, Focus, Cards e acesso às Trilhas.

## Adaptando o workflow ao monorepo

O projeto está dentro de `projetos/pick-2026/fase-1-mes-03-docker`, mas o arquivo executado pelo GitHub Actions fica na raiz do repositório, em `.github/workflows/pickstack-build-images.yml`.

O workflow original já tinha execução por `push` e `workflow_dispatch`, publicação no GHCR e SBOM pelo BuildKit. Adaptei os caminhos para o monorepo e acrescentei assinatura e verificação com Cosign.

No commit `5e134a6`, o arquivo interno `.github/workflows/build-images.yml` ainda contém a versão original. Ele não é uma cópia sincronizada do workflow final da raiz. O código executado está neste [workflow do commit](https://github.com/csarsantos96/linuxtips-workspace/blob/5e134a6/.github/workflows/pickstack-build-images.yml).

A versão final roda em pushes na `main` que alterem a pasta do projeto ou o próprio workflow, e também permite execução manual. Uma `matrix` cria seis execuções a partir da mesma definição de job, mudando o componente e seu contexto de build. É o uso de [variações de jobs documentado pelo GitHub](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations).

Este trecho do workflow mostra como o caminho do projeto entra no build:

```yaml
- name: Build and push
  id: build
  uses: docker/build-push-action@v6
  with:
    context: ${{ env.PROJECT_DIR }}/${{ matrix.context }}
    file: ${{ env.PROJECT_DIR }}/${{ matrix.context }}/Dockerfile
    push: true
    tags: ${{ steps.meta.outputs.tags }}
    labels: ${{ steps.meta.outputs.labels }}
    platforms: linux/amd64
    provenance: true
    sbom: true
    cache-from: type=gha,scope=pickstack-${{ matrix.svc }}
    cache-to: type=gha,scope=pickstack-${{ matrix.svc }},mode=max
```

`PROJECT_DIR` aponta para a pasta do PICKStack. Cada entrada da matriz fornece um contexto como `services/auth-svc` ou `web`.

## Publicação, assinatura e inventário

O [GHCR é o registry de containers do GitHub](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry). A pipeline usa `GITHUB_TOKEN` para autenticar e publicar as imagens. Na `main`, gera as tags `main`, `latest` e uma tag com SHA curto, como `sha-5e134a6`.

Para assinar, usa o digest retornado pelo build. Uma tag pode passar a apontar para outra imagem; o digest identifica o conteúdo pelo hash. Assim, a assinatura fica associada à referência exata produzida naquela execução.

Cosign é a ferramenta do projeto Sigstore usada para assinar e verificar. Nesta pipeline, a autenticação usa OIDC, um protocolo que permite comprovar a identidade da execução. A permissão `id-token: write` permite solicitar esse token, sem manter uma chave privada de assinatura como segredo fixo no repositório. O GitHub explica esse mecanismo na [documentação de OpenID Connect](https://docs.github.com/en/actions/concepts/security/openid-connect).

Depois de assinar, o workflow verifica a imagem exigindo a identidade exata do arquivo de workflow e da referência Git, além do emissor OIDC do GitHub Actions. A [documentação do Cosign](https://docs.sigstore.dev/cosign/verifying/verify/) descreve esses critérios de verificação.

[![Etapa Verify image signature do api-gateway concluída, com validação dos claims, registro de transparência e certificado](./images/pickstack-cosign-verificacao.png)](/images/posts/pickstack-cosign-verificacao.png)

*Verificação do api-gateway dentro da CI. Clique na imagem para abrir a captura original e ler os logs.*

Assinar ajuda a verificar a origem e a integridade da imagem conforme a identidade esperada. Isso não garante ausência de vulnerabilidades.

SBOM, ou *Software Bill of Materials*, é o inventário dos componentes identificados na imagem. O workflow habilita `sbom` e `provenance` no BuildKit. A primeira opção gera o inventário; a segunda registra informações sobre a construção. Essas são as [atestações de build descritas pelo Docker](https://docs.docker.com/build/metadata/attestations/).

Além disso, `anchore/sbom-action` gera um SBOM em SPDX JSON para download. Cada artefato `evidence-*` reúne três arquivos:

```text
evidence-auth-svc/
├── image.txt
├── cosign-verification.json
└── sbom.spdx.json
```

`image.txt` registra a imagem pelo digest. O JSON do Cosign guarda a saída da verificação, e `sbom.spdx.json` contém o inventário. A mesma organização é usada para os outros componentes.

## Os seis jobs concluídos

A [execução 36775586496](https://github.com/csarsantos96/linuxtips-workspace/actions/runs/36775586496), do commit `5e134a6`, terminou com status `Success`, seis jobs concluídos e duração exibida de 2 minutos e 3 segundos.

[![Resumo do GitHub Actions com status Success, seis jobs concluídos, duração de 2 minutos e 3 segundos e 12 artefatos](./images/pickstack-actions-sucesso.png)](/images/posts/pickstack-actions-sucesso.png)

*Resultado da pipeline de build, assinatura e SBOM. Os 12 artefatos exibidos no resumo não significam 12 SBOMs.*

As seis imagens publicadas foram:

```text
ghcr.io/csarsantos96/pickstack-auth-svc
ghcr.io/csarsantos96/pickstack-api-gateway
ghcr.io/csarsantos96/pickstack-focus-svc
ghcr.io/csarsantos96/pickstack-cards-svc
ghcr.io/csarsantos96/pickstack-trilha-svc
ghcr.io/csarsantos96/pickstack-web
```

[![Lista dos seis pacotes PICKStack publicados no GHCR pessoal e vinculados ao repositório linuxtips-workspace](./images/pickstack-ghcr-pacotes.png)](/images/posts/pickstack-ghcr-pacotes.png)

*Pacotes publicados no GHCR: quatro serviços de negócio, gateway e frontend.*

## Repetindo a verificação fora da CI

A verificação comprovada aqui ocorreu dentro da pipeline. Para repetir localmente, com Cosign instalado e acesso à imagem no registry, é possível baixar e extrair um dos artefatos `evidence-*` e executar este comando na pasta que contém `image.txt`:

```bash
IMAGE_REF=$(cat image.txt)
cosign verify \
  --certificate-identity 'https://github.com/csarsantos96/linuxtips-workspace/.github/workflows/pickstack-build-images.yml@refs/heads/main' \
  --certificate-oidc-issuer 'https://token.actions.githubusercontent.com' \
  "$IMAGE_REF"
```

O comando usa o digest salvo como evidência e a identidade esperada para aquela execução na `main`. Esse é um exercício reproduzível, não um resultado de verificação local que estou registrando como concluído.

Ao terminar essa etapa, eu tinha validado os fluxos locais e automatizado a construção, publicação e assinatura das seis imagens. O escopo ficou nessa entrega; deploy em produção e Kubernetes não fizeram parte dela.

O cadastro com erro foi o exemplo mais claro do que precisei conferir: a resposta do health check, o ambiente do processo e o fluxo usado pela interface eram verificações diferentes. Na pipeline, também passei a ter evidências separadas para a imagem publicada, sua assinatura e seus componentes.
