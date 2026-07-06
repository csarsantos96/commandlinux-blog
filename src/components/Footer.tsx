export default function Footer() {
  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid var(--border)',
        padding: '2rem 2.5rem',
        fontFamily: 'var(--mono)',
        fontSize: 11,
        color: 'var(--text3)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      <span>© {new Date().getFullYear()} Cesar Santos — commandlinux.dev</span>
      <span>exit 0</span>
    </footer>
  )
}
