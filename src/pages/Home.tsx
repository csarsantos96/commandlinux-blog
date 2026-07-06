import { useMemo, useState } from 'react'
import { allPosts, type Category } from '../lib/posts'
import FilterBar from '../components/FilterBar'
import PostCard from '../components/PostCard'
import './Home.css'

const CATEGORY_ORDER: Category[] = [
  'KUBERNETES',
  'DOCKER',
  'TERRAFORM',
  'LINUX',
  'CI/CD',
  'SYSTEM DESIGN',
  'CLOUD',
]

export default function Home() {
  const [active, setActive] = useState<Category | null>(null)
  const [search, setSearch] = useState('')

  const categories = useMemo(
    () => CATEGORY_ORDER.filter(c => allPosts.some(p => p.category === c)),
    []
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allPosts.filter(p => {
      if (active && p.category !== active) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      )
    })
  }, [active, search])

  return (
    <section className="section-wrap">
      <header className="home-hero">
        <div className="hero-status">
          <span className="status-dot" />
          NOVOS POSTS TODA SEMANA
        </div>
        <div className="section-tag">blog</div>
        <h1 className="section-title">
          DevOps, Cloud Native<br />e o que roda por baixo.
        </h1>
        <p className="home-sub">
          Kubernetes, Docker, Terraform, Linux e system design — anotações de
          campo de quem está construindo o caminho até o CKA.
        </p>
      </header>

      <FilterBar
        categories={categories}
        active={active}
        onSelect={setActive}
        search={search}
        onSearch={setSearch}
        resultCount={filtered.length}
      />

      {filtered.length > 0 ? (
        <div className="posts-grid">
          {filtered.map(p => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-cmd">$ grep: nenhum resultado</span>
          <p>Tente outro termo ou remova o filtro de categoria.</p>
        </div>
      )}
    </section>
  )
}
