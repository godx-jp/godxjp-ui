import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { DateRangePicker, FormField } from "@godxjp/ui/data-entry";

export default function Demo() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 4, 24),
    to: new Date(2026, 4, 31),
  });

  return (
    <FormField id="manifest-period" label="Kỳ lô hàng" className="max-w-sm">
      <DateRangePicker value={range} onChange={setRange} />
    </FormField>
  );
}
