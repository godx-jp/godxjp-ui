import { useState } from "react";
import { Plus } from "lucide-react";

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

const MODEL_STATUSES = [
  { value: "active", label: "有効" },
  { value: "invited", label: "招待中" },
  { value: "suspended", label: "停止" },
];

const MODEL_ROLES = [
  { value: "member", label: "Thành viên" },
  { value: "manager", label: "Quản lý" },
];

/** FilterBar — domain-neutral list filtering with consumer-owned state and clear behavior. */
export default function Demo() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");
  const [approval, setApproval] = useState("all");
  const [period, setPeriod] = useState("all");
  const hasActiveFilters = query !== "" || status !== "all";

  // Typed model (gh#258) — ALL state is consumer data; the bar only renders it.
  const [modelQuery, setModelQuery] = useState("田中");
  const [modelStatus, setModelStatus] = useState("active");
  const [modelRole, setModelRole] = useState("");
  const modelChips = [
    ...(modelQuery !== "" ? [{ value: "q", label: `検索: ${modelQuery}` }] : []),
    ...(modelStatus !== ""
      ? [
          {
            value: "status",
            label: `状態: ${MODEL_STATUSES.find((s) => s.value === modelStatus)?.label ?? modelStatus}`,
          },
        ]
      : []),
    ...(modelRole !== ""
      ? [
          {
            value: "role",
            label: `Vai trò: ${MODEL_ROLES.find((r) => r.value === modelRole)?.label ?? modelRole}`,
          },
        ]
      : []),
  ];
  const removeModelChip = (value: string) => {
    if (value === "q") setModelQuery("");
    if (value === "status") setModelStatus("");
    if (value === "role") setModelRole("");
  };
  const clearModelFilters = () => {
    setModelQuery("");
    setModelStatus("");
    setModelRole("");
  };
  const modelResultCount = modelChips.length === 0 ? 128 : 42 - modelChips.length * 11;

  return (
    <PageContainer
      title="FilterBar"
      subtitle="Search, labelled filters, active state, consumer-owned reset, and both responsive overflow strategies"
    >
      <Flex direction="col" gap="lg">
        {/* Typed model (gh#258) — search/filters/chips/reset/result-count/actions as DATA.
            The bar owns layout, token widths, chip lifecycle and keyboard order; the page owns
            every piece of state. Remove a chip, reset, or pick a filter and watch the chips row
            and the localized result count follow. */}
        <Flex direction="col" gap="xs">
          <Text size="xs" tone="muted">
            typed model · search + filters + chips + reset + result count + actions, all
            consumer-controlled data
          </Text>
          <FilterBar
            search={{
              value: modelQuery,
              onValueChange: setModelQuery,
              placeholder: "氏名・メールで検索",
              ariaLabel: "メンバーを検索",
            }}
            filters={[
              {
                value: "status",
                label: "ステータス",
                options: MODEL_STATUSES,
                selected: modelStatus,
                onSelectedChange: setModelStatus,
                placeholder: "すべて",
              },
              {
                value: "role",
                label: "Vai trò",
                options: MODEL_ROLES,
                selected: modelRole,
                onSelectedChange: setModelRole,
                placeholder: "Tất cả",
              },
            ]}
            chips={modelChips}
            onChipRemove={removeModelChip}
            onClear={clearModelFilters}
            hasActiveFilters={modelChips.length > 0}
            resultCount={modelResultCount}
            actions={
              <Button size="sm">
                <Plus aria-hidden="true" />
                メンバーを追加
              </Button>
            }
          />
        </Flex>

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
