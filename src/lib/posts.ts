export type Category =
  | 'KUBERNETES'
  | 'DOCKER'
  | 'TERRAFORM'
  | 'LINUX'
  | 'CI/CD'
  | 'SYSTEM DESIGN'
  | 'CLOUD'

export const categoryColors: Record<Category, string> = {
  KUBERNETES: 'var(--c-kubernetes)',
  DOCKER: 'var(--c-docker)',
  TERRAFORM: 'var(--c-terraform)',
  LINUX: 'var(--c-linux)',
  'CI/CD': 'var(--c-cicd)',
  'SYSTEM DESIGN': 'var(--c-sysdesign)',
  CLOUD: 'var(--c-cloud)',
}

/** CLI-style flag shown in the filter bar, e.g. --kubernetes */
export const categoryFlags: Record<Category, string> = {
  KUBERNETES: '--kubernetes',
  DOCKER: '--docker',
  TERRAFORM: '--terraform',
  LINUX: '--linux',
  'CI/CD': '--ci-cd',
  'SYSTEM DESIGN': '--system-design',
  CLOUD: '--cloud',
}

export type Post = {
  slug: string
  title: string
  description: string
  date: string // ISO yyyy-mm-dd
  category: Category
  tags: string[]
  readingMinutes: number
  content: string // markdown body without frontmatter
}

type Frontmatter = Record<string, string | string[]>

/**
 * Minimal frontmatter parser (--- key: value --- block).
 * Supports strings and inline arrays: tags: [a, b, c]
 */
function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) return { data: {}, body: raw }

  const data: Frontmatter = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (!key) continue
    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map(v => v.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    } else {
      value = value.replace(/^['"]|['"]$/g, '')
      data[key] = value
    }
  }
  return { data, body: raw.slice(match[0].length) }
}

function estimateReadingMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

const modules = import.meta.glob('../posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function buildPosts(): Post[] {
  const posts: Post[] = []
  for (const [path, raw] of Object.entries(modules)) {
    const slug = path.split('/').pop()!.replace(/\.md$/, '')
    const { data, body } = parseFrontmatter(raw)
    posts.push({
      slug,
      title: (data.title as string) ?? slug,
      description: (data.description as string) ?? '',
      date: (data.date as string) ?? '1970-01-01',
      category: ((data.category as string)?.toUpperCase() as Category) ?? 'LINUX',
      tags: Array.isArray(data.tags) ? data.tags : [],
      readingMinutes: estimateReadingMinutes(body),
      content: body,
    })
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

export const allPosts: Post[] = buildPosts()

export function getPost(slug: string): Post | undefined {
  return allPosts.find(p => p.slug === slug)
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}