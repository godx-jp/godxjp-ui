// dev-only — Enum / EnumRef renderer. Inline enum + shared enum
// schema both end up rendering through the same Tag/Select path.

import type { ReactNode } from "react";
import { Select } from "../../../src/components/data-entry/Select";
import { Tag } from "../../../src/components/data-display/Tag";
import type { EnumPropertyDef, EnumRefPropertyDef, PropertyDef } from "../schemaTypes";
import { enumOptions, enumValueLabel, localize } from "../loadObjects";
import type { FieldEditCtx, FieldViewCtx } from "./index";

const COLOR_BY_VALUE: Record<string, string> = {
  "new": "info",
  "working": "warning",
  "qualified": "success",
  "unqualified": "default",
  "prospecting": "info",
  "qualification": "warning",
  "proposal": "primary",
  "negotiation": "primary",
  "closed-won": "success",
  "closed-lost": "error",
  "admin": "primary",
  "manager": "info",
  "sales": "default",
};

function options(prop: PropertyDef, locale: "ja" | "en"): Array<{ value: string; label: string }> {
  if (prop.type === "EnumRef") {
    return enumOptions((prop as EnumRefPropertyDef).enum, locale);
  }
  if (prop.type === "Enum") {
    return (prop as EnumPropertyDef).enum.map((v) =>
      typeof v === "string"
        ? { value: v, label: v }
        : { value: v.value, label: localize(v.label, locale, v.value) },
    );
  }
  return [];
}

function labelFor(prop: PropertyDef, value: string, locale: "ja" | "en"): string {
  if (prop.type === "EnumRef") {
    return enumValueLabel((prop as EnumRefPropertyDef).enum, value, locale);
  }
  if (prop.type === "Enum") {
    const match = (prop as EnumPropertyDef).enum.find((v) =>
      typeof v === "string" ? v === value : v.value === value,
    );
    if (typeof match === "string") return match;
    if (match) return localize(match.label, locale, value);
  }
  return value;
}

export function view(ctx: FieldViewCtx): ReactNode {
  if (ctx.value == null || ctx.value === "") {
    return <span style={{ color: "var(--muted-foreground)" }}>—</span>;
  }
  const stringValue = String(ctx.value);
  const label = labelFor(ctx.prop, stringValue, ctx.locale);
  const color = (COLOR_BY_VALUE[stringValue] ?? "default") as
    | "default" | "success" | "warning" | "error" | "info" | "attention" | "primary";
  return <Tag color={color}>{label}</Tag>;
}

export function edit(ctx: FieldEditCtx): ReactNode {
  const opts = options(ctx.prop, ctx.locale);
  return (
    <Select
      value={(ctx.value as string) ?? ""}
      onValueChange={(next: string) => ctx.onChange(next)}
      options={opts.map((o) => ({ value: o.value, label: o.label }))}
      placeholder="—"
    />
  );
}
