import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { useEffect, useState } from "react";
import { Combobox } from "../../components/data-entry/combobox";

const meta: Meta<typeof Combobox> = {
  title: "Data Entry/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Combobox>;

const employees = [
  { value: "tanaka-misaki", label: "田中 美咲" },
  { value: "sato-kenta", label: "佐藤 健太" },
  { value: "suzuki-rina", label: "鈴木 莉奈" },
  { value: "takahashi-haruto", label: "高橋 陽斗" },
  { value: "watanabe-yui", label: "渡辺 結衣" },
];

export const Default: Story = {
  name: "Default · options prop",
  render: function Default() {
    const [value, setValue] = useState("");
    return (
      <div style={{ width: 240 }}>
        <Combobox
          options={employees}
          triggerLabel="従業員を選択"
          placeholder="名前で検索"
          emptyLabel="該当する従業員がいません。"
          value={value}
          onValueChange={setValue}
        />
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;
    await step("trigger opens command surface", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /従業員を選択/ }));
      await waitFor(() => {
        expect(within(portal).getByPlaceholderText("名前で検索")).toBeInTheDocument();
      });
    });
  },
};

export const Empty: Story = {
  name: "Empty · no matching item",
  render: () => (
    <div style={{ width: 260 }}>
      <Combobox
        defaultOpen
        options={[]}
        triggerLabel="従業員を選択"
        placeholder="名前で検索"
        emptyLabel="該当する従業員がいません。"
      />
    </div>
  ),
};

export const Async: Story = {
  name: "Async · deferred load + loading row",
  render: function Async() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<typeof employees>([]);
    useEffect(() => {
      if (!open) return;
      setLoading(true);
      setItems([]);
      const timer = window.setTimeout(() => {
        setItems(employees);
        setLoading(false);
      }, 600);
      return () => window.clearTimeout(timer);
    }, [open]);
    return (
      <div style={{ width: 260 }}>
        <Combobox
          open={open}
          onOpenChange={setOpen}
          options={items}
          triggerLabel="従業員を読み込む"
          placeholder="名前で検索"
          emptyLabel="該当する従業員がいません。"
          loading={loading}
          loadingLabel="読み込み中…"
        />
      </div>
    );
  },
};
