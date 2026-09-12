import { Check, Minus, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type { FeatureStateProp } from "../../props/components/data-display.prop";

export type {
  FeatureItemProp,
  FeatureListProp,
  FeatureListProp as FeatureListProps,
  FeatureStateProp,
} from "../../props/components/data-display.prop";

import type { FeatureListProp } from "../../props/components/data-display.prop";

/**
 * The glyph per state, and the i18n key that says the same thing in words.
 *
 * ✓ / ✗ / − rather than three colours: WCAG 1.4.1 is satisfied by the SHAPE, and the `sr-only`
 * prefix says it a third way for anyone who sees neither.
 */
const STATE = {
  included: { Icon: Check, key: "dataDisplay.featureList.included" },
  excluded: { Icon: X, key: "dataDisplay.featureList.excluded" },
  limited: { Icon: Minus, key: "dataDisplay.featureList.limited" },
} as const satisfies Record<FeatureStateProp, { Icon: typeof Check; key: string }>;

/**
 * FeatureList — a list of STATEMENTS, each carrying a leading state glyph: what a plan includes,
 * what a tier supports, which requirements a submission met.
 *
 * ## Why it is not one of the three components it looks like
 *
 * - **`ListRow`** is a single-line ENTITY row — a session, a token, a passkey — with entity
 *   padding, a divider between every row and a trailing action slot. A feature line is none of
 *   those: it has no action, it is not a thing you can open, and reading a plan's contents
 *   through a stack of ruled rows makes six facts look like six records.
 * - **`Timeline`** has the glyph rail, but it is an ORDERED event list: a connector line runs
 *   dot-to-dot and the statuses are `done`/`current`/`pending`, which is time, not inclusion.
 * - **`Descriptions`** is a term/value grid. A feature line has no value column — the state IS
 *   the value, and it is drawn, not written.
 *
 * ## The alignment, which is the actual reason this exists
 *
 * The glyph column is one line box tall (`1lh`) and the glyph is centred in it, so it lands on
 * the FIRST line of a label that wraps to three. That is why the component can be handed a
 * one-word label and a paragraph and both come out aligned, at any font size and at any density,
 * with no number in the call site. The shape it replaces reached for `mt-0.5` — 2px, below
 * `--space-1`, off every scale, and wrong the moment the text beside it changes size.
 */
export function FeatureList({ items, className, ...props }: FeatureListProp) {
  const { t } = useTranslation();
  return (
    <ul className={cn("ui-feature-list", className)} {...props}>
      {/* Keyed by position: `label` is a ReactNode, and a feature list is read top to bottom
          rather than a collection that reorders. Same call as Legend's. */}
      {items.map((item, index) => {
        const { Icon, key } = STATE[item.state];
        return (
          <li key={index} className="ui-feature-list-item" data-state={item.state}>
            <span className="ui-feature-list-mark" aria-hidden="true">
              <Icon />
            </span>
            <span className="ui-feature-list-body">
              <span className="ui-feature-list-label">
                <span className="sr-only">{t(key)}</span>
                {item.label}
              </span>
              {item.description != null ? (
                <span className="ui-feature-list-description">{item.description}</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
