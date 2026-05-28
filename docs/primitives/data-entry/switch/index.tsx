import { useState } from "react";

import { Switch } from "@godxjp/ui/data-entry";

export default function Demo() {
  const [checked, setChecked] = useState(true);

  return (
    <>
      <Switch checked={checked} onCheckedChange={setChecked} />
      <Switch disabled />
    </>
  );
}
