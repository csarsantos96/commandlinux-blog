import { useEffect, useMemo, useRef, useState } from 'react'
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
  series?: string
  part?: number
  totalParts?: number
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
  NETWORKING: 'var(--c-networking)',
  'SEGURANÇA CIBERNÉTICA': 'var(--c-cyber-security)',
  'CYBER SECURITY': 'var(--c-cyber-security)',
}

const categoryFlags: Record<string, string> = {
  KUBERNETES: '--kubernetes',
  DOCKER: '--docker',
  TERRAFORM: '--terraform',
  LINUX: '--linux',
  'CI/CD': '--ci-cd',
  'SYSTEM DESIGN': '--system-design',
  CLOUD: '--cloud',
  NETWORKING: '--networking',
  'SEGURANÇA CIBERNÉTICA': '--seguranca-cibernetica',
  'CYBER SECURITY': '--cyber-security',
}

const categoryOrder = [
  'KUBERNETES',
  'DOCKER',
  'TERRAFORM',
  'LINUX',
  'CI/CD',
  'SYSTEM DESIGN',
  'CLOUD',
  'NETWORKING',
  'SEGURANÇA CIBERNÉTICA',
  'CYBER SECURITY',
]

const copy = {
  pt: {
    searchLabel: 'Buscar posts',
    categoryLabel: 'Filtrar por categoria',
    found: (count: number) =>
      `${count} ${count === 1 ? 'post encontrado' : 'posts encontrados'}`,
    readingTime: 'min de leitura',
    series: 'Série',
    emptyCommand: '$ grep: nenhum resultado',
    emptyText: 'Tente outro termo ou remova o filtro de categoria.',
  },
  en: {
    searchLabel: 'Search posts',
    categoryLabel: 'Filter by category',
    found: (count: number) =>
      `${count} ${count === 1 ? 'post found' : 'posts found'}`,
    readingTime: 'min read',
    series: 'Series',
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
  const searchInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const tag = new URLSearchParams(window.location.search).get('tag')
    if (tag) setSearch(tag)
  }, [])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping = target?.matches('input, textarea, select, [contenteditable="true"]')
      const opensSearch =
        (event.key === '/' && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey) ||
        (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey))

      if (opensSearch) {
        event.preventDefault()
        searchInput.current?.focus()
        searchInput.current?.select()
      }

      if (event.key === 'Escape' && document.activeElement === searchInput.current) {
        searchInput.current?.blur()
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

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
            ref={searchInput}
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='"kubernetes deployment"'
            aria-label={text.searchLabel}
          />
          <kbd className="filter-shortcut" aria-hidden="true">
            <span>/</span>
            <span>Ctrl K</span>
          </kbd>
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

              {post.series && post.part && (
                <div className="post-series">
                  <span className="post-series-label">// {text.series}</span>
                  <div className="post-series-info">
                    <strong>{post.series}</strong>
                    <span>
                      {post.part}
                      {post.totalParts ? ` / ${post.totalParts}` : ''}
                    </span>
                  </div>
                  {post.totalParts && (
                    <div
                      className="post-series-progress"
                      role="progressbar"
                      aria-label={`${text.series}: ${post.series}`}
                      aria-valuemin={1}
                      aria-valuemax={post.totalParts}
                      aria-valuenow={post.part}
                    >
                      <span
                        style={{
                          width: `${Math.min(100, (post.part / post.totalParts) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

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
