import { useMemo } from "react";
import type { DiagramCase } from "../lib/cases";
import { derivePrisma } from "../lib/prisma";
import { layoutPrismaDiagram } from "../lib/layout";
import { PrismaDiagram } from "./PrismaDiagram";

type Props = {
  diagramCase: DiagramCase;
};

export function LiveFigure({ diagramCase }: Props) {
  const input = useMemo(() => diagramCase.input(), [diagramCase]);
  const derived = useMemo(() => derivePrisma(input), [input]);
  const layout = useMemo(() => layoutPrismaDiagram(input, derived), [input, derived]);

  return (
    <figure className="figure-plate">
      <div
        className="figure-scroll"
        style={{ aspectRatio: `${layout.width} / ${layout.height}` }}
      >
        <PrismaDiagram layout={layout} fit />
      </div>
      <figcaption>
        <strong>{diagramCase.title}</strong>
        {diagramCase.notice} Identified{" "}
        <span className="n">n = {derived.identified}</span>
        {" · "}
        included studies <span className="n">n = {derived.studiesIncluded}</span>.
      </figcaption>
    </figure>
  );
}
