import { useEffect } from "react";
import { Link } from "react-router-dom";

export function PricingPage() {
  useEffect(() => {
    document.title = "Pricing — Diagrflow";
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", "https://diagrflow.com/pricing");
  }, []);

  return (
    <main className="shell doc-page">
      <h1>Free while this is an MVP</h1>
      <p className="lede">
        Diagrflow is a focused PRISMA 2020 maker. There is no paid plan and no
        payment form on this site.
      </p>
      <p className="price">$0</p>
      <ul>
        <li>Interactive PRISMA 2020 diagram with official box labels</li>
        <li>Three illustrative topologies you can load and edit</li>
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
      <p className="fine">
        There is no Stripe checkout and no customer quotes. If a paid tier is added
        later, it will be described here in plain language. Keep the PRISMA 2020
        citation in the figure legend.
      </p>
    </main>
  );
}
