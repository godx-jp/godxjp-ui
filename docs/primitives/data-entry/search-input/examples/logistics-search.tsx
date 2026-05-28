import { SearchInput } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <SearchInput
      ariaLabel="Search customer code"
      className="w-80"
      defaultValue="CUST-001"
      placeholder="Mã khách hàng hoặc mã đơn"
      onSearch={() => undefined}
    />
  );
}
