import { useState } from "react";

import { Button, Text } from "@godxjp/ui/general";
import {
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { FilterBar, FilterBarGroup } from "@godxjp/ui/navigation";

const STATUSES = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
];

/** FilterBar — domain-neutral list filtering with consumer-owned state and clear behavior. */
export default function Demo() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");
  const [approval, setApproval] = useState("all");
  const [period, setPeriod] = useState("all");
  const hasActiveFilters = query !== "" || status !== "all";

  return (
    <PageContainer
      title="FilterBar"
      subtitle="Search, labelled filters, active state, consumer-owned reset, and both responsive overflow strategies"
    >
      <Flex direction="col" gap="lg">
        {/* overflow="wrap" (default) — stacked below 640px, wrapping rows above. */}
        <Flex direction="col" gap="xs">
          <Text size="xs" tone="muted">
            overflow=&quot;wrap&quot; (default) · a small filter set wraps onto extra rows
          </Text>
          <FilterBar
            hasActiveFilters={hasActiveFilters}
            onClear={() => {
              setQuery("");
              setStatus("all");
            }}
          >
            <SearchInput
              aria-label="Search records"
              placeholder="Search records"
              value={query}
              onSearch={setQuery}
            />
            {/* controlId makes the visible caption the Select's real <label>. */}
            <FilterBarGroup label="Status" controlId="fb-status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="fb-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterBarGroup>
          </FilterBar>
        </Flex>

        {/* overflow="scroll" — one bounded inline-scrolling row at >= 640px. The long JA/EN/VI
            captions are the point: with `wrap` this same set becomes a three-row strip. */}
        <Flex direction="col" gap="xs">
          <Text size="xs" tone="muted">
            overflow=&quot;scroll&quot; · many filters with long JA/EN/VI labels stay on ONE bounded
            row (still stacked below 640px)
          </Text>
          <FilterBar
            overflow="scroll"
            hasActiveFilters={department !== "all" || approval !== "all" || period !== "all"}
            onClear={() => {
              setDepartment("all");
              setApproval("all");
              setPeriod("all");
            }}
          >
            <FilterBarGroup label="部署（すべての拠点を含む）" controlId="fb-department">
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="fb-department">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての部署</SelectItem>
                  <SelectItem value="warehouse">倉庫</SelectItem>
                </SelectContent>
              </Select>
            </FilterBarGroup>
            <FilterBarGroup
              label="Trạng thái phê duyệt của toàn bộ phòng ban"
              controlId="fb-approval"
            >
              <Select value={approval} onValueChange={setApproval}>
                <SelectTrigger id="fb-approval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ phê duyệt</SelectItem>
                </SelectContent>
              </Select>
            </FilterBarGroup>
            <FilterBarGroup
              label="Reporting period including carried-over adjustments"
              controlId="fb-period"
            >
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="fb-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All periods</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
            </FilterBarGroup>
          </FilterBar>
        </Flex>

        {/* ── The TYPED MODEL (#258) — search · chips · result count · reset · actions.
               Order is the CONTRACT: DOM order is tab order, and the BAR decides it, not this
               page. Passing each region through its own prop is what gives every list page the
               same search measure, the same chip lifecycle and the same keyboard order.
               Nothing below sets a width, a gap or a media query. ── */}
        <Flex direction="col" gap="xs">
          <Text size="xs" tone="muted">
            typed model · search → filters → applied chips → result count → reset → actions
          </Text>
          <FilterBar
            // A SLOT, not a child: the bar owns the search's place and its one token-owned
            // measure (--filter-bar-search-width). As a child it would keep whatever width this
            // page happened to give it — the inconsistency #258 was filed against.
            search={
              <SearchInput
                aria-label="Tìm kiếm hoá đơn"
                value={query}
                onSearch={setQuery}
                placeholder="請求書番号・取引先で検索"
              />
            }
            // Applied filters as removable chips. The last one carries NO onRemove — a scope
            // locked by the route or by permission renders as a static token rather than a
            // disabled ✕ that promises an action the app will never perform.
            chips={[
              { id: "status", label: "状態: 未払い", onRemove: () => setStatus("all") },
              {
                id: "period",
                label: "Kỳ báo cáo: tháng này (bao gồm điều chỉnh chuyển tiếp)",
                onRemove: () => setPeriod("all"),
              },
              { id: "tenant", label: "テナント: Acme 株式会社" },
            ]}
            // Announced in a polite live region and formatted with Intl.NumberFormat + CLDR
            // plurals. A sighted user SEES the table change; this is what tells everyone else.
            resultCount={1284}
            hasActiveFilters
            onClear={() => {
              setQuery("");
              setStatus("all");
              setDepartment("all");
              setApproval("all");
              setPeriod("all");
            }}
            // Rendered AFTER the reset, so "clear filters" never lands at the end of the row
            // beside an unrelated primary action.
            actions={
              <Button variant="outline" size="sm">
                エクスポート
              </Button>
            }
          >
            <FilterBarGroup label="状態" controlId="fb-model-status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="fb-model-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterBarGroup>
            <FilterBarGroup label="部門" controlId="fb-model-department">
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="fb-model-department">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての部門</SelectItem>
                  <SelectItem value="sales">営業</SelectItem>
                </SelectContent>
              </Select>
            </FilterBarGroup>
          </FilterBar>
        </Flex>

        {/* Empty chip array + unknown count: BOTH regions disappear entirely. A reserved empty
            strip is worse than no strip — it reads as "no filters applied" that never settles. */}
        <Flex direction="col" gap="xs">
          <Text size="xs" tone="muted">
            typed model · nothing applied · the chip row and the count emit no markup at all
          </Text>
          <FilterBar
            search={<SearchInput aria-label="Tìm kiếm" value="" onSearch={() => {}} />}
            chips={[]}
            hasActiveFilters={false}
            onClear={() => {}}
          >
            <FilterBarGroup label="状態" controlId="fb-empty-status">
              <Select value="all" onValueChange={() => {}}>
                <SelectTrigger id="fb-empty-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての状態</SelectItem>
                </SelectContent>
              </Select>
            </FilterBarGroup>
          </FilterBar>
        </Flex>
      </Flex>
    </PageContainer>
  );
}
