import { FormField, TimePicker } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <FormField id="cutoff-time" label="Cut-off JST" className="max-w-xs">
      <TimePicker value="11:00" onChange={() => undefined} />
    </FormField>
  );
}
