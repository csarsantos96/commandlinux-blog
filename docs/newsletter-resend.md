# Newsletter do Command Linux — Resend

## Implementação

O formulário existente abaixo dos artigos mantém o visual e envia o idioma da página (`pt`/`en`) para `/api/newsletter-subscribe`. A API valida o endereço, verifica a origem e o honeypot e limita solicitações por e-mail (uma a cada cinco minutos) e IP (dez por dez minutos, com hash e expiração). Erros do serviço retornam mensagem de indisponibilidade, sem credenciais ou dados pessoais nos logs.

A confirmação usa 32 bytes aleatórios, com hash armazenado no Redis por 24 horas. Abrir o link mostra um botão; somente o POST do botão cadastra o contato. Isso evita confirmação por scanners de e-mail. O token é consumido após o cadastro e confirmações concorrentes do mesmo endereço são serializadas. Inscrições repetidas não criam contatos duplicados. Confirmações posteriores podem trocar os segmentos de idioma, mas nunca reativam um cancelamento global ou um cancelamento importado do Reach.

Os avisos são Broadcasts nativos do Resend, destinados exclusivamente ao segmento do idioma. O template responsivo usa título, `description`, categoria e metadados do artigo, com botão para ler e `{{{RESEND_UNSUBSCRIBE_URL}}}`. O Resend substitui esse marcador pelo cancelamento real por destinatário. O preview HTML local mantém o marcador e não serve para testar cancelamento.

## Variáveis e secrets

Use os valores do [.env.example](../.env.example) apenas no ambiente do servidor. Nunca use prefixos `PUBLIC_`/`VITE_` para credenciais. Não cole chaves em chats, commits ou logs.

| Variável | Onde configurar | Uso |
| --- | --- | --- |
| `RESEND_API_KEY` | Vercel server e Actions secret | Chave própria do blog com acesso a e-mails, contatos, segmentos e Broadcasts; uma chave restrita a envio não basta |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Vercel server e Actions secrets | Mesmo Redis durável para newsletter em produção; separado do Redis de teste |
| `RESEND_SEGMENT_PT`, `RESEND_SEGMENT_EN` | Vercel server e Actions variables | IDs distintos de segmentos exclusivos do Command Linux |
| `NEWSLETTER_FROM` | Vercel server e Actions variable | `Command Linux <newsletter@commandlinux.dev>` |
| `NEWSLETTER_SITE_URL` | Vercel server; opcional local | URL absoluta usada nos links; padrão `https://www.commandlinux.dev` |
| `NEWSLETTER_ENABLED` | Actions variable | `false` até concluir o corte; `true` habilita avisos de produção |
| `NEWSLETTER_MIGRATION_COMPLETE` | Actions variable | `true` somente após reconciliar a migração |
| `NEWSLETTER_TEST_EMAIL` | Vercel server e Actions secret, quando em teste | Restringe confirmações ao endereço autorizado e exige segmento com exatamente esse único contato nos testes de Broadcast |

O workflow usa o environment GitHub `production`. Coloque os secrets/variables nele ou no repositório. `NEWSLETTER_VERCEL_PROJECT_ID` deve ser uma **variable do repositório GitHub** (Settings → Secrets and variables → Actions → Variables), pois o filtro do job roda antes de carregar o environment `production`. Copie o Project ID em Vercel → projeto Command Linux → Settings → General. Não use o ID do Caixa Solidário. As variáveis existentes de reações e tradução permanecem independentes.

## DNS: Resend → Hostinger

Verificação do domínio e plano da conta ainda precisam ser conferidos no painel; não foram alterados remotamente.

1. No Resend, abra **Domains → Add domain**, informe `commandlinux.dev`, escolha a região e habilite envio. Verificar apenas um subdomínio diferente não autoriza o remetente solicitado no domínio raiz.
2. Abra os detalhes do domínio. Para **cada registro de verificação/envio**, copie o **Type**, **Name**, **Content/Value**, **Priority** (quando MX) e TTL se indicado. Os valores reais de DKIM e os destinos regionais precisam vir dessa tela.
3. Na Hostinger hPanel, abra **Domínios → Portfólio de domínios → commandlinux.dev → DNS / Nameservers → Gerenciar registros DNS**. Confirme que a Hostinger é o DNS autoritativo; se os nameservers forem de outro provedor, cadastre nesse provedor.
4. Cadastre os registros conforme o mapeamento abaixo. No campo Nome, use a parte relativa ao domínio se o painel acrescentar `commandlinux.dev` automaticamente, evitando duplicar o sufixo. Use o nome real mostrado pelo Resend.

| Registro exibido no Resend | Campo na Hostinger |
| --- | --- |
| DKIM: Type TXT, Name e Content | Tipo TXT; Nome correspondente; Valor TXT integral, sem alterar a chave |
| SPF de envio: Type TXT, Name e Content | Tipo TXT; Nome do Return-Path indicado; Valor TXT integral |
| MX de envio/retorno: Type MX, Name, Content e Priority | Tipo MX; Nome indicado; Servidor de e-mail = Content; Prioridade = valor do painel |
| DMARC, se indicado e ainda não existente | Tipo TXT; Nome e política copiados/revisados no painel; preserve a política existente |

Não há valores de chaves ou destinos DNS inventados neste documento. Para TTL não informado, pode usar o padrão da Hostinger. Não substitua os MX de recebimento no domínio raiz, registros do site ou configurações do Caixa Solidário. Não publique dois registros SPF para o mesmo nome; se houver conflito, revise o registro existente. O MX de retorno de envio é diferente da opção **Receiving/Inbound**, que não é necessária para a newsletter.

Depois de salvar, no Resend clique **Verify DNS Records** e aguarde o status **Verified** dos registros de envio. Veja o [guia oficial para Hostinger](https://resend.com/docs/guides/dns/hostinger). O nome e o conteúdo exatos da tela da sua conta prevalecem sobre exemplos desse guia.

## Corte do Reach e preservação dos contatos

O código e o workflow antigos do Reach foram removidos. Isso **não pausa campanhas já agendadas no painel externo**. Antes de habilitar o Resend:

1. Mantenha `NEWSLETTER_ENABLED=false`. Pause campanhas, automações e envios manuais no Reach. Não exclua contatos ou histórico. Pause brevemente o formulário durante a exportação/importação final para não perder cadastros concorrentes.
2. Exporte todos os contatos, preferências de idioma, consentimentos, pendências, cancelamentos e supressões. Guarde o original completo fora do Git. Normalize uma cópia como JSON:

```json
[
  {"email":"leitor@example.com","language":"pt","status":"subscribed"},
  {"email":"outro@example.com","language":"en","status":"unsubscribed"}
]
```

Os status aceitos são `subscribed` (somente consentimento confirmado), `pending` e `unsubscribed`. Consentimento desconhecido vira `pending`; bloqueios, reclamações e bounces devem ser preservados como cancelamento/supressão. Não infira consentimento apenas pela existência no Reach. Preserve metadados adicionais nas linhas. Resolva idiomas conflitantes pela preferência explícita mais recente antes da importação.

3. Crie segmentos exclusivos do blog no Resend e configure os IDs de produção. Execute primeiro sem gravar:

```bash
node --env-file=.env.local scripts/newsletter-migrate.mjs /caminho-seguro/export.json
node --env-file=.env.local scripts/newsletter-migrate.mjs /caminho-seguro/export.json --apply
```

Toda a entrada é validada antes de qualquer gravação. Duplicatas são consolidadas: cancelado tem precedência sobre pendente, que tem precedência sobre inscrito. Os registros normalizados e status ficam em Redis; o original continua intacto. Pendentes não entram nos segmentos de envio. Cancelados ficam bloqueados localmente e fora dos segmentos do blog; contatos novos cancelados também são cadastrados como `unsubscribed`. Para contatos já existentes na conta compartilhada, a importação não altera o status global nem segmentos de outros projetos. Cancelamentos globais já existentes no Resend nunca são revertidos. Uma reimportação não desfaz cancelamento já importado.

4. Reconcilie totais únicos por status e idioma, amostras de cada grupo e sobreposições com contatos já no Resend. A importação não é transacional entre serviços; em caso de falha mantenha os envios desativados e reexecute após corrigir. Só então marque `NEWSLETTER_MIGRATION_COMPLETE=true`, publique o código e reabra o formulário. Remova os secrets Reach antigos da Vercel/Actions. Mantenha o Reach pausado permanentemente.

O Caixa Solidário não foi alterado. Use chave, segmentos e estado próprios do blog. Na mesma equipe Resend, contatos/cancelamentos globais, supressões e quotas são compartilhados: o cancelamento nativo global pode afetar outros Broadcasts da equipe. E-mails transacionais de outro projeto não foram modificados por esta integração. Não use segmentos de outro projeto para testar.

## Validar com um único endereço

1. Crie dois segmentos **de teste**, distintos dos segmentos reais, e um Redis de teste. Configure somente esses IDs/Redis, uma chave server-side, `NEWSLETTER_TEST_EMAIL` com seu endereço autorizado e `NEWSLETTER_ENABLED=false`. Para testar formulário e funções locais use um ambiente Vercel de teste/preview ou Vercel dev; `astro dev` sozinho não atende as funções da pasta `api`. Ajuste `NEWSLETTER_SITE_URL` para a URL que atende essas funções.
2. Pelo formulário de um artigo PT, envie seu endereço. Deve aparecer a mensagem para conferir a caixa de entrada. Nenhum novo contato deve existir antes de confirmar. Abra o e-mail, clique no link e pressione o botão. Confira o contato somente no segmento PT. Repita em EN e confira a troca para EN.
3. Gere um preview sem qualquer chamada ao Resend:

```bash
npm run newsletter:preview -- src/content/posts/teste-newsletter-commandlinux.md
```

4. Com o único endereço confirmado no segmento de teste do idioma correspondente, envie **um Broadcast de teste real**, sem habilitar produção:

```bash
node --env-file=.env.local scripts/newsletter.mjs test src/content/posts/en/teste-newsletter-commandlinux.md
```

O comando verifica a lista inteira do segmento: recusa segmento vazio, mais de um contato, paginação adicional, cancelamento ou endereço diferente do autorizado. Não adicione contatos ao segmento enquanto o teste estiver em execução. Verifique remetente, título, resumo, botão e link de cancelamento no e-mail recebido. Reexecutar o mesmo comando com o mesmo Redis não envia novamente. Clique em cancelar e confira o status no Resend; o comando passa a recusar o contato cancelado. Use outro artigo de teste para validar nova campanha; não apague registros de produção.

5. Para testar o gatilho completo, mantenha **segmentos e Redis de teste** no environment do workflow, configure o endereço autorizado e habilite os dois flags somente nesse contexto controlado. O primeiro deploy de produção bem-sucedido registra o acervo sem enviar. Depois publique um novo artigo, aguarde sucesso em produção e confira um único aviso no idioma escolhido. Reexecução, edição do artigo, preview e deploy com falha não devem enviar. A troca posterior para Redis de produção cria uma baseline independente, sem disparar o acervo.

## Produção e persistência

O workflow usa os eventos nativos `repository_dispatch` da integração Vercel/GitHub: `vercel.deployment.success` (build concluído e promovido automaticamente) e `vercel.deployment.promoted` (promoção para produção). O filtro exige `environment=production`, `git.ref=main`, Project ID correspondente a `NEWSLETTER_VERCEL_PROJECT_ID` e alias `commandlinux.dev` ou `www.commandlinux.dev`. O script revalida o payload do arquivo `GITHUB_EVENT_PATH` e confere o SHA informado antes de ler/gravar estado ou enviar. Eventos `ready` (build sem promoção), preview, falha e outros projetos não disparam. A mesma publicação pode emitir sucesso e promoção: os registros permanentes tornam o segundo evento inofensivo. Não basta um push, um build local ou o workflow de tradução finalizar. O workflow precisa estar na branch padrão do GitHub para receber `repository_dispatch`.

O checkout usa o SHA efetivamente publicado e o histórico completo. Redis guarda `newsletter:production-sha` e `newsletter:article:<hash(idioma + URL)>` permanentemente. Na primeira ativação, todos os artigos publicados daquele SHA são marcados como baseline. Depois são elegíveis apenas adições e transições de rascunho para publicado desde o último SHA processado. Edições e renomes de posts já publicados não geram aviso. Reversões e eventos atrasados são ignorados; PT/EN são campanhas separadas.

Cada artigo ganha uma claim atômica **antes** de chamar Broadcasts. O registro `sent` guarda o ID retornado pelo Resend. Uma falha ambígua deixa a claim pendente, falha o job e bloqueia avanço da baseline; não há repetição automática que possa enviar duas vezes após o prazo de idempotência do provedor. Para recuperar, procure pelo nome da campanha (a própria chave Redis) no Resend, confirme seu estado e só então reconcilie o registro. Se enviado/agendado, registre `status: sent` e seu ID; se comprovadamente não foi criado/enviado, libere a claim para uma reexecução controlada. Nunca apague claims sem conferir o painel. Retenha e faça backup do Redis; perder esse estado perde a proteção histórica.

## Limites e plano

Conferido na documentação oficial em 21/10/2026: o Free transacional tem 3.000 e-mails/mês e 100/dia; as confirmações usam essa quota. Marketing Free permite até 1.000 contatos/mês com envios ilimitados; Broadcasts usam a quota de marketing, separada da transacional. O limite padrão da API é 10 requisições/s por equipe, compartilhado entre suas chaves. O cliente espaça chamadas sequenciais e trata 429 com espera limitada. Quotas reais e eventuais restrições de aprovação devem ser conferidas no painel **Settings → Usage** da conta, considerando também outros projetos. Exceder contatos pode bloquear Broadcasts; não contrate plano automaticamente nem exclua assinantes para contornar o limite.

Fontes: [planos e quotas](https://resend.com/docs/knowledge-base/account-quotas-and-limits), [preços](https://resend.com/docs/knowledge-base/what-is-resend-pricing), [limites da API](https://resend.com/docs/api-reference/rate-limit), [Broadcasts](https://resend.com/docs/api-reference/broadcasts/create-broadcast), [segmentos](https://resend.com/docs/dashboard/contacts/manage-segments).

## Verificações locais

```bash
npm run test:newsletter
npm run build
npm run newsletter:preview -- src/content/posts/teste-newsletter-commandlinux.md
```

Os testes usam Redis/API simulados e repositórios Git temporários, sem disparar e-mails. O envio de teste real e a validação de DNS/conta exigem a configuração externa acima; não são executados automaticamente durante desenvolvimento.


## Configuração por serviço — hospedagem na Vercel

### Vercel

Mantenha o projeto Astro, o adapter `@astrojs/vercel`, os domínios e a integração Git atuais. O build continua `npm run build`. Os endpoints TypeScript da pasta raiz `api/` são Vercel Functions Node.js, no mesmo padrão da API de reações existente. O navegador chama somente `/api/newsletter-subscribe`; a chave nunca é enviada ao navegador. Não existe envio em hooks de build.

Em **Project → Settings → Environment Variables**, para **Production**, cadastre `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_SEGMENT_PT`, `RESEND_SEGMENT_EN`, `NEWSLETTER_FROM` e `NEWSLETTER_SITE_URL=https://www.commandlinux.dev`. Marque credenciais como Sensitive quando disponível. Confirme Node.js 22.x compatível com o projeto e faça um novo deploy para aplicar as variáveis. Os flags de envio automático pertencem ao GitHub Actions, não ao build da Vercel.

Para Preview/Development, configure credenciais e Redis de teste, segmentos exclusivos e `NEWSLETTER_TEST_EMAIL`; nunca reutilize o Redis/segmentos reais em previews de teste. Deixe os previews sem credenciais se não precisar testar o cadastro neles. Cadastros funcionam em preview somente com configuração explícita de teste; nenhum preview aciona avisos automáticos.

Em **Settings → Git**, mantenha o repositório conectado e `main` como branch de produção. Confirme que os eventos `repository_dispatch` da integração Vercel/GitHub estão habilitados (a posição/nome do controle pode variar). Não é necessário mover o deploy para Actions, criar Deploy Hook, configurar Cron nem fornecer `VERCEL_TOKEN`. Confira um evento de produção e o Project ID antes de ativar newsletters. Se houver proteção de preview, abra o link de confirmação no navegador autorizado.

### Resend

Verifique `commandlinux.dev`, crie os segmentos PT/EN próprios do blog e uma chave server-side com acesso necessário a e-mails/contatos/Broadcasts. Configure o remetente solicitado e confira Usage/limites da equipe. Preserve cancelamentos e importe o Reach conforme o procedimento acima. Nenhum plano foi contratado.

### Hostinger DNS

Use apenas para publicar os registros de autenticação fornecidos pelo Resend, conforme o mapeamento anterior. Preserve integralmente os registros A/AAAA, CNAME, ALIAS e verificações TXT que atendem a Vercel, além dos MX de recebimento existentes. Não troque nameservers, IPs do site ou CNAME de `www` para integrar a newsletter. A hospedagem permanece na Vercel.

### GitHub Actions

Em **Settings → Secrets and variables → Actions**, configure:

- **Repository variable obrigatória:** `NEWSLETTER_VERCEL_PROJECT_ID`, copiado do projeto correto na Vercel.
- **Secrets** no environment `production` ou no repositório: `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`; opcional `NEWSLETTER_TEST_EMAIL` para teste controlado.
- **Variables** no environment `production` ou no repositório: `RESEND_SEGMENT_PT`, `RESEND_SEGMENT_EN`, `NEWSLETTER_FROM`, `NEWSLETTER_ENABLED=false` e `NEWSLETTER_MIGRATION_COMPLETE=false` inicialmente.

Use o mesmo Redis/segmentos de produção dos endpoints. O Actions não lê automaticamente variáveis da Vercel. Depois de pausar Reach, importar/reconciliar contatos e testar com um endereço, habilite os flags. A primeira execução cria a baseline do SHA publicado e não envia o acervo. Reexecute uma execução com falha após resolver sua causa; claims ambíguas exigem a reconciliação documentada.

Referências Vercel: [eventos GitHub e migração de deployment_status](https://vercel.com/docs/git/vercel-for-github#repository-dispatch-events), [payload dos eventos](https://github.com/vercel/repository-dispatch/tree/main/packages/repository-dispatch), [Vercel Functions Node.js em api/](https://vercel.com/docs/functions/runtimes/node-js).

## Diagnóstico: formulário retorna erro

Em Vercel → projeto Command Linux → Logs, filtre `/api/newsletter-subscribe` e reproduza a tentativa. `NEWSLETTER_CONFIG_MISSING` lista somente os **nomes** das variáveis ausentes; preencha-as no ambiente Production e faça redeploy. `NEWSLETTER_SEGMENTS_INVALID` indica IDs iguais para PT/EN. `NEWSLETTER_SERVICE_ERROR` com `providerStatus` indica erro HTTP do Resend; confira permissões da chave, domínio e limites no painel do Resend. Falhas do Redis podem aparecer como erro genérico: confira URL/token REST e disponibilidade do banco. Não copie valores de secrets nem links de confirmação para logs ou chat. A resposta pública do formulário continua genérica.

### Reutilizar Redis já conectado à Vercel

A newsletter aceita o par existente `REDIS_KV_REST_API_URL` + `REDIS_KV_REST_API_TOKEN` quando as duas variáveis `UPSTASH_REDIS_REST_*` estão vazias/ausentes. Usa apenas chaves com prefixo `newsletter:` e não modifica as chaves de reações. Use o token REST de escrita, nunca `REDIS_KV_REST_API_READ_ONLY_TOKEN` nem a URL TCP `REDIS_URL`/`REDIS_KV_URL`. Um par dedicado `UPSTASH_REDIS_REST_*`, quando configurado, tem preferência; os pares nunca são misturados.

No GitHub Actions, os secrets `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` devem apontar para o **mesmo banco** usado pela newsletter na Vercel. Se reutilizar a integração existente, copie para esses secrets os valores de `REDIS_KV_REST_API_URL` e `REDIS_KV_REST_API_TOKEN`, respectivamente. Não troque um banco de produção já inicializado sem migrar seu estado persistente. Testes continuam exigindo um banco isolado.
