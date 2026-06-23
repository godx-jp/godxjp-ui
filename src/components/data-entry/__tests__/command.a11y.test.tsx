import { describe, it } from "vitest";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../command";
import { expectNoA11yViolations } from "@/test/a11y";

// cmdk command palette rendered inline: a labelled search box (role="combobox")
// over a listbox of grouped options. Content is visible to axe by default.
describe("Command a11y", () => {
  it("has no axe violations (input + grouped items)", async () => {
    await expectNoA11yViolations(
      <Command label="コマンドパレット">
        <CommandInput placeholder="検索…" aria-label="コマンドを検索" />
        <CommandList>
          <CommandEmpty>該当なし</CommandEmpty>
          <CommandGroup heading="操作">
            <CommandItem value="new">新規作成</CommandItem>
            <CommandItem value="open">開く</CommandItem>
          </CommandGroup>
          <CommandGroup heading="設定">
            <CommandItem value="profile">プロフィール</CommandItem>
            <CommandItem value="logout" disabled>
              ログアウト
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
  });

  it("has no axe violations (flat item list, no groups)", async () => {
    await expectNoA11yViolations(
      <Command label="コマンドパレット">
        <CommandInput placeholder="検索…" aria-label="コマンドを検索" />
        <CommandList>
          <CommandEmpty>該当なし</CommandEmpty>
          <CommandItem value="new">新規作成</CommandItem>
          <CommandItem value="open">開く</CommandItem>
          <CommandItem value="archive">アーカイブ</CommandItem>
        </CommandList>
      </Command>,
    );
  });
});
