import { Switch, FormField } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <FormField
      id="hawb-notifications"
      label="Gửi thông báo đơn hàng"
      helper="Gửi email khi đơn hàng đổi trạng thái."
    >
      <Switch id="hawb-notifications" defaultChecked />
    </FormField>
  );
}
