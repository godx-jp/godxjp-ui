import { describe, it } from "vitest";

import { CredentialReveal } from "../credential-reveal";
import { expectNoA11yViolations } from "@/test/a11y";

const SECRET = "gxp_live_8Fh2kQ9wR7nZ1xV4bT6mL0cD";

describe("CredentialReveal a11y", () => {
  it("has no axe violations (masked default, labelled)", async () => {
    await expectNoA11yViolations(<CredentialReveal label="APIキー" secret={SECRET} />);
  });

  it("has no axe violations (revealed, no label → generic accessible name)", async () => {
    await expectNoA11yViolations(<CredentialReveal secret={SECRET} defaultRevealed />);
  });

  it("has no axe violations (download + acknowledge + destructive tone)", async () => {
    await expectNoA11yViolations(
      <CredentialReveal
        label="デバイス資格情報"
        secret={SECRET}
        tone="destructive"
        downloadable
        onAcknowledge={() => {}}
      />,
    );
  });

  it("has no axe violations (banner suppressed, info tone, lg size)", async () => {
    await expectNoA11yViolations(
      <CredentialReveal
        label="Webhook secret"
        secret={SECRET}
        warning={null}
        tone="info"
        size="lg"
      />,
    );
  });
});
