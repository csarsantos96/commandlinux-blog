import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

type Locale = 'pt' | 'en'

type Post = {
  id: string
  slug: string
  title: string
  description: string
  date: string
  category: string
  tags: string[]
  readingMinutes: number
}

const categoryColors: Record<string, string> = {
  KUBERNETES: 'var(--c-kubernetes)',
  DOCKER: 'var(--c-docker)',
  TERRAFORM: 'var(--c-terraform)',
  LINUX: 'var(--c-linux)',
  'CI/CD': 'var(--c-cicd)',
  'SYSTEM DESIGN': 'var(--c-sysdesign)',
  CLOUD: 'var(--c-cloud)',
}

const categoryFlags: Record<string, string> = {
  KUBERNETES: '--kubernetes',
  DOCKER: '--docker',
  TERRAFORM: '--terraform',
  LINUX: '--linux',
  'CI/CD': '--ci-cd',
  'SYSTEM DESIGN': '--system-design',
  CLOUD: '--cloud',
}

const categoryOrder = [
  'KUBERNETES',
  'DOCKER',
  'TERRAFORM',
  'LINUX',
  'CI/CD',
  'SYSTEM DESIGN',
  'CLOUD',
]

const copy = {
  pt: {
    searchLabel: 'Buscar posts',
    categoryLabel: 'Filtrar por categoria',
    found: (count: number) =>
      `${count} ${count === 1 ? 'post encontrado' : 'posts encontrados'}`,
    readingTime: 'min de leitura',
    emptyCommand: '$ grep: nenhum resultado',
    emptyText: 'Tente outro termo ou remova o filtro de categoria.',
  },
  en: {
    searchLabel: 'Search posts',
    categoryLabel: 'Filter by category',
    found: (count: number) =>
      `${count} ${count === 1 ? 'post found' : 'posts found'}`,
    readingTime: 'min read',
    emptyCommand: '$ grep: no results found',
    emptyText: 'Try another term or remove the category filter.',
  },
}

function formatDate(iso: string, locale: Locale): string {
  const [year, month, day] = iso.split('-')

  return locale === 'en'
    ? `${month}/${day}/${year}`
    : `${day}/${month}/${year}`
}

export default function PostFilter({
  posts,
  locale = 'pt',
  postBasePath = '/posts',
}: {
  posts: Post[]
  locale?: Locale
  postBasePath?: string
}) {
  const [active, setActive] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const text = copy[locale]

  const categories = useMemo(
    () => categoryOrder.filter((category) => posts.some((post) => post.category === category)),
    [posts],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return posts.filter((post) => {
      if (active && post.category !== active) return false
      if (!query) return true

      return (
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    })
  }, [active, search, posts])

  return (
    <>
      <div className="filterbar">
        <div className="filter-search">
          <span className="filter-search-prefix">$ grep -i</span>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='"kubernetes deployment"'
            aria-label={text.searchLabel}
          />
        </div>

        <div className="filter-flags" role="group" aria-label={text.categoryLabel}>
          <button
            className={`flag${active === null ? ' active' : ''}`}
            style={{ '--flag-color': 'var(--accent)' } as CSSProperties}
            onClick={() => setActive(null)}
          >
            --all
          </button>

          {categories.map((category) => (
            <button
              key={category}
              className={`flag${active === category ? ' active' : ''}`}
              style={{ '--flag-color': categoryColors[category] } as CSSProperties}
              onClick={() => setActive(active === category ? null : category)}
            >
              {categoryFlags[category]}
            </button>
          ))}
        </div>

        <div className="filter-count">{text.found(filtered.length)}</div>
      </div>

      {filtered.length > 0 ? (
        <div className="posts-grid">
          {filtered.map((post) => (
            <a
              key={post.id}
              href={`${postBasePath}/${post.slug}/`}
              className="post-card"
              style={
                {
                  '--post-color':
                    categoryColors[post.category] ?? 'var(--accent-hover)',
                } as CSSProperties
              }
            >
              <div className="post-card-header">
                <span className="post-type">{post.category}</span>
                <span className="post-arrow">↗</span>
              </div>

              <h3 className="post-name">{post.title}</h3>
              <p className="post-desc">{post.description}</p>

              <div className="post-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="post-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="post-meta">
                <span>{formatDate(post.date, locale)}</span>
                <span>·</span>
                <span>
                  {post.readingMinutes} {text.readingTime}
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-cmd">{text.emptyCommand}</span>
          <p>{text.emptyText}</p>
        </div>
      )}
    </>
  )
}