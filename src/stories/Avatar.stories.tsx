import type { Meta, StoryObj } from "@storybook/react";
import { User, UserRound, Cpu, Sparkles } from "lucide-react";
import { Avatar } from "../components/primitives/Avatar";
import { Row, Col, Flex, Space } from "../components/primitives/layout";

/**
 * Avatar — Ant-Design-shaped portrait primitive.
 *
 * Renders either an image (`src` wins), an icon slot, or initials/children.
 * Owns three independent visual axes:
 *
 * - **shape** — `circle` (default) | `square` (rounded-md).
 * - **size**  — token (`xs` / `sm` / `default` / `lg` / `xl`) or any pixel number.
 * - **color** — CSS color string used as the background hue for initials avatars;
 *   `textColor` overrides the foreground. `variant="brand"` is a legacy alias
 *   that pins color to `var(--brand)` + textColor to `var(--primary-foreground)`.
 *
 * Where it fits: every header bar (signed-in user), team lists, comment
 * threads, mention chips, member popovers, kanban-card assignees.
 */
const meta: Meta<typeof Avatar> = {
  title: "Primitives/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Ant-Design-shaped Avatar. Shape + size + image/icon/initials + " +
          "color tinting. Pairs naturally with Badge (corner indicator), " +
          "Tag (role chip beside name), and Space/Flex (avatar stacks).",
      },
    },
  },
  argTypes: {
    shape: {
      control: { type: "inline-radio" },
      options: ["circle", "square"],
      description: "Circle (default) or rounded-square.",
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "default", "lg", "xl", 56, 64, 96],
      description: "Token name or pixel number.",
    },
    variant: {
      control: { type: "inline-radio" },
      options: ["default", "brand"],
      description: "`brand` pins color to var(--brand).",
    },
    color: {
      control: { type: "color" },
      description: "Background tint for initials avatars (any CSS color).",
    },
    textColor: {
      control: { type: "color" },
      description: "Foreground override.",
    },
    src: { control: { type: "text" } },
    alt: { control: { type: "text" } },
    children: { control: { type: "text" } },
  },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

/** Live Controls playground — twiddle every prop. */
export const Playground: Story = {
  args: {
    shape: "circle",
    size: "default",
    children: "SF",
  },
};

// ---------------------------------------------------------------------------
// Shape × size matrix
// ---------------------------------------------------------------------------

export const Shapes: Story = {
  render: () => (
    <Space size="middle" align="center">
      <Avatar shape="circle">YT</Avatar>
      <Avatar shape="square">YT</Avatar>
    </Space>
  ),
};

export const SizesTokens: Story = {
  name: "Sizes — token scale",
  render: () => (
    <Space size="middle" align="center">
      <Avatar size="xs">XS</Avatar>
      <Avatar size="sm">SM</Avatar>
      <Avatar size="default">DF</Avatar>
      <Avatar size="lg">LG</Avatar>
      <Avatar size="xl">XL</Avatar>
    </Space>
  ),
};

export const SizesNumeric: Story = {
  name: "Sizes — numeric (pixels)",
  render: () => (
    <Space size="middle" align="center">
      <Avatar size={20}>20</Avatar>
      <Avatar size={32}>32</Avatar>
      <Avatar size={48}>48</Avatar>
      <Avatar size={64}>64</Avatar>
      <Avatar size={96}>96</Avatar>
    </Space>
  ),
};

// ---------------------------------------------------------------------------
// Content kinds — image, icon, initials
// ---------------------------------------------------------------------------

export const WithImage: Story = {
  args: {
    src: "https://i.pravatar.cc/96?img=12",
    alt: "Yuki Tanaka",
    size: "lg",
  },
};

export const WithInitials: Story = {
  render: () => (
    <Space size="middle">
      <Avatar color="oklch(58% 0.16 250)" textColor="white">YT</Avatar>
      <Avatar color="oklch(60% 0.15 150)" textColor="white">AS</Avatar>
      <Avatar color="oklch(58% 0.18 25)" textColor="white">KM</Avatar>
      <Avatar color="oklch(62% 0.14 80)" textColor="white">RH</Avatar>
    </Space>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Space size="middle" align="center">
      <Avatar icon={<User size={14} />} size="sm" />
      <Avatar icon={<UserRound size={16} />} />
      <Avatar icon={<UserRound size={20} />} size="lg" />
      <Avatar icon={<Cpu size={20} />} size="lg" color="oklch(58% 0.18 270)" textColor="white" />
      <Avatar icon={<Sparkles size={24} />} size="xl" variant="brand" />
    </Space>
  ),
};

// ---------------------------------------------------------------------------
// Color presets + variant
// ---------------------------------------------------------------------------

export const ColorPresets: Story = {
  render: () => (
    <Space size="middle">
      <Avatar color="oklch(58% 0.16 250)" textColor="white">B</Avatar>
      <Avatar color="oklch(60% 0.15 150)" textColor="white">G</Avatar>
      <Avatar color="oklch(58% 0.18 25)" textColor="white">R</Avatar>
      <Avatar color="oklch(62% 0.14 80)" textColor="white">A</Avatar>
      <Avatar color="oklch(60% 0.18 320)" textColor="white">P</Avatar>
    </Space>
  ),
};

export const CustomCssColor: Story = {
  args: {
    color: "#0ea5e9",
    textColor: "#ffffff",
    size: "lg",
    children: "GD",
  },
};

export const VariantBrand: Story = {
  args: { variant: "brand", children: "G", size: "lg" },
};

export const VariantSolidVsOutline: Story = {
  name: "Variant — default vs brand",
  render: () => (
    <Space size="middle" align="center">
      <Avatar size="lg">DF</Avatar>
      <Avatar variant="brand" size="lg">BR</Avatar>
    </Space>
  ),
};

// ---------------------------------------------------------------------------
// Group composition — overlapping stack
// ---------------------------------------------------------------------------

const stack: { name: string; color: string }[] = [
  { name: "YT", color: "oklch(58% 0.16 250)" },
  { name: "AS", color: "oklch(60% 0.15 150)" },
  { name: "KM", color: "oklch(58% 0.18 25)" },
  { name: "RH", color: "oklch(62% 0.14 80)" },
  { name: "+3", color: "oklch(70% 0.02 250)" },
];

export const Group: Story = {
  name: "Group — overlapping stack",
  render: () => (
    <Flex gap={0} align="center">
      {stack.map((s, i) => (
        <Avatar
          key={s.name}
          size="default"
          color={s.color}
          textColor="white"
          style={{
            marginLeft: i === 0 ? 0 : -8,
            border: "2px solid var(--background)",
          }}
        >
          {s.name}
        </Avatar>
      ))}
    </Flex>
  ),
};

// ---------------------------------------------------------------------------
// Realistic composition — team list
// ---------------------------------------------------------------------------

const team: { name: string; role: string; src?: string; initials?: string; color?: string }[] = [
  { name: "Yuki Tanaka",   role: "プラットフォームエンジニア", src: "https://i.pravatar.cc/96?img=12" },
  { name: "Aiko Sato",     role: "プロダクトデザイナー",       initials: "AS", color: "oklch(60% 0.15 150)" },
  { name: "Kenji Mori",    role: "テックリード",               src: "https://i.pravatar.cc/96?img=33" },
  { name: "Riko Hayashi",  role: "QAエンジニア",               initials: "RH", color: "oklch(58% 0.18 25)" },
  { name: "Daniel Ortega", role: "SRE",                         initials: "DO", color: "oklch(58% 0.16 250)" },
];

export const TeamList: Story = {
  name: "Composition — Team list",
  render: () => (
    <Flex vertical gap="small" style={{ width: 320 }}>
      {team.map((m) => (
        <Flex key={m.name} gap="small" align="center">
          {m.src ? (
            <Avatar src={m.src} alt={m.name} size="lg" />
          ) : (
            <Avatar size="lg" color={m.color} textColor="white">
              {m.initials}
            </Avatar>
          )}
          <Flex vertical gap={0}>
            <span style={{ fontWeight: 500 }}>{m.name}</span>
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{m.role}</span>
          </Flex>
        </Flex>
      ))}
    </Flex>
  ),
};

// ---------------------------------------------------------------------------
// Full variant matrix
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: "Showcase — every variant",
  render: () => (
    <Flex vertical gap="large">
      <Row gutter={[16, 16]} align="middle">
        <Col span={4}><strong>circle</strong></Col>
        <Col span={20}>
          <Space size="middle" align="center">
            <Avatar size="xs">XS</Avatar>
            <Avatar size="sm">SM</Avatar>
            <Avatar size="default">DF</Avatar>
            <Avatar size="lg">LG</Avatar>
            <Avatar size="xl">XL</Avatar>
            <Avatar size={64}>64</Avatar>
          </Space>
        </Col>
      </Row>
      <Row gutter={[16, 16]} align="middle">
        <Col span={4}><strong>square</strong></Col>
        <Col span={20}>
          <Space size="middle" align="center">
            <Avatar shape="square" size="xs">XS</Avatar>
            <Avatar shape="square" size="sm">SM</Avatar>
            <Avatar shape="square" size="default">DF</Avatar>
            <Avatar shape="square" size="lg">LG</Avatar>
            <Avatar shape="square" size="xl">XL</Avatar>
            <Avatar shape="square" size={64}>64</Avatar>
          </Space>
        </Col>
      </Row>
      <Row gutter={[16, 16]} align="middle">
        <Col span={4}><strong>icon</strong></Col>
        <Col span={20}>
          <Space size="middle" align="center">
            <Avatar icon={<User size={12} />} size="xs" />
            <Avatar icon={<User size={14} />} size="sm" />
            <Avatar icon={<UserRound size={16} />} />
            <Avatar icon={<UserRound size={20} />} size="lg" />
            <Avatar icon={<UserRound size={24} />} size="xl" />
          </Space>
        </Col>
      </Row>
      <Row gutter={[16, 16]} align="middle">
        <Col span={4}><strong>image</strong></Col>
        <Col span={20}>
          <Space size="middle" align="center">
            <Avatar src="https://i.pravatar.cc/96?img=12" alt="" size="xs" />
            <Avatar src="https://i.pravatar.cc/96?img=12" alt="" size="sm" />
            <Avatar src="https://i.pravatar.cc/96?img=12" alt="" />
            <Avatar src="https://i.pravatar.cc/96?img=12" alt="" size="lg" />
            <Avatar src="https://i.pravatar.cc/96?img=12" alt="" size="xl" />
          </Space>
        </Col>
      </Row>
      <Row gutter={[16, 16]} align="middle">
        <Col span={4}><strong>tinted</strong></Col>
        <Col span={20}>
          <Space size="middle" align="center">
            <Avatar color="oklch(58% 0.16 250)" textColor="white" size="lg">B</Avatar>
            <Avatar color="oklch(60% 0.15 150)" textColor="white" size="lg">G</Avatar>
            <Avatar color="oklch(58% 0.18 25)" textColor="white" size="lg">R</Avatar>
            <Avatar color="oklch(62% 0.14 80)" textColor="white" size="lg">A</Avatar>
            <Avatar variant="brand" size="lg">BR</Avatar>
          </Space>
        </Col>
      </Row>
    </Flex>
  ),
};
