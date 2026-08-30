import { describe, it } from "vitest";

import { Activity } from "../activity";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Activity a11y", () => {
  it("has no axe violations for the default typing indicator", async () => {
    await expectNoA11yViolations(<Activity label="佐藤さんが入力しています…" />);
  });

  it("has no axe violations with a polite live region", async () => {
    await expectNoA11yViolations(<Activity announce="polite" label="Hưng đang nhập…" />);
  });

  it("has no axe violations for every mark, size and tone", async () => {
    await expectNoA11yViolations(
      <>
        <Activity variant="dots" size="xs" tone="muted" label="入力中…" />
        <Activity variant="pulse" size="sm" tone="destructive" label="録画中" />
        <Activity variant="bar" size="md" tone="info" label="同期中…" />
        <Activity variant="dots" size="lg" tone="success" label="接続済み" />
      </>,
    );
  });

  it("has no axe violations when children own the visible slot and label describes it", async () => {
    await expectNoA11yViolations(
      <Activity label="佐藤さんが入力しています…">
        <b>佐藤</b>
      </Activity>,
    );
  });

  it("has no axe violations for a bare decorative mark", async () => {
    await expectNoA11yViolations(<Activity variant="pulse" />);
  });
});
