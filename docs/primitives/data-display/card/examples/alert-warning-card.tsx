import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";

export default function Demo() {
  return (
    <Card className="max-w-md border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="text-amber-900 dark:text-amber-100">Đơn #3 cần xác nhận</CardTitle>
        <CardDescription>ORD-2026-8842 · Thiết bị điện tử</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-amber-900/90 dark:text-amber-100/90">
        Khách phải xác nhận thông tin trước 17:00 JST.
      </CardContent>
      <CardFooter separated className="justify-end gap-2">
        <Button size="sm" variant="outline">
          Gửi nhắc nhở
        </Button>
        <Button size="sm">Mở chi tiết đơn</Button>
      </CardFooter>
    </Card>
  );
}
