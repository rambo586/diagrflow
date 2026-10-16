import { emptyPrismaInput, type PrismaInput } from "./prisma";

export type DiagramCase = {
  id: string;
  title: string;
  shortTitle: string;
  setting: string;
  topology: string;
  /** Shown in the editor while this illustrative set is loaded. */
  notice: string;
  input: () => PrismaInput;
};

function fromEmpty(patch: Partial<PrismaInput>): PrismaInput {
  return { ...emptyPrismaInput(), ...patch };
}

/** Worked topologies. Counts are illustrative — not from published reviews. */
export const DIAGRAM_CASES: DiagramCase[] = [
  {
    id: "t2d-exercise",
    title: "Exercise for type 2 diabetes",
    shortTitle: "T2D trials",
    setting: "New review of randomised trials in adults. Identification via databases and registers only.",
    topology: "Per-database lines · no other-methods column · grey boxes hidden",
    notice:
      "Illustrative counts for a databases-and-registers figure — not from a published review.",
    input: () =>
      fromEmpty({
        databases: 1851,
        registers: 48,
        databaseLines: [
          { id: "db-pubmed", name: "PubMed", n: 821 },
          { id: "db-embase", name: "Embase", n: 701 },
          { id: "db-central", name: "CENTRAL", n: 329 },
        ],
        showDatabaseLines: true,
        duplicatesRemoved: 612,
        recordsExcluded: 1028,
        recordsExcludedByHuman: 1028,
        reportsNotRetrieved: 8,
        exclusionReasons: [
          { id: "ex-1", reason: "Wrong population", n: 71 },
          { id: "ex-2", reason: "Wrong intervention", n: 54 },
          { id: "ex-3", reason: "Not a primary study", n: 38 },
          { id: "ex-4", reason: "Insufficient outcome data", n: 27 },
        ],
        studiesIncludedOverride: 52,
        reportsOfIncludedOverride: 61,
      }),
  },
  {
    id: "citation-search",
    title: "Citation searching and websites",
    shortTitle: "Other methods",
    setting:
      "New review that also identifies reports from citation searching and organisation websites — the official other-methods column.",
    topology: "Two-column figure · citation searching · websites",
    notice:
      "Illustrative counts for a two-column PRISMA 2020 figure — not from a published review.",
    input: () =>
      fromEmpty({
        databases: 920,
        registers: 12,
        databaseLines: [
          { id: "db-pubmed", name: "PubMed", n: 410 },
          { id: "db-embase", name: "Embase", n: 338 },
          { id: "db-scopus", name: "Scopus", n: 172 },
        ],
        showDatabaseLines: true,
        duplicatesRemoved: 210,
        recordsExcluded: 580,
        recordsExcludedByHuman: 580,
        reportsNotRetrieved: 6,
        exclusionReasons: [
          { id: "ex-1", reason: "Wrong population", n: 40 },
          { id: "ex-2", reason: "Wrong comparator", n: 28 },
          { id: "ex-3", reason: "Conference abstract only", n: 18 },
        ],
        studiesIncludedOverride: 64,
        reportsOfIncludedOverride: 79,
        includeOtherMethods: true,
        otherWebsites: 8,
        otherCitationSearching: 44,
        otherReportsNotRetrieved: 4,
        otherExclusionReasons: [
          { id: "ox-1", reason: "Wrong population", n: 12 },
          { id: "ox-2", reason: "Duplicate of database report", n: 7 },
        ],
      }),
  },
  {
    id: "automation-screen",
    title: "Automation tools in screening",
    shortTitle: "Automation",
    setting:
      "New review that used automation tools before screening and for some title/abstract exclusions — grey boxes and footnote **.",
    topology: "Automation ineligible · other reasons removed · human vs automation exclusions",
    notice:
      "Illustrative counts showing optional grey boxes and the human/automation split — not from a published review.",
    input: () =>
      fromEmpty({
        databases: 4112,
        registers: 90,
        databaseLines: [
          { id: "db-pubmed", name: "PubMed", n: 1692 },
          { id: "db-embase", name: "Embase", n: 1510 },
          { id: "db-cinahl", name: "CINAHL", n: 910 },
        ],
        showDatabaseLines: true,
        duplicatesRemoved: 980,
        automationIneligible: 420,
        otherRemoved: 55,
        showAutomation: true,
        showOtherRemoved: true,
        recordsExcluded: 2410,
        recordsExcludedByHuman: 2200,
        recordsExcludedByAutomation: 210,
        showRecordsExcludedBreakdown: true,
        reportsNotRetrieved: 14,
        exclusionReasons: [
          { id: "ex-1", reason: "Wrong population", n: 88 },
          { id: "ex-2", reason: "Wrong intervention", n: 54 },
          { id: "ex-3", reason: "Wrong study design", n: 41 },
          { id: "ex-4", reason: "No usable outcome", n: 22 },
        ],
        studiesIncludedOverride: 91,
        reportsOfIncludedOverride: 118,
      }),
  },
  {
    id: "rct-db-only",
    title: "RCT search, databases only",
    shortTitle: "DB-only RCT",
    setting:
      "New review of randomised trials that searched bibliographic databases and did not search trial registers (registers n = 0).",
    topology: "Databases only · registers omitted · no other-methods column",
    notice:
      "Illustrative counts for a database-only identification box — not from a published review.",
    input: () =>
      fromEmpty({
        databases: 2180,
        registers: 0,
        databaseLines: [
          { id: "db-pubmed", name: "PubMed", n: 980 },
          { id: "db-embase", name: "Embase", n: 740 },
          { id: "db-central", name: "CENTRAL", n: 460 },
        ],
        showDatabaseLines: true,
        duplicatesRemoved: 440,
        recordsExcluded: 1510,
        recordsExcludedByHuman: 1510,
        reportsNotRetrieved: 11,
        exclusionReasons: [
          { id: "ex-1", reason: "Not randomised", n: 80 },
          { id: "ex-2", reason: "Wrong population", n: 55 },
          { id: "ex-3", reason: "Wrong comparator", n: 28 },
        ],
        studiesIncludedOverride: 56,
        reportsOfIncludedOverride: 56,
      }),
  },
  {
    id: "long-reasons-multi-db",
    title: "Multi-database search with detailed exclusion criteria",
    shortTitle: "Long reasons & multi-DB",
    setting:
      "Large systematic review searching 6 databases with detailed exclusion criteria to test text-wrapping and stage boundaries.",
    topology: "6 database lines · multiple long exclusion reasons · text-wrapping stress test",
    notice:
      "Illustrative counts testing multi-line exclusion reasons and 6 bibliographic databases.",
    input: () =>
      fromEmpty({
        databases: 3420,
        registers: 180,
        databaseLines: [
          { id: "db-medline", name: "MEDLINE (Ovid)", n: 1120 },
          { id: "db-embase", name: "Embase (Elsevier)", n: 980 },
          { id: "db-central", name: "Cochrane CENTRAL", n: 540 },
          { id: "db-wos", name: "Web of Science Core Collection", n: 410 },
          { id: "db-psycinfo", name: "PsycINFO (EBSCO)", n: 220 },
          { id: "db-cinahl", name: "CINAHL Plus", n: 150 },
        ],
        showDatabaseLines: true,
        duplicatesRemoved: 1100,
        recordsExcluded: 2150,
        recordsExcludedByHuman: 2150,
        reportsNotRetrieved: 18,
        exclusionReasons: [
          {
            id: "ex-1",
            reason:
              "Non-randomised observational cohort or case-control design",
            n: 120,
          },
          {
            id: "ex-2",
            reason:
              "Paediatric or adolescent population (< 18 years at baseline)",
            n: 85,
          },
          {
            id: "ex-3",
            reason: "Co-intervention without isolated exercise arm",
            n: 42,
          },
          {
            id: "ex-4",
            reason:
              "Follow-up duration shorter than 12 weeks post-randomisation",
            n: 31,
          },
          {
            id: "ex-5",
            reason:
              "Conference abstract or trial protocol without full results",
            n: 19,
          },
        ],
        studiesIncludedOverride: 30,
        reportsOfIncludedOverride: 35,
      }),
  },
  {
    id: "large-counts-full-two-col",
    title: "Large-scale systematic review with all PRISMA 2020 sources",
    shortTitle: "Large counts two-column",
    setting:
      "Comprehensive global evidence synthesis with over 100,000 records, grey literature, and automation tools.",
    topology:
      "Two-column figure · 100k+ counts · websites · organisations · automation split",
    notice:
      "Illustrative counts testing two-column layout with 6-digit counts, automation tools, and grey literature.",
    input: () =>
      fromEmpty({
        databases: 124500,
        registers: 8340,
        databaseLines: [
          { id: "db-medline", name: "PubMed / MEDLINE", n: 52400 },
          { id: "db-embase", name: "Embase", n: 41100 },
          { id: "db-scopus", name: "Scopus", n: 31000 },
        ],
        showDatabaseLines: true,
        duplicatesRemoved: 38200,
        automationIneligible: 24600,
        otherRemoved: 1240,
        showAutomation: true,
        showOtherRemoved: true,
        recordsExcluded: 67800,
        recordsExcludedByHuman: 19800,
        recordsExcludedByAutomation: 48000,
        showRecordsExcludedBreakdown: true,
        reportsNotRetrieved: 62,
        exclusionReasons: [
          { id: "ex-1", reason: "Wrong population", n: 380 },
          { id: "ex-2", reason: "Wrong intervention", n: 245 },
          { id: "ex-3", reason: "Wrong study design", n: 190 },
        ],
        studiesIncludedOverride: 164,
        reportsOfIncludedOverride: 208,
        includeOtherMethods: true,
        otherWebsites: 420,
        otherOrganisations: 180,
        otherCitationSearching: 950,
        otherReportsNotRetrieved: 35,
        otherExclusionReasons: [
          { id: "ox-1", reason: "Wrong population", n: 820 },
          { id: "ox-2", reason: "Duplicate of database report", n: 610 },
        ],
      }),
  },
];

export const DEFAULT_CASE_ID = DIAGRAM_CASES[0].id;

export function caseById(id: string | null | undefined): DiagramCase | undefined {
  if (!id) return undefined;
  return DIAGRAM_CASES.find((item) => item.id === id);
}

export function caseFromSearch(params: URLSearchParams): DiagramCase | undefined {
  const explicit = caseById(params.get("case"));
  if (explicit) return explicit;
  if (params.get("sample") === "1") return DIAGRAM_CASES[0];
  return undefined;
}
