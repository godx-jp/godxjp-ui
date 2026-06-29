import { Rating } from "@godxjp/ui";

export function Values() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Rating defaultValue={4} aria-label="Overall rating" />
      <Rating defaultValue={3} aria-label="Service rating" />
      <Rating defaultValue={5} readOnly aria-label="Read-only rating" />
    </div>
  );
}
