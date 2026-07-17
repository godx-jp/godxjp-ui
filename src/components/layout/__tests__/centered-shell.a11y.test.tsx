import { describe, it } from "vitest";

import { CenteredShell } from "../centered-shell";
import { Topbar } from "../topbar";
import { Button } from "../../general";
import { Avatar, AvatarFallback } from "../../data-display";
import { expectNoA11yViolations } from "@/test/a11y";

// CenteredShell is a layout shell — a11y lives in the landmark structure (banner/main/contentinfo)
// plus whatever the consumer composes into the topbar. This verifies a realistic hosted "My Page"
// composition (brand + user menu trigger in the bar, centred sections, a legal footer) is clean.
describe("CenteredShell a11y", () => {
  it("has no axe violations for a hosted My Page composition", async () => {
    await expectNoA11yViolations(
      <CenteredShell
        width="md"
        topbar={
          <Topbar
            start={
              <Avatar className="rounded-md">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  G
                </AvatarFallback>
              </Avatar>
            }
            end={
              <Button variant="ghost" size="sm">
                田中 太郎
              </Button>
            }
          />
        }
        footer={<span>© 2026 GodX</span>}
      >
        <h1>マイページ</h1>
        <p>アカウントの概要とサービス一覧。</p>
      </CenteredShell>,
    );
  });
});
