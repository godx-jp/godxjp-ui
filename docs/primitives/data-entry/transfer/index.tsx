import { useState } from "react";

import { Transfer } from "@godxjp/ui/data-entry";

const items = [
  { key: "a", title: "A", description: "Description" },
  { key: "b", title: "B" },
  { key: "c", title: "Disabled", disabled: true },
];

export default function Demo() {
  const [targetKeys, setTargetKeys] = useState<string[]>(["b"]);

  return (
    <>
      <Transfer dataSource={items} targetKeys={targetKeys} onValueChange={setTargetKeys} showSearch />
      <Transfer dataSource={items} targetKeys={[]} onValueChange={() => undefined} oneWay />
    </>
  );
}
