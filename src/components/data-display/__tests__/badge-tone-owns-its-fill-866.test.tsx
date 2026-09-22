import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { Badge } from "../badge";

/**
 * A status tone owns the whole chip, and no other fill may reach the element.
 *
 * gh#866 respelled the tone fill so a brand's own pale ground could reach it:
 *
 *     bg-success/10
 *     → [background-color:var(--surface-success, color-mix(in oklab, hsl(var(--success)) 10%, transparent))]
 *
 * What held the old spelling together was not the stylesheet but `cn` — tailwind-merge. The
 * `default` variant painted `bg-primary`, the tone added `bg-success/10`, twMerge saw ONE conflict
 * group and deleted the first. An ARBITRARY PROPERTY is a different group, so after gh#866 nothing
 * was deleted, both survived, and ordinary CSS source order handed the chip to `bg-primary`.
 *
 * Measured on `/isolate/data-display-badge` before the fix — every toned Badge, violet under
 * tone-coloured ink:
 *
 *     warning  bg rgb(122,0,255)  ink rgb(143,86,0)   1.07:1
 *     success  bg rgb(122,0,255)  ink rgb(9,103,59)   1.09:1
 *     error    bg rgb(122,0,255)  ink rgb(170,24,31)  1.14:1
 *     info     bg rgb(122,0,255)  ink rgb(29,72,165)  1.30:1
 *
 * After, reading the COMPOSITED pixel rather than the declared colour (the tint is 10% alpha, so
 * the declared value is not what anyone sees): 5.52 – 7.16:1, all clearing WCAG 2.2 AA.
 *
 * THE CLASSES WERE CORRECT BOTH TIMES. Only the cascade moved, which is why this test asserts the
 * absence of the competing utility rather than the presence of the right one: a snapshot of the
 * class list would have passed on the broken build, and jsdom resolves no custom property so a
 * computed-style test would have passed too.
 */

const STATUS_TONES = ["success", "warning", "destructive", "info"] as const;

function classesOf(label: string): string[] {
  return (screen.getByText(label).closest('[data-slot="badge"]')?.className ?? "").split(/\s+/);
}

describe("a status tone owns the Badge's fill (gh#866)", () => {
  for (const tone of STATUS_TONES) {
    it(`tone="${tone}" carries no competing background utility`, () => {
      renderWithUi(<Badge tone={tone}>{tone}</Badge>);
      const classes = classesOf(tone);
      // The one that actually broke it.
      expect(classes).not.toContain("bg-primary");
      // Any other opaque fill from a variant would do the same damage, so assert the shape and
      // not just the one instance: nothing may paint a plain `bg-<role>` beside the tone.
      expect(
        classes.filter((c) => /^bg-(primary|secondary|accent|muted|card|background)$/.test(c)),
      ).toEqual([]);
      // …and the tone's own fill IS there, so the assertions above cannot pass by painting nothing.
      expect(classes.some((c) => c.startsWith("[background-color:var(--surface-"))).toBe(true);
    });
  }

  it('tone="default" keeps the primary chip — the fix must not have emptied the ordinary badge', () => {
    renderWithUi(<Badge>plain</Badge>);
    expect(classesOf("plain")).toContain("bg-primary");
  });

  it("an explicit variant does not bring a fill back with it", () => {
    renderWithUi(
      <Badge variant="outline" tone="success">
        outlined
      </Badge>,
    );
    const classes = classesOf("outlined");
    expect(classes).not.toContain("bg-primary");
    // The tone's ink wins over `outline`'s `text-foreground`, and always did: twMerge puts both in
    // one group and keeps the later. Asserted here so the next reader does not "fix" it — this is
    // byte-for-byte the pre-gh#866 behaviour, checked against the old spelling.
    expect(classes).toContain("text-success-strong");
    expect(classes).not.toContain("text-foreground");
  });
});
