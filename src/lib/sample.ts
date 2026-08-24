import type { PrismaInput } from "./prisma";

/** Illustrative demo counts — not from a published review. */
export const SAMPLE_TITLE =
  "Sample: exercise interventions for adults with type 2 diabetes (illustrative data)";

export function samplePrismaInput(): PrismaInput {
  return {
    databases: 1842,
    registers: 48,
    databaseLines: [
      { id: "db-pubmed", name: "PubMed", n: 812 },
      { id: "db-embase", name: "Embase", n: 701 },
      { id: "db-central", name: "CENTRAL", n: 329 },
    ],
    showDatabaseLines: true,
    duplicatesRemoved: 612,
    automationIneligible: 0,
    otherRemoved: 0,
    showAutomation: false,
    showOtherRemoved: false,
    recordsExcluded: 1028,
    recordsExcludedByHuman: 1028,
    recordsExcludedByAutomation: 0,
    showRecordsExcludedBreakdown: false,
    reportsNotRetrieved: 8,
    exclusionReasons: [
      { id: "ex-1", reason: "Wrong population", n: 71 },
      { id: "ex-2", reason: "Wrong intervention", n: 54 },
      { id: "ex-3", reason: "Not a primary study", n: 38 },
      { id: "ex-4", reason: "Insufficient outcome data", n: 27 },
    ],
    studiesIncludedOverride: 52,
    reportsOfIncludedOverride: 61,
    includeOtherMethods: false,
    otherWebsites: 0,
    otherOrganisations: 0,
    otherCitationSearching: 0,
    otherReportsSoughtOverride: null,
    otherReportsNotRetrieved: 0,
    otherExclusionReasons: [{ id: "ox-1", reason: "Wrong population", n: 0 }],
  };
}
