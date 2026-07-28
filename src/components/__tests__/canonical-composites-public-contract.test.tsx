import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { StatusBadge } from "../data-display";
import { FilterBar, FilterBarGroup } from "../navigation";

describe("canonical composite public contracts", () => {
  it.each([
    ["active", "success"],
    ["trialing", "info"],
    ["past_due", "warning"],
    ["incomplete", "default"],
    ["canceled", "destructive"],
  ] as const)("maps status=%s to tone=%s", (status, tone) => {
    renderWithUi(<StatusBadge status={status}>{status}</StatusBadge>);

    expect(screen.getByText(status).closest('[data-slot="badge"]')).toHaveAttribute(
      "data-tone",
      tone,
    );
  });

  it("exports FilterBar with labelled groups and clear-all behavior", () => {
    renderWithUi(
      <FilterBar onClear={() => undefined} hasActiveFilters>
        <FilterBarGroup label="Status">
          <input aria-label="Status filter" />
        </FilterBarGroup>
      </FilterBar>,
    );

    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
