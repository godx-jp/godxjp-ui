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
      // BOTH signals. AppProvider switches theme with `data-theme` on <html> (`.dark` is only a
      // legacy alias), so a class-only observer never fires on a theme change and a class-only
      // read reports "light" while the page is dark. The `--normal-*`/tone vars below are inline
      // on the toaster and outrank sonner's own `[data-sonner-theme]` blocks either way, but the
      // rules those blocks own outright — the close button's dark fill, `[data-description]` —
      // do follow this prop. The class is kept because a consumer may still toggle one.
      obs.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });
      return () => {
        mq.removeEventListener("change", onStoreChange);
        obs.disconnect();
      };
    },
    () =>
      document.documentElement.dataset.theme === "dark" ||
      document.documentElement.classList.contains("dark")
        ? "dark"
        : "light",
    () => "light",
  );
}

/**
 * The four semantic toast types, each mapped to the status hue it carries and to the AA-strong
 * ink `Alert` already puts on that hue's tint (`[data-slot="alert-title"][data-tone=…]`).
 * Left column = sonner's own type name, which fixes the custom-property names it reads.
 */
const TOAST_TONES = [
  { type: "success", hue: "success", ink: "text-success" },
  { type: "error", hue: "destructive", ink: "text-error" },
  { type: "warning", hue: "warning", ink: "text-warning" },
  { type: "info", hue: "info", ink: "text-info" },
] as const;

/**
 * Sonner reads THREE custom properties per type (`--success-bg` / `-border` / `-text`, and the
 * same for error/warning/info) and falls back to the neutral `--normal-*` pair for any type that
 * leaves them unset — which is why `toast.success()` and `toast.error()` used to render the same
 * grey strip. Each triple is composed the way `Alert` composes a tone in alert-layout.css, using
 * that component's own alphas so the two stay one vocabulary: the status hue at
 * `--alert-bg-alpha` for the surface, the same hue at `--alert-border-alpha` for the edge, and
 * `--text-*` — the ink calibrated to clear AA on exactly that tint — for the text.
 *
 * The surface is `color-mix`ed INTO `--popover` rather than laid over it as a translucent fill:
 * an Alert is inline and may show the page through it, a toast floats over live content and a
 * see-through toast is unreadable at any contrast ratio.
 *
 * Written out here, not bound to `:root` tokens, so every `var()` resolves ON THE TOASTER —
 * a `[data-tenant]`/`.dark` subtree that retunes the palette therefore reaches the toast, which a
 * `:root`-bound token would freeze out (see the same note on `--sheet-overlay-background`).
 */
const toneVars = Object.fromEntries(
  TOAST_TONES.flatMap(({ type, hue, ink }) => [
    [
      `--${type}-bg`,
      `color-mix(in srgb, hsl(var(--${hue})) calc(var(--alert-bg-alpha) * 100%), hsl(var(--popover)))`,
    ],
    [`--${type}-border`, `hsl(var(--${hue}) / var(--alert-border-alpha))`],
    [`--${type}-text`, `hsl(var(--${ink}))`],
  ]),
) as React.CSSProperties;

/**
 * `richColors` defaults ON: it is the switch that makes sonner apply the per-type properties at
 * all (`[data-rich-colors='true'][data-type='success'] { … }`), so without it the tokens above
 * are declared and never read. A consumer can still pass `richColors={false}` for a deliberately
 * monochrome stack.
 */
function Toaster({ style, richColors = true, ...props }: ToasterProps) {
  const theme = useDocumentTheme();

  return (
    <Sonner
      theme={theme}
      richColors={richColors}
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
          ...toneVars,
          // MERGED LAST, never spread over: a consumer's `style` is an override of these
          // defaults, one custom property at a time. Assigning it instead of merging would
          // wipe every var above, and an unset `--normal-bg` renders the toast transparent.
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
