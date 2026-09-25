import { Check, ChevronDown, X } from "lucide-react";
import * as React from "react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type {
  RecordPickerProp,
  SearchSelectOptionProp,
  SelectOptionGroupProp,
} from "../../props/components/data-entry.prop";
import { normalizeSelectOptions } from "../../lib/select-options";
import { Badge } from "../data-display/badge";
import { EmptyState } from "../data-display/empty-state";
import { Button } from "../general/button";
import { Text } from "../general/typography";
import { Flex } from "../layout/flex";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../feedback/dialog";
import { Command, CommandGroup } from "./command";
import { Input } from "./input";
import { Select } from "./select";

export type { RecordPickerProp, RecordPickerProp as RecordPickerProps };

/**
 * RecordPicker — ONE control whose SHAPE follows the size of the set behind it (gh#932).
 *
 * The report, from a `/human-tester` session on a consumer: "các select mà có khả năng nhiều dữ
 * liệu mà hiển thị kiểu dropdown có cả nghìn cái thì làm sao chọn được… dưới X người là dropdown,
 * trên X người là cho cấu hình search condition trong modal". A dropdown is the right control for
 * eight people and the wrong one for eight hundred, and today the consumer has to decide that by
 * hand, per screen — which is why the same concept ("pick a person") shipped three different ways
 * in one app, including a bare text field where a mistyped key failed with a 422 after save.
 *
 * ## Why this is a component and not a composition
 *
 * By the Framework-Component Test it passes on every count: three unrelated screens need it, the
 * behaviour is stateful and keyboard/ARIA-bearing rather than arrangement, and the knob that
 * matters (`threshold`) is a design decision a service sets once. What it does NOT do is invent
 * anything: under the threshold it renders `Select` — the same component, same props, same panel —
 * and over it, the dialog body is `Command` with its own filtering off, which is exactly how
 * `Select` already drives a server-backed list.
 *
 * ## The threshold is counted, not guessed
 *
 * `count` is the size of the WHOLE set, which a server knows and a page of results does not. With
 * `options` it defaults to their length. The default 10 is the owner's own number ("dưới 10 thì
 * dropdown, trên 10 thì mở modal search"), and a service overrides it once.
 *
 * ## Selected values survive a page they are not on
 *
 * A picker over ten thousand records will routinely hold a value whose row is not in the current
 * result page — on first render, there IS no result page. `selectedOptions` is how the consumer
 * hands over the labels it already has, and it is merged ahead of whatever loads later, so a chip
 * never renders as a raw id and never disappears when the query changes.
 */
export const RecordPicker = React.forwardRef<HTMLButtonElement, RecordPickerProp>(
  function RecordPicker(
    {
      mode = "single",
      value,
      defaultValue,
      onValueChange,
      options,
      loadOptions,
      count,
      threshold = 10,
      filters,
      selectedOptions,
      emptyOption,
      placeholder,
      dialogTitle,
      disabled = false,
      size,
      className,
      "data-field": fieldName,
      ...props
    },
    ref,
  ) {
    const { t } = useTranslation();
    const isMultiple = mode === "multiple";

    const controlled = value !== undefined;
    const [internal, setInternal] = React.useState<string[]>(() =>
      toArray(defaultValue ?? (isMultiple ? [] : null)),
    );
    const selected = controlled ? toArray(value) : internal;

    const commit = React.useCallback(
      (next: string[]) => {
        if (!controlled) setInternal(next);
        // The callback keeps the SHAPE the caller passed in: an array for `multiple`, a single
        // value (or null) otherwise. A picker that returns `["a"]` where the field holds a string
        // is a bug the consumer has to unwrap at every call site.
        onValueChange?.(isMultiple ? next : (next[0] ?? null));
      },
      [controlled, isMultiple, onValueChange],
    );

    /*
     * Select nhận `{ query, page }`, RecordPicker nhận `{ query, filters, cursor }` — nhánh
     * dropdown KHÔNG vẽ filter nào (đó là thứ chỉ Dialog có), nên `filters` ở đây là rỗng, và
     * nói thế bằng một adapter tường minh thay vì ép kiểu. `page` của Select là số trang, map
     * sang `cursor` dạng chuỗi để consumer nào phân trang bằng số vẫn dùng được.
     */
    const selectLoadOptions = React.useMemo(
      () =>
        loadOptions
          ? async ({ query, page }: { query: string; page: number }) => {
              const r = await loadOptions({
                query,
                filters: {},
                cursor: page > 1 ? String(page) : undefined,
              });
              return { options: r.options, hasMore: r.nextCursor !== undefined };
            }
          : undefined,
      [loadOptions],
    );

    const staticOptions = React.useMemo(
      () => (options ? normalizeSelectOptions(options as SelectOptionGroupProp[]) : []),
      [options],
    );

    // THE SHAPE DECISION. `count` wins when given, because only the server knows how big the set
    // is; `options.length` is the honest answer when the whole set is already in memory.
    const total = count ?? (options ? staticOptions.length : undefined);
    const asDialog = total === undefined ? Boolean(loadOptions) : total > threshold;

    if (!asDialog) {
      // Under the threshold this IS a Select — not a lookalike. Everything it already does about
      // search, groups, disabled rows, `maxTagCount` and the trigger stays exactly as it is.
      //
      // The rest of `props` is deliberately NOT forwarded here. They are `<button>` attributes,
      // typed for the dialog branch where the trigger really is one; Select renders its own
      // trigger and takes a narrower set (its `aria-invalid` is boolean, the DOM one also admits
      // "grammar"/"spelling"). Spreading them would either not type or land on the wrong element.
      return (
        <Select
          // `Select` exposes no ref, so the forwarded one lands on the dialog trigger branch only.
          // Casting one in here would advertise a handle that never arrives.
          mode={isMultiple ? "multiple" : undefined}
          // gh#942 (1) — `loadOptions` PHẢI đi qua đây. Trước đó nhánh này chỉ đọc `options`, nên
          // một picker lấy dữ liệu từ server mà `count` nhỏ hiện dropdown RỖNG, và consumer phải
          // tự nhét trang đầu vào `options` để vòng. Select đã hỗ trợ sẵn `loadOptions`.
          loadOptions={selectLoadOptions}
          // gh#942 (2) — những prop NHẬN DẠNG mà FormField truyền xuống. Cả khối `...props` không
          // chuyển qua được (kiểu `aria-invalid` của DOM rộng hơn của Select: nó còn nhận
          // "grammar"/"spelling"), nhưng ba cái này mới là thứ consumer mất: trigger nhận id tự
          // sinh thay cho id của FormField, và không có `data-field` nên lỗi 422 không bám được.
          id={props.id}
          data-field={fieldName}
          aria-describedby={props["aria-describedby"]}
          // `SelectProp` is discriminated on `labelInValue`; this picker returns plain values, so
          // the branch is named explicitly rather than left for inference to pick.
          labelInValue={false}
          showSearch
          options={withEmptyOption(options, emptyOption)}
          value={(isMultiple ? selected : (selected[0] ?? undefined)) as never}
          onValueChange={((next: string | string[]) => commit(toArray(next))) as never}
          placeholder={placeholder ?? t("dataEntry.recordPicker.placeholder")}
          disabled={disabled}
          size={size}
          className={className}
        />
      );
    }

    return (
      <DialogPicker
        ref={ref}
        // Truyền LẠI tường minh: nó đã bị destructure khỏi `props` ở trên để nhánh Select dùng,
        // nên nhánh này sẽ âm thầm mất nó — đúng lỗi gh#942 điểm 2, chỉ đổi bên.
        data-field={fieldName}
        isMultiple={isMultiple}
        selected={selected}
        commit={commit}
        staticOptions={staticOptions}
        loadOptions={loadOptions}
        filters={filters}
        selectedOptions={selectedOptions}
        emptyOption={emptyOption}
        placeholder={placeholder}
        dialogTitle={dialogTitle}
        disabled={disabled}
        size={size}
        className={className}
        {...props}
      />
    );
  },
);

function toArray(v: string | string[] | null | undefined): string[] {
  if (v === null || v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

/** The "none" row is an OPTION, not a cleared field — it is a value the record can hold. */
function withEmptyOption(
  options: RecordPickerProp["options"],
  emptyOption: RecordPickerProp["emptyOption"],
): RecordPickerProp["options"] {
  if (!emptyOption) return options;
  return [{ value: emptyOption.value, label: emptyOption.label }, ...(options ?? [])];
}

type DialogPickerProps = {
  isMultiple: boolean;
  selected: string[];
  commit: (next: string[]) => void;
  staticOptions: SearchSelectOptionProp[];
} & Omit<RecordPickerProp, "mode" | "value" | "defaultValue" | "onValueChange" | "options">;

const DialogPicker = React.forwardRef<HTMLButtonElement, DialogPickerProps>(function DialogPicker(
  {
    isMultiple,
    selected,
    commit,
    staticOptions,
    loadOptions,
    filters,
    selectedOptions,
    emptyOption,
    placeholder,
    dialogTitle,
    disabled,
    size,
    className,
    ...props
  },
  ref,
) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({});
  const [rows, setRows] = React.useState<SearchSelectOptionProp[]>(staticOptions);
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle");
  // gh#942 điểm 3 — `nextCursor` từng được khai kiểu rồi bỏ đó, nên danh sách dừng ở trang đầu.
  const [cursor, setCursor] = React.useState<string | undefined>(undefined);
  // `draft` is the in-dialog selection. A multiple picker commits on Confirm, so a mis-click is
  // undone by Cancel rather than by re-finding and unpicking the row in a list of ten thousand.
  const [draft, setDraft] = React.useState<string[]>(selected);

  React.useEffect(() => {
    if (open) setDraft(selected);
  }, [open, selected]);

  /*
   * MỌI NHÃN PICKER TỪNG BIẾT, TÍCH LUỸ — không phải dựng lại từ trang hiện tại (gh#942 điểm 4).
   *
   * Bản đầu là một `useMemo` đọc `rows`, nên đổi từ khoá xong là trang cũ biến mất và chip của
   * một giá trị đã chọn rơi về id thô. Một `ref` tích luỹ: cái gì đã thấy một lần thì giữ, vì
   * người dùng chọn nó rồi — không có lý do gì để quên tên nó chỉ vì họ gõ tiếp.
   */
  const labelCache = React.useRef(new Map<string, SearchSelectOptionProp>());
  for (const o of [...(selectedOptions ?? []), ...staticOptions, ...rows]) {
    labelCache.current.set(o.value, o);
  }
  if (emptyOption) {
    labelCache.current.set(emptyOption.value, {
      value: emptyOption.value,
      label: emptyOption.label,
    });
  }
  const labels = labelCache.current;

  const load = React.useCallback(
    async (q: string, f: Record<string, string>, more?: string) => {
      if (!loadOptions) return;
      setStatus("loading");
      try {
        const result = await loadOptions({ query: q, filters: f, cursor: more });
        // `more` là TRANG TIẾP, nên nối thêm; không có nó là một truy vấn mới, thay cả danh sách.
        setRows((prev) => (more ? [...prev, ...result.options] : result.options));
        setCursor(result.nextCursor);
        setStatus("idle");
      } catch {
        // An error is a DISTINCT state from "no results" — a picker that shows "no matching items"
        // when the request failed teaches the user their query was wrong.
        setStatus("error");
      }
    },
    [loadOptions],
  );

  React.useEffect(() => {
    if (!open || !loadOptions) return;
    // Truy vấn mới ⇒ chuỗi trang cũ hết nghĩa; `load` không truyền cursor nên nó thay cả danh sách.
    const id = setTimeout(() => void load(query, filterValues), 250);
    return () => clearTimeout(id);
  }, [open, query, filterValues, load, loadOptions]);

  const visible = React.useMemo(() => {
    const base = loadOptions
      ? rows
      : staticOptions.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));
    return emptyOption && !query.trim()
      ? [{ value: emptyOption.value, label: emptyOption.label }, ...base]
      : base;
  }, [loadOptions, rows, staticOptions, query, emptyOption]);

  const groups = React.useMemo(() => {
    const out = new Map<string, SearchSelectOptionProp[]>();
    for (const o of visible) {
      const key = o.group ?? "";
      out.set(key, [...(out.get(key) ?? []), o]);
    }
    return [...out.entries()];
  }, [visible]);

  const toggle = (optionValue: string) => {
    if (!isMultiple) {
      commit([optionValue]);
      setOpen(false);
      return;
    }
    setDraft((prev) =>
      prev.includes(optionValue) ? prev.filter((v) => v !== optionValue) : [...prev, optionValue],
    );
  };

  const chips = selected.map((v) => labels.get(v) ?? { value: v, label: v });

  return (
    <>
      <Flex direction="row" gap="xs" align="center" className="ui-record-picker-row">
        <Button
          ref={ref}
          type="button"
          variant="outline"
          size={size}
          disabled={disabled}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
          className={cn("ui-record-picker-trigger", className)}
          {...props}
        >
          <span className="ui-record-picker-trigger-label">
            {chips.length === 0 ? (
              <Text as="span" size="sm" tone="muted">
                {placeholder ?? t("dataEntry.recordPicker.placeholder")}
              </Text>
            ) : (
              <Flex direction="row" gap="xs" wrap align="center">
                {chips.map((c) => (
                  <Badge key={c.value} variant="secondary" as="span">
                    {c.icon}
                    {c.label}
                  </Badge>
                ))}
              </Flex>
            )}
          </span>
          <ChevronDown aria-hidden="true" />
        </Button>

        {/* gh#942 điểm 5 — single mode phải xoá được mà KHÔNG cần `emptyOption`. Hai thứ khác nhau:
          `emptyOption` là một giá trị record GIỮ (「担当者なし」, server lưu nó); nút này là "tôi
          chưa trả lời". Nút RIÊNG, không nhét vào trong trigger: trigger là một control mở dialog,
          lồng một button vào trong nó là HTML sai và bàn phím không tới được cái bên trong. */}
        {!isMultiple && selected.length > 0 && !disabled ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("dataEntry.recordPicker.clear")}
            onClick={() => commit([])}
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </Flex>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="ui-record-picker-dialog">
          <DialogHeader>
            <DialogTitle>{dialogTitle ?? t("dataEntry.recordPicker.dialogTitle")}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Flex direction="col" gap="md">
              <Input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t("dataEntry.recordPicker.search")}
                placeholder={t("dataEntry.recordPicker.searchPlaceholder")}
              />

              {filters?.length ? (
                <Flex
                  direction="row"
                  gap="sm"
                  wrap
                  role="group"
                  aria-label={t("dataEntry.recordPicker.filters")}
                >
                  {filters.map((f) => (
                    <Select
                      key={f.name}
                      size="sm"
                      aria-label={f.label}
                      placeholder={f.label}
                      value={filterValues[f.name] ?? ""}
                      onValueChange={(next: string) =>
                        setFilterValues((prev) => ({ ...prev, [f.name]: next }))
                      }
                      options={[
                        { value: "", label: t("dataEntry.recordPicker.allFilter") },
                        ...f.options,
                      ]}
                    />
                  ))}
                </Flex>
              ) : null}

              {/* `shouldFilter={false}`: the query is answered by `loadOptions` (or by the static
                  filter above), never by cmdk over a page it cannot see. Same call Select makes. */}
              <Command shouldFilter={false} split={isMultiple} className="ui-record-picker-list">
                {status === "error" ? (
                  <EmptyState
                    variant="compact"
                    tone="destructive"
                    title={t("dataEntry.recordPicker.error")}
                    action={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void load(query, filterValues)}
                      >
                        {t("dataEntry.recordPicker.more")}
                      </Button>
                    }
                  />
                ) : status === "loading" ? (
                  <div role="status" className="ui-record-picker-status">
                    {t("dataEntry.recordPicker.loading")}
                  </div>
                ) : visible.length === 0 ? (
                  <EmptyState variant="compact" title={t("dataEntry.recordPicker.empty")} />
                ) : (
                  groups.map(([heading, items]) => {
                    const rendered = items.map((o) => {
                      const picked = (isMultiple ? draft : selected).includes(o.value);
                      return (
                        <button
                          key={o.value}
                          type="button"
                          role="option"
                          aria-selected={picked}
                          data-picked={picked ? "" : undefined}
                          disabled={o.disabled}
                          className="ui-record-picker-option"
                          onClick={() => toggle(o.value)}
                        >
                          {/* THE TICK IS NOT THE HIGHLIGHT. A tester reported the two "looked the
                              same"; the highlight is the row cmdk/keyboard is pointing at, the tick
                              is what is chosen, and a picker must never conflate them. */}
                          <span className="ui-record-picker-tick" aria-hidden="true">
                            {picked ? <Check /> : null}
                          </span>
                          {o.icon}
                          <span className="ui-record-picker-option-label">
                            {o.label}
                            {o.sublabel ? (
                              <Text as="span" size="2xs" tone="muted">
                                {o.sublabel}
                              </Text>
                            ) : null}
                          </span>
                        </button>
                      );
                    });
                    return heading ? (
                      <CommandGroup key={heading} heading={heading}>
                        {rendered}
                      </CommandGroup>
                    ) : (
                      <React.Fragment key="__ungrouped">{rendered}</React.Fragment>
                    );
                  })
                )}
              </Command>

              {/* gh#942 điểm 3 — phân trang. Một NÚT chứ không phải cuộn-vô-hạn: người dùng bàn
                  phím tới được nó, nó nói rõ còn nữa hay không, và nó không tự nạp thêm khi ai đó
                  chỉ lướt qua danh sách. Chỉ hiện khi server nói còn trang. */}
              {cursor !== undefined && status !== "loading" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void load(query, filterValues, cursor)}
                >
                  {t("dataEntry.recordPicker.more")}
                </Button>
              ) : null}
            </Flex>
          </DialogBody>

          {isMultiple ? (
            <DialogFooter>
              <Text as="span" size="xs" tone="muted" className="me-auto">
                {t("dataEntry.recordPicker.selected", { count: draft.length })}
              </Text>
              <Button variant="ghost" size="sm" onClick={() => setDraft([])}>
                <X aria-hidden="true" />
                {t("dataEntry.recordPicker.clear")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                {t("dataEntry.recordPicker.cancel")}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  commit(draft);
                  setOpen(false);
                }}
              >
                {t("dataEntry.recordPicker.confirm")}
              </Button>
            </DialogFooter>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
});
