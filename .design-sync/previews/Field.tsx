import { Field, Input } from "@godxjp/ui";

export function Basic() {
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
      <Field id="full-name" label="Full name" description="As printed on your ID card.">
        <Input placeholder="山田 太郎" />
      </Field>
      <Field id="phone" label="Phone">
        <Input type="tel" placeholder="090-0000-0000" />
      </Field>
    </div>
  );
}
