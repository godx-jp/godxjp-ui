import { FormField, Input } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <FormField id="mawb" label="MAWB">
        <Input id="mawb" defaultValue="131-48291044" className="font-mono text-xs" />
      </FormField>
      <FormField id="weight" label="Trọng lượng thực" helper="Đơn vị kg">
        <Input id="weight" type="number" defaultValue="2.4" step="0.1" />
      </FormField>
    </div>
  );
}
