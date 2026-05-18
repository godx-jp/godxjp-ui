// dev-only — module-time loader. Bundles every objects/*.json at build time.
// Not exported beyond dev-probe/.

import type { EnumSchema, EnumValue, Locale, LocalizedString, ObjectSchema } from "./schemaTypes";

import Account from "../objects/Account.json";
import Contact from "../objects/Contact.json";
import Lead from "../objects/Lead.json";
import Opportunity from "../objects/Opportunity.json";
import Activity from "../objects/Activity.json";
import User from "../objects/User.json";

import Industry from "../objects/enums/Industry.json";
import LeadStatus from "../objects/enums/LeadStatus.json";
import LeadSource from "../objects/enums/LeadSource.json";
import OpportunityStage from "../objects/enums/OpportunityStage.json";
import ActivityKind from "../objects/enums/ActivityKind.json";
import UserRole from "../objects/enums/UserRole.json";

// Order in the sidebar / list view.
export const OBJECTS: ObjectSchema[] = [
  Account as unknown as ObjectSchema,
  Contact as unknown as ObjectSchema,
  Lead as unknown as ObjectSchema,
  Opportunity as unknown as ObjectSchema,
  Activity as unknown as ObjectSchema,
  User as unknown as ObjectSchema,
];

export const OBJECTS_BY_NAME: Record<string, ObjectSchema> = Object.fromEntries(
  OBJECTS.map((o) => [o.name, o])
);

export const ENUMS: EnumSchema[] = [
  Industry as unknown as EnumSchema,
  LeadStatus as unknown as EnumSchema,
  LeadSource as unknown as EnumSchema,
  OpportunityStage as unknown as EnumSchema,
  ActivityKind as unknown as EnumSchema,
  UserRole as unknown as EnumSchema,
];

export const ENUMS_BY_NAME: Record<string, EnumSchema> = Object.fromEntries(
  ENUMS.map((e) => [e.name, e])
);

export function localize(value: LocalizedString | undefined, locale: Locale, fallback = ""): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value;
  return value[locale] ?? value.ja ?? value.en ?? fallback;
}

export function objectLabel(obj: ObjectSchema, locale: Locale): string {
  return localize(obj.displayName, locale, obj.name);
}

export function propertyLabel(
  obj: ObjectSchema,
  propName: string,
  locale: Locale,
): string {
  const prop = obj.properties[propName];
  return localize(prop?.displayName, locale, propName);
}

export function enumValueLabel(
  enumName: string,
  value: string,
  locale: Locale,
): string {
  const e = ENUMS_BY_NAME[enumName];
  if (!e) return value;
  for (const v of e.values) {
    if (typeof v === "string") {
      if (v === value) return v;
    } else if ((v as EnumValue).value === value) {
      return localize((v as EnumValue).label, locale, value);
    }
  }
  return value;
}

export function enumOptions(
  enumName: string,
  locale: Locale,
): Array<{ value: string; label: string }> {
  const e = ENUMS_BY_NAME[enumName];
  if (!e) return [];
  return e.values.map((v) =>
    typeof v === "string"
      ? { value: v, label: v }
      : { value: v.value, label: localize(v.label, locale, v.value) }
  );
}
