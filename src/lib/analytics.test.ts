// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getRecordedFunnelEvents,
  resetAnalyticsForTesting,
  sanitizeExportErrorCode,
  setInternalSessionFlag,
  summarizeSessionFunnel,
  trackExportAttempt,
  trackExportFailed,
  trackExportGenerated,
  trackManualEdit,
  trackOpen,
  trackSampleLoaded,
  trackValidationError,
} from "./analytics";

describe("DG-04 minimal product funnel analytics", () => {
  beforeEach(() => {
    resetAnalyticsForTesting();
  });

  afterEach(() => {
    delete (window as unknown as { gtag?: unknown }).gtag;
    delete (window as unknown as { plausible?: unknown }).plausible;
  });

  it("deduplicates open and edit events per session and never stores user count contents", () => {
    trackOpen("/editor");
    trackOpen("/editor");
    trackManualEdit("/editor");
    trackManualEdit("/editor");

    const events = getRecordedFunnelEvents();
    expect(events.filter((e) => e.type === "open")).toHaveLength(1);
    expect(events.filter((e) => e.type === "edit")).toHaveLength(1);
    expect(JSON.stringify(events)).not.toContain("databases");
  });

  it("excludes unmodified sample exports from valid export sessions", () => {
    trackOpen("/editor");
    trackSampleLoaded("t2d-exercise", "/editor");
    trackExportAttempt("svg", "/editor");
    trackExportGenerated("svg", "/editor");

    const summary = summarizeSessionFunnel();
    expect(summary.loadedSample).toBe(true);
    expect(summary.isPureSample).toBe(true);
    expect(summary.qualifiesAsValidExportSession).toBe(false);
  });

  it("excludes export when user edits first, then loads a fresh sample and exports without modifying it (P1 bug fix)", () => {
    trackOpen("/editor");
    trackManualEdit("/editor"); // user edited earlier
    trackSampleLoaded("t2d-exercise", "/editor"); // user loaded a fresh sample
    trackExportAttempt("png", "/editor");
    trackExportGenerated("png", "/editor"); // exported unmodified sample

    const summary = summarizeSessionFunnel();
    expect(summary.hasManualEdit).toBe(true);
    expect(summary.loadedSample).toBe(true);
    expect(summary.isPureSample).toBe(true);
    expect(summary.generatedExport).toBe(false); // pure sample export must NOT count as generatedExport
    expect(summary.qualifiesAsValidExportSession).toBe(false);

    // If user subsequently edits that sample and exports again:
    trackManualEdit("/editor");
    trackExportAttempt("png", "/editor");
    trackExportGenerated("png", "/editor");

    const updatedSummary = summarizeSessionFunnel();
    expect(updatedSummary.isPureSample).toBe(false);
    expect(updatedSummary.generatedExport).toBe(true);
    expect(updatedSummary.qualifiesAsValidExportSession).toBe(true);
  });

  it("counts manually edited, validated export as a valid export session", () => {
    trackOpen("/editor");
    trackSampleLoaded("t2d-exercise", "/editor");
    trackManualEdit("/editor");
    trackExportAttempt("png", "/editor");
    trackExportGenerated("png", "/editor");

    const summary = summarizeSessionFunnel();
    expect(summary.hasManualEdit).toBe(true);
    expect(summary.isPureSample).toBe(false);
    expect(summary.generatedExport).toBe(true);
    expect(summary.qualifiesAsValidExportSession).toBe(true);
  });

  it("excludes internal test sessions even when manually edited and exported", () => {
    setInternalSessionFlag(true);
    trackOpen("/editor");
    trackManualEdit("/editor");
    trackValidationError(1, 0, "/editor");
    trackExportAttempt("svg", "/editor");
    trackExportFailed("svg", "VALIDATION_FAILED", "/editor");
    trackExportAttempt("svg", "/editor");
    trackExportGenerated("svg", "/editor");

    const summary = summarizeSessionFunnel();
    expect(summary.isInternal).toBe(true);
    expect(summary.hadValidationError).toBe(true);
    expect(summary.failedExport).toBe(true);
    expect(summary.generatedExport).toBe(true);
    expect(summary.qualifiesAsValidExportSession).toBe(false);
  });

  it("guarantees zero user input data uploaded: sends only fixed error codes in telemetry props", () => {
    const gtagMock = vi.fn();
    (window as unknown as { gtag: typeof gtagMock }).gtag = gtagMock;

    trackOpen("/editor");
    trackExportFailed("svg", "VALIDATION_FAILED", "/editor");

    expect(gtagMock).toHaveBeenCalledTimes(2);
    const [, , failedProps] = gtagMock.mock.calls[1];
    expect(failedProps.reason).toBe("VALIDATION_FAILED");
    expect(JSON.stringify(failedProps)).not.toContain("Records removed");
    expect(JSON.stringify(failedProps)).not.toContain("deduplication");
    expect(JSON.stringify(failedProps)).not.toContain("-10");
    expect(failedProps).not.toHaveProperty("databases");
    expect(failedProps).not.toHaveProperty("error_message");

    // Test that sanitizeExportErrorCode replaces arbitrary dynamic error messages with UNKNOWN_EXPORT_ERROR
    expect(
      sanitizeExportErrorCode(
        "Export blocked: database records (10) - deduplication removed (20) = -10",
      ),
    ).toBe("UNKNOWN_EXPORT_ERROR");
  });

  it("isolates external analytics errors: gtag or plausible exceptions never break application execution", () => {
    const errorGtag = vi.fn().mockImplementation(() => {
      throw new Error("gtag network down or blocked");
    });
    (window as unknown as { gtag: typeof errorGtag }).gtag = errorGtag;

    expect(() => {
      trackOpen("/editor");
      trackExportAttempt("svg", "/editor");
      trackExportGenerated("svg", "/editor");
    }).not.toThrow();

    const events = getRecordedFunnelEvents();
    expect(events.filter((e) => e.type === "generated")).toHaveLength(1);
  });

  it("DG-06: executes 5 internal end-to-end event loops that chain cleanly and are 100% excluded from business valid export count", () => {
    const scenarios = [
      { id: "loop-1-t2d-svg", format: "svg" as const, caseId: "t2d-exercise", triggerErrorFirst: false },
      { id: "loop-2-citation-png", format: "png" as const, caseId: "citation-search", triggerErrorFirst: true },
      { id: "loop-3-automation-svg", format: "svg" as const, caseId: "automation-screen", triggerErrorFirst: false },
      { id: "loop-4-rct-png", format: "png" as const, caseId: "rct-db-only", triggerErrorFirst: true },
      { id: "loop-5-blank-svg", format: "svg" as const, caseId: "", triggerErrorFirst: true },
    ];

    const summaries = scenarios.map((sc) => {
      resetAnalyticsForTesting();
      setInternalSessionFlag(true);
      trackOpen("/editor");
      if (sc.caseId) {
        trackSampleLoaded(sc.caseId, "/editor");
      }
      trackManualEdit("/editor");
      if (sc.triggerErrorFirst) {
        trackValidationError(1, 0, "/editor");
        trackExportAttempt(sc.format, "/editor");
        trackExportFailed(sc.format, "VALIDATION_FAILED", "/editor");
      }
      trackExportAttempt(sc.format, "/editor");
      trackExportGenerated(sc.format, "/editor");
      return {
        loopId: sc.id,
        events: getRecordedFunnelEvents(),
        summary: summarizeSessionFunnel(),
      };
    });

    expect(summaries).toHaveLength(5);
    for (const item of summaries) {
      expect(item.summary.isInternal).toBe(true);
      expect(item.summary.hasManualEdit).toBe(true);
      expect(item.summary.generatedExport).toBe(true);
      // Must be strictly excluded from business valid export sessions
      expect(item.summary.qualifiesAsValidExportSession).toBe(false);
      // Every event in the session must share the same sessionId and have isInternal=true
      const sessionIds = new Set(item.events.map((e) => e.sessionId));
      expect(sessionIds.size).toBe(1);
      expect(item.events.every((e) => e.isInternal)).toBe(true);
    }
  });
});
