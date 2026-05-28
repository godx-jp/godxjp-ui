import { Download } from "lucide-react";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  StatusBadge,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Inline } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <Card className="max-w-md">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>invoice_msds.pdf</CardTitle>
          <CardDescription className="font-mono text-xs">media_01k9x...</CardDescription>
        </div>
        <StatusBadge status="temporary" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-muted/50 flex h-32 items-center justify-center rounded-md border">
          <span className="text-muted-foreground text-sm">PDF preview</span>
        </div>
        <Inline gap="sm" className="flex-wrap">
          <Badge variant="outline">application/pdf</Badge>
          <Badge variant="secondary">248 KB</Badge>
        </Inline>
      </CardContent>
      <CardFooter separated className="gap-2">
        <Button size="sm" variant="outline" className="flex-1">
          <Download className="mr-1.5 size-4" aria-hidden="true" />
          Download URL
        </Button>
        <Button size="sm" className="flex-1">
          Promote
        </Button>
      </CardFooter>
    </Card>
  );
}
