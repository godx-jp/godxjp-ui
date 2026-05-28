import { FormField, Radio } from "@godxjp/ui/data-entry";

const options = [
  { label: "Acme Osaka", value: "osaka" },
  { label: "Acme Tokyo", value: "tokyo" },
  { label: "Acme Yokohama", value: "yokohama" },
];

export default function Demo() {
  return (
    <FormField id="warehouse-radio" label="Chi nhánh">
      <Radio.Group defaultValue="osaka" options={options} orientation="horizontal" />
    </FormField>
  );
}
