import { useState } from "react";

import { Slider } from "@godxjp/ui/data-entry";

export default function Demo() {
  const [value, setValue] = useState([42]);

  return (
    <>
      <Slider value={value} onValueChange={setValue} />
      <Slider defaultValue={[20, 80]} />
      <Slider defaultValue={[50]} disabled />
    </>
  );
}
