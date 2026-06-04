import * as React from "react";
import { Check, ChevronRight, ChevronsUpDown, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { ScrollArea, ScrollBar } from "../data-display/scroll-area";
import { Checkbox } from "./checkbox";
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

  const commitSingle = (path: string[]) => {
    if (!isControlledSingle) setInternalSingle(path);
    onValueChange?.(path, getNodeByPath(options, path));
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
    if (hasChildren && !changeOnSelect) {
      setActivePath(path);
      return;
    }
    if (multiple) {
      commitMulti(togglePath(multiValue, path));
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
    setOpen(next);
    if (!next) {
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
            onMouseLeave={
              expandTrigger === "hover"
                ? () => setActivePath(activePath.slice(0, colIndex))
                : undefined
            }
          >
            {col.map((node) => {
              const path = [...activePath.slice(0, colIndex), node.value];
              const hasChildren = (node.children?.length ?? 0) > 0 && node.isLeaf !== true;
              const active = activePath[colIndex] === node.value;
              const selected = multiple
                ? pathInValues(path, multiValue)
                : pathsEqual(path, singleValue);

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
                      expandTrigger === "hover" && hasChildren
                        ? () => setActivePath(path)
                        : undefined
                    }
                    onClick={() => !node.disabled && handleSelectNode(node, path)}
                  >
                    {multiple && (
                      <Checkbox
                        checked={selected}
                        disabled={node.disabled}
                        className="me-1"
                        aria-hidden
                        tabIndex={-1}
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

  return (
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
            "w-full justify-between font-normal",
            !displayLabel && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{displayLabel ?? resolvedPlaceholder}</span>
          <span className="ms-2 flex shrink-0 items-center gap-1">
            {allowClear && displayLabel && !disabled && (
              <button
                type="button"
                aria-label={t("dataEntry.cascader.clear")}
                className="flex size-4 items-center justify-center rounded-sm opacity-50 hover:opacity-100 focus-visible:opacity-100"
                onClick={clearValue}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
            <ChevronsUpDown className="size-4 opacity-50" aria-hidden="true" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto min-w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        {showSearch && (
          <div className="border-b p-2">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={t("dataEntry.cascader.searchPlaceholder")}
                value={search}
                onValueChange={setSearch}
              />
            </Command>
          </div>
        )}
        {isSearching ? (
          <ScrollArea className="max-h-[min(300px,50vh)]">
            <div className="p-1" role="listbox" aria-multiselectable={multiple ? true : undefined}>
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
                        <Checkbox checked={selected} className="me-2" aria-hidden tabIndex={-1} />
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
  );
}
