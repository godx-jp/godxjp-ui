import { FormField } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <>
      <FormField id="field-helper" label="Label" helper="Helper text">
        <input id="field-helper" />
      </FormField>
      <FormField id="field-error" label="Required" required error="Error text">
        <input id="field-error" />
      </FormField>
    </>
  );
}
