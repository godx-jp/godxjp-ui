import { Textarea, Label } from "@godxjp/ui";

export function Basic() {
  return (
    <div style={{ display: "grid", gap: 6, maxWidth: 380 }}>
      <Label htmlFor="note">Approval note</Label>
      <Textarea
        id="note"
        rows={4}
        defaultValue={"Approved. Please confirm the overtime hours match the shift log before final sign-off."}
      />
    </div>
  );
}

export function States() {
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 380 }}>
      <Textarea placeholder="Leave a comment…" rows={3} />
      <Textarea defaultValue="Clearable content" allowClear rows={3} />
      <Textarea placeholder="Disabled" rows={3} disabled />
    </div>
  );
}
