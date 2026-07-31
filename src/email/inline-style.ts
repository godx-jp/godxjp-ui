/**
 * Inline-style serialisation for HTML email.
 *
 * Email clients do not run the cascade: Gmail strips `<style>`, Outlook resolves no custom
 * property, and only the `style=""` attribute on the painting element is universally honoured.
 * `emailInlineStyle` turns a declaration map into that attribute value AND enforces the two rules
 * that silently break templates — no `var()` (nothing resolves it) and no `calc()` (Outlook's Word
 * renderer drops the whole declaration). Failing loudly at template-build time beats a broken
 * layout discovered in Mailpit.
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
 * @throws if a value contains `var()` or `calc()` — neither survives an email client.
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
    parts.push(`${kebab(property)}:${serialised}`);
  }
  return parts.join(";");
}

/** `backgroundColor` → `background-color`; an already-kebab property passes through unchanged. */
function kebab(property: string): string {
  return property.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}
