import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section-wrap" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <p style={{ fontFamily: 'var(--mono)', color: 'var(--text3)', fontSize: 13 }}>
        bash: página: comando não encontrado
      </p>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, margin: '0.5rem 0' }}>404</h1>
      <Link to="/" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent-hover)' }}>
        $ cd ~/
      </Link>
    </section>
  )
}
