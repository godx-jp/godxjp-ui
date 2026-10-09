import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";

import { AppSettingPicker } from "../app-setting-picker";
import { renderWithUi, screen, userEvent } from "@/test/render";

/**
 * v32 #1223 — AppSettingToggle folds into `<AppSettingPicker menu={false}>`: the same setting, the
 * same binding, one tap instead of open-then-choose.
 *
 * PARITY FIRST. This file was written against the retired `AppSettingToggle` and compared the two
 * byte for byte for every kind × appearance (12 shapes) and a controlled/disabled one, and the
 * accessible names produced by the same four clicks. It was red until the picker learned
 * `menu={false}`, then green; only then was AppSettingToggle deleted. The snapshots and the walk
 * below are that proven output.
 */
const html = (ui: ReactElement) => renderWithUi(ui).container.innerHTML;
const kinds = ["theme", "density", "fontSize", "timeFormat"] as const;
const appearances = [undefined, "bar", "icon"] as const;

describe("AppSettingToggle → <AppSettingPicker menu={false}> parity (#1223)", () => {
  it("markup for every kind × appearance", () => {
    const out: Record<string, string> = {};
    for (const kind of kinds) {
      for (const appearance of appearances) {
        out[`${kind}/${appearance ?? "default"}`] = html(
          <AppSettingPicker menu={false} kind={kind} appearance={appearance} id="s" />,
        );
      }
    }
    out["controlled-disabled"] = html(
      <AppSettingPicker
        menu={false}
        kind="theme"
        value="dark"
        onValueChange={() => {}}
        disabled
        className="x"
      />,
    );
    expect(out).toMatchInlineSnapshot(`
      {
        "controlled-disabled": "<button data-slot="topbar-item" class="ui-topbar-item ui-focus-ring x" type="button" disabled="" data-kind="theme" aria-label="Giao diện: Tối"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon" aria-hidden="true"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"></path></svg></button>",
        "density/bar": "<button data-slot="topbar-item" class="ui-topbar-item ui-focus-ring" type="button" id="s" data-kind="density" aria-label="Mật độ: Mặc định"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rows3 lucide-rows-3" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M21 9H3"></path><path d="M21 15H3"></path></svg></button>",
        "density/default": "<button data-slot="topbar-item" class="ui-topbar-item ui-focus-ring" type="button" id="s" data-kind="density" aria-label="Mật độ: Mặc định"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rows3 lucide-rows-3" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M21 9H3"></path><path d="M21 15H3"></path></svg></button>",
        "density/icon": "<button data-slot="button" data-variant="ghost" data-size="icon" data-shape="default" type="button" class="aria-invalid:border-destructive [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 ui-button ui-button--ghost hover:bg-accent hover:text-accent-foreground ui-button--icon rounded-[var(--button-radius)]" id="s" data-kind="density" aria-label="Mật độ: Mặc định"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rows3 lucide-rows-3" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M21 9H3"></path><path d="M21 15H3"></path></svg></button>",
        "fontSize/bar": "<button data-slot="topbar-item" class="ui-topbar-item ui-focus-ring" type="button" id="s" data-kind="fontSize" aria-label="Cỡ chữ: Mặc định"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alarge-small lucide-a-large-small" aria-hidden="true"><path d="m15 16 2.536-7.328a1.02 1.02 1 0 1 1.928 0L22 16"></path><path d="M15.697 14h5.606"></path><path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16"></path><path d="M3.304 13h6.392"></path></svg></button>",
        "fontSize/default": "<button data-slot="topbar-item" class="ui-topbar-item ui-focus-ring" type="button" id="s" data-kind="fontSize" aria-label="Cỡ chữ: Mặc định"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alarge-small lucide-a-large-small" aria-hidden="true"><path d="m15 16 2.536-7.328a1.02 1.02 1 0 1 1.928 0L22 16"></path><path d="M15.697 14h5.606"></path><path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16"></path><path d="M3.304 13h6.392"></path></svg></button>",
        "fontSize/icon": "<button data-slot="button" data-variant="ghost" data-size="icon" data-shape="default" type="button" class="aria-invalid:border-destructive [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 ui-button ui-button--ghost hover:bg-accent hover:text-accent-foreground ui-button--icon rounded-[var(--button-radius)]" id="s" data-kind="fontSize" aria-label="Cỡ chữ: Mặc định"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alarge-small lucide-a-large-small" aria-hidden="true"><path d="m15 16 2.536-7.328a1.02 1.02 1 0 1 1.928 0L22 16"></path><path d="M15.697 14h5.606"></path><path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16"></path><path d="M3.304 13h6.392"></path></svg></button>",
        "theme/bar": "<button data-slot="topbar-item" class="ui-topbar-item ui-focus-ring" type="button" id="s" data-kind="theme" aria-label="Giao diện: Sáng"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg></button>",
        "theme/default": "<button data-slot="topbar-item" class="ui-topbar-item ui-focus-ring" type="button" id="s" data-kind="theme" aria-label="Giao diện: Sáng"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg></button>",
        "theme/icon": "<button data-slot="button" data-variant="ghost" data-size="icon" data-shape="default" type="button" class="aria-invalid:border-destructive [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 ui-button ui-button--ghost hover:bg-accent hover:text-accent-foreground ui-button--icon rounded-[var(--button-radius)]" id="s" data-kind="theme" aria-label="Giao diện: Sáng"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg></button>",
        "timeFormat/bar": "<button data-slot="topbar-item" class="ui-topbar-item ui-focus-ring" type="button" id="s" data-kind="timeFormat" aria-label="Định dạng giờ: 24 giờ"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><span>24h</span></button>",
        "timeFormat/default": "<button data-slot="topbar-item" class="ui-topbar-item ui-focus-ring" type="button" id="s" data-kind="timeFormat" aria-label="Định dạng giờ: 24 giờ"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><span>24h</span></button>",
        "timeFormat/icon": "<button data-slot="button" data-variant="ghost" data-size="sm" data-shape="default" type="button" class="aria-invalid:border-destructive [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 ui-button ui-button--ghost hover:bg-accent hover:text-accent-foreground ui-button--sm rounded-[var(--button-radius)]" id="s" data-kind="timeFormat" aria-label="Định dạng giờ: 24 giờ"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><span>24h</span></button>",
      }
    `);
  });

  it("four taps walk the density cycle and name each value (context-bound)", async () => {
    renderWithUi(<AppSettingPicker menu={false} kind="density" />);
    const user = userEvent.setup();
    const names: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      await user.click(screen.getByRole("button"));
      names.push(screen.getByRole("button").getAttribute("aria-label") ?? "");
    }
    expect(names).toMatchInlineSnapshot(`
      [
        "Mật độ: Thoáng",
        "Mật độ: Gọn",
        "Mật độ: Mặc định",
        "Mật độ: Thoáng",
      ]
    `);
  });
});
