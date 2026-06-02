import { Card, CardContent, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Alert, AlertDescription, AlertTitle } from "@godxjp/ui/feedback";

export default function Demo() {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Upload batch</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert variant="default">
          <AlertTitle>Temp bucket</AlertTitle>
          <AlertDescription>File upload vào temp — promote khi biết owner entity.</AlertDescription>
        </Alert>
        <Alert tone="destructive">
          <AlertTitle>Thiếu tài liệu</AlertTitle>
          <AlertDescription>Đơn #3 không thể xử lý cho đến khi khách bổ sung.</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
