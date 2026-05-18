// dev-only — Association (ManyToOne) renderer.
// Resolves the referenced record's title-index via the schema's
// `titleIndex` property (falls back to `name` / `id`).

import type { ReactNode } from "react";
import { Select } from "../../../src/components/data-entry/Select";
import type { AssociationPropertyDef, AnyRecord } from "../schemaTypes";
import { listRecords } from "../store";
import { OBJECTS_BY_NAME } from "../loadObjects";
import { navigate, routes } from "../routes";
import type { FieldEditCtx, FieldViewCtx } from "./index";

export function resolveTitle(targetName: string, id: unknown): string {
  if (!id) return "";
  const records = listRecords(targetName);
  const rec = records.find((r) => r.id === id);
  if (!rec) return String(id);
  const target = OBJECTS_BY_NAME[targetName];
  const idxKey = target?.titleIndex ?? "name";
  const raw = (rec as AnyRecord)[idxKey];
  if (raw != null && raw !== "") return String(raw);
  // Compose lastName + firstName for Contact-like
  if (rec["lastName"] != null) {
    return [rec["lastName"], rec["firstName"]].filter(Boolean).join(" ");
  }
  return String(rec.id);
}

export function view(ctx: FieldViewCtx): ReactNode {
  const target = (ctx.prop as AssociationPropertyDef).target;
  if (ctx.value == null || ctx.value === "") {
    return <span style={{ color: "var(--muted-foreground)" }}>—</span>;
  }
  const title = resolveTitle(target, ctx.value);
  return (
    <a
      href={`#${routes.detail(target, String(ctx.value))}`}
      onClick={(e) => {
        e.preventDefault();
        navigate(routes.detail(target, String(ctx.value)));
      }}
      style={{ color: "var(--primary)" }}
    >
      {title}
    </a>
  );
}

export function edit(ctx: FieldEditCtx): ReactNode {
  const target = (ctx.prop as AssociationPropertyDef).target;
  const records = listRecords(target);
  const opts = records
    .map((r) => ({ value: r.id, label: resolveTitle(target, r.id) }))
    .sort((a, b) => a.label.localeCompare(b.label));
  return (
    <Select
      value={(ctx.value as string) ?? ""}
      onValueChange={(next: string) => ctx.onChange(next)}
      options={opts}
      placeholder={ctx.locale === "ja" ? "選択…" : "Select…"}
    />
  );
}
