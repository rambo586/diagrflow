import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LiveFigure } from "../components/LiveFigure";
import { DIAGRAM_CASES, DEFAULT_CASE_ID, caseById } from "../lib/cases";
import { derivePrisma } from "../lib/prisma";
import { HOME_META } from "../seo";

export function HomePage() {
  const [activeId, setActiveId] = useState(DEFAULT_CASE_ID);
  const active = caseById(activeId) ?? DIAGRAM_CASES[0];
  const stats = useMemo(() => derivePrisma(active.input()), [active]);

  useEffect(() => {
    document.title = HOME_META.title;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", HOME_META.canonical);
  }, []);

  return (
    <main>
      <section className="workbench shell">
        <div>
          <h1>Create a PRISMA 2020 flow diagram from your counts</h1>
          <p className="lede">
            Use Diagrflow to create a PRISMA flow diagram for a systematic review.
            Type identification, screening, eligibility, and included numbers from
            your search log. Official boxes update as you type. Export SVG or PNG
            with no watermark and put the file in the manuscript.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" to={`/editor?case=${active.id}`}>
              Open this figure
            </Link>
            <Link className="btn btn-ghost" to="/editor">
              Start blank
            </Link>
            <Link className="btn btn-ghost" to="/pricing">
              Pricing
            </Link>
          </div>
          <p className="fine">
            Free during the MVP. No account. Cite Page et al., BMJ 2021;372:n71 in
            the figure legend. Diagrflow is not affiliated with prisma-statement.org.
            See <Link to="/pricing">pricing</Link> or open the{" "}
            <Link to="/editor">editor</Link>.
          </p>
        </div>
        <LiveFigure diagramCase={active} />
      </section>

      <section className="copy shell" id="create-prisma-flow-diagram">
        <h2>How to create a PRISMA flow diagram</h2>
        <p>
          A PRISMA 2020 flow diagram reports how records moved from identification
          through screening to the studies and reports included in a systematic
          review. Journals that follow the PRISMA 2020 statement expect that figure
          in new submissions. Diagrflow is a focused editor for that figure: you
          enter counts, the official boxes redraw, and you export a file. It is not
          a general drawing canvas and it does not invent numbers for you.
        </p>
        <p>
          Start from a search log, not from a sketch. You need records identified
          from databases and, if you searched them, from registers; records removed
          before screening (duplicates, and the optional grey-box lines if they
          apply); records screened and excluded; reports sought for retrieval and
          reports not retrieved; reports assessed for eligibility with itemised
          exclusion reasons; and the two included counts — studies included in the
          review, and reports of included studies. Those last two numbers are
          different in PRISMA 2020. If you also identified reports from websites,
          organisations, or citation searching, use the other-methods column
          instead of folding those records into the database total.
        </p>
        <p>
          Open the <Link to="/editor">editor</Link>, type the counts, and watch
          identification, screening, and included boxes update. Balance checks flag
          totals that do not reconcile so you can correct the log before export.
          When the figure matches the log, download SVG or PNG. There is no
          watermark on the working export. Authors may use the file in a journal
          submission. Keep the PRISMA 2020 citation in the figure legend. The{" "}
          <Link to="/pricing">pricing</Link> page states the current MVP terms:
          the editor and exports are free, and there is no payment form.
        </p>
        <h3>Enter counts from the search log</h3>
        <p>
          Identification is not a single combined total. PRISMA 2020 separates
          bibliographic databases from trial registers. You may add optional
          per-database lines under that box. Records removed before screening can
          include duplicates, records marked ineligible by automation tools, and
          other removals. Hide a grey box when that line does not apply; do not
          zero it as if you measured it. Screening then reports records screened,
          records excluded (optionally split between human and automation
          decisions), reports sought for retrieval, reports not retrieved, and
          reports assessed for eligibility. Exclusion reasons at full text should
          be itemised. Included reports the study count and the report count
          separately.
        </p>
        <h3>Check the figure against PRISMA 2020</h3>
        <p>
          Box labels follow the official new-review templates, including the
          record / report / study distinction. That wording is part of the
          reporting standard, not decoration. If a line does not apply to your
          review, omit it rather than inventing a zero. If you used other methods,
          keep that work in the second column so readers can see a second
          identification path. Diagrflow implements the 2020 new-review templates
          only. It does not draw the superseded PRISMA 2009 single-stream figure.
        </p>
        <h3>Export and cite the statement</h3>
        <p>
          Put the exported SVG or PNG in the manuscript. In the figure legend,
          cite Page MJ, McKenzie JE, Bossuyt PM, et al. The PRISMA 2020 statement:
          an updated guideline for reporting systematic reviews. BMJ.
          2021;372:n71. doi:10.1136/bmj.n71. The official templates are published
          at{" "}
          <a href="https://www.prisma-statement.org/prisma-2020-flow-diagram">
            prisma-statement.org/prisma-2020-flow-diagram
          </a>{" "}
          under CC BY 4.0. Diagrflow adapts that structure. It is not affiliated
          with prisma-statement.org and does not speak for the PRISMA authors.
        </p>
      </section>

      <section className="cases shell" id="cases">
        <div className="cases-head">
          <div>
            <h2>Worked figures</h2>
            <p className="fine">
              Four topologies authors actually draw. Counts are illustrative — they
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

      <section className="copy shell">
        <h2>Counts you type into the editor</h2>
        <p>
          The editor is a worksheet, not a style picker. Each field maps to a box
          or a line on the official figure. You do not drag arrows. You do not
          choose a theme. You type the numbers you already collected while running
          the search and the screen. If a count is unknown, stop and return to the
          log; the figure should not paper over a missing tally.
        </p>
        <p>
          Databases and registers are entered separately at identification. Optional
          named database lines sit under that box when you want readers to see
          PubMed, Embase, CENTRAL, or another source as its own n. Duplicates
          removed, automation-ineligible records, and other removals belong in the
          pre-screening block. Title and abstract exclusions belong in screening.
          Full-text exclusions belong in eligibility, with a reason and a count for
          each reason. Studies included and reports of included studies are typed
          last, or derived when your inputs already determine them.
        </p>
        <p>
          Worked figures on this page are labelled illustrative. They exist so you
          can see a complete topology — databases only, databases plus registers,
          a two-column other-methods figure, or grey-box automation lines — before
          you replace the numbers with your own. They are not taken from a
          published review and should not be copied into a manuscript as if they
          were. Load one in the <Link to="/editor">editor</Link>, then overwrite
          every count.
        </p>
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
          <p>
            Not during this MVP. The <Link to="/editor">editor</Link> and exports
            are free, with no account. The <Link to="/pricing">pricing</Link> page
            says so in plain language. There is no checkout on this site.
          </p>
        </details>
        <details>
          <summary>What should I put in the figure legend?</summary>
          <p>
            Name the review and cite Page et al., BMJ 2021;372:n71. If the figure
            uses an illustrative worked example from this site, do not submit that
            example as your review&apos;s flow diagram. Replace every count first.
          </p>
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
          , CC BY 4.0. Diagrflow is not affiliated with prisma-statement.org.
        </p>
      </section>
    </main>
  );
}
