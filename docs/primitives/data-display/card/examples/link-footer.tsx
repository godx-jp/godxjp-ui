import { Bell, ExternalLink } from "lucide-react";

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
        <CardTitle>Campaign #8821</CardTitle>
        <CardDescription>Email Zalo follow-up · scheduled</CardDescription>
      </CardHeader>
      <CardContent className="text-sm">Open rate 39.3%</CardContent>
      <CardFooter separated className="justify-between">
        <Button variant="link" size="sm" className="h-auto p-0">
          <ExternalLink className="mr-1 size-3.5" aria-hidden="true" />
          Xem báo cáo đầy đủ
        </Button>
        <Button variant="ghost" size="sm">
          <Bell className="mr-1.5 size-4" aria-hidden="true" />
          Subscribe
        </Button>
      </CardFooter>
    </Card>
  );
}
