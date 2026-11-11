import * as React from "react";

import { useTranslation } from "../../i18n/use-translation";
import { isDevelopment } from "../../lib/dev";
import { Button } from "../general/button";
import { errorSurfaceFactory } from "./error-surface-loader";
import type { PageErrorBoundaryProp } from "../../props/components/layout.prop";

export type {
  PageErrorBoundaryFallbackProp,
  PageErrorBoundaryProp,
  PageErrorBoundaryProp as PageErrorBoundaryProps,
} from "../../props/components/layout.prop";

// LAZY: the fallback only draws after a page has thrown, so ErrorSurface (and the Card,
// Descriptions, EmptyState it composes) stays out of every route's up-front graph. `React.lazy` is
// typed for a Promise but only needs a thenable — see error-surface-loader.ts.
const LazyErrorSurface = React.lazy(
  errorSurfaceFactory as () => Promise<{
    default: typeof import("./error-surface").ErrorSurface;
  }>,
);

/**
 * The fallback's own minimal form: the same heading, sentence and reload action, as an alert.
 * Shown while the ErrorSurface chunk loads, and KEPT if the chunk cannot load at all (offline is a
 * common reason a page threw in the first place) — the user is never left with a blank page.
 */
function InlinePageErrorFallback() {
  const { t } = useTranslation();
  return (
    <div role="alert" data-slot="page-error-fallback" className="ui-page-error-fallback">
      <h1 className="ui-page-error-fallback-title">{t("layout.pageErrorBoundary.title")}</h1>
      <p className="ui-page-error-fallback-description">
        {t("layout.pageErrorBoundary.description")}
      </p>
      <div>
        <Button type="button" onClick={() => window.location.reload()}>
          {t("layout.pageErrorBoundary.reload")}
        </Button>
      </div>
    </div>
  );
}

/** Keeps the inline fallback when the ErrorSurface chunk itself fails to load. */
class FallbackLoadBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }
  render(): React.ReactNode {
    return this.state.failed ? <InlinePageErrorFallback /> : this.props.children;
  }
}

/** The kit's own fallback: an `application` ErrorSurface with one recovery action. */
function DefaultPageErrorFallback() {
  const { t } = useTranslation();
  return (
    <FallbackLoadBoundary>
      <React.Suspense fallback={<InlinePageErrorFallback />}>
        <LazyErrorSurface
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
      </React.Suspense>
    </FallbackLoadBoundary>
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
