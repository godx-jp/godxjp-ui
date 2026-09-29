import type * as React from "react";

/**
 * TRUE WHILE AN IME IS COMPOSING (gh#1054). Between `compositionstart` and `compositionend` a
 * Japanese / Chinese / Korean IME holds a CANDIDATE, and the Enter that confirms the conversion is
 * delivered as an ordinary `keydown` — acting on it creates a tag, submits a form or picks an option
 * from a half-typed reading. Every Enter (and Escape/Tab) handler in the kit asks this first.
 *
 * `isComposing` is the standards answer; `keyCode === 229` is the legacy one some browsers
 * (Safari after `compositionend`, older Chromium on Windows) still report instead. Accepts a React
 * synthetic event or a native `KeyboardEvent`.
 */
export function isImeComposing(event: React.KeyboardEvent | KeyboardEvent): boolean {
  const native = "nativeEvent" in event ? event.nativeEvent : event;
  return native.isComposing || native.keyCode === 229;
}
