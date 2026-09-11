import type {
  SearchSelectOptionProp,
  SelectFieldNamesProp,
  SelectOptionGroupProp,
} from "../props/components/data-entry.prop";

/**
 * One list of rows, whatever shape the call site had.
 *
 * `Select` accepts three spellings of the same thing and they all have to arrive at the engine as
 * ONE flat array, or every feature downstream (filtering, `maxCount`, the hidden `<option>` list)
 * would need to know about all three:
 *
 *   • this library's flat rows, `{ value, label, group? }`
 *   • antd's nested groups, `{ label, options: [...] }`
 *   • a foreign row read through `fieldNames`, `{ id, name, children }`
 *
 * Written once, here, rather than in both `select.tsx` and `search-select.tsx` — the two branches
 * of one component must not disagree about what an option is. Group headings survive as the flat
 * `group` string the rows already carried, so a grouped list renders identically whichever
 * spelling produced it.
 */

/** A row whose keys are not known ahead of time — what `fieldNames` exists to read. */
type RawOption = Record<string, unknown>;

function text(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }
  return "";
}

/**
 * `undefined` for anything that is not a group, so a row carrying its own `options` key by accident
 * (a foreign payload naming something else `options`) is only read as a group when `fieldNames`
 * actually pointed there.
 */
function groupChildren(option: RawOption, optionsKey: string): RawOption[] | undefined {
  const children = option[optionsKey];
  return Array.isArray(children) ? (children as RawOption[]) : undefined;
}

export function normalizeSelectOptions(
  options: readonly (SearchSelectOptionProp | SelectOptionGroupProp | RawOption)[] | undefined,
  fieldNames?: SelectFieldNamesProp,
): SearchSelectOptionProp[] {
  if (!options?.length) return [];
  const labelKey = fieldNames?.label ?? "label";
  const valueKey = fieldNames?.value ?? "value";
  const optionsKey = fieldNames?.options ?? "options";
  const groupLabelKey = fieldNames?.groupLabel ?? labelKey;
  const disabledKey = fieldNames?.disabled ?? "disabled";

  const flat: SearchSelectOptionProp[] = [];
  const push = (raw: RawOption, group: string | undefined) => {
    const value = text(raw[valueKey]);
    const label = text(raw[labelKey]);
    flat.push({
      ...(raw as Partial<SearchSelectOptionProp>),
      value,
      // A row with no label reads as its own value — the id is at least identifiable, where an
      // empty row is not selectable by sight or by type-to-select.
      label: label || value,
      disabled: raw[disabledKey] === true || undefined,
      // A row inside a group takes the group's heading; a flat row keeps the `group` it declared.
      group: group ?? (typeof raw.group === "string" ? raw.group : undefined),
    });
  };

  for (const entry of options as RawOption[]) {
    const children = groupChildren(entry, optionsKey);
    if (children) {
      const heading = text(entry[groupLabelKey]) || undefined;
      for (const child of children) push(child, heading);
      continue;
    }
    push(entry, undefined);
  }
  return flat;
}
