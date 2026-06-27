import { describe, it } from "vitest";
import { Search } from "lucide-react";

import { Topbar } from "../topbar";
import { Button, Logo } from "../../general";
import { expectNoA11yViolations } from "@/test/a11y";

// Topbar is a pure slot bar — a11y lives in whatever the consumer composes into the slots.
// This verifies a realistic composition (brand + search trigger + user menu trigger) is clean.
describe("Topbar a11y", () => {
  it("has no axe violations with a consumer-composed bar", async () => {
    await expectNoA11yViolations(
      <header>
        <Topbar
          start={<Logo label="CoreBooks" />}
          center={
            <Button variant="outline" size="sm">
              <Search aria-hidden="true" />
              検索
            </Button>
          }
          end={
            <Button variant="ghost" size="sm">
              田中 太郎
            </Button>
          }
        />
      </header>,
    );
  });
});
