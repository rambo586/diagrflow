import {
  type ExportErrorCode,
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

export class ExportBlockedError extends Error {
  readonly code: ExportErrorCode;
  constructor(code: ExportErrorCode, message: string) {
    super(message);
    this.name = "ExportBlockedError";
    this.code = code;
  }
}

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
  inputOrValidation: PrismaInput | PrismaValidationResult,
): PrismaValidationResult {
  if (!inputOrValidation) {
    throw new ExportBlockedError(
      "MISSING_INPUT",
      "Export blocked: validation result or input is required.",
    );
  }
  const result =
    "canExport" in inputOrValidation
      ? inputOrValidation
      : validatePrisma(inputOrValidation);

  if (!result.canExport) {
    trackValidationError(result.hardErrors.length, result.confirmations.length);
    const firstIssue = result.hardErrors[0] ?? result.confirmations[0];
    throw new ExportBlockedError(
      "VALIDATION_FAILED",
      firstIssue
        ? `Export blocked: ${firstIssue.message}`
        : "Export blocked: fix validation issues before exporting.",
    );
  }
  return result;
}

export function downloadSvg(
  svg: SVGSVGElement,
  inputOrValidation: PrismaInput | PrismaValidationResult,
): void;
export function downloadSvg(
  svg: SVGSVGElement,
  filename: string,
  inputOrValidation: PrismaInput | PrismaValidationResult,
): void;
export function downloadSvg(
  svg: SVGSVGElement,
  filenameOrInput?: string | PrismaInput | PrismaValidationResult,
  inputOrValidation?: PrismaInput | PrismaValidationResult,
): void {
  let filename = "prisma-2020-flow-diagram.svg";
  let targetValidation: PrismaInput | PrismaValidationResult | undefined;

  if (typeof filenameOrInput === "string") {
    filename = filenameOrInput || filename;
    targetValidation = inputOrValidation;
  } else {
    targetValidation = filenameOrInput;
  }

  trackExportAttempt("svg");
  try {
    if (!targetValidation) {
      throw new ExportBlockedError(
        "MISSING_INPUT",
        "Export blocked: validation result or input is required.",
      );
    }
    assertValidForExport(targetValidation);
    const blob = new Blob([svgMarkup(svg)], {
      type: "image/svg+xml;charset=utf-8",
    });
    triggerDownload(blob, filename);
    trackExportGenerated("svg");
  } catch (error) {
    const code: ExportErrorCode =
      error instanceof ExportBlockedError ? error.code : "UNKNOWN_EXPORT_ERROR";
    trackExportFailed("svg", code);
    throw error;
  }
}

export async function downloadPng(
  svg: SVGSVGElement,
  inputOrValidation: PrismaInput | PrismaValidationResult,
): Promise<void>;
export async function downloadPng(
  svg: SVGSVGElement,
  filename: string,
  scale: number,
  inputOrValidation: PrismaInput | PrismaValidationResult,
): Promise<void>;
export async function downloadPng(
  svg: SVGSVGElement,
  filenameOrInput?: string | PrismaInput | PrismaValidationResult,
  scaleOrUndefined?: number,
  inputOrValidation?: PrismaInput | PrismaValidationResult,
): Promise<void> {
  let filename = "prisma-2020-flow-diagram.png";
  let scale = 3;
  let targetValidation: PrismaInput | PrismaValidationResult | undefined;

  if (typeof filenameOrInput === "string") {
    filename = filenameOrInput || filename;
    scale = typeof scaleOrUndefined === "number" ? scaleOrUndefined : 3;
    targetValidation = inputOrValidation;
  } else {
    targetValidation = filenameOrInput;
  }

  trackExportAttempt("png");
  try {
    if (!targetValidation) {
      throw new ExportBlockedError(
        "MISSING_INPUT",
        "Export blocked: validation result or input is required.",
      );
    }
    assertValidForExport(targetValidation);
  } catch (error) {
    const code: ExportErrorCode =
      error instanceof ExportBlockedError ? error.code : "UNKNOWN_EXPORT_ERROR";
    trackExportFailed("png", code);
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
          reject(
            new ExportBlockedError(
              "CANVAS_CONTEXT_FAILED",
              "Could not create a 2D canvas context",
            ),
          );
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((png) => {
          URL.revokeObjectURL(url);
          if (!png) {
            reject(new ExportBlockedError("BLOB_FAILED", "PNG export failed"));
            return;
          }
          triggerDownload(png, filename);
          resolve();
        }, "image/png");
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new ExportBlockedError("RASTERIZE_FAILED", "Could not rasterise the SVG"));
      };
      image.src = url;
    });
    trackExportGenerated("png");
  } catch (error) {
    const code: ExportErrorCode =
      error instanceof ExportBlockedError ? error.code : "UNKNOWN_EXPORT_ERROR";
    trackExportFailed("png", code);
    throw error;
  }
}
