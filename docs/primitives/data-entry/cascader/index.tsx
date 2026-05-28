import { useState } from "react";

import { Cascader } from "@godxjp/ui/data-entry";

const options = [
  {
    value: "a",
    label: "A",
    children: [{ value: "a-1", label: "A1" }],
  },
];

export default function Demo() {
  const [value, setValue] = useState<string[]>(["a", "a-1"]);

  return (
    <>
      <Cascader options={options} value={value} onChange={(next) => setValue(next as string[])} />
      <Cascader options={options} showSearch />
      <Cascader options={options} multiple showSearch />
      <Cascader options={options} disabled />
    </>
  );
}
