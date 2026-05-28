import * as React from "react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";

export default function Demo() {
  const [open, setOpen] = React.useState(true);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Identity providers</CardTitle>
        <CardAction>
          <Button size="sm" onClick={() => setOpen((value) => !value)}>
            {open ? "Cancel" : "Add IdP"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {open ? (
          <Card size="compact" className="bg-muted/20 border-dashed shadow-none">
            <CardContent solo className="text-muted-foreground text-sm">
              [CreateIdPForm — form xổ ra trong CardContent]
            </CardContent>
          </Card>
        ) : null}
        <p className="text-muted-foreground text-sm">2 IdP configured</p>
      </CardContent>
    </Card>
  );
}
