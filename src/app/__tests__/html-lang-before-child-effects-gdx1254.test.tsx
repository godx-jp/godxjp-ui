import { render } from "@testing-library/react";
import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { AppProvider } from "../app-provider";

/**
 * `<html lang>` (and `dir`) are set before the screens' own effects run (GDX-1254). AppProvider
 * set them in a passive effect; a parent's passive effect runs AFTER its children's, so a screen
 * that fired its first request from an effect sent the page's stale `lang` (index.html's `en`) as
 * its locale.
 */
describe("AppProvider sets <html lang> before child effects (GDX-1254)", () => {
  beforeEach(() => {
    document.documentElement.lang = "en";
    document.documentElement.dir = "";
  });

  it("a child's first passive effect already sees the provider's locale", () => {
    const seen: string[] = [];
    function Screen() {
      React.useEffect(() => {
        seen.push(`${document.documentElement.lang}|${document.documentElement.dir}`);
      }, []);
      return null;
    }
    render(
      <AppProvider defaultLocale="ja">
        <Screen />
      </AppProvider>,
    );
    expect(seen).toEqual(["ja|ltr"]);
  });
});
