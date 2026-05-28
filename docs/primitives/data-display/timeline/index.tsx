import { Timeline } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <Timeline
      items={[
        { title: "Default", time: "08:10", location: "Location" },
        { title: "With note", time: "10:40", note: "Note text" },
        { title: "Current", time: "14:30", current: true },
      ]}
    />
  );
}
