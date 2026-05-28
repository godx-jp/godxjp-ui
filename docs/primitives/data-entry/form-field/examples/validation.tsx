import { FormField, Input } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <FormField id="customer-email" label="Email khách" helper="Dùng để gửi thông báo trạng thái.">
        <Input id="customer-email" type="email" defaultValue="mai.nguyen@shop-vn.com" />
      </FormField>
      <FormField
        id="declared-value"
        label="Giá trị khai báo"
        required
        error="Giá trị phải lớn hơn 0."
      >
        <Input id="declared-value" type="number" defaultValue="0" aria-invalid />
      </FormField>
    </div>
  );
}
