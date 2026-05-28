import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <Card className="max-w-sm cursor-pointer transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle>Chọn chi nhánh xử lý</CardTitle>
        <CardDescription>Osaka Store · đóng cửa 17:00 JST</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        Click để chọn — hover nâng shadow.
      </CardContent>
    </Card>
  );
}
