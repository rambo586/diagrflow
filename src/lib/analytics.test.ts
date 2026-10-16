import { beforeEach, describe, expect, it } from "vitest";
import {
  getRecordedFunnelEvents,
  resetAnalyticsForTesting,
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
    trackExportFailed("svg", "Export blocked", "/editor");
    trackExportAttempt("svg", "/editor");
    trackExportGenerated("svg", "/editor");

    const summary = summarizeSessionFunnel();
    expect(summary.isInternal).toBe(true);
    expect(summary.hadValidationError).toBe(true);
    expect(summary.failedExport).toBe(true);
    expect(summary.generatedExport).toBe(true);
    expect(summary.qualifiesAsValidExportSession).toBe(false);
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
        trackExportFailed(sc.format, "Export blocked: validation error", "/editor");
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
