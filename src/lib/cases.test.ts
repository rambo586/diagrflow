import { describe, expect, it } from "vitest";
import { DIAGRAM_CASES } from "./cases";
import { allBalancesOk, balanceChecks, derivePrisma } from "./prisma";

describe("illustrative cases", () => {
  it("each case reconciles official PRISMA arithmetic", () => {
    for (const diagramCase of DIAGRAM_CASES) {
      const input = diagramCase.input();
      const derived = derivePrisma(input);
      expect(
        allBalancesOk(balanceChecks(input, derived)),
        diagramCase.id,
      ).toBe(true);
    }
  });

  it("covers distinct PRISMA 2020 topologies", () => {
    expect(DIAGRAM_CASES.map((item) => item.id)).toEqual([
      "t2d-exercise",
      "citation-search",
      "automation-screen",
      "rct-db-only",
    ]);
    expect(DIAGRAM_CASES[1].input().includeOtherMethods).toBe(true);
    expect(DIAGRAM_CASES[2].input().showAutomation).toBe(true);
    expect(DIAGRAM_CASES[3].input().registers).toBe(0);
  });
});
