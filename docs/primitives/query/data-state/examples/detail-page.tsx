import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { SkeletonCard } from "@godxjp/ui/feedback";
import { DataState } from "@godxjp/ui/query";

type Order = { id: string; customer: string };

export default function Demo() {
  const query = useQuery<Order[]>({
    queryKey: ["query-data-state-detail"],
    queryFn: () => Promise.resolve([{ id: "REC-8801", customer: "Nguyen Mai" }]),
  });

  return (
    <DataState
      query={query}
      skeleton={<SkeletonCard />}
      empty={
        <Card>
          <CardContent solo>Không có đơn hàng.</CardContent>
        </Card>
      }
    >
      {(data) => (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{data[0]?.id}</CardTitle>
          </CardHeader>
          <CardContent>{data[0]?.customer}</CardContent>
        </Card>
      )}
    </DataState>
  );
}
