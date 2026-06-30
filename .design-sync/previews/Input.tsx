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

const MailIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

const SearchIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export function WithLeadingIcon() {
  // leadingIcon (added in 16.7.0) — a decorative start-slot affordance (mail / search),
  // the common auth + search pattern. Coexists with allowClear.
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 320 }}>
      <Input type="email" leadingIcon={MailIcon} placeholder="name@company.co.jp" />
      <Input leadingIcon={SearchIcon} placeholder="Search members" defaultValue="tanaka" allowClear />
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
