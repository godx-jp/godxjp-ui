import { Progress } from "@godxjp/ui";

export function Levels() {
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 380 }}>
      <Progress value={28} label="Onboarding" />
      <Progress value={64} label="Monthly target" tone="warning" />
      <Progress value={100} label="Complete" tone="success" />
    </div>
  );
}
