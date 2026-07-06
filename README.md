# commandlinux.dev

Blog técnico sobre DevOps e Cloud Native — Kubernetes, Docker, Terraform, Linux, CI/CD e system design. Construído com a mesma identidade visual do [cesarsantos.dev](https://cesarsantos.dev): React 19 + TypeScript + Vite, tema dark com estética de terminal.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/ para produção
```

## Escrevendo um post

Basta criar um arquivo `.md` em `src/posts/`. O nome do arquivo vira o slug da URL (`src/posts/meu-post.md` → `/post/meu-post`). Nenhum outro passo é necessário — o Vite carrega tudo em build time via `import.meta.glob`.

Frontmatter obrigatório:

```markdown
---
title: Título do post
description: Resumo curto que aparece no card.
date: 2026-07-06
category: KUBERNETES
tags: [pods, kubectl, CKA]
---

Conteúdo em Markdown aqui...
```

Categorias disponíveis (cada uma com sua cor no card e flag no filtro):
`KUBERNETES`, `DOCKER`, `TERRAFORM`, `LINUX`, `CI/CD`, `SYSTEM DESIGN`, `CLOUD`.

Para adicionar uma categoria nova: edite `Category`, `categoryColors` e `categoryFlags` em `src/lib/posts.ts`, adicione a cor em `src/styles/global.css` e inclua na `CATEGORY_ORDER` de `src/pages/Home.tsx`.

## Funcionalidades

- **Filtro por categoria** — chips estilo flags de CLI (`--kubernetes`, `--docker`...)
- **Busca** — campo estilo `grep` que filtra por título, descrição e tags
- **Syntax highlighting** — bash, yaml, dockerfile, json e python via highlight.js
- **Tempo de leitura** calculado automaticamente
- **Zero backend** — site estático, posts compilados no build

## Deploy na Vercel

O `vercel.json` já inclui o rewrite de SPA. Basta importar o repositório na Vercel (framework: Vite) e apontar o domínio `commandlinux.dev`.

## Estrutura

```
src/
├── components/   Navbar, Footer, FilterBar, PostCard
├── pages/        Home (lista + filtros), Post (leitura), NotFound
├── lib/          posts.ts (loader + frontmatter), markdown.ts (renderer)
├── posts/        seus artigos em .md
└── styles/       global.css (design tokens do cesarsantos.dev)
```
