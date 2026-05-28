import { SearchInput } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <>
      <SearchInput ariaLabel="Search" placeholder="Search" onSearch={() => undefined} />
      <SearchInput
        ariaLabel="Disabled search"
        placeholder="Disabled"
        onSearch={() => undefined}
        disabled
      />
    </>
  );
}
