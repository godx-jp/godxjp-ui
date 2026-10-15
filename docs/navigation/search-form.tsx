import * as React from "react";
import { ChevronDown, Minus, Pin, PinOff, Plus, Settings, SlidersHorizontal } from "lucide-react";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import {
  CheckboxGroup,
  DatePicker,
  Form,
  FormField,
  Input,
  NumberInput,
  RadioGroup,
  Segmented,
  Select,
} from "@godxjp/ui/data-entry";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@godxjp/ui/feedback";
import { Button, Heading, Text } from "@godxjp/ui/general";
import { useMediaQuery } from "@godxjp/ui/hooks";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer, ResponsiveGrid, SplitPane } from "@godxjp/ui/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FilterBar,
  SearchForm,
} from "@godxjp/ui/navigation";

/**
 * SearchForm — and the three other ways to search a list when a live FilterBar is not enough.
 *
 *   l  検索条件フォーム ....... SearchForm: a grid of labelled conditions, 検索 + クリア, the rest
 *                              behind 詳細条件を開く, a 検索条件 summary + count after the search
 *   m  condition builder ...... rows of field / operator / value, すべて / いずれか / custom logic
 *   n  advanced search ........ one stacked form: label | input | what that row means
 *   o  list view + filters .... a list-view picker, search, and the builder docked beside the list
 *
 * Which one: few filters applied instantly → FilterBar (navigation/filter-bar-layouts). Many
 * conditions, a heavy query, or users who expect an explicit 検索 button → SearchForm. Power
 * users combining arbitrary field/operator conditions and saving them as views → a condition
 * builder (pattern condition-builder). Every one of these applies on SUBMIT, inside a
 * `role="search"` form, so neither `hand-rolled-filter-bar` nor `form-on-list-page` flags it.
 */

// ── Shared data: technical intern trainees (実習生) ──────────────────────────────────────────
type Nationality = "vn" | "id" | "ph" | "mm";
type Status = "training" | "preparing" | "completed" | "withdrawn";
type Occupation = "construction" | "care" | "food" | "agriculture";
type Trainee = {
  id: string;
  name: string;
  nationality: Nationality;
  status: Status;
  occupation: Occupation;
  entry: string;
  months: number;
  agency: string;
  owner: "me" | "other";
};

const NATIONALITIES: Nationality[] = ["vn", "id", "ph", "mm"];
const STATUSES: Status[] = ["training", "preparing", "completed", "withdrawn"];
const OCCUPATIONS: Occupation[] = ["construction", "care", "food", "agriculture"];
const STATUS_TONE: Record<Status, "success" | "info" | "muted" | "warning"> = {
  training: "success",
  preparing: "info",
  completed: "muted",
  withdrawn: "warning",
};

const TRAINEES: Trainee[] = [
  {
    id: "T-2401",
    name: "Nguyễn Văn An",
    nationality: "vn",
    status: "training",
    occupation: "construction",
    entry: "2024-04-08",
    months: 18,
    agency: "Esuhai",
    owner: "me",
  },
  {
    id: "T-2402",
    name: "Trần Thị Bích",
    nationality: "vn",
    status: "training",
    occupation: "care",
    entry: "2024-10-15",
    months: 12,
    agency: "Esuhai",
    owner: "other",
  },
  {
    id: "T-2403",
    name: "Siti Rahmawati",
    nationality: "id",
    status: "preparing",
    occupation: "food",
    entry: "2026-11-01",
    months: 0,
    agency: "Sakura Karya",
    owner: "me",
  },
  {
    id: "T-2404",
    name: "Maria Santos",
    nationality: "ph",
    status: "training",
    occupation: "care",
    entry: "2025-02-03",
    months: 20,
    agency: "Global Manpower",
    owner: "other",
  },
  {
    id: "T-2405",
    name: "Aung Kyaw",
    nationality: "mm",
    status: "completed",
    occupation: "agriculture",
    entry: "2023-06-12",
    months: 36,
    agency: "Kyoei",
    owner: "me",
  },
  {
    id: "T-2406",
    name: "Lê Minh Châu",
    nationality: "vn",
    status: "withdrawn",
    occupation: "food",
    entry: "2025-07-20",
    months: 5,
    agency: "Hanoi Manpower",
    owner: "other",
  },
  {
    id: "T-2407",
    name: "Dewi Lestari",
    nationality: "id",
    status: "training",
    occupation: "care",
    entry: "2025-09-01",
    months: 13,
    agency: "Sakura Karya",
    owner: "me",
  },
  {
    id: "T-2408",
    name: "Phạm Quốc Huy",
    nationality: "vn",
    status: "training",
    occupation: "construction",
    entry: "2025-12-10",
    months: 10,
    agency: "Hanoi Manpower",
    owner: "me",
  },
];

/** Every visible word comes from the docs catalogue (`searchFormDocs.*`, ja/en/vi). */
function useVocab() {
  const { t } = useTranslation();
  const k = (key: string, params?: Record<string, string | number>) =>
    t(`searchFormDocs.${key}`, params);
  const options = <T extends string>(group: string, values: readonly T[]) =>
    values.map((value) => ({ value, label: k(`${group}.${value}`) }));
  const columns: ColumnDef<Trainee>[] = [
    { key: "name", header: k("col.name") },
    {
      key: "nationality",
      header: k("col.nationality"),
      render: (r) => k(`nationality.${r.nationality}`),
    },
    {
      key: "status",
      header: k("col.status"),
      render: (r) => <Badge tone={STATUS_TONE[r.status]}>{k(`status.${r.status}`)}</Badge>,
    },
    {
      key: "occupation",
      header: k("col.occupation"),
      render: (r) => k(`occupation.${r.occupation}`),
    },
    {
      key: "months",
      header: k("col.months"),
      align: "right",
      render: (r) => r.months.toLocaleString(),
    },
  ];
  return { k, options, columns };
}

function Results({ rows, id, label }: { rows: Trainee[]; id?: string; label?: string }) {
  const { k, columns } = useVocab();
  return (
    <Card id={id} aria-label={label}>
      <CardContent flush>
        {rows.length === 0 ? (
          <EmptyState variant="compact" title={k("empty")} />
        ) : (
          <DataTable data={rows} columns={columns} getRowId={(r) => r.id} />
        )}
      </CardContent>
    </Card>
  );
}

function Layout({ letter, children }: { letter: string; children: React.ReactNode }) {
  const { k } = useVocab();
  const headingId = `search-layout-${letter}`;
  return (
    <Flex direction="col" gap="sm" role="region" aria-labelledby={headingId} data-layout={letter}>
      <Heading level={2} id={headingId}>
        {letter}. {k(`layout.${letter}.title`)}
      </Heading>
      <Text size="sm" tone="muted">
        {k(`layout.${letter}.when`)} · {k("mirrors", { products: k(`layout.${letter}.mirrors`) })}
      </Text>
      {children}
    </Flex>
  );
}

// ── l. 検索条件フォーム — SearchForm ──────────────────────────────────────────────────────────
type Conditions = {
  name: string;
  match: "partial" | "exact";
  nationality: string;
  statuses: string[];
  entryFrom: string;
  entryTo: string;
  monthsMin: number | null;
  monthsMax: number | null;
  occupation: string;
  agency: string;
};
const NO_CONDITIONS: Conditions = {
  name: "",
  match: "partial",
  nationality: "",
  statuses: [],
  entryFrom: "",
  entryTo: "",
  monthsMin: null,
  monthsMax: null,
  occupation: "",
  agency: "",
};

function searchTrainees(c: Conditions): Trainee[] {
  const name = c.name.trim().toLowerCase();
  return TRAINEES.filter(
    (r) =>
      (name === "" ||
        (c.match === "exact"
          ? r.name.toLowerCase() === name
          : r.name.toLowerCase().includes(name))) &&
      (c.nationality === "" || r.nationality === c.nationality) &&
      (c.statuses.length === 0 || c.statuses.includes(r.status)) &&
      (c.entryFrom === "" || r.entry >= c.entryFrom) &&
      (c.entryTo === "" || r.entry <= c.entryTo) &&
      (c.monthsMin == null || r.months >= c.monthsMin) &&
      (c.monthsMax == null || r.months <= c.monthsMax) &&
      (c.occupation === "" || r.occupation === c.occupation) &&
      (c.agency.trim() === "" || r.agency.toLowerCase().includes(c.agency.trim().toLowerCase())),
  );
}

const isoDate = (d: Date | undefined) =>
  d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    : "";

/** The 検索条件 line: only the conditions that are set, in form order. */
function useSummary(c: Conditions): string {
  const { k } = useVocab();
  const parts: string[] = [];
  if (c.name) parts.push(`${k("field.name")}: ${c.name} (${k(`match.${c.match}`)})`);
  if (c.nationality) parts.push(`${k("field.nationality")}: ${k(`nationality.${c.nationality}`)}`);
  if (c.statuses.length)
    parts.push(`${k("field.status")}: ${c.statuses.map((s) => k(`status.${s}`)).join("・")}`);
  if (c.entryFrom || c.entryTo) parts.push(`${k("field.entry")}: ${c.entryFrom}〜${c.entryTo}`);
  if (c.monthsMin != null || c.monthsMax != null)
    parts.push(`${k("field.months")}: ${c.monthsMin ?? ""}〜${c.monthsMax ?? ""}`);
  if (c.occupation) parts.push(`${k("field.occupation")}: ${k(`occupation.${c.occupation}`)}`);
  if (c.agency) parts.push(`${k("field.agency")}: ${c.agency}`);
  return parts.length ? parts.join(" / ") : k("noConditions");
}

/** The conditions as FormFields. Shared by the label-top and the label-left variant. */
function conditionFields(
  { k, options }: Pick<ReturnType<typeof useVocab>, "k" | "options">,
  { draft, set }: { draft: Conditions; set: (patch: Partial<Conditions>) => void },
  idPrefix: string,
) {
  return [
    <FormField key="name" label={k("field.name")} id={`${idPrefix}-name`}>
      <Flex direction="col" gap="xs">
        <Input
          id={`${idPrefix}-name`}
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
        />
        <RadioGroup
          aria-label={k("field.match")}
          orientation="horizontal"
          options={options("match", ["partial", "exact"] as const)}
          value={draft.match}
          onValueChange={(v) => set({ match: v === "exact" ? "exact" : "partial" })}
        />
      </Flex>
    </FormField>,
    <FormField
      key="nationality"
      label={k("field.nationality")}
      controlWidth="100%"
      id={`${idPrefix}-nationality`}
    >
      <Select
        id={`${idPrefix}-nationality`}
        options={options("nationality", NATIONALITIES)}
        value={draft.nationality}
        onValueChange={(v: string) => set({ nationality: v })}
        placeholder={k("all")}
        allowClear
      />
    </FormField>,
    <FormField key="status" label={k("field.status")}>
      <CheckboxGroup
        aria-label={k("field.status")}
        orientation="horizontal"
        options={options("status", STATUSES)}
        value={draft.statuses}
        onValueChange={(v) => set({ statuses: v })}
      />
    </FormField>,
    <FormField key="entry" label={k("field.entry")} id={`${idPrefix}-entry`}>
      <DatePicker
        id={`${idPrefix}-entry`}
        range
        onValueChange={(range) =>
          set({ entryFrom: isoDate(range?.from), entryTo: isoDate(range?.to) })
        }
      />
    </FormField>,
    <FormField key="months" label={k("field.months")} id={`${idPrefix}-months-min`}>
      <Flex gap="xs" align="center">
        <NumberInput
          id={`${idPrefix}-months-min`}
          aria-label={k("rangeMin")}
          min={0}
          value={draft.monthsMin}
          onValueChange={(v) => set({ monthsMin: v })}
        />
        <Text tone="muted">〜</Text>
        <NumberInput
          aria-label={k("rangeMax")}
          min={0}
          value={draft.monthsMax}
          onValueChange={(v) => set({ monthsMax: v })}
        />
      </Flex>
    </FormField>,
    <FormField
      key="occupation"
      label={k("field.occupation")}
      controlWidth="100%"
      id={`${idPrefix}-occupation`}
    >
      <Select
        id={`${idPrefix}-occupation`}
        options={options("occupation", OCCUPATIONS)}
        value={draft.occupation}
        onValueChange={(v: string) => set({ occupation: v })}
        placeholder={k("all")}
        allowClear
      />
    </FormField>,
    <FormField key="agency" label={k("field.agency")} id={`${idPrefix}-agency`}>
      <Input
        id={`${idPrefix}-agency`}
        value={draft.agency}
        onChange={(e) => set({ agency: e.target.value })}
      />
    </FormField>,
  ];
}

function useSearchState(initial: Partial<Conditions> = {}) {
  const [draft, setDraft] = React.useState<Conditions>({ ...NO_CONDITIONS, ...initial });
  const [applied, setApplied] = React.useState<Conditions>({ ...NO_CONDITIONS, ...initial });
  const set = (patch: Partial<Conditions>) => setDraft((cur) => ({ ...cur, ...patch }));
  return {
    draft,
    applied,
    set,
    submit: (e: React.FormEvent) => {
      e.preventDefault();
      setApplied(draft);
    },
    reset: () => {
      setDraft(NO_CONDITIONS);
      setApplied(NO_CONDITIONS);
    },
  };
}

function QueryForm() {
  const vocab = useVocab();
  const { k } = vocab;
  const top = useSearchState({ nationality: "vn", statuses: ["training"] });
  const left = useSearchState();
  const topRows = searchTrainees(top.applied);
  const leftRows = searchTrainees(left.applied);
  const topSummary = useSummary(top.applied);
  const leftSummary = useSummary(left.applied);
  return (
    <Layout letter="l">
      <Card>
        <CardContent>
          <SearchForm
            controlWidth="100%"
            onSubmit={top.submit}
            onReset={top.reset}
            summary={topSummary}
            resultCount={topRows.length}
          >
            {conditionFields(vocab, top, "sf-top")}
          </SearchForm>
        </CardContent>
      </Card>
      <Results rows={topRows} />
      <Heading level={3}>{k("variant.labelLeft")}</Heading>
      <SearchForm
        layout="horizontal"
        labelWidth="7rem"
        controlWidth="100%"
        columns={{ base: 1, lg: 2 }}
        onSubmit={left.submit}
        onReset={left.reset}
        summary={leftSummary}
        resultCount={leftRows.length}
      >
        {conditionFields(vocab, left, "sf-left")}
      </SearchForm>
    </Layout>
  );
}

// ── m. Condition builder ─────────────────────────────────────────────────────────────────────
type FieldKey = "nationality" | "status" | "occupation" | "months" | "name" | "agency";
type Operator = "contains" | "notContains" | "eq" | "neq" | "in" | "notIn" | "gte" | "lte";
type Row = { id: number; field: FieldKey; operator: Operator; value: string };
type Match = "all" | "any" | "custom";
type Builder = {
  match: Match;
  logic: string;
  rows: Row[];
  sort: string;
  direction: "asc" | "desc";
};

const FIELD_KIND: Record<FieldKey, "text" | "choice" | "number"> = {
  name: "text",
  agency: "text",
  nationality: "choice",
  status: "choice",
  occupation: "choice",
  months: "number",
};
const OPERATORS: Record<"text" | "choice" | "number", Operator[]> = {
  text: ["contains", "notContains", "eq", "neq"],
  choice: ["in", "notIn"],
  number: ["eq", "neq", "gte", "lte"],
};
const CHOICES: Record<string, readonly string[]> = {
  nationality: NATIONALITIES,
  status: STATUSES,
  occupation: OCCUPATIONS,
};

function matchRow(t: Trainee, row: Row): boolean {
  const actual = String(t[row.field]).toLowerCase();
  const want = row.value.trim().toLowerCase();
  if (want === "") return true;
  switch (row.operator) {
    case "contains":
    case "in":
      return FIELD_KIND[row.field] === "choice" ? actual === want : actual.includes(want);
    case "notContains":
    case "notIn":
      return FIELD_KIND[row.field] === "choice" ? actual !== want : !actual.includes(want);
    case "eq":
      return actual === want;
    case "neq":
      return actual !== want;
    case "gte":
      return Number(actual) >= Number(want);
    case "lte":
      return Number(actual) <= Number(want);
  }
}

/**
 * Salesforce-style filter logic over numbered rows: `1 AND (2 OR 3)`, `NOT 2`. Returns null when the
 * expression is malformed or names a row that does not exist, so the form can say so.
 */
function compileLogic(expr: string, count: number): ((hits: boolean[]) => boolean) | null {
  const tokens = expr.toUpperCase().match(/\d+|AND|OR|NOT|\(|\)|\S/g) ?? [];
  let pos = 0;
  type Node = (hits: boolean[]) => boolean;
  const parseOr = (): Node | null => {
    let left = parseAnd();
    while (left && tokens[pos] === "OR") {
      pos++;
      const right = parseAnd();
      if (!right) return null;
      const l = left;
      left = (h) => l(h) || right(h);
    }
    return left;
  };
  const parseAnd = (): Node | null => {
    let left = parseNot();
    while (left && tokens[pos] === "AND") {
      pos++;
      const right = parseNot();
      if (!right) return null;
      const l = left;
      left = (h) => l(h) && right(h);
    }
    return left;
  };
  const parseNot = (): Node | null => {
    if (tokens[pos] === "NOT") {
      pos++;
      const inner = parseNot();
      return inner ? (h) => !inner(h) : null;
    }
    if (tokens[pos] === "(") {
      pos++;
      const inner = parseOr();
      if (!inner || tokens[pos] !== ")") return null;
      pos++;
      return inner;
    }
    const n = Number(tokens[pos]);
    if (!Number.isInteger(n) || n < 1 || n > count) return null;
    pos++;
    return (h) => h[n - 1] ?? false;
  };
  const tree = tokens.length ? parseOr() : null;
  return tree && pos === tokens.length ? tree : null;
}

function applyBuilder(b: Builder): Trainee[] {
  const logic =
    b.match === "custom"
      ? compileLogic(b.logic, b.rows.length)
      : (hits: boolean[]) => (b.match === "all" ? hits.every(Boolean) : hits.some(Boolean));
  const rows = TRAINEES.filter((t) => {
    const hits = b.rows.map((r) => matchRow(t, r));
    return b.rows.length === 0 || (logic ? logic(hits) : true);
  });
  const key = b.sort as keyof Trainee;
  return [...rows].sort((a, z) => {
    const order = String(a[key]).localeCompare(String(z[key]), undefined, { numeric: true });
    return b.direction === "asc" ? order : -order;
  });
}

const DEFAULT_BUILDER: Builder = {
  match: "custom",
  logic: "1 AND (2 OR 3)",
  rows: [
    { id: 1, field: "nationality", operator: "in", value: "vn" },
    { id: 2, field: "occupation", operator: "in", value: "care" },
    { id: 3, field: "months", operator: "gte", value: "12" },
  ],
  sort: "months",
  direction: "desc",
};

/** The builder panel. Used on its own (m) and docked beside the list (o). */
function ConditionBuilder({
  value,
  onApply,
  idPrefix,
  onCancel,
}: {
  value: Builder;
  onApply: (b: Builder) => void;
  idPrefix: string;
  onCancel?: () => void;
}) {
  const { k, options } = useVocab();
  const [draft, setDraft] = React.useState<Builder>(value);
  const [viewName, setViewName] = React.useState("");
  const [saved, setSaved] = React.useState<string[]>([]);
  const nextId = React.useRef(Math.max(0, ...value.rows.map((r) => r.id)) + 1);
  const logicValid =
    draft.match !== "custom" || compileLogic(draft.logic, draft.rows.length) !== null;
  const patchRow = (id: number, patch: Partial<Row>) =>
    setDraft((cur) => ({
      ...cur,
      rows: cur.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  /** kintone's ＋ adds a blank condition right after its own row; null appends one. */
  const insertAfter = (rows: Row[], afterId: number | null): Row[] => {
    const blank: Row = { id: nextId.current++, field: "name", operator: "contains", value: "" };
    const at = afterId === null ? rows.length : rows.findIndex((r) => r.id === afterId) + 1;
    return [...rows.slice(0, at), blank, ...rows.slice(at)];
  };
  const fields = (Object.keys(FIELD_KIND) as FieldKey[]).map((f) => ({
    value: f,
    label: k(`field.${f}`),
  }));

  return (
    <Form
      role="search"
      aria-label={k("builder.title")}
      controlWidth="100%"
      onSubmit={(e) => {
        e.preventDefault();
        if (logicValid) onApply(draft);
      }}
    >
      <Flex direction="col" gap="md">
        <FormField label={k("builder.match")}>
          <RadioGroup
            aria-label={k("builder.match")}
            orientation="horizontal"
            options={options("builderMatch", ["all", "any", "custom"] as const)}
            value={draft.match}
            onValueChange={(v) => setDraft((cur) => ({ ...cur, match: v as Match }))}
          />
        </FormField>
        <Flex direction="col" gap="sm" role="group" aria-label={k("builder.rows")}>
          {draft.rows.map((row, index) => {
            const kind = FIELD_KIND[row.field];
            const n = index + 1;
            const rowLabel = k("builder.row", { n });
            return (
              /*
               * ONE line per condition, kintone-style: [No.] [field] [operator] [value] [＋][−].
               * A container grid: 24 tracks from the lg step (field 6, operator 5 — narrower, and
               * still wide enough for 「次のキーワードを含まない」 — value 10), 12 at md, where the
               * operator gets the extra track so its longest label is not cut. Below md (the docked
               * panel in o, a phone) it is 4 tracks, and `dense` backfills the ＋/− cell next to the
               * number, so No. and the buttons stay on the first line with field / operator / value
               * below.
               */
              <Flex key={row.id} direction="col" role="group" aria-label={rowLabel}>
                <ResponsiveGrid columns={{ base: 4, md: 12, lg: 24 }} gap="sm" align="center" dense>
                  <ResponsiveGrid.Item span={{ base: 1, md: 1, lg: 1 }}>
                    <Badge variant="outline">{n}</Badge>
                  </ResponsiveGrid.Item>
                  <ResponsiveGrid.Item span={{ base: 4, md: 3, lg: 6 }}>
                    <Select
                      aria-label={`${rowLabel} · ${k("builder.field")}`}
                      options={fields}
                      value={row.field}
                      onValueChange={(f: string) =>
                        patchRow(row.id, {
                          field: f as FieldKey,
                          operator: OPERATORS[FIELD_KIND[f as FieldKey]][0],
                          value: "",
                        })
                      }
                    />
                  </ResponsiveGrid.Item>
                  <ResponsiveGrid.Item span={{ base: 4, md: 4, lg: 5 }}>
                    <Select
                      aria-label={`${rowLabel} · ${k("builder.operator")}`}
                      options={options("operator", OPERATORS[kind])}
                      value={row.operator}
                      onValueChange={(op: string) => patchRow(row.id, { operator: op as Operator })}
                    />
                  </ResponsiveGrid.Item>
                  <ResponsiveGrid.Item span={{ base: 4, md: 3, lg: 10 }}>
                    {kind === "choice" ? (
                      <Select
                        aria-label={`${rowLabel} · ${k("builder.value")}`}
                        options={options(row.field, CHOICES[row.field])}
                        value={row.value}
                        onValueChange={(v: string) => patchRow(row.id, { value: v })}
                        placeholder={k("builder.value")}
                      />
                    ) : kind === "number" ? (
                      <NumberInput
                        aria-label={`${rowLabel} · ${k("builder.value")}`}
                        value={row.value === "" ? null : Number(row.value)}
                        onValueChange={(v) =>
                          patchRow(row.id, { value: v == null ? "" : String(v) })
                        }
                      />
                    ) : (
                      <Input
                        aria-label={`${rowLabel} · ${k("builder.value")}`}
                        value={row.value}
                        onChange={(e) => patchRow(row.id, { value: e.target.value })}
                      />
                    )}
                  </ResponsiveGrid.Item>
                  <ResponsiveGrid.Item span={{ base: 3, md: 1, lg: 2 }}>
                    <Flex gap="xs" justify="end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={k("builder.addAfter", { n })}
                        onClick={() =>
                          setDraft((cur) => ({ ...cur, rows: insertAfter(cur.rows, row.id) }))
                        }
                      >
                        <Plus aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={k("builder.remove", { n })}
                        onClick={() =>
                          setDraft((cur) => ({
                            ...cur,
                            rows: cur.rows.filter((r) => r.id !== row.id),
                          }))
                        }
                      >
                        <Minus aria-hidden="true" />
                      </Button>
                    </Flex>
                  </ResponsiveGrid.Item>
                </ResponsiveGrid>
              </Flex>
            );
          })}
          {/* With every row removed there is no ＋ left to press: offer one. */}
          {draft.rows.length === 0 && (
            <Flex>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDraft((cur) => ({ ...cur, rows: insertAfter(cur.rows, null) }))}
              >
                <Plus aria-hidden="true" />
                {k("builder.add")}
              </Button>
            </Flex>
          )}
        </Flex>
        {draft.match === "custom" && (
          <FormField
            label={k("builder.logic")}
            id={`${idPrefix}-logic`}
            helper={k("builder.logicHelper")}
            error={logicValid ? undefined : k("builder.logicError")}
          >
            <Input
              id={`${idPrefix}-logic`}
              value={draft.logic}
              onChange={(e) => setDraft((cur) => ({ ...cur, logic: e.target.value }))}
            />
          </FormField>
        )}
        <FormField label={k("builder.sort")} id={`${idPrefix}-sort`}>
          <ResponsiveGrid columns={{ base: 1, md: 3 }}>
            <Select
              id={`${idPrefix}-sort`}
              options={fields}
              value={draft.sort}
              onValueChange={(v: string) => setDraft((cur) => ({ ...cur, sort: v }))}
            />
            <Segmented
              aria-label={k("builder.direction")}
              options={options("direction", ["asc", "desc"] as const)}
              value={draft.direction}
              onValueChange={(v) =>
                setDraft((cur) => ({ ...cur, direction: v === "asc" ? "asc" : "desc" }))
              }
            />
          </ResponsiveGrid>
        </FormField>
        <FormField label={k("builder.viewName")} id={`${idPrefix}-view`}>
          <Flex gap="sm" align="center" wrap>
            <Input
              id={`${idPrefix}-view`}
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              disabled={viewName.trim() === "" || !logicValid}
              onClick={() => {
                setSaved((cur) => [...cur, viewName.trim()]);
                setViewName("");
              }}
            >
              {k("builder.saveView")}
            </Button>
          </Flex>
        </FormField>
        {saved.length > 0 && (
          <Text size="sm" tone="muted">
            {k("builder.savedViews")}: {saved.join("、")}
          </Text>
        )}
        <Flex gap="sm" justify="end" wrap>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {k("builder.cancel")}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={() => setDraft(value)}>
            {k("builder.revert")}
          </Button>
          <Button type="submit" disabled={!logicValid}>
            {k("builder.apply")}
          </Button>
        </Flex>
      </Flex>
    </Form>
  );
}

function useBuilderSummary(b: Builder): string {
  const { k } = useVocab();
  const parts = b.rows.map((r, i) => {
    const value =
      FIELD_KIND[r.field] === "choice" && r.value ? k(`${r.field}.${r.value}`) : r.value;
    return `${i + 1}. ${k(`field.${r.field}`)} ${k(`operator.${r.operator}`)} ${value}`;
  });
  const logic = b.match === "custom" ? b.logic : k(`builderMatch.${b.match}`);
  return `${parts.join(" / ")} (${logic})`;
}

function ConditionBuilderLayout() {
  const { k } = useVocab();
  const [applied, setApplied] = React.useState<Builder>(DEFAULT_BUILDER);
  const rows = applyBuilder(applied);
  const summary = useBuilderSummary(applied);
  return (
    <Layout letter="m">
      <Card>
        <CardHeader>
          <CardTitle level={3}>{k("builder.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ConditionBuilder value={applied} onApply={setApplied} idPrefix="cb-m" />
        </CardContent>
      </Card>
      <Text size="sm" tone="muted" role="status">
        {k("resultLine", { count: rows.length, summary })}
      </Text>
      <Results rows={rows} />
    </Layout>
  );
}

// ── n. Advanced search — one stacked form, each row label | input | what it means ─────────────
type Advanced = {
  all: string;
  exact: string;
  any: string;
  none: string;
  monthsFrom: number | null;
  monthsTo: number | null;
  nationality: string;
  updated: string;
  agency: string;
  scope: string;
  document: string;
};
const NO_ADVANCED: Advanced = {
  all: "",
  exact: "",
  any: "",
  none: "",
  monthsFrom: null,
  monthsTo: null,
  nationality: "",
  updated: "",
  agency: "",
  scope: "all",
  document: "",
};

/** The query the form stands for, in the search-box syntax its helper texts teach. */
function toQuery(a: Advanced): string {
  const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);
  return [
    ...words(a.all),
    a.exact.trim() ? `"${a.exact.trim()}"` : "",
    words(a.any).join(" OR "),
    ...words(a.none).map((w) => `-${w}`),
    a.monthsFrom != null || a.monthsTo != null ? `${a.monthsFrom ?? ""}..${a.monthsTo ?? ""}` : "",
    a.nationality ? `nationality:${a.nationality}` : "",
    a.agency.trim() ? `agency:${a.agency.trim()}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function advancedSearch(a: Advanced): Trainee[] {
  const words = (s: string) => s.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const text = (t: Trainee) => `${t.name} ${t.agency} ${t.id}`.toLowerCase();
  return TRAINEES.filter((t) => {
    const hay = text(t);
    return (
      words(a.all).every((w) => hay.includes(w)) &&
      (a.exact.trim() === "" || hay.includes(a.exact.trim().toLowerCase())) &&
      (words(a.any).length === 0 || words(a.any).some((w) => hay.includes(w))) &&
      words(a.none).every((w) => !hay.includes(w)) &&
      (a.monthsFrom == null || t.months >= a.monthsFrom) &&
      (a.monthsTo == null || t.months <= a.monthsTo) &&
      (a.nationality === "" || t.nationality === a.nationality) &&
      (a.agency.trim() === "" || t.agency.toLowerCase().includes(a.agency.trim().toLowerCase()))
    );
  });
}

function AdvancedSearch() {
  const { k, options } = useVocab();
  const [draft, setDraft] = React.useState<Advanced>({
    ...NO_ADVANCED,
    all: "Esuhai",
    monthsFrom: 6,
  });
  const [applied, setApplied] = React.useState<Advanced>(draft);
  const set = (patch: Partial<Advanced>) => setDraft((cur) => ({ ...cur, ...patch }));
  const rows = advancedSearch(applied);
  const text = (key: keyof Advanced & ("all" | "exact" | "any" | "none" | "agency")) => (
    <Input id={`adv-${key}`} value={draft[key]} onChange={(e) => set({ [key]: e.target.value })} />
  );
  /** One row: the labelled field, and on wide screens the explanation beside it. */
  const row = (key: string, control: React.ReactNode, id?: string) => (
    <ResponsiveGrid key={key} columns={{ base: 1, lg: 2 }}>
      <FormField label={k(`advanced.${key}`)} id={id ?? `adv-${key}`}>
        {control}
      </FormField>
      <Text size="sm" tone="muted">
        {k(`advanced.${key}Helper`)}
      </Text>
    </ResponsiveGrid>
  );
  return (
    <Layout letter="n">
      <Form
        role="search"
        aria-label={k("layout.n.title")}
        layout="horizontal"
        labelWidth="12rem"
        controlWidth="100%"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(draft);
        }}
      >
        <Flex direction="col" gap="lg">
          <Flex direction="col" gap="sm">
            <Heading level={3}>{k("advanced.find")}</Heading>
            {row("all", text("all"))}
            {row("exact", text("exact"))}
            {row("any", text("any"))}
            {row("none", text("none"))}
            {row(
              "range",
              <Flex gap="xs" align="center">
                <NumberInput
                  id="adv-range"
                  aria-label={k("rangeMin")}
                  min={0}
                  value={draft.monthsFrom}
                  onValueChange={(v) => set({ monthsFrom: v })}
                />
                <Text tone="muted">〜</Text>
                <NumberInput
                  aria-label={k("rangeMax")}
                  min={0}
                  value={draft.monthsTo}
                  onValueChange={(v) => set({ monthsTo: v })}
                />
              </Flex>,
            )}
          </Flex>
          <Flex direction="col" gap="sm">
            <Heading level={3}>{k("advanced.narrow")}</Heading>
            {row(
              "nationality",
              <Select
                id="adv-nationality"
                options={options("nationality", NATIONALITIES)}
                value={draft.nationality}
                onValueChange={(v: string) => set({ nationality: v })}
                placeholder={k("all")}
                allowClear
              />,
            )}
            {row(
              "updated",
              <Select
                id="adv-updated"
                options={options("updated", ["day", "week", "month", "year"] as const)}
                value={draft.updated}
                onValueChange={(v: string) => set({ updated: v })}
                placeholder={k("anytime")}
                allowClear
              />,
            )}
            {row("agency", text("agency"))}
            {row(
              "scope",
              <Select
                id="adv-scope"
                options={options("scope", ["all", "name", "notes"] as const)}
                value={draft.scope}
                onValueChange={(v: string) => set({ scope: v })}
              />,
            )}
            {row(
              "document",
              <Select
                id="adv-document"
                options={options("document", ["passport", "residence", "contract"] as const)}
                value={draft.document}
                onValueChange={(v: string) => set({ document: v })}
                placeholder={k("all")}
                allowClear
              />,
            )}
          </Flex>
          <Flex justify="end">
            <Button type="submit">{k("advanced.submit")}</Button>
          </Flex>
        </Flex>
      </Form>
      <Text size="sm" tone="muted" role="status">
        {k("advanced.query", { query: toQuery(applied) || "—", count: rows.length })}
      </Text>
      <Results rows={rows} />
    </Layout>
  );
}

// ── o. List view: picker + search + docked filter panel ──────────────────────────────────────
const LIST_VIEWS = ["recent", "all", "mine", "careVn"] as const;
type ListView = (typeof LIST_VIEWS)[number];

function ListViewLayout() {
  const { k } = useVocab();
  const docked = useMediaQuery("(min-width: 1024px)");
  const [view, setView] = React.useState<ListView>("all");
  const [pinned, setPinned] = React.useState<ListView>("all");
  const [q, setQ] = React.useState("");
  const [showMe, setShowMe] = React.useState<"all" | "mine">("all");
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [builder, setBuilder] = React.useState<Builder>({
    ...DEFAULT_BUILDER,
    match: "all",
    rows: [DEFAULT_BUILDER.rows[2]],
  });
  const viewRows = TRAINEES.filter((t) =>
    view === "mine"
      ? t.owner === "me"
      : view === "careVn"
        ? t.occupation === "care" && t.nationality === "vn"
        : true,
  ).slice(0, view === "recent" ? 4 : undefined);
  const rows = applyBuilder(builder).filter(
    (t) =>
      viewRows.includes(t) &&
      (showMe === "all" || t.owner === "me") &&
      (q.trim() === "" || t.name.toLowerCase().includes(q.trim().toLowerCase())),
  );
  const summary = useBuilderSummary(builder);
  const panel = (
    <Flex direction="col" gap="md">
      <FormField label={k("listView.showMe")}>
        <Segmented
          aria-label={k("listView.showMe")}
          options={[
            { value: "all", label: k("listView.showAll") },
            { value: "mine", label: k("listView.showMine") },
          ]}
          value={showMe}
          onValueChange={(v) => setShowMe(v === "mine" ? "mine" : "all")}
        />
      </FormField>
      <ConditionBuilder
        key={JSON.stringify(builder)}
        value={builder}
        onApply={setBuilder}
        idPrefix="cb-o"
        onCancel={docked ? () => setPanelOpen(false) : undefined}
      />
    </Flex>
  );
  const filterCount = builder.rows.length + (showMe === "mine" ? 1 : 0);
  return (
    <Layout letter="o">
      <Flex direction="col" gap="xs" align="start">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <Text size="lg" weight="semibold">
                {k(`listView.${view}`)}
              </Text>
              <ChevronDown aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{k("listView.picker")}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={view} onValueChange={(v) => setView(v as ListView)}>
              {LIST_VIEWS.map((v) => (
                <DropdownMenuRadioItem key={v} value={v}>
                  {k(`listView.${v}`)}
                  {pinned === v ? ` · ${k("listView.pinned")}` : ""}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Text size="sm" tone="muted" role="status">
          {k("listView.summary", { count: rows.length, summary })}
        </Text>
      </Flex>
      <FilterBar
        search={{
          value: q,
          onValueChange: setQ,
          placeholder: k("listView.search"),
          ariaLabel: k("listView.search"),
        }}
        actions={
          <>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={pinned === view ? k("listView.unpin") : k("listView.pin")}
              aria-pressed={pinned === view}
              onClick={() => setPinned(view)}
            >
              {pinned === view ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-sm" aria-label={k("listView.controls")}>
                  <Settings aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>{k("listView.new")}</DropdownMenuItem>
                <DropdownMenuItem>{k("listView.clone")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{k("listView.sharing")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {docked ? (
              <Button
                variant="outline"
                size="sm"
                aria-pressed={panelOpen}
                aria-controls="search-layout-o-panel"
                count={filterCount}
                showZero={false}
                countLabel={k("listView.filtersApplied")}
                onClick={() => setPanelOpen((v) => !v)}
              >
                <SlidersHorizontal aria-hidden="true" />
                {k("listView.filters")}
              </Button>
            ) : (
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    count={filterCount}
                    showZero={false}
                    countLabel={k("listView.filtersApplied")}
                  >
                    <SlidersHorizontal aria-hidden="true" />
                    {k("listView.filters")}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>{k("listView.filters")}</SheetTitle>
                    <SheetDescription>{k("listView.sheetDescription")}</SheetDescription>
                  </SheetHeader>
                  <SheetBody>{panel}</SheetBody>
                </SheetContent>
              </Sheet>
            )}
          </>
        }
      />
      {docked ? (
        <SplitPane
          asideWidth="lg"
          asideLabel={k("listView.filters")}
          aside={
            panelOpen ? (
              <Card id="search-layout-o-panel">
                <CardHeader>
                  <CardTitle level={3}>{k("listView.filters")}</CardTitle>
                </CardHeader>
                <CardContent>{panel}</CardContent>
              </Card>
            ) : null
          }
        >
          <Results rows={rows} />
        </SplitPane>
      ) : (
        <Results rows={rows} />
      )}
    </Layout>
  );
}

export default function Demo() {
  const { k } = useVocab();
  return (
    <PageContainer title="SearchForm" subtitle={k("page.subtitle")}>
      <Flex direction="col" gap="xl">
        <Text>{k("page.decision")}</Text>
        <QueryForm />
        <ConditionBuilderLayout />
        <AdvancedSearch />
        <ListViewLayout />
      </Flex>
    </PageContainer>
  );
}
