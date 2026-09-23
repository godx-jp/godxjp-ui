import * as React from "react";
import { Slot } from "../../lib/slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../i18n/use-translation";
import type { ButtonProp } from "../../props/components/general.prop";
import { numberFormat } from "../../lib/intl-cache";

const buttonVariants = cva("ui-button", {
  variants: {
    variant: {
      // Colour is the TOKEN LAYER's (`.ui-button--default` in styles/control.css), not a utility's.
      // The three utilities that used to sit here — `bg-primary text-primary-foreground
      // hover:bg-primary/90` — restated the fill the components layer already declares and, being
      // utilities, out-ranked it: the hover step this library takes from the derived tier
      // (`--primary-hover`) could never take effect while `hover:bg-primary/90` was emitted here.
      default: "ui-button--default",
      // `bg-destructive` LEFT for the reason spelled out on `default` above, and gh#880 is
      // where it finally cost something: a utility out-ranks `@layer components`, so
      // `--button-destructive-background` could not have reached this variant while it stood.
      // The ink stays a utility — nothing competes for `color` here.
      destructive: "ui-button--destructive text-destructive-foreground",
      // `shadow-xs` từng nằm ở đây và mắc ĐÚNG lỗi đã nêu ngay trên cho `default`:
      // một utility thì out-rank tầng components, nên bóng của nút outline đi vòng
      // qua tầng token — consumer đặt `--shadow-sm: none` thì `default` sạch bóng còn
      // `outline` trơ ra. Nay bóng khai ở `.ui-button--outline` và đọc `var(--shadow-sm)`
      // như mọi biến thể khác, nên nó tắt/đổi được qua theme. (gh#662)
      // `bg-background` gone for the same reason (gh#880). The HOVER fill stays a utility: it
      // is the same value `.ui-button--outline:hover` declares, and moving it is a separate
      // decision from making the resting surface reachable.
      outline: "ui-button--outline hover:bg-accent hover:text-accent-foreground",
      // `dashed` is `outline` with a dashed edge, so it shares `--button-outline-background`
      // rather than growing a knob of its own (gh#880).
      dashed: "ui-button--dashed hover:bg-accent hover:text-accent-foreground",
      secondary: "ui-button--secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "ui-button--ghost hover:bg-accent hover:text-accent-foreground",
      // `text-primary` gone for the reason `bg-background` went in gh#880 and the checkbox's
      // `data-[state=checked]:bg-primary` went before it: a utility is layered AFTER components in
      // Tailwind v4, so it silently out-ranked `.ui-button--link`'s own `color` and NO token could
      // reach this ink. gh#884 measured the consequence — the link is the one Button variant whose
      // brand colour is TEXT on a page surface rather than a fill, and it fails WCAG 2.2 AA at
      // 9 of 15 theme x seed cells. The components-layer rule now resolves
      // `var(--button-link-foreground, hsl(var(--primary)))`, and `text-primary` compiled to
      // exactly that fallback, so the default is byte-identical.
      link: "ui-button--link underline-offset-4 hover:underline",
      // NO utilities, deliberately: `bare` is the absence of geometry, and every property it has
      // to unset (the size tier's height and inline inset) is declared in the components layer.
      // A utility here would be the only thing that could out-rank it. See `.ui-button--bare`.
      bare: "ui-button--bare",
    },
    size: {
      default: "ui-button--default-size",
      md: "ui-button--default-size",
      // utilities after components, so only a utility can out-rank a child's own `size-*`.
      // They read the token, so the value is still themeable.
      xs: "ui-button--xs [&_svg:not([class*='size-'])]:size-[var(--button-xs-icon-size)]",
      sm: "ui-button--sm",
      lg: "ui-button--lg",
      icon: "ui-button--icon",
      "icon-xs": "ui-button--icon-xs [&_svg]:size-[var(--button-xs-icon-size)] [&_svg]:shrink-0",
      "icon-sm": "ui-button--icon-sm",
      "icon-lg": "ui-button--icon-lg",
    },
    // Single source of corner radius (deterministic — no competing rounded-* utility): default uses
    // pill is fully rounded, sharp is square.
    shape: {
      default: "rounded-[var(--button-radius)]",
      pill: "rounded-[var(--radius-pill)]",
      sharp: "rounded-[var(--radius-sharp)]",
    },
  },
  defaultVariants: { variant: "default", size: "default", shape: "default" },
});

export type { ButtonProp, ButtonProp as ButtonProps } from "../../props/components/general.prop";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProp>(
  (
    {
      className,
      variant,
      size,
      shape,
      fullWidth = false,
      fill = false,
      wrap = false,
      align = "center",
      asChild = false,
      loading = false,
      loadingText,
      count,
      overflowCount = 99,
      showZero = true,
      countLabel,
      disabled,
      type,
      children,
      ...props
    },
    ref,
  ) => {
    const { locale } = useTranslation();
    const Comp = asChild ? Slot : "button";
    // While loading the control is non-interactive (blocks activation + pointer events) and
    // announces `aria-busy`. The spinner is rendered as a LEADING sibling so the label stays in
    // place (no abrupt width jump); a `loadingText` swaps the label for an i18n-friendly message.
    const isLoading = !asChild && loading;
    const content = isLoading ? (
      <>
        <Loader2 className="animate-spin" aria-hidden="true" />
        {loadingText ?? children}
      </>
    ) : (
      children
    );
    // The count is a trailing borderless counter (Ant Badge parity). Ignored under `asChild`
    // (Slot needs a single child). `showZero` controls the 0 case; values over `overflowCount`
    // render as `{overflowCount}+`. Localized via Intl.NumberFormat (grouping per locale).
    const showCount = !asChild && count != null && (count !== 0 || showZero);
    const countText =
      showCount && count != null && count > overflowCount
        ? `${numberFormat(locale).format(overflowCount)}+`
        : count != null
          ? numberFormat(locale).format(count)
          : "";
    // ACCESSIBLE NAME — the same construction `Toggle`'s counter pill uses, so a counted button
    // and a counted chip announce identically (gh#734). The digits concatenate straight onto the
    // label when they are plain content ("Git" + "3" = "Git3"), so the pill is `aria-hidden` and
    // the spoken form is an `sr-only` sibling: "Git, 3 pages". With an explicit `aria-label` the
    // contents are outside the name altogether, so the clause is folded into the label instead.
    const spokenCount = countLabel ? `${countText} ${countLabel}` : countText;
    // `aria-label` stays INSIDE `props` and is only overridden when the clause actually has to go
    // somewhere else, so an uncounted button emits the identical attribute list it always has —
    // `src/components/data-display/__tests__/range-timeline-nested.test.tsx` compares Button's
    // serialized markup byte for byte, and merely re-ordering the attributes would fail it.
    const ariaLabel = props["aria-label"];
    const foldedAriaLabel =
      showCount && ariaLabel != null ? { "aria-label": `${ariaLabel}, ${spokenCount}` } : null;
    const countNode = showCount ? (
      <>
        <span data-slot="button-count" className="ui-button-count" aria-hidden="true">
          {countText}
        </span>
        <span className="sr-only">{`, ${spokenCount}`}</span>
      </>
    ) : null;
    return (
      <Comp
        data-slot="button"
        data-variant={variant ?? "default"}
        data-size={size ?? "default"}
        data-shape={shape ?? "default"}
        data-full-width={fullWidth ? "" : undefined}
        data-fill={fill ? "" : undefined}
        data-wrap={wrap ? "" : undefined}
        data-align={align === "center" ? undefined : align}
        data-loading={isLoading ? "" : undefined}
        aria-busy={isLoading || undefined}
        disabled={isLoading || disabled}
        type={asChild ? undefined : (type ?? "button")}
        className={cn(
          fullWidth && "w-full",
          "aria-invalid:border-destructive",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          buttonVariants({ variant, size, shape, className }),
        )}
        ref={ref}
        {...props}
        {...foldedAriaLabel}
      >
        {asChild ? (
          children
        ) : (
          <>
            {content}
            {countNode}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
