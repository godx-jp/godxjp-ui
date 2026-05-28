import { TabsItems } from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <>
      <TabsItems
        items={[
          { key: "one", label: "One", children: "Content one" },
          { key: "disabled", label: "Disabled", children: "Disabled content", disabled: true },
        ]}
      />
      <TabsItems
        variant="line"
        items={[
          { key: "one", label: "One", children: "Line one" },
          { key: "two", label: "Two", children: "Line two" },
        ]}
      />
    </>
  );
}
