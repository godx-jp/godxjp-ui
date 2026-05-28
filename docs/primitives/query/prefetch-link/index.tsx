import { PrefetchLink } from "@godxjp/ui/query";

export default function Demo() {
  return (
    <PrefetchLink
      to="/example"
      queryKey={["primitive-prefetch-link"]}
      queryFn={() => Promise.resolve("ok")}
    >
      PrefetchLink
    </PrefetchLink>
  );
}
