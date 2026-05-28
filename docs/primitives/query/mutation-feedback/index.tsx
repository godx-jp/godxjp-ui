import { useMutation } from "@tanstack/react-query";

import { MutationFeedback } from "@godxjp/ui/query";

export default function Demo() {
  const mutation = useMutation({
    mutationFn: () => Promise.reject(new Error("Mutation failed")),
  });

  return (
    <>
      <button type="button" onClick={() => mutation.mutate()}>
        Trigger mutation
      </button>
      <MutationFeedback mutation={mutation} onRetry={() => mutation.mutate()} />
    </>
  );
}
