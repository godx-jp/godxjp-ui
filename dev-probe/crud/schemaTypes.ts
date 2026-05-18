// dev-only — TS types mirroring the omnify schema shape.
// Not bundled / not exported anywhere outside dev-probe/.

export type Locale = "ja" | "en";

export type LocalizedString = string | Partial<Record<Locale, string>>;

export type PropertyType =
  | "String" | "Email" | "Password"
  | "TinyInt" | "Int" | "BigInt" | "Float" | "Decimal"
  | "Boolean"
  | "Text" | "MediumText" | "LongText"
  | "Date" | "DateTime" | "Time"
  | "Timestamp"
  | "Json"
  | "Enum" | "EnumRef"
  | "File"
  | "Association"
  | "Uuid"
  | "Point" | "Coordinates";

export interface BasePropertyDef {
  type: PropertyType;
  displayName?: LocalizedString;
  placeholder?: LocalizedString;
  required?: boolean;
  unique?: boolean;
  default?: unknown;
  precision?: number;
  scale?: number;
  length?: number;
}

export interface EnumRefPropertyDef extends BasePropertyDef {
  type: "EnumRef";
  enum: string;
}

export interface InlineEnumValue {
  value: string;
  label?: LocalizedString;
}

export interface EnumPropertyDef extends BasePropertyDef {
  type: "Enum";
  enum: Array<string | InlineEnumValue>;
}

export type AssociationRelation =
  | "OneToOne" | "OneToMany" | "ManyToOne" | "ManyToMany"
  | "MorphTo" | "MorphOne" | "MorphMany" | "MorphToMany" | "MorphedByMany";

export interface AssociationPropertyDef extends BasePropertyDef {
  type: "Association";
  relation: AssociationRelation;
  target: string;
  targets?: string[];
}

export type PropertyDef =
  | BasePropertyDef
  | EnumRefPropertyDef
  | EnumPropertyDef
  | AssociationPropertyDef;

export interface SchemaOptionsDef {
  id?: boolean | "BigInt" | "Int" | "Uuid" | "Ulid" | "String";
  primaryKey?: string | string[];
  timestamps?: boolean;
  softDelete?: boolean;
  tableName?: string;
  authenticatable?: boolean;
  hidden?: boolean;
}

export interface ObjectSchema {
  name: string;
  kind?: "object";
  displayName?: LocalizedString;
  titleIndex?: string;
  group?: string;
  options?: SchemaOptionsDef;
  properties: Record<string, PropertyDef>;
}

export interface EnumValue {
  value: string;
  label?: LocalizedString;
}

export interface EnumSchema {
  name: string;
  kind: "enum";
  displayName?: LocalizedString;
  values: Array<string | EnumValue>;
}

export type AnyRecord = {
  id: string;
  [key: string]: unknown;
};
