import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PrismaDiagram } from "../components/PrismaDiagram";
import { PrismaForm } from "../components/PrismaForm";
import { downloadPng, downloadSvg } from "../lib/exportDiagram";
import { layoutPrismaDiagram } from "../lib/layout";
import { balanceChecks, derivePrisma, emptyPrismaInput } from "../lib/prisma";
import { SAMPLE_TITLE, samplePrismaInput } from "../lib/sample";

export function EditorPage() {
  const [params] = useSearchParams();
  const startWithSample = params.get("sample") === "1";
  const [input, setInput] = useState(() =>
    startWithSample ? samplePrismaInput() : emptyPrismaInput(),
  );
  const [sampleNote, setSampleNote] = useState(startWithSample ? SAMPLE_TITLE : "");
  const [exportError, setExportError] = useState("");
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    document.title = "PRISMA 2020 editor — Diagrflow";
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", "https://diagrflow.com/editor");
  }, []);

  const derived = useMemo(() => derivePrisma(input), [input]);
  const layout = useMemo(() => layoutPrismaDiagram(input, derived), [input, derived]);
  const balances = useMemo(() => balanceChecks(input, derived), [input, derived]);

  const loadSample = () => {
    setInput(samplePrismaInput());
    setSampleNote(SAMPLE_TITLE);
    setExportError("");
  };

  const reset = () => {
    setInput(emptyPrismaInput());
    setSampleNote("");
    setExportError("");
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
          <p className="kicker">Editor</p>
          <h1>PRISMA 2020 flow diagram</h1>
          <p className="export-note">
            Working exports have no watermark. Authors may use the downloaded SVG or PNG
            in journal submissions. Cite Page et al., BMJ 2021;372:n71. Diagrflow is not
            affiliated with prisma-statement.org.
          </p>
          {sampleNote ? <p className="notice">{sampleNote}</p> : null}
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
          onChange={setInput}
          onLoadSample={loadSample}
          onReset={reset}
        />
        <div className="diagram-wrap">
          <PrismaDiagram ref={svgRef} layout={layout} />
        </div>
      </div>
    </main>
  );
}
