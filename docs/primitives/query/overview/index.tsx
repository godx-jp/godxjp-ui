import { Alert, AlertContent, AlertDescription, AlertTitle } from "@godxjp/ui/feedback";

export default function Demo() {
  return (
    <Alert>
      <AlertTitle>Query lifecycle primitives</AlertTitle>
      <AlertContent>
        <AlertDescription>
          Compose TanStack Query state through DataState, InfiniteQueryState, MutationFeedback and
          QueryRefetchButton.
        </AlertDescription>
      </AlertContent>
    </Alert>
  );
}
