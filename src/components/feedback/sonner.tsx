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

function Toaster({ ...props }: ToasterProps) {
  const theme = useDocumentTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CheckCircle2 className="size-4" aria-hidden="true" />,
        info: <Info className="size-4" aria-hidden="true" />,
        warning: <TriangleAlert className="size-4" aria-hidden="true" />,
        error: <OctagonX className="size-4" aria-hidden="true" />,
        loading: <Loader2 className="size-4 animate-spin" aria-hidden="true" />,
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
        } as React.CSSProperties
      }
      position="bottom-right"
      mobileOffset={{ bottom: "16px", right: "16px" }}
      {...props}
    />
  );
}

export { Toaster };
