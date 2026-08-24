import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Connect, Plugin } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const PRERENDERED_PREVIEW: Record<string, string> = {
  "/pricing": "pricing/index.html",
  "/pricing/": "pricing/index.html",
  "/editor": "editor/index.html",
  "/editor/": "editor/index.html",
};

/** Serve SSG HTML in `vite preview` so /pricing and /editor are not the homepage shell. */
function servePrerenderedPreview(): Plugin {
  return {
    name: "serve-prerendered-preview",
    configurePreviewServer(server) {
      const outDir = resolve(server.config.root, server.config.build.outDir);
      const middleware: Connect.NextHandleFunction = (req, res, next) => {
        const path = req.url?.split("?")[0] ?? "";
        const rel = PRERENDERED_PREVIEW[path];
        if (!rel) {
          next();
          return;
        }
        const file = resolve(outDir, rel);
        if (!existsSync(file)) {
          next();
          return;
        }
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(readFileSync(file));
      };
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), servePrerenderedPreview()],
  test: {
    environment: "node",
  },
});
