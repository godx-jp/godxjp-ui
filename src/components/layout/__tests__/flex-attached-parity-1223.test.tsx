import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { renderWithUi } from "@/test/render";
import { Flex } from "../flex";

/**
 * v32 #1223 — SpaceCompact folds into `<Flex attached>`: the joined-seam row is a Flex axis.
 *
 * PARITY FIRST. This file was written against the retired `SpaceCompact` and compared every shape
 * below byte for byte (`orientation`/`vertical` → `direction`, `fullWidth`, `density`, the
 * role="group" promotion). It was red until Flex learned `attached`, then green; only then was
 * SpaceCompact deleted. The snapshots are that proven output.
 */
const html = (ui: ReactElement) => renderWithUi(ui).container.innerHTML;
const kids = [<input key="a" aria-label="a" />, <button key="b">b</button>];

describe("SpaceCompact → <Flex attached> parity (#1223)", () => {
  it("every SpaceCompact shape", () => {
    const shapes = {
      row: <Flex attached>{kids}</Flex>,
      col: (
        <Flex attached direction="col">
          {kids}
        </Flex>
      ),
      fullWidthDensity: (
        <Flex attached fullWidth density="compact" className="x" id="row">
          {kids}
        </Flex>
      ),
      named: (
        <Flex attached aria-label="Amount" aria-invalid aria-errormessage="e" aria-describedby="d">
          {kids}
        </Flex>
      ),
    };
    expect(Object.fromEntries(Object.entries(shapes).map(([k, ui]) => [k, html(ui)])))
      .toMatchInlineSnapshot(`
      {
        "col": "<div data-slot="space-compact" data-orientation="vertical" class="ui-space-compact"><div data-slot="space-compact-item"><input aria-label="a"></div><div data-slot="space-compact-item"><button>b</button></div></div>",
        "fullWidthDensity": "<div data-slot="space-compact" data-orientation="horizontal" data-full-width="true" class="ui-space-compact ui-density-compact x" id="row"><div data-slot="space-compact-item"><input aria-label="a"></div><div data-slot="space-compact-item"><button>b</button></div></div>",
        "named": "<div data-slot="space-compact" data-orientation="horizontal" class="ui-space-compact" aria-label="Amount" aria-describedby="d e" role="group"><div data-slot="space-compact-item"><input aria-label="a"></div><div data-slot="space-compact-item"><button>b</button></div></div>",
        "row": "<div data-slot="space-compact" data-orientation="horizontal" class="ui-space-compact"><div data-slot="space-compact-item"><input aria-label="a"></div><div data-slot="space-compact-item"><button>b</button></div></div>",
      }
    `);
  });

  it("gap and the other layout knobs never reach the joined row (a seam has no gap)", () => {
    expect(
      html(
        <Flex attached gap="lg" wrap align="center" pad={4}>
          {kids}
        </Flex>,
      ),
    ).toBe(html(<Flex attached>{kids}</Flex>));
  });

  it("without attached, Flex is the plain layout row", () => {
    expect(html(<Flex>{kids}</Flex>)).toContain('class="ui-flex');
  });
});
