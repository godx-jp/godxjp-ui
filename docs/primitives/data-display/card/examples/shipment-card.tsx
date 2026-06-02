import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Badge,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Inline } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <Inline gap="sm" className="items-start justify-between">
          <div>
            <CardTitle>REC-8801</CardTitle>
            <p className="text-muted-foreground text-sm">Tokyo to HCM · Osaka Store</p>
          </div>
          <Badge status="in_transit" />
        </Inline>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mã đơn</span>
          <span className="font-mono text-xs">REF-123456789</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Khách</span>
          <span>Nguyễn Minh Anh</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Đơn / Trọng lượng</span>
          <span>3 đơn · 12.4 kg</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm">
          In nhãn đơn
        </Button>
        <Button size="sm">Cập nhật trạng thái</Button>
      </CardFooter>
    </Card>
  );
}
