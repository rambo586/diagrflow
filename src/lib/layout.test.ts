import { describe, expect, it } from "vitest";
import { derivePrisma, emptyPrismaInput, OFFICIAL_LABELS } from "./prisma";
import { samplePrismaInput } from "./sample";
import {
  boxById,
  boxesOverlap,
  layoutPrismaDiagram,
  officialBoxesPresent,
  verticalOrderOk,
} from "./layout";

describe("PRISMA 2020 layout data", () => {
  const layout = layoutPrismaDiagram(
    samplePrismaInput(),
    derivePrisma(samplePrismaInput()),
  );

  it("includes every official v1 box", () => {
    expect(officialBoxesPresent(layout)).toBe(true);
  });

  it("places identification above screening above eligibility above included", () => {
    expect(verticalOrderOk(layout)).toBe(true);
    const assessed = boxById(layout, "reportsAssessed");
    const included = boxById(layout, "studiesIncluded");
    expect(assessed.title).toBe(OFFICIAL_LABELS.reportsAssessed);
    expect(included.y).toBeGreaterThan(assessed.y + assessed.height);
  });

  it("puts exit boxes to the right of the main flow", () => {
    const identified = boxById(layout, "recordsIdentified");
    const removed = boxById(layout, "recordsRemoved");
    const assessed = boxById(layout, "reportsAssessed");
    const excluded = boxById(layout, "reportsExcluded");
    expect(removed.x).toBeGreaterThan(identified.x + identified.width);
    expect(excluded.x).toBeGreaterThan(assessed.x + assessed.width);
  });

  it("does not overlap official boxes", () => {
    for (let i = 0; i < layout.boxes.length; i += 1) {
      for (let j = i + 1; j < layout.boxes.length; j += 1) {
        expect(boxesOverlap(layout.boxes[i], layout.boxes[j])).toBe(false);
      }
    }
  });

  it("grows the eligibility exclusion box when reasons are added", () => {
    const short = emptyPrismaInput();
    short.exclusionReasons = [{ id: "a", reason: "Wrong population", n: 1 }];
    const tall = emptyPrismaInput();
    tall.exclusionReasons = [
      { id: "a", reason: "Wrong population", n: 1 },
      { id: "b", reason: "Wrong intervention", n: 2 },
      { id: "c", reason: "Wrong setting", n: 3 },
      { id: "d", reason: "No usable outcomes", n: 4 },
      { id: "e", reason: "Duplicate publication", n: 1 },
    ];
    const shortLayout = layoutPrismaDiagram(short, derivePrisma(short));
    const tallLayout = layoutPrismaDiagram(tall, derivePrisma(tall));
    const shortBox = boxById(shortLayout, "reportsExcluded");
    const tallBox = boxById(tallLayout, "reportsExcluded");
    expect(tallBox.height).toBeGreaterThan(shortBox.height);
    expect(boxById(tallLayout, "studiesIncluded").y).toBeGreaterThan(
      boxById(shortLayout, "studiesIncluded").y,
    );
  });

  it("renders sample counts into the box lines", () => {
    const identified = boxById(layout, "recordsIdentified");
    const screened = boxById(layout, "recordsScreened");
    const included = boxById(layout, "studiesIncluded");
    expect(identified.lines.some((line) => line.includes("1842"))).toBe(true);
    expect(screened.lines.some((line) => line.includes("1278"))).toBe(true);
    expect(included.lines.some((line) => line.includes("52"))).toBe(true);
    expect(included.lines.some((line) => line.includes("61"))).toBe(true);
  });

  it("keeps phase bands stacked without overlap", () => {
    const [identification, screening, included] = layout.phases;
    expect(identification.label).toBe("Identification");
    expect(screening.label).toBe("Screening");
    expect(included.label).toBe("Included");
    expect(identification.y + identification.height).toBeLessThanOrEqual(screening.y);
    expect(screening.y + screening.height).toBeLessThanOrEqual(included.y);
  });

  it("expands canvas width when the other-methods column is on", () => {
    const baseInput = emptyPrismaInput();
    const otherInput = emptyPrismaInput();
    otherInput.includeOtherMethods = true;
    const base = layoutPrismaDiagram(baseInput, derivePrisma(baseInput));
    const other = layoutPrismaDiagram(otherInput, derivePrisma(otherInput));
    expect(other.width).toBeGreaterThan(base.width);
    expect(other.boxes.some((box) => box.id === "otherIdentified")).toBe(true);
    expect(other.otherHeader).toBe(OFFICIAL_LABELS.headerOther);
  });
});
