import { useState } from "react";

import { Cascader, FormField } from "@godxjp/ui/data-entry";

const options = [
  {
    value: "jp",
    label: "Japan",
    children: [
      { value: "osaka", label: "Osaka", children: [{ value: "naniwa", label: "Naniwa" }] },
      { value: "tokyo", label: "Tokyo", children: [{ value: "shinjuku", label: "Shinjuku" }] },
    ],
  },
  {
    value: "vn",
    label: "Vietnam",
    children: [
      { value: "hcm", label: "Ho Chi Minh", children: [{ value: "q1", label: "District 1" }] },
    ],
  },
];

export default function Demo() {
  const [value, setValue] = useState<string[]>(["jp", "osaka", "naniwa"]);

  return (
    <FormField id="region" label="Tỉnh / Quận / Phường" className="max-w-sm">
      <Cascader
        options={options}
        value={value}
        onValueChange={(next) => setValue(next as string[])}
        showSearch
      />
    </FormField>
  );
}
