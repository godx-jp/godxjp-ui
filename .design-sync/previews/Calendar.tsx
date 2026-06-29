import { Calendar } from "@godxjp/ui";

export function Single() {
  return (
    <div style={{ display: "inline-block", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", padding: 8 }}>
      <Calendar mode="single" defaultMonth={new Date(2026, 5, 1)} selected={new Date(2026, 5, 15)} />
    </div>
  );
}
