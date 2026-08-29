import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { pickGroupFieldA11y } from "../../lib/field-a11y";
import { Button } from "../general/button";
import { ScrollArea } from "../data-display/scroll-area";
import { Checkbox } from "./checkbox";
import { SearchInput } from "./search-input";
import { reactNodeText } from "./tree-utils";
import type { TransferItemProp, TransferProp } from "../../props/components/data-entry.prop";

export type {
  TransferProp,
  TransferProp as TransferProps,
  TransferItemProp,
} from "../../props/components/data-entry.prop";

function TransferPanel({
  title,
  items,
  selectedKeys,
  onSelectChange,
  onSelectAll,
  showSearch,
  disabled,
  searchPlaceholder,
  emptyText,
  direction,
}: {
  title?: React.ReactNode;
  items: TransferItemProp[];
  selectedKeys: string[];
  onSelectChange: (keys: string[]) => void;
  onSelectAll: (checked: boolean) => void;
  showSearch?: boolean;
  disabled?: boolean;
  searchPlaceholder: string;
  emptyText: string;
  direction: "left" | "right";
}) {
  const { t } = useTranslation();
  const titleId = React.useId();
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const titleMatch = reactNodeText(item.title).toLowerCase().includes(q);
      const descMatch = item.description
        ? reactNodeText(item.description).toLowerCase().includes(q)
        : false;
      return titleMatch || descMatch;
    });
  }, [items, query]);

  const enabledItems = filtered.filter((i) => !i.disabled);
  const allChecked =
    enabledItems.length > 0 && enabledItems.every((i) => selectedKeys.includes(i.key));
  const indeterminate = !allChecked && enabledItems.some((i) => selectedKeys.includes(i.key));

  const toggleKey = (key: string, checked: boolean) => {
    onSelectChange(checked ? [...selectedKeys, key] : selectedKeys.filter((k) => k !== key));
  };

  return (
    <div className="ui-transfer-pane">
      <div className="ui-transfer-pane-header">
        <label className="ui-transfer-pane-check">
          <Checkbox
            checked={allChecked ? true : indeterminate ? "indeterminate" : false}
            disabled={Boolean(disabled) || enabledItems.length === 0}
            onCheckedChange={(v) => onSelectAll(v === true)}
            aria-label={
              direction === "left"
                ? t("dataEntry.transfer.selectAllSource")
                : t("dataEntry.transfer.selectAllTarget")
            }
          />
          <span id={titleId}>{title}</span>
        </label>
        <span className="text-muted-foreground text-xs">
          {selectedKeys.length}/{filtered.length}
        </span>
      </div>
      {showSearch && (
        <div className="ui-transfer-search" data-disabled={disabled ? "" : undefined}>
          <SearchInput
            onSearch={setQuery}
            placeholder={searchPlaceholder}
            ariaLabel={searchPlaceholder}
            debounce={0}
          />
        </div>
      )}
      <ScrollArea className="flex-1">
        <ul className="ui-transfer-list" aria-labelledby={titleId}>
          {filtered.length === 0 ? (
            <li className="ui-transfer-empty">{emptyText}</li>
          ) : (
            filtered.map((item) => (
              <li key={item.key}>
                <label
                  className={cn(
                    "ui-transfer-row",
                    "hover:bg-accent hover:text-accent-foreground",
                    item.disabled && "bg-muted/40 text-muted-foreground pointer-events-none",
                  )}
                >
                  <Checkbox
                    checked={selectedKeys.includes(item.key)}
                    disabled={Boolean(disabled) || Boolean(item.disabled)}
                    onCheckedChange={(v) => toggleKey(item.key, v === true)}
                    className="ui-transfer-row-check"
                  />
                  <span className="ui-transfer-row-body">
                    <span className="block truncate font-medium">{item.title}</span>
                    {item.description && (
                      <span className="ui-transfer-row-description text-muted-foreground block truncate">
                        {item.description}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            ))
          )}
        </ul>
      </ScrollArea>
    </div>
  );
}

export function Transfer({
  dataSource,
  targetKeys,
  onValueChange,
  titles,
  showSearch,
  oneWay,
  disabled,
  id,
  className,
  selectedKeys: selectedKeysProp,
  onSelectChange,
  ...ariaProps
}: TransferProp) {
  const { t } = useTranslation();
  // Transfer is a dual-list shuttle with no single focus target — the root is a role="group"
  // named by the FormField label; pickGroupFieldA11y forwards aria-labelledby/-describedby (error
  // folded in). Each panel/list keeps its own title-derived label.
  const groupA11y = pickGroupFieldA11y(ariaProps);
  const [internalSelected, setInternalSelected] = React.useState<[string[], string[]]>([[], []]);
  const selected: [string[], string[]] = selectedKeysProp ?? internalSelected;

  const sourceItems = dataSource.filter((item) => !targetKeys.includes(item.key));
  const targetItems = dataSource.filter((item) => targetKeys.includes(item.key));

  const setSelected = (side: 0 | 1, keys: string[]) => {
    const next: [string[], string[]] = side === 0 ? [keys, selected[1]] : [selected[0], keys];
    if (selectedKeysProp) onSelectChange?.(next[0], next[1]);
    else setInternalSelected(next);
  };

  const move = (direction: "right" | "left") => {
    const fromSide = direction === "right" ? 0 : 1;
    const keys = selected[fromSide];
    if (!keys.length) return;

    const nextTarget =
      direction === "right"
        ? [...targetKeys, ...keys.filter((k) => !targetKeys.includes(k))]
        : targetKeys.filter((k) => !keys.includes(k));

    onValueChange?.(nextTarget, direction, keys);
    const cleared: [string[], string[]] = fromSide === 0 ? [[], selected[1]] : [selected[0], []];
    if (selectedKeysProp) onSelectChange?.(cleared[0], cleared[1]);
    else setInternalSelected(cleared);
  };

  const leftTitle = titles?.[0] ?? t("dataEntry.transfer.source");
  const rightTitle = titles?.[1] ?? t("dataEntry.transfer.target");

  return (
    <div
      role="group"
      id={id}
      {...groupA11y}
      aria-disabled={disabled ? true : undefined}
      className={cn("ui-transfer", className)}
    >
      <TransferPanel
        direction="left"
        title={leftTitle}
        items={sourceItems}
        selectedKeys={selected[0]}
        onSelectChange={(keys) => setSelected(0, keys)}
        onSelectAll={(checked) =>
          setSelected(0, checked ? sourceItems.filter((i) => !i.disabled).map((i) => i.key) : [])
        }
        showSearch={showSearch}
        disabled={disabled}
        searchPlaceholder={t("dataEntry.transfer.searchPlaceholder")}
        emptyText={t("dataEntry.transfer.empty")}
      />

      <div className="ui-transfer-actions">
        <Button
          type="button"
          size="icon"
          variant="outline"
          disabled={Boolean(disabled) || selected[0].length === 0}
          aria-label={t("dataEntry.transfer.moveRight")}
          onClick={() => move("right")}
        >
          <ChevronRight className="ui-transfer-action-icon" aria-hidden="true" />
        </Button>
        {!oneWay && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={Boolean(disabled) || selected[1].length === 0}
            aria-label={t("dataEntry.transfer.moveLeft")}
            onClick={() => move("left")}
          >
            <ChevronLeft className="ui-transfer-action-icon" aria-hidden="true" />
          </Button>
        )}
      </div>

      <TransferPanel
        direction="right"
        title={rightTitle}
        items={targetItems}
        selectedKeys={selected[1]}
        onSelectChange={(keys) => setSelected(1, keys)}
        onSelectAll={(checked) =>
          setSelected(1, checked ? targetItems.filter((i) => !i.disabled).map((i) => i.key) : [])
        }
        showSearch={showSearch}
        disabled={disabled}
        searchPlaceholder={t("dataEntry.transfer.searchPlaceholder")}
        emptyText={t("dataEntry.transfer.empty")}
      />
    </div>
  );
}
