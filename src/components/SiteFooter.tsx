import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="site-footer shell">
      <div>
        Diagrflow draws PRISMA 2020 flow diagrams for systematic reviews. Not
        affiliated with prisma-statement.org.
      </div>
      <div>
        <Link to="/editor">Editor</Link>
        {" · "}
        <Link to="/pricing">Pricing</Link>
        {" · "}
        <a href="https://www.prisma-statement.org/prisma-2020-flow-diagram">
          Official templates
        </a>
      </div>
    </footer>
  );
}
