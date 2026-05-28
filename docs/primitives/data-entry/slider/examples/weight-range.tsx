import { useState } from "react";

import { FormField, Slider } from "@godxjp/ui/data-entry";

export default function Demo() {
  const [value, setValue] = useState([2, 18]);

  return (
    <FormField id="weight-range" label={`Trọng lượng: ${value[0]}-${value[1]} kg`} className="w-80">
      <Slider min={0} max={30} step={1} value={value} onValueChange={setValue} />
    </FormField>
  );
}
