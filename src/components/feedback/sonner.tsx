// shadcn/ui Sonner — recommended toast (replaces deprecated Radix Toast).
// @see https://ui.shadcn.com/docs/components/sonner
import * as React from "react";
import { CheckCircle2, Info, Loader2, OctagonX, TriangleAlert } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

function useDocumentTheme(): ToasterProps["theme"] {
  return React.useSyncExternalStore(
    (onStoreChange) => {
      if (typeof document === "undefined") return () => undefined;
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", onStoreChange);
      const obs = new MutationObserver(onStoreChange);
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => {
        mq.removeEventListener("change", onStoreChange);
        obs.disconnect();
      };
    },
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => "light",
  );
}

function Toaster({ style, ...props }: ToasterProps) {
  const theme = useDocumentTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      // cannot restyle a single icon without re-declaring the set — so the size is a token
      // (`--toast-icon-size`) read by `.ui-toast-icon` in alert-layout.css, not a `size-4` here.
      icons={{
        success: <CheckCircle2 className="ui-toast-icon" aria-hidden="true" />,
        info: <Info className="ui-toast-icon" aria-hidden="true" />,
        warning: <TriangleAlert className="ui-toast-icon" aria-hidden="true" />,
        error: <OctagonX className="ui-toast-icon" aria-hidden="true" />,
        loading: <Loader2 className="ui-toast-icon animate-spin" aria-hidden="true" />,
      }}
      style={
        {
          // Color tokens are raw HSL triplets (consumed as hsl(var(--token)));
          // sonner uses these vars verbatim as CSS colors, so wrap with hsl()
          // here — unwrapped they are invalid values and the toast renders
          // transparent.
          "--normal-bg": "hsl(var(--popover))",
          "--normal-text": "hsl(var(--popover-foreground))",
          "--normal-border": "hsl(var(--border))",
          "--border-radius": "var(--radius)",
          // MERGED, never spread over.
          // object and wiped all four vars — and an unset `--normal-bg` renders the toast
          // transparent.
          // var by name.
          ...style,
        } as React.CSSProperties
      }
      position="bottom-right"
      // Viewport gutter of the mobile stack. Sonner drops this straight into inline CSS, so a
      // var() string resolves normally — the two 16px literals were library config a service
      // theme could not reach.
      mobileOffset={{
        bottom: "var(--toast-mobile-offset)",
        right: "var(--toast-mobile-offset)",
      }}
      {...props}
    />
  );
}

export { Toaster };
