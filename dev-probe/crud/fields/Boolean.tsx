// dev-only — Boolean renderer.

import type { ReactNode } from "react";
import { Switch } from "../../../src/components/data-entry/Switch";
import { Tag } from "../../../src/components/data-display/Tag";
import type { FieldEditCtx, FieldViewCtx } from "./index";

export function view(ctx: FieldViewCtx): ReactNode {
  const truthy = ctx.value === true || ctx.value === "true";
  return truthy ? (
    <Tag color="success">{ctx.locale === "ja" ? "はい" : "Yes"}</Tag>
  ) : (
    <Tag color="default">{ctx.locale === "ja" ? "いいえ" : "No"}</Tag>
  );
}

export function edit(ctx: FieldEditCtx): ReactNode {
  const checked = ctx.value === true || ctx.value === "true";
  return (
    <Switch
      checked={checked}
      onCheckedChange={(next: boolean) => ctx.onChange(next)}
    />
  );
}
