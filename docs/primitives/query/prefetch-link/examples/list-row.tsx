import { PrefetchLink } from "@godxjp/ui/query";

export default function Demo() {
  return (
    <PrefetchLink
      to="/orders/REC-8801"
      queryKey={["order", "REC-8801"]}
      queryFn={() => Promise.resolve({ id: "REC-8801" })}
      className="text-sm font-medium underline-offset-4 hover:underline"
    >
      REC-8801
    </PrefetchLink>
  );
}
