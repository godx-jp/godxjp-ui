import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel,
} from "@godxjp/ui";

export function Basic() {
  return (
    <div style={{ maxWidth: 280 }}>
      <Select defaultValue="tokyo">
        <SelectTrigger>
          <SelectValue placeholder="Select a branch" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Kanto</SelectLabel>
            <SelectItem value="tokyo">Tokyo HQ</SelectItem>
            <SelectItem value="yokohama">Yokohama</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Kansai</SelectLabel>
            <SelectItem value="osaka">Osaka</SelectItem>
            <SelectItem value="kyoto">Kyoto</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export function States() {
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 280 }}>
      <Select>
        <SelectTrigger><SelectValue placeholder="Placeholder" /></SelectTrigger>
        <SelectContent><SelectItem value="a">Option A</SelectItem></SelectContent>
      </Select>
      <Select disabled defaultValue="x">
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="x">Disabled</SelectItem></SelectContent>
      </Select>
    </div>
  );
}
