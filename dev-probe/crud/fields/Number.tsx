// dev-only — Int / BigInt / Float / Decimal renderers.

import type { ReactNode } from "react";
import { InputNumber } from "../../../src/components/data-entry/InputNumber";
import type { FieldEditCtx, FieldViewCtx } from "./index";

function fmt(value: unknown, prop: { type: string; scale?: number }): string {
  if (value == null || value === "") return "—";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return String(value);
  if (prop.type === "Decimal") {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: prop.scale ?? 2,
      maximumFractionDigits: prop.scale ?? 2,
    });
  }
  return num.toLocaleString();
}

export function view(ctx: FieldViewCtx): ReactNode {
  const text = fmt(ctx.value, ctx.prop);
  if (text === "—") return <span style={{ color: "var(--muted-foreground)" }}>—</span>;
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{text}</span>;
}

export function edit(ctx: FieldEditCtx): ReactNode {
  return (
    <InputNumber
      value={typeof ctx.value === "number" ? ctx.value : undefined}
      onValueChange={(next) => ctx.onChange(next ?? 0)}
      status={ctx.invalid ? "error" : undefined}
    />
  );
}
