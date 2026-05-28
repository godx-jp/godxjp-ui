import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Upload } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Upload tài liệu</CardTitle>
        <CardDescription>Hoá đơn, hợp đồng, phiếu giao hàng — lưu tạm 6h</CardDescription>
      </CardHeader>
      <CardContent>
        <Upload variant="dropzone" maxCount={5} />
      </CardContent>
    </Card>
  );
}
