import {
  Input,
  SearchInput,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";
import { FilterBar, FilterGroup } from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <FilterBar onClear={() => undefined} hasActiveFilters>
      <FilterGroup label="Tìm kiếm">
        <SearchInput
          defaultValue="Mai"
          placeholder="Tên, email, SĐT"
          onSearch={() => undefined}
          ariaLabel="Tìm khách hàng"
        />
      </FilterGroup>
      <FilterGroup label="Kênh">
        <Select defaultValue="zalo">
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Tất cả kênh</SelectItem>
              <SelectItem value="zalo">Zalo OA</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="line">Line</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </FilterGroup>
      <FilterGroup label="Tag">
        <Input defaultValue="VIP" placeholder="VIP, Mercari" className="w-32" />
      </FilterGroup>
    </FilterBar>
  );
}
