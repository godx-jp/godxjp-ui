// dev-only — Field renderer dispatcher (view + edit) keyed on property type.

import type { ReactNode } from "react";
import type { Locale, PropertyDef } from "../schemaTypes";
import * as StringField from "./String";
import * as NumberField from "./Number";
import * as BooleanField from "./Boolean";
import * as DateField from "./Date";
import * as EnumField from "./Enum";
import * as AssociationField from "./Association";

export interface FieldContext {
  locale: Locale;
}

export interface FieldEditCtx extends FieldContext {
  value: unknown;
  onChange: (next: unknown) => void;
  prop: PropertyDef;
  propName: string;
  invalid?: boolean;
}

export interface FieldViewCtx extends FieldContext {
  value: unknown;
  prop: PropertyDef;
  propName: string;
}

function placeholderView(value: unknown): ReactNode {
  if (value == null || value === "") return <span style={{ color: "var(--muted-foreground)" }}>—</span>;
  return String(value);
}

export function renderFieldView(ctx: FieldViewCtx): ReactNode {
  const { prop } = ctx;
  switch (prop.type) {
    case "String":
    case "Email":
    case "Text":
    case "MediumText":
    case "LongText":
    case "Password":
    case "Uuid":
      return StringField.view(ctx);
    case "TinyInt": case "Int": case "BigInt": case "Float": case "Decimal":
      return NumberField.view(ctx);
    case "Boolean":
      return BooleanField.view(ctx);
    case "Date": case "DateTime": case "Time": case "Timestamp":
      return DateField.view(ctx);
    case "Enum": case "EnumRef":
      return EnumField.view(ctx);
    case "Association":
      return AssociationField.view(ctx);
    default:
      return (
        <span style={{ color: "var(--muted-foreground)", fontStyle: "italic", fontSize: 12 }}>
          (unsupported: {prop.type}) {placeholderView(ctx.value)}
        </span>
      );
  }
}

export function renderFieldEdit(ctx: FieldEditCtx): ReactNode {
  const { prop } = ctx;
  switch (prop.type) {
    case "String": case "Email": case "Password": case "Uuid":
      return StringField.edit(ctx);
    case "Text": case "MediumText": case "LongText":
      return StringField.editLong(ctx);
    case "TinyInt": case "Int": case "BigInt": case "Float": case "Decimal":
      return NumberField.edit(ctx);
    case "Boolean":
      return BooleanField.edit(ctx);
    case "Date":
      return DateField.editDate(ctx);
    case "DateTime": case "Timestamp":
      return DateField.editDateTime(ctx);
    case "Time":
      return DateField.editTime(ctx);
    case "Enum": case "EnumRef":
      return EnumField.edit(ctx);
    case "Association":
      return AssociationField.edit(ctx);
    default:
      return (
        <span style={{ color: "var(--muted-foreground)", fontStyle: "italic", fontSize: 12 }}>
          (unsupported edit: {prop.type})
        </span>
      );
  }
}
