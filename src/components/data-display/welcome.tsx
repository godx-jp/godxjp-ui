import * as React from "react";

import { cn } from "../../lib/utils";
import { Heading, Text } from "../general/typography";

import type { WelcomeProp } from "../../props/components/data-display.prop";

export type {
  WelcomeProp,
  WelcomeProp as WelcomeProps,
  WelcomeVariantProp,
} from "../../props/components/data-display.prop";

/** Ant X treats a `string` icon that begins with `http` as an image URL, not as text. */
function isImageUrl(icon: React.ReactNode): icon is string {
  return typeof icon === "string" && icon.startsWith("http");
}

/**
 * Welcome — the greeting block at the head of an empty conversation (Ant Design X `Welcome`).
 *
 * ## Why this is a component and not four lines of composition
 *
 * It is close to the line, and the honest answer is that the SHAPE is the value: an assistant's
 * first screen is the same object in every product — glyph, greeting, one line under it, one
 * trailing action — and Ant X named it, so every consumer that builds a chat now expects the name.
 * What it owns beyond a `Flex` is the `extra` slot's placement (on the TITLE row, not below the
 * description, which is where a hand-roll puts it) and the `icon`-as-URL rule below.
 *
 * ## Two deliberate differences from Ant X, both in the same direction
 *
 * - **The image icon is decorative.** Ant renders `alt="icon"` — a screen reader then reads the
 *   word "icon" beside a title the glyph is only decorating. Here it is `alt=""`, which is what an
 *   image that duplicates adjacent text is supposed to be.
 * - **The heading level is Ant's.** Ant hardcodes `Typography.Title level={4}`, so this renders an
 *   `<h4>`. Hardcoding a level is a document-structure decision a component should not normally
 *   make, but the alternative — inventing a `level` prop Ant does not have — is a second spelling
 *   of an axis the issue asked to port verbatim. Wrap it in your own heading hierarchy if the page
 *   needs a different rung.
 */
export const Welcome = React.forwardRef<HTMLDivElement, WelcomeProp>(
  ({ icon, title, description, extra, variant = "filled", id, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        id={id}
        data-slot="welcome"
        data-variant={variant}
        className={cn("ui-welcome", className)}
        {...rest}
      >
        {icon ? (
          <div data-slot="welcome-icon" className="ui-welcome-icon" aria-hidden="true">
            {isImageUrl(icon) ? <img src={icon} alt="" /> : icon}
          </div>
        ) : null}

        <div data-slot="welcome-content" className="ui-welcome-content">
          {title || extra ? (
            <div data-slot="welcome-title-row" className="ui-welcome-title-row">
              {title ? (
                <Heading level={4} className="ui-welcome-title">
                  {title}
                </Heading>
              ) : null}
              {extra ? (
                <div data-slot="welcome-extra" className="ui-welcome-extra">
                  {extra}
                </div>
              ) : null}
            </div>
          ) : null}

          {description ? (
            <Text size="sm" tone="muted" className="ui-welcome-description">
              {description}
            </Text>
          ) : null}
        </div>
      </div>
    );
  },
);
Welcome.displayName = "Welcome";
