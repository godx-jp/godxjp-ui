/**
 * Inline-style serialisation for HTML email. Email clients do not run the cascade: Gmail strips
 * `<style>`, Outlook resolves no custom property, and only the `style=""` attribute on the
 * painting element is universally honoured.
 */

/** A declaration map. Numbers are emitted verbatim (already-unitless values like `font-weight`). */
export type EmailStyleDeclarations = Record<string, string | number | null | undefined>;

const UNRESOLVABLE = /\bvar\(|\bcalc\(/;

/**
 * Serialise declarations into an inline `style` attribute value.
 *
 * ```ts
 * emailInlineStyle({ width: EMAIL_SHELL.width, backgroundColor: EMAIL_COLORS.surface })
 * // "width:480px;background-color:#fdfdfb"
 * ```
 *
 * `null` / `undefined` values are dropped, so a conditional declaration needs no branch.
 *
 * @throws if a value contains `var()` or `calc()` (neither survives an email client) or a double
 *   quote (it terminates the `style="…"` attribute).
 */
export function emailInlineStyle(declarations: EmailStyleDeclarations): string {
  const parts: string[] = [];
  for (const [property, value] of Object.entries(declarations)) {
    if (value === null || value === undefined || value === "") continue;
    const serialised = String(value);
    if (UNRESOLVABLE.test(serialised)) {
      throw new TypeError(
        `emailInlineStyle: "${property}: ${serialised}" uses var()/calc(), which no email client ` +
          `resolves. Pass the literal value from the @godxjp/ui/email token export instead.`,
      );
    }
    if (serialised.includes('"')) {
      throw new TypeError(
        `emailInlineStyle: "${property}: ${serialised}" contains a double quote, which terminates ` +
          `the style="…" attribute it is written into. Use single quotes — a quoted font family ` +
          `from EMAIL_TYPOGRAPHY already ships that way.`,
      );
    }
    parts.push(`${kebab(property)}:${serialised}`);
  }
  return parts.join(";");
}

/** `backgroundColor` → `background-color`; an already-kebab property passes through unchanged. */
function kebab(property: string): string {
  return property.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}
