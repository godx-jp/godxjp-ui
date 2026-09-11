import * as React from "react";
import { Check, ChevronRight, ChevronsUpDown, Loader2, Minus, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { pickFieldA11y, useFieldIdentity } from "../../lib/field-a11y";
import { controlSurfaceTriggerClass } from "../../lib/control-styles";
import {
  applyMaxTagCount,
  controlSurfaceAttrs,
  resolveAllowClear,
  resolveAriaInvalid,
} from "./control-surface";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { ScrollArea } from "../data-display/scroll-area";
import { Command, CommandInput } from "./command";
import {
  filterTreeOptions,
  formatPathLabels,
  getNodeByPath,
  normalizeTreeOptions,
  pathKey,
  pathsEqual,
  reactNodeText,
  type NormalizedTreeOption,
} from "./tree-utils";
import type { CascaderProp } from "../../props/components/data-entry.prop";

export type {
  CascaderProp,
  CascaderProp as CascaderProps,
} from "../../props/components/data-entry.prop";
export type { TreeOption, TreeFieldNames } from "./tree-utils";

function pathInValues(path: string[], values: string[][]): boolean {
  return values.some((v) => pathsEqual(v, path));
}

function togglePath(values: string[][], path: string[]): string[][] {
  if (pathInValues(path, values)) return values.filter((v) => !pathsEqual(v, path));
  return [...values, path];
}

/**
 * Decorative checkbox glyph — a non-interactive <span>, NOT the real Checkbox (which is a
 * <button>). The cascade option row is itself a <button>, and a <button> may not contain a
 * <button> (invalid HTML / hydration error).
 */
function CheckboxVisual({
  checked,
  indeterminate,
  disabled,
  className,
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const state = indeterminate ? "indeterminate" : checked ? "checked" : "unchecked";
  return (
    <span
      aria-hidden="true"
      data-slot="checkbox"
      data-state={state}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "ui-checkbox inline-flex items-center justify-center",
        // The shared CSS fills the box for [data-state=checked]; mirror that fill for the
        // indeterminate ("some children selected") state so a partial parent reads as partial.
        "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",

        className,
      )}
    >
      {indeterminate ? (
        <Minus className="ui-checkbox-icon" aria-hidden="true" />
      ) : checked ? (
        <Check className="ui-checkbox-icon" aria-hidden="true" />
      ) : null}
    </span>
  );
}

/**
 * Aggregate the check state of a PARENT node from its selectable descendant leaves — the standard
 * checkable-tree affordance: all selected → "checked", some → "indeterminate", none → "none".
 * Disabled / checkbox-disabled leaves are excluded from the count (they can never be selected, so
 * they must not block a parent from reading as fully checked).
 */
function aggregateCheckState(
  node: NormalizedTreeOption,
  path: string[],
  values: string[][],
): "checked" | "indeterminate" | "none" {
  let total = 0;
  let selected = 0;
  const walk = (n: NormalizedTreeOption, p: string[]) => {
    const isLeaf = (n.children?.length ?? 0) === 0 || n.isLeaf === true;
    if (isLeaf) {
      if (n.disabled || n.disableCheckbox) return;
      total += 1;
      if (pathInValues(p, values)) selected += 1;
      return;
    }
    for (const child of n.children!) walk(child, [...p, child.value]);
  };
  for (const child of node.children ?? []) walk(child, [...path, child.value]);
  if (total === 0 || selected === 0) return "none";
  return selected === total ? "checked" : "indeterminate";
}

/** Every selectable leaf path under `node`, used to decide what a fully-checked parent stands for. */
function leafPathsUnder(node: NormalizedTreeOption, path: string[]): string[][] {
  const out: string[][] = [];
  const walk = (current: NormalizedTreeOption, prefix: string[]) => {
    const isLeaf = (current.children?.length ?? 0) === 0 || current.isLeaf === true;
    if (isLeaf) {
      out.push(prefix);
      return;
    }
    for (const child of current.children!) walk(child, [...prefix, child.value]);
  };
  walk(node, path);
  return out;
}

/**
 * antd `showCheckedStrategy: SHOW_PARENT` — replace every fully-checked branch with the branch
 * itself, shallowest first, and leave partially-checked branches listing their leaves.
 *
 * The ORDER of the original selection is preserved (each value maps to its representative, then
 * duplicates fall out) rather than rebuilt from a tree walk: the trigger label is read left to
 * right, and re-sorting it on every check would move labels the user was still looking at.
 */
function collapseToParents(values: string[][], options: NormalizedTreeOption[]): string[][] {
  const representative = new Map<string, string[]>();
  const walk = (nodes: NormalizedTreeOption[], prefix: string[]) => {
    for (const node of nodes) {
      const path = [...prefix, node.value];
      const hasChildren = (node.children?.length ?? 0) > 0 && node.isLeaf !== true;
      if (!hasChildren) continue;
      if (aggregateCheckState(node, path, values) === "checked") {
        for (const leaf of leafPathsUnder(node, path)) representative.set(pathKey(leaf), path);
        continue; // shallowest wins — do not descend into an already-collapsed branch
      }
      walk(node.children!, path);
    }
  };
  walk(options, []);

  const out: string[][] = [];
  for (const value of values) {
    const shown = representative.get(pathKey(value)) ?? value;
    if (!out.some((existing) => pathsEqual(existing, shown))) out.push(shown);
  }
  return out;
}

export function Cascader({
  options: optionsProp,
  value,
  defaultValue,
  onValueChange,
  multiple,
  changeOnSelect,
  showSearch,
  placeholder,
  disabled,
  readOnly,
  name,
  className,
  id,
  expandTrigger = "click",
  fieldNames,
  allowClear,
  size,
  status,
  variant,
  loading = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  showCheckedStrategy = "SHOW_CHILD",
  loadData,
  displayRender,
  optionRender,
  maxTagCount,
  maxTagPlaceholder,
  notFoundContent,
  autoClearSearchValue = true,
  search: searchProp,
  onSearchChange,
  ...ariaProps
}: CascaderProp) {
  const { t } = useTranslation();
  // Forward the FormField label/helper/error contract onto the combobox trigger (focus target).
  const fieldA11y = pickFieldA11y(ariaProps);
  // `name` rides the hidden input(s) below (a combobox trigger is a <button>, which submits
  // nothing); only `data-field` continues on to the visible trigger.
  const identity = useFieldIdentity({ id, name, "data-field": fieldA11y["data-field"] });
  const resolvedName = name ?? identity.name;
  const reactId = React.useId();
  const panelId = `${id ?? reactId}-panel`;
  const options = React.useMemo(
    () => normalizeTreeOptions(optionsProp as Record<string, unknown>[], fieldNames),
    [optionsProp, fieldNames],
  );

  // Controlled/uncontrolled open (controlled-triad rule): `open` wins when provided, otherwise
  // internal state seeded from `defaultOpen`; `onOpenChange` fires either way.
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpenControlled = openProp !== undefined;
  const open = isOpenControlled ? openProp : internalOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );
  const [activePath, setActivePath] = React.useState<string[]>([]);
  // Controlled/uncontrolled search query — same triad.
  const [internalSearch, setInternalSearch] = React.useState("");
  const isSearchControlled = searchProp !== undefined;
  const search = isSearchControlled ? searchProp : internalSearch;
  const setSearch = React.useCallback(
    (next: string) => {
      if (!isSearchControlled) setInternalSearch(next);
      onSearchChange?.(next);
    },
    [isSearchControlled, onSearchChange],
  );
  // antd `loadData` fires ONCE per branch. Without this ledger every re-expand of the same node
  // would refetch, and a slow endpoint would be hammered by a user drilling up and down a column.
  const requestedLoads = React.useRef(new Set<string>());
  const requestLoad = React.useCallback(
    (path: string[], chain: NormalizedTreeOption[]) => {
      if (!loadData) return;
      const node = chain.at(-1);
      if (!node || node.isLeaf === true || (node.children?.length ?? 0) > 0) return;
      const key = pathKey(path);
      if (requestedLoads.current.has(key)) return;
      requestedLoads.current.add(key);
      void loadData(chain);
    },
    [loadData],
  );

  const isControlledSingle = !multiple && value !== undefined;
  const isControlledMulti = multiple && value !== undefined;
  const [internalSingle, setInternalSingle] = React.useState<string[]>(
    multiple ? [] : ((defaultValue as string[] | undefined) ?? []),
  );
  const [internalMulti, setInternalMulti] = React.useState<string[][]>(
    (defaultValue as string[][] | undefined) ?? [],
  );

  const singleValue = isControlledSingle ? (value as string[]) : internalSingle;
  const multiValue = isControlledMulti ? (value as string[][]) : internalMulti;

  const resolvedPlaceholder = placeholder ?? t("dataEntry.cascader.placeholder");

  const hasValue = multiple ? multiValue.length > 0 : singleValue.length > 0;

  const displayLabel = React.useMemo<React.ReactNode>(() => {
    if (multiple) {
      if (!multiValue.length) return null;
      // antd `showCheckedStrategy` — SHOW_PARENT collapses a fully-checked branch into the branch
      // itself, which is the difference between "東京 / 渋谷, 東京 / 新宿, 東京 / 港" and "東京".
      const shown =
        showCheckedStrategy === "SHOW_PARENT" ? collapseToParents(multiValue, options) : multiValue;
      const items = shown.map((path) => {
        const chain = getNodeByPath(options, path);
        const labels = chain.map((node) => reactNodeText(node.label));
        return {
          value: pathKey(path),
          label: displayRender ? displayRender(labels, chain) : formatPathLabels(chain),
        };
      });
      const { visible, omitted, overflow } = applyMaxTagCount(
        items,
        maxTagCount,
        maxTagPlaceholder,
      );
      const body = visible.map((item, index) => (
        <React.Fragment key={item.value}>
          {index > 0 ? ", " : null}
          {item.label}
        </React.Fragment>
      ));
      if (omitted.length === 0) return body;
      return (
        <>
          {body}
          {", "}
          <span data-slot="cascader-overflow">
            {overflow ?? t("dataEntry.selection.overflow", { count: omitted.length })}
          </span>
        </>
      );
    }
    if (!singleValue.length) return null;
    const chain = getNodeByPath(options, singleValue);
    // antd `displayRender` owns the whole trigger label for a single-value cascader.
    return displayRender
      ? displayRender(
          chain.map((node) => reactNodeText(node.label)),
          chain,
        )
      : formatPathLabels(chain);
  }, [
    multiple,
    multiValue,
    singleValue,
    options,
    showCheckedStrategy,
    displayRender,
    maxTagCount,
    maxTagPlaceholder,
    t,
  ]);

  const setSingleValue = (path: string[]) => {
    if (!isControlledSingle) setInternalSingle(path);
    onValueChange?.(path, getNodeByPath(options, path));
  };

  const commitSingle = (path: string[]) => {
    setSingleValue(path);
    setOpen(false);
    setActivePath([]);
    // antd `autoClearSearchValue` (default true) — `false` keeps the query so the next open
    // resumes the same filtered view instead of the full tree.
    if (autoClearSearchValue) setSearch("");
  };

  const commitMulti = (paths: string[][]) => {
    if (!isControlledMulti) setInternalMulti(paths);
    onValueChange?.(
      paths,
      paths.map((p) => getNodeByPath(options, p)),
    );
  };

  const columns: NormalizedTreeOption[][] = React.useMemo(() => {
    const cols: NormalizedTreeOption[][] = [options];
    for (const segment of activePath) {
      const col = cols.at(-1);
      const node = col?.find((n) => n.value === segment);
      if (node?.children?.length) cols.push(node.children);
      else break;
    }
    return cols;
  }, [options, activePath]);

  const handleSelectNode = (node: NormalizedTreeOption, path: string[]) => {
    const hasChildren = (node.children?.length ?? 0) > 0 && node.isLeaf !== true;
    // antd `loadData` — a branch with no children that is not declared a leaf is UNRESOLVED, not
    // empty. Asking for it here (and in the hover-expand handler) is what turns a 40,000-row
    // organisation tree into three requests.
    requestLoad(path, getNodeByPath(options, path));
    // `isLeaf: false` with no children is antd's marker for an UNRESOLVED branch. Committing it
    // as a value would be wrong twice over: it is not a leaf, and its children are still in
    // flight — so the click only expands, and the column fills in when `options` grows.
    if (loadData && node.isLeaf === false && !(node.children?.length ?? 0)) {
      setActivePath(path);
      return;
    }
    if (multiple) {
      // A parent without changeOnSelect only expands; otherwise the path itself is toggled.
      if (hasChildren && !changeOnSelect) setActivePath(path);
      // `disableCheckbox` disables selection of THIS path (the checkbox) while leaving the node
      // navigable — honor it like TreeSelect does; never toggle a checkbox-disabled path.
      else if (!node.disableCheckbox) commitMulti(togglePath(multiValue, path));
      return;
    }
    if (hasChildren) {
      // expand its children, so the user can refine deeper without reopening. Without it, a
      // Either way the panel must NOT close here —
      // closing on a parent click strands the user one level up and breaks drilling.
      if (changeOnSelect) setSingleValue(path);
      setActivePath(path);
      return;
    }
    commitSingle(path);
  };

  const isSearching = showSearch && search.trim().length > 0;

  const searchResults = React.useMemo(
    () => (isSearching ? filterTreeOptions(options, search) : []),
    [options, search, isSearching],
  );

  const handleOpenChange = (next: boolean) => {
    // Read-only never opens (no pick surface) — closing (next=false) still passes through so an
    // externally-forced close (e.g. Escape) is honored. Mirrors SearchSelect exactly.
    if (readOnly && next) return;
    setOpen(next);
    if (next) {
      // Seed the columns to the current selection so an existing value is VISIBLE and
      // re-pickable the moment the panel opens — not hidden behind a collapsed root column.
      // Single mode has one path to expand to; multiple has no single path, so stay at root.
      setActivePath(multiple ? [] : singleValue);
    } else {
      if (autoClearSearchValue) setSearch("");
      setActivePath([]);
    }
  };

  const clearValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) commitMulti([]);
    else commitSingle([]);
  };

  const renderCascadeColumns = () => (
    // `both`: the columns strip overflows sideways, and a tall column scrolls down. Under Radix
    // this was a vertical area plus a mounted `<ScrollBar orientation="horizontal" />`, which was
    // how Radix was told to open the second axis at all.
    <ScrollArea className="w-full" orientation="both">
      <div className="ui-cascader-columns">
        {columns.map((col, colIndex) => (
          <ul
            key={colIndex}
            role="listbox"
            aria-orientation="vertical"
            aria-multiselectable={multiple ? true : undefined}
            className="ui-cascader-column"
          >
            {col.map((node) => {
              const path = [...activePath.slice(0, colIndex), node.value];
              const hasChildren = (node.children?.length ?? 0) > 0 && node.isLeaf !== true;
              const active = activePath[colIndex] === node.value;
              const selected = multiple
                ? pathInValues(path, multiValue)
                : pathsEqual(path, singleValue);
              // A multiple-mode parent can't be path-selected (clicking it expands), so its
              // checkbox is a read-only aggregate of its descendant leaves: checked when all are
              // selected, indeterminate when only some.
              const aggregate =
                multiple && hasChildren ? aggregateCheckState(node, path, multiValue) : undefined;

              return (
                <li key={node.value} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    aria-haspopup={hasChildren ? "menu" : undefined}
                    aria-expanded={hasChildren ? active : undefined}
                    disabled={node.disabled}
                    data-disabled={node.disabled ? "" : undefined}
                    className={cn(
                      "ui-cascader-option",
                      "hover:bg-accent hover:text-accent-foreground",
                      active && "bg-accent/70 font-medium",
                    )}
                    onMouseEnter={
                      // Hover-expand: a parent opens its children column; a leaf collapses any
                      // deeper column but keeps its own. Never collapse on the column's mouseleave
                      // — moving the pointer toward the next column would strand the deeper levels
                      // and make a depth-3 leaf unreachable.
                      expandTrigger === "hover" && !node.disabled
                        ? () => {
                            const loadable = node.isLeaf === false && !(node.children?.length ?? 0);
                            requestLoad(path, getNodeByPath(options, path));
                            setActivePath(hasChildren || loadable ? path : path.slice(0, -1));
                          }
                        : undefined
                    }
                    onClick={() => !node.disabled && handleSelectNode(node, path)}
                  >
                    {multiple && (
                      <CheckboxVisual
                        checked={aggregate ? aggregate === "checked" : selected}
                        indeterminate={aggregate === "indeterminate"}
                        disabled={node.disabled || node.disableCheckbox}
                        className="me-1"
                      />
                    )}
                    {!multiple && selected && (
                      <Check className="ui-cascader-option-icon" aria-hidden="true" />
                    )}
                    <span className="flex-1 truncate text-start">
                      {/* antd `optionRender` owns the row body; the checkbox, the check mark and
                          the chevron stay with the component because they are affordances, not
                          content. */}
                      {optionRender ? optionRender(node) : node.label}
                    </span>
                    {(hasChildren || (loadData && node.isLeaf === false)) && (
                      <ChevronRight className="ui-cascader-option-chevron" aria-hidden="true" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </ScrollArea>
  );

  const clearControl = resolveAllowClear(allowClear, true, t("dataEntry.cascader.clear"));
  // Read-only keeps the value visible and submitted but offers no way to MUTATE it, so the clear
  // affordance goes with the panel.
  const showClear = clearControl.enabled && hasValue && !disabled && !readOnly && !loading;
  const surface = controlSurfaceAttrs({ variant, status, size });

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          {/* Nút gốc chứ không phải <Button>: một trigger mở popup phải đọc token của .ui-control
              (viền, bóng, cỡ chữ, vòng focus) như Select và DatePicker, chứ không đọc token của
              nút. */}
          <button
            id={id}
            data-field={fieldA11y["data-field"] ?? identity["data-field"]}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={open ? panelId : undefined}
            {...fieldA11y}
            {...surface}
            aria-invalid={resolveAriaInvalid(fieldA11y["aria-invalid"], status)}
            aria-busy={loading || undefined}
            aria-readonly={readOnly || undefined}
            disabled={disabled}
            className={cn(
              controlSurfaceTriggerClass,
              "w-full justify-start",
              // Reserve trailing room for the single clear-or-chevron overlay rendered below.
              "ui-control-trigger-affixed",
              !hasValue && "text-muted-foreground",
            )}
          >
            <span className="truncate">{hasValue ? displayLabel : resolvedPlaceholder}</span>
          </button>
        </PopoverTrigger>
        {/* Hidden field(s) so the selection submits with a native form. A path is joined with `/`;
            `multiple` emits ONE field per path under the same name — the native `<select multiple>`
            contract every server-side form parser already understands. */}
        {resolvedName
          ? (multiple ? multiValue : singleValue.length ? [singleValue] : []).map((path, index) => (
              <input
                key={`${pathKey(path)}-${index}`}
                type="hidden"
                name={resolvedName}
                value={path.join("/")}
                readOnly
              />
            ))
          : null}
        <PopoverContent id={panelId} className="ui-cascader-popover" align="start">
          {/* CommandInput already draws ONE bottom separator + its own inline padding — don't
              wrap it in another bordered/padded box (that double-borders the search row). */}
          {showSearch && (
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={t("dataEntry.cascader.searchPlaceholder")}
                value={search}
                onValueChange={setSearch}
              />
            </Command>
          )}
          {isSearching ? (
            <ScrollArea className="ui-cascader-list">
              <div
                className="ui-cascader-panel"
                role="listbox"
                aria-multiselectable={multiple ? true : undefined}
              >
                {searchResults.length === 0 ? (
                  <p className="ui-cascader-empty">
                    {notFoundContent ?? t("dataEntry.cascader.empty")}
                  </p>
                ) : (
                  searchResults.map(({ path, labels }) => {
                    const label = labels.join(" / ");
                    const selected = multiple
                      ? pathInValues(path, multiValue)
                      : pathsEqual(path, singleValue);
                    return (
                      <button
                        key={pathKey(path)}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={cn(
                          "ui-cascader-result",
                          "hover:bg-accent hover:text-accent-foreground",
                          selected && "bg-accent/60",
                        )}
                        onClick={() => handleSelectNode({ value: path.at(-1)!, label }, path)}
                      >
                        {multiple ? (
                          <CheckboxVisual checked={selected} className="me-2" />
                        ) : (
                          <Check
                            className="ui-cascader-result-icon"
                            data-selected={selected ? "true" : "false"}
                            aria-hidden="true"
                          />
                        )}
                        <span className="truncate text-start">{label}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          ) : (
            renderCascadeColumns()
          )}
        </PopoverContent>
      </Popover>
      {/* Clear + chevron render OUTSIDE the trigger <button> — a <button> may not nest inside a
          <button> (invalid HTML → hydration error). The overlay ignores pointer events so a click
          falls through to the trigger to open it; only the clear control re-enables them. */}
      {/* ONE trailing icon: the clear (×) replaces the chevron while a value is selected; a
          click on the field still opens the panel (the chevron is only an affordance). */}
      <div className="ui-control-affix ui-cascader-affix">
        {loading ? (
          <Loader2
            data-slot="cascader-loading"
            className="ui-control-affix-icon ui-control-affix-indicator animate-spin"
            aria-hidden="true"
          />
        ) : showClear ? (
          <button
            type="button"
            aria-label={clearControl.label}
            className="ui-control-affix-action"
            onClick={clearValue}
          >
            {clearControl.clearIcon ?? <X className="ui-control-affix-icon" aria-hidden="true" />}
          </button>
        ) : (
          <ChevronsUpDown
            className="ui-control-affix-icon ui-control-affix-indicator"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
