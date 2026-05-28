import { FormField, Textarea } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <FormField id="customs-note" label="Ghi chú nội bộ" className="max-w-lg">
      <Textarea
        id="customs-note"
        rows={5}
        defaultValue="Khách hàng yêu cầu giao trước 17:00, liên hệ xác nhận trước khi giao."
      />
    </FormField>
  );
}
