import { useState } from "react";

import type { AppDateFormat } from "@godxjp/ui/app";
import { DateFormatPicker } from "@godxjp/ui/navigation";

export default function Demo() {
  const [value, setValue] = useState<AppDateFormat>("iso");
  return <DateFormatPicker value={value} onValueChange={setValue} />;
}
