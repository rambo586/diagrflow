import {
  trackExportAttempt,
  trackExportFailed,
  trackExportGenerated,
  trackValidationError,
} from "./analytics";
import {
  type PrismaInput,
  type PrismaValidationResult,
  validatePrisma,
} from "./prisma";

export function svgMarkup(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  const xml = new XMLSerializer().serializeToString(clone);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function assertValidForExport(
  inputOrValidation?: PrismaInput | PrismaValidationResult,
): PrismaValidationResult | undefined {
  if (!inputOrValidation) return undefined;
  const result =
    "canExport" in inputOrValidation
      ? inputOrValidation
      : validatePrisma(inputOrValidation);

  if (!result.canExport) {
    trackValidationError(result.hardErrors.length, result.confirmations.length);
    const firstIssue = result.hardErrors[0] ?? result.confirmations[0];
    throw new Error(
      firstIssue
        ? `Export blocked: ${firstIssue.message}`
        : "Export blocked: fix validation issues before exporting.",
    );
  }
  return result;
}

export function downloadSvg(
  svg: SVGSVGElement,
  filename = "prisma-2020-flow-diagram.svg",
  inputOrValidation?: PrismaInput | PrismaValidationResult,
): void {
  trackExportAttempt("svg");
  try {
    assertValidForExport(inputOrValidation);
    const blob = new Blob([svgMarkup(svg)], {
      type: "image/svg+xml;charset=utf-8",
    });
    triggerDownload(blob, filename);
    trackExportGenerated("svg");
  } catch (error) {
    const message = error instanceof Error ? error.message : "SVG export failed";
    trackExportFailed("svg", message);
    throw error;
  }
}

export async function downloadPng(
  svg: SVGSVGElement,
  filename = "prisma-2020-flow-diagram.png",
  scale = 3,
  inputOrValidation?: PrismaInput | PrismaValidationResult,
): Promise<void> {
  trackExportAttempt("png");
  try {
    assertValidForExport(inputOrValidation);
  } catch (error) {
    const message = error instanceof Error ? error.message : "PNG export blocked";
    trackExportFailed("png", message);
    throw error;
  }

  const width = Number(svg.getAttribute("width") ?? svg.viewBox.baseVal.width);
  const height = Number(svg.getAttribute("height") ?? svg.viewBox.baseVal.height);
  const markup = svgMarkup(svg);
  const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    await new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Could not create a 2D canvas context"));
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((png) => {
          URL.revokeObjectURL(url);
          if (!png) {
            reject(new Error("PNG export failed"));
            return;
          }
          triggerDownload(png, filename);
          resolve();
        }, "image/png");
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not rasterise the SVG"));
      };
      image.src = url;
    });
    trackExportGenerated("png");
  } catch (error) {
    const message = error instanceof Error ? error.message : "PNG export failed";
    trackExportFailed("png", message);
    throw error;
  }
}
