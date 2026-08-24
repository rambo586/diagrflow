import { Link, NavLink } from "react-router-dom";

export function SiteHeader() {
  return (
    <header className="site-header shell">
      <Link className="wordmark" to="/" aria-label="Diagrflow home">
        <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="6" fill="#1f3d32" />
          <rect x="7" y="6" width="10" height="6" rx="1" stroke="#f4efe6" strokeWidth="1.4" fill="none" />
          <rect x="7" y="16" width="10" height="6" rx="1" stroke="#f4efe6" strokeWidth="1.4" fill="none" />
          <path d="M12 12v4" stroke="#f4efe6" strokeWidth="1.4" />
          <path d="M17 9h4v4" stroke="#c45c26" strokeWidth="1.4" fill="none" />
          <rect x="19" y="13" width="6" height="5" rx="1" stroke="#c45c26" strokeWidth="1.4" fill="none" />
        </svg>
        Diagrflow
      </Link>
      <nav className="nav" aria-label="Primary">
        <NavLink to="/editor">Editor</NavLink>
        <NavLink to="/pricing">Pricing</NavLink>
        <Link className="btn btn-primary" to="/editor">
          Create a PRISMA 2020 diagram
        </Link>
      </nav>
    </header>
  );
}
