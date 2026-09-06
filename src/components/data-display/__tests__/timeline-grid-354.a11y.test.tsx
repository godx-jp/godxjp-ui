import { describe, it } from "vitest";
import { expectNoA11yViolations } from "@/test/a11y";

import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { TimelineGrid } from "../timeline-grid";
import type { TimelineGridEventProp } from "../timeline-grid";

/**
 * The grid is rendered where it actually lives — inside a Card, under a heading, with an empty
 * column, a clipped block and the interactive (button) mode all present at once.
 *
 * Rendering the component bare would have been cheaper and nearly worthless: several axe rules
 * only have a precondition to test once the component sits under other content. Composed like
 * this, 22 rules actually run — among them list/listitem, button-name, nested-interactive,
 * aria-hidden-focus, duplicate-id-aria, heading-order and tabindex. Two grids are mounted so
 * duplicate-id-aria has something to compare: `useId` has to keep the `aria-labelledby` targets
 * unique between them.
 *
 * What this file does NOT prove, and where the sibling test takes over: a DANGLING
 * `aria-labelledby` lands in axe's `incomplete` bucket, not in `violations`, so
 * `expectNoA11yViolations` would sail past one. `timeline-grid-354.test.tsx` resolves every
 * `aria-labelledby` against the document itself, and asserts the tab stop that jsdom's zero
 * overflow keeps scrollable-region-focusable from ever reaching.
 */
const COLUMNS = [
  { id: "mon", label: "月 11" },
  { id: "tue", label: "火 12" },
  { id: "thu", label: "木 14", description: "渋谷店", current: true },
];

const EVENTS: TimelineGridEventProp[] = [
  { id: "a", columnId: "mon", start: "09:00", end: "17:30", title: "早番", description: "田中" },
  { id: "b", columnId: "thu", start: "09:00", end: "17:30", title: "早番", description: "佐藤" },
  { id: "c", columnId: "thu", start: "13:00", end: "22:00", title: "遅番", description: "高橋" },
  { id: "d", columnId: "thu", start: "22:00", end: "06:00", title: "夜勤", description: "伊藤" },
];

describe("TimelineGrid a11y", () => {
  it("has no axe violations in its read-only and interactive forms", async () => {
    await expectNoA11yViolations(
      <main>
        <Card>
          <CardHeader>
            <CardTitle level={2}>週</CardTitle>
          </CardHeader>
          <CardContent>
            <TimelineGrid
              label="週シフト 5月11日〜14日"
              columns={COLUMNS}
              events={EVENTS}
              start="06:00"
              end="22:00"
              interval={2}
              now="14:35"
            />
            <TimelineGrid
              label="週シフト（編集）"
              columns={COLUMNS}
              events={EVENTS}
              start="06:00"
              end="24:00"
              onEventSelect={() => {}}
            />
          </CardContent>
        </Card>
      </main>,
    );
  });
});
