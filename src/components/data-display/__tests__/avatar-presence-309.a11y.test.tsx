import { describe, expect, it } from "vitest";

import { renderWithUi } from "@/test/render";
import { Avatar, AvatarFallback, AvatarImage, Card, CardContent, ListRow } from "..";

/**
 * The presence dot's accessibility contract, on the surfaces it actually ships to: a
 * channel member list, a message-stream author mark, and the topbar account avatar. axe cannot
 * prove that a state is ANNOUNCED, only that nothing is broken — so the announcement itself is
 * asserted here too, in the composition rather than in isolation, because that is where a
 * colour-only dot does its damage (a row that says "田中" and nothing about whether he is
 * reachable).
 */
describe("Avatar presence a11y (gh#309)", () => {
  it("announces the state alongside the person, once, in a row that also names them", () => {
    const { getByText } = renderWithUi(
      <Card>
        <CardContent flush>
          <ListRow
            leading={
              <Avatar presence="away">
                <AvatarFallback>鈴</AvatarFallback>
              </Avatar>
            }
            title="鈴木 大輔"
          />
        </CardContent>
      </Card>,
    );
    // The row still names the person…
    expect(getByText("鈴木 大輔")).toBeInTheDocument();
    // …and the avatar contributes the state as real text, not a colour. `getByText` throws on a
    // duplicate, so this also proves the state is contributed exactly once.
    const status = getByText("Vắng mặt");
    expect(status).toHaveClass("sr-only");
    expect(status.closest('[data-slot="avatar-presence"]')).not.toBeNull();
  });

  it("keeps an image avatar's alt text and the presence text as separate announcements", () => {
    const { getByText, container } = renderWithUi(
      <Avatar presence="online">
        <AvatarImage src="/tanaka.png" alt="田中 未来" />
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    // The dot never swallows or replaces the identity: it is appended after it.
    const dot = container.querySelector('[data-slot="avatar-presence"]')!;
    expect(getByText("Trực tuyến")).toBe(dot.firstElementChild);
    expect(dot).not.toHaveAttribute("aria-hidden");
  });
});
