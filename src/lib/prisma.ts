export type DatabaseLine = {
  id: string;
  name: string;
  n: number;
};

export type ExclusionReason = {
  id: string;
  reason: string;
  n: number;
};

export type PrismaInput = {
  databases: number;
  registers: number;
  databaseLines: DatabaseLine[];
  showDatabaseLines: boolean;

  duplicatesRemoved: number;
  automationIneligible: number;
  otherRemoved: number;
  showAutomation: boolean;
  showOtherRemoved: boolean;

  recordsExcluded: number;
  recordsExcludedByHuman: number;
  recordsExcludedByAutomation: number;
  showRecordsExcludedBreakdown: boolean;

  reportsNotRetrieved: number;
  exclusionReasons: ExclusionReason[];

  studiesIncludedOverride: number | null;
  reportsOfIncludedOverride: number | null;

  includeOtherMethods: boolean;
  otherWebsites: number;
  otherOrganisations: number;
  otherCitationSearching: number;
  otherReportsSoughtOverride: number | null;
  otherReportsNotRetrieved: number;
  otherExclusionReasons: ExclusionReason[];
};

export type PrismaDerived = {
  identified: number;
  removedBeforeScreening: number;
  recordsScreened: number;
  reportsSought: number;
  reportsAssessed: number;
  reportsExcluded: number;
  reportsIncludedFromDatabases: number;
  otherIdentified: number;
  otherReportsSought: number;
  otherReportsAssessed: number;
  otherReportsExcluded: number;
  otherReportsIncluded: number;
  studiesIncluded: number;
  reportsOfIncludedStudies: number;
};

export type BalanceId =
  | "identification"
  | "screening"
  | "retrieval"
  | "eligibility"
  | "otherRetrieval"
  | "otherEligibility";

export type BalanceCheck = {
  id: BalanceId;
  label: string;
  ok: boolean;
  expected: number;
  actual: number;
};

export const OFFICIAL_LABELS = {
  headerDatabases: "Identification of studies via databases and registers",
  headerOther: "Identification of studies via other methods",
  identification: "Identification",
  screening: "Screening",
  included: "Included",
  recordsIdentifiedFrom: "Records identified from*:",
  databases: "Databases",
  registers: "Registers",
  recordsRemovedBeforeScreening: "Records removed before screening:",
  duplicateRecordsRemoved: "Duplicate records removed",
  automationIneligible: "Records marked as ineligible by automation tools",
  otherRemoved: "Records removed for other reasons",
  recordsScreened: "Records screened",
  recordsExcluded: "Records excluded**",
  reportsSought: "Reports sought for retrieval",
  reportsNotRetrieved: "Reports not retrieved",
  reportsAssessed: "Reports assessed for eligibility",
  reportsExcluded: "Reports excluded:",
  studiesIncluded: "Studies included in review",
  reportsOfIncluded: "Reports of included studies",
  otherWebsites: "Websites",
  otherOrganisations: "Organisations",
  otherCitationSearching: "Citation searching",
  footnoteStar:
    "*Consider, if feasible to do so, reporting the number of records identified from each database or register searched (rather than the total number across all databases/registers).",
  footnoteStarStar:
    "**If automation tools were used, indicate how many records were excluded by a human and how many were excluded by automation tools.",
  citation:
    "Source: Page MJ, et al. BMJ 2021;372:n71. doi: 10.1136/bmj.n71. This work is licensed under CC BY 4.0. Adapted from the PRISMA 2020 flow diagram templates. Diagrflow is not affiliated with prisma-statement.org.",
} as const;

export const OFFICIAL_BOX_IDS = [
  "recordsIdentified",
  "recordsRemoved",
  "recordsScreened",
  "recordsExcluded",
  "reportsSought",
  "reportsNotRetrieved",
  "reportsAssessed",
  "reportsExcluded",
  "studiesIncluded",
] as const;

export type OfficialBoxId = (typeof OFFICIAL_BOX_IDS)[number];

export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyPrismaInput(): PrismaInput {
  return {
    databases: 0,
    registers: 0,
    databaseLines: [
      { id: "db-pubmed", name: "PubMed", n: 0 },
      { id: "db-embase", name: "Embase", n: 0 },
    ],
    showDatabaseLines: false,
    duplicatesRemoved: 0,
    automationIneligible: 0,
    otherRemoved: 0,
    showAutomation: false,
    showOtherRemoved: false,
    recordsExcluded: 0,
    recordsExcludedByHuman: 0,
    recordsExcludedByAutomation: 0,
    showRecordsExcludedBreakdown: false,
    reportsNotRetrieved: 0,
    exclusionReasons: [
      { id: "ex-1", reason: "Wrong population", n: 0 },
      { id: "ex-2", reason: "Wrong intervention", n: 0 },
      { id: "ex-3", reason: "Wrong study design", n: 0 },
    ],
    studiesIncludedOverride: null,
    reportsOfIncludedOverride: null,
    includeOtherMethods: false,
    otherWebsites: 0,
    otherOrganisations: 0,
    otherCitationSearching: 0,
    otherReportsSoughtOverride: null,
    otherReportsNotRetrieved: 0,
    otherExclusionReasons: [
      { id: "ox-1", reason: "Wrong population", n: 0 },
    ],
  };
}

export function sumReasons(reasons: ExclusionReason[]): number {
  return reasons.reduce((sum, row) => sum + nonNeg(row.n), 0);
}

export function sumDatabaseLines(lines: DatabaseLine[]): number {
  return lines.reduce((sum, row) => sum + nonNeg(row.n), 0);
}

export function nonNeg(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
}

export function derivePrisma(input: PrismaInput): PrismaDerived {
  const identified = nonNeg(input.databases) + nonNeg(input.registers);
  const removedBeforeScreening =
    nonNeg(input.duplicatesRemoved) +
    (input.showAutomation ? nonNeg(input.automationIneligible) : 0) +
    (input.showOtherRemoved ? nonNeg(input.otherRemoved) : 0);

  const recordsScreened = identified - removedBeforeScreening;
  const reportsSought = recordsScreened - nonNeg(input.recordsExcluded);
  const reportsAssessed = reportsSought - nonNeg(input.reportsNotRetrieved);
  const reportsExcluded = sumReasons(input.exclusionReasons);
  const reportsIncludedFromDatabases = reportsAssessed - reportsExcluded;

  const otherIdentified = input.includeOtherMethods
    ? nonNeg(input.otherWebsites) +
      nonNeg(input.otherOrganisations) +
      nonNeg(input.otherCitationSearching)
    : 0;
  const otherReportsSought = input.includeOtherMethods
    ? input.otherReportsSoughtOverride === null
      ? otherIdentified
      : nonNeg(input.otherReportsSoughtOverride)
    : 0;
  const otherReportsAssessed = input.includeOtherMethods
    ? otherReportsSought - nonNeg(input.otherReportsNotRetrieved)
    : 0;
  const otherReportsExcluded = input.includeOtherMethods
    ? sumReasons(input.otherExclusionReasons)
    : 0;
  const otherReportsIncluded = input.includeOtherMethods
    ? otherReportsAssessed - otherReportsExcluded
    : 0;

  const reportsOfIncludedStudies =
    input.reportsOfIncludedOverride === null
      ? reportsIncludedFromDatabases + otherReportsIncluded
      : nonNeg(input.reportsOfIncludedOverride);

  const studiesIncluded =
    input.studiesIncludedOverride === null
      ? reportsOfIncludedStudies
      : nonNeg(input.studiesIncludedOverride);

  return {
    identified,
    removedBeforeScreening,
    recordsScreened,
    reportsSought,
    reportsAssessed,
    reportsExcluded,
    reportsIncludedFromDatabases,
    otherIdentified,
    otherReportsSought,
    otherReportsAssessed,
    otherReportsExcluded,
    otherReportsIncluded,
    studiesIncluded,
    reportsOfIncludedStudies,
  };
}

export function formatN(n: number): string {
  return `(n = ${n})`;
}

export function balanceChecks(
  input: PrismaInput,
  derived: PrismaDerived,
): BalanceCheck[] {
  const checks: BalanceCheck[] = [
    {
      id: "identification",
      label: "Identified − removed = records screened",
      ok: derived.recordsScreened === derived.identified - derived.removedBeforeScreening,
      expected: derived.identified - derived.removedBeforeScreening,
      actual: derived.recordsScreened,
    },
    {
      id: "screening",
      label: "Screened − excluded = reports sought",
      ok: derived.reportsSought === derived.recordsScreened - nonNeg(input.recordsExcluded),
      expected: derived.recordsScreened - nonNeg(input.recordsExcluded),
      actual: derived.reportsSought,
    },
    {
      id: "retrieval",
      label: "Sought − not retrieved = reports assessed",
      ok:
        derived.reportsAssessed ===
        derived.reportsSought - nonNeg(input.reportsNotRetrieved),
      expected: derived.reportsSought - nonNeg(input.reportsNotRetrieved),
      actual: derived.reportsAssessed,
    },
    {
      id: "eligibility",
      label: "Assessed − full-text exclusions = included reports (databases)",
      ok:
        derived.reportsIncludedFromDatabases ===
        derived.reportsAssessed - derived.reportsExcluded,
      expected: derived.reportsAssessed - derived.reportsExcluded,
      actual: derived.reportsIncludedFromDatabases,
    },
  ];

  if (input.includeOtherMethods) {
    checks.push(
      {
        id: "otherRetrieval",
        label: "Other methods: sought − not retrieved = assessed",
        ok:
          derived.otherReportsAssessed ===
          derived.otherReportsSought - nonNeg(input.otherReportsNotRetrieved),
        expected: derived.otherReportsSought - nonNeg(input.otherReportsNotRetrieved),
        actual: derived.otherReportsAssessed,
      },
      {
        id: "otherEligibility",
        label: "Other methods: assessed − exclusions = included reports",
        ok:
          derived.otherReportsIncluded ===
          derived.otherReportsAssessed - derived.otherReportsExcluded,
        expected: derived.otherReportsAssessed - derived.otherReportsExcluded,
        actual: derived.otherReportsIncluded,
      },
    );
  }

  return checks;
}

export function allBalancesOk(checks: BalanceCheck[]): boolean {
  return checks.every((check) => check.ok);
}
