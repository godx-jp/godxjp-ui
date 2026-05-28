import { ImageIcon, User } from "lucide-react";

import {
  Badge,
  Card,
  CardCover,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Inline } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <Card className="max-w-sm overflow-hidden">
      <CardCover className="bg-muted flex aspect-[1.618/1] max-h-40 items-center justify-center">
        <ImageIcon className="text-muted-foreground size-10" aria-hidden="true" />
      </CardCover>
      <CardHeader>
        <Inline gap="md" className="items-start">
          <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-full">
            <User className="text-primary size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <CardTitle>Nguyễn Minh Anh</CardTitle>
            <CardDescription>minh.anh@example.com</CardDescription>
            <Inline gap="xs" className="mt-2 flex-wrap">
              <Badge variant="secondary">VIP</Badge>
              <Badge variant="outline">12 đơn mở</Badge>
            </Inline>
          </div>
        </Inline>
      </CardHeader>
    </Card>
  );
}
