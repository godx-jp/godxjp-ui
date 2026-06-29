import { FormField, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@godxjp/ui";

export function Vertical() {
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
      <FormField label="Employee ID" required helper="6-digit number on the badge.">
        <Input placeholder="000000" />
      </FormField>
      <FormField label="Email" error="This email is already registered.">
        <Input type="email" defaultValue="dup@famgia.com" />
      </FormField>
    </div>
  );
}

export function Horizontal() {
  return (
    <div style={{ display: "grid", gap: 14, maxWidth: 420 }}>
      <FormField label="Department" layout="horizontal" labelWidth={120}>
        <Select defaultValue="ops">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ops">Operations</SelectItem>
            <SelectItem value="hr">Human Resources</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </div>
  );
}
