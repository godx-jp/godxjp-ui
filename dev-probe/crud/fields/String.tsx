// dev-only — String / Email / Password / Text renderers.

import type { ReactNode } from "react";
import { Input, Textarea } from "../../../src/components/data-entry/Input";
import type { FieldEditCtx, FieldViewCtx } from "./index";

export function view(ctx: FieldViewCtx): ReactNode {
  const value = ctx.value;
  if (value == null || value === "") {
    return <span style={{ color: "var(--muted-foreground)" }}>—</span>;
  }
  if (ctx.prop.type === "Email") {
    return (
      <a href={`mailto:${value}`} style={{ color: "var(--primary)" }}>
        {String(value)}
      </a>
    );
  }
  if (ctx.prop.type === "Password") {
    return <span>••••••••</span>;
  }
  if (ctx.prop.type === "LongText" || ctx.prop.type === "MediumText" || ctx.prop.type === "Text") {
    return <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{String(value)}</pre>;
  }
  return <span>{String(value)}</span>;
}

export function edit(ctx: FieldEditCtx): ReactNode {
  const inputType = ctx.prop.type === "Email" ? "email" : ctx.prop.type === "Password" ? "password" : "text";
  return (
    <Input
      type={inputType}
      value={(ctx.value as string) ?? ""}
      onChange={(e) => ctx.onChange(e.currentTarget.value)}
      status={ctx.invalid ? "error" : undefined}
    />
  );
}

export function editLong(ctx: FieldEditCtx): ReactNode {
  return (
    <Textarea
      rows={4}
      value={(ctx.value as string) ?? ""}
      onChange={(e) => ctx.onChange(e.currentTarget.value)}
      status={ctx.invalid ? "error" : undefined}
    />
  );
}
