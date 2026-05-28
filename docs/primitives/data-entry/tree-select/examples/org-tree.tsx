import { useState } from "react";

import { FormField, TreeSelect } from "@godxjp/ui/data-entry";

const treeData = [
  {
    value: "ops",
    label: "Operations",
    children: [
      { value: "osaka", label: "Osaka Hub" },
      { value: "tokyo", label: "Tokyo WH-2" },
    ],
  },
  {
    value: "support",
    label: "Customer Support",
    children: [{ value: "vn-support", label: "Vietnam Support" }],
  },
];

export default function Demo() {
  const [value, setValue] = useState<string[]>(["osaka"]);

  return (
    <FormField id="org-tree" label="Phân quyền kho" className="max-w-sm">
      <TreeSelect
        treeData={treeData}
        treeCheckable
        treeDefaultExpandAll
        showSearch
        value={value}
        onChange={(next) => setValue(Array.isArray(next) ? next : next ? [next] : [])}
      />
    </FormField>
  );
}
