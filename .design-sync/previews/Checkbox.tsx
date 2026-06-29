import { Checkbox } from "@godxjp/ui";

export function States() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Checkbox defaultChecked /> <span style={{ fontSize: 14 }}>Send me the weekly summary</span>
      </label>
      <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Checkbox /> <span style={{ fontSize: 14 }}>Include archived records</span>
      </label>
      <label style={{ display: "flex", gap: 10, alignItems: "center", opacity: 0.6 }}>
        <Checkbox disabled /> <span style={{ fontSize: 14 }}>Locked option</span>
      </label>
      <label style={{ display: "flex", gap: 10, alignItems: "center", opacity: 0.6 }}>
        <Checkbox defaultChecked disabled /> <span style={{ fontSize: 14 }}>Locked &amp; checked</span>
      </label>
    </div>
  );
}
