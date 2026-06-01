import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
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
 * SearchSelect — an async, searchable single-select combobox. Unlike `Autocomplete` (static
 * options) this loads options REMOTELY via `loadOptions({ query, page })`, with a debounced
 * search box, infinite-scroll pagination, and loading/empty states. Data-agnostic: pass any
 * fetcher (REST, GraphQL, a cached query client…). Form-submittable via `name`; e2e-testable
 * by the trigger's `data-testid` and each option's `${data-testid}-option-${value}` handle.
 */
export function SearchSelect({
  value = "",
  onChange,
  loadOptions,
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
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [options, setOptions] = React.useState<SearchSelectOptionProp[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [picked, setPicked] = React.useState<SearchSelectOptionProp | null>(null);

  const reqId = React.useRef(0);

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
        const result = await loadOptions({ query: search, page: nextPage });
        if (ticket !== reqId.current) return; // a newer request superseded this one
        setOptions((prev) => (append ? [...prev, ...result.options] : result.options));
        setHasMore(Boolean(result.hasMore));
        setPage(nextPage);
      } finally {
        if (ticket === reqId.current) setLoading(false);
      }
    },
    [loadOptions],
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
    for (const option of options) {
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
  }, [options]);
  const flatOrdered = React.useMemo(
    () => grouped.flatMap((group) => group.items.map((entry) => entry.option)),
    [grouped],
  );

  const resolvedPlaceholder = placeholder ?? t("dataEntry.searchSelect.placeholder");
  const currentLabel = value
    ? (picked?.label ?? selectedLabel ?? resolvedPlaceholder)
    : resolvedPlaceholder;

  const select = (option: SearchSelectOptionProp) => {
    if (option.disabled) return;
    setPicked(option);
    onChange?.(option.value, option);
    setOpen(false);
  };

  const clear = () => {
    setPicked(null);
    onChange?.("", undefined);
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
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className={cn("truncate text-left", !value && "text-muted-foreground")}>
            {currentLabel}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" aria-hidden="true" />
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
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder ?? t("dataEntry.searchSelect.search")}
            />
          </div>
          <CommandList className="min-h-0 flex-1 overflow-y-auto p-1" onScroll={onScroll}>
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
                  value={option.value}
                  data-testid={optionTestId(option.value)}
                  aria-selected={activeIndex === index}
                  disabled={option.disabled}
                  className={activeIndex === index ? "bg-accent text-accent-foreground" : undefined}
                  onMouseEnter={() => setActiveIndex(index)}
                  onSelect={() => select(option)}
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{option.label}</span>
                    {option.sublabel ? (
                      <span className="text-muted-foreground truncate text-xs">
                        {option.sublabel}
                      </span>
                    ) : null}
                  </div>
                  {value === option.value ? (
                    <Check className="text-primary size-4 shrink-0" aria-hidden="true" />
                  ) : null}
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
            {!loading && options.length === 0 ? (
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
