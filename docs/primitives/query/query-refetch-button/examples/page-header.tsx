import { useQuery } from "@tanstack/react-query";

import { QueryRefetchButton } from "@godxjp/ui/query";

export default function Demo() {
  const query = useQuery({
    queryKey: ["query-refetch-header"],
    queryFn: () => Promise.resolve("ok"),
  });

  return <QueryRefetchButton query={query} label="Refresh data" />;
}
