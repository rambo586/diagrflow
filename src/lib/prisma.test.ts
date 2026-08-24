import { describe, expect, it } from "vitest";
import {
  allBalancesOk,
  balanceChecks,
  derivePrisma,
  emptyPrismaInput,
  OFFICIAL_BOX_IDS,
  OFFICIAL_LABELS,
  sumReasons,
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

  it("treats negative and non-finite counts as zero", () => {
    const input = emptyPrismaInput();
    input.databases = -4;
    input.registers = Number.NaN;
    input.duplicatesRemoved = -2;
    const derived = derivePrisma(input);
    expect(derived.identified).toBe(0);
    expect(derived.removedBeforeScreening).toBe(0);
    expect(derived.recordsScreened).toBe(0);
  });

  it("reconciles the sample diagram", () => {
    const input = samplePrismaInput();
    const derived = derivePrisma(input);
    expect(derived.identified).toBe(1890);
    expect(derived.removedBeforeScreening).toBe(612);
    expect(derived.recordsScreened).toBe(1278);
    expect(derived.reportsSought).toBe(250);
    expect(derived.reportsAssessed).toBe(242);
    expect(derived.reportsExcluded).toBe(190);
    expect(derived.reportsIncludedFromDatabases).toBe(52);
    expect(derived.studiesIncluded).toBe(52);
    expect(derived.reportsOfIncludedStudies).toBe(61);
    expect(allBalancesOk(balanceChecks(input, derived))).toBe(true);
  });
});
