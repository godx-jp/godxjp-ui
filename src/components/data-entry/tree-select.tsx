import * as React from "react";
import { ChevronDown, ChevronRight, ChevronsUpDown, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { controlOpenRingClass } from "../../lib/control-styles";
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
  onValueChange,
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
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const treeItemRefs = React.useRef(new Map<string, HTMLDivElement | null>());

  const selected = isControlled ? toArray(value) : internal;

  const resolvedPlaceholder = placeholder ?? t("dataEntry.treeSelect.placeholder");

  const visible = React.useMemo(() => {
    if (showSearch && search.trim()) return filterVisibleTree(options, search);
    return flattenVisibleTree(options, expandedKeys);
  }, [options, expandedKeys, search, showSearch]);

  const commit = (next: string[]) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(checkable || multiple ? next : (next[0] ?? undefined));
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

  // The roving-tabindex anchor: the active treeitem, falling back to the first visible node so
  // exactly one treeitem is in the Tab order at all times (WAI-ARIA APG tree pattern).
  const rovingKey =
    (activeKey && visible.some(({ node }) => node.value === activeKey) ? activeKey : null) ??
    visible[0]?.node.value ??
    null;

  // Move DOM focus to the active treeitem after it changes (keyboard navigation only).
  React.useEffect(() => {
    if (!open || !activeKey) return;
    treeItemRefs.current.get(activeKey)?.focus();
  }, [activeKey, open, visible]);

  const focusByOffset = (currentValue: string, delta: number) => {
    const index = visible.findIndex(({ node }) => node.value === currentValue);
    if (index === -1) return;
    const next = visible[index + delta];
    if (next) setActiveKey(next.node.value);
  };

  const onTreeItemKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    node: NormalizedTreeOption,
    hasChildren: boolean,
    expanded: boolean,
  ) => {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        focusByOffset(node.value, 1);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        focusByOffset(node.value, -1);
        break;
      }
      case "ArrowRight": {
        event.preventDefault();
        if (hasChildren && !expanded) {
          toggleExpand(node.value);
        } else if (hasChildren && expanded) {
          focusByOffset(node.value, 1);
        }
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        if (hasChildren && expanded) {
          toggleExpand(node.value);
        }
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        toggleSelect(node);
        break;
      }
      default:
        break;
    }
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
            controlOpenRingClass,
            !displayKeys.length && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {displayKeys.length ? displayLabel : resolvedPlaceholder}
          </span>
          {/* ONE trailing icon: the clear (×) replaces the chevron while a value is selected;
              a click on the field still opens the tree panel. */}
          <span className="ms-2 flex shrink-0 items-center">
            {allowClear && displayKeys.length > 0 && !disabled ? (
              <button
                type="button"
                aria-label={t("dataEntry.treeSelect.clear")}
                className="flex size-4 items-center justify-center rounded-sm opacity-50 hover:opacity-100 focus-visible:opacity-100"
                onClick={clearValue}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <ChevronsUpDown className="size-4 opacity-50" aria-hidden="true" />
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        {/* CommandInput already draws ONE bottom separator + its own inline padding — don't
            wrap it in another bordered/padded box (that double-borders the search row). */}
        {showSearch && (
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={t("dataEntry.treeSelect.searchPlaceholder")}
              value={search}
              onValueChange={setSearch}
            />
          </Command>
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
                    ref={(el) => {
                      treeItemRefs.current.set(node.value, el);
                    }}
                    role="treeitem"
                    tabIndex={node.disabled ? -1 : rovingKey === node.value ? 0 : -1}
                    aria-expanded={hasChildren ? expanded : undefined}
                    aria-selected={isSelected}
                    onFocus={() => setActiveKey(node.value)}
                    onKeyDown={(event) => onTreeItemKeyDown(event, node, hasChildren, expanded)}
                    className={cn(
                      "flex items-center rounded-sm py-1.5 pe-2 text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1",
                      isSelected && "bg-accent/60",
                      node.disabled && "pointer-events-none opacity-50",
                    )}
                    style={{ paddingInlineStart: `${depth * 1.25 + 0.5}rem` }}
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
                        "me-1 flex size-5 shrink-0 items-center justify-center rounded-sm",
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
                          tabIndex={-1}
                          disabled={Boolean(node.disabled) || Boolean(node.disableCheckbox)}
                          onCheckedChange={() => toggleSelect(node)}
                        />
                        <span className="truncate">{node.label}</span>
                      </label>
                    ) : (
                      <button
                        type="button"
                        tabIndex={-1}
                        className="flex-1 truncate text-start"
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
