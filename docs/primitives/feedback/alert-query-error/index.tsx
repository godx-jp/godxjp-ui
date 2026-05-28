import { AlertQueryError } from "@godxjp/ui/feedback";

export default function Demo() {
  return (
    <AlertQueryError error={new Error("GET /v1/resource failed: 503")} onRetry={() => undefined} />
  );
}
