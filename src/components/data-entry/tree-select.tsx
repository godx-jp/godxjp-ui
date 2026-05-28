import * as React from "react";
import { ChevronDown, ChevronRight, ChevronsUpDown, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { ScrollArea } from "../data-display/scroll-area";
import { Checkbox } from "./checkbox";
import { Command, CommandInput } from "./command";
import {
  collectAllExpandableKeys,
  filterVisibleTree,
  findNodeByValue,
  flattenVisibleTree,
  getDescendantValues,
  normalizeTreeOptions,
  reactNodeText,
  type NormalizedTreeOption,
} from "./tree-utils";
import type { TreeSelectProp } from "../../props/components/data-entry.prop";

export type {
  TreeSelectProp,
  TreeSelectProp as TreeSelectProps,
} from "../../props/components/data-entry.prop";
export { SHOW_CHILD, SHOW_PARENT, SHOW_ALL } from "./tree-select-strategy";

import { SHOW_CHILD, SHOW_PARENT, SHOW_ALL } from "./tree-select-strategy";

function toArray(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function displayValues(
  values: string[],
  options: NormalizedTreeOption[],
  showCheckedStrategy: TreeSelectProp["showCheckedStrategy"],
  treeCheckStrictly?: boolean,
): string[] {
  if (treeCheckStrictly || showCheckedStrategy === SHOW_ALL) return values;
  if (showCheckedStrategy === SHOW_PARENT) {
    const filtered = values.filter((v) => {
      const node = findNodeByValue(options, v);
      if (!node?.children?.length) return true;
      const desc = getDescendantValues(node).slice(1);
      return !desc.every((d) => values.includes(d));
    });
    return filtered.length ? filtered : values;
  }
  // SHOW_CHILD — hide parent when all children selected
  return values.filter((v) => {
    const node = findNodeByValue(options, v);
    return !node?.children?.length;
  });
}

function TreeSelectRoot({
  treeData: treeDataProp,
  value,
  defaultValue,
  onChange,
  multiple,
  treeCheckable,
  treeCheckStrictly,
  showSearch,
  showCheckedStrategy = SHOW_CHILD,
  treeDefaultExpandAll,
  placeholder,
  disabled,
  allowClear = true,
  className,
  id,
  fieldNames,
}: TreeSelectProp) {
  const { t } = useTranslation();
  const options = React.useMemo(
    () => normalizeTreeOptions(treeDataProp as Record<string, unknown>[], fieldNames),
    [treeDataProp, fieldNames],
  );

  const checkable = treeCheckable ?? multiple;
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [expandedKeys, setExpandedKeys] = React.useState<Set<string>>(
    () => new Set(treeDefaultExpandAll ? collectAllExpandableKeys(options) : []),
  );

  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<string[]>(() => toArray(defaultValue));

  const selected = isControlled ? toArray(value) : internal;

  const resolvedPlaceholder = placeholder ?? t("dataEntry.treeSelect.placeholder");

  const visible = React.useMemo(() => {
    if (showSearch && search.trim()) return filterVisibleTree(options, search);
    return flattenVisibleTree(options, expandedKeys);
  }, [options, expandedKeys, search, showSearch]);

  const commit = (next: string[]) => {
    if (!isControlled) setInternal(next);
    onChange?.(checkable || multiple ? next : (next[0] ?? undefined));
  };

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSelect = (node: NormalizedTreeOption) => {
    if (node.disabled) return;
    const key = node.value;

    if (!checkable && !multiple) {
      commit([key]);
      setOpen(false);
      return;
    }

    const isOn = selected.includes(key);
    let next: string[];

    if (treeCheckStrictly) {
      next = isOn ? selected.filter((v) => v !== key) : [...selected, key];
    } else {
      const related = getDescendantValues(node);
      next = isOn
        ? selected.filter((v) => !related.includes(v))
        : [...new Set([...selected, ...related])];
    }

    commit(next);
  };

  const displayKeys = displayValues(selected, options, showCheckedStrategy, treeCheckStrictly);
  const displayLabel = displayKeys
    .map((v) => {
      const label = findNodeByValue(options, v)?.label;
      return label ? reactNodeText(label) : v;
    })
    .join(", ");

  const clearValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    commit([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !displayKeys.length && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {displayKeys.length ? displayLabel : resolvedPlaceholder}
          </span>
          <span className="ml-2 flex shrink-0 items-center gap-1">
            {allowClear && displayKeys.length > 0 && !disabled && (
              <X
                className="size-4 opacity-50 hover:opacity-100"
                aria-hidden="true"
                onClick={clearValue}
              />
            )}
            <ChevronsUpDown className="size-4 opacity-50" aria-hidden="true" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        {showSearch && (
          <div className="border-b p-2">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={t("dataEntry.treeSelect.searchPlaceholder")}
                value={search}
                onValueChange={setSearch}
              />
            </Command>
          </div>
        )}
        <ScrollArea className="max-h-[min(300px,50vh)]">
          <div
            role="tree"
            aria-multiselectable={Boolean(checkable) || Boolean(multiple)}
            className="p-1"
          >
            {visible.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                {t("dataEntry.treeSelect.empty")}
              </p>
            ) : (
              visible.map(({ node, depth, hasChildren }) => {
                const expanded = expandedKeys.has(node.value);
                const isSelected = selected.includes(node.value);
                return (
                  <div
                    key={node.value}
                    role="treeitem"
                    aria-expanded={hasChildren ? expanded : undefined}
                    aria-selected={isSelected}
                    className={cn(
                      "flex items-center rounded-sm py-1.5 pr-2 text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent/60",
                      node.disabled && "pointer-events-none opacity-50",
                    )}
                    style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={
                        expanded
                          ? t("dataEntry.treeSelect.collapse")
                          : t("dataEntry.treeSelect.expand")
                      }
                      className={cn(
                        "mr-1 flex size-5 shrink-0 items-center justify-center rounded-sm",
                        !hasChildren && "invisible",
                      )}
                      onClick={() => toggleExpand(node.value)}
                    >
                      {expanded ? (
                        <ChevronDown className="size-4" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="size-4" aria-hidden="true" />
                      )}
                    </button>
                    {checkable ? (
                      <label className="flex flex-1 cursor-pointer items-center gap-2">
                        <Checkbox
                          checked={isSelected}
                          disabled={Boolean(node.disabled) || Boolean(node.disableCheckbox)}
                          onCheckedChange={() => toggleSelect(node)}
                        />
                        <span className="truncate">{node.label}</span>
                      </label>
                    ) : (
                      <button
                        type="button"
                        className="flex-1 truncate text-left"
                        disabled={node.disabled}
                        onClick={() => toggleSelect(node)}
                      >
                        {node.label}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export const TreeSelect = Object.assign(TreeSelectRoot, {
  SHOW_CHILD,
  SHOW_PARENT,
  SHOW_ALL,
});
