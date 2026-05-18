/**
 * Table Import / Export composite (canon ⑪).
 *
 * Two surfaces — both consumed alongside any `<Table>` primitive,
 * never as a Table prop (per cardinal rule 32 — not a redundant
 * prop on Table, but a separate composite). They share the
 * `.ie-card` atom set in `src/styles/shell/40-table.css`.
 *
 * - `TableImportFlow` — 4-step stepper (file → mapping → validate →
 *   apply), file card with progress, per-row error preview.
 * - `TableExportDialog` — modal with format + range + columns
 *   options + cancel / export footer.
 */
import { type ReactNode } from "react";
import { cn } from "../../cn";
import { Dialog } from "../../feedback/Dialog";
import { Button } from "../../general/Button";
import { Radio, RadioGroup } from "../../data-entry/Radio";
import { Checkbox } from "../../data-entry/Checkbox";

// ── Import flow ─────────────────────────────────────────────────────

export type TableImportStep =
  | "file"
  | "mapping"
  | "validate"
  | "apply";

const STEP_ORDER: TableImportStep[] = [
  "file",
  "mapping",
  "validate",
  "apply",
];

export interface TableImportStepperLabels {
  file?: ReactNode;
  mapping?: ReactNode;
  validate?: ReactNode;
  apply?: ReactNode;
}

const DEFAULT_STEP_LABELS: Required<TableImportStepperLabels> = {
  file: "ファイル選択",
  mapping: "列マッピング",
  validate: "検証 / プレビュー",
  apply: "反映",
};

export interface TableImportFileInfo {
  /** Detected file name (display only). */
  name: string;
  /** Row count summary, e.g. `1,284 行`. */
  rowSummary?: ReactNode;
  /** Byte size summary, e.g. `132 KB`. */
  sizeSummary?: ReactNode;
  /** Detected encoding label (canon shows `SHIFT-JIS 検出`). */
  encodingLabel?: ReactNode;
  /** 0–1 progress fraction during validation. */
  progress?: number;
  /** Free-form left / right meta beneath the progress bar. */
  progressLeftLabel?: ReactNode;
  progressRightLabel?: ReactNode;
  /** Whether to show the success file icon (vs the error one). */
  status?: "ok" | "error";
}

export interface TableImportErrorRow {
  line: ReactNode;
  message: ReactNode;
  value: ReactNode;
  severity?: "error" | "warning";
}

export interface TableImportFlowProps {
  title?: ReactNode;
  /** Currently active step (one of the 4). */
  currentStep: TableImportStep;
  stepLabels?: TableImportStepperLabels;
  file?: TableImportFileInfo;
  errors?: TableImportErrorRow[];
  /** Renders the actions row at the bottom of the card. */
  actions?: ReactNode;
  className?: string;
}

export function TableImportFlow({
  title,
  currentStep,
  stepLabels,
  file,
  errors,
  actions,
  className,
}: TableImportFlowProps) {
  const labels = { ...DEFAULT_STEP_LABELS, ...stepLabels };
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  return (
    <section className={cn("ie-card", className)}>
      {title !== undefined && <h4>{title}</h4>}
      <ol className="ie-stepper" aria-label="import-steps">
        {STEP_ORDER.map((step, index) => {
          const state =
            index < currentIndex
              ? "done"
              : index === currentIndex
                ? "on"
                : undefined;
          return (
            <li
              key={step}
              className={cn("ie-step", state)}
              aria-current={state === "on" ? "step" : undefined}
            >
              <span className="n">
                {state === "done" ? "✓" : String(index + 1)}
              </span>
              <span>{labels[step]}</span>
            </li>
          );
        })}
      </ol>
      {file !== undefined && (
        <div className="ie-file-card">
          <div className="ie-file-card-row">
            <FileIcon status={file.status ?? "ok"} />
            <span className="name">{file.name}</span>
            {(file.rowSummary !== undefined ||
              file.sizeSummary !== undefined) && (
              <span className="meta">
                {file.rowSummary !== undefined && <>· {file.rowSummary} </>}
                {file.sizeSummary !== undefined && <>· {file.sizeSummary}</>}
              </span>
            )}
            {file.encodingLabel !== undefined && (
              <span className="tag">{file.encodingLabel}</span>
            )}
          </div>
          {file.progress !== undefined && (
            <>
              <div className="ie-progress">
                <i
                  style={{
                    width: `${Math.round(
                      Math.min(Math.max(file.progress, 0), 1) * 100,
                    )}%`,
                  }}
                />
              </div>
              {(file.progressLeftLabel !== undefined ||
                file.progressRightLabel !== undefined) && (
                <div className="ie-progress-meta">
                  <span>{file.progressLeftLabel}</span>
                  <span>{file.progressRightLabel}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {errors !== undefined && errors.length > 0 && (
        <table className="table ie-error-table">
          <thead>
            <tr>
              <th style={{ height: 26 }}>行</th>
              <th style={{ height: 26 }}>エラー</th>
              <th style={{ height: 26 }}>値</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((row, index) => (
              <tr
                key={index}
                className={
                  row.severity === "warning" ? "is-warning" : "is-error"
                }
              >
                <td>
                  <span className="c-mono">{row.line}</span>
                </td>
                <td>{row.message}</td>
                <td>
                  <span className="c-mono">{row.value}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {actions !== undefined && <div className="actions-row">{actions}</div>}
    </section>
  );
}

function FileIcon({ status }: { status: "ok" | "error" }) {
  const stroke = status === "ok" ? "var(--success)" : "var(--destructive)";
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

// ── Export dialog ───────────────────────────────────────────────────

export type TableExportFormat = "csv-utf8" | "csv-shift-jis" | "xlsx" | "pdf";
export type TableExportRange =
  | "current-filter"
  | "selected"
  | "all";

export interface TableExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  /** Selected output format. */
  format: TableExportFormat;
  onFormatChange: (format: TableExportFormat) => void;
  /** Selected scope. */
  range: TableExportRange;
  onRangeChange: (range: TableExportRange) => void;
  /** Whether to include hidden columns. */
  includeHiddenColumns: boolean;
  onIncludeHiddenColumnsChange: (next: boolean) => void;
  /** Counts shown next to the range options. */
  rangeCounts?: {
    currentFilter?: number;
    selected?: number;
    all?: number;
  };
  /** Counts shown next to the columns options. */
  columnCounts?: {
    visible?: number;
    total?: number;
  };
  /** Save callback. */
  onExport: () => void;
  /** Cancel callback. */
  onCancel?: () => void;
  exportLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** Optional copy overrides. */
  labels?: {
    format?: ReactNode;
    range?: ReactNode;
    columns?: ReactNode;
    csvUtf8?: ReactNode;
    csvShiftJis?: ReactNode;
    xlsx?: ReactNode;
    pdf?: ReactNode;
    currentFilter?: (count?: number) => ReactNode;
    selected?: (count?: number) => ReactNode;
    all?: (count?: number) => ReactNode;
    visibleOnly?: (count?: number) => ReactNode;
    includeHidden?: (count?: number) => ReactNode;
  };
}

const DEFAULT_EXPORT_LABELS = {
  format: "形式",
  range: "範囲",
  columns: "列",
  csvUtf8: "CSV (UTF-8 with BOM)",
  csvShiftJis: "CSV (SHIFT-JIS · Excel 互換)",
  xlsx: "Excel (.xlsx) · スタイル付き",
  pdf: "PDF レポート · 月次サマリー",
};

export function TableExportDialog({
  open,
  onOpenChange,
  title = "エクスポート",
  format,
  onFormatChange,
  range,
  onRangeChange,
  includeHiddenColumns,
  onIncludeHiddenColumnsChange,
  rangeCounts,
  columnCounts,
  onExport,
  onCancel,
  exportLabel = "エクスポート",
  cancelLabel = "キャンセル",
  labels,
}: TableExportDialogProps) {
  const text = { ...DEFAULT_EXPORT_LABELS, ...labels };
  const currentFilterLabel =
    labels?.currentFilter?.(rangeCounts?.currentFilter) ??
    `現在の絞り込み (${(rangeCounts?.currentFilter ?? 0).toLocaleString()} 件)`;
  const selectedLabel =
    labels?.selected?.(rangeCounts?.selected) ??
    `選択中の ${(rangeCounts?.selected ?? 0).toLocaleString()} 件のみ`;
  const allLabel =
    labels?.all?.(rangeCounts?.all) ??
    `全件 (${(rangeCounts?.all ?? 0).toLocaleString()} 件)`;
  const visibleOnlyLabel =
    labels?.visibleOnly?.(columnCounts?.visible) ??
    `表示中の列のみ (${columnCounts?.visible ?? 0} 列)`;
  const includeHiddenLabel =
    labels?.includeHidden?.(columnCounts?.total) ??
    `隠している列も含む (全 ${columnCounts?.total ?? 0} 列)`;
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <>
          <Button
            variant="ghost"
            size="small"
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
          >
            {cancelLabel}
          </Button>
          <Button size="small" onClick={onExport}>
            {exportLabel}
          </Button>
        </>
      }
    >
      <div className="ie-card" style={{ border: 0, padding: 0, gap: 12 }}>
        <div>
          <div className="section-title">{text.format}</div>
          <RadioGroup
            orientation="vertical"
            value={format}
            onValueChange={(next) => onFormatChange(next as TableExportFormat)}
          >
            <Radio value="csv-utf8">{text.csvUtf8}</Radio>
            <Radio value="csv-shift-jis">{text.csvShiftJis}</Radio>
            <Radio value="xlsx">{text.xlsx}</Radio>
            <Radio value="pdf">{text.pdf}</Radio>
          </RadioGroup>
        </div>
        <div className="section">
          <div className="section-title">{text.range}</div>
          <RadioGroup
            orientation="vertical"
            value={range}
            onValueChange={(next) => onRangeChange(next as TableExportRange)}
          >
            <Radio value="current-filter">{currentFilterLabel}</Radio>
            <Radio value="selected">{selectedLabel}</Radio>
            <Radio value="all">{allLabel}</Radio>
          </RadioGroup>
        </div>
        <div className="section">
          <div className="section-title">{text.columns}</div>
          <label>
            <Checkbox
              checked={!includeHiddenColumns}
              onCheckedChange={(checked) =>
                onIncludeHiddenColumnsChange(checked !== true)
              }
            >
              {visibleOnlyLabel}
            </Checkbox>
          </label>
          <label data-muted={includeHiddenColumns ? "false" : "true"}>
            <Checkbox
              checked={includeHiddenColumns}
              onCheckedChange={(checked) =>
                onIncludeHiddenColumnsChange(checked === true)
              }
            >
              {includeHiddenLabel}
            </Checkbox>
          </label>
        </div>
      </div>
    </Dialog>
  );
}
