import { useState } from "react";

import {
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";
import { PageContainer } from "@godxjp/ui/layout";
import { FilterBar, FilterBarGroup } from "@godxjp/ui/navigation";

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
          onSearch={setQuery}
        />
        <FilterBarGroup label="Status">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </FilterBarGroup>
      </FilterBar>
    </PageContainer>
  );
}
