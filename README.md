![CI](https://github.com/csarsantos96/commandlinux-blog/actions/workflows/ci.yml/badge.svg)

# commandlinux.dev

Technical blog about DevOps and Cloud Native — Kubernetes, Docker, Terraform, Linux, CI/CD and system design. Built with the same visual identity as [cesarsantos.dev](https://cesarsantos.dev): React 19 + TypeScript + Vite, dark theme with a terminal aesthetic.

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # generates dist/ for production
```

## Writing a post

Just create a `.md` file in `src/posts/`. The file name becomes the URL slug (`src/posts/my-post.md` → `/post/my-post`). No other step is needed — Vite loads everything at build time via `import.meta.glob`.

Required frontmatter:

```markdown
---
title: Post title
description: Short summary that appears on the card.
date: 2026-07-06
category: KUBERNETES
tags: [pods, kubectl, CKA]
---

Markdown content here...
```

Available categories (each with its own color on the card and flag in the filter):
`KUBERNETES`, `DOCKER`, `TERRAFORM`, `LINUX`, `CI/CD`, `SYSTEM DESIGN`, `CLOUD`.

To add a new category: edit `Category`, `categoryColors` and `categoryFlags` in `src/lib/posts.ts`, add the color in `src/styles/global.css` and include it in `CATEGORY_ORDER` in `src/pages/Home.tsx`.

## Features

- **Category filter** — CLI-flag-style chips (`--kubernetes`, `--docker`...)
- **Search** — `grep`-style field that filters by title, description and tags
- **Syntax highlighting** — bash, yaml, dockerfile, json and python via highlight.js
- **Reading time** calculated automatically
- **Zero backend** — static site, posts compiled at build time

## Deploying to Vercel

`vercel.json` already includes the SPA rewrite. Just import the repository into Vercel (framework: Vite) and point the `commandlinux.dev` domain to it.

## Structure

```
src/
├── components/   Navbar, Footer, FilterBar, PostCard
├── pages/        Home (list + filters), Post (reading), NotFound
├── lib/          posts.ts (loader + frontmatter), markdown.ts (renderer)
├── posts/        your articles in .md
└── styles/       global.css (design tokens from cesarsantos.dev)
```
