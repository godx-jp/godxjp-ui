import { AlertQueryError } from "../feedback/alert";
import type { AlertMutationFeedbackProp } from "../../props/components/query.prop";

export type {
  AlertMutationFeedbackProp,
  AlertMutationFeedbackProp as AlertMutationFeedbackProps,
} from "../../props/components/query.prop";

/**
 * Inline mutation error — renders nothing when idle/success.
 * Prefer toast for transient saves; use this for blocking form sections (SimulatorPage).
 */
export function AlertMutationFeedback({
  mutation,
  onRetry,
  showRetry = true,
  pending,
  className,
}: AlertMutationFeedbackProp) {
  if (mutation.isPending && pending) return <>{pending}</>;

  if (!mutation.isError || mutation.error == null) return null;

  return (
    <AlertQueryError
      className={className}
      error={mutation.error}
      onRetry={showRetry ? onRetry : undefined}
    />
  );
}
