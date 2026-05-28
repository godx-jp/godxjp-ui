import { useState } from "react";

import { TreeSelect } from "@godxjp/ui/data-entry";

const treeData = [{ value: "a", label: "A", children: [{ value: "a-1", label: "A1" }] }];

export default function Demo() {
  const [value, setValue] = useState<string[]>(["a-1"]);

  return (
    <>
      <TreeSelect treeData={treeData} treeDefaultExpandAll />
      <TreeSelect
        treeData={treeData}
        treeCheckable
        treeDefaultExpandAll
        value={value}
        onChange={(next) => setValue(Array.isArray(next) ? next : next ? [next] : [])}
      />
      <TreeSelect treeData={treeData} disabled />
    </>
  );
}
