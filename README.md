# CommandLinux

> A personal technical blog where I document what I am learning about Linux, Docker, Kubernetes, Terraform, Cloud Native, and DevOps.

🌐 **Live site:** [commandlinux.dev](https://www.commandlinux.dev)

## About

CommandLinux is a personal space for publishing technical notes, practical explanations, diagrams, and study insights.

The goal is simple: learn in public, organize knowledge, and share content that may help other people who are studying the same technologies.

Topics currently covered include:

* Linux
* Docker
* Kubernetes
* Terraform
* Cloud Native
* DevOps

## Tech Stack

* [Astro](https://astro.build/)
* TypeScript
* React
* Markdown and MDX
* Mermaid diagrams
* Astro Content Collections
* RSS Feed
* Sitemap generation
* Reactions backed by Upstash Redis

## How This Project Was Built

The frontend was built with [Astro](https://astro.build/), with AI assistance for styling and layout.

The posts come from my own notebook entries, based on my studies and practical experience. I use AI to correct Portuguese, help structure those notes into posts, and review the text for clarity and consistency. The content originates in my notes; AI supports the editing process rather than creating the posts.

English translations are generated automatically through the Gemini API in a GitHub Actions workflow, reducing the manual work needed to maintain the blog in both languages.

The automation side was designed and implemented by me, and includes two GitHub Actions workflows:

* **Post translation** — automatically translates new posts from Portuguese to English using the Gemini API. See [`.github/workflows/translate-posts.yml`](.github/workflows/translate-posts.yml) and [`scripts/translate-posts.mjs`](scripts/translate-posts.mjs).
* **Newsletter** — sends localized Resend broadcasts after successful production deployments. See [`.github/workflows/newsletter.yml`](.github/workflows/newsletter.yml).

## Features

* Posts written in Markdown
* Categories and tags
* Syntax highlighting for code blocks
* Mermaid diagrams for technical explanations
* SEO metadata and Open Graph support
* RSS feed and sitemap generation
* Responsive layout
* Portuguese and English routes
* Reading progress, post reactions, and social sharing
* Automatic post translation (PT → EN) via GitHub Actions and the Gemini API
* Resend double opt-in subscriptions for PT and EN, plus automatic new-post broadcasts

## Getting Started

### Requirements

* Node.js `>= 22.12.0`
* npm

### Installation

```bash
git clone https://github.com/csarsantos96/commandlinux-blog.git
cd commandlinux-blog
npm install
```

### Environment variables

The website can run locally without environment variables. Reactions, post translation, and the Resend integration use the following variables:

```bash
# Post reactions (Upstash Redis)
REDIS_KV_REST_API_URL=
REDIS_KV_REST_API_TOKEN=

# Post translation
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash # optional

# Newsletter (server only)
RESEND_API_KEY=
NEWSLETTER_FROM="Command Linux <newsletter@commandlinux.dev>"
NEWSLETTER_SITE_URL=https://www.commandlinux.dev
NEWSLETTER_TEST_EMAIL=
RESEND_SEGMENT_PT=
RESEND_SEGMENT_EN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEWSLETTER_ENABLED=false
NEWSLETTER_MIGRATION_COMPLETE=false
# GitHub repository variable: Project ID of Command Linux in Vercel
NEWSLETTER_VERCEL_PROJECT_ID=
```

Add them to a local `.env` file when needed. Do not commit this file.

### Run locally

```bash
npm run dev
```

The development server will be available at:

```text
http://localhost:4321
```

## Available Commands

| Command                   | Description                                               |
|---------------------------|-----------------------------------------------------------|
| `npm run dev`             | Starts the local development server                       |
| `npm run build`           | Builds the production version of the website              |
| `npm run preview`         | Previews the production build locally                     |
| `npm run astro -- --help` | Shows Astro CLI help                                      |
| `npm run translate:posts` | Translates new/updated posts (PT → EN) via the Gemini API |
| `npm run newsletter:preview -- <post>` | Generates a local HTML preview without calling Resend |
| `npm run test:newsletter` | Tests post detection and newsletter rendering |

## Creating a New Post

Create a new Markdown file inside:

```text
src/content/posts/
```

Example:

```md
---
title: Understanding Linux Namespaces
description: A practical introduction to Linux namespaces and container isolation.
date: 2026-07-07
updatedDate: 2026-07-08 # optional
category: LINUX
tags: [linux, containers, namespaces]
draft: false
language: pt
series: Linux Internals # optional
part: 1                # optional; current part of the series
totalParts: 3          # optional; total number of parts
---

Your post content goes here.
```

Posts support standard Markdown syntax, code blocks, images, links, and Mermaid diagrams.

## Newsletter with Resend

Hosting remains on Vercel. Native Vercel production dispatch events trigger the GitHub workflow, using the deployed SHA and durable Redis delivery records. See [the migration, Vercel setup and test runbook](docs/newsletter-resend.md). The article form requests a localized confirmation email; only an explicit confirmation POST enrolls the contact. Resend broadcasts use separate PT/EN segments and a native unsubscribe link. Existing global opt-outs are never reactivated by this integration.

### Mermaid Example

```mermaid
flowchart LR
    A[Host Machine] --> B[Docker Engine]
    B --> C[Container]
```

## Project Structure

```text
.
├── .github/
│   └── workflows/       # GitHub Actions workflows (post translation, newsletter)
├── api/                  # Serverless APIs for reactions and newsletter subscriptions
├── public/              # Static files such as images and favicons
├── scripts/             # Translation and newsletter automation scripts
├── src/
│   ├── components/      # Reusable UI components
│   ├── content/
│   │   └── posts/
│   │       ├── *.md     # Blog posts written in Markdown (PT)
│   │       └── en/      # Auto-generated English translations
│   ├── layouts/         # Page layouts
│   ├── pages/           # Astro routes and pages
│   ├── styles/          # Global and component styles
│   └── content.config.ts
├── astro.config.mjs
└── package.json
```

## Author

Created and maintained by [César Santos](https://github.com/csarsantos96).

---

Built as a personal learning journal for technology, infrastructure, and cloud-native studies.
