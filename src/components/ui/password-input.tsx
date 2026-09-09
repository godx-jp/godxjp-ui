import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { Input } from "../data-entry/input";

/**
 * antd `Input.Password.visibilityToggle`. `false` removes the eye entirely — a kiosk, a shared
 * screen, or a security policy that forbids ever revealing a secret has no other way to say so.
 * The object form is the controlled triad for the reveal state: `visible` wins when provided, and
 * `onVisibleChange` fires on both the controlled and the uncontrolled path.
 */
export type PasswordVisibilityToggleProp =
  boolean | { visible?: boolean; onVisibleChange?: (visible: boolean) => void };

export type PasswordInputProps = Omit<React.ComponentPropsWithoutRef<typeof Input>, "type"> & {
  /** antd `visibilityToggle` — see {@link PasswordVisibilityToggleProp}. Default `true`. */
  visibilityToggle?: PasswordVisibilityToggleProp;
  /** antd `iconRender` — replace the eye glyph. Receives the CURRENT visibility. */
  iconRender?: (visible: boolean) => React.ReactNode;
};

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { className, visibilityToggle = true, iconRender, suffix, trailingIcon, allowClear, ...props },
    ref,
  ) => {
    const { t } = useTranslation();
    const controlledVisible =
      typeof visibilityToggle === "object" ? visibilityToggle.visible : undefined;
    const onVisibleChange =
      typeof visibilityToggle === "object" ? visibilityToggle.onVisibleChange : undefined;
    const showToggle = visibilityToggle !== false;
    const [internalVisible, setInternalVisible] = React.useState(false);
    const isVisibleControlled = controlledVisible !== undefined;
    // A toggle that is not rendered can never reveal anything: `visibilityToggle={false}` forces
    // the field masked, which is the whole point of asking for it.
    const visible = showToggle
      ? isVisibleControlled
        ? controlledVisible
        : internalVisible
      : false;
    const setVisible = (next: boolean) => {
      if (!isVisibleControlled) setInternalVisible(next);
      onVisibleChange?.(next);
    };

    // ONE TRAILING ACTION, enforced from here. Input's own rule (the clear ✕ replaces
    // `suffix`/`trailingIcon`) cannot see this toggle, which used to be a SIBLING of the field —
    // so a `suffix` or an `allowClear` passed through put a second control in the same corner.
    // While the toggle is shown it OWNS that corner and the competing slots are dropped.
    const toggleOwnsTrailing = showToggle;
    if (
      toggleOwnsTrailing &&
      process.env?.NODE_ENV !== "production" &&
      (suffix != null || trailingIcon != null || allowClear)
    ) {
      console.warn(
        "[godxjp-ui] PasswordInput: the reveal toggle owns the trailing slot, so `suffix` / " +
          "`trailingIcon` / `allowClear` are ignored. Use `leadingIcon` (or `prefix`), or pass " +
          "`visibilityToggle={false}` to hand the slot back.",
      );
    }

    return (
      <div className="ui-password-input" data-slot="password-input">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(showToggle && "ui-password-input-field", className)}
          suffix={toggleOwnsTrailing ? undefined : suffix}
          trailingIcon={toggleOwnsTrailing ? undefined : trailingIcon}
          allowClear={toggleOwnsTrailing ? false : allowClear}
          {...props}
        />
        {showToggle ? (
          <button
            type="button"
            className="ui-password-input-toggle"
            // A disabled field's toggle must go with it — revealing the value of a field the user
            // cannot edit is still a reveal.
            disabled={props.disabled}
            // Keep the caret where it was: taking focus to the button on mousedown would lose the
            // insertion point mid-password. Keyboard activation still focuses the button normally.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setVisible(!visible)}
            aria-label={visible ? t("ui.passwordInput.hide") : t("ui.passwordInput.show")}
            aria-pressed={visible}
          >
            {iconRender ? (
              iconRender(visible)
            ) : visible ? (
              <EyeOff aria-hidden="true" />
            ) : (
              <Eye aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
