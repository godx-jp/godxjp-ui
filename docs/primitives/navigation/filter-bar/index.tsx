import { FilterBar, FilterGroup } from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <FilterBar onClear={() => undefined}>
      <FilterGroup label="FilterGroup A">
        <input placeholder="input" />
      </FilterGroup>
      <FilterGroup label="FilterGroup B">
        <select>
          <option>option</option>
        </select>
      </FilterGroup>
    </FilterBar>
  );
}
