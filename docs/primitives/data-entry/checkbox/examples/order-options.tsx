import { Checkbox, FormField } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <div className="grid max-w-xl gap-3">
      <FormField id="fragile" label="Hàng dễ vỡ" helper="Tự động thêm nhãn handling khi đóng gói.">
        <Checkbox id="fragile" defaultChecked />
      </FormField>
      <FormField id="insurance" label="Mua bảo hiểm vận chuyển">
        <Checkbox id="insurance" />
      </FormField>
    </div>
  );
}
