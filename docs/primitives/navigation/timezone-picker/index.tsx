import { useState } from "react";

import type { AppTimezone } from "@godxjp/ui/app";
import { TimezonePicker } from "@godxjp/ui/navigation";

export default function Demo() {
  const [value, setValue] = useState<AppTimezone>("Asia/Tokyo");
  return (
    <TimezonePicker
      value={value}
      onValueChange={setValue}
      options={["Asia/Tokyo", "Asia/Ho_Chi_Minh", "UTC"]}
    />
  );
}
