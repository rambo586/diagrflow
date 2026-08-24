import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="site-footer shell">
      <div>
        <strong>Diagrflow</strong> — journal-ready PRISMA 2020 flow diagrams.
        Domain: diagrflow.com
      </div>
      <div>
        <Link to="/editor">Editor</Link>
        {" · "}
        <Link to="/pricing">Pricing</Link>
        {" · "}
        Not affiliated with prisma-statement.org
      </div>
    </footer>
  );
}
