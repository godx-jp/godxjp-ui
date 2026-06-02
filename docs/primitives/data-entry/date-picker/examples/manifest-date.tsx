import { FormField, DatePicker } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <FormField id="manifest-date" label="Ngày lô hàng" className="max-w-xs">
      <DatePicker value={new Date(2026, 4, 24)} onValueChange={() => undefined} />
    </FormField>
  );
}
