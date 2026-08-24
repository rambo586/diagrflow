import {
  OFFICIAL_BOX_IDS,
  OFFICIAL_LABELS,
  type OfficialBoxId,
  type PrismaDerived,
  type PrismaInput,
} from "./prisma";

export type Rect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  lines: string[];
  role: "flow" | "exit" | "included";
};

export type Connector = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  kind: "down" | "right";
};

export type PhaseBand = {
  id: "identification" | "screening" | "included";
  label: string;
  y: number;
  height: number;
};

export type DiagramLayout = {
  width: number;
  height: number;
  header: string;
  otherHeader: string | null;
  boxes: Rect[];
  connectors: Connector[];
  phases: PhaseBand[];
  footnotes: string[];
  citationLines: string[];
};

const BOX_W = 268;
const BOX_GAP_X = 72;
const ROW_GAP = 36;
const TOP = 56;
const LEFT = 72;
const LINE_H = 16;
const PAD_Y = 12;
const MIN_BOX_H = 56;

function boxHeight(lineCount: number): number {
  return Math.max(MIN_BOX_H, PAD_Y * 2 + 18 + lineCount * LINE_H);
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function wrapBox(
  id: string,
  x: number,
  y: number,
  title: string,
  lines: string[],
  role: Rect["role"],
  width = BOX_W,
): Rect {
  return {
    id,
    x,
    y,
    width,
    height: boxHeight(lines.length),
    title,
    lines,
    role,
  };
}

function nLine(label: string, n: number): string {
  return `${label} (n = ${n})`;
}

function midX(box: Rect): number {
  return box.x + box.width / 2;
}

function right(box: Rect): number {
  return box.x + box.width;
}

function bottom(box: Rect): number {
  return box.y + box.height;
}

export function layoutPrismaDiagram(
  input: PrismaInput,
  derived: PrismaDerived,
): DiagramLayout {
  const leftX = LEFT;
  const rightX = LEFT + BOX_W + BOX_GAP_X;
  const includeOther = input.includeOtherMethods;
  const otherX = rightX + BOX_W + BOX_GAP_X;

  const identifiedLines = [
    nLine(OFFICIAL_LABELS.databases, input.databases),
    nLine(OFFICIAL_LABELS.registers, input.registers),
  ];
  if (input.showDatabaseLines) {
    for (const line of input.databaseLines) {
      if (line.name.trim()) {
        identifiedLines.push(`  ${line.name} (n = ${line.n})`);
      }
    }
  }

  const removedLines = [
    nLine(OFFICIAL_LABELS.duplicateRecordsRemoved, input.duplicatesRemoved),
  ];
  if (input.showAutomation) {
    removedLines.push(
      nLine(OFFICIAL_LABELS.automationIneligible, input.automationIneligible),
    );
  }
  if (input.showOtherRemoved) {
    removedLines.push(nLine(OFFICIAL_LABELS.otherRemoved, input.otherRemoved));
  }

  const excludedRecordLines = input.showRecordsExcludedBreakdown
    ? [
        nLine("Total", input.recordsExcluded),
        nLine("By a human", input.recordsExcludedByHuman),
        nLine("By automation tools", input.recordsExcludedByAutomation),
      ]
    : [`(n = ${input.recordsExcluded})`];

  const reportExcludedLines = input.exclusionReasons.map((row) =>
    nLine(row.reason.trim() || "Reason", row.n),
  );

  const identified = wrapBox(
    "recordsIdentified",
    leftX,
    TOP,
    OFFICIAL_LABELS.recordsIdentifiedFrom,
    identifiedLines,
    "flow",
  );
  const removed = wrapBox(
    "recordsRemoved",
    rightX,
    TOP,
    OFFICIAL_LABELS.recordsRemovedBeforeScreening,
    removedLines,
    "exit",
  );

  const identBottom = Math.max(bottom(identified), bottom(removed));
  const screenY = identBottom + ROW_GAP;

  const screened = wrapBox(
    "recordsScreened",
    leftX,
    screenY,
    OFFICIAL_LABELS.recordsScreened,
    [`(n = ${derived.recordsScreened})`],
    "flow",
  );
  const recordsExcluded = wrapBox(
    "recordsExcluded",
    rightX,
    screenY,
    OFFICIAL_LABELS.recordsExcluded,
    excludedRecordLines,
    "exit",
  );

  const screenBottom = Math.max(bottom(screened), bottom(recordsExcluded));
  const soughtY = screenBottom + ROW_GAP;

  const sought = wrapBox(
    "reportsSought",
    leftX,
    soughtY,
    OFFICIAL_LABELS.reportsSought,
    [`(n = ${derived.reportsSought})`],
    "flow",
  );
  const notRetrieved = wrapBox(
    "reportsNotRetrieved",
    rightX,
    soughtY,
    OFFICIAL_LABELS.reportsNotRetrieved,
    [`(n = ${input.reportsNotRetrieved})`],
    "exit",
  );

  const soughtBottom = Math.max(bottom(sought), bottom(notRetrieved));
  const assessedY = soughtBottom + ROW_GAP;

  const assessed = wrapBox(
    "reportsAssessed",
    leftX,
    assessedY,
    OFFICIAL_LABELS.reportsAssessed,
    [`(n = ${derived.reportsAssessed})`],
    "flow",
  );
  const reportsExcluded = wrapBox(
    "reportsExcluded",
    rightX,
    assessedY,
    OFFICIAL_LABELS.reportsExcluded,
    reportExcludedLines.length > 0
      ? reportExcludedLines
      : ["(no reasons listed)"],
    "exit",
  );

  const eligibilityBottom = Math.max(bottom(assessed), bottom(reportsExcluded));
  const includedY = eligibilityBottom + ROW_GAP;

  const included = wrapBox(
    "studiesIncluded",
    leftX,
    includedY,
    OFFICIAL_LABELS.studiesIncluded,
    [
      `(n = ${derived.studiesIncluded})`,
      nLine(OFFICIAL_LABELS.reportsOfIncluded, derived.reportsOfIncludedStudies),
    ],
    "included",
    BOX_W,
  );

  const boxes: Rect[] = [
    identified,
    removed,
    screened,
    recordsExcluded,
    sought,
    notRetrieved,
    assessed,
    reportsExcluded,
    included,
  ];

  if (includeOther) {
    const otherIdentifiedLines = [
      nLine(OFFICIAL_LABELS.otherWebsites, input.otherWebsites),
      nLine(OFFICIAL_LABELS.otherOrganisations, input.otherOrganisations),
      nLine(OFFICIAL_LABELS.otherCitationSearching, input.otherCitationSearching),
    ];
    const otherIdentified = wrapBox(
      "otherIdentified",
      otherX,
      TOP,
      OFFICIAL_LABELS.recordsIdentifiedFrom,
      otherIdentifiedLines,
      "flow",
    );
    const otherSought = wrapBox(
      "otherReportsSought",
      otherX,
      soughtY,
      OFFICIAL_LABELS.reportsSought,
      [`(n = ${derived.otherReportsSought})`],
      "flow",
    );
    const otherNotRetrieved = wrapBox(
      "otherReportsNotRetrieved",
      otherX + BOX_W + 24,
      soughtY,
      OFFICIAL_LABELS.reportsNotRetrieved,
      [`(n = ${input.otherReportsNotRetrieved})`],
      "exit",
      200,
    );
    const otherAssessed = wrapBox(
      "otherReportsAssessed",
      otherX,
      assessedY,
      OFFICIAL_LABELS.reportsAssessed,
      [`(n = ${derived.otherReportsAssessed})`],
      "flow",
    );
    const otherExcludedLines = input.otherExclusionReasons.map((row) =>
      nLine(row.reason.trim() || "Reason", row.n),
    );
    const otherExcluded = wrapBox(
      "otherReportsExcluded",
      otherX + BOX_W + 24,
      assessedY,
      OFFICIAL_LABELS.reportsExcluded,
      otherExcludedLines.length > 0 ? otherExcludedLines : ["(no reasons listed)"],
      "exit",
      200,
    );
    boxes.push(
      otherIdentified,
      otherSought,
      otherNotRetrieved,
      otherAssessed,
      otherExcluded,
    );
  }

  const sideY = (left: Rect, rightBox: Rect): number =>
    Math.min(left.y + 28, rightBox.y + rightBox.height - 10);

  const connectors: Connector[] = [
    {
      id: "id-to-removed",
      x1: right(identified),
      y1: sideY(identified, removed),
      x2: removed.x,
      y2: sideY(identified, removed),
      kind: "right",
    },
    {
      id: "id-to-screened",
      x1: midX(identified),
      y1: bottom(identified),
      x2: midX(screened),
      y2: screened.y,
      kind: "down",
    },
    {
      id: "screened-to-excluded",
      x1: right(screened),
      y1: sideY(screened, recordsExcluded),
      x2: recordsExcluded.x,
      y2: sideY(screened, recordsExcluded),
      kind: "right",
    },
    {
      id: "screened-to-sought",
      x1: midX(screened),
      y1: bottom(screened),
      x2: midX(sought),
      y2: sought.y,
      kind: "down",
    },
    {
      id: "sought-to-not-retrieved",
      x1: right(sought),
      y1: sideY(sought, notRetrieved),
      x2: notRetrieved.x,
      y2: sideY(sought, notRetrieved),
      kind: "right",
    },
    {
      id: "sought-to-assessed",
      x1: midX(sought),
      y1: bottom(sought),
      x2: midX(assessed),
      y2: assessed.y,
      kind: "down",
    },
    {
      id: "assessed-to-excluded",
      x1: right(assessed),
      y1: sideY(assessed, reportsExcluded),
      x2: reportsExcluded.x,
      y2: sideY(assessed, reportsExcluded),
      kind: "right",
    },
    {
      id: "assessed-to-included",
      x1: midX(assessed),
      y1: bottom(assessed),
      x2: midX(included),
      y2: included.y,
      kind: "down",
    },
  ];

  if (includeOther) {
    const otherIdentified = boxes.find((b) => b.id === "otherIdentified");
    const otherSought = boxes.find((b) => b.id === "otherReportsSought");
    const otherAssessed = boxes.find((b) => b.id === "otherReportsAssessed");
    if (otherIdentified && otherSought && otherAssessed) {
      connectors.push(
        {
          id: "other-id-to-sought",
          x1: midX(otherIdentified),
          y1: bottom(otherIdentified),
          x2: midX(otherSought),
          y2: otherSought.y,
          kind: "down",
        },
        {
          id: "other-sought-to-assessed",
          x1: midX(otherSought),
          y1: bottom(otherSought),
          x2: midX(otherAssessed),
          y2: otherAssessed.y,
          kind: "down",
        },
        {
          id: "other-assessed-to-included",
          x1: midX(otherAssessed),
          y1: bottom(otherAssessed),
          x2: midX(included) + included.width / 2,
          y2: included.y + included.height / 2,
          kind: "down",
        },
      );
    }
  }

  const maxRight = boxes.reduce((acc, box) => Math.max(acc, right(box)), 0);
  const maxBottom = boxes.reduce((acc, box) => Math.max(acc, bottom(box)), 0);

  const phases: PhaseBand[] = [
    {
      id: "identification",
      label: OFFICIAL_LABELS.identification,
      y: identified.y,
      height: identBottom - identified.y,
    },
    {
      id: "screening",
      label: OFFICIAL_LABELS.screening,
      y: screened.y,
      height: eligibilityBottom - screened.y,
    },
    {
      id: "included",
      label: OFFICIAL_LABELS.included,
      y: included.y,
      height: included.height,
    },
  ];

  const footnotes = [
    ...wrapText(OFFICIAL_LABELS.footnoteStar, 108),
    ...wrapText(OFFICIAL_LABELS.footnoteStarStar, 108),
  ];
  const citationLines = wrapText(OFFICIAL_LABELS.citation, 108);
  const footnoteBlock = 28 + (footnotes.length + citationLines.length) * 14;
  const width = Math.max(760, maxRight + 48);
  const height = maxBottom + footnoteBlock + 24;

  return {
    width,
    height,
    header: OFFICIAL_LABELS.headerDatabases,
    otherHeader: includeOther ? OFFICIAL_LABELS.headerOther : null,
    boxes,
    connectors,
    phases,
    footnotes,
    citationLines,
  };
}

export function boxById(layout: DiagramLayout, id: OfficialBoxId | string): Rect {
  const box = layout.boxes.find((item) => item.id === id);
  if (!box) {
    throw new Error(`Missing diagram box: ${id}`);
  }
  return box;
}

export function officialBoxesPresent(layout: DiagramLayout): boolean {
  return OFFICIAL_BOX_IDS.every((id) => layout.boxes.some((box) => box.id === id));
}

export function boxesOverlap(a: Rect, b: Rect, tolerance = 2): boolean {
  return !(
    a.x + a.width <= b.x + tolerance ||
    b.x + b.width <= a.x + tolerance ||
    a.y + a.height <= b.y + tolerance ||
    b.y + b.height <= a.y + tolerance
  );
}

export function verticalOrderOk(layout: DiagramLayout): boolean {
  const identified = boxById(layout, "recordsIdentified");
  const screened = boxById(layout, "recordsScreened");
  const sought = boxById(layout, "reportsSought");
  const assessed = boxById(layout, "reportsAssessed");
  const included = boxById(layout, "studiesIncluded");
  return (
    identified.y < screened.y &&
    screened.y < sought.y &&
    sought.y < assessed.y &&
    assessed.y < included.y
  );
}
