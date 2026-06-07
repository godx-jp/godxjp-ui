import * as React from "react";
import { ChevronsUpDown, Loader2 } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { controlOpenRingClass } from "../../lib/control-styles";
import { Button } from "../general/button";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "./command";
import { Input } from "./input";
import type {
  SearchSelectProp,
  SearchSelectOptionProp,
} from "../../props/components/data-entry.prop";

export type {
  SearchSelectProp,
  SearchSelectProp as SearchSelectProps,
  SearchSelectOptionProp,
  SearchSelectOptionProp as SearchSelectOption,
  SearchSelectLoadParamsProp,
  SearchSelectLoadResultProp,
} from "../../props/components/data-entry.prop";

const DEBOUNCE_MS = 250;

/**
 * SearchSelect — a searchable single-select combobox with a debounced search box, optional
 * optgroup-style grouping (`option.group`), and loading/empty states. Drive it EITHER remotely
 * with `loadOptions({ query, page })` (server search + infinite scroll) OR with a static
 * `options` array (client-side filter) — the latter supersedes the legacy `Autocomplete`.
 * Custom per-option rendering via `renderOption` (Ant-Design style). Form-submittable via
 * `name`; e2e-testable by the trigger's `data-testid` + each option's `${data-testid}-option-${value}`.
 */
export function SearchSelect({
  value: valueProp,
  defaultValue,
  onValueChange,
  options: staticOptions,
  loadOptions,
  renderOption,
  selectedLabel,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  loadingMessage,
  clearLabel,
  clearable = true,
  disabled = false,
  name,
  id,
  className,
  "data-testid": dataTestId,
}: SearchSelectProp) {
  const { t } = useTranslation();
  const reactId = React.useId();
  const listId = `${reactId}-listbox`;
  const optionDomId = (optionValue: string) => `${reactId}-opt-${optionValue}`;
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [loaded, setLoaded] = React.useState<SearchSelectOptionProp[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [picked, setPicked] = React.useState<SearchSelectOptionProp | null>(null);

  // Controlled/uncontrolled value (controlled-triad rule): `value` wins when provided; otherwise
  // an internal state seeded from `defaultValue` so the trigger reflects selection without wiring.
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;

  const reqId = React.useRef(0);

  // Provide ONE of `loadOptions` (remote) or `options` (static, client-side filtered). With a
  // static list this becomes a plain searchable combobox — superseding the legacy Autocomplete.
  const resolvedLoad = React.useMemo<NonNullable<SearchSelectProp["loadOptions"]>>(
    () =>
      loadOptions ??
      (async ({ query: search }) => {
        const needle = search.trim().toLowerCase();
        const list = staticOptions ?? [];
        return {
          options: needle
            ? list.filter(
                (option) =>
                  option.label.toLowerCase().includes(needle) ||
                  option.value.toLowerCase().includes(needle),
              )
            : list,
          hasMore: false,
        };
      }),
    [loadOptions, staticOptions],
  );

  // Debounce the search term — one fetch per pause, not per keystroke.
  React.useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query]);

  const fetchPage = React.useCallback(
    async (nextPage: number, search: string, append: boolean) => {
      const ticket = ++reqId.current;
      setLoading(true);
      try {
        const result = await resolvedLoad({ query: search, page: nextPage });
        if (ticket !== reqId.current) return; // a newer request superseded this one
        setLoaded((prev) => (append ? [...prev, ...result.options] : result.options));
        setHasMore(Boolean(result.hasMore));
        setPage(nextPage);
      } finally {
        if (ticket === reqId.current) setLoading(false);
      }
    },
    [resolvedLoad],
  );

  // (Re)load the first page when opened or the search term changes.
  React.useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
    void fetchPage(1, debouncedQuery, false);
  }, [open, debouncedQuery, fetchPage]);

  // Bucket options under optgroup-style headings, preserving first-seen group order, and keep a
  // flat ordering so keyboard navigation (activeIndex) stays correct across groups.
  const grouped = React.useMemo(() => {
    const order: string[] = [];
    const buckets = new Map<string, SearchSelectOptionProp[]>();
    for (const option of loaded) {
      const key = option.group ?? "";
      if (!buckets.has(key)) {
        buckets.set(key, []);
        order.push(key);
      }
      buckets.get(key)!.push(option);
    }
    let flatIndex = 0;
    return order.map((key) => ({
      heading: key || undefined,
      items: (buckets.get(key) ?? []).map((option) => ({ option, index: flatIndex++ })),
    }));
  }, [loaded]);
  const flatOrdered = React.useMemo(
    () => grouped.flatMap((group) => group.items.map((entry) => entry.option)),
    [grouped],
  );

  const resolvedPlaceholder = placeholder ?? t("dataEntry.searchSelect.placeholder");
  // Resolve the label from the current value across everything we know — the last pick, the static
  // list, and the loaded page — so a controlled/`defaultValue` selection shows its label at rest
  // (not the placeholder). `selectedLabel` covers an async value whose option isn't loaded yet.
  const selectedOption = value
    ? ([picked, ...(staticOptions ?? []), ...loaded].find((option) => option?.value === value) ??
      null)
    : null;
  const currentLabel = value
    ? (selectedOption?.label ?? selectedLabel ?? value)
    : resolvedPlaceholder;

  const select = (option: SearchSelectOptionProp) => {
    if (option.disabled) return;
    setPicked(option);
    if (!isControlled) setInternalValue(option.value);
    onValueChange?.(option.value, option);
    setOpen(false);
  };

  const clear = () => {
    setPicked(null);
    if (!isControlled) setInternalValue("");
    onValueChange?.("", undefined);
    setOpen(false);
  };

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 48 && hasMore && !loading) {
      void fetchPage(page + 1, debouncedQuery, true);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(flatOrdered.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && flatOrdered[activeIndex]) {
      event.preventDefault();
      select(flatOrdered[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  const optionTestId = (optionValue: string) =>
    dataTestId ? `${dataTestId}-option-${optionValue}` : undefined;

  const activeOption = flatOrdered[activeIndex];
  const activeOptionId = activeOption ? optionDomId(activeOption.value) : undefined;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          data-testid={dataTestId}
          className={cn("w-full justify-between font-normal", controlOpenRingClass, className)}
        >
          <span className={cn("truncate text-start", !value && "text-muted-foreground")}>
            {currentLabel}
          </span>
          <ChevronsUpDown className="ms-2 size-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      {/* Hidden field so the selection submits with a native form. */}
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <PopoverContent
        align="start"
        sideOffset={4}
        collisionPadding={12}
        className="flex max-h-[min(24rem,var(--radix-popover-content-available-height))] w-max max-w-[min(32rem,calc(100vw-1.5rem))] min-w-[var(--radix-popover-trigger-width)] flex-col p-0"
      >
        <Command shouldFilter={false} className="flex min-h-0 flex-col">
          <div className="border-border shrink-0 border-b p-2">
            <Input
              autoFocus
              // The PopoverTrigger is the (single) combobox; this search field is a textbox that
              // filters and drives the listbox — aria-controls + aria-activedescendant are valid on
              // a textbox and announce the active option without making it a second combobox.
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeOptionId}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder ?? t("dataEntry.searchSelect.search")}
            />
          </div>
          <CommandList
            id={listId}
            role="listbox"
            className="min-h-0 flex-1 overflow-y-auto p-1"
            onScroll={onScroll}
          >
            {clearable && value ? (
              <CommandItem value="" data-testid={optionTestId("none")} onSelect={clear}>
                <span className="text-muted-foreground text-sm">
                  {clearLabel ?? t("dataEntry.searchSelect.clear")}
                </span>
              </CommandItem>
            ) : null}
            {grouped.map((group) => {
              const rows = group.items.map(({ option, index }) => (
                <CommandItem
                  key={option.value}
                  id={optionDomId(option.value)}
                  role="option"
                  value={option.value}
                  data-testid={optionTestId(option.value)}
                  aria-selected={activeIndex === index}
                  disabled={option.disabled}
                  className={cn(
                    // Selected = persistent bg-accent + medium weight (NO check icon — saves width),
                    // matching the plain SelectItem's `data-[state=checked]` convention; active =
                    // hover/keyboard accent. Same bg so selection stays coherent across both Selects.
                    value === option.value && "bg-accent text-foreground font-medium",
                    activeIndex === index && "bg-accent text-accent-foreground",
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onSelect={() => select(option)}
                >
                  {renderOption ? (
                    <div className="min-w-0 flex-1">{renderOption(option)}</div>
                  ) : (
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm">{option.label}</span>
                      {option.sublabel ? (
                        <span className="text-muted-foreground truncate text-xs">
                          {option.sublabel}
                        </span>
                      ) : null}
                    </div>
                  )}
                </CommandItem>
              ));

              return group.heading ? (
                <CommandGroup key={group.heading} heading={group.heading}>
                  {rows}
                </CommandGroup>
              ) : (
                <React.Fragment key="__ungrouped">{rows}</React.Fragment>
              );
            })}
            {loading ? (
              <div className="text-muted-foreground flex items-center gap-2 px-2 py-3 text-sm">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {loadingMessage ?? t("dataEntry.searchSelect.loading")}
              </div>
            ) : null}
            {!loading && loaded.length === 0 ? (
              <div className="text-muted-foreground px-2 py-6 text-center text-sm">
                {emptyMessage ?? t("dataEntry.searchSelect.empty")}
              </div>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
