import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Plus, RefreshCw } from "lucide-react";

export default function Demo() {
  return (
    <Card className="max-w-lg">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Identity providers</CardTitle>
          <CardDescription>3 configured · realm partners</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" variant="outline">
            <RefreshCw className="mr-1.5 size-4" aria-hidden="true" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="mr-1.5 size-4" aria-hidden="true" />
            Add IdP
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        Dùng cho list/detail sections — actions luôn góc phải, title trái.
      </CardContent>
    </Card>
  );
}
