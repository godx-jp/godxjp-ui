import { TagInput, Label } from "@godxjp/ui";

export function Basic() {
  return (
    <div style={{ display: "grid", gap: 6, maxWidth: 380 }}>
      <Label htmlFor="skills">Skills</Label>
      <TagInput id="skills" defaultValue={["React", "TypeScript", "勤怠管理"]} placeholder="Add a skill…" />
    </div>
  );
}

export function Empty() {
  return (
    <div style={{ maxWidth: 380 }}>
      <TagInput placeholder="Type and press Enter…" aria-label="Tags" />
    </div>
  );
}
