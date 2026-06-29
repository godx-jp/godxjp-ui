import { Input, Label, Field } from "@godxjp/ui";

export function Basic() {
  return (
    <div style={{ display: "grid", gap: 6, maxWidth: 320 }}>
      <Label htmlFor="email">Work email</Label>
      <Input id="email" type="email" placeholder="name@company.co.jp" defaultValue="tanaka@famgia.com" />
    </div>
  );
}

export function States() {
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 320 }}>
      <Input placeholder="Placeholder" />
      <Input defaultValue="With a value" allowClear />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Read only" defaultValue="Read only" readOnly />
    </div>
  );
}

export function InField() {
  return (
    <Field label="Employee ID" hint="6-digit number printed on the badge." style={{ maxWidth: 320 }}>
      <Input placeholder="000000" inputMode="numeric" />
    </Field>
  );
}
