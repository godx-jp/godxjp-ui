import { Download, MoreHorizontal, Pencil } from "lucide-react";

import {
  Badge,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Inline } from "@godxjp/ui/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <Card className="max-w-md">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <Inline gap="sm" className="flex-wrap items-center">
            <CardTitle>REC-8801</CardTitle>
            <Badge status="in_transit" />
            <Badge variant="outline">VIP</Badge>
            <Badge variant="secondary">Acme Inc</Badge>
          </Inline>
          <CardDescription>Osaka Store · Khách hàng khu vực</CardDescription>
        </div>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label="More actions">
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Pencil className="mr-2 size-4" aria-hidden="true" />
                Sửa
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 size-4" aria-hidden="true" />
                Export đơn hàng
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="text-sm">
        Badge + Badge trong header; menu cho secondary actions.
      </CardContent>
    </Card>
  );
}
