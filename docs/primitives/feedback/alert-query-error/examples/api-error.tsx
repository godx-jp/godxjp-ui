import { AlertQueryError } from "@godxjp/ui/feedback";

export default function Demo() {
  return (
    <AlertQueryError
      error={new Error("Không tải được danh sách đơn hàng.")}
      onRetry={() => undefined}
    />
  );
}
