import { Link } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <span className="nav-prefix">~/ </span>
        <span className="nav-icon">&gt;_ </span>
        commandlinux.dev<span className="nav-cursor" />
      </Link>

      <ul className="nav-links">
        <li>
          <a href="https://cesarsantos.dev" target="_blank" rel="noreferrer">
            portfolio ↗
          </a>
        </li>
        <li>
          <a href="https://github.com/csarsantos96" target="_blank" rel="noreferrer">
            github ↗
          </a>
        </li>
      </ul>
    </nav>
  )
}
