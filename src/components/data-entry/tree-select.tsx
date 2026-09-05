import * as React from "react";
import { ChevronDown, ChevronRight, ChevronsUpDown, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { pickFieldA11y, useFieldIdentity } from "../../lib/field-a11y";
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
  ...ariaProps
}: TreeSelectProp) {
  const { t } = useTranslation();
  // Forward the FormField label/helper/error contract onto the combobox trigger (focus target).
  const fieldA11y = pickFieldA11y(ariaProps);
  // This control has
  // no native-submit path at all (documented: read the value through onValueChange), so only
  // `data-field` is resolved here — there is no element a `name` could honestly go on.
  const identity = useFieldIdentity({ id, "data-field": fieldA11y["data-field"] });
  const reactId = React.useId();
  const treeId = `${id ?? reactId}-tree`;
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
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            id={id}
            data-field={fieldA11y["data-field"] ?? identity["data-field"]}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="tree"
            aria-controls={open ? treeId : undefined}
            {...fieldA11y}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              allowClear && displayKeys.length > 0 && !disabled && "ui-tree-select-trigger-affixed",
              controlOpenRingClass,
              !displayKeys.length && "text-muted-foreground",
              className,
            )}
          >
            <span className="truncate">
              {displayKeys.length ? displayLabel : resolvedPlaceholder}
            </span>
            <span className="ms-2 flex shrink-0 items-center">
              {!(allowClear && displayKeys.length > 0 && !disabled) && (
                <ChevronsUpDown className="ui-tree-select-chevron" aria-hidden="true" />
              )}
            </span>
          </Button>
        </PopoverTrigger>
        {allowClear && displayKeys.length > 0 && !disabled && (
          <button
            type="button"
            aria-label={t("dataEntry.treeSelect.clear")}
            className="ui-tree-select-clear"
            onClick={clearValue}
          >
            <X className="ui-control-affix-icon" aria-hidden="true" />
          </button>
        )}
      </div>
      <PopoverContent className="ui-tree-select-popover" align="start">
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
        <ScrollArea className="ui-tree-select-list">
          <div
            id={treeId}
            role="tree"
            aria-multiselectable={Boolean(checkable) || Boolean(multiple)}
            className="ui-tree-select-panel"
          >
            {visible.length === 0 ? (
              <p className="ui-tree-select-empty">{t("dataEntry.treeSelect.empty")}</p>
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
                    data-selected={isSelected ? "true" : "false"}
                    data-disabled={node.disabled ? "" : undefined}
                    className="ui-tree-select-row ui-focus-ring"
                    // Depth drives the indent through a token, so a service can retune the step
                    // (or flatten it) without touching this component.
                    style={{ "--tree-select-depth": depth } as React.CSSProperties}
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={
                        expanded
                          ? t("dataEntry.treeSelect.collapse")
                          : t("dataEntry.treeSelect.expand")
                      }
                      data-leaf={hasChildren ? undefined : ""}
                      className="ui-tree-select-toggle"
                      onClick={() => toggleExpand(node.value)}
                    >
                      {expanded ? (
                        <ChevronDown className="ui-tree-select-toggle-icon" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="ui-tree-select-toggle-icon" aria-hidden="true" />
                      )}
                    </button>
                    {checkable ? (
                      <label className="ui-tree-select-label">
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
