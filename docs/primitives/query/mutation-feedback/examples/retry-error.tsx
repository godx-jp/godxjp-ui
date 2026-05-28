import { useMutation } from "@tanstack/react-query";

import { Button } from "@godxjp/ui/general";
import { MutationFeedback } from "@godxjp/ui/query";

export default function Demo() {
  const mutation = useMutation({
    mutationFn: () => Promise.reject(new Error("Không thể lưu thay đổi.")),
  });

  return (
    <div className="grid max-w-md gap-3">
      <Button onClick={() => mutation.mutate()}>Run mutation</Button>
      <MutationFeedback mutation={mutation} onRetry={() => mutation.mutate()} />
    </div>
  );
}
