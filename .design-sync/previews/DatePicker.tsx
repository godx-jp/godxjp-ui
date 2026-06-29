import { DatePicker, Label } from "@godxjp/ui";

export function Basic() {
  return (
    <div style={{ display: "grid", gap: 6, maxWidth: 280 }}>
      <Label htmlFor="dp">Shift date</Label>
      <DatePicker defaultValue={new Date(2026, 5, 15)} />
    </div>
  );
}

export function Empty() {
  return (
    <div style={{ maxWidth: 280 }}>
      <DatePicker placeholder="Pick a date" />
    </div>
  );
}
