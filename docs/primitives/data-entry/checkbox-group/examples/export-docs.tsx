import { CheckboxGroup, FormField } from "@godxjp/ui/data-entry";

const options = [
  { label: "Commercial invoice", value: "invoice" },
  { label: "Itemized receipt", value: "packing" },
  { label: "Compliance form", value: "msds", description: "Bắt buộc nếu đơn có hàng hóa đặc biệt" },
  { label: "Certificate of origin", value: "co", disabled: true },
];

export default function Demo() {
  return (
    <FormField id="export-docs" label="Tài liệu đơn hàng" className="max-w-md">
      <CheckboxGroup defaultValue={["invoice", "packing"]} options={options} />
    </FormField>
  );
}
