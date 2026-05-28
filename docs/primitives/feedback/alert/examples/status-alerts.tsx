import {
  Alert,
  AlertActions,
  AlertContent,
  AlertDescription,
  AlertTitle,
} from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";

export default function Demo() {
  return (
    <div className="grid max-w-2xl gap-3">
      <Alert variant="warning">
        <AlertTitle>Đơn hàng cần xác minh thanh toán</AlertTitle>
        <AlertContent>
          <AlertDescription>
            Đơn có thông tin nhưng chưa xác nhận phương thức thanh toán.
          </AlertDescription>
          <AlertActions>
            <Button size="sm" variant="outline">
              Mở hồ sơ
            </Button>
          </AlertActions>
        </AlertContent>
      </Alert>
      <Alert variant="success">
        <AlertTitle>Template đã lưu</AlertTitle>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Không đủ quyền duyệt lô đơn hàng</AlertTitle>
      </Alert>
    </div>
  );
}
