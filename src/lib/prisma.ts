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
  confirmStudiesEqualReports?: boolean;

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
  | "databaseLines"
  | "screening"
  | "screeningBreakdown"
  | "retrieval"
  | "eligibility"
  | "otherRetrieval"
  | "otherEligibility"
  | "includedReports"
  | "includedStudies";

export type BalanceCheck = {
  id: BalanceId;
  label: string;
  ok: boolean;
  expected: number;
  actual: number;
};

export type ValidationSeverity = "error" | "confirmation";

export type ValidationIssue = {
  id: string;
  field: string;
  severity: ValidationSeverity;
  message: string;
};

export type PrismaValidationResult = {
  canExport: boolean;
  hardErrors: ValidationIssue[];
  confirmations: ValidationIssue[];
  issues: ValidationIssue[];
  fieldIssues: Record<string, ValidationIssue[]>;
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
    confirmStudiesEqualReports: false,
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

export function isNonNegInt(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && Number.isInteger(n) && n >= 0;
}

export function nonNeg(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
}

export function sumReasons(reasons: ExclusionReason[]): number {
  return reasons.reduce((sum, row) => sum + nonNeg(row.n), 0);
}

export function sumDatabaseLines(lines: DatabaseLine[]): number {
  return lines.reduce((sum, row) => sum + nonNeg(row.n), 0);
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

/**
 * Validates raw PrismaInput BEFORE any clamping/truncation (`nonNeg`).
 * Separates hard errors (`severity: "error"`) from confirmation checks (`severity: "confirmation"`).
 * Both block export (`canExport === false`) until resolved by the user.
 */
export function validatePrisma(
  input: PrismaInput,
  derived: PrismaDerived = derivePrisma(input),
): PrismaValidationResult {
  const issues: ValidationIssue[] = [];

  const pushIssue = (
    id: string,
    field: string,
    severity: ValidationSeverity,
    message: string,
  ) => {
    issues.push({ id, field, severity, message });
  };

  const checkRequiredCount = (value: number, field: string, label: string): boolean => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      pushIssue(`${field}-empty`, field, "error", `${label} is required (enter 0 if none).`);
      return false;
    }
    if (!Number.isFinite(value)) {
      pushIssue(`${field}-non-finite`, field, "error", `${label} must be a finite number.`);
      return false;
    }
    if (value < 0) {
      pushIssue(
        `${field}-negative`,
        field,
        "error",
        `${label} cannot be negative (entered ${value}).`,
      );
      return false;
    }
    if (!Number.isInteger(value)) {
      pushIssue(
        `${field}-decimal`,
        field,
        "error",
        `${label} must be a whole number (entered ${value}).`,
      );
      return false;
    }
    return true;
  };

  const checkOptionalCount = (
    value: number | null,
    field: string,
    label: string,
  ): boolean => {
    if (value === null) return true;
    return checkRequiredCount(value, field, label);
  };

  // 1. Raw field-level validation (before any clamping/rounding)
  checkRequiredCount(input.databases, "databases", "Records from databases");
  checkRequiredCount(input.registers, "registers", "Records from registers");
  checkRequiredCount(
    input.duplicatesRemoved,
    "duplicatesRemoved",
    "Duplicate records removed",
  );

  if (input.showAutomation) {
    checkRequiredCount(
      input.automationIneligible,
      "automationIneligible",
      "Records marked ineligible by automation tools",
    );
  }
  if (input.showOtherRemoved) {
    checkRequiredCount(
      input.otherRemoved,
      "otherRemoved",
      "Records removed for other reasons",
    );
  }

  checkRequiredCount(
    input.recordsExcluded,
    "recordsExcluded",
    "Records excluded at title/abstract",
  );
  if (input.showRecordsExcludedBreakdown) {
    checkRequiredCount(
      input.recordsExcludedByHuman,
      "recordsExcludedByHuman",
      "Records excluded by a human",
    );
    checkRequiredCount(
      input.recordsExcludedByAutomation,
      "recordsExcludedByAutomation",
      "Records excluded by automation tools",
    );
  }

  checkRequiredCount(
    input.reportsNotRetrieved,
    "reportsNotRetrieved",
    "Reports not retrieved",
  );

  if (input.showDatabaseLines) {
    for (const line of input.databaseLines) {
      checkRequiredCount(
        line.n,
        `databaseLine:${line.id}`,
        `Database line "${line.name.trim() || "Database"}" count`,
      );
    }
  }

  for (const row of input.exclusionReasons) {
    const ok = checkRequiredCount(
      row.n,
      `exclusionReason:${row.id}`,
      `Full-text exclusion reason "${row.reason.trim() || "Reason"}" count`,
    );
    if (ok && row.n > 0 && !row.reason.trim()) {
      pushIssue(
        `exclusionReason:${row.id}-label`,
        `exclusionReason:${row.id}`,
        "error",
        "Full-text exclusion reason with n > 0 must have a non-empty label.",
      );
    }
  }

  checkOptionalCount(
    input.studiesIncludedOverride,
    "studiesIncludedOverride",
    "Studies included in review",
  );
  checkOptionalCount(
    input.reportsOfIncludedOverride,
    "reportsOfIncludedOverride",
    "Reports of included studies",
  );

  if (input.includeOtherMethods) {
    checkRequiredCount(input.otherWebsites, "otherWebsites", "Other methods: websites");
    checkRequiredCount(
      input.otherOrganisations,
      "otherOrganisations",
      "Other methods: organisations",
    );
    checkRequiredCount(
      input.otherCitationSearching,
      "otherCitationSearching",
      "Other methods: citation searching",
    );
    checkOptionalCount(
      input.otherReportsSoughtOverride,
      "otherReportsSoughtOverride",
      "Other methods: reports sought for retrieval",
    );
    checkRequiredCount(
      input.otherReportsNotRetrieved,
      "otherReportsNotRetrieved",
      "Other methods: reports not retrieved",
    );
    for (const row of input.otherExclusionReasons) {
      const ok = checkRequiredCount(
        row.n,
        `otherExclusionReason:${row.id}`,
        `Other methods exclusion reason "${row.reason.trim() || "Reason"}" count`,
      );
      if (ok && row.n > 0 && !row.reason.trim()) {
        pushIssue(
          `otherExclusionReason:${row.id}-label`,
          `otherExclusionReason:${row.id}`,
          "error",
          "Other methods exclusion reason with n > 0 must have a non-empty label.",
        );
      }
    }
  }

  // 2. Enabled breakdown reconciliation
  if (input.showDatabaseLines && isNonNegInt(input.databases)) {
    const allLinesValid = input.databaseLines.every((line) => isNonNegInt(line.n));
    if (allLinesValid) {
      const lineSum = input.databaseLines.reduce((acc, line) => acc + line.n, 0);
      if (lineSum !== input.databases) {
        pushIssue(
          "databaseLines-mismatch",
          "databaseLines",
          "error",
          `Per-database line counts sum to ${lineSum}, which does not match Databases total (${input.databases}).`,
        );
      }
    }
  }

  if (
    input.showRecordsExcludedBreakdown &&
    isNonNegInt(input.recordsExcluded) &&
    isNonNegInt(input.recordsExcludedByHuman) &&
    isNonNegInt(input.recordsExcludedByAutomation)
  ) {
    const breakdownSum =
      input.recordsExcludedByHuman + input.recordsExcludedByAutomation;
    if (breakdownSum !== input.recordsExcluded) {
      pushIssue(
        "recordsExcludedBreakdown-mismatch",
        "recordsExcludedBreakdown",
        "error",
        `Human (${input.recordsExcludedByHuman}) + automation (${input.recordsExcludedByAutomation}) exclusions = ${breakdownSum}, which does not match Records excluded (${input.recordsExcluded}).`,
      );
    }
  }

  // 3. Stage-by-stage deduction bounds (preventing negative downstream counts)
  if (derived.removedBeforeScreening > derived.identified) {
    pushIssue(
      "identification-exceeded",
      "duplicatesRemoved",
      "error",
      `Records removed before screening (${derived.removedBeforeScreening}) exceeds records identified (${derived.identified}), leaving ${derived.recordsScreened} records screened.`,
    );
  }

  if (
    derived.recordsScreened >= 0 &&
    isNonNegInt(input.recordsExcluded) &&
    input.recordsExcluded > derived.recordsScreened
  ) {
    pushIssue(
      "screening-exceeded",
      "recordsExcluded",
      "error",
      `Records excluded (${input.recordsExcluded}) exceeds records screened (${derived.recordsScreened}), leaving ${derived.reportsSought} reports sought.`,
    );
  }

  if (
    derived.reportsSought >= 0 &&
    isNonNegInt(input.reportsNotRetrieved) &&
    input.reportsNotRetrieved > derived.reportsSought
  ) {
    pushIssue(
      "retrieval-exceeded",
      "reportsNotRetrieved",
      "error",
      `Reports not retrieved (${input.reportsNotRetrieved}) exceeds reports sought for retrieval (${derived.reportsSought}), leaving ${derived.reportsAssessed} reports assessed.`,
    );
  }

  if (
    derived.reportsAssessed >= 0 &&
    derived.reportsExcluded > derived.reportsAssessed
  ) {
    pushIssue(
      "eligibility-exceeded",
      "exclusionReasons",
      "error",
      `Full-text reports excluded (${derived.reportsExcluded}) exceeds reports assessed for eligibility (${derived.reportsAssessed}), leaving ${derived.reportsIncludedFromDatabases} reports included.`,
    );
  }

  if (input.includeOtherMethods) {
    if (
      input.otherReportsSoughtOverride !== null &&
      isNonNegInt(input.otherReportsSoughtOverride) &&
      input.otherReportsSoughtOverride > derived.otherIdentified
    ) {
      pushIssue(
        "other-sought-exceeded",
        "otherReportsSoughtOverride",
        "error",
        `Other methods reports sought (${input.otherReportsSoughtOverride}) exceeds records identified via other methods (${derived.otherIdentified}).`,
      );
    }

    if (
      derived.otherReportsSought >= 0 &&
      isNonNegInt(input.otherReportsNotRetrieved) &&
      input.otherReportsNotRetrieved > derived.otherReportsSought
    ) {
      pushIssue(
        "other-retrieval-exceeded",
        "otherReportsNotRetrieved",
        "error",
        `Other methods reports not retrieved (${input.otherReportsNotRetrieved}) exceeds reports sought (${derived.otherReportsSought}), leaving ${derived.otherReportsAssessed} reports assessed.`,
      );
    }

    if (
      derived.otherReportsAssessed >= 0 &&
      derived.otherReportsExcluded > derived.otherReportsAssessed
    ) {
      pushIssue(
        "other-eligibility-exceeded",
        "otherExclusionReasons",
        "error",
        `Other methods full-text exclusions (${derived.otherReportsExcluded}) exceeds reports assessed (${derived.otherReportsAssessed}), leaving ${derived.otherReportsIncluded} reports included.`,
      );
    }
  }

  // 4. Final included reports & studies reconciliation
  const flowRemainingReports =
    derived.reportsIncludedFromDatabases + derived.otherReportsIncluded;

  if (
    input.reportsOfIncludedOverride !== null &&
    isNonNegInt(input.reportsOfIncludedOverride) &&
    flowRemainingReports >= 0 &&
    input.reportsOfIncludedOverride !== flowRemainingReports
  ) {
    pushIssue(
      "reportsOfIncluded-mismatch",
      "reportsOfIncludedOverride",
      "error",
      `Reports of included studies (${input.reportsOfIncludedOverride}) does not reconcile with reports remaining after eligibility assessment (${flowRemainingReports}).`,
    );
  }

  // Studies vs Reports semantic rule:
  // If studiesIncludedOverride is left blank while there are included reports (> 0),
  // require explicit confirmation or an explicit studies count.
  if (
    input.studiesIncludedOverride === null &&
    derived.reportsOfIncludedStudies > 0 &&
    input.confirmStudiesEqualReports === false
  ) {
    pushIssue(
      "studiesIncluded-unconfirmed",
      "studiesIncludedOverride",
      "confirmation",
      `Enter the number of studies included in review, or confirm that studies equal reports (n = ${derived.reportsOfIncludedStudies}). In PRISMA 2020, one study may map to multiple reports.`,
    );
  }

  if (
    input.studiesIncludedOverride !== null &&
    isNonNegInt(input.studiesIncludedOverride) &&
    derived.reportsOfIncludedStudies >= 0 &&
    input.studiesIncludedOverride > derived.reportsOfIncludedStudies
  ) {
    pushIssue(
      "studiesIncluded-exceeds-reports",
      "studiesIncludedOverride",
      "error",
      `Studies included in review (${input.studiesIncludedOverride}) cannot exceed reports of included studies (${derived.reportsOfIncludedStudies}) without accounting for the reports in the flow.`,
    );
  }

  if (
    input.studiesIncludedOverride === 0 &&
    derived.reportsOfIncludedStudies > 0
  ) {
    pushIssue(
      "studiesIncluded-zero-with-reports",
      "studiesIncludedOverride",
      "error",
      `Studies included cannot be 0 when ${derived.reportsOfIncludedStudies} reports of included studies remain.`,
    );
  }

  const hardErrors = issues.filter((item) => item.severity === "error");
  const confirmations = issues.filter((item) => item.severity === "confirmation");
  const fieldIssues: Record<string, ValidationIssue[]> = {};
  for (const issue of issues) {
    if (!fieldIssues[issue.field]) {
      fieldIssues[issue.field] = [];
    }
    fieldIssues[issue.field].push(issue);
  }

  return {
    canExport: issues.length === 0,
    hardErrors,
    confirmations,
    issues,
    fieldIssues,
  };
}

/**
 * Independent arithmetic and semantic balance checks for PRISMA 2020 stages.
 * Never rubber-stamps negative downstream counts or mismatched overrides.
 */
export function balanceChecks(
  input: PrismaInput,
  derived: PrismaDerived,
): BalanceCheck[] {
  const idValid =
    isNonNegInt(input.databases) &&
    isNonNegInt(input.registers) &&
    isNonNegInt(input.duplicatesRemoved) &&
    (!input.showAutomation || isNonNegInt(input.automationIneligible)) &&
    (!input.showOtherRemoved || isNonNegInt(input.otherRemoved));

  const screenValid = idValid && isNonNegInt(input.recordsExcluded);
  const retrievalValid = screenValid && isNonNegInt(input.reportsNotRetrieved);
  const eligibilityValid =
    retrievalValid && input.exclusionReasons.every((row) => isNonNegInt(row.n));

  const checks: BalanceCheck[] = [
    {
      id: "identification",
      label: "Identified − removed = records screened (≥ 0)",
      ok:
        idValid &&
        derived.recordsScreened >= 0 &&
        derived.recordsScreened === derived.identified - derived.removedBeforeScreening,
      expected: Math.max(0, derived.identified - derived.removedBeforeScreening),
      actual: derived.recordsScreened,
    },
  ];

  if (input.showDatabaseLines) {
    const linesValid =
      isNonNegInt(input.databases) &&
      input.databaseLines.every((line) => isNonNegInt(line.n));
    const lineSum = sumDatabaseLines(input.databaseLines);
    checks.push({
      id: "databaseLines",
      label: "Per-database lines sum = databases total",
      ok: linesValid && lineSum === input.databases,
      expected: nonNeg(input.databases),
      actual: lineSum,
    });
  }

  checks.push({
    id: "screening",
    label: "Screened − excluded = reports sought (≥ 0)",
    ok:
      screenValid &&
      derived.recordsScreened >= 0 &&
      derived.reportsSought >= 0 &&
      derived.reportsSought === derived.recordsScreened - input.recordsExcluded,
    expected: Math.max(0, derived.recordsScreened - nonNeg(input.recordsExcluded)),
    actual: derived.reportsSought,
  });

  if (input.showRecordsExcludedBreakdown) {
    const breakdownValid =
      isNonNegInt(input.recordsExcluded) &&
      isNonNegInt(input.recordsExcludedByHuman) &&
      isNonNegInt(input.recordsExcludedByAutomation);
    const breakdownSum =
      nonNeg(input.recordsExcludedByHuman) + nonNeg(input.recordsExcludedByAutomation);
    checks.push({
      id: "screeningBreakdown",
      label: "Human + automation exclusions = records excluded",
      ok: breakdownValid && breakdownSum === input.recordsExcluded,
      expected: nonNeg(input.recordsExcluded),
      actual: breakdownSum,
    });
  }

  checks.push(
    {
      id: "retrieval",
      label: "Sought − not retrieved = reports assessed (≥ 0)",
      ok:
        retrievalValid &&
        derived.reportsSought >= 0 &&
        derived.reportsAssessed >= 0 &&
        derived.reportsAssessed === derived.reportsSought - input.reportsNotRetrieved,
      expected: Math.max(0, derived.reportsSought - nonNeg(input.reportsNotRetrieved)),
      actual: derived.reportsAssessed,
    },
    {
      id: "eligibility",
      label: "Assessed − full-text exclusions = included reports (≥ 0)",
      ok:
        eligibilityValid &&
        derived.reportsAssessed >= 0 &&
        derived.reportsIncludedFromDatabases >= 0 &&
        derived.reportsIncludedFromDatabases ===
          derived.reportsAssessed - derived.reportsExcluded,
      expected: Math.max(0, derived.reportsAssessed - derived.reportsExcluded),
      actual: derived.reportsIncludedFromDatabases,
    },
  );

  if (input.includeOtherMethods) {
    const otherIdValid =
      isNonNegInt(input.otherWebsites) &&
      isNonNegInt(input.otherOrganisations) &&
      isNonNegInt(input.otherCitationSearching) &&
      (input.otherReportsSoughtOverride === null ||
        (isNonNegInt(input.otherReportsSoughtOverride) &&
          input.otherReportsSoughtOverride <= derived.otherIdentified));
    const otherRetrievalValid =
      otherIdValid && isNonNegInt(input.otherReportsNotRetrieved);
    const otherEligibilityValid =
      otherRetrievalValid &&
      input.otherExclusionReasons.every((row) => isNonNegInt(row.n));

    checks.push(
      {
        id: "otherRetrieval",
        label: "Other methods: sought − not retrieved = assessed (≥ 0)",
        ok:
          otherRetrievalValid &&
          derived.otherReportsSought >= 0 &&
          derived.otherReportsAssessed >= 0 &&
          derived.otherReportsAssessed ===
            derived.otherReportsSought - input.otherReportsNotRetrieved,
        expected: Math.max(
          0,
          derived.otherReportsSought - nonNeg(input.otherReportsNotRetrieved),
        ),
        actual: derived.otherReportsAssessed,
      },
      {
        id: "otherEligibility",
        label: "Other methods: assessed − exclusions = included reports (≥ 0)",
        ok:
          otherEligibilityValid &&
          derived.otherReportsAssessed >= 0 &&
          derived.otherReportsIncluded >= 0 &&
          derived.otherReportsIncluded ===
            derived.otherReportsAssessed - derived.otherReportsExcluded,
        expected: Math.max(
          0,
          derived.otherReportsAssessed - derived.otherReportsExcluded,
        ),
        actual: derived.otherReportsIncluded,
      },
    );
  }

  const flowRemainingReports =
    derived.reportsIncludedFromDatabases + derived.otherReportsIncluded;
  const reportsOverrideValid =
    input.reportsOfIncludedOverride === null ||
    isNonNegInt(input.reportsOfIncludedOverride);

  checks.push({
    id: "includedReports",
    label: "Remaining flow reports = reports of included studies",
    ok:
      eligibilityValid &&
      reportsOverrideValid &&
      flowRemainingReports >= 0 &&
      derived.reportsOfIncludedStudies === flowRemainingReports,
    expected: Math.max(0, flowRemainingReports),
    actual: derived.reportsOfIncludedStudies,
  });

  const studiesValid =
    (input.studiesIncludedOverride === null
      ? derived.reportsOfIncludedStudies === 0 ||
        input.confirmStudiesEqualReports !== false
      : isNonNegInt(input.studiesIncludedOverride)) &&
    derived.studiesIncluded >= 0 &&
    derived.studiesIncluded <= derived.reportsOfIncludedStudies &&
    (derived.reportsOfIncludedStudies === 0 || derived.studiesIncluded > 0);

  checks.push({
    id: "includedStudies",
    label: "Studies included confirmed and ≤ reports of included studies",
    ok: studiesValid,
    expected: derived.reportsOfIncludedStudies,
    actual: derived.studiesIncluded,
  });

  return checks;
}

export function allBalancesOk(checks: BalanceCheck[]): boolean {
  return checks.every((check) => check.ok);
}
