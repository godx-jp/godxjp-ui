import { useState } from "react";

import { SearchInput, Select } from "@godxjp/ui/data-entry";
import { PageContainer } from "@godxjp/ui/layout";
import { FilterBar, FilterBarGroup } from "@godxjp/ui/navigation";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
];

/** FilterBar — domain-neutral list filtering with consumer-owned state and clear behavior. */
export default function Demo() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const hasActiveFilters = query !== "" || status !== "all";

  return (
    <PageContainer
      title="FilterBar"
      subtitle="Search, labelled filters, active state, and consumer-owned reset"
    >
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
          onSearchChange={setQuery}
        />
        <FilterBarGroup label="Status">
          <Select
            aria-label="Status"
            options={statusOptions}
            value={status}
            onValueChange={(value) => setStatus(value ?? "all")}
          />
        </FilterBarGroup>
      </FilterBar>
    </PageContainer>
  );
}
