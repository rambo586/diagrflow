import { Link, NavLink } from "react-router-dom";

export function SiteHeader() {
  return (
    <header className="site-header shell">
      <Link className="wordmark" to="/" aria-label="Diagrflow home">
        <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" fill="currentColor" />
          <rect x="6" y="6" width="10" height="6" stroke="#fffaf2" strokeWidth="1.4" fill="none" />
          <rect x="6" y="16" width="10" height="6" stroke="#fffaf2" strokeWidth="1.4" fill="none" />
          <path d="M11 12v4" stroke="#fffaf2" strokeWidth="1.4" />
          <path d="M16 9h5v4" stroke="#fffaf2" strokeWidth="1.4" fill="none" />
          <rect x="19" y="13" width="7" height="5" stroke="#fffaf2" strokeWidth="1.4" fill="none" />
        </svg>
        Diagrflow
      </Link>
      <nav className="nav" aria-label="Primary">
        <NavLink to="/editor">Editor</NavLink>
        <Link to="/#cases">Cases</Link>
        <NavLink to="/pricing">Pricing</NavLink>
      </nav>
    </header>
  );
}
