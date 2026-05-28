import * as React from "react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Pagination } from "@godxjp/ui/navigation";

export default function Demo() {
  const [page, setPage] = React.useState(1);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Audit events</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">[DataTable content]</CardContent>
      <CardFooter separated>
        <Pagination
          className="w-full"
          current={page}
          total={248}
          pageSize={10}
          showTotal
          onChange={setPage}
        />
      </CardFooter>
    </Card>
  );
}
