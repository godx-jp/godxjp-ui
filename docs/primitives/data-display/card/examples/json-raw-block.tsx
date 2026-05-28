import { FileJson } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";

const claims = {
  sub: "CUS-2026-1182",
  scope: ["media.read", "orders.write"],
  org: "godx",
};

export default function Demo() {
  return (
    <Card className="max-w-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileJson className="size-4" aria-hidden="true" />
          Token claims
        </CardTitle>
        <CardAction>
          <Button size="sm" variant="outline">
            Copy
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <pre className="ui-card-inset bg-muted max-h-48 overflow-auto rounded-md font-mono text-xs">
          {JSON.stringify(claims, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
