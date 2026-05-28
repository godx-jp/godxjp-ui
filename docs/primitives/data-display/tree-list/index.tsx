import { TreeList } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <TreeList
      items={[
        { id: "1", title: "Root active", description: "description", active: true, badge: "badge" },
        { id: "2", title: "Depth 1", description: "description", depth: 1 },
        { id: "3", title: "Depth 2", depth: 2 },
      ]}
    />
  );
}
