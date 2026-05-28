import { Calendar } from "@godxjp/ui/data-entry";

export default function Demo() {
  return <Calendar mode="range" defaultMonth={new Date(2026, 4, 1)} />;
}
