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
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Cập nhật giờ đóng cửa chi nhánh Osaka</CardTitle>
        <CardDescription>Lô đơn chuyển ngày hôm sau sau giờ này.</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        [FormField + TimePicker được render trong app thật]
      </CardContent>
      <CardFooter separated>
        <Button variant="outline" size="sm">
          Hủy
        </Button>
        <Button size="sm">Lưu thay đổi</Button>
      </CardFooter>
    </Card>
  );
}
