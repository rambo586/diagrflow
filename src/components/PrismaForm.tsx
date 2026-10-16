import { DIAGRAM_CASES } from "../lib/cases";
import type {
  BalanceCheck,
  DatabaseLine,
  ExclusionReason,
  PrismaDerived,
  PrismaInput,
  PrismaValidationResult,
  ValidationIssue,
} from "../lib/prisma";
import { createId, validatePrisma } from "../lib/prisma";

type Props = {
  input: PrismaInput;
  derived: PrismaDerived;
  balances: BalanceCheck[];
  validation?: PrismaValidationResult;
  activeCaseId: string;
  onChange: (next: PrismaInput) => void;
  onLoadCase: (id: string) => void;
  onReset: () => void;
};

function fieldName(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseRawNumber(raw: string): number {
  return raw.trim() === "" ? Number.NaN : Number(raw);
}

function formatRawNumber(value: number): string | number {
  return Number.isNaN(value) ? "" : value;
}

function FieldMessages({ issues }: { issues?: ValidationIssue[] }) {
  if (!issues || issues.length === 0) return null;
  return (
    <div className="field-messages" role="alert">
      {issues.map((issue) => (
        <p
          key={issue.id}
          className={`field-issue ${
            issue.severity === "confirmation" ? "confirmation" : "error"
          }`}
        >
          {issue.message}
        </p>
      ))}
    </div>
  );
}

function NumberField({
  label,
  value,
  issues,
  onChange,
}: {
  label: string;
  value: number;
  issues?: ValidationIssue[];
  onChange: (n: number) => void;
}) {
  const name = fieldName(label);
  const hasError = Boolean(issues && issues.length > 0);
  return (
    <label className="field" htmlFor={name}>
      {label}
      <input
        id={name}
        name={name}
        type="number"
        min={0}
        inputMode="numeric"
        aria-invalid={hasError ? "true" : undefined}
        value={formatRawNumber(value)}
        onChange={(event) => onChange(parseRawNumber(event.target.value))}
      />
      <FieldMessages issues={issues} />
    </label>
  );
}

function ReasonList({
  rows,
  fieldPrefix,
  fieldIssues,
  groupIssues,
  onChange,
}: {
  rows: ExclusionReason[];
  fieldPrefix: "exclusionReason" | "otherExclusionReason";
  fieldIssues: Record<string, ValidationIssue[]>;
  groupIssues?: ValidationIssue[];
  onChange: (rows: ExclusionReason[]) => void;
}) {
  return (
    <div>
      {rows.map((row, index) => {
        const rowIssues = fieldIssues[`${fieldPrefix}:${row.id}`];
        const hasError = Boolean(rowIssues && rowIssues.length > 0);
        return (
          <div key={row.id}>
            <div className="row-2">
              <label className="field" htmlFor={`${row.id}-reason`}>
                Reason {index + 1}
                <input
                  id={`${row.id}-reason`}
                  name={`${row.id}-reason`}
                  type="text"
                  value={row.reason}
                  onChange={(event) =>
                    onChange(
                      rows.map((item) =>
                        item.id === row.id
                          ? { ...item, reason: event.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </label>
              <label className="field" htmlFor={`${row.id}-n`}>
                n
                <input
                  id={`${row.id}-n`}
                  name={`${row.id}-n`}
                  type="number"
                  min={0}
                  aria-invalid={hasError ? "true" : undefined}
                  value={formatRawNumber(row.n)}
                  onChange={(event) =>
                    onChange(
                      rows.map((item) =>
                        item.id === row.id
                          ? { ...item, n: parseRawNumber(event.target.value) }
                          : item,
                      ),
                    )
                  }
                />
              </label>
            </div>
            <FieldMessages issues={rowIssues} />
          </div>
        );
      })}
      <FieldMessages issues={groupIssues} />
      <div className="actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            onChange([...rows, { id: createId("ex"), reason: "Reason", n: 0 }])
          }
        >
          Add exclusion reason
        </button>
        {rows.length > 1 ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onChange(rows.slice(0, -1))}
          >
            Remove last
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function PrismaForm({
  input,
  derived,
  balances,
  validation,
  activeCaseId,
  onChange,
  onLoadCase,
  onReset,
}: Props) {
  const activeValidation = validation ?? validatePrisma(input, derived);
  const { fieldIssues } = activeValidation;
  const patch = (partial: Partial<PrismaInput>) => onChange({ ...input, ...partial });

  const updateLine = (id: string, next: Partial<DatabaseLine>) => {
    patch({
      databaseLines: input.databaseLines.map((line) =>
        line.id === id ? { ...line, ...next } : line,
      ),
    });
  };

  return (
    <form className="panel" onSubmit={(event) => event.preventDefault()}>
      <h2>Counts</h2>
      <p className="fine">
        Type the numbers from your screening log. The diagram updates immediately.
        Derived boxes follow official PRISMA 2020 arithmetic.
      </p>
      <div className="actions">
        {DIAGRAM_CASES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === activeCaseId ? "btn btn-primary" : "btn btn-ghost"}
            onClick={() => onLoadCase(item.id)}
          >
            {item.shortTitle}
          </button>
        ))}
        <button type="button" className="btn btn-ghost" onClick={onReset}>
          Reset
        </button>
      </div>

      <section className="phase-block">
        <h3>Identification</h3>
        <NumberField
          label="Databases (n)"
          value={input.databases}
          issues={fieldIssues.databases}
          onChange={(databases) => patch({ databases })}
        />
        <NumberField
          label="Registers (n)"
          value={input.registers}
          issues={fieldIssues.registers}
          onChange={(registers) => patch({ registers })}
        />
        <label className="check">
          <input
            id="show-database-lines"
            name="show-database-lines"
            type="checkbox"
            checked={input.showDatabaseLines}
            onChange={(event) => patch({ showDatabaseLines: event.target.checked })}
          />
          Show per-database lines (PRISMA footnote *)
        </label>
        {input.showDatabaseLines
          ? input.databaseLines.map((line) => {
              const lineIssues = fieldIssues[`databaseLine:${line.id}`];
              return (
                <div key={line.id}>
                  <div className="row-2">
                    <label className="field" htmlFor={`${line.id}-name`}>
                      Database
                      <input
                        id={`${line.id}-name`}
                        name={`${line.id}-name`}
                        type="text"
                        value={line.name}
                        onChange={(event) =>
                          updateLine(line.id, { name: event.target.value })
                        }
                      />
                    </label>
                    <label className="field" htmlFor={`${line.id}-n`}>
                      n
                      <input
                        id={`${line.id}-n`}
                        name={`${line.id}-n`}
                        type="number"
                        min={0}
                        aria-invalid={lineIssues?.length ? "true" : undefined}
                        value={formatRawNumber(line.n)}
                        onChange={(event) =>
                          updateLine(line.id, {
                            n: parseRawNumber(event.target.value),
                          })
                        }
                      />
                    </label>
                  </div>
                  <FieldMessages issues={lineIssues} />
                </div>
              );
            })
          : null}
        {input.showDatabaseLines ? (
          <>
            <FieldMessages issues={fieldIssues.databaseLines} />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                patch({
                  databaseLines: [
                    ...input.databaseLines,
                    { id: createId("db"), name: "Database", n: 0 },
                  ],
                })
              }
            >
              Add database line
            </button>
          </>
        ) : null}
        <NumberField
          label="Duplicate records removed (n)"
          value={input.duplicatesRemoved}
          issues={fieldIssues.duplicatesRemoved}
          onChange={(duplicatesRemoved) => patch({ duplicatesRemoved })}
        />
        <label className="check">
          <input
            id="show-automation"
            name="show-automation"
            type="checkbox"
            checked={input.showAutomation}
            onChange={(event) => patch({ showAutomation: event.target.checked })}
          />
          Include “marked ineligible by automation tools” (grey box)
        </label>
        {input.showAutomation ? (
          <NumberField
            label="Records marked as ineligible by automation tools (n)"
            value={input.automationIneligible}
            issues={fieldIssues.automationIneligible}
            onChange={(automationIneligible) => patch({ automationIneligible })}
          />
        ) : null}
        <label className="check">
          <input
            id="show-other-removed"
            name="show-other-removed"
            type="checkbox"
            checked={input.showOtherRemoved}
            onChange={(event) => patch({ showOtherRemoved: event.target.checked })}
          />
          Include “removed for other reasons” (grey box)
        </label>
        {input.showOtherRemoved ? (
          <NumberField
            label="Records removed for other reasons (n)"
            value={input.otherRemoved}
            issues={fieldIssues.otherRemoved}
            onChange={(otherRemoved) => patch({ otherRemoved })}
          />
        ) : null}
        <p className="fine">Records screened (derived): {derived.recordsScreened}</p>
      </section>

      <section className="phase-block">
        <h3>Screening</h3>
        <NumberField
          label="Records excluded at title/abstract (n)"
          value={input.recordsExcluded}
          issues={fieldIssues.recordsExcluded}
          onChange={(recordsExcluded) => patch({ recordsExcluded })}
        />
        <label className="check">
          <input
            id="show-records-excluded-breakdown"
            name="show-records-excluded-breakdown"
            type="checkbox"
            checked={input.showRecordsExcludedBreakdown}
            onChange={(event) =>
              patch({ showRecordsExcludedBreakdown: event.target.checked })
            }
          />
          Break down human vs automation exclusions (footnote **)
        </label>
        {input.showRecordsExcludedBreakdown ? (
          <>
            <NumberField
              label="Excluded by a human (n)"
              value={input.recordsExcludedByHuman}
              issues={fieldIssues.recordsExcludedByHuman}
              onChange={(recordsExcludedByHuman) => patch({ recordsExcludedByHuman })}
            />
            <NumberField
              label="Excluded by automation tools (n)"
              value={input.recordsExcludedByAutomation}
              issues={fieldIssues.recordsExcludedByAutomation}
              onChange={(recordsExcludedByAutomation) =>
                patch({ recordsExcludedByAutomation })
              }
            />
            <FieldMessages issues={fieldIssues.recordsExcludedBreakdown} />
          </>
        ) : null}
        <p className="fine">Reports sought for retrieval (derived): {derived.reportsSought}</p>
        <NumberField
          label="Reports not retrieved (n)"
          value={input.reportsNotRetrieved}
          issues={fieldIssues.reportsNotRetrieved}
          onChange={(reportsNotRetrieved) => patch({ reportsNotRetrieved })}
        />
      </section>

      <section className="phase-block">
        <h3>Eligibility</h3>
        <p className="fine">
          PRISMA 2020 places eligibility assessment inside Screening. These are the
          official “Reports assessed for eligibility” and “Reports excluded” boxes.
        </p>
        <p className="fine">
          Reports assessed for eligibility (derived): {derived.reportsAssessed}
        </p>
        <ReasonList
          rows={input.exclusionReasons}
          fieldPrefix="exclusionReason"
          fieldIssues={fieldIssues}
          groupIssues={fieldIssues.exclusionReasons}
          onChange={(exclusionReasons) => patch({ exclusionReasons })}
        />
      </section>

      <section className="phase-block">
        <h3>Included</h3>
        <p className="fine">
          Studies and reports are different counts in PRISMA 2020. Enter the number of
          studies included, or confirm that studies equal reports.
        </p>
        <label className="field" htmlFor="studies-included-override">
          Studies included in review (optional override)
          <input
            id="studies-included-override"
            name="studies-included-override"
            type="number"
            min={0}
            aria-invalid={fieldIssues.studiesIncludedOverride?.length ? "true" : undefined}
            placeholder={String(derived.studiesIncluded)}
            value={
              input.studiesIncludedOverride === null
                ? ""
                : formatRawNumber(input.studiesIncludedOverride)
            }
            onChange={(event) =>
              patch({
                studiesIncludedOverride:
                  event.target.value.trim() === ""
                    ? null
                    : Number(event.target.value),
              })
            }
          />
          <FieldMessages issues={fieldIssues.studiesIncludedOverride} />
        </label>
        <label className="check">
          <input
            id="confirm-studies-equal-reports"
            name="confirm-studies-equal-reports"
            type="checkbox"
            checked={Boolean(input.confirmStudiesEqualReports)}
            onChange={(event) =>
              patch({ confirmStudiesEqualReports: event.target.checked })
            }
          />
          Confirm studies included equals reports of included studies (1 study per report)
        </label>
        <label className="field" htmlFor="reports-included-override">
          Reports of included studies (optional override)
          <input
            id="reports-included-override"
            name="reports-included-override"
            type="number"
            min={0}
            aria-invalid={fieldIssues.reportsOfIncludedOverride?.length ? "true" : undefined}
            placeholder={String(derived.reportsOfIncludedStudies)}
            value={
              input.reportsOfIncludedOverride === null
                ? ""
                : formatRawNumber(input.reportsOfIncludedOverride)
            }
            onChange={(event) =>
              patch({
                reportsOfIncludedOverride:
                  event.target.value.trim() === ""
                    ? null
                    : Number(event.target.value),
              })
            }
          />
          <FieldMessages issues={fieldIssues.reportsOfIncludedOverride} />
        </label>
      </section>

      <section className="phase-block">
        <h3>Other methods (optional)</h3>
        <label className="check">
          <input
            id="include-other-methods"
            name="include-other-methods"
            type="checkbox"
            checked={input.includeOtherMethods}
            onChange={(event) => patch({ includeOtherMethods: event.target.checked })}
          />
          Add the official “other methods” column (websites, organisations, citation searching)
        </label>
        {input.includeOtherMethods ? (
          <>
            <NumberField
              label="Websites (n)"
              value={input.otherWebsites}
              issues={fieldIssues.otherWebsites}
              onChange={(otherWebsites) => patch({ otherWebsites })}
            />
            <NumberField
              label="Organisations (n)"
              value={input.otherOrganisations}
              issues={fieldIssues.otherOrganisations}
              onChange={(otherOrganisations) => patch({ otherOrganisations })}
            />
            <NumberField
              label="Citation searching (n)"
              value={input.otherCitationSearching}
              issues={fieldIssues.otherCitationSearching}
              onChange={(otherCitationSearching) => patch({ otherCitationSearching })}
            />
            <NumberField
              label="Other methods: reports not retrieved (n)"
              value={input.otherReportsNotRetrieved}
              issues={fieldIssues.otherReportsNotRetrieved}
              onChange={(otherReportsNotRetrieved) => patch({ otherReportsNotRetrieved })}
            />
            <ReasonList
              rows={input.otherExclusionReasons}
              fieldPrefix="otherExclusionReason"
              fieldIssues={fieldIssues}
              groupIssues={fieldIssues.otherExclusionReasons}
              onChange={(otherExclusionReasons) => patch({ otherExclusionReasons })}
            />
          </>
        ) : null}
      </section>

      <section className="phase-block">
        <h3>Balance checks</h3>
        {balances.map((check) => (
          <div key={check.id} className={`balance ${check.ok ? "ok" : "bad"}`}>
            <span>{check.label}</span>
            <span>
              {check.ok ? "OK" : `actual ${check.actual} (expected ${check.expected})`}
            </span>
          </div>
        ))}
      </section>
    </form>
  );
}
