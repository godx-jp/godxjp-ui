import { Autocomplete, FormField } from "@godxjp/ui/data-entry";

const options = [
  { value: "yamato", label: "Acme Logistics" },
  { value: "sagawa", label: "Swift Delivery" },
  { value: "jppost", label: "National Post" },
];

export default function Demo() {
  return (
    <FormField id="carrier" label="Vendor" className="max-w-sm">
      <Autocomplete id="carrier" options={options} placeholder="Chọn nhà cung cấp" />
    </FormField>
  );
}
