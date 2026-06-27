import * as React from "react";
import { Check, ChevronRight, ChevronsUpDown, Minus, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { controlOpenRingClass } from "../../lib/control-styles";
import { Button } from "../general/button";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { ScrollArea, ScrollBar } from "../data-display/scroll-area";
import { Command, CommandInput } from "./command";
import {
  filterTreeOptions,
  formatPathLabels,
  getNodeByPath,
  normalizeTreeOptions,
  pathKey,
  pathsEqual,
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
 * <button> (invalid HTML / hydration error). Selection is driven by the option button; this only
 * mirrors its checked state visually, so a styled span is the correct element.
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
      className={cn(
        "ui-checkbox inline-flex items-center justify-center",
        // The shared CSS fills the box for [data-state=checked]; mirror that fill for the
        // indeterminate ("some children selected") state so a partial parent reads as partial.
        "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        disabled && "cursor-not-allowed opacity-50",
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
  className,
  id,
  expandTrigger = "click",
  fieldNames,
  allowClear = true,
}: CascaderProp) {
  const { t } = useTranslation();
  const options = React.useMemo(
    () => normalizeTreeOptions(optionsProp as Record<string, unknown>[], fieldNames),
    [optionsProp, fieldNames],
  );

  const [open, setOpen] = React.useState(false);
  const [activePath, setActivePath] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");

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

  const displayLabel = React.useMemo(() => {
    if (multiple) {
      if (!multiValue.length) return null;
      return multiValue.map((path) => formatPathLabels(getNodeByPath(options, path))).join(", ");
    }
    if (!singleValue.length) return null;
    return formatPathLabels(getNodeByPath(options, singleValue));
  }, [multiple, multiValue, singleValue, options]);

  const setSingleValue = (path: string[]) => {
    if (!isControlledSingle) setInternalSingle(path);
    onValueChange?.(path, getNodeByPath(options, path));
  };

  const commitSingle = (path: string[]) => {
    setSingleValue(path);
    setOpen(false);
    setActivePath([]);
    setSearch("");
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
    if (multiple) {
      // A parent without changeOnSelect only expands; otherwise the path itself is toggled.
      if (hasChildren && !changeOnSelect) setActivePath(path);
      // `disableCheckbox` disables selection of THIS path (the checkbox) while leaving the node
      // navigable — honor it like TreeSelect does; never toggle a checkbox-disabled path.
      else if (!node.disableCheckbox) commitMulti(togglePath(multiValue, path));
      return;
    }
    if (hasChildren) {
      // changeOnSelect: commit the intermediate node as the value BUT keep the panel open and
      // expand its children, so the user can refine deeper without reopening. Without it, a
      // parent click only expands (no commit). Either way the panel must NOT close here —
      // closing on a parent click strands the user one level up and breaks drilling.
      if (changeOnSelect) setSingleValue(path);
      setActivePath(path);
      return;
    }
    // Leaf → commit and close.
    commitSingle(path);
  };

  const isSearching = showSearch && search.trim().length > 0;

  const searchResults = React.useMemo(
    () => (isSearching ? filterTreeOptions(options, search) : []),
    [options, search, isSearching],
  );

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      // Seed the columns to the current selection so an existing value is VISIBLE and
      // re-pickable the moment the panel opens — not hidden behind a collapsed root column.
      // Single mode has one path to expand to; multiple has no single path, so stay at root.
      setActivePath(multiple ? [] : singleValue);
    } else {
      setSearch("");
      setActivePath([]);
    }
  };

  const clearValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) commitMulti([]);
    else commitSingle([]);
  };

  const renderCascadeColumns = () => (
    <ScrollArea className="w-full">
      <div className="flex max-h-[min(280px,50vh)]">
        {columns.map((col, colIndex) => (
          <ul
            key={colIndex}
            role="listbox"
            aria-orientation="vertical"
            aria-multiselectable={multiple ? true : undefined}
            className="min-w-[9rem] border-e last:border-e-0"
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
                    className={cn(
                      "flex w-full items-center gap-1 px-3 py-2 text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      active && "bg-accent/70 font-medium",
                      node.disabled && "pointer-events-none opacity-50",
                    )}
                    onMouseEnter={
                      // Hover-expand: a parent opens its children column; a leaf collapses any
                      // deeper column but keeps its own. Never collapse on the column's mouseleave
                      // — moving the pointer toward the next column would strand the deeper levels
                      // and make a depth-3 leaf unreachable.
                      expandTrigger === "hover" && !node.disabled
                        ? () => setActivePath(hasChildren ? path : path.slice(0, -1))
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
                      <Check className="me-1 size-4 shrink-0" aria-hidden="true" />
                    )}
                    <span className="flex-1 truncate text-start">{node.label}</span>
                    {hasChildren && (
                      <ChevronRight className="size-4 shrink-0 opacity-50" aria-hidden="true" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );

  const showClear = allowClear && displayLabel && !disabled;

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-start font-normal",
              controlOpenRingClass,
              // Reserve trailing room for the single clear-or-chevron overlay rendered below.
              "pe-9",
              !displayLabel && "text-muted-foreground",
            )}
          >
            <span className="truncate">{displayLabel ?? resolvedPlaceholder}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto min-w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
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
            <ScrollArea className="max-h-[min(300px,50vh)]">
              <div
                className="p-1"
                role="listbox"
                aria-multiselectable={multiple ? true : undefined}
              >
                {searchResults.length === 0 ? (
                  <p className="text-muted-foreground py-6 text-center text-sm">
                    {t("dataEntry.cascader.empty")}
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
                          "flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                          "hover:bg-accent hover:text-accent-foreground",
                          selected && "bg-accent/60",
                        )}
                        onClick={() => handleSelectNode({ value: path.at(-1)!, label }, path)}
                      >
                        {multiple ? (
                          <CheckboxVisual checked={selected} className="me-2" />
                        ) : (
                          <Check
                            className={cn(
                              "me-2 size-4 shrink-0",
                              selected ? "opacity-100" : "opacity-0",
                            )}
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
      <div className="pointer-events-none absolute inset-y-0 end-3 flex items-center">
        {showClear ? (
          <button
            type="button"
            aria-label={t("dataEntry.cascader.clear")}
            className="pointer-events-auto flex size-4 items-center justify-center rounded-sm opacity-50 hover:opacity-100 focus-visible:opacity-100"
            onClick={clearValue}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : (
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
