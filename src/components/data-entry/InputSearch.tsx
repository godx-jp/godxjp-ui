import { Search, X } from "lucide-react";
import { forwardRef, useCallback, useState } from "react";
import type { ChangeEvent } from "react";
import { Input, type InputProps } from "./Input";

/**
 * InputSearch — Input subtype with leading magnifier + optional clear-X.
 *
 * Mirrors the canonical search pattern used in `K:comp-pageheader.html`
 * and `K:comp-topbar.html`. Wraps `<Input>` so every base prop
 * pass-through works (`size`, `status`, etc.).
 *
 * Behaviour:
 *   - Renders a leading `<Search>` icon as the `prefix` slot.
 *   - When `value` is non-empty and `allowClear` is true (default),
 *     renders a trailing `<X>` clear button that fires
 *     `onChange({ target: { value: "" } })` and `onClear()`.
 *
 * Controlled-or-uncontrolled. Sets `type="search"` for native semantics
 * (mobile keyboards, `<form>` reset behaviour).
 *
 * @example
 *   <InputSearch placeholder="従業員を検索" />
 *
 * @example controlled
 *   <InputSearch
 *     value={query}
 *     onChange={(e) => setQuery(e.target.value)}
 *     onClear={() => setQuery("")}
 *   />
 */

export interface InputSearchProps extends Omit<InputProps, "type" | "prefix"> {
  /** Show the trailing X clear button when value is non-empty. Default `true`. */
  allowClear?: boolean;
  /** Fired when the user clicks the clear button. */
  onClear?: () => void;
  /** Custom leading icon — defaults to lucide `Search`. */
  searchIcon?: React.ReactNode;
}

export const InputSearch = forwardRef<HTMLInputElement, InputSearchProps>(
  function InputSearch(
    {
      allowClear = true,
      onClear,
      onChange,
      value: controlledValue,
      defaultValue,
      searchIcon,
      suffix,
      ...rest
    },
    ref,
  ) {
    const [internal, setInternal] = useState<string>(
      typeof defaultValue === "string" ? defaultValue : "",
    );
    const value =
      controlledValue !== undefined ? String(controlledValue) : internal;

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        if (controlledValue === undefined) setInternal(e.target.value);
        onChange?.(e);
      },
      [controlledValue, onChange],
    );

    const handleClear = useCallback(() => {
      if (controlledValue === undefined) setInternal("");
      onClear?.();
      // Synthesize a change event so consumer state stays in sync even
      // when `onChange` was passed but `onClear` was not.
      if (!onClear && onChange) {
        const synthetic = {
          target: { value: "" } as unknown as HTMLInputElement,
          currentTarget: { value: "" } as unknown as HTMLInputElement,
        } as unknown as ChangeEvent<HTMLInputElement>;
        onChange(synthetic);
      }
    }, [controlledValue, onChange, onClear]);

    const clearButton =
      allowClear && value.length > 0 ? (
        <button
          type="button"
          className="input-pass-toggle"
          onClick={handleClear}
          aria-label="Clear search"
          tabIndex={-1}
        >
          <X size={14} />
        </button>
      ) : undefined;

    return (
      <Input
        ref={ref}
        type="search"
        value={controlledValue}
        defaultValue={controlledValue === undefined ? defaultValue : undefined}
        onChange={handleChange}
        prefix={searchIcon ?? <Search size={14} />}
        suffix={suffix ?? clearButton}
        {...rest}
      />
    );
  },
);
