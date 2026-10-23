// shadcn/ui Sonner — recommended toast (replaces deprecated Radix Toast).
// @see https://ui.shadcn.com/docs/components/sonner
import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, Loader2, OctagonX, TriangleAlert } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useOverlayPortalContainer } from "../../lib/overlay-portal";
import { useTranslation } from "../../i18n/use-translation";

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
 * `--toast-duration` → milliseconds for Sonner's `duration` (gh#1253). Accepts the two CSS time
 * units; anything else (unset, `initial`, a typo) is `undefined`, which leaves Sonner's own
 * 4000ms default in charge rather than inventing a second one here.
 */
export function parseToastDuration(raw: string): number | undefined {
  const match = /^\s*(\d+(?:\.\d+)?)(ms|s)\s*$/.exec(raw);
  if (!match) return undefined;
  const ms = Number(match[1]) * (match[2] === "s" ? 1000 : 1);
  return ms > 0 ? ms : undefined;
}

/**
 * Sonner takes `duration` as a number, so the token is read from the cascade ONCE per host, after
 * mount — the only point at which computed style exists (SSR has none). Read from the ThemeScope
 * host when the toaster is portalled into one, so a themed region's duration applies; else from
 * `<html>`, where the tier file declares it.
 */
function useToastDurationToken(host: Element | undefined): number | undefined {
  const [duration, setDuration] = React.useState<number | undefined>(undefined);
  React.useEffect(() => {
    const element = host ?? document.documentElement;
    setDuration(parseToastDuration(getComputedStyle(element).getPropertyValue("--toast-duration")));
  }, [host]);
  return duration;
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
      // gh#866 — the surface reads its `--surface-*` role first, with the composite above as the
      // call-site fallback. Without it the toast was the fourth of eight status surfaces that
      // could only ever be a derivation of its own ink, so a brand's chosen pale ground reached
      // the Alert and not the toast that says the same sentence.
      `var(--surface-${hue}, color-mix(in srgb, hsl(var(--${hue})) calc(var(--alert-bg-alpha) * 100%), hsl(var(--popover) / var(--popover-alpha, 100%))))`,
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
 *
 * `expand` defaults ON (gh#1387). Sonner's collapsed deck keeps every earlier toast as a card
 * peeking behind the front one with its content faded to `opacity: 0`, so a second toast arriving
 * while the first is live drew an empty box behind it (gino-cloud: 338×51 frame, 13px above the
 * front toast, no text). Expanded, each visible toast is drawn whole. `expand={false}` restores
 * the deck for a consumer who wants it.
 */
function Toaster({
  style,
  richColors = true,
  expand = true,
  toastOptions,
  ...props
}: ToasterProps) {
  const theme = useDocumentTheme();
  const { t } = useTranslation();
  /*
   * Sonner is the one overlay in this library that does NOT portal — it renders where it is
   * mounted. On an ordinary page that is right, and this hook returns `undefined`, so nothing
   * moves. Inside a `ThemeScope` it returns that scope's body-level host, which is what makes a
   * toast raised from a themed region wear the region's tokens instead of the package defaults —
   * the same statement about the tree the other overlays already obey (gh#877).
   */
  const overlayPortalContainer = useOverlayPortalContainer();
  const tokenDuration = useToastDurationToken(overlayPortalContainer);

  const toaster = (
    <Sonner
      theme={theme}
      richColors={richColors}
      expand={expand}
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
          // `--normal-bg` is SONNER's private name, so the package's own knob is threaded through
          // it (gh#880): a theme sets `--toast-background` like every other surface's fill and
          // never has to know that this one surface is painted by a vendor stylesheet. The default
          // is the same `hsl(var(--popover))` and resolves in the browser, on the toaster, under
          // whatever scope it sits in — so a themed region's toast follows the region (gh#877).
          "--normal-bg":
            "var(--toast-background, hsl(var(--popover) / var(--popover-alpha, 100%)))",
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
      // gh#1271 — the bottom edge adds two clearances to the gutter: `--toast-offset-bottom` (a
      // theme knob, 0px) and `--toast-sticky-bar-height` (published at runtime by a visible sticky
      // action bar, 0px otherwise), so a toast never covers the submit button that raised it.
      // `24px` restates sonner's own desktop VIEWPORT_OFFSET, so with both at 0px the stack sits
      // exactly where it did; top/right/left are left unset and keep sonner's defaults.
      offset={{
        bottom: "calc(24px + var(--toast-offset-bottom) + var(--toast-sticky-bar-height))",
      }}
      // Viewport gutter of the mobile stack. Sonner drops this straight into inline CSS, so a
      // var() string resolves normally — the two 16px literals were library config a service
      // theme could not reach.
      mobileOffset={{
        bottom:
          "calc(var(--toast-mobile-offset) + var(--toast-offset-bottom) + var(--toast-sticky-bar-height))",
        right: "var(--toast-mobile-offset)",
      }}
      // `--toast-duration` (gh#1253). Before `{...props}`, so the Toaster's own `duration` prop
      // and a per-call `toast(…, { duration })` both still win.
      duration={tokenDuration}
      // The ✕ that `toast.error` / `toast.warning` carry by default (use-toast.ts, gh#1253) is
      // named in the active locale; Sonner's own label is a fixed English "Close toast".
      toastOptions={{ closeButtonAriaLabel: t("feedback.toast.close"), ...toastOptions }}
      {...props}
    />
  );

  return overlayPortalContainer ? createPortal(toaster, overlayPortalContainer) : toaster;
}

export { Toaster };
