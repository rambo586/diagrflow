import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PrismaDiagram } from "../components/PrismaDiagram";
import { PrismaForm } from "../components/PrismaForm";
import {
  trackManualEdit,
  trackOpen,
  trackSampleLoaded,
  trackValidationError,
} from "../lib/analytics";
import { caseFromSearch, DIAGRAM_CASES } from "../lib/cases";
import { downloadPng, downloadSvg } from "../lib/exportDiagram";
import { layoutPrismaDiagram } from "../lib/layout";
import {
  balanceChecks,
  derivePrisma,
  emptyPrismaInput,
  type PrismaInput,
  validatePrisma,
} from "../lib/prisma";
import { EDITOR_META } from "../seo";

export function EditorPage() {
  const [params, setParams] = useSearchParams();
  const initial = caseFromSearch(params);
  const [input, setInput] = useState(() => initial?.input() ?? emptyPrismaInput());
  const [activeCaseId, setActiveCaseId] = useState(initial?.id ?? "");
  const [exportError, setExportError] = useState("");
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    document.title = EDITOR_META.title;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", EDITOR_META.canonical);
    trackOpen("/editor");
    if (initial) {
      trackSampleLoaded(initial.id, "/editor");
    }
  }, []);

  const derived = useMemo(() => derivePrisma(input), [input]);
  const layout = useMemo(() => layoutPrismaDiagram(input, derived), [input, derived]);
  const balances = useMemo(() => balanceChecks(input, derived), [input, derived]);
  const validation = useMemo(() => validatePrisma(input, derived), [input, derived]);
  const notice = DIAGRAM_CASES.find((item) => item.id === activeCaseId)?.notice;

  const handleInputChange = (next: PrismaInput) => {
    setInput(next);
    setExportError("");
    trackManualEdit("/editor");
    const nextValidation = validatePrisma(next);
    if (!nextValidation.canExport) {
      trackValidationError(
        nextValidation.hardErrors.length,
        nextValidation.confirmations.length,
        "/editor",
      );
    }
  };

  const loadCase = (id: string) => {
    const next = DIAGRAM_CASES.find((item) => item.id === id);
    if (!next) return;
    setInput(next.input());
    setActiveCaseId(id);
    setExportError("");
    trackSampleLoaded(id, "/editor");
    setParams({ case: id }, { replace: true });
  };

  const reset = () => {
    setInput(emptyPrismaInput());
    setActiveCaseId("");
    setExportError("");
    setParams({}, { replace: true });
  };

  const onExportSvg = () => {
    if (!svgRef.current) return;
    setExportError("");
    try {
      downloadSvg(svgRef.current, "prisma-2020-flow-diagram.svg", validation);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "SVG export blocked");
    }
  };

  const onExportPng = async () => {
    if (!svgRef.current) return;
    setExportError("");
    try {
      await downloadPng(svgRef.current, "prisma-2020-flow-diagram.png", 3, validation);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "PNG export failed");
    }
  };

  return (
    <main className="editor-page">
      <div className="diagram-toolbar">
        <div>
          <h1>PRISMA 2020 editor</h1>
          <p className="export-note">
            Working exports have no watermark. Authors may use the downloaded SVG or
            PNG in journal submissions. Cite Page et al., BMJ 2021;372:n71.
          </p>
          {notice ? <p className="notice">{notice}</p> : null}
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn btn-ghost"
            aria-disabled={!validation.canExport}
            onClick={onExportSvg}
          >
            Download SVG
          </button>
          <button
            type="button"
            className="btn btn-primary"
            aria-disabled={!validation.canExport}
            onClick={onExportPng}
          >
            Download PNG
          </button>
        </div>
      </div>
      {exportError ? (
        <p className="notice error-banner" role="alert">
          {exportError}
        </p>
      ) : null}
      {!validation.canExport ? (
        <div className="validation-summary" role="status" aria-live="polite">
          {validation.hardErrors.length > 0 ? (
            <p className="validation-summary-error">
              <strong>Export blocked ({validation.hardErrors.length} error{validation.hardErrors.length === 1 ? "" : "s"}):</strong>{" "}
              {validation.hardErrors[0].message}
            </p>
          ) : null}
          {validation.confirmations.length > 0 ? (
            <p className="validation-summary-confirm">
              <strong>Confirmation required:</strong>{" "}
              {validation.confirmations[0].message}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="editor-grid">
        <PrismaForm
          input={input}
          derived={derived}
          balances={balances}
          validation={validation}
          activeCaseId={activeCaseId}
          onChange={handleInputChange}
          onLoadCase={loadCase}
          onReset={reset}
        />
        <div className="diagram-wrap">
          <PrismaDiagram ref={svgRef} layout={layout} />
        </div>
      </div>
    </main>
  );
}
