import { useEffect } from "react";
import { Link } from "react-router-dom";

export function PricingPage() {
  useEffect(() => {
    document.title = "Pricing — Diagrflow";
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", "https://diagrflow.com/pricing");
  }, []);

  return (
    <main className="shell section">
      <p className="kicker">Pricing</p>
      <h1>Free while this is an MVP</h1>
      <p className="lede">
        Diagrflow is a focused PRISMA 2020 maker. There is no paid plan and no payment
        form on this site.
      </p>
      <div className="grid-2">
        <article className="card">
          <p className="price">$0</p>
          <h3>Public editor</h3>
          <ul>
            <li>Interactive PRISMA 2020 diagram</li>
            <li>SVG and PNG export, no watermark</li>
            <li>Authors may use exports in journal submissions</li>
            <li>One built-in sample diagram</li>
          </ul>
          <Link className="btn btn-primary" to="/editor">
            Open the editor
          </Link>
        </article>
        <article className="card">
          <h3>What this is not</h3>
          <p>
            There is no Stripe checkout, no usage metric on this page, and no customer
            quotes. If a paid tier is added later, it will be described here in plain
            language — not invented in advance.
          </p>
          <p className="fine">
            Publication rights: exported figures belong to you to include in manuscripts
            and supplements. Keep the PRISMA 2020 citation in the figure legend.
          </p>
        </article>
      </div>
    </main>
  );
}
