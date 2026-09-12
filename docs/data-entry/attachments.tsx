import { useState } from "react";

import { Attachments, type AttachmentsItemProp } from "@godxjp/ui/data-entry";
import { Text } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
} from "@godxjp/ui/layout";
import { Bot, MessageSquare, Paperclip, Settings, Users } from "lucide-react";

/**
 * Attachments — the file collection that rides a chat surface (Ant Design X `Attachments`).
 *
 * Last of the #559 series. Every slot on this page is one Ant X axis at rest: the empty
 * placeholder, a settled list, the three `overflow` modes, an upload in flight, a failed upload,
 * and the disabled strip.
 *
 * The field names are antd's (`uid`, `name`, `size`, `status`, `percent`, `thumbUrl`,
 * `originFileObj`) so an Ant X call site compiles here unchanged.
 *
 * Composed only from real @godxjp/ui components.
 */
const sections: SidebarSectionProp[] = [
  {
    label: "アシスタント",
    items: [
      { id: "chat", label: "チャット", icon: MessageSquare },
      { id: "agents", label: "エージェント", icon: Bot },
      { id: "members", label: "メンバー", icon: Users },
    ],
  },
  { label: "管理", items: [{ id: "settings", label: "設定", icon: Settings }] },
];

const settled: AttachmentsItemProp[] = [
  { uid: "1", name: "請求書_2026-03.pdf", size: 182_400, status: "done" },
  { uid: "2", name: "経費明細.xlsx", size: 44_120, status: "done" },
];

const inFlight: AttachmentsItemProp[] = [
  { uid: "3", name: "会議録画.mp4", size: 78_300_000, status: "uploading", percent: 42 },
];

const failed: AttachmentsItemProp[] = [
  { uid: "4", name: "契約書_原本.pdf", size: 2_400_000, status: "error" },
];

const many: AttachmentsItemProp[] = Array.from({ length: 6 }, (_, i) => ({
  uid: `m${i}`,
  name: `添付_${i + 1}.pdf`,
  size: 12_000 * (i + 1),
  status: "done" as const,
}));

export default function AttachmentsDoc() {
  const [items, setItems] = useState<AttachmentsItemProp[]>(settled);

  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId="chat"
          sections={sections}
          onSelect={() => {}}
          product={{ name: "CoreDesk", role: "アシスタント", color: "hsl(var(--primary))" }}
        />
      }
      topbar={<Topbar />}
    >
      <PageContainer
        title="添付ファイル"
        subtitle="Attachments · チャットに載せるファイルの束（Ant Design X）"
      >
        {/* EMPTY. The placeholder is the whole control when there is nothing yet: one button,
            one accessible name, and a drop target that is the same box. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            空のとき · placeholder
          </Text>
          <Attachments items={[]} />
        </Flex>

        {/* THE CONTROLLED LIST. `onChange` carries antd's `{ file, fileList }`, so the removed
            row arrives as `file` with status "removed" and `fileList` is what remains. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            items · onChange · onRemove
          </Text>
          <Attachments
            items={items}
            onRemove={() => true}
            onChange={({ fileList }) => setItems(fileList)}
          />
          <Text size="xs" tone="muted">
            残り {items.length} 件。× を押すと `onChange` が `{"{ file, fileList }"}` で届く。
          </Text>
        </Flex>

        {/* STATUS. Uploading carries a determinate Progress; error states the failure in words,
            not only in tint. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            status · uploading と error
          </Text>
          <Attachments items={inFlight} />
          <Attachments items={failed} />
        </Flex>

        {/* OVERFLOW. Three modes, same six items — what happens when the row runs out of box. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            overflow · wrap
          </Text>
          <Attachments items={many} overflow="wrap" />
        </Flex>

        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            overflow · scrollX
          </Text>
          <Attachments items={many} overflow="scrollX" />
        </Flex>

        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            overflow · scrollY
          </Text>
          <Attachments items={many} overflow="scrollY" />
        </Flex>

        {/* PLACEHOLDER, OVERRIDDEN. An object, or a function of "inline" | "drop". */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            placeholder · 自分の文言
          </Text>
          <Attachments
            items={[]}
            placeholder={{
              icon: <Paperclip />,
              title: "証憑を添付",
              description: "領収書・請求書・契約書。PDF と画像に対応します。",
            }}
          />
        </Flex>

        {/* DISABLED. The strip stays readable; nothing in it is reachable. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            disabled
          </Text>
          <Attachments items={settled} disabled />
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
