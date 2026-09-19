import * as React from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleGroupStateContext,
  type ToggleButtonGroupProps,
  type ToggleButtonProps,
} from "react-aria-components";

import { cn } from "../../lib/utils";
import {
  restoreDomProps,
  toggleVariants,
  useCounterPill,
  type ToggleCountFields,
  type ToggleProp,
} from "./toggle";

type ToggleGroupVariant = ToggleProp["variant"];
type ToggleGroupSize = ToggleProp["size"];
type ToggleGroupShape = ToggleProp["shape"];

/**
 * Group-level `variant`/`size`/`shape`, provided to every item (upstream shadcn pattern). An
 * item's OWN prop still wins: the item reads context only where its own value is `undefined`.
 * `shape` joins the other two because the row is where the decision is made — a tag-filter panel
 * is a row of pill chips, not one pill among squares (gh#734).
 */
const ToggleGroupContext = React.createContext<{
  variant?: ToggleGroupVariant;
  size?: ToggleGroupSize;
  shape?: ToggleGroupShape;
  /**
   * Is this group nested inside a `role="toolbar"`? (gh#756)
   *
   * React Aria's `useToolbar` disables its own arrow-key handler whenever it finds a toolbar
   * ancestor, on the assumption that the toolbar owns navigation:
   *
   *     onKeyDownCapture: !isInToolbar ? onKeyDown : undefined
   *
   * This library's `Toolbar` is a plain `div role="toolbar"` that handles no keys, so in that
   * nesting NOBODY owns the arrows — and a roving tab stop with no arrows to rove it makes every
   * unselected option unreachable by keyboard (WCAG 2.1.1 A). Measured on a 3-item group: 1 of 3
   * tab stops, arrows inert.
   */
  inToolbar?: boolean;
  /**
   * `true` only for a `type="single"` group that may NOT be emptied — the one case where
   * `role="radio"` / `aria-checked` is expressible (gh#744). The item reads it to decide its own
   * ARIA and its tab stop.
   */
  radioSemantics?: boolean;
  /**
   * `true` only while an arrow key is walking the group. In `radioSemantics` mode the item reads
   * it to decide whether the focus it just received should carry the selection with it.
   */
  arrowNav?: React.RefObject<boolean>;
}>({});

const ARROW_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);

type ToggleGroupBaseProp = Omit<React.ComponentPropsWithoutRef<"div">, "defaultValue" | "dir"> & {
  variant?: ToggleGroupVariant;
  size?: ToggleGroupSize;
  shape?: ToggleGroupShape;
  /** Disable every item at once — RAC `isDisabled`. */
  disabled?: boolean;
  /** Which way the arrow keys walk the group. */
  orientation?: "horizontal" | "vertical";
  /**
   * May the group end up with NOTHING selected? Omitted (`false`) it may, which is what a tag
   * filter wants — pressing the selected chip again clears it and reports `""`. Set it and the
   * selected item stays selected when it is pressed again.
   *
   * **It also decides the ARIA role of a `type="single"` group (gh#744)**, because emptiness is
   * exactly what the two roles disagree about. ARIA has no "press again to deselect" for a radio:
   * a radiogroup that has a selection always has exactly one checked item, so a radiogroup that
   * the user just emptied is a state a screen reader cannot read out. Therefore:
   *
   * - omitted → `role="group"` + `aria-pressed` per item (a row of toggle buttons, which MAY be
   *   all-off) — this is the default, so no existing single group changes behaviour;
   * - set → `role="radiogroup"` + `role="radio"` / `aria-checked` per item, and the arrow keys
   *   move the SELECTION as APG's radio-group pattern requires, not just the focus.
   *
   * The name is React Aria's own (`useToggleGroupState`, which this component is built on) —
   * neither antd nor Radix names the capability. See `docs/DESIGN-AUTHORITY.md`.
   *
   * On `type="multiple"` it only keeps the last remaining item selected; the roles do not move
   * (a row of `aria-pressed` buttons is already the right reading there).
   */
  disallowEmptySelection?: boolean;
  /**
   * Let the row break onto further lines instead of running past its rail (gh#741). Same name,
   * same boolean shape and same `data-wrap` attribute as `Flex` — one spelling answers "what does
   * this row do when it does not fit" across the library.
   *
   * OPT-IN (`false`), and deliberately the SAME default for every `variant`. `Flex`'s `wrap` is
   * `false`, and one word must not mean two defaults. Measured in Chromium at a 320px rail:
   * forcing `flex-wrap: wrap` on all 18 groups of the docs page left the 17 that FIT untouched
   * (same line count, same height, at a 320px and a 1358px rail) — including every `soft` one, so
   * paint is not the axis that decides. The only row it moves is the one that overflows, from
   * 171.5px to 108px: a default of `true` reflows exactly those rows, silently, on an upgrade
   * whose call sites did not change.
   *
   * Wrapping keeps the group's single `gap`, so the two axes stay equal (4px × 4px measured);
   * `flex-wrap` reorders nothing, so arrow keys still walk the items in DOM order across lines.
   */
  wrap?: boolean;
  /**
   * Writing direction. It still lands on the DOM node, but React Aria reads the direction it
   * navigates by from the ambient locale (`I18nProvider`), NOT from this attribute — where Radix
   * read this prop directly. An RTL app must set the locale, not just `dir`.
   */
  dir?: "ltr" | "rtl";
  /**
   * Accepted for source compatibility with the Radix era, where it wrapped arrow-key focus around
   * the ends. React Aria's toolbar navigation stops at the ends and has no equivalent switch, so
   * this prop no longer changes anything.
   */
  loop?: boolean;
};

/**
 * `type` is the discriminant, exactly as it was under Radix: `"single"` reports the one selected
 * value as a string (`""` once it is deselected), `"multiple"` reports an array. React Aria models
 * both as `selectionMode` + a `Set` of keys — that Set is built and unpacked here so the public
 * shape stays a string / an array of strings.
 */
type ToggleGroupSingleProp = ToggleGroupBaseProp & {
  type: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type ToggleGroupMultipleProp = ToggleGroupBaseProp & {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

type ToggleGroupProp = ToggleGroupSingleProp | ToggleGroupMultipleProp;

/** `""` is Radix's "nothing selected" for a single group; RAC's is an empty Set. */
function toSelectedKeys(value: string | string[] | undefined): Set<string> | undefined {
  if (value == null) {
    return undefined;
  }
  if (Array.isArray(value)) {
    return new Set(value);
  }
  return new Set(value === "" ? [] : [value]);
}

export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProp>(
  // No destructuring defaults: an unset prop must stay `undefined` so the emitted attribute is
  // either absent or a declared union member.
  // is NOT in the `sm | md | lg` size union — the group advertised an invalid value for its own
  // type.) The real default lives in `toggleVariants`, applied per item.
  (
    {
      className,
      variant,
      size,
      shape,
      wrap,
      children,
      type,
      value,
      defaultValue,
      onValueChange,
      disabled,
      disallowEmptySelection,
      loop: _loop,
      ...props
    },
    ref,
  ) => {
    // The emptiness rule DECIDES the role (gh#744): only a single group that cannot be emptied
    // can honestly claim the radio pattern.
    const radioSemantics = type === "single" && disallowEmptySelection === true;
    const arrowNav = React.useRef(false);
    // Same probe React Aria runs, for the same reason — see `inToolbar` on the context. Read
    // after mount because it asks about an ANCESTOR, which does not exist during render.
    const groupElement = React.useRef<HTMLDivElement | null>(null);
    const [inToolbar, setInToolbar] = React.useState(false);
    React.useLayoutEffect(() => {
      setInToolbar(!!groupElement.current?.parentElement?.closest('[role="toolbar"]'));
    }, []);
    // Stable identity — a fresh object each render would re-render every item on any parent render.
    const context = React.useMemo(
      () => ({ variant, size, shape, radioSemantics, arrowNav, inToolbar }),
      [variant, size, shape, radioSemantics, inToolbar],
    );
    const selectedKeys = React.useMemo(() => toSelectedKeys(value), [value]);
    const defaultSelectedKeys = React.useMemo(() => toSelectedKeys(defaultValue), [defaultValue]);
    const handleSelectionChange = (keys: Set<React.Key>) => {
      const next = [...keys].map(String);
      if (type === "single") {
        onValueChange?.(next[0] ?? "");
      } else {
        onValueChange?.(next);
      }
    };
    return (
      <ToggleButtonGroup
        ref={ref}
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        // Same emitted shape as Flex: the attribute is ABSENT unless asked for, so no rule can
        // match and a group that never opted in is byte-identical to 27.10.0 (gh#741).
        data-wrap={wrap ? "true" : undefined}
        className={cn("ui-toggle-group", className)}
        {...(props as Omit<ToggleButtonGroupProps, "children" | "className">)}
        selectionMode={type}
        selectedKeys={selectedKeys}
        defaultSelectedKeys={defaultSelectedKeys}
        onSelectionChange={handleSelectionChange}
        isDisabled={disabled}
        disallowEmptySelection={disallowEmptySelection}
        // React Aria hands EVERY single group `role="radiogroup"`, whether or not it can be
        // emptied. `render` is RAC's own escape hatch, and this is the one place the role can be
        // corrected without forking the hook: a group that may be emptied is a plain `group` of
        // `aria-pressed` buttons. `aria-orientation` goes with it — `group` does not take it
        // (WAI-ARIA 1.2 allows only `aria-activedescendant` / `aria-expanded` there), while
        // `radiogroup` and `toolbar` both do, so it survives untouched in those two modes.
        render={(domProps) => (
          <div
            {...props}
            {...domProps}
            // MERGE, never replace: `domProps` carries React Aria's own ref, and overwriting it
            // leaves `useToolbar` with a null element — which silently kills the arrow keys this
            // very fix is about. Caught by four existing arrow-key tests going red.
            ref={(node: HTMLDivElement | null) => {
              groupElement.current = node;
              const aria = (domProps as { ref?: React.Ref<HTMLDivElement> }).ref;
              if (typeof aria === "function") aria(node);
              else if (aria) (aria as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }}
            {...(type === "single" && !radioSemantics
              ? { role: "group", "aria-orientation": undefined }
              : null)}
            // Runs BEFORE React Aria's own capture handler, which is what moves the focus. It
            // only records WHY the focus is about to move, so the item can tell an arrow key
            // (selection travels with it) from RAC's Tab handler, which focuses the last item on
            // the way out of the group and must leave the selection alone.
            onKeyDownCapture={(event) => {
              if (radioSemantics) {
                arrowNav.current = ARROW_KEYS.has(event.key);
                if (arrowNav.current) {
                  queueMicrotask(() => {
                    arrowNav.current = false;
                  });
                }
              }
              domProps.onKeyDownCapture?.(event);
            }}
            tabIndex={props.tabIndex ?? domProps.tabIndex}
          />
        )}
      >
        <ToggleGroupContext.Provider value={context}>{children}</ToggleGroupContext.Provider>
      </ToggleButtonGroup>
    );
  },
);
ToggleGroup.displayName = "ToggleGroup";

/** Same vocabulary as `Toggle` and `Button` — one counter pill for the whole library. */
export type ToggleGroupItemProp = Omit<React.ComponentPropsWithoutRef<"button">, "value"> &
  ToggleCountFields & {
    /**
     * This item's key in the group's value. React Aria calls it `id` (the key it stores in
     * `selectedKeys`); the public spelling stays `value`, as it was under Radix.
     */
    value: string;
    variant?: ToggleGroupVariant;
    size?: ToggleGroupSize;
    shape?: ToggleGroupShape;
  };

export type ToggleGroupItemProps = ToggleGroupItemProp;

export const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProp>(
  (
    {
      className,
      variant,
      size,
      shape,
      count,
      overflowCount,
      showZero,
      countLabel,
      children,
      "aria-label": ariaLabel,
      value,
      disabled,
      ...props
    },
    ref,
  ) => {
    const context = React.useContext(ToggleGroupContext);
    // An explicit item prop ALWAYS wins; context fills in only where the item said nothing.
    const resolvedVariant = variant ?? context.variant;
    const resolvedSize = size ?? context.size;
    const resolvedShape = shape ?? context.shape;
    const { pill, resolvedAriaLabel } = useCounterPill({
      count,
      overflowCount,
      showZero,
      countLabel,
      ariaLabel,
    });
    // The selection lives in RAC's group state; `data-state` — what the CSS reads — is rendered
    // from it rather than from a second copy kept here.
    const groupState = React.useContext(ToggleGroupStateContext);
    const isPressed = groupState?.selectedKeys.has(value) ?? false;
    const isSingle = groupState?.selectionMode === "single";
    const radioSemantics = context.radioSemantics === true;
    // APG's radio-group pattern is ONE tab stop, on the checked item. React Aria's toolbar
    // navigation leaves every item tabbable, which is right for `aria-pressed` buttons and wrong
    // for radios — so the roving tab stop is applied here, in the mode that claims the role. With
    // nothing selected there is no checked item to put it on, so the toolbar tab order stands.
    // …and NOT when the arrow keys are dead. Inside a `role="toolbar"` React Aria hands its
    // navigation to the toolbar, which this library's `Toolbar` never implements, so roving here
    // would strand every unselected option (gh#756). Falling back to a tab stop per item keeps
    // the `radiogroup`/`radio` roles honest and every option reachable; it costs N tab stops
    // instead of one, which is the lesser of the two failures.
    const rovingTabIndex =
      radioSemantics && !context.inToolbar && groupState && groupState.selectedKeys.size > 0
        ? isPressed
          ? 0
          : -1
        : undefined;
    return (
      <ToggleButton
        ref={ref}
        data-slot="toggle-group-item"
        data-state={isPressed ? "on" : "off"}
        data-variant={resolvedVariant}
        data-size={resolvedSize}
        data-shape={resolvedShape}
        aria-label={resolvedAriaLabel}
        className={cn(
          toggleVariants({ variant: resolvedVariant, size: resolvedSize, shape: resolvedShape }),
          className,
        )}
        {...(props as Omit<ToggleButtonProps, "children" | "className">)}
        id={value}
        isDisabled={disabled}
        // React Aria stamps `role="radio"` + `aria-checked` on every item of a single group and
        // deletes `aria-pressed`. That reading is only true when the group cannot be emptied
        // (gh#744); otherwise the item goes back to being what it is — a toggle button whose
        // pressed state MAY be off for all of them.
        render={(domProps) =>
          restoreDomProps(props, {
            ...domProps,
            ...(isSingle && !radioSemantics
              ? { role: undefined, "aria-checked": undefined, "aria-pressed": isPressed }
              : null),
            ...(rovingTabIndex == null ? null : { tabIndex: rovingTabIndex }),
            // Selection follows focus, as APG requires of a radio group — but only when an arrow
            // key is what moved it. Measured otherwise: RAC's toolbar Tab handler focuses the
            // LAST item on the way out, which silently moved the selection to it.
            ...(radioSemantics
              ? {
                  onFocus: (event: React.FocusEvent<HTMLButtonElement>) => {
                    if (
                      context.arrowNav?.current &&
                      groupState &&
                      groupState.selectedKeys.size > 0 &&
                      !isPressed
                    ) {
                      groupState.setSelected(value, true);
                    }
                    domProps.onFocus?.(event);
                  },
                }
              : null),
          })
        }
      >
        {children}
        {pill}
      </ToggleButton>
    );
  },
);
ToggleGroupItem.displayName = "ToggleGroupItem";
