import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { pickGroupFieldA11y } from "../../lib/field-a11y";
import { Button } from "../general/button";
import { Pagination } from "../navigation/pagination";
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
  showSearch,
  showSelectAll,
  filterOption,
  render,
  pagination,
  disabled,
  searchPlaceholder,
  emptyText,
  direction,
}: {
  title?: React.ReactNode;
  items: TransferItemProp[];
  selectedKeys: string[];
  onSelectChange: (keys: string[]) => void;
  showSearch?: boolean;
  showSelectAll: boolean;
  filterOption?: TransferProp["filterOption"];
  render?: TransferProp["render"];
  pagination?: TransferProp["pagination"];
  disabled?: boolean;
  searchPlaceholder: string;
  emptyText: string;
  direction: "left" | "right";
}) {
  const { t } = useTranslation();
  const titleId = React.useId();
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim();
    if (!q) return items;
    // antd `filterOption` gets the TRIMMED query and the item, in that order, and owns the whole
    // decision — including case handling, which a domain match (an employee number, a SKU) may
    // legitimately want to keep.
    if (filterOption) return items.filter((item) => filterOption(q, item));
    const needle = q.toLowerCase();
    return items.filter((item) => {
      const titleMatch = reactNodeText(item.title).toLowerCase().includes(needle);
      const descMatch = item.description
        ? reactNodeText(item.description).toLowerCase().includes(needle)
        : false;
      return titleMatch || descMatch;
    });
  }, [items, query, filterOption]);

  const [page, setPage] = React.useState(1);
  const pageSize =
    typeof pagination === "object" ? Math.max(1, Math.floor(pagination.pageSize ?? 10)) : 10;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = pagination
    ? filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filtered;
  const enabledItems = visible.filter((i) => !i.disabled);
  const allChecked =
    enabledItems.length > 0 && enabledItems.every((i) => selectedKeys.includes(i.key));
  const indeterminate = !allChecked && enabledItems.some((i) => selectedKeys.includes(i.key));

  const toggleKey = (key: string, checked: boolean) => {
    onSelectChange(checked ? [...selectedKeys, key] : selectedKeys.filter((k) => k !== key));
  };

  return (
    <div className="ui-transfer-pane">
      <div className="ui-transfer-pane-header">
        {/* NOT a `<label>`. Checkbox is itself a `<label>` wrapping a real `<input>`, and a label
            nested inside a label is invalid HTML: the browser resolves neither, so the box loses
            its accessible name (axe `label`) and a click stops reaching the control. The name is
            carried by the box's own `aria-label` instead. */}
        <div className="ui-transfer-pane-check">
          {showSelectAll ? (
            <Checkbox
              checked={allChecked ? true : indeterminate ? "indeterminate" : false}
              disabled={Boolean(disabled) || enabledItems.length === 0}
              onCheckedChange={(v) => {
                const keys = enabledItems.map((item) => item.key);
                onSelectChange(
                  v === true
                    ? [...new Set([...selectedKeys, ...keys])]
                    : selectedKeys.filter((key) => !keys.includes(key)),
                );
              }}
              aria-label={
                direction === "left"
                  ? t("dataEntry.transfer.selectAllSource")
                  : t("dataEntry.transfer.selectAllTarget")
              }
            />
          ) : null}
          <span id={titleId}>{title}</span>
        </div>
        <span className="text-muted-foreground text-xs">
          {selectedKeys.length}/{filtered.length}
        </span>
      </div>
      {showSearch && (
        <div className="ui-transfer-search" data-disabled={disabled ? "" : undefined}>
          <SearchInput
            onSearch={(next) => {
              setQuery(next);
              setPage(1);
            }}
            disabled={disabled}
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
            visible.map((item) => (
              <li key={item.key}>
                {/* Same reason as the pane header above: the row must NOT WRAP a Checkbox that is
                    already a `<label>`. The row text becomes a `for=`-associated label BESIDE the
                    box instead — the shape Checkbox.Group's own option rows already use — so the
                    box keeps its accessible name AND the whole row stays clickable. */}
                <div
                  className={cn(
                    "ui-transfer-row",
                    "hover:bg-accent hover:text-accent-foreground",
                    item.disabled && "bg-muted/40 text-muted-foreground pointer-events-none",
                  )}
                >
                  <Checkbox
                    id={`${titleId}-${item.key}-box`}
                    checked={selectedKeys.includes(item.key)}
                    disabled={Boolean(disabled) || Boolean(item.disabled)}
                    onCheckedChange={(v) => toggleKey(item.key, v === true)}
                    aria-labelledby={`${titleId}-${item.key}`}
                    className="ui-transfer-row-check"
                  />
                  <label
                    className="ui-transfer-row-body"
                    id={`${titleId}-${item.key}`}
                    htmlFor={`${titleId}-${item.key}-box`}
                  >
                    {/* antd `render` replaces the row BODY only. The checkbox, the `htmlFor`
                        association and the hit area stay ours, so a custom row cannot end up
                        unlabelled or unclickable. */}
                    {render ? (
                      render(item)
                    ) : (
                      <>
                        <span className="block truncate font-medium">{item.title}</span>
                        {item.description && (
                          <span className="ui-transfer-row-description text-muted-foreground block truncate">
                            {item.description}
                          </span>
                        )}
                      </>
                    )}
                  </label>
                </div>
              </li>
            ))
          )}
        </ul>
      </ScrollArea>
      {pagination && filtered.length > pageSize ? (
        <Pagination
          value={currentPage}
          pageSize={pageSize}
          total={filtered.length}
          onValueChange={setPage}
          showSizeChanger={false}
          simple
          disabled={disabled}
        />
      ) : null}
    </div>
  );
}

export function Transfer({
  dataSource,
  targetKeys: legacyTargetKeys,
  value,
  defaultValue,
  name,
  readOnly,
  pagination,
  defaultTargetKeys,
  onValueChange,
  titles,
  showSearch,
  showSelectAll = true,
  filterOption,
  render,
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
  // Controlled/uncontrolled target keys (controlled-triad rule, spelled in antd's names):
  // `targetKeys` wins when provided, otherwise internal state seeded from `defaultTargetKeys`.
  // `onValueChange` fires on BOTH paths, so a controlled consumer stays in sync either way.
  const [internalTargetKeys, setInternalTargetKeys] = React.useState<string[]>(
    defaultValue ?? defaultTargetKeys ?? [],
  );
  const targetKeysProp = value ?? legacyTargetKeys;
  const isTargetControlled = targetKeysProp !== undefined;
  const targetKeys = isTargetControlled ? targetKeysProp : internalTargetKeys;

  const sourceItems = dataSource.filter((item) => !targetKeys.includes(item.key));
  const targetItems = dataSource.filter((item) => targetKeys.includes(item.key));

  const setSelected = (side: 0 | 1, keys: string[]) => {
    const next: [string[], string[]] = side === 0 ? [keys, selected[1]] : [selected[0], keys];
    if (!selectedKeysProp) setInternalSelected(next);
    onSelectChange?.(next[0], next[1]);
  };

  const move = (direction: "right" | "left") => {
    const fromSide = direction === "right" ? 0 : 1;
    if (disabled || readOnly) return;
    const available = direction === "right" ? sourceItems : targetItems;
    const keys = selected[fromSide].filter((key) =>
      available.some((item) => item.key === key && !item.disabled),
    );
    if (!keys.length) return;

    const nextTarget =
      direction === "right"
        ? [...targetKeys, ...keys.filter((k) => !targetKeys.includes(k))]
        : targetKeys.filter((k) => !keys.includes(k));

    if (!isTargetControlled) setInternalTargetKeys(nextTarget);
    onValueChange?.(nextTarget, direction, keys);
    const cleared: [string[], string[]] = fromSide === 0 ? [[], selected[1]] : [selected[0], []];
    if (!selectedKeysProp) setInternalSelected(cleared);
    onSelectChange?.(cleared[0], cleared[1]);
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
      {name && !disabled
        ? targetKeys.map((key) => <input key={key} type="hidden" name={name} value={key} />)
        : null}
      <TransferPanel
        direction="left"
        title={leftTitle}
        items={sourceItems}
        selectedKeys={selected[0]}
        onSelectChange={(keys) => setSelected(0, keys)}
        showSearch={showSearch}
        showSelectAll={showSelectAll}
        filterOption={filterOption}
        render={render}
        disabled={disabled || readOnly}
        pagination={pagination}
        searchPlaceholder={t("dataEntry.transfer.searchPlaceholder")}
        emptyText={t("dataEntry.transfer.empty")}
      />

      <div className="ui-transfer-actions">
        <Button
          type="button"
          size="icon"
          variant="outline"
          disabled={Boolean(disabled || readOnly) || selected[0].length === 0}
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
            disabled={Boolean(disabled || readOnly) || selected[1].length === 0}
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
        showSearch={showSearch}
        showSelectAll={showSelectAll}
        filterOption={filterOption}
        render={render}
        disabled={disabled || readOnly}
        pagination={pagination}
        searchPlaceholder={t("dataEntry.transfer.searchPlaceholder")}
        emptyText={t("dataEntry.transfer.empty")}
      />
    </div>
  );
}
