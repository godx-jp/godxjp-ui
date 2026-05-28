import { Card, CardContent, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { SkeletonRows } from "@godxjp/ui/feedback";

export default function Demo() {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Đang tải lô đơn hàng...</CardTitle>
      </CardHeader>
      <CardContent>
        <SkeletonRows rows={4} columns={3} />
      </CardContent>
    </Card>
  );
}
