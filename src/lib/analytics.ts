export type FunnelEventType =
  | "open"
  | "edit"
  | "sample"
  | "error"
  | "attempt"
  | "generated"
  | "failed";

export type FunnelEventRecord = {
  id: string;
  sessionId: string;
  timestamp: string;
  type: FunnelEventType;
  route: string;
  isInternal: boolean;
  hasManualEdit: boolean;
  isPureSample: boolean;
  format?: "svg" | "png";
  caseId?: string;
  errorCount?: number;
  confirmationCount?: number;
  reason?: string;
};

export type SessionFunnelSummary = {
  sessionId: string;
  isInternal: boolean;
  hasManualEdit: boolean;
  loadedSample: boolean;
  isPureSample: boolean;
  hadValidationError: boolean;
  attemptedExport: boolean;
  generatedExport: boolean;
  failedExport: boolean;
  qualifiesAsValidExportSession: boolean;
};

const STORAGE_KEY_EVENTS = "diagrflow_funnel_events_v1";
const STORAGE_KEY_SESSION = "diagrflow_session_state_v1";
const STORAGE_KEY_INTERNAL = "diagrflow_internal_flag_v1";

type SessionState = {
  sessionId: string;
  isInternal: boolean;
  hasManualEdit: boolean;
  loadedSample: boolean;
  editedSinceSample: boolean;
  activeCaseId: string;
  dedupedTypes: Partial<Record<FunnelEventType, boolean>>;
};

let memoryState: SessionState | null = null;
let memoryEvents: FunnelEventRecord[] = [];

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function detectInternalFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("internal") === "1") {
      window.localStorage?.setItem(STORAGE_KEY_INTERNAL, "1");
      return true;
    }
    if (params.get("internal") === "0") {
      window.localStorage?.removeItem(STORAGE_KEY_INTERNAL);
      return false;
    }
    return window.localStorage?.getItem(STORAGE_KEY_INTERNAL) === "1";
  } catch {
    return false;
  }
}

function getSessionState(): SessionState {
  if (memoryState) {
    if (detectInternalFromUrl()) {
      memoryState.isInternal = true;
    }
    return memoryState;
  }

  if (canUseStorage()) {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY_SESSION);
      if (raw) {
        const parsed = JSON.parse(raw) as SessionState;
        if (detectInternalFromUrl()) {
          parsed.isInternal = true;
        }
        memoryState = parsed;
        return parsed;
      }
    } catch {
      // ignore corrupted session state
    }
  }

  const initial: SessionState = {
    sessionId: generateId("sess"),
    isInternal: detectInternalFromUrl(),
    hasManualEdit: false,
    loadedSample: false,
    editedSinceSample: false,
    activeCaseId: "",
    dedupedTypes: {},
  };
  saveSessionState(initial);
  return initial;
}

function saveSessionState(state: SessionState): void {
  memoryState = state;
  if (canUseStorage()) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
  }
}

export function getRecordedFunnelEvents(): FunnelEventRecord[] {
  if (canUseStorage()) {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY_EVENTS);
      if (raw) {
        memoryEvents = JSON.parse(raw) as FunnelEventRecord[];
      }
    } catch {
      // ignore
    }
  }
  return [...memoryEvents];
}

function appendFunnelEvent(record: FunnelEventRecord): void {
  const next = [...getRecordedFunnelEvents(), record];
  memoryEvents = next;
  if (canUseStorage()) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  if (typeof window !== "undefined") {
    const win = window as Window & {
      __DIAGRFLOW_EVENTS__?: FunnelEventRecord[];
      gtag?: (...args: unknown[]) => void;
      plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
    };
    win.__DIAGRFLOW_EVENTS__ = next;

    // Dispatch to configured external analytics provider if present, strictly without user input numbers
    const safeProps = {
      session_id: record.sessionId,
      route: record.route,
      is_internal: record.isInternal,
      has_manual_edit: record.hasManualEdit,
      is_pure_sample: record.isPureSample,
      format: record.format,
      case_id: record.caseId,
      error_count: record.errorCount,
      confirmation_count: record.confirmationCount,
      reason: record.reason,
    };

    if (typeof win.gtag === "function") {
      win.gtag("event", `diagrflow_${record.type}`, safeProps);
    }
    if (typeof win.plausible === "function") {
      win.plausible(`diagrflow_${record.type}`, { props: safeProps });
    }
  }
}

export function setInternalSessionFlag(isInternal: boolean): void {
  const state = getSessionState();
  state.isInternal = isInternal;
  saveSessionState(state);
  if (typeof window !== "undefined") {
    try {
      if (isInternal) {
        window.localStorage?.setItem(STORAGE_KEY_INTERNAL, "1");
      } else {
        window.localStorage?.removeItem(STORAGE_KEY_INTERNAL);
      }
    } catch {
      // ignore
    }
  }
}

export function resetAnalyticsForTesting(): void {
  memoryState = null;
  memoryEvents = [];
  if (canUseStorage()) {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY_EVENTS);
      window.sessionStorage.removeItem(STORAGE_KEY_SESSION);
      window.localStorage?.removeItem(STORAGE_KEY_INTERNAL);
    } catch {
      // ignore
    }
  }
}

function currentRoute(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname || "/";
}

export function trackOpen(route = currentRoute()): void {
  const state = getSessionState();
  if (state.dedupedTypes.open) return;
  state.dedupedTypes.open = true;
  saveSessionState(state);

  appendFunnelEvent({
    id: generateId("evt"),
    sessionId: state.sessionId,
    timestamp: new Date().toISOString(),
    type: "open",
    route,
    isInternal: state.isInternal,
    hasManualEdit: state.hasManualEdit,
    isPureSample: state.loadedSample && !state.editedSinceSample,
  });
}

export function trackSampleLoaded(caseId: string, route = currentRoute()): void {
  const state = getSessionState();
  state.loadedSample = true;
  state.editedSinceSample = false;
  state.activeCaseId = caseId;
  saveSessionState(state);

  appendFunnelEvent({
    id: generateId("evt"),
    sessionId: state.sessionId,
    timestamp: new Date().toISOString(),
    type: "sample",
    route,
    isInternal: state.isInternal,
    hasManualEdit: state.hasManualEdit,
    isPureSample: true,
    caseId,
  });
}

export function trackManualEdit(route = currentRoute()): void {
  const state = getSessionState();
  const isFirstEdit = !state.hasManualEdit;
  state.hasManualEdit = true;
  if (state.loadedSample) {
    state.editedSinceSample = true;
  }
  saveSessionState(state);

  if (!isFirstEdit && state.dedupedTypes.edit) return;
  state.dedupedTypes.edit = true;
  saveSessionState(state);

  appendFunnelEvent({
    id: generateId("evt"),
    sessionId: state.sessionId,
    timestamp: new Date().toISOString(),
    type: "edit",
    route,
    isInternal: state.isInternal,
    hasManualEdit: true,
    isPureSample: false,
    caseId: state.activeCaseId || undefined,
  });
}

export function trackValidationError(
  errorCount: number,
  confirmationCount: number,
  route = currentRoute(),
): void {
  if (errorCount + confirmationCount <= 0) return;
  const state = getSessionState();
  appendFunnelEvent({
    id: generateId("evt"),
    sessionId: state.sessionId,
    timestamp: new Date().toISOString(),
    type: "error",
    route,
    isInternal: state.isInternal,
    hasManualEdit: state.hasManualEdit,
    isPureSample: state.loadedSample && !state.editedSinceSample,
    errorCount,
    confirmationCount,
  });
}

export function trackExportAttempt(
  format: "svg" | "png",
  route = currentRoute(),
): void {
  const state = getSessionState();
  appendFunnelEvent({
    id: generateId("evt"),
    sessionId: state.sessionId,
    timestamp: new Date().toISOString(),
    type: "attempt",
    route,
    isInternal: state.isInternal,
    hasManualEdit: state.hasManualEdit,
    isPureSample: !state.hasManualEdit,
    format,
    caseId: state.activeCaseId || undefined,
  });
}

/**
 * Records that an export file was generated and download was triggered.
 * Note: Per DG-04 / DG-11, this strictly means "generated", never "saved" or "submitted".
 */
export function trackExportGenerated(
  format: "svg" | "png",
  route = currentRoute(),
): void {
  const state = getSessionState();
  appendFunnelEvent({
    id: generateId("evt"),
    sessionId: state.sessionId,
    timestamp: new Date().toISOString(),
    type: "generated",
    route,
    isInternal: state.isInternal,
    hasManualEdit: state.hasManualEdit,
    isPureSample: !state.hasManualEdit,
    format,
    caseId: state.activeCaseId || undefined,
  });
}

export function trackExportFailed(
  format: "svg" | "png",
  reason: string,
  route = currentRoute(),
): void {
  const state = getSessionState();
  appendFunnelEvent({
    id: generateId("evt"),
    sessionId: state.sessionId,
    timestamp: new Date().toISOString(),
    type: "failed",
    route,
    isInternal: state.isInternal,
    hasManualEdit: state.hasManualEdit,
    isPureSample: !state.hasManualEdit,
    format,
    caseId: state.activeCaseId || undefined,
    reason,
  });
}

export function summarizeSessionFunnel(
  events: FunnelEventRecord[] = getRecordedFunnelEvents(),
): SessionFunnelSummary {
  const state = getSessionState();
  const sessionEvents = events.filter((e) => e.sessionId === state.sessionId);
  const isInternal = state.isInternal || sessionEvents.some((e) => e.isInternal);
  const hasManualEdit =
    state.hasManualEdit || sessionEvents.some((e) => e.type === "edit" || e.hasManualEdit);
  const loadedSample =
    state.loadedSample || sessionEvents.some((e) => e.type === "sample");
  const isPureSample = !hasManualEdit;
  const hadValidationError = sessionEvents.some((e) => e.type === "error");
  const attemptedExport = sessionEvents.some((e) => e.type === "attempt");
  const generatedExport = sessionEvents.some(
    (e) => e.type === "generated" && e.hasManualEdit && !e.isPureSample,
  );
  const failedExport = sessionEvents.some((e) => e.type === "failed");

  return {
    sessionId: state.sessionId,
    isInternal,
    hasManualEdit,
    loadedSample,
    isPureSample,
    hadValidationError,
    attemptedExport,
    generatedExport,
    failedExport,
    qualifiesAsValidExportSession: !isInternal && hasManualEdit && generatedExport,
  };
}
