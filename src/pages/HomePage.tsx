import { useEffect } from "react";
import { Link } from "react-router-dom";

export function HomePage() {
  useEffect(() => {
    document.title = "Create a PRISMA 2020 flow diagram — Diagrflow";
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", "https://diagrflow.com/");
  }, []);

  return (
    <main>
      <section className="hero shell">
        <div>
          <p className="kicker">Diagrflow · systematic reviews</p>
          <h1>Create a PRISMA 2020 flow diagram</h1>
          <p className="lede">
            Type identification, screening, eligibility, and included counts. Diagrflow
            draws the official PRISMA 2020 boxes, keeps the arithmetic honest, and
            exports a clean SVG or PNG you can put in a manuscript.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" to="/editor">
              Open the editor
            </Link>
            <Link className="btn btn-ghost" to="/editor?sample=1">
              Load the sample diagram
            </Link>
          </div>
          <p className="fine">
            Free during this MVP. No account. Exported figures have no watermark.
            Authors may use them in journal submissions.
          </p>
        </div>
        <aside className="hero-card" aria-hidden="true">
          <svg viewBox="0 0 360 280" width="100%" role="presentation">
            <rect x="24" y="18" width="130" height="52" fill="#fff" stroke="#171c18" />
            <rect x="206" y="18" width="130" height="52" fill="#fff" stroke="#171c18" />
            <rect x="24" y="100" width="130" height="44" fill="#fff" stroke="#171c18" />
            <rect x="206" y="100" width="130" height="44" fill="#fff" stroke="#171c18" />
            <rect x="24" y="174" width="130" height="70" fill="#fff" stroke="#171c18" />
            <line x1="154" y1="44" x2="206" y2="44" stroke="#171c18" />
            <line x1="89" y1="70" x2="89" y2="100" stroke="#171c18" />
            <line x1="154" y1="122" x2="206" y2="122" stroke="#171c18" />
            <line x1="89" y1="144" x2="89" y2="174" stroke="#171c18" />
            <text x="34" y="40" fontSize="10" fontFamily="Arial">Records identified</text>
            <text x="216" y="40" fontSize="10" fontFamily="Arial">Records removed</text>
            <text x="34" y="126" fontSize="10" fontFamily="Arial">Records screened</text>
            <text x="216" y="126" fontSize="10" fontFamily="Arial">Records excluded</text>
            <text x="34" y="202" fontSize="10" fontFamily="Arial">Studies included</text>
          </svg>
        </aside>
      </section>

      <section className="section shell">
        <div className="grid-3">
          <article className="card">
            <h3>Official boxes</h3>
            <p>
              Identification, screening, eligibility assessment, and included studies —
              with per-reason full-text exclusion counts. Labels follow the PRISMA 2020
              templates, including the record / report / study distinction.
            </p>
          </article>
          <article className="card">
            <h3>Export that journals can use</h3>
            <p>
              Download SVG or PNG. The working export has no watermark. You may include
              the figure in a journal submission. Cite PRISMA 2020 in the figure legend.
            </p>
          </article>
          <article className="card">
            <h3>One job, done</h3>
            <p>
              This is a PRISMA 2020 maker, not a general graphical-abstract suite. There
              is one sample so you can see a complete diagram in a click.
            </p>
          </article>
        </div>
      </section>

      <section className="section shell">
        <h2>About PRISMA 2020</h2>
        <p>
          The PRISMA 2020 flow diagram reports how records moved through a systematic
          review: identified, screened, assessed for eligibility, and included, with a
          stated reason for every full-text exclusion. Diagrflow implements the new-review
          templates (databases and registers, with an optional other-methods column).
        </p>
        <p className="citation">
          Page MJ, McKenzie JE, Bossuyt PM, et al. The PRISMA 2020 statement: an updated
          guideline for reporting systematic reviews. BMJ. 2021;372:n71.
          doi:10.1136/bmj.n71. Official templates:{" "}
          <a href="https://www.prisma-statement.org/prisma-2020-flow-diagram">
            prisma-statement.org/prisma-2020-flow-diagram
          </a>
          . Templates are CC BY 4.0. Diagrflow is an independent tool and is not
          affiliated with, endorsed by, or part of prisma-statement.org.
        </p>
      </section>
    </main>
  );
}
