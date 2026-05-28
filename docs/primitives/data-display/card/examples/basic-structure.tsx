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
        <CardTitle>Cấu trúc cơ bản</CardTitle>
        <CardDescription>Header → Content → Footer</CardDescription>
      </CardHeader>
      <CardContent className="text-sm">Nội dung chính của section.</CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm">
          Hủy
        </Button>
        <Button size="sm">Lưu</Button>
      </CardFooter>
    </Card>
  );
}
