import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LiveFigure } from "../components/LiveFigure";
import { DIAGRAM_CASES, DEFAULT_CASE_ID, caseById } from "../lib/cases";
import { derivePrisma } from "../lib/prisma";

export function HomePage() {
  const [activeId, setActiveId] = useState(DEFAULT_CASE_ID);
  const active = caseById(activeId) ?? DIAGRAM_CASES[0];
  const stats = useMemo(() => derivePrisma(active.input()), [active]);

  useEffect(() => {
    document.title = "Create a PRISMA 2020 flow diagram — Diagrflow";
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", "https://diagrflow.com/");
  }, []);

  return (
    <main>
      <section className="workbench shell">
        <div>
          <h1>PRISMA 2020 from your counts</h1>
          <p className="lede">
            Type identification, screening, eligibility, and included numbers. The
            official boxes update as you type. Export SVG or PNG with no watermark
            for a manuscript figure.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" to={`/editor?case=${active.id}`}>
              Open this figure
            </Link>
            <Link className="btn btn-ghost" to="/editor">
              Start blank
            </Link>
          </div>
          <p className="fine">
            Free during the MVP. No account. Cite Page et al., BMJ 2021;372:n71 in
            the figure legend. Diagrflow is not affiliated with prisma-statement.org.
          </p>
        </div>
        <LiveFigure diagramCase={active} />
      </section>

      <section className="cases shell" id="cases">
        <div className="cases-head">
          <div>
            <h2>Worked figures</h2>
            <p className="fine">
              Three topologies authors actually draw. Counts are illustrative — they
              are not taken from a published review.
            </p>
          </div>
          <p className="fine">
            Selected: <span className="n">n = {stats.identified}</span> identified →{" "}
            <span className="n">n = {stats.studiesIncluded}</span> studies
          </p>
        </div>
        <div className="case-list">
          {DIAGRAM_CASES.map((item) => (
            <div
              className="case-row"
              key={item.id}
              aria-current={item.id === active.id ? "true" : undefined}
            >
              <button type="button" className="case-select" onClick={() => setActiveId(item.id)}>
                <h3>{item.title}</h3>
                <p>{item.setting}</p>
              </button>
              <p className="case-meta">{item.topology}</p>
              <Link className="btn btn-ghost" to={`/editor?case=${item.id}`}>
                Edit
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="methods shell">
        <h2>What the figure reports</h2>
        <dl>
          <dt>Identification</dt>
          <dd>
            Records from databases and registers, optional per-database lines, and
            records removed before screening (including optional grey boxes).
          </dd>
          <dt>Screening</dt>
          <dd>
            Records screened and excluded, reports sought for retrieval, reports not
            retrieved, and reports assessed for eligibility with reasons.
          </dd>
          <dt>Included</dt>
          <dd>
            Studies included in the review and reports of included studies — two
            different counts in PRISMA 2020.
          </dd>
          <dt>Other methods</dt>
          <dd>
            Optional second column for websites, organisations, and citation
            searching.
          </dd>
        </dl>
      </section>

      <section className="shell" id="examples">
        <h2>Sample figures</h2>
        <p className="fine">
          The same generator, four topologies. Click a figure to load it in the
          editor. Counts are illustrative.
        </p>
        <div className="example-grid">
          {DIAGRAM_CASES.map((item) => (
            <Link className="example-card" key={item.id} to={`/editor?case=${item.id}`}>
              <LiveFigure diagramCase={item} />
            </Link>
          ))}
        </div>
      </section>

      <section className="steps shell">
        <article>
          <span className="n">1</span>
          <h3>Enter screening counts</h3>
          <p className="fine">
            Identification, screening, eligibility reasons, and included studies —
            from your search log, not from a drawing tool.
          </p>
        </article>
        <article>
          <span className="n">2</span>
          <h3>Watch the figure update</h3>
          <p className="fine">
            Official PRISMA 2020 boxes and arrows redraw as you type. Balance
            checks flag counts that do not reconcile.
          </p>
        </article>
        <article>
          <span className="n">3</span>
          <h3>Export SVG or PNG</h3>
          <p className="fine">
            No watermark. Put the file in the manuscript and cite Page et al. in
            the figure legend.
          </p>
        </article>
      </section>

      <section className="shell">
        <h2>PRISMA 2020 versus 2009</h2>
        <div className="compare">
          <article>
            <h3>PRISMA 2020</h3>
            <p className="fine">Current reporting standard for new submissions.</p>
            <ul>
              <li>Separates databases from registers at identification</li>
              <li>Optional grey boxes for automation tools and other removals</li>
              <li>Itemised exclusion reasons at eligibility</li>
              <li>Studies included and reports of included studies are different counts</li>
            </ul>
          </article>
          <article>
            <h3>PRISMA 2009</h3>
            <p className="fine">Superseded. Still seen in older papers.</p>
            <ul>
              <li>One combined identification total</li>
              <li>One number for duplicates, no automation split</li>
              <li>Does not require itemised full-text exclusion reasons</li>
              <li>Diagrflow implements the 2020 new-review templates only</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="faq shell">
        <h2>Questions</h2>
        <details>
          <summary>Can I use the export in a journal submission?</summary>
          <p>
            Yes. The working export has no watermark. Keep the PRISMA 2020 citation
            in the figure legend. Diagrflow is not affiliated with prisma-statement.org.
          </p>
        </details>
        <details>
          <summary>Are the sample figures from published reviews?</summary>
          <p>
            No. They are illustrative count sets for typical topologies, labelled as
            such, so you can see a complete figure before entering your own numbers.
          </p>
        </details>
        <details>
          <summary>Does this follow PRISMA 2020 wording?</summary>
          <p>
            Box labels follow the official new-review templates, including the
            record / report / study distinction and the optional other-methods column.
          </p>
        </details>
        <details>
          <summary>Is there a paid plan?</summary>
          <p>Not during this MVP. The editor and exports are free, with no account.</p>
        </details>
      </section>

      <section className="shell">
        <p className="citation">
          Page MJ, McKenzie JE, Bossuyt PM, et al. The PRISMA 2020 statement: an
          updated guideline for reporting systematic reviews. BMJ. 2021;372:n71.
          doi:10.1136/bmj.n71. Templates:{" "}
          <a href="https://www.prisma-statement.org/prisma-2020-flow-diagram">
            prisma-statement.org/prisma-2020-flow-diagram
          </a>
          , CC BY 4.0.
        </p>
      </section>
    </main>
  );
}
