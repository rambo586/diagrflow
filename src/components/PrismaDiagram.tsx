import { forwardRef } from "react";
import type { DiagramLayout } from "../lib/layout";

type Props = {
  layout: DiagramLayout;
};

function arrowHead(kind: "down" | "right"): string {
  return kind === "down" ? "url(#arrow-down)" : "url(#arrow-right)";
}

export const PrismaDiagram = forwardRef<SVGSVGElement, Props>(function PrismaDiagram(
  { layout },
  ref,
) {
  return (
    <svg
      ref={ref}
      role="img"
      aria-label="PRISMA 2020 flow diagram"
      width={layout.width}
      height={layout.height}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker
          id="arrow-down"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="7"
          orient="auto"
        >
          <path d="M0 0 L4 7 L8 0" fill="none" stroke="#111" strokeWidth="1.2" />
        </marker>
        <marker
          id="arrow-right"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <path d="M0 0 L7 4 L0 8" fill="none" stroke="#111" strokeWidth="1.2" />
        </marker>
      </defs>
      <rect width={layout.width} height={layout.height} fill="#ffffff" />
      <text
        x={layout.width / 2}
        y={28}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="14"
        fontWeight="700"
        fill="#111"
      >
        {layout.header}
      </text>
      {layout.otherHeader ? (
        <text
          x={layout.boxes.find((box) => box.id === "otherIdentified")?.x ?? 0}
          y={28}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="12"
          fontWeight="700"
          fill="#111"
        >
          {layout.otherHeader}
        </text>
      ) : null}

      {layout.phases.map((phase) => (
        <g key={phase.id}>
          <text
            x={22}
            y={phase.y + phase.height / 2}
            textAnchor="middle"
            transform={`rotate(-90 22 ${phase.y + phase.height / 2})`}
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="13"
            fontWeight="700"
            fill="#111"
          >
            {phase.label}
          </text>
        </g>
      ))}

      {layout.connectors.map((line) => (
        <line
          key={line.id}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#111"
          strokeWidth="1.2"
          markerEnd={arrowHead(line.kind)}
        />
      ))}

      {layout.boxes.map((box) => (
        <g key={box.id}>
          <rect
            x={box.x}
            y={box.y}
            width={box.width}
            height={box.height}
            fill="#ffffff"
            stroke="#111"
            strokeWidth="1.2"
          />
          <text
            x={box.x + 10}
            y={box.y + 18}
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="12"
            fontWeight="700"
            fill="#111"
          >
            {box.title}
          </text>
          {box.lines.map((line, index) => (
            <text
              key={`${box.id}-${index}`}
              x={box.x + 10}
              y={box.y + 36 + index * 15}
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="12"
              fill="#111"
            >
              {line}
            </text>
          ))}
        </g>
      ))}

      {layout.footnotes.map((note, index) => (
        <text
          key={note}
          x={48}
          y={layout.height - 58 + index * 16}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="9"
          fill="#333"
        >
          {note}
        </text>
      ))}
      <text
        x={48}
        y={layout.height - 18}
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="9"
        fill="#333"
      >
        {layout.citation}
      </text>
    </svg>
  );
});
