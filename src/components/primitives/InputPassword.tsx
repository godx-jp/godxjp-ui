import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "./cn";
import { Input, type InputProps } from "./Input";

/**
 * InputPassword — Input subtype with show/hide toggle.
 *
 * Mirrors the canonical password reveal at `K:comp-inputs.html:184-201`:
 * a `<button class="pass-toggle">` absolute-positioned at `right:6px`,
 * with an `Eye` / `EyeOff` icon flipping the underlying `<input>` type.
 *
 * Wraps `<Input>` so every base prop pass-through works (`size`,
 * `status`, `prefix`, `addonBefore`, etc.). Pair with `<Checklist>`
 * below to render password-strength rules.
 *
 * Controlled-or-uncontrolled reveal:
 *   - omit `revealed` → internal state
 *   - pass `revealed` + `onRevealChange` → fully controlled
 *
 * @example
 *   <InputPassword placeholder="••••••••••" />
 *
 * @example with strength meter slot
 *   <Field>
 *     <Field.Label required>パスワード</Field.Label>
 *     <InputPassword strengthMeter={<Checklist items={…} />} />
 *   </Field>
 */

export interface InputPasswordProps extends Omit<InputProps, "type"> {
  /** Controlled reveal state. */
  revealed?: boolean;
  /** Default reveal state when uncontrolled. */
  defaultRevealed?: boolean;
  onRevealChange?: (next: boolean) => void;
  /** Accessible label for the toggle button. Defaults to a translated string. */
  toggleLabels?: { show?: string; hide?: string };
  /** Slot rendered below the input — typically a `<Checklist>` of password rules. */
  strengthMeter?: ReactNode;
}

export const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(
  function InputPassword(
    {
      revealed: controlled,
      defaultRevealed = false,
      onRevealChange,
      toggleLabels,
      suffix,
      strengthMeter,
      className,
      ...rest
    },
    ref,
  ) {
    const [internal, setInternal] = useState(defaultRevealed);
    const revealed = controlled ?? internal;

    const toggle = () => {
      const next = !revealed;
      if (controlled === undefined) setInternal(next);
      onRevealChange?.(next);
    };

    const showLabel = toggleLabels?.show ?? "Show password";
    const hideLabel = toggleLabels?.hide ?? "Hide password";

    const toggleButton = (
      <button
        type="button"
        className="input-pass-toggle"
        onClick={toggle}
        aria-label={revealed ? hideLabel : showLabel}
        aria-pressed={revealed}
        tabIndex={-1}
      >
        {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    );

    return (
      <>
        <Input
          ref={ref}
          type={revealed ? "text" : "password"}
          suffix={suffix ?? toggleButton}
          className={cn(className)}
          {...rest}
        />
        {strengthMeter}
      </>
    );
  },
);
