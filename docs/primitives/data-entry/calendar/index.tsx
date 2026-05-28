import { Calendar } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <>
      <Calendar mode="single" selected={new Date(2026, 4, 24)} />
      <Calendar mode="range" />
    </>
  );
}
