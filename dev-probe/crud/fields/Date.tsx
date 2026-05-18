// dev-only — Date / DateTime / Time / Timestamp renderers.
// Edit mode uses native HTML inputs through Input primitive
// (DateField/TimeField from @godxjp/ui are not the right shape for
// arbitrary ISO strings without going through @internationalized/date).

import type { ReactNode } from "react";
import { Input } from "../../../src/components/data-entry/Input";
import type { FieldEditCtx, FieldViewCtx } from "./index";

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

function fmtDate(d: Date, locale: string): string {
  return d.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" });
}

function fmtDateTime(d: Date, locale: string): string {
  return d.toLocaleString(locale, {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtTime(d: Date, locale: string): string {
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

export function view(ctx: FieldViewCtx): ReactNode {
  const d = toDate(ctx.value);
  const localeTag = ctx.locale === "ja" ? "ja-JP" : "en-US";
  if (!d) return <span style={{ color: "var(--muted-foreground)" }}>—</span>;
  if (ctx.prop.type === "Date") return <span>{fmtDate(d, localeTag)}</span>;
  if (ctx.prop.type === "Time") return <span>{fmtTime(d, localeTag)}</span>;
  return <span>{fmtDateTime(d, localeTag)}</span>;
}

function toDateInput(value: unknown): string {
  const d = toDate(value);
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

function toDateTimeInput(value: unknown): string {
  const d = toDate(value);
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toTimeInput(value: unknown): string {
  const d = toDate(value);
  if (!d) {
    if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function editDate(ctx: FieldEditCtx): ReactNode {
  return (
    <Input
      type="date"
      value={toDateInput(ctx.value)}
      onChange={(e) => {
        const v = e.currentTarget.value;
        ctx.onChange(v ? v : null);
      }}
      status={ctx.invalid ? "error" : undefined}
    />
  );
}

export function editDateTime(ctx: FieldEditCtx): ReactNode {
  return (
    <Input
      type="datetime-local"
      value={toDateTimeInput(ctx.value)}
      onChange={(e) => {
        const v = e.currentTarget.value;
        if (!v) {
          ctx.onChange(null);
        } else {
          ctx.onChange(new Date(v).toISOString());
        }
      }}
      status={ctx.invalid ? "error" : undefined}
    />
  );
}

export function editTime(ctx: FieldEditCtx): ReactNode {
  return (
    <Input
      type="time"
      value={toTimeInput(ctx.value)}
      onChange={(e) => ctx.onChange(e.currentTarget.value || null)}
      status={ctx.invalid ? "error" : undefined}
    />
  );
}
