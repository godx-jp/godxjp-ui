import { AlertQueryError } from "../feedback/alert";
import { errorBagHasMessage, useFormErrorsRegistry } from "../data-entry/form-errors";
import { classifyQueryError } from "../../lib/query-error";
import type { AlertMutationFeedbackProp } from "../../props/components/query.prop";

export type {
  AlertMutationFeedbackProp,
  AlertMutationFeedbackProp as AlertMutationFeedbackProps,
} from "../../props/components/query.prop";

/**
 * Inline mutation error — renders nothing when idle/success.
 * Prefer toast for transient saves; use this for blocking form sections (SimulatorPage).
 * Inside a form that received a server error bag (`FormRoot errors` / `Form errors`), a validation
 * error is the fields' to show, so it is skipped by default (gh#690).
 */
export function AlertMutationFeedback({
  mutation,
  onRetry,
  showRetry = true,
  pending,
  ignoreValidationErrors,
  className,
}: AlertMutationFeedbackProp) {
  // The error registry exists only under a Form/FormRoot that received `errors`. The default skips
  // only when that bag holds a message — something on the page (a field or FormErrors) shows it.
  const registry = useFormErrorsRegistry();
  const bagShowsErrors = registry !== null && errorBagHasMessage(registry.errors);

  if (mutation.isPending && pending) return <>{pending}</>;

  if (!mutation.isError || mutation.error == null) return null;

  if (
    (ignoreValidationErrors ?? bagShowsErrors) &&
    classifyQueryError(mutation.error).category === "validation"
  ) {
    return null;
  }

  return (
    <AlertQueryError
      className={className}
      error={mutation.error}
      onRetry={showRetry ? onRetry : undefined}
    />
  );
}
