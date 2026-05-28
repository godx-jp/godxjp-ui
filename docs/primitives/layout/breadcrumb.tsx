import { Breadcrumb } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <Breadcrumb
      items={[
        { label: "Operations", to: "/" },
        { label: "Inbound", to: "/inbound" },
        { label: "Today" },
      ]}
    />
  );
}
