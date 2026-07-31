import { useState } from "react";

import { Text } from "@godxjp/ui/general";
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
      </Flex>
    </PageContainer>
  );
}
