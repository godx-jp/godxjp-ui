import * as React from "react";
import {
  Download,
  GripVertical,
  ListFilter,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  SlidersHorizontal,
} from "lucide-react";

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
  Checkbox,
  DatePicker,
  SearchInput,
  Segmented,
  Select,
  Switch,
} from "@godxjp/ui/data-entry";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@godxjp/ui/feedback";
import { Button, Heading, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { useMediaQuery } from "@godxjp/ui/hooks";
import {
  Flex,
  MasterDetail,
  PageContainer,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@godxjp/ui/layout";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FilterBar,
  FilterBarGroup,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@godxjp/ui/navigation";
import type { PanelImperativeHandle } from "react-resizable-panels";

/**
 * FilterBar layouts — one gallery of the filter layouts leading products use, every one built from
 * FilterBar and existing primitives. Filters are PACKED at the start of the bar with one gap; the
 * only element that sits at the far end is the `actions` slot (with the clear button). A
 * hand-built Flex/Card of FormFields above a table is ui-audit `hand-rolled-filter-bar`.
 */

// ── Shared data: 送出機関 (sending organisations), JA/EN/VI ────────────────────────────────
type Country = "vn" | "id" | "ph" | "mm";
type Status = "active" | "review" | "suspended";
type Agency = {
  id: string;
  name: string;
  country: Country;
  status: Status;
  trainees: number;
  occupation: string;
};

const COUNTRY_VALUES: Country[] = ["vn", "id", "ph", "mm"];
const STATUS_TONE: Record<Status, "success" | "warning" | "muted"> = {
  active: "success",
  review: "warning",
  suspended: "muted",
};
const OCCUPATION_VALUES = ["construction", "care", "food"];

const AGENCIES: Agency[] = [
  {
    id: "A-101",
    name: "Công ty CP Nhân lực Quốc tế Hà Nội",
    country: "vn",
    status: "active",
    trainees: 128,
    occupation: "construction",
  },
  {
    id: "A-102",
    name: "PT. Sakura Karya Indonesia",
    country: "id",
    status: "review",
    trainees: 42,
    occupation: "food",
  },
  {
    id: "A-103",
    name: "Philippine Global Manpower Inc.",
    country: "ph",
    status: "active",
    trainees: 86,
    occupation: "care",
  },
  {
    id: "A-104",
    name: "Myanmar Kyoei Human Resources Co., Ltd.",
    country: "mm",
    status: "suspended",
    trainees: 0,
    occupation: "construction",
  },
  {
    id: "A-105",
    name: "Công ty TNHH Đào tạo Esuhai",
    country: "vn",
    status: "active",
    trainees: 214,
    occupation: "care",
  },
];

/** Every visible word comes from the docs catalogue (`filterBarLayoutsDocs.*`, ja/en/vi). */
function useVocab() {
  const { t } = useTranslation();
  const k = (key: string, params?: Record<string, string | number>) =>
    t(`filterBarLayoutsDocs.${key}`, params);
  const countryLabel = (c: string) => k(`country.${c}`);
  const statusLabel = (s: string) => k(`status.${s}`);
  const occupationLabel = (o: string) => k(`occupation.${o}`);
  const countryOptions = COUNTRY_VALUES.map((value) => ({ value, label: countryLabel(value) }));
  const statusOptions = (Object.keys(STATUS_TONE) as Status[]).map((value) => ({
    value,
    label: statusLabel(value),
  }));
  const occupationOptions = OCCUPATION_VALUES.map((value) => ({
    value,
    label: occupationLabel(value),
  }));
  const columns: ColumnDef<Agency>[] = [
    { key: "name", header: k("col.name") },
    { key: "country", header: k("col.country"), render: (r) => countryLabel(r.country) },
    {
      key: "status",
      header: k("col.status"),
      render: (r) => <Badge tone={STATUS_TONE[r.status]}>{statusLabel(r.status)}</Badge>,
    },
    {
      key: "trainees",
      header: k("col.trainees"),
      align: "right",
      render: (r) => r.trainees.toLocaleString(),
    },
  ];
  return {
    k,
    countryOptions,
    statusOptions,
    occupationOptions,
    columns,
    countryLabel,
    statusLabel,
    occupationLabel,
  };
}

type Criteria = {
  q?: string;
  countries?: string[];
  statuses?: string[];
  occupations?: string[];
  includeSuspended?: boolean;
};

function filterAgencies(c: Criteria): Agency[] {
  const q = c.q?.trim().toLowerCase() ?? "";
  return AGENCIES.filter(
    (a) =>
      (q === "" || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)) &&
      (!c.countries?.length || c.countries.includes(a.country)) &&
      (!c.statuses?.length || c.statuses.includes(a.status)) &&
      (!c.occupations?.length || c.occupations.includes(a.occupation)) &&
      (c.includeSuspended !== false || a.status !== "suspended"),
  );
}

/** The table surface every layout filters: ONE Card, flush, with an empty state. */
function Results({ rows, id, label }: { rows: Agency[]; id?: string; label?: string }) {
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

/** One gallery entry: a heading, one line of "when to use · mirrors", and the working layout. */
function Layout({ letter, children }: { letter: string; children: React.ReactNode }) {
  const { k } = useVocab();
  const headingId = `filter-layout-${letter}`;
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

// ── a. Inline packed bar ─────────────────────────────────────────────────────────────────────
function InlinePacked() {
  const { k, countryOptions, statusOptions } = useVocab();
  const [q, setQ] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [includeSuspended, setIncludeSuspended] = React.useState(false);
  const rows = filterAgencies({
    q,
    countries: country ? [country] : [],
    statuses: status ? [status] : [],
    includeSuspended,
  });
  const active = q !== "" || country !== "" || status !== "" || includeSuspended;
  return (
    <Layout letter="a">
      <FilterBar
        search={{
          value: q,
          onValueChange: setQ,
          placeholder: k("search.placeholder"),
          ariaLabel: k("search.label"),
        }}
        filters={[
          {
            value: "country",
            label: k("label.country"),
            options: countryOptions,
            selected: country,
            onSelectedChange: setCountry,
            placeholder: k("all"),
          },
          {
            value: "status",
            label: k("label.status"),
            options: statusOptions,
            selected: status,
            onSelectedChange: setStatus,
            placeholder: k("all"),
          },
        ]}
        hasActiveFilters={active}
        onClear={() => {
          setQ("");
          setCountry("");
          setStatus("");
          setIncludeSuspended(false);
        }}
        resultCount={rows.length}
      >
        <FilterBarGroup label={k("label.includeSuspended")} controlId="fl-a-suspended">
          <Switch
            id="fl-a-suspended"
            checked={includeSuspended}
            onCheckedChange={setIncludeSuspended}
          />
        </FilterBarGroup>
      </FilterBar>
      <Results rows={rows} />
    </Layout>
  );
}

// ── b. Search-first + Filter menu + chips ────────────────────────────────────────────────────
function SearchFirstMenu() {
  const { k, countryOptions, statusOptions, countryLabel, statusLabel } = useVocab();
  const [q, setQ] = React.useState("");
  const [countries, setCountries] = React.useState<string[]>(["vn"]);
  const [statuses, setStatuses] = React.useState<string[]>([]);
  const toggle = (list: string[], value: string, on: boolean) =>
    on ? [...list, value] : list.filter((v) => v !== value);
  const chips = [
    ...countries.map((c) => ({
      value: `country:${c}`,
      label: k("chip.country", { value: countryLabel(c) }),
    })),
    ...statuses.map((s) => ({
      value: `status:${s}`,
      label: k("chip.status", { value: statusLabel(s) }),
    })),
  ];
  const rows = filterAgencies({ q, countries, statuses });
  return (
    <Layout letter="b">
      <FilterBar
        search={{
          value: q,
          onValueChange: setQ,
          placeholder: k("search.label"),
          ariaLabel: k("search.label"),
        }}
        chips={chips}
        onChipRemove={(value) => {
          const [kind, v] = value.split(":");
          if (kind === "country") setCountries((cur) => cur.filter((c) => c !== v));
          else setStatuses((cur) => cur.filter((s) => s !== v));
        }}
        hasActiveFilters={chips.length > 0 || q !== ""}
        onClear={() => {
          setQ("");
          setCountries([]);
          setStatuses([]);
        }}
        clearDisplay="icon"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              count={chips.length}
              showZero={false}
              countLabel={k("appliedCount")}
            >
              <ListFilter aria-hidden="true" />
              {k("filterMenu")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{k("label.country")}</DropdownMenuLabel>
            {countryOptions.map((c) => (
              <DropdownMenuCheckboxItem
                key={c.value}
                checked={countries.includes(c.value)}
                onCheckedChange={(on) => setCountries((cur) => toggle(cur, c.value, on === true))}
              >
                {c.label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{k("label.status")}</DropdownMenuLabel>
            {statusOptions.map((s) => (
              <DropdownMenuCheckboxItem
                key={s.value}
                checked={statuses.includes(s.value)}
                onCheckedChange={(on) => setStatuses((cur) => toggle(cur, s.value, on === true))}
              >
                {s.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </FilterBar>
      <Results rows={rows} />
    </Layout>
  );
}

// ── c. Promoted filters + ONE "More filters" Sheet (pattern list-filters) ───────────────────
function PromotedMore() {
  const {
    k,
    countryOptions,
    statusOptions,
    occupationOptions,
    countryLabel,
    statusLabel,
    occupationLabel,
  } = useVocab();
  const [status, setStatus] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [occupation, setOccupation] = React.useState("care");
  const hiddenApplied = [country, occupation].filter((v) => v !== "").length;
  const chips = [
    ...(status
      ? [{ value: "status", label: k("chip.status", { value: statusLabel(status) }) }]
      : []),
    ...(country
      ? [{ value: "country", label: k("chip.country", { value: countryLabel(country) }) }]
      : []),
    ...(occupation
      ? [
          {
            value: "occupation",
            label: k("chip.occupation", { value: occupationLabel(occupation) }),
          },
        ]
      : []),
  ];
  const rows = filterAgencies({
    statuses: status ? [status] : [],
    countries: country ? [country] : [],
    occupations: occupation ? [occupation] : [],
  });
  return (
    <Layout letter="c">
      <FilterBar
        filters={[
          {
            value: "status",
            label: k("label.status"),
            options: statusOptions,
            selected: status,
            onSelectedChange: setStatus,
            placeholder: k("all"),
          },
        ]}
        chips={chips}
        onChipRemove={(value) => {
          if (value === "status") setStatus("");
          if (value === "country") setCountry("");
          if (value === "occupation") setOccupation("");
        }}
        hasActiveFilters={chips.length > 0}
        onClear={() => {
          setStatus("");
          setCountry("");
          setOccupation("");
        }}
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              count={hiddenApplied}
              showZero={false}
              countLabel={k("appliedCount")}
            >
              <SlidersHorizontal aria-hidden="true" />
              {k("more.button")}
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>{k("more.button")}</SheetTitle>
              <SheetDescription>{k("more.description")}</SheetDescription>
            </SheetHeader>
            <SheetBody>
              <Flex direction="col" gap="md">
                <FilterBarGroup label={k("label.country")} controlId="fl-c-country">
                  <Select
                    id="fl-c-country"
                    options={countryOptions}
                    value={country}
                    onValueChange={setCountry}
                    placeholder={k("all")}
                    allowClear
                  />
                </FilterBarGroup>
                <FilterBarGroup label={k("label.occupation")} controlId="fl-c-occupation">
                  <Select
                    id="fl-c-occupation"
                    options={occupationOptions}
                    value={occupation}
                    onValueChange={setOccupation}
                    placeholder={k("all")}
                    allowClear
                  />
                </FilterBarGroup>
              </Flex>
            </SheetBody>
            <SheetFooter>
              <SheetClose asChild>
                <Button>{k("showResults")}</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </FilterBar>
      <Results rows={rows} />
    </Layout>
  );
}

// ── d. Saved views above the bar ─────────────────────────────────────────────────────────────
const VIEWS: { value: string; criteria: Criteria }[] = [
  { value: "all", criteria: {} },
  { value: "active", criteria: { statuses: ["active"] } },
  { value: "review", criteria: { statuses: ["review"] } },
  { value: "vn", criteria: { countries: ["vn"] } },
];

function SavedViews() {
  const { k } = useVocab();
  const [view, setView] = React.useState("active");
  const [q, setQ] = React.useState("");
  const criteria = VIEWS.find((v) => v.value === view)!.criteria;
  const rows = filterAgencies({ ...criteria, q });
  return (
    <Layout letter="d">
      <FilterBar
        views={
          <Tabs value={view} onValueChange={setView} controls="filter-layout-d-results">
            <TabsList>
              {VIEWS.map((v) => (
                <TabsTrigger
                  key={v.value}
                  value={v.value}
                  count={filterAgencies(v.criteria).length}
                  countLabel={k("views.countLabel")}
                >
                  {k(`views.${v.value}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
        search={{
          value: q,
          onValueChange: setQ,
          placeholder: k("search.inView"),
          ariaLabel: k("search.inView"),
        }}
        hasActiveFilters={q !== ""}
        onClear={() => setQ("")}
        clearDisplay="icon"
      />
      <Results rows={rows} id="filter-layout-d-results" label={k("results")} />
    </Layout>
  );
}

// ── e. Two rows: wide search, then filters ───────────────────────────────────────────────────
function TwoRows() {
  const { k, countryOptions, occupationOptions } = useVocab();
  const [q, setQ] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [occupations, setOccupations] = React.useState<string[]>([]);
  const rows = filterAgencies({
    q,
    countries: country ? [country] : [],
    occupations,
  });
  return (
    <Layout letter="e">
      <Flex direction="col" gap="sm">
        <SearchInput
          value={q}
          onValueChange={setQ}
          placeholder={k("search.keyword")}
          aria-label={k("search.keyword")}
        />
        <FilterBar
          hasActiveFilters={country !== "" || occupations.length > 0}
          onClear={() => {
            setCountry("");
            setOccupations([]);
          }}
          resultCount={rows.length}
          filters={[
            {
              value: "country",
              label: k("label.country"),
              options: countryOptions,
              selected: country,
              onSelectedChange: setCountry,
              placeholder: k("all"),
            },
          ]}
        >
          {occupationOptions.map((o) => (
            <Checkbox
              key={o.value}
              checked={occupations.includes(o.value)}
              onCheckedChange={(on) =>
                setOccupations((cur) =>
                  on === true ? [...cur, o.value] : cur.filter((v) => v !== o.value),
                )
              }
            >
              {o.label}
            </Checkbox>
          ))}
        </FilterBar>
      </Flex>
      <Results rows={rows} />
    </Layout>
  );
}

// ── f. Bar + actions at the end, sticky ──────────────────────────────────────────────────────
function WithActions() {
  const { k, statusOptions } = useVocab();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("");
  const rows = filterAgencies({ q, statuses: status ? [status] : [] });
  return (
    <Layout letter="f">
      <FilterBar
        sticky
        search={{
          value: q,
          onValueChange: setQ,
          placeholder: k("search.placeholder"),
          ariaLabel: k("search.placeholder"),
        }}
        filters={[
          {
            value: "status",
            label: k("label.status"),
            options: statusOptions,
            selected: status,
            onSelectedChange: setStatus,
            placeholder: k("all"),
          },
        ]}
        hasActiveFilters={q !== "" || status !== ""}
        onClear={() => {
          setQ("");
          setStatus("");
        }}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download aria-hidden="true" />
              {k("actions.export")}
            </Button>
            <Button size="sm">
              <Plus aria-hidden="true" />
              {k("actions.add")}
            </Button>
          </>
        }
      />
      <Results rows={rows} />
    </Layout>
  );
}

// ── g. Faceted sidebar ───────────────────────────────────────────────────────────────────────
function Facets({
  countries,
  setCountries,
  statuses,
  setStatuses,
  idPrefix,
}: {
  countries: string[];
  setCountries: (v: string[]) => void;
  statuses: string[];
  setStatuses: (v: string[]) => void;
  idPrefix: string;
}) {
  const { k, countryOptions, statusOptions } = useVocab();
  const count = (criteria: Criteria) => filterAgencies(criteria).length;
  return (
    <Flex direction="col" gap="md">
      <FilterBarGroup label={k("label.country")}>
        <Flex direction="col" gap="xs">
          {countryOptions.map((c) => (
            <Checkbox
              key={c.value}
              id={`${idPrefix}-country-${c.value}`}
              checked={countries.includes(c.value)}
              onCheckedChange={(on) =>
                setCountries(
                  on === true ? [...countries, c.value] : countries.filter((v) => v !== c.value),
                )
              }
            >
              {c.label} ({count({ countries: [c.value] })})
            </Checkbox>
          ))}
        </Flex>
      </FilterBarGroup>
      <FilterBarGroup label={k("label.status")}>
        <Flex direction="col" gap="xs">
          {statusOptions.map((s) => (
            <Checkbox
              key={s.value}
              id={`${idPrefix}-status-${s.value}`}
              checked={statuses.includes(s.value)}
              onCheckedChange={(on) =>
                setStatuses(
                  on === true ? [...statuses, s.value] : statuses.filter((v) => v !== s.value),
                )
              }
            >
              {s.label} ({count({ statuses: [s.value] })})
            </Checkbox>
          ))}
        </Flex>
      </FilterBarGroup>
    </Flex>
  );
}

function FacetedSidebar() {
  const { k } = useVocab();
  const wide = useMediaQuery("(min-width: 768px)");
  const [countries, setCountries] = React.useState<string[]>([]);
  const [statuses, setStatuses] = React.useState<string[]>(["active"]);
  const [q, setQ] = React.useState("");
  const rows = filterAgencies({ q, countries, statuses });
  const facets = (prefix: string) => (
    <Facets
      idPrefix={prefix}
      countries={countries}
      setCountries={setCountries}
      statuses={statuses}
      setStatuses={setStatuses}
    />
  );
  const bar = (
    <FilterBar
      search={{
        value: q,
        onValueChange: setQ,
        placeholder: k("search.placeholder"),
        ariaLabel: k("search.placeholder"),
      }}
      hasActiveFilters={countries.length + statuses.length > 0 || q !== ""}
      onClear={() => {
        setQ("");
        setCountries([]);
        setStatuses([]);
      }}
      resultCount={rows.length}
    >
      {!wide && (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              count={countries.length + statuses.length}
              showZero={false}
              countLabel={k("appliedCount")}
            >
              <SlidersHorizontal aria-hidden="true" />
              {k("facets.button")}
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>{k("facets.button")}</SheetTitle>
              <SheetDescription>{k("facets.description")}</SheetDescription>
            </SheetHeader>
            <SheetBody>{facets("fl-g-sheet")}</SheetBody>
            <SheetFooter>
              <SheetClose asChild>
                <Button>{k("showResults")}</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </FilterBar>
  );
  return (
    <Layout letter="g">
      {wide ? (
        <MasterDetail
          rail="master"
          railWidth="narrow"
          collapseBelow={false}
          masterLabel={k("facets.button")}
          detailLabel={k("results")}
          master={facets("fl-g-rail")}
        >
          <Flex direction="col" gap="sm">
            {bar}
            <Results rows={rows} />
          </Flex>
        </MasterDetail>
      ) : (
        <Flex direction="col" gap="sm">
          {bar}
          <Results rows={rows} />
        </Flex>
      )}
    </Layout>
  );
}

// ── h. Compact bar inside the table Card ─────────────────────────────────────────────────────
function CompactInCard() {
  const { k, statusOptions, columns } = useVocab();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("");
  const rows = filterAgencies({ q, statuses: status ? [status] : [] });
  return (
    <Layout letter="h">
      <Card>
        <CardContent>
          <Flex direction="col" gap="sm">
            <CardTitle level={3}>{k("card.title")}</CardTitle>
            <FilterBar
              hasActiveFilters={q !== "" || status !== ""}
              onClear={() => {
                setQ("");
                setStatus("");
              }}
              clearDisplay="icon"
            >
              <SearchInput
                value={q}
                onValueChange={setQ}
                placeholder={k("search.short")}
                aria-label={k("card.searchLabel")}
              />
              <FilterBarGroup label={k("label.status")} controlId="fl-h-status">
                <Select
                  id="fl-h-status"
                  options={statusOptions}
                  value={status}
                  onValueChange={setStatus}
                  placeholder={k("all")}
                  allowClear
                />
              </FilterBarGroup>
            </FilterBar>
          </Flex>
        </CardContent>
        <CardContent flush>
          <DataTable data={rows} columns={columns} getRowId={(r) => r.id} density="compact" />
        </CardContent>
      </Card>
    </Layout>
  );
}

// ── i. Date range + quick ranges ─────────────────────────────────────────────────────────────
const QUICK_RANGE_VALUES = ["7d", "30d", "q", "custom"];

function DateRangeQuick() {
  const { k, countryOptions } = useVocab();
  const [quick, setQuick] = React.useState("30d");
  const [country, setCountry] = React.useState("");
  return (
    <Layout letter="i">
      <FilterBar
        hasActiveFilters={quick !== "30d" || country !== ""}
        onClear={() => {
          setQuick("30d");
          setCountry("");
        }}
        filters={[
          {
            value: "country",
            label: k("label.country"),
            options: countryOptions,
            selected: country,
            onSelectedChange: setCountry,
            placeholder: k("all"),
          },
        ]}
      >
        <FilterBarGroup label={k("label.period")}>
          <Segmented
            aria-label={k("label.period")}
            options={QUICK_RANGE_VALUES.map((value) => ({ value, label: k(`range.${value}`) }))}
            value={quick}
            onValueChange={setQuick}
          />
        </FilterBarGroup>
        {quick === "custom" && (
          <FilterBarGroup label={k("label.dateRange")} controlId="fl-i-range">
            <DatePicker id="fl-i-range" range />
          </FilterBarGroup>
        )}
      </FilterBar>
      <Results rows={filterAgencies({ countries: country ? [country] : [] })} />
    </Layout>
  );
}

// ── j. Phone: stacked bar + Sheet ────────────────────────────────────────────────────────────
function PhoneStacked() {
  const { k, countryOptions, statusOptions, countryLabel, statusLabel } = useVocab();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [country, setCountry] = React.useState("");
  const rows = filterAgencies({
    q,
    statuses: status ? [status] : [],
    countries: country ? [country] : [],
  });
  const chips = [
    ...(status
      ? [{ value: "status", label: k("chip.status", { value: statusLabel(status) }) }]
      : []),
    ...(country
      ? [{ value: "country", label: k("chip.country", { value: countryLabel(country) }) }]
      : []),
  ];
  return (
    <Layout letter="j">
      <FilterBar
        search={{
          value: q,
          onValueChange: setQ,
          placeholder: k("search.short"),
          ariaLabel: k("search.short"),
        }}
        chips={chips}
        onChipRemove={(v) => (v === "status" ? setStatus("") : setCountry(""))}
        hasActiveFilters={chips.length > 0 || q !== ""}
        onClear={() => {
          setQ("");
          setStatus("");
          setCountry("");
        }}
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              count={chips.length}
              showZero={false}
              countLabel={k("appliedCount")}
            >
              <SlidersHorizontal aria-hidden="true" />
              {k("facets.button")}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>{k("facets.button")}</SheetTitle>
              <SheetDescription>{k("facets.description")}</SheetDescription>
            </SheetHeader>
            <SheetBody>
              <Flex direction="col" gap="md">
                <FilterBarGroup label={k("label.status")} controlId="fl-j-status">
                  <Select
                    id="fl-j-status"
                    options={statusOptions}
                    value={status}
                    onValueChange={setStatus}
                    placeholder={k("all")}
                    allowClear
                  />
                </FilterBarGroup>
                <FilterBarGroup label={k("label.country")} controlId="fl-j-country">
                  <Select
                    id="fl-j-country"
                    options={countryOptions}
                    value={country}
                    onValueChange={setCountry}
                    placeholder={k("all")}
                    allowClear
                  />
                </FilterBarGroup>
              </Flex>
            </SheetBody>
            <SheetFooter>
              <SheetClose asChild>
                <Button>{k("showCount", { count: rows.length })}</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </FilterBar>
      <Results rows={rows} />
    </Layout>
  );
}

// ── k. Docked filter panel ───────────────────────────────────────────────────────────────────
const DOCK_STORAGE_KEY = "godxjp-docs:filter-layout-k:open";

function readDockOpen(): boolean {
  try {
    return window.localStorage.getItem(DOCK_STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

function DockedPanel() {
  const { k, countryLabel, statusLabel } = useVocab();
  const docked = useMediaQuery("(min-width: 1024px)");
  const panelRef = React.useRef<PanelImperativeHandle | null>(null);
  const [open, setOpen] = React.useState(readDockOpen);
  const [countries, setCountries] = React.useState<string[]>(["vn", "ph"]);
  const [statuses, setStatuses] = React.useState<string[]>([]);
  const [q, setQ] = React.useState("");
  const rows = filterAgencies({ q, countries, statuses });
  const chips = [
    ...countries.map((c) => ({
      value: `country:${c}`,
      label: k("chip.country", { value: countryLabel(c) }),
    })),
    ...statuses.map((s) => ({
      value: `status:${s}`,
      label: k("chip.status", { value: statusLabel(s) }),
    })),
  ];
  const remember = (next: boolean) => {
    setOpen(next);
    try {
      window.localStorage.setItem(DOCK_STORAGE_KEY, String(next));
    } catch {
      /* Private mode: the panel still toggles, it just is not remembered. */
    }
  };
  const toggleDock = () => {
    const panel = panelRef.current;
    if (panel) {
      if (open) panel.collapse();
      else panel.expand();
    }
    remember(!open);
  };
  const facets = (prefix: string) => (
    <Facets
      idPrefix={prefix}
      countries={countries}
      setCountries={setCountries}
      statuses={statuses}
      setStatuses={setStatuses}
    />
  );
  const toggleLabel = open ? k("dock.close") : k("dock.open");
  const bar = (
    <FilterBar
      search={{
        value: q,
        onValueChange: setQ,
        placeholder: k("search.placeholder"),
        ariaLabel: k("search.placeholder"),
      }}
      chips={chips}
      onChipRemove={(value) => {
        const [kind, v] = value.split(":");
        if (kind === "country") setCountries((cur) => cur.filter((c) => c !== v));
        else setStatuses((cur) => cur.filter((s) => s !== v));
      }}
      hasActiveFilters={chips.length > 0 || q !== ""}
      onClear={() => {
        setQ("");
        setCountries([]);
        setStatuses([]);
      }}
      actions={
        docked ? (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDock}
            aria-expanded={open}
            aria-controls="filter-layout-k-panel"
            count={chips.length}
            showZero={false}
            countLabel={k("appliedCount")}
          >
            {open ? <PanelRightClose aria-hidden="true" /> : <PanelRightOpen aria-hidden="true" />}
            {toggleLabel}
          </Button>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                count={chips.length}
                showZero={false}
                countLabel={k("appliedCount")}
              >
                <SlidersHorizontal aria-hidden="true" />
                {k("dock.title")}
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{k("dock.title")}</SheetTitle>
                <SheetDescription>{k("dock.sheetDescription")}</SheetDescription>
              </SheetHeader>
              <SheetBody>{facets("fl-k-sheet")}</SheetBody>
              <SheetFooter>
                <SheetClose asChild>
                  <Button>{k("showResults")}</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )
      }
    />
  );
  return (
    <Layout letter="k">
      {bar}
      {docked ? (
        <ResizablePanelGroup orientation="horizontal" id="filter-layout-k-group">
          <ResizablePanel id="filter-layout-k-main" defaultSize="72%" minSize="50%">
            <Results rows={rows} />
          </ResizablePanel>
          <ResizableHandle>
            <GripVertical aria-hidden="true" size={16} />
          </ResizableHandle>
          <ResizablePanel
            id="filter-layout-k-panel"
            panelRef={panelRef}
            collapsible
            collapsedSize="0%"
            defaultSize={open ? "28%" : "0%"}
            minSize="20%"
            maxSize="40%"
            onResize={(size) => {
              const next = size.asPercentage > 0;
              if (next !== open) remember(next);
            }}
          >
            {/* Collapsed to 0%, the panel renders nothing: content squeezed to zero width would
                wrap one glyph per line and stretch the row. */}
            {open && (
              <Card>
                <CardHeader>
                  <CardTitle level={3}>{k("dock.title")}</CardTitle>
                </CardHeader>
                <CardContent>{facets("fl-k-dock")}</CardContent>
              </Card>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <Results rows={rows} />
      )}
    </Layout>
  );
}

export default function Demo() {
  const { k } = useVocab();
  return (
    <PageContainer title={k("page.title")} subtitle={k("page.subtitle")}>
      <Flex direction="col" gap="xl">
        <InlinePacked />
        <SearchFirstMenu />
        <PromotedMore />
        <SavedViews />
        <TwoRows />
        <WithActions />
        <FacetedSidebar />
        <CompactInCard />
        <DateRangeQuick />
        <PhoneStacked />
        <DockedPanel />
      </Flex>
    </PageContainer>
  );
}
