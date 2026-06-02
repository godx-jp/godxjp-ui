import { useState } from "react";

import { Transfer } from "@godxjp/ui/data-entry";

const items = [
  { key: "mai", title: "Nguyen Thi Mai", description: "Account manager" },
  { key: "tanaka", title: "Tanaka Yuki", description: "Order operations" },
  { key: "duc", title: "Pham Minh Duc", description: "Support lead" },
  { key: "audit", title: "Audit account", disabled: true },
];

export default function Demo() {
  const [targetKeys, setTargetKeys] = useState<string[]>(["tanaka"]);

  return (
    <Transfer
      dataSource={items}
      targetKeys={targetKeys}
      onValueChange={setTargetKeys}
      showSearch
      titles={["Nhân viên", "Được truy cập"]}
    />
  );
}
