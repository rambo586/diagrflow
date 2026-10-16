import { describe, expect, it } from "vitest";
import { render } from "./entry-server";
import { applyPrerenderedPage } from "./prerenderHtml";
import {
  EDITOR_DESCRIPTION,
  HOME_DESCRIPTION,
  HOME_META,
  PRICING_DESCRIPTION,
  getRouteMeta,
} from "./seo";

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(text: string): string[] {
  return text.split(" ").filter(Boolean);
}

describe("route meta", () => {
  it("keeps the homepage description under 160 characters", () => {
    expect(HOME_DESCRIPTION.length).toBeGreaterThan(50);
    expect(HOME_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(PRICING_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(EDITOR_DESCRIPTION.length).toBeLessThanOrEqual(160);
  });

  it("keeps the homepage canonical on the apex origin", () => {
    expect(HOME_META.canonical).toBe("https://diagrflow.com/");
    expect(getRouteMeta("/").canonical).toBe("https://diagrflow.com/");
  });
});

describe("prerendered marketing HTML", () => {
  it("puts an H1, keyword theme, and body copy in the first homepage HTML", () => {
    const { html } = render("/");
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    expect(h1).not.toBeNull();
    expect(html.match(/<h1\b/g)?.length).toBe(1);
    expect(h1?.[1].toLowerCase()).toMatch(/create a prisma(?: 2020)? flow diagram/);
    expect(html).toMatch(/<h2[^>]*>How to create a PRISMA flow diagram<\/h2>/);
    expect(html).toMatch(/<h3\b/);
    expect(html).toContain('href="/editor"');
    expect(html).toContain('href="/pricing"');
    expect(html.toLowerCase()).toContain("not affiliated");
    expect(html).toContain("Page MJ");
    expect(html).toContain("BMJ. 2021;372:n71");

    const text = stripTags(html);
    const list = words(text);
    expect(list.length).toBeGreaterThanOrEqual(400);
    expect(text.toLowerCase()).toContain("create a prisma flow diagram");
    expect(list.slice(0, 100).join(" ").toLowerCase()).toContain(
      "create a prisma flow diagram",
    );
    expect(html).toMatch(/<p[\s>]/);
  });

  it("prerenders pricing with an H1 and internal links", () => {
    const { html, meta } = render("/pricing");
    expect(html).toMatch(/<h1\b/);
    expect(html).toMatch(/<h2\b/);
    expect(html).toContain('href="/editor"');
    expect(html).toContain('href="/"');
    expect(html.toLowerCase()).toContain("not affiliated");
    expect(meta.canonical).toBe("https://diagrflow.com/pricing");
  });

  it("injects markup into the Vite HTML shell", () => {
    const template = `<!doctype html><html><head>
      <title>Old</title>
      <meta name="description" content="old" />
      <link rel="canonical" href="https://example.com/" />
      <meta property="og:title" content="Old" />
      <meta property="og:description" content="old" />
      <meta property="og:url" content="https://example.com/" />
      <meta name="twitter:title" content="Old" />
      <meta name="twitter:description" content="old" />
    </head><body><div id="root"></div></body></html>`;
    const page = applyPrerenderedPage(template, "<h1>Create a PRISMA flow diagram</h1><p>Body</p>", HOME_META);
    expect(page).toContain("<h1>Create a PRISMA flow diagram</h1>");
    expect(page).toContain("<p>Body</p>");
    expect(page).toContain(`<title>${HOME_META.title}</title>`);
    expect(page).toContain(`content="${HOME_DESCRIPTION}"`);
    expect(page).toContain('href="https://diagrflow.com/"');
  });
});
