import { Search, X } from "lucide-react";
import { forwardRef, useCallback, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
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
 *   - Default `searchMode="submit"` fires `onSearch` only from the
 *     search button or Enter key. Use `searchMode="change"` for local
 *     in-memory filtering only.
 *   - When `value` is non-empty and `allowClear` is true (default),
 *     hides the custom suffix and renders a trailing `<X>` clear button that fires
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
  /** Search execution mode. Default `submit` avoids request-per-keypress. */
  searchMode?: "submit" | "change";
  /** Fired when search should execute. */
  onSearch?: (value: string) => void;
  /** Custom leading icon — defaults to lucide `Search`. */
  searchIcon?: React.ReactNode;
}

export const InputSearch = forwardRef<HTMLInputElement, InputSearchProps>(
  function InputSearch(
    {
      allowClear = true,
      onClear,
      onChange,
      onKeyDown,
      onSearch,
      searchMode = "submit",
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
        if (searchMode === "change") onSearch?.(e.target.value);
      },
      [controlledValue, onChange, onSearch, searchMode],
    );

    const submitSearch = useCallback(() => {
      onSearch?.(value);
    }, [onSearch, value]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(e);
        if (e.defaultPrevented || e.key !== "Enter" || e.nativeEvent.isComposing) return;
        submitSearch();
      },
      [onKeyDown, submitSearch],
    );

    const handleClear = useCallback(() => {
      if (controlledValue === undefined) setInternal("");
      onClear?.();
      onSearch?.("");
      // Synthesize a change event so consumer state stays in sync even
      // when `onChange` was passed but `onClear` was not.
      if (!onClear && onChange) {
        const synthetic = {
          target: { value: "" } as unknown as HTMLInputElement,
          currentTarget: { value: "" } as unknown as HTMLInputElement,
        } as unknown as ChangeEvent<HTMLInputElement>;
        onChange(synthetic);
      }
    }, [controlledValue, onChange, onClear, onSearch]);

    const searchButton = (
      <button
        type="button"
        className="input-search-button"
        onClick={submitSearch}
        aria-label="Search"
        tabIndex={-1}
      >
        {searchIcon ?? <Search size={14} />}
      </button>
    );

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
    const hintSuffix = value.length > 0 ? undefined : suffix;
    const suffixContent =
      clearButton !== undefined || hintSuffix !== undefined ? (
        <>
          {clearButton}
          {hintSuffix}
        </>
      ) : undefined;

    // Pick controlled OR uncontrolled — passing both `value` and
    // `defaultValue` to the inner <input> (even when one is undefined)
    // trips React's "controlled ↔ uncontrolled" warning.
    const valueProp =
      controlledValue !== undefined
        ? { value: controlledValue }
        : { defaultValue }
    return (
      <Input
        ref={ref}
        type="search"
        {...valueProp}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        prefix={searchButton}
        suffix={suffixContent}
        {...rest}
      />
    );
  },
);
