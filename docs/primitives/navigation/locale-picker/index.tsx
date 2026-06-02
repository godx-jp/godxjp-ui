import { useState } from "react";

import type { AppLocale } from "@godxjp/ui/app";
import { LocalePicker } from "@godxjp/ui/navigation";

export default function Demo() {
  const [value, setValue] = useState<AppLocale>("vi");
  return <LocalePicker value={value} onValueChange={setValue} />;
}
