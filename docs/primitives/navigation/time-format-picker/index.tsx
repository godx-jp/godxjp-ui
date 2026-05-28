import { useState } from "react";

import type { AppTimeFormat } from "@godxjp/ui/app";
import { TimeFormatPicker } from "@godxjp/ui/navigation";

export default function Demo() {
  const [value, setValue] = useState<AppTimeFormat>("24h");
  return <TimeFormatPicker value={value} onChange={setValue} />;
}
