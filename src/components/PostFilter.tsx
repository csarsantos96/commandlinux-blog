import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

type Post = {
  id: string; title: string; description: string; date: string;
  category: string; tags: string[]; readingMinutes: number;
};

const categoryColors: Record<string, string> = {
  KUBERNETES: 'var(--c-kubernetes)', DOCKER: 'var(--c-docker)',
  TERRAFORM: 'var(--c-terraform)', LINUX: 'var(--c-linux)',
  'CI/CD': 'var(--c-cicd)', 'SYSTEM DESIGN': 'var(--c-sysdesign)',
  CLOUD: 'var(--c-cloud)',
};
const categoryFlags: Record<string, string> = {
  KUBERNETES: '--kubernetes', DOCKER: '--docker', TERRAFORM: '--terraform',
  LINUX: '--linux', 'CI/CD': '--ci-cd', 'SYSTEM DESIGN': '--system-design',
  CLOUD: '--cloud',
};
const CATEGORY_ORDER = ['KUBERNETES','DOCKER','TERRAFORM','LINUX','CI/CD','SYSTEM DESIGN','CLOUD'];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export default function PostFilter({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const categories = useMemo(
    () => CATEGORY_ORDER.filter((c) => posts.some((p) => p.category === c)),
    [posts]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      if (active && p.category !== active) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [active, search, posts]);

  return (
    <>
      <div className="filterbar">
        <div className="filter-search">
          <span className="filter-search-prefix">$ grep -i</span>
          <input type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='"kubernetes deployment"' aria-label="Buscar posts" />
        </div>
        <div className="filter-flags" role="group" aria-label="Filtrar por categoria">
          <button className={`flag${active === null ? ' active' : ''}`}
            style={{ '--flag-color': 'var(--accent)' } as CSSProperties}
            onClick={() => setActive(null)}>--all</button>
          {categories.map((c) => (
            <button key={c} className={`flag${active === c ? ' active' : ''}`}
              style={{ '--flag-color': categoryColors[c] } as CSSProperties}
              onClick={() => setActive(active === c ? null : c)}>{categoryFlags[c]}</button>
          ))}
        </div>
        <div className="filter-count">
          {filtered.length} {filtered.length === 1 ? 'post encontrado' : 'posts encontrados'}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="posts-grid">
          {filtered.map((p) => (
            <a key={p.id} href={`/posts/${p.id}/`} className="post-card"
              style={{ '--post-color': categoryColors[p.category] ?? 'var(--accent-hover)' } as CSSProperties}>
              <div className="post-card-header">
                <span className="post-type">{p.category}</span>
                <span className="post-arrow">↗</span>
              </div>
              <h3 className="post-name">{p.title}</h3>
              <p className="post-desc">{p.description}</p>
              <div className="post-tags">
                {p.tags.map((t) => (<span key={t} className="post-tag">{t}</span>))}
              </div>
              <div className="post-meta">
                <span>{formatDate(p.date)}</span><span>·</span>
                <span>{p.readingMinutes} min de leitura</span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-cmd">$ grep: nenhum resultado</span>
          <p>Tente outro termo ou remova o filtro de categoria.</p>
        </div>
      )}
    </>
  );
}
