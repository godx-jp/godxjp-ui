import * as React from "react";
import { ChevronsUpDown, Loader2, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { useFieldIdentity, useFieldNameFallback } from "../../lib/field-a11y";
import { cn } from "../../lib/utils";
import { controlSurfaceTriggerClass } from "../../lib/control-styles";
import {
  applyMaxTagCount,
  controlSurfaceAttrs,
  resolveAllowClear,
  resolveAriaInvalid,
  splitByTokenSeparators,
} from "./control-surface";
import { normalizeSelectOptions } from "../../lib/select-options";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { Command, CommandGroup } from "./command";
import { Input } from "./input";
import type {
  SearchSelectProp,
  SearchSelectOptionProp,
} from "../../props/components/data-entry.prop";

export type {
  SearchSelectProp,
  SearchSelectProp as SearchSelectProps,
  SearchSelectBaseProp,
  SearchSelectSingleProp,
  SearchSelectMultipleProp,
  SearchSelectOptionProp,
  SearchSelectOptionProp as SearchSelectOption,
  SearchSelectLoadParamsProp,
  SearchSelectLoadResultProp,
} from "../../props/components/data-entry.prop";

const DEBOUNCE_MS = 250;

/**
 * antd `popupRender` — wrap the panel's own node (a footer, a "create" action, a hint line). A
 * component rather than an inline ternary so the panel below stays one JSX block: the renderer
 * receives it whole, and dropping it is the consumer's own (visible) mistake.
 */
function PopupRender({
  render,
  children,
}: {
  render?: (originNode: React.ReactNode) => React.ReactNode;
  children: React.ReactNode;
}) {
  return <>{render ? render(children) : children}</>;
}

/**
 * SearchSelect — a searchable single-select combobox with a debounced search box, optional
 * optgroup-style grouping (`option.group`), and loading/empty states. Drive it EITHER remotely
 * with `loadOptions({ query, page })` (server search + infinite scroll) OR with a static `options`
 * array (client-side filter) — the latter supersedes the legacy `Autocomplete`.
 */
export function SearchSelect(props: SearchSelectProp) {
  const {
    options: rawOptions,
    fieldNames,
    loadOptions,
    renderOption,
    labelRender,
    selectedLabel,
    selectedIcon,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    loadingMessage,
    errorMessage,
    clearLabel,
    clearable = true,
    disabled = false,
    readOnly = false,
    size,
    status,
    variant,
    width = "full",
    loading: loadingProp = false,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    search: searchProp,
    onSearchChange,
    filterOption,
    optionFilterProp,
    filterSort,
    autoClearSearchValue = true,
    optionRender,
    menuItemSelectedIcon,
    notFoundContent,
    prefix,
    suffixIcon,
    placement,
    popupRender,
    listHeight,
    onPopupScroll,
    popupMatchSelectWidth = true,
    allowClear,
    onClear,
    renderError,
    renderLoadMore,
    name,
    id,
    className,
    "data-testid": dataTestId,
    "data-field": dataField,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    "aria-errormessage": ariaErrorMessage,
    "aria-invalid": ariaInvalid,
    "aria-required": ariaRequired,
  } = props;
  // antd `mode="multiple"`. The panel stays open across picks, each row toggles, and the trigger
  // collapses the picked labels through the SAME `applyMaxTagCount` helper Cascader and TreeSelect
  // use — one overflow wording for every multi-value trigger in the library.
  // Flat rows, antd's nested groups, or foreign rows read through `fieldNames` — all one list.
  // `Select` normalises before delegating here; this covers a direct `<SearchSelect options>` too.
  const staticOptions = React.useMemo(
    () => normalizeSelectOptions(rawOptions, fieldNames),
    [rawOptions, fieldNames],
  );
  const multiple = props.mode === "multiple" || props.mode === "tags";
  /** antd `mode="tags"` — what is TYPED counts, not only what the list offers. */
  const tagsMode = props.mode === "tags";
  const maxTagTextLength = props.mode !== undefined ? props.maxTagTextLength : undefined;
  const tokenSeparators = props.mode !== undefined ? props.tokenSeparators : undefined;
  const { t } = useTranslation();
  // under a layout wrapper that the cloneElement contract cannot reach. `{}` when already named.
  const nameFallback = useFieldNameFallback({
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  });
  // `name` stays on the
  // hidden input below (a combobox trigger is a <button>, which submits nothing).
  const identity = useFieldIdentity({ id, name, "data-field": dataField });
  const resolvedName = name ?? identity.name;
  const resolvedField = dataField ?? identity["data-field"];
  const triggerAriaLabel = ariaLabel ?? nameFallback["aria-label"];
  const triggerAriaLabelledby = ariaLabelledby ?? nameFallback["aria-labelledby"];
  const reactId = React.useId();
  const listId = `${reactId}-listbox`;
  const optionDomId = (optionValue: string) => `${reactId}-opt-${optionValue}`;

  // Controlled/uncontrolled open (controlled-triad rule): `open` wins when provided, otherwise
  // internal state — `onOpenChange` still fires either way so a controlled consumer stays in sync.
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

  // Controlled/uncontrolled search query — same triad, driving the debounced fetch below either way.
  const [internalQuery, setInternalQuery] = React.useState("");
  const isSearchControlled = searchProp !== undefined;
  const query = isSearchControlled ? searchProp : internalQuery;
  const setQuery = React.useCallback(
    (next: string) => {
      if (!isSearchControlled) setInternalQuery(next);
      onSearchChange?.(next);
    },
    [isSearchControlled, onSearchChange],
  );

  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [loaded, setLoaded] = React.useState<SearchSelectOptionProp[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  // A rejected `loadOptions` is a DISTINCT state from "no results" — track it so the panel can
  // show an error affordance instead of masquerading as empty (or leaking an unhandled rejection).
  const [error, setError] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  // Every option this control has ever handed out, keyed by value. An async list only holds the
  // CURRENT page, so without this ledger a multi-selection made two searches ago would decay into
  // raw ids on the trigger the moment its page scrolled away.
  const [pickedOptions, setPickedOptions] = React.useState<Record<string, SearchSelectOptionProp>>(
    {},
  );

  // Controlled/uncontrolled value (controlled-triad rule): `value` wins when provided; otherwise
  // an internal state seeded from `defaultValue` so the trigger reflects selection without wiring.
  const [internalValue, setInternalValue] = React.useState<string | string[]>(
    props.defaultValue ?? (props.mode === "multiple" || props.mode === "tags" ? [] : ""),
  );
  const isControlled = props.value !== undefined;
  const rawValue: string | string[] = isControlled ? props.value! : internalValue;
  /** The multi-mode selection, in pick order. Empty (and unused) in single mode. */
  const values = React.useMemo<string[]>(() => {
    if (!multiple) return [];
    return Array.isArray(rawValue) ? rawValue : rawValue ? [rawValue] : [];
  }, [multiple, rawValue]);
  /** The single-mode value. `""` in multiple mode — that branch reads `values`. */
  const value = multiple ? "" : Array.isArray(rawValue) ? (rawValue[0] ?? "") : rawValue;
  const isSelected = (optionValue: string) =>
    multiple ? values.includes(optionValue) : value === optionValue;
  const hasSelection = multiple ? values.length > 0 : Boolean(value);

  const reqId = React.useRef(0);

  // Provide ONE of `loadOptions` (remote) or `options` (static, client-side filtered). With a
  // static list this becomes a plain searchable combobox — superseding the legacy Autocomplete.
  const resolvedLoad = React.useMemo<NonNullable<SearchSelectProp["loadOptions"]>>(
    () =>
      loadOptions ??
      (async ({ query: search }) => {
        const needle = search.trim();
        const list = staticOptions ?? [];
        const matches = (option: SearchSelectOptionProp) => {
          if (filterOption) return filterOption(option, needle);
          // antd `optionFilterProp` — match ONE named field. Unset keeps this library's
          // long-standing behaviour (label OR value), which is what every existing call site
          // expects; antd's own default is `value` alone and would silently narrow them.
          const haystack: string[] = optionFilterProp
            ? [String(option[optionFilterProp] ?? "")]
            : [option.label, option.value];
          return haystack.some((field) =>
            String(field).toLowerCase().includes(needle.toLowerCase()),
          );
        };
        const kept = needle ? list.filter(matches) : list;
        // antd `filterSort` runs AFTER the filter and only on the client — with `loadOptions` the
        // server owns the order, so sorting the page here would fight it. Sort a COPY: `list` is
        // the caller's own `options` array and reordering it in place would mutate a prop.
        return {
          options: filterSort
            ? [...kept].sort((a, b) => filterSort(a, b, { searchValue: needle }))
            : kept,
          hasMore: false,
        };
      }),
    [loadOptions, staticOptions, filterOption, optionFilterProp, filterSort],
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
      if (!append) setError(false);
      try {
        const result = await resolvedLoad({ query: search, page: nextPage });
        if (ticket !== reqId.current) return; // a newer request superseded this one
        setLoaded((prev) => (append ? [...prev, ...result.options] : result.options));
        if (!append) {
          const firstEnabled = result.options.findIndex((option) => !option.disabled);
          setActiveIndex(firstEnabled >= 0 ? firstEnabled : 0);
        }
        setHasMore(Boolean(result.hasMore));
        setPage(nextPage);
      } catch {
        if (ticket !== reqId.current) return; // a newer request superseded this one
        // Surface the failure as its own state; never leave the popover blank or looking "empty".
        if (!append) setLoaded([]);
        setHasMore(false);
        setError(true);
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

  /**
   * What the panel lists. In `tags` mode that is more than what loaded:
   *
   *   • a CREATE row for a query that matches no row, so Enter commits what was typed (antd puts
   *     it first, and so does this);
   *   • a row for every value already held that the list does not carry — a free-text tag would
   *     otherwise be unremovable, because the only way to drop one is to toggle its row.
   */
  const displayOptions = React.useMemo(() => {
    if (!tagsMode) return loaded;
    const known = new Set(loaded.map((option) => option.value));
    const extras: SearchSelectOptionProp[] = [];
    for (const entry of values) {
      if (known.has(entry)) continue;
      known.add(entry);
      extras.push(pickedOptions[entry] ?? { value: entry, label: entry });
    }
    const needle = query.trim();
    const exists = known.has(needle) || loaded.some((option) => option.label === needle);
    const create: SearchSelectOptionProp[] =
      needle && !exists ? [{ value: needle, label: needle }] : [];
    return create.length || extras.length ? [...create, ...extras, ...loaded] : loaded;
  }, [tagsMode, loaded, values, query, pickedOptions]);

  // Bucket options under optgroup-style headings, preserving first-seen group order, and keep a
  // flat ordering so keyboard navigation (activeIndex) stays correct across groups.
  const grouped = React.useMemo(() => {
    const order: string[] = [];
    const buckets = new Map<string, SearchSelectOptionProp[]>();
    for (const option of displayOptions) {
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
  }, [displayOptions]);
  const flatOrdered = React.useMemo(
    () => grouped.flatMap((group) => group.items.map((entry) => entry.option)),
    [grouped],
  );

  const resolvedPlaceholder = placeholder ?? t("dataEntry.searchSelect.placeholder");
  /**
   * Resolve one value's option across everything we know — the ledger of past picks, the static
   * list, and the loaded page — so a controlled/`defaultValue` selection shows its label at rest
   * (not the placeholder, and not a raw id).
   */
  const optionFor = (optionValue: string): SearchSelectOptionProp | null =>
    pickedOptions[optionValue] ??
    (staticOptions ?? []).find((option) => option.value === optionValue) ??
    loaded.find((option) => option.value === optionValue) ??
    null;
  // `selectedLabel` covers an async value whose option isn't loaded yet.
  const selectedOption = value ? optionFor(value) : null;
  const currentLabel = value
    ? (selectedOption?.label ?? selectedLabel ?? value)
    : resolvedPlaceholder;
  // Icon for the trigger: the loaded option's icon, else `selectedIcon` for an async value whose
  // option page hasn't arrived yet (the trigger counterpart of `selectedLabel`).
  const currentIcon = value ? (selectedOption?.icon ?? selectedIcon) : null;
  // antd `maxTagCount` / `maxTagPlaceholder`, through the SAME helper Cascader, TreeSelect and
  // TagInput share — "+2" means one thing across every multi-value trigger in the library.
  // antd `maxTagTextLength` — the TRIGGER's text is cut, never the value.
  const chipLabel = (label: string) =>
    maxTagTextLength !== undefined && maxTagTextLength >= 0 && label.length > maxTagTextLength
      ? `${label.slice(0, maxTagTextLength)}…`
      : label;
  const selectedChips = multiple
    ? values.map((entry) => ({
        value: entry,
        label: chipLabel(optionFor(entry)?.label ?? entry),
      }))
    : [];
  const {
    visible: visibleChips,
    omitted: omittedChips,
    overflow: chipOverflow,
  } = applyMaxTagCount(
    selectedChips,
    props.mode !== undefined ? props.maxTagCount : undefined,
    props.mode !== undefined ? props.maxTagPlaceholder : undefined,
  );
  // antd `maxCount` — a HARD ceiling: a pick past it is refused, and the rows that would break it
  // report `aria-disabled` so the limit is visible BEFORE it is hit rather than as a dead click.
  const maxCount = props.mode !== undefined ? props.maxCount : undefined;
  const atMaxCount = maxCount !== undefined && values.length >= maxCount;

  const remember = (option: SearchSelectOptionProp) =>
    setPickedOptions((prev) => ({ ...prev, [option.value]: option }));

  const select = (option: SearchSelectOptionProp) => {
    if (option.disabled) return;
    // `mode !== undefined` rather than naming both multi modes: it is the discriminant that also
    // narrows the SINGLE branch below, where `onValueChange` takes a string rather than an array.
    if (props.mode !== undefined) {
      const already = values.includes(option.value);
      if (!already && atMaxCount) return;
      const next = already
        ? values.filter((entry) => entry !== option.value)
        : [...values, option.value];
      remember(option);
      if (!isControlled) setInternalValue(next);
      props.onValueChange?.(
        next,
        next
          .map((entry) => (entry === option.value ? option : optionFor(entry)))
          .filter((entry): entry is SearchSelectOptionProp => entry !== null),
      );
      if (already) props.onDeselect?.(option.value, option);
      else props.onSelect?.(option.value, option);
      // antd `autoClearSearchValue` (default true): the query is spent once it produced a pick.
      if (autoClearSearchValue) setQuery("");
      // The panel STAYS OPEN — a multi-pick is a run of gestures, and closing after each one
      // makes picking three options cost three round trips through the trigger.
      return;
    }
    remember(option);
    if (!isControlled) setInternalValue(option.value);
    props.onValueChange?.(option.value, option);
    props.onSelect?.(option.value, option);
    // antd `autoClearSearchValue` (default true): the query is spent once it produced a pick.
    // `false` keeps it, so reopening resumes the same filtered list instead of the full one.
    if (autoClearSearchValue) setQuery("");
    setOpen(false);
  };

  /**
   * antd `tokenSeparators` — commit a whole run at once ("東京,大阪,福岡", or a column pasted out
   * of a spreadsheet). ONE `onValueChange` for the run, not one per token: a consumer writing to a
   * server would otherwise fire a request per comma.
   */
  const selectTokens = (text: string) => {
    if (props.mode === undefined) return;
    const next = [...values];
    const picked: SearchSelectOptionProp[] = [];
    for (const raw of splitByTokenSeparators(text, tokenSeparators ?? [])) {
      const token = raw.trim();
      if (!token) continue;
      const match = flatOrdered.find((option) => option.value === token || option.label === token);
      // `multiple` only accepts what the list offers; `tags` accepts the text itself.
      const option = match ?? (tagsMode ? { value: token, label: token } : undefined);
      if (!option || option.disabled) continue;
      if (next.includes(option.value)) continue;
      if (maxCount !== undefined && next.length >= maxCount) break;
      next.push(option.value);
      picked.push(option);
    }
    if (picked.length === 0) return;
    for (const option of picked) remember(option);
    if (!isControlled) setInternalValue(next);
    props.onValueChange?.(
      next,
      next
        .map((entry) => picked.find((option) => option.value === entry) ?? optionFor(entry))
        .filter((entry): entry is SearchSelectOptionProp => entry != null),
    );
    for (const option of picked) props.onSelect?.(option.value, option);
  };

  const clear = () => {
    if (props.mode !== undefined) {
      if (!isControlled) setInternalValue([]);
      props.onValueChange?.([], []);
    } else {
      if (!isControlled) setInternalValue("");
      props.onValueChange?.("", undefined);
    }
    onClear?.();
    setOpen(false);
  };

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 48 && hasMore && !loading) {
      void fetchPage(page + 1, debouncedQuery, true);
    }
  };

  const moveActive = (direction: 1 | -1) => {
    if (flatOrdered.length === 0) return;
    let next = activeIndex;
    for (let checked = 0; checked < flatOrdered.length; checked += 1) {
      next = (next + direction + flatOrdered.length) % flatOrdered.length;
      if (!flatOrdered[next]?.disabled) {
        setActiveIndex(next);
        return;
      }
    }
  };

  const moveToEdge = (edge: "start" | "end") => {
    const indices = flatOrdered.map((_, index) => index);
    if (edge === "end") indices.reverse();
    const next = indices.find((index) => !flatOrdered[index]?.disabled);
    if (next !== undefined) setActiveIndex(next);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      moveToEdge("start");
    } else if (event.key === "End") {
      event.preventDefault();
      moveToEdge("end");
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
  // antd `allowClear` (incl. its `{ clearIcon, label }` form) reconciled with this library's own
  // `clearable`. Read-only mirrors Input/NumberInput: value visible + selectable, but no new pick —
  // so the clear affordance (which would mutate the value) is suppressed too. `loading` also
  // suppresses it: the affix is the spinner's seat while a field is in flight.
  const clearControl = resolveAllowClear(
    allowClear,
    clearable,
    clearLabel ?? t("dataEntry.searchSelect.clear"),
  );
  const showClear = clearControl.enabled && hasSelection && !disabled && !readOnly && !loadingProp;
  const surface = controlSurfaceAttrs({ variant, status, size });

  return (
    <div className={cn("relative", className)}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          // Read-only never opens (no pick surface) — closing (next=false) still passes through so
          // an externally-forced close (e.g. Escape) is honored.
          if (readOnly && next) return;
          setOpen(next);
          if (!next && autoClearSearchValue) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          {/* Nút gốc chứ không phải <Button>: trigger đọc token của .ui-control. */}
          <button
            id={id}
            type="button"
            role="combobox"
            {...surface}
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-label={triggerAriaLabel}
            aria-labelledby={triggerAriaLabelledby}
            aria-describedby={ariaDescribedby}
            aria-errormessage={ariaErrorMessage}
            aria-invalid={resolveAriaInvalid(ariaInvalid, status)}
            aria-required={ariaRequired}
            aria-readonly={readOnly || undefined}
            aria-busy={loadingProp || undefined}
            disabled={disabled}
            data-testid={dataTestId}
            data-field={resolvedField}
            // label. `""` (nothing selected) is omitted rather than rendered as an empty attribute.
            data-value={(multiple ? values.join(",") : value) || undefined}
            data-mode={multiple ? "multiple" : undefined}
            data-width={width}
            className={cn(
              controlSurfaceTriggerClass,
              "justify-start",
              // `bounded` deliberately emits NO width utility — its width is owned by the
              // `[data-width="bounded"]` rule in control.css, and a utility here would win the
              // layer order and make that token dead. Same reasoning as SelectTrigger.
              width === "auto" && "w-auto",
              width === "full" && "w-full",
              // Reserve trailing room for the single clear-or-chevron overlay rendered below.
              "ui-control-trigger-affixed",
            )}
          >
            {/* antd `prefix` — see the note in select.tsx: part of the value a combobox announces,
                so deliberately not aria-hidden. */}
            {prefix === undefined || prefix === null ? null : (
              <span data-slot="select-prefix" className="ui-select-prefix">
                {prefix}
              </span>
            )}
            <span
              className={cn(
                "ui-search-select-option-body text-start",
                !hasSelection && "text-muted-foreground",
              )}
            >
              {multiple ? (
                hasSelection ? (
                  // Labels, not removable chips: the trigger IS a <button>, and a per-label remove
                  // button inside it would be a button nested in a button (invalid HTML →
                  // hydration error). Removal is a second click on the row, or the clear ✕.
                  <span className="ui-search-select-values" data-slot="search-select-values">
                    {visibleChips.map((chip) => (
                      <span
                        key={chip.value}
                        className="ui-search-select-value"
                        data-slot="search-select-value"
                      >
                        {labelRender
                          ? labelRender({
                              value: chip.value,
                              label: chip.label,
                              option: optionFor(chip.value) ?? undefined,
                            })
                          : chip.label}
                      </span>
                    ))}
                    {omittedChips.length > 0 ? (
                      <span
                        className="ui-search-select-value"
                        data-slot="search-select-value-overflow"
                      >
                        {chipOverflow ??
                          t("dataEntry.selection.overflow", { count: omittedChips.length })}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="truncate">{resolvedPlaceholder}</span>
                )
              ) : value && labelRender ? (
                labelRender({ value, label: currentLabel, option: selectedOption ?? undefined })
              ) : (
                <>
                  {currentIcon ? (
                    <span className="flex shrink-0 items-center" aria-hidden="true">
                      {currentIcon}
                    </span>
                  ) : null}
                  <span className="truncate">{currentLabel}</span>
                </>
              )}
            </span>
          </button>
        </PopoverTrigger>
        {/* Hidden field(s) so the selection submits with a native form. `mode="multiple"` emits ONE
            field per value under the same name — the native `<select multiple>` contract, which is
            what every server-side form parser already understands. */}
        {resolvedName ? (
          multiple ? (
            values.map((entry) => (
              <input key={entry} type="hidden" name={resolvedName} value={entry} readOnly />
            ))
          ) : (
            <input type="hidden" name={resolvedName} value={value} readOnly />
          )
        ) : null}
        <PopoverContent
          aria-label={triggerAriaLabelledby ? undefined : (triggerAriaLabel ?? resolvedPlaceholder)}
          aria-labelledby={triggerAriaLabelledby}
          // antd `placement`, logical (see SelectPlacementProp). Absent = below, start-aligned,
          // with collision flipping — what a picker wants.
          side={placement?.startsWith("top") ? "top" : "bottom"}
          align={placement?.endsWith("End") ? "end" : "start"}
          sideOffset={4}
          collisionPadding={12}
          // Full-height list: stretch to the viewport-constrained available height
          // (collisionPadding keeps the breathing room) instead of a 24rem cap that
          // cut the list mid-row.
          className="ui-search-select-panel"
          // antd `popupMatchSelectWidth`. `true` is the resting behaviour (the panel's
          // min-inline-size is the trigger width); `false` releases that floor so the panel hugs
          // its longest row; a NUMBER pins both edges to that many pixels. The pixel value is a
          // consumer's measurement of their own data, so it arrives as a token override rather
          // than a class — nothing about it is a scale step this library could own.
          data-popup-match={
            popupMatchSelectWidth === true
              ? undefined
              : popupMatchSelectWidth === false
                ? "content"
                : "fixed"
          }
          style={
            typeof popupMatchSelectWidth === "number"
              ? ({
                  "--search-select-panel-inline-size": `${popupMatchSelectWidth}px`,
                } as React.CSSProperties)
              : undefined
          }
        >
          <PopupRender render={popupRender}>
            <Command value={value} shouldFilter={false} className="ui-search-select-command">
              {/* The search field is FLUSH inside the panel — borderless with a single bottom
                separator (the panel frames it). A boxed/padded input here double-borders. */}
              <div className="ui-search-select-search">
                <Input
                  autoFocus
                  // The PopoverTrigger is the (single) combobox; this search field is a textbox that
                  // filters and drives the listbox — aria-controls + aria-activedescendant are valid on
                  // a textbox and announce the active option without making it a second combobox.
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={activeOptionId}
                  aria-label={searchPlaceholder ?? t("dataEntry.searchSelect.search")}
                  value={query}
                  onChange={(event) => {
                    const next = event.target.value;
                    // A separator (typed OR pasted — a paste raises this same change) commits.
                    if (
                      multiple &&
                      tokenSeparators?.length &&
                      tokenSeparators.some((separator) => next.includes(separator))
                    ) {
                      selectTokens(next);
                      setQuery("");
                      return;
                    }
                    setQuery(next);
                  }}
                  onPaste={(event) => {
                    // A PASTED run is read off the clipboard, not off the box: a single-line
                    // <input> strips CR/LF during value sanitisation (HTML's own algorithm), so a
                    // "\n" separator would otherwise never survive to be split on — the column
                    // pasted out of a spreadsheet would arrive as one glued-together token.
                    // `TagInput` reads the clipboard for the same reason.
                    if (!multiple || !tokenSeparators?.length) return;
                    const text = event.clipboardData.getData("text");
                    if (!tokenSeparators.some((separator) => text.includes(separator))) return;
                    event.preventDefault();
                    selectTokens(text);
                    setQuery("");
                  }}
                  onKeyDown={onKeyDown}
                  placeholder={searchPlaceholder ?? t("dataEntry.searchSelect.search")}
                  className="ui-search-select-search-input"
                />
              </div>
              <div
                id={listId}
                role="listbox"
                aria-multiselectable={multiple || undefined}
                // Announce the in-flight fetch (APG combobox) so the empty/error message that follows
                // isn't read as a settled result while a request is still resolving.
                aria-busy={loading}
                // The global --command-list-max-height cap (300px) is for bare Command
                // palettes; HERE the popover itself bounds the height (available-height
                // flex column), so the list stretches to fill it instead of stopping short.
                className="ui-search-select-list"
                // antd `listHeight` — a per-instance override of the token the CSS cap already reads.
                style={
                  listHeight === undefined
                    ? undefined
                    : ({
                        "--search-select-list-max-height": `${listHeight}px`,
                      } as React.CSSProperties)
                }
                onScroll={(event) => {
                  // antd `onPopupScroll` runs beside the built-in infinite scroll, never instead of
                  // it: a consumer watching the scroll must not have to re-implement pagination.
                  onPopupScroll?.(event);
                  onScroll(event);
                }}
              >
                {grouped.map((group) => {
                  const rows = group.items.map(({ option, index }) => (
                    <div
                      key={option.value}
                      id={optionDomId(option.value)}
                      role="option"
                      data-testid={optionTestId(option.value)}
                      aria-selected={isSelected(option.value)}
                      aria-disabled={
                        option.disabled || (atMaxCount && !isSelected(option.value)) || undefined
                      }
                      data-disabled={
                        option.disabled || (atMaxCount && !isSelected(option.value)) || undefined
                      }
                      className={cn(
                        "ui-command-item",
                        // Selected = persistent bg-accent + medium weight (NO check icon — saves width),
                        // matching the plain SelectItem's `data-[state=checked]` convention; active =
                        // hover/keyboard accent. Same bg so selection stays coherent across both Selects.
                        isSelected(option.value) && "bg-accent text-foreground font-medium",
                        activeIndex === index && "bg-accent text-accent-foreground",
                      )}
                      onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => select(option)}
                    >
                      {/* antd's `optionRender(option, { index })` outranks the older
                        `renderOption(option)` — same slot, the newer signature wins. */}
                      {optionRender ? (
                        <div className="ui-search-select-option-slot">
                          {optionRender(option, { index })}
                        </div>
                      ) : renderOption ? (
                        <div className="ui-search-select-option-slot">{renderOption(option)}</div>
                      ) : (
                        <div className="ui-search-select-option-body">
                          {option.icon ? (
                            <span className="flex shrink-0 items-center" aria-hidden="true">
                              {option.icon}
                            </span>
                          ) : null}
                          <div className="ui-search-select-option-text">
                            <span className="ui-search-select-option-label">{option.label}</span>
                            {option.sublabel ? (
                              <span className="ui-search-select-option-sublabel">
                                {option.sublabel}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      )}
                      {/* antd `menuItemSelectedIcon` — opt-in, because this library marks the picked
                        row with fill + weight, which costs no width. Decorative: `aria-selected`
                        on the row is what a screen reader reads. */}
                      {menuItemSelectedIcon && isSelected(option.value) ? (
                        <span
                          data-slot="search-select-selected-icon"
                          className="ui-search-select-selected-icon"
                          aria-hidden="true"
                        >
                          {menuItemSelectedIcon}
                        </span>
                      ) : null}
                    </div>
                  ));

                  return group.heading ? (
                    <CommandGroup key={group.heading} heading={group.heading}>
                      {rows}
                    </CommandGroup>
                  ) : (
                    <React.Fragment key="__ungrouped">{rows}</React.Fragment>
                  );
                })}
                {/* Loading / error / empty are DISTINCT states, never a blank panel. Error and empty
                  render as a disabled, non-focusable option row (the DS empty affordance) so the
                  listbox always owns a child and keyboard nav has nothing to trap on. */}
                {loading ? (
                  <div role="status" className="ui-search-select-status">
                    <Loader2 className="ui-search-select-spinner animate-spin" aria-hidden="true" />
                    {loadingMessage ?? t("dataEntry.searchSelect.loading")}
                  </div>
                ) : error ? (
                  renderError ? (
                    renderError({
                      message: errorMessage ?? t("dataEntry.searchSelect.error"),
                      // Retry always reloads from the first page (a defined, predictable recovery —
                      // NOT a resume of a failed page-N append, which would need to re-derive state).
                      retry: () => void fetchPage(1, debouncedQuery, false),
                    })
                  ) : (
                    <div
                      role="option"
                      aria-disabled="true"
                      aria-selected={false}
                      className="ui-search-select-placeholder"
                      data-tone="destructive"
                    >
                      {errorMessage ?? t("dataEntry.searchSelect.error")}
                    </div>
                  )
                ) : loaded.length === 0 ? (
                  <div
                    role="option"
                    aria-disabled="true"
                    aria-selected={false}
                    className="ui-search-select-placeholder"
                  >
                    {/* antd `notFoundContent` is a NODE and outranks the string-only
                      `emptyMessage`; the localized default remains the floor. */}
                    {notFoundContent ?? emptyMessage ?? t("dataEntry.searchSelect.empty")}
                  </div>
                ) : null}
              </div>
              {/* Custom "load more" affordance — pairs with (does not replace) the built-in
                scroll-triggered pagination above. Lives OUTSIDE role="listbox" (a listbox's
                children must be options/groups per APG). */}
              {renderLoadMore && hasMore ? (
                <div
                  className="ui-search-select-footer"
                  // The footer lives inside the cmdk root for layout, but its controls are NOT
                  // cmdk items — stop keydown here so Enter/Space activate the load-more button
                  // natively instead of being hijacked by cmdk's list navigation (a11y: the slot
                  // must be keyboard-operable, not mouse-only).
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {renderLoadMore({
                    hasMore,
                    loading,
                    loadMore: () => {
                      if (!loading) void fetchPage(page + 1, debouncedQuery, true);
                    },
                  })}
                </div>
              ) : null}
            </Command>
          </PopupRender>
        </PopoverContent>
      </Popover>
      {/* Clear / chevron render OUTSIDE the trigger <button> — a <button> may not nest inside a <button> (invalid HTML → hydration error). The overlay ignores pointer events so a click falls through to the trigger to open it; only the clear control re-enables them. */}
      <div className="ui-control-affix">
        {loadingProp ? (
          // antd `loading` — the FIELD is in flight (the form is still resolving this value), which
          // is a different claim from the list-level spinner inside the panel. It takes the affix
          // seat so the two can never both animate in the same place.
          <Loader2
            data-slot="search-select-loading"
            className="ui-control-affix-icon ui-control-affix-indicator animate-spin"
            aria-hidden="true"
          />
        ) : showClear ? (
          <button
            type="button"
            aria-label={clearControl.label}
            data-testid={optionTestId("clear")}
            className="ui-control-affix-action"
            onClick={clear}
          >
            {clearControl.clearIcon ?? <X className="ui-control-affix-icon" aria-hidden="true" />}
          </button>
        ) : suffixIcon === null ? null : suffixIcon !== undefined ? (
          <span data-slot="select-suffix" className="ui-select-suffix" aria-hidden="true">
            {suffixIcon}
          </span>
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
