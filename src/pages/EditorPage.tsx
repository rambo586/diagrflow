import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PrismaDiagram } from "../components/PrismaDiagram";
import { PrismaForm } from "../components/PrismaForm";
import { caseFromSearch, DIAGRAM_CASES } from "../lib/cases";
import { downloadPng, downloadSvg } from "../lib/exportDiagram";
import { layoutPrismaDiagram } from "../lib/layout";
import { balanceChecks, derivePrisma, emptyPrismaInput } from "../lib/prisma";
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
  }, []);

  const derived = useMemo(() => derivePrisma(input), [input]);
  const layout = useMemo(() => layoutPrismaDiagram(input, derived), [input, derived]);
  const balances = useMemo(() => balanceChecks(input, derived), [input, derived]);
  const notice = DIAGRAM_CASES.find((item) => item.id === activeCaseId)?.notice;

  const loadCase = (id: string) => {
    const next = DIAGRAM_CASES.find((item) => item.id === id);
    if (!next) return;
    setInput(next.input());
    setActiveCaseId(id);
    setExportError("");
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
    downloadSvg(svgRef.current);
  };

  const onExportPng = async () => {
    if (!svgRef.current) return;
    setExportError("");
    try {
      await downloadPng(svgRef.current);
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
          <button type="button" className="btn btn-ghost" onClick={onExportSvg}>
            Download SVG
          </button>
          <button type="button" className="btn btn-primary" onClick={onExportPng}>
            Download PNG
          </button>
        </div>
      </div>
      {exportError ? <p className="notice">{exportError}</p> : null}
      <div className="editor-grid">
        <PrismaForm
          input={input}
          derived={derived}
          balances={balances}
          activeCaseId={activeCaseId}
          onChange={setInput}
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
