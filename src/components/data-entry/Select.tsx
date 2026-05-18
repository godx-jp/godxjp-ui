import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  forwardRef,
  Fragment,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react";
import { cn } from "../cn";

/**
 * Select — Radix-backed dropdown field. Trigger uses `.input` +
 * `.select-trigger`; list uses `.select-content` / `.select-item`
 * from tokens.css.
 *
 * Data-driven (Ant / MUI / Mantine canonical) — pass `options`:
 *
 *      <Select options={[
 *        { value: "tokyo", label: "東京" },
 *        { value: "osaka", label: "大阪" },
 *      ]} placeholder="都道府県を選択" />
 */

export interface SelectOption {
  value: string;
  /** Display content — usually a string, but ReactNode is fine for
   * icon + label compositions. */
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: ReactNode;
  options: SelectOption[];
}

export type SelectOptions = ReadonlyArray<SelectOption | SelectOptionGroup>;

export interface SelectProps extends Omit<
  ComponentPropsWithoutRef<typeof SelectPrimitive.Root>,
  "children"
> {
  options: SelectOptions;
  placeholder?: ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
}

function isOptionGroup(
  opt: SelectOption | SelectOptionGroup,
): opt is SelectOptionGroup {
  return Array.isArray((opt as SelectOptionGroup).options);
}

export function Select({
  options,
  placeholder,
  triggerClassName,
  contentClassName,
  ...rest
}: SelectProps) {
  return (
    <SelectPrimitive.Root {...rest}>
      <Trigger className={triggerClassName}>
        <SelectPrimitive.Value placeholder={placeholder} />
      </Trigger>
      <Content className={contentClassName}>
        {options.map((opt, i) =>
          isOptionGroup(opt) ? (
            <Fragment key={`group-${i}`}>
              <SelectPrimitive.Group>
                <Label>{opt.label}</Label>
                {opt.options.map((leaf) => (
                  <Item
                    key={leaf.value}
                    value={leaf.value}
                    disabled={leaf.disabled}
                  >
                    {leaf.label}
                  </Item>
                ))}
              </SelectPrimitive.Group>
              {i < options.length - 1 && <Separator />}
            </Fragment>
          ) : (
            <Item key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </Item>
          ),
        )}
      </Content>
    </SelectPrimitive.Root>
  );
}

const Trigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(function Trigger({ className, children, ...rest }, ref) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn("input", "select-trigger", className)}
      {...rest}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          className="muted"
          aria-hidden
          style={{
            width: "var(--spacing-4)",
            height: "var(--spacing-4)",
            flexShrink: 0,
          }}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

const Content = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function Content(
  { className, children, position = "popper", sideOffset = 4, ...rest },
  ref,
) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn("select-content", className)}
        position={position}
        sideOffset={sideOffset}
        {...rest}
      >
        <ScrollUp>
          <ChevronUp
            aria-hidden
            style={{ width: "var(--spacing-4)", height: "var(--spacing-4)" }}
          />
        </ScrollUp>
        <SelectPrimitive.Viewport className="select-viewport">
          {children}
        </SelectPrimitive.Viewport>
        <ScrollDown>
          <ChevronDown
            aria-hidden
            style={{ width: "var(--spacing-4)", height: "var(--spacing-4)" }}
          />
        </ScrollDown>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

const Label = forwardRef<
  ElementRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(function Label({ className, ...rest }, ref) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn("select-label", className)}
      {...rest}
    />
  );
});

const Item = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function Item({ className, children, ...rest }, ref) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn("select-item", className)}
      {...rest}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});

const Separator = forwardRef<
  ElementRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(function Separator({ className, ...rest }, ref) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn("select-separator", className)}
      {...rest}
    />
  );
});

const ScrollUp = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(function ScrollUp({ className, ...rest }, ref) {
  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={cn("select-scroll-btn", className)}
      {...rest}
    />
  );
});

const ScrollDown = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(function ScrollDown({ className, ...rest }, ref) {
  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={cn("select-scroll-btn", className)}
      {...rest}
    />
  );
});
