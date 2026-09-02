import type { RouteMeta } from "./seo";

export function escapeAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function replaceTaggedAttr(
  html: string,
  attrName: "name" | "property",
  attrValue: string,
  content: string,
): string {
  const pattern = new RegExp(
    `(<meta\\s+${attrName}="${attrValue}"\\s+content=")[^"]*(")`,
  );
  return html.replace(pattern, `$1${escapeAttr(content)}$2`);
}

/** Inject prerendered markup and per-route head tags into the Vite HTML shell. */
export function applyPrerenderedPage(
  template: string,
  appHtml: string,
  meta: RouteMeta,
): string {
  if (!template.includes('<div id="root"></div>')) {
    throw new Error("HTML template is missing an empty #root");
  }

  let html = template.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`,
  );
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(meta.title)}</title>`);
  html = html.replace(
    /(<link rel="canonical" href=")[^"]*(")/,
    `$1${escapeAttr(meta.canonical)}$2`,
  );
  html = replaceTaggedAttr(html, "name", "description", meta.description);
  html = replaceTaggedAttr(html, "property", "og:title", meta.title);
  html = replaceTaggedAttr(html, "property", "og:description", meta.description);
  html = replaceTaggedAttr(html, "property", "og:url", meta.ogUrl);
  html = replaceTaggedAttr(html, "name", "twitter:title", meta.title);
  html = replaceTaggedAttr(html, "name", "twitter:description", meta.description);
  return html;
}
