import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Heart } from "lucide-react";
import { Rate } from "../../components/data-entry/Rate";
import { Flex } from "../../components/layout";

/**
 * data-entry/Rate — star-rating primitive.
 *
 * Vocabulary per cardinal rule 23 §B:
 *   `value` / `defaultValue` / `onValueChange` (Radix-style)
 *   `size` ("small" | "default" | "large")
 *   `disabled`, `readOnly` (matches Input)
 *   `count`, `allowHalf`, `icon` slot (NEVER Ant's `character`)
 */

const meta: Meta<typeof Rate> = {
  title: "Data Entry/Rate",
  component: Rate,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Rate>;

export const Default: Story = {
  render: () => <Rate defaultValue={3} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("rate renders as radiogroup with 5 stars", async () => {
      const group = canvas.getByRole("radiogroup");
      await expect(group).toBeInTheDocument();
      const stars = canvas.getAllByRole("radio");
      await expect(stars.length).toBe(5);
    });

    await step("clicking the 5th star selects it", async () => {
      const stars = canvas.getAllByRole("radio");
      await userEvent.click(stars[4]);
      await waitFor(() => {
        expect(stars[4]).toHaveAttribute("aria-checked", "true");
      });
    });
  },
};

export const AllowHalf: Story = {
  render: () => <Rate defaultValue={3.5} allowHalf />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("rate renders 5 radio stars", async () => {
      const stars = canvas.getAllByRole("radio");
      await expect(stars.length).toBe(5);
    });

    await step("clicking a star commits its value", async () => {
      const stars = canvas.getAllByRole("radio");
      await userEvent.click(stars[1]);
      await waitFor(() => {
        expect(stars[1]).toHaveAttribute("aria-checked", "true");
      });
    });
  },
};

export const Sizes: Story = {
  render: () => (
    <Flex vertical gap="small" style={{ alignItems: "flex-start" }}>
      <Rate size="small" defaultValue={4} />
      <Rate size="default" defaultValue={4} />
      <Rate size="large" defaultValue={4} />
    </Flex>
  ),
};

export const ReadOnly: Story = {
  name: "ReadOnly (product rating 4.5/5)",
  render: () => (
    <Flex gap="small" style={{ alignItems: "center" }}>
      <Rate value={4.5} allowHalf readOnly />
      <span
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--muted-foreground)",
        }}
      >
        4.5 / 5
      </span>
    </Flex>
  ),
};

export const Disabled: Story = {
  render: () => <Rate defaultValue={3} disabled />,
};

export const CustomIcon: Story = {
  render: () => (
    <div style={{ color: "var(--destructive)" }}>
      <Rate
        defaultValue={4}
        icon={<Heart fill="currentColor" strokeWidth={1.5} aria-hidden />}
      />
    </div>
  ),
};
