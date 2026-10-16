import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";

const PORT = Number(process.env.PORT || 4173);
const DIST_DIR = path.resolve(process.env.DIST_DIR || "dist");
const EXPORTS_DIR = path.resolve(process.env.EXPORTS_DIR || "docs/exports");
const ARTIFACTS_EXPORTS_DIR = process.env.ARTIFACTS_EXPORTS_DIR
  ? path.resolve(process.env.ARTIFACTS_EXPORTS_DIR)
  : fs.existsSync("/Users/mac/.gemini/antigravity-cli/brain/e0930027-8595-45f4-be13-658bd368956e/exports")
  ? path.resolve("/Users/mac/.gemini/antigravity-cli/brain/e0930027-8595-45f4-be13-658bd368956e/exports")
  : null;

const CHROME_PATH =
  process.env.CHROME_BIN ||
  (process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : "google-chrome");

fs.mkdirSync(EXPORTS_DIR, { recursive: true });
if (ARTIFACTS_EXPORTS_DIR) {
  fs.mkdirSync(ARTIFACTS_EXPORTS_DIR, { recursive: true });
}

// Read CSP directly from public/_headers line 7
const headersContent = fs.readFileSync("public/_headers", "utf8");
const cspMatch = headersContent.match(/Content-Security-Policy:\s*([^\r\n]+)/);
const CSP = cspMatch ? cspMatch[1] : "default-src 'self'";

console.log("Using CSP header:\n", CSP);

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split("?")[0];
  if (reqPath === "/") reqPath = "/index.html";
  else if (reqPath === "/editor" || reqPath === "/editor/") reqPath = "/editor/index.html";
  else if (reqPath === "/pricing" || reqPath === "/pricing/") reqPath = "/pricing/index.html";

  const filePath = path.join(DIST_DIR, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
    res.setHeader("Content-Security-Policy", CSP);
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Security-Policy", CSP);
    fs.createReadStream(path.join(DIST_DIR, "index.html")).pipe(res);
  }
});

const CASES = [
  { id: "t2d-exercise", prefix: "01-t2d-exercise", expectedText: "1851", expectedW: 760, expectedH: 754 },
  { id: "citation-search", prefix: "02-citation-search", expectedText: "920", expectedW: 1292, expectedH: 738 },
  { id: "automation-screen", prefix: "03-automation-screen", expectedText: "4112", expectedW: 760, expectedH: 786 },
  { id: "rct-db-only", prefix: "04-rct-db-only", expectedText: "2180", expectedW: 760, expectedH: 738 },
  { id: "long-reasons-multi-db", prefix: "05-long-reasons-multi-db", expectedText: "3420", expectedW: 760, expectedH: 914 },
  { id: "large-counts-full-two-col", prefix: "06-large-counts-full-two-col", expectedText: "124500", expectedW: 1292, expectedH: 770 },
];

server.listen(PORT, async () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "chrome-diagrflow-"));
  const chromeProc = spawn(CHROME_PATH, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--remote-allow-origins=*",
    `--user-data-dir=${tmpDir}`,
    "--disable-gpu",
    "--no-sandbox",
    "about:blank",
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  try {
    const versionRes = await fetch("http://127.0.0.1:9222/json/version");
    if (!versionRes.ok) {
      throw new Error(`Failed to query Chrome version: ${versionRes.statusText}`);
    }
    const versionData = await versionRes.json();
    console.log("Connected to Chrome:", versionData.Browser);

    const newTargetRes = await fetch(
      `http://127.0.0.1:9222/json/new?http://127.0.0.1:${PORT}/editor`,
      { method: "PUT" }
    );
    const targetData = await newTargetRes.json();

    const ws = new WebSocket(targetData.webSocketDebuggerUrl);
    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    };

    const send = (method, params = {}) => {
      const id = msgId++;
      return new Promise((resolve, reject) => {
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await new Promise((r) => (ws.onopen = r));
    await send("Page.enable");
    await send("Runtime.enable");

    // Listen to console API calls to detect any CSP violations or errors
    ws.addEventListener("message", (evt) => {
      const data = JSON.parse(evt.data);
      if (data.method === "Runtime.consoleAPICalled") {
        const text = data.params.args.map((a) => a.value || a.description).join(" ");
        if (data.params.type === "error") {
          console.error("Browser Console Error:", text);
          if (text.includes("Content Security Policy") || text.includes("CSP")) {
            process.exitCode = 1;
          }
        }
      }
    });

    console.log("\n--- Starting Generation of 12 Diagram Export Artifacts ---");

    for (const item of CASES) {
      console.log(`\nProcessing Case ${item.prefix} (${item.id})...`);
      await send("Page.navigate", {
        url: `http://127.0.0.1:${PORT}/editor?case=${item.id}`,
      });

      // Wait for page hydration and specific case counts to render
      await send("Runtime.evaluate", {
        expression: `
          (async () => {
            const expected = ${JSON.stringify(item.expectedText)};
            const start = Date.now();
            while (Date.now() - start < 6000) {
              const svg = document.querySelector("#prisma-diagram-svg");
              if (svg && svg.textContent.includes(expected)) return true;
              await new Promise(r => setTimeout(r, 100));
            }
            throw new Error("Timeout waiting for SVG to contain " + expected);
          })()
        `,
        awaitPromise: true,
      });

      // Extract SVG markup and rasterize PNG in browser page context using exact download flow
      const exportResult = await send("Runtime.evaluate", {
        expression: `
          (async () => {
            const svg = document.querySelector("#prisma-diagram-svg");
            if (!svg) throw new Error("PRISMA diagram SVG element (#prisma-diagram-svg) not found in DOM");
            
            // 1. SVG serialization
            const clone = svg.cloneNode(true);
            clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
            const xml = new XMLSerializer().serializeToString(clone);
            const svgMarkup = '<?xml version="1.0" encoding="UTF-8"?>\\n' + xml;

            // 2. PNG Rasterization at scale = 3
            const scale = 3;
            const width = Number(svg.getAttribute("width") || svg.viewBox.baseVal.width);
            const height = Number(svg.getAttribute("height") || svg.viewBox.baseVal.height);

            const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
            const blobUrl = URL.createObjectURL(blob);

            return await new Promise((resolve, reject) => {
              const image = new Image();
              image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(width * scale));
                canvas.height = Math.max(1, Math.round(height * scale));
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                  URL.revokeObjectURL(blobUrl);
                  reject(new Error("Canvas context failed"));
                  return;
                }
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/png");
                URL.revokeObjectURL(blobUrl);
                resolve({
                  svgMarkup,
                  pngDataUrl: dataUrl,
                  width: canvas.width,
                  height: canvas.height,
                  layoutW: width,
                  layoutH: height
                });
              };
              image.onerror = (e) => {
                URL.revokeObjectURL(blobUrl);
                reject(new Error("Could not rasterise the SVG (CSP blob: violation or image error)"));
              };
              image.src = blobUrl;
            });
          })()
        `,
        awaitPromise: true,
        returnByValue: true,
      });

      if (!exportResult.result || !exportResult.result.value) {
        throw new Error(`Export evaluation failed for case ${item.id}: ${JSON.stringify(exportResult)}`);
      }

      const { svgMarkup, pngDataUrl, width, height, layoutW, layoutH } = exportResult.result.value;

      // Assert dimensions strictly match expected scale = 3
      const expectedScaleW = Math.round(item.expectedW * 3);
      const expectedScaleH = Math.round(item.expectedH * 3);
      if (width !== expectedScaleW || height !== expectedScaleH) {
        throw new Error(
          `Dimension mismatch for ${item.prefix}: got ${width}x${height}, expected ${expectedScaleW}x${expectedScaleH}`
        );
      }

      // Write SVG
      const svgPath = path.join(EXPORTS_DIR, `${item.prefix}.svg`);
      fs.writeFileSync(svgPath, svgMarkup, "utf8");
      if (ARTIFACTS_EXPORTS_DIR) {
        fs.writeFileSync(path.join(ARTIFACTS_EXPORTS_DIR, `${item.prefix}.svg`), svgMarkup, "utf8");
      }

      // Write PNG from data URL
      const base64Data = pngDataUrl.replace(/^data:image\/png;base64,/, "");
      const pngBuffer = Buffer.from(base64Data, "base64");
      const pngPath = path.join(EXPORTS_DIR, `${item.prefix}.png`);
      fs.writeFileSync(pngPath, pngBuffer);
      if (ARTIFACTS_EXPORTS_DIR) {
        fs.writeFileSync(path.join(ARTIFACTS_EXPORTS_DIR, `${item.prefix}.png`), pngBuffer);
      }

      console.log(
        `✓ ${item.prefix}: SVG written (${svgMarkup.length} B), PNG written (${pngBuffer.length} B) - Dimensions: ${width}x${height} (Scale 3 from layout ${layoutW}x${layoutH})`
      );
    }

    // Capture desktop viewport (1440x1080)
    console.log("\nCapturing Desktop Editor Viewport (1440x1080)...");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/editor?case=t2d-exercise` });
    await new Promise((r) => setTimeout(r, 1200));
    const desktopScreenshot = await send("Page.captureScreenshot", { format: "png" });
    const desktopBuffer = Buffer.from(desktopScreenshot.data, "base64");
    fs.writeFileSync(path.join(EXPORTS_DIR, "viewport-desktop-editor.png"), desktopBuffer);
    if (ARTIFACTS_EXPORTS_DIR) {
      fs.writeFileSync(path.join(ARTIFACTS_EXPORTS_DIR, "viewport-desktop-editor.png"), desktopBuffer);
    }
    console.log("✓ Desktop viewport captured");

    // Capture mobile viewport (500x960)
    console.log("\nCapturing Mobile Editor Viewport (500x960)...");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 500,
      height: 960,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/editor?case=t2d-exercise` });
    await new Promise((r) => setTimeout(r, 1200));
    const mobileScreenshot = await send("Page.captureScreenshot", { format: "png" });
    const mobileBuffer = Buffer.from(mobileScreenshot.data, "base64");
    fs.writeFileSync(path.join(EXPORTS_DIR, "viewport-mobile-editor.png"), mobileBuffer);
    if (ARTIFACTS_EXPORTS_DIR) {
      fs.writeFileSync(path.join(ARTIFACTS_EXPORTS_DIR, "viewport-mobile-editor.png"), mobileBuffer);
    }
    console.log("✓ Mobile viewport captured");

    // Verify Anti-pattern in real browser: Input 10 databases, 20 duplicates -> click download
    console.log("\nVerifying Anti-Pattern (Databases 10, Deduplication 20) in Browser UI...");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/editor` });
    await new Promise((r) => setTimeout(r, 1000));

    const antiPatternResult = await send("Runtime.evaluate", {
      expression: `
        (() => {
          function setVal(input, val) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            setter.call(input, val);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }

          const inputs = Array.from(document.querySelectorAll("input[type='number']"));
          const dbInput = inputs[0];
          const dupInput = inputs.find(i => i.closest("div")?.textContent?.includes("Duplicate records removed")) || inputs[2];
          
          if (dbInput) setVal(dbInput, "10");
          if (dupInput) setVal(dupInput, "20");

          // Try clicking Download PNG button
          const buttons = Array.from(document.querySelectorAll("button"));
          const downloadPngBtn = buttons.find(b => b.textContent?.includes("Download PNG"));
          if (downloadPngBtn) {
            downloadPngBtn.click();
          }

          const notice = document.querySelector(".notice.error-banner")?.textContent || "";
          const summary = document.querySelector(".validation-summary")?.textContent || "";
          const isAriaDisabled = downloadPngBtn?.getAttribute("aria-disabled") === "true";
          return { notice, summary, isAriaDisabled };
        })()
      `,
      returnByValue: true,
    });
    console.log("Anti-Pattern Verification Result in UI:", antiPatternResult.result.value);

    // Strict assertion on anti-pattern blocking
    const anti = antiPatternResult.result.value;
    if (!anti.isAriaDisabled) {
      throw new Error(`Anti-pattern failed: Download button is not aria-disabled`);
    }
    if (!anti.summary && !anti.notice) {
      throw new Error(`Anti-pattern failed: expected error summary or error banner, got neither`);
    }
    console.log("✓ Anti-pattern assertion passed (Download blocked & error displayed)");

    // Verify UI Reset functionality: Load case -> edit -> click Reset -> verify cleared
    console.log("\nVerifying Reset functionality in Browser UI (load case -> edit -> Reset)...");
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/editor?case=large-counts-full-two-col` });
    await new Promise((r) => setTimeout(r, 1200));

    const resetCheck = await send("Runtime.evaluate", {
      expression: `
        (async () => {
          function setVal(input, val) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            setter.call(input, val);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }

          const inputs = Array.from(document.querySelectorAll("input[type='number']"));
          const dbInput = inputs[0];
          const initialVal = dbInput?.value;

          // Edit input
          setVal(dbInput, "999");
          const editedVal = dbInput?.value;

          // Click Reset
          const buttons = Array.from(document.querySelectorAll("button"));
          const resetBtn = buttons.find(b => b.textContent?.trim() === "Reset");
          if (!resetBtn) throw new Error("Reset button not found");
          resetBtn.click();

          // Wait for state & router update
          await new Promise(r => setTimeout(r, 400));

          const finalDbVal = dbInput?.value;
          const urlAfterReset = window.location.href;
          const hasCase = new URL(urlAfterReset).searchParams.has("case");
          const noticeText = document.querySelector(".notice")?.textContent || "";

          return { initialVal, editedVal, finalDbVal, urlAfterReset, hasCase, noticeText };
        })()
      `,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log("Reset Verification Result:", resetCheck.result.value);

    const resetVal = resetCheck.result.value;
    if (resetVal.initialVal !== "124500") {
      throw new Error(`Reset verification failed: Expected initial databases=124500, got ${resetVal.initialVal}`);
    }
    if (resetVal.editedVal !== "999") {
      throw new Error(`Reset verification failed: Expected edited databases=999, got ${resetVal.editedVal}`);
    }
    if (resetVal.hasCase) {
      throw new Error(`Reset verification failed: URL still contains case param: ${resetVal.urlAfterReset}`);
    }
    if (resetVal.finalDbVal === "124500" || resetVal.finalDbVal === "999") {
      throw new Error(`Reset verification failed: databases not cleared! Still ${resetVal.finalDbVal}`);
    }
    if (resetVal.finalDbVal !== "0" && resetVal.finalDbVal !== "") {
      throw new Error(`Reset verification failed: expected databases to be 0 or empty, got ${resetVal.finalDbVal}`);
    }
    if (resetVal.noticeText) {
      throw new Error(`Reset verification failed: case notice was not cleared, got: ${resetVal.noticeText}`);
    }
    console.log("✓ Reset verification passed (URL param removed, data cleared, no reversion)");

    ws.close();
  } catch (err) {
    console.error("Execution failed:", err);
    process.exitCode = 1;
  } finally {
    chromeProc.kill("SIGKILL");
    server.close();
    setTimeout(() => {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // ignore locked files
      }
      const exitCode = process.exitCode || 0;
      if (exitCode === 0) {
        console.log("\nAll Done!");
      } else {
        console.error(`\nArtifacts generation finished with error exitCode: ${exitCode}`);
      }
      process.exit(exitCode);
    }, 500);
  }
});
