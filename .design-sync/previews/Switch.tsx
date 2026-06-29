import { Switch, Label } from "@godxjp/ui";

export function States() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Switch defaultChecked /> <span style={{ fontSize: 14 }}>Email notifications</span>
      </label>
      <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Switch /> <span style={{ fontSize: 14 }}>SMS notifications</span>
      </label>
      <label style={{ display: "flex", gap: 10, alignItems: "center", opacity: 0.6 }}>
        <Switch defaultChecked disabled /> <span style={{ fontSize: 14 }}>Locked (admin only)</span>
      </label>
    </div>
  );
}
