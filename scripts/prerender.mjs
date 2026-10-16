import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dist = resolve(root, "dist");

const server = await createServer({
  root,
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "warn",
});

try {
  const [{ render }, { applyPrerenderedPage }, { PRERENDER_ROUTES }] = await Promise.all([
    server.ssrLoadModule("/src/entry-server.tsx"),
    server.ssrLoadModule("/src/prerenderHtml.ts"),
    server.ssrLoadModule("/src/seo.ts"),
  ]);

  const template = readFileSync(resolve(dist, "index.html"), "utf8");

  for (const route of PRERENDER_ROUTES) {
    const { html, meta } = render(route);
    if (!html.includes("<h1")) {
      throw new Error(`Prerender of ${route} produced no H1`);
    }
    if (!html.includes("<p")) {
      throw new Error(`Prerender of ${route} produced no paragraph`);
    }
    const page = applyPrerenderedPage(template, html, meta);
    const out =
      route === "/"
        ? resolve(dist, "index.html")
        : resolve(dist, route.slice(1), "index.html");
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, page);
    console.log(`prerendered ${route} -> ${out}`);
  }
} finally {
  await server.close();
}
