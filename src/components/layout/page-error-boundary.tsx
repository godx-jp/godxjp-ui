import * as React from "react";

import { useTranslation } from "../../i18n/use-translation";
import { isDevelopment } from "../../lib/dev";
import { Button } from "../general/button";
import { ErrorSurface } from "./error-surface";
import type { PageErrorBoundaryProp } from "../../props/components/layout.prop";

export type {
  PageErrorBoundaryFallbackProp,
  PageErrorBoundaryProp,
  PageErrorBoundaryProp as PageErrorBoundaryProps,
} from "../../props/components/layout.prop";

/** The kit's own fallback: an `application` ErrorSurface with one recovery action. */
function DefaultPageErrorFallback() {
  const { t } = useTranslation();
  return (
    <ErrorSurface
      mode="application"
      status={500}
      // The page that threw took its own <h1> with it, so the surface IS the page heading.
      titleLevel={1}
      title={t("layout.pageErrorBoundary.title")}
      description={t("layout.pageErrorBoundary.description")}
      action={
        <Button type="button" onClick={() => window.location.reload()}>
          {t("layout.pageErrorBoundary.reload")}
        </Button>
      }
    />
  );
}

type BoundaryState = { error: unknown; failedAt: string | undefined } | null;

const currentLocation = () => (typeof window === "undefined" ? undefined : window.location.href);

/**
 * PageErrorBoundary — catches a render error thrown by ONE page and draws the failure in its
 * place, so the shell around it (sidebar, topbar, breadcrumb) stays up and the user can go
 * somewhere else (gh#1494). `AppShell` wraps its `children` in one by default.
 *
 * It RESETS ON NAVIGATION without knowing the router: a failed boundary records the URL it failed
 * on, and the next render under a different URL (the router re-renders the shell's children on
 * every visit) draws the page again. `resetKey` is the explicit form, for a change the URL does
 * not show. Without a reset, Back through history stayed on the error surface — the symptom a
 * consumer measured before it wrote its own boundary.
 */
export class PageErrorBoundary extends React.Component<
  PageErrorBoundaryProp,
  { failure: BoundaryState }
> {
  state: { failure: BoundaryState } = { failure: null };

  static getDerivedStateFromError(error: unknown): { failure: BoundaryState } {
    return { failure: { error, failedAt: currentLocation() } };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, info);
    } else if (isDevelopment()) {
      console.error("[@godxjp/ui] PageErrorBoundary caught a page render error:", error);
    }
  }

  componentDidUpdate(previous: PageErrorBoundaryProp): void {
    const { failure } = this.state;
    if (!failure) return;
    const keyChanged = !Object.is(previous.resetKey, this.props.resetKey);
    const moved = failure.failedAt !== undefined && failure.failedAt !== currentLocation();
    if (keyChanged || moved) this.reset();
  }

  reset = (): void => {
    this.setState({ failure: null });
  };

  render(): React.ReactNode {
    const { failure } = this.state;
    if (!failure) return this.props.children;
    const { fallback } = this.props;
    if (typeof fallback === "function")
      return fallback({ error: failure.error, reset: this.reset });
    if (fallback !== undefined) return fallback;
    return <DefaultPageErrorFallback />;
  }
}
