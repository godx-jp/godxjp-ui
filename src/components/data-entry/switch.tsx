import * as React from "react";
import { Switch as AriaSwitch } from "react-aria-components";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useFieldIdentity, useMirroredInputAttributes } from "../../lib/field-a11y";
import type { SwitchProp } from "../../props/components/data-entry.prop";

export type { SwitchProp, SwitchProp as SwitchProps } from "../../props/components/data-entry.prop";

/*
 * NỀN: react-aria-components, không còn @radix-ui/react-switch — cùng một nước đi đã làm với
 * `Checkbox`, và hình dạng DOM đổi theo đúng cách đó:
 *
 *   Radix:  <button role="switch" data-state="checked" class="ui-switch">…</button>
 *   RAC:    <label class="ui-switch" data-state="checked"><input role="switch" …></label>
 *
 * Tức là PHẦN TỬ NHẬN TIÊU ĐIỂM và PHẦN TỬ ĐƯỢC TÔ không còn là một. `data-state` / `data-size`
 * ở lại trên cái được tô (CSS bám vào đó), còn hợp đồng a11y — `aria-invalid`, và `aria-busy` /
 * `aria-disabled` của `loading` — phải nằm trên cái nhận tiêu điểm, tức `<input>`.
 *
 * RAC lọc sạch `aria-*` lạ và mọi `data-*` khỏi `<input>` (`removeDataAttributes`), nên ba thuộc
 * tính ấy được ghi tay qua `inputRef`, y như `data-field` ở checkbox.tsx.
 */

export const Switch = React.forwardRef<HTMLLabelElement, SwitchProp>(
  (
    {
      className,
      size = "md",
      name,
      checked,
      defaultChecked = false,
      onCheckedChange,
      loading = false,
      checkedChildren,
      unCheckedChildren,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    // `{}` otherwise; the
    // resolved `name` also feeds the hidden input below, so the toggle still submits natively.
    const identity = useFieldIdentity({
      id: props.id,
      name,
      "data-field": (props as { "data-field"?: string })["data-field"],
    });
    const resolvedName = name ?? identity.name;
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleCheckedChange = (next: boolean) => {
      // antd `loading` — the toggle is mid-flight, so it refuses the change without becoming a
      // different control. `disabled` would have been the cheap way to say this and it is the
      // wrong one: a disabled button leaves the tab order, so a keyboard user's focus is thrown
      // to the next field the moment they flip a switch that saves over the network.
      if (loading) return;
      if (!isControlled) {
        setInternalChecked(next);
      }
      onCheckedChange?.(next);
    };

    const ownField = (props as { "data-field"?: string })["data-field"];
    const fieldKey = ownField ?? identity["data-field"];
    const invalid = props["aria-invalid"];
    const isInvalid = invalid !== undefined && invalid !== false && invalid !== "false";
    const inputRef = React.useRef<HTMLInputElement>(null);
    useMirroredInputAttributes(inputRef, {
      "aria-invalid": isInvalid ? "true" : undefined,
      "aria-busy": loading ? "true" : undefined,
      "aria-disabled": loading ? "true" : undefined,
      // react-aria's `Switch` Omits `isRequired`, and a switch is never the target of native
      // constraint validation in this library — the form layer owns that. The prop is accepted
      // for shape and announced through `aria-required`.
      "aria-required": required ? "true" : undefined,
      "data-field": fieldKey,
    });

    const state = isChecked ? "checked" : "unchecked";

    return (
      <>
        {resolvedName ? (
          <input type="hidden" name={resolvedName} value={isChecked ? "1" : "0"} readOnly />
        ) : null}
        {/* `name` is deliberately NOT handed to react-aria: it would render a SECOND native
            control under the same name and the form would carry the key twice. The hidden input
            above is the one that submits, exactly as under Radix (which never saw `name` either
            — it was destructured off before the primitive). */}
        <AriaSwitch
          {...(props as unknown as Record<string, never>)}
          ref={ref}
          inputRef={inputRef}
          data-slot="switch"
          data-size={size}
          data-state={state}
          data-loading={loading ? "true" : undefined}
          isSelected={isChecked}
          isDisabled={disabled}
          onChange={handleCheckedChange}
          // Enter. Under Radix the switch was a `<button type="button" role="switch">`, and a
          // button toggles on BOTH Space and Enter. react-aria's switch is a real
          // `<input type="checkbox">`, which by the HTML spec answers Space only — Enter on a
          // checkbox submits the enclosing form instead. The key event bubbles from the input to
          // this label, so the older contract is restored here rather than lost in the base swap.
          // `preventDefault` is what a `type="button"` gave for free: no accidental submit.
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            handleCheckedChange(!isChecked);
          }}
          className={cn(
            // `.ui-switch:disabled, .ui-switch[data-disabled]` in styles/control.css already
            // declares both and reads --disabled-opacity. The utility was layered after
            // components, so it silently outranked that token. Byte-identical: the token
            // defaults to 0.5. (`shadow-xs` STAYS — .ui-switch declares --shadow-sm, so this
            // utility is the switch's real resting elevation, not a duplicate.)
            "peer ui-switch shadow-xs transition-all",
            className,
          )}
        >
          {/* antd `checkedChildren` / `unCheckedChildren` — the ON/OFF word inside the track.
              Exactly one is in the DOM at a time and it is `aria-hidden`: the switch already
              announces its own on/off through `role="switch"` + its checked state, and a screen
              reader reading "有効, switch, checked" says the same thing twice. */}
          {checkedChildren != null || unCheckedChildren != null ? (
            <span data-slot="switch-content" className="ui-switch-content" aria-hidden="true">
              {isChecked ? checkedChildren : unCheckedChildren}
            </span>
          ) : null}
          <span data-slot="switch-thumb" data-state={state} className="ui-switch-thumb">
            {loading ? (
              <Loader2
                data-slot="switch-spinner"
                className="ui-switch-spinner"
                aria-hidden="true"
              />
            ) : null}
          </span>
        </AriaSwitch>
      </>
    );
  },
);
Switch.displayName = "Switch";
