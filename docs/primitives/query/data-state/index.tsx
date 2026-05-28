import { useQuery } from "@tanstack/react-query";

import { DataState } from "@godxjp/ui/query";

export default function Demo() {
  const query = useQuery({
    queryKey: ["primitive-data-state"],
    queryFn: () => Promise.resolve(["item"]),
  });

  return (
    <DataState query={query} skeleton={<div>Skeleton</div>} empty={<div>Empty</div>}>
      {(data) => <div>{data.join(", ")}</div>}
    </DataState>
  );
}
