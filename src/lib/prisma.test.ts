import { describe, expect, it } from "vitest";
import { DIAGRAM_CASES } from "./cases";
import { assertValidForExport } from "./exportDiagram";
import {
  allBalancesOk,
  balanceChecks,
  derivePrisma,
  emptyPrismaInput,
  OFFICIAL_BOX_IDS,
  OFFICIAL_LABELS,
  sumReasons,
  validatePrisma,
} from "./prisma";
import { samplePrismaInput } from "./sample";

describe("official PRISMA 2020 labels", () => {
  it("uses the official three phase names", () => {
    expect(OFFICIAL_LABELS.identification).toBe("Identification");
    expect(OFFICIAL_LABELS.screening).toBe("Screening");
    expect(OFFICIAL_LABELS.included).toBe("Included");
  });

  it("keeps official box wording", () => {
    expect(OFFICIAL_LABELS.recordsIdentifiedFrom).toBe("Records identified from*:");
    expect(OFFICIAL_LABELS.recordsRemovedBeforeScreening).toBe(
      "Records removed before screening:",
    );
    expect(OFFICIAL_LABELS.recordsScreened).toBe("Records screened");
    expect(OFFICIAL_LABELS.recordsExcluded).toBe("Records excluded**");
    expect(OFFICIAL_LABELS.reportsSought).toBe("Reports sought for retrieval");
    expect(OFFICIAL_LABELS.reportsNotRetrieved).toBe("Reports not retrieved");
    expect(OFFICIAL_LABELS.reportsAssessed).toBe("Reports assessed for eligibility");
    expect(OFFICIAL_LABELS.reportsExcluded).toBe("Reports excluded:");
    expect(OFFICIAL_LABELS.studiesIncluded).toBe("Studies included in review");
    expect(OFFICIAL_LABELS.reportsOfIncluded).toBe("Reports of included studies");
  });

  it("lists the nine official v1 boxes", () => {
    expect(OFFICIAL_BOX_IDS).toEqual([
      "recordsIdentified",
      "recordsRemoved",
      "recordsScreened",
      "recordsExcluded",
      "reportsSought",
      "reportsNotRetrieved",
      "reportsAssessed",
      "reportsExcluded",
      "studiesIncluded",
    ]);
  });
});

describe("derivePrisma box counts", () => {
  it("computes identification → screening arithmetic", () => {
    const input = emptyPrismaInput();
    input.databases = 100;
    input.registers = 20;
    input.duplicatesRemoved = 30;
    const derived = derivePrisma(input);
    expect(derived.identified).toBe(120);
    expect(derived.removedBeforeScreening).toBe(30);
    expect(derived.recordsScreened).toBe(90);
  });

  it("ignores hidden grey-box lines in the removed total", () => {
    const input = emptyPrismaInput();
    input.databases = 80;
    input.duplicatesRemoved = 10;
    input.automationIneligible = 5;
    input.otherRemoved = 4;
    input.showAutomation = false;
    input.showOtherRemoved = false;
    expect(derivePrisma(input).removedBeforeScreening).toBe(10);

    input.showAutomation = true;
    input.showOtherRemoved = true;
    expect(derivePrisma(input).removedBeforeScreening).toBe(19);
  });

  it("computes screening and retrieval balances", () => {
    const input = emptyPrismaInput();
    input.databases = 200;
    input.duplicatesRemoved = 40;
    input.recordsExcluded = 110;
    input.reportsNotRetrieved = 6;
    const derived = derivePrisma(input);
    expect(derived.recordsScreened).toBe(160);
    expect(derived.reportsSought).toBe(50);
    expect(derived.reportsAssessed).toBe(44);
  });

  it("sums full-text exclusion reasons and remaining reports", () => {
    const input = emptyPrismaInput();
    input.databases = 50;
    input.recordsExcluded = 20;
    input.reportsNotRetrieved = 2;
    input.exclusionReasons = [
      { id: "a", reason: "Wrong population", n: 8 },
      { id: "b", reason: "Wrong intervention", n: 5 },
    ];
    const derived = derivePrisma(input);
    expect(sumReasons(input.exclusionReasons)).toBe(13);
    expect(derived.reportsExcluded).toBe(13);
    expect(derived.reportsAssessed).toBe(28);
    expect(derived.reportsIncludedFromDatabases).toBe(15);
    expect(derived.reportsOfIncludedStudies).toBe(15);
    expect(derived.studiesIncluded).toBe(15);
  });

  it("lets studies and reports of studies be overridden separately", () => {
    const input = emptyPrismaInput();
    input.databases = 20;
    input.studiesIncludedOverride = 4;
    input.reportsOfIncludedOverride = 7;
    const derived = derivePrisma(input);
    expect(derived.studiesIncluded).toBe(4);
    expect(derived.reportsOfIncludedStudies).toBe(7);
  });

  it("adds the other-methods column into included reports", () => {
    const input = emptyPrismaInput();
    input.databases = 10;
    input.includeOtherMethods = true;
    input.otherWebsites = 3;
    input.otherOrganisations = 1;
    input.otherCitationSearching = 2;
    input.otherReportsNotRetrieved = 1;
    input.otherExclusionReasons = [{ id: "o", reason: "Duplicate of database hit", n: 1 }];
    const derived = derivePrisma(input);
    expect(derived.otherIdentified).toBe(6);
    expect(derived.otherReportsSought).toBe(6);
    expect(derived.otherReportsAssessed).toBe(5);
    expect(derived.otherReportsIncluded).toBe(4);
    expect(derived.reportsIncludedFromDatabases).toBe(10);
    expect(derived.reportsOfIncludedStudies).toBe(14);
  });

  it("reconciles the sample diagram (t2d-exercise)", () => {
    const input = samplePrismaInput();
    const derived = derivePrisma(input);
    expect(derived.identified).toBe(1899);
    expect(derived.removedBeforeScreening).toBe(612);
    expect(derived.recordsScreened).toBe(1287);
    expect(derived.reportsSought).toBe(259);
    expect(derived.reportsAssessed).toBe(251);
    expect(derived.reportsExcluded).toBe(190);
    expect(derived.reportsIncludedFromDatabases).toBe(61);
    expect(derived.studiesIncluded).toBe(52);
    expect(derived.reportsOfIncludedStudies).toBe(61);
    expect(allBalancesOk(balanceChecks(input, derived))).toBe(true);
    expect(validatePrisma(input, derived).canExport).toBe(true);
  });
});

describe("DG-02 independent validation and counterexamples (10 independent scenarios)", () => {
  it("Scenario 1 (Valid one-to-many): studies < reports (52 studies, 61 reports) with reconciled flow", () => {
    const input = DIAGRAM_CASES[0].input();
    const derived = derivePrisma(input);
    const validation = validatePrisma(input, derived);
    expect(derived.reportsIncludedFromDatabases).toBe(61);
    expect(derived.reportsOfIncludedStudies).toBe(61);
    expect(derived.studiesIncluded).toBe(52);
    expect(validation.canExport).toBe(true);
    expect(validation.hardErrors).toHaveLength(0);
    expect(validation.confirmations).toHaveLength(0);
    expect(allBalancesOk(balanceChecks(input, derived))).toBe(true);
  });

  it("Scenario 2 (Excess deduction '10 minus 20'): databases=10, duplicatesRemoved=20 fails balance and blocks export", () => {
    const input = emptyPrismaInput();
    input.databases = 10;
    input.duplicatesRemoved = 20;
    const derived = derivePrisma(input);
    const checks = balanceChecks(input, derived);
    const validation = validatePrisma(input, derived);

    expect(derived.recordsScreened).toBe(-10);
    expect(allBalancesOk(checks)).toBe(false);
    expect(checks.find((c) => c.id === "identification")?.ok).toBe(false);
    expect(validation.canExport).toBe(false);
    expect(validation.hardErrors.some((e) => e.id === "identification-exceeded")).toBe(
      true,
    );
    expect(validation.fieldIssues.duplicatesRemoved).toBeDefined();
    expect(() => assertValidForExport(validation)).toThrow(/Export blocked/);
  });

  it("Scenario 3 (Raw negative & decimal before clamping): negative or decimal inputs are caught instead of masked by nonNeg()", () => {
    const input = emptyPrismaInput();
    input.databases = -5;
    input.registers = 3.5;
    input.duplicatesRemoved = 0;
    const validation = validatePrisma(input);
    const checks = balanceChecks(input, derivePrisma(input));

    expect(validation.canExport).toBe(false);
    expect(validation.fieldIssues.databases?.[0]?.id).toBe("databases-negative");
    expect(validation.fieldIssues.registers?.[0]?.id).toBe("registers-decimal");
    expect(allBalancesOk(checks)).toBe(false);
  });

  it("Scenario 4 (Cleared required field vs explicit 0): NaN from cleared input is flagged as required, while 0 is valid", () => {
    const cleared = emptyPrismaInput();
    cleared.databases = Number.NaN;
    const clearedVal = validatePrisma(cleared);
    expect(clearedVal.canExport).toBe(false);
    expect(clearedVal.fieldIssues.databases?.[0]?.id).toBe("databases-empty");

    const explicitZero = emptyPrismaInput();
    explicitZero.databases = 0;
    explicitZero.registers = 0;
    const zeroVal = validatePrisma(explicitZero);
    expect(zeroVal.canExport).toBe(true);
  });

  it("Scenario 5 (Enabled per-database breakdown mismatch): databaseLines sum != databases blocks export", () => {
    const input = emptyPrismaInput();
    input.databases = 100;
    input.showDatabaseLines = true;
    input.databaseLines = [
      { id: "db-1", name: "PubMed", n: 40 },
      { id: "db-2", name: "Embase", n: 50 },
    ];
    input.studiesIncludedOverride = 100;
    const derived = derivePrisma(input);
    const validation = validatePrisma(input, derived);
    const checks = balanceChecks(input, derived);

    expect(validation.canExport).toBe(false);
    expect(validation.hardErrors.some((e) => e.id === "databaseLines-mismatch")).toBe(
      true,
    );
    expect(checks.find((c) => c.id === "databaseLines")?.ok).toBe(false);
  });

  it("Scenario 6 (Enabled human vs automation exclusion breakdown mismatch): sum != recordsExcluded blocks export", () => {
    const input = emptyPrismaInput();
    input.databases = 100;
    input.recordsExcluded = 50;
    input.showRecordsExcludedBreakdown = true;
    input.recordsExcludedByHuman = 30;
    input.recordsExcludedByAutomation = 10;
    input.studiesIncludedOverride = 50;
    const derived = derivePrisma(input);
    const validation = validatePrisma(input, derived);
    const checks = balanceChecks(input, derived);

    expect(validation.canExport).toBe(false);
    expect(
      validation.hardErrors.some((e) => e.id === "recordsExcludedBreakdown-mismatch"),
    ).toBe(true);
    expect(checks.find((c) => c.id === "screeningBreakdown")?.ok).toBe(false);
  });

  it("Scenario 7 (Studies vs Reports unconfirmed): leaving studiesIncludedOverride null without confirmation requires confirmation and blocks export", () => {
    const input = emptyPrismaInput();
    input.databases = 50;
    input.duplicatesRemoved = 10;
    input.recordsExcluded = 20;
    input.reportsNotRetrieved = 2;
    input.exclusionReasons = [{ id: "ex-1", reason: "Wrong population", n: 8 }];
    // Remaining reports = 10, studiesIncludedOverride = null, confirmStudiesEqualReports = false
    const derived = derivePrisma(input);
    const validation = validatePrisma(input, derived);

    expect(derived.reportsOfIncludedStudies).toBe(10);
    expect(validation.canExport).toBe(false);
    expect(validation.hardErrors).toHaveLength(0);
    expect(validation.confirmations).toHaveLength(1);
    expect(validation.confirmations[0].id).toBe("studiesIncluded-unconfirmed");

    // Once user explicitly confirms studies === reports, export is allowed
    input.confirmStudiesEqualReports = true;
    const confirmedValidation = validatePrisma(input, derivePrisma(input));
    expect(confirmedValidation.canExport).toBe(true);
  });

  it("Scenario 8 (Unreconciled manual reports override '52 remaining vs 61 override'): blocks export when reportsOfIncludedOverride != flow remaining", () => {
    const input = DIAGRAM_CASES[0].input();
    // Simulate the old buggy state where databases was 1842 (flow remaining = 52) but reportsOfIncludedOverride = 61
    input.databases = 1842;
    input.databaseLines[0].n = 812;
    const derived = derivePrisma(input);
    const validation = validatePrisma(input, derived);
    const checks = balanceChecks(input, derived);

    expect(derived.reportsIncludedFromDatabases).toBe(52);
    expect(derived.reportsOfIncludedStudies).toBe(61);
    expect(validation.canExport).toBe(false);
    expect(
      validation.hardErrors.some((e) => e.id === "reportsOfIncluded-mismatch"),
    ).toBe(true);
    expect(checks.find((c) => c.id === "includedReports")?.ok).toBe(false);
  });

  it("Scenario 9 (Other methods column excess exclusions): blocks export when otherExclusionReasons exceed otherReportsAssessed", () => {
    const input = emptyPrismaInput();
    input.databases = 20;
    input.studiesIncludedOverride = 20;
    input.includeOtherMethods = true;
    input.otherWebsites = 5;
    input.otherReportsNotRetrieved = 2;
    input.otherExclusionReasons = [{ id: "ox-1", reason: "Wrong design", n: 6 }];
    const derived = derivePrisma(input);
    const validation = validatePrisma(input, derived);

    expect(derived.otherReportsAssessed).toBe(3);
    expect(derived.otherReportsIncluded).toBe(-3);
    expect(validation.canExport).toBe(false);
    expect(
      validation.hardErrors.some((e) => e.id === "other-eligibility-exceeded"),
    ).toBe(true);
  });

  it("Scenario 10 (State transition Valid -> Invalid -> Blocked -> Fixed -> Valid): prevents stale export and restores after fix", () => {
    const input = DIAGRAM_CASES[3].input();
    expect(validatePrisma(input).canExport).toBe(true);
    expect(() => assertValidForExport(input)).not.toThrow();

    // Mutate to invalid: full-text exclusions exceed assessed
    input.exclusionReasons[0].n = 500;
    const invalidResult = validatePrisma(input);
    expect(invalidResult.canExport).toBe(false);
    expect(() => assertValidForExport(invalidResult)).toThrow(/Export blocked/);

    // Fix back to valid count
    input.exclusionReasons[0].n = 80;
    const fixedResult = validatePrisma(input);
    expect(fixedResult.canExport).toBe(true);
    expect(() => assertValidForExport(fixedResult)).not.toThrow();
  });
});
