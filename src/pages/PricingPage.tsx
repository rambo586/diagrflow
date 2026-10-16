import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PRICING_META } from "../seo";

export function PricingPage() {
  useEffect(() => {
    document.title = PRICING_META.title;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", PRICING_META.canonical);
  }, []);

  return (
    <main className="shell doc-page">
      <h1>Free while this is an MVP</h1>
      <p className="lede">
        Diagrflow is a focused tool to create a PRISMA flow diagram for a
        systematic review. There is no paid plan and no payment form on this site.
      </p>
      <p className="price">$0</p>
      <h2>What you can use without paying</h2>
      <ul>
        <li>Interactive PRISMA 2020 diagram with official box labels</li>
        <li>Illustrative topologies you can load and overwrite in the editor</li>
        <li>SVG and PNG export, no watermark</li>
        <li>Authors may use exports in journal submissions</li>
      </ul>
      <div className="actions">
        <Link className="btn btn-primary" to="/editor">
          Open the editor
        </Link>
        <Link className="btn btn-ghost" to="/#cases">
          Worked figures
        </Link>
      </div>
      <h2>What this page does not sell</h2>
      <p>
        There is no Stripe checkout, no account, and no customer quotes. If a paid
        tier is added later, it will be described here in plain language before
        anyone is asked for a card. Until then, treat the product as a free editor
        for one job: type counts and export a PRISMA 2020 figure.
      </p>
      <h3>Editor and exports</h3>
      <p>
        The <Link to="/editor">editor</Link> is the product. You enter
        identification, screening, eligibility, and included counts. The figure
        updates. You download SVG or PNG. Working exports have no watermark.
        Authors may place the file in a manuscript. That path does not require a
        plan.
      </p>
      <h3>Citation still applies</h3>
      <p>
        Keep the PRISMA 2020 citation in the figure legend: Page MJ, McKenzie JE,
        Bossuyt PM, et al. The PRISMA 2020 statement: an updated guideline for
        reporting systematic reviews. BMJ. 2021;372:n71. doi:10.1136/bmj.n71.
        Diagrflow is not affiliated with prisma-statement.org. Official templates
        remain on{" "}
        <a href="https://www.prisma-statement.org/prisma-2020-flow-diagram">
          prisma-statement.org/prisma-2020-flow-diagram
        </a>
        , CC BY 4.0.
      </p>
      <p className="fine">
        Return to the <Link to="/">home page</Link> for the method notes, or open
        the <Link to="/editor">editor</Link> and start from a blank sheet.
      </p>
    </main>
  );
}
