import { Pagination } from "@godxjp/ui/navigation";

export default function Demo() {
  return <Pagination current={2} pageSize={25} total={180} onValueChange={() => undefined} />;
}
