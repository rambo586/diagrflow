// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  assertValidForExport,
  downloadPng,
  downloadSvg,
  ExportBlockedError,
  svgMarkup,
} from "./exportDiagram";
import { emptyPrismaInput, validatePrisma } from "./prisma";

describe("DG-02 & DG-04 export gates and error typing", () => {
  let mockSvg: SVGSVGElement;

  beforeEach(() => {
    mockSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    mockSvg.setAttribute("width", "760");
    mockSvg.setAttribute("height", "600");
  });

  afterEach(() => {
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  it("assertValidForExport throws ExportBlockedError with MISSING_INPUT when argument is omitted", () => {
    expect(() => {
      // @ts-expect-error test missing argument runtime protection
      assertValidForExport();
    }).toThrow(ExportBlockedError);

    try {
      // @ts-expect-error test missing argument runtime protection
      assertValidForExport();
    } catch (err) {
      expect(err).toBeInstanceOf(ExportBlockedError);
      expect((err as ExportBlockedError).code).toBe("MISSING_INPUT");
      expect((err as ExportBlockedError).message).toContain("validation result or input is required");
    }
  });

  it("downloadSvg strictly refuses export when validation is omitted", () => {
    expect(() => {
      // @ts-expect-error test missing validation runtime protection
      downloadSvg(mockSvg);
    }).toThrow(ExportBlockedError);

    try {
      // @ts-expect-error test missing validation runtime protection
      downloadSvg(mockSvg);
    } catch (err) {
      expect((err as ExportBlockedError).code).toBe("MISSING_INPUT");
    }
  });

  it("downloadPng strictly refuses export when validation is omitted", async () => {
    await expect(
      // @ts-expect-error test missing validation runtime protection
      downloadPng(mockSvg),
    ).rejects.toThrow(ExportBlockedError);

    try {
      // @ts-expect-error test missing validation runtime protection
      await downloadPng(mockSvg);
    } catch (err) {
      expect((err as ExportBlockedError).code).toBe("MISSING_INPUT");
    }
  });

  it("assertValidForExport throws ExportBlockedError with VALIDATION_FAILED when canExport is false", () => {
    const invalidInput = emptyPrismaInput();
    invalidInput.databases = 10;
    invalidInput.duplicatesRemoved = 20; // 10 - 20 = -10 (invalid)

    const validation = validatePrisma(invalidInput);
    expect(validation.canExport).toBe(false);

    try {
      assertValidForExport(validation);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ExportBlockedError);
      expect((err as ExportBlockedError).code).toBe("VALIDATION_FAILED");
      expect((err as ExportBlockedError).message).toContain("Records removed before screening");
    }
  });

  it("downloadSvg executes clean download flow when valid and is resilient to analytics errors", () => {
    const validInput = emptyPrismaInput();
    validInput.databases = 100;
    validInput.duplicatesRemoved = 10;
    validInput.recordsExcluded = 20;
    validInput.reportsNotRetrieved = 5;
    validInput.exclusionReasons = [{ id: "ex-1", reason: "Reason A", n: 15 }];
    validInput.studiesIncludedOverride = 50;

    const validation = validatePrisma(validInput);
    expect(validation.canExport).toBe(true);

    // Mock window.gtag throwing
    (window as unknown as { gtag: unknown }).gtag = vi.fn().mockImplementation(() => {
      throw new Error("gtag failure");
    });

    // Mock URL.createObjectURL and URL.revokeObjectURL
    const origCreate = URL.createObjectURL;
    const origRevoke = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
    URL.revokeObjectURL = vi.fn();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    expect(() => {
      downloadSvg(mockSvg, "test-diagram.svg", validation);
    }).not.toThrow();

    expect(URL.createObjectURL).toHaveBeenCalled();
    clickSpy.mockRestore();
    URL.createObjectURL = origCreate;
    URL.revokeObjectURL = origRevoke;
  });

  it("svgMarkup generates valid XML with required namespaces", () => {
    const xml = svgMarkup(mockSvg);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(xml).toContain('xmlns:xlink="http://www.w3.org/1999/xlink"');
  });
});
