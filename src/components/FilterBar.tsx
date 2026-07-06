import type { Category } from '../lib/posts'
import { categoryColors, categoryFlags } from '../lib/posts'
import './FilterBar.css'

type Props = {
  categories: Category[]
  active: Category | null
  onSelect: (c: Category | null) => void
  search: string
  onSearch: (q: string) => void
  resultCount: number
}

export default function FilterBar({
  categories,
  active,
  onSelect,
  search,
  onSearch,
  resultCount,
}: Props) {
  return (
    <div className="filterbar">
      <div className="filter-search">
        <span className="filter-search-prefix">$ grep -i</span>
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder='"kubernetes deployment"'
          aria-label="Buscar posts"
        />
      </div>

      <div className="filter-flags" role="group" aria-label="Filtrar por categoria">
        <button
          className={`flag${active === null ? ' active' : ''}`}
          style={{ '--flag-color': 'var(--accent)' } as React.CSSProperties}
          onClick={() => onSelect(null)}
        >
          --all
        </button>
        {categories.map(c => (
          <button
            key={c}
            className={`flag${active === c ? ' active' : ''}`}
            style={{ '--flag-color': categoryColors[c] } as React.CSSProperties}
            onClick={() => onSelect(active === c ? null : c)}
          >
            {categoryFlags[c]}
          </button>
        ))}
      </div>

      <div className="filter-count">
        {resultCount} {resultCount === 1 ? 'post encontrado' : 'posts encontrados'}
      </div>
    </div>
  )
}
