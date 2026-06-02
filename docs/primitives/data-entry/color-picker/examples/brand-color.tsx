import { useState } from "react";

import { ColorPicker, FormField } from "@godxjp/ui/data-entry";

export default function Demo() {
  const [value, setValue] = useState("#0f2a4a");

  return (
    <FormField id="brand-color" label="Màu chiến dịch" className="max-w-xs">
      <ColorPicker value={value} onValueChange={setValue} />
    </FormField>
  );
}
