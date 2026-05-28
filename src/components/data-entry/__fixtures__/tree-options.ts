import type { TreeOptionProp } from "../../../props/components/data-entry.prop";

/** Demo data - VN/JP region hierarchy for preview examples and tests. */
export const REGION_OPTIONS: TreeOptionProp[] = [
  {
    value: "vn",
    label: "Việt Nam",
    children: [
      {
        value: "hcm",
        label: "TP. Hồ Chí Minh",
        children: [
          { value: "q1", label: "Quận 1" },
          { value: "q3", label: "Quận 3" },
        ],
      },
      {
        value: "hn",
        label: "Hà Nội",
        children: [
          { value: "badinh", label: "Ba Đình" },
          { value: "caugiay", label: "Cầu Giấy" },
        ],
      },
    ],
  },
  {
    value: "jp",
    label: "日本",
    children: [
      {
        value: "osaka",
        label: "大阪府",
        children: [
          { value: "chuo", label: "中央区" },
          { value: "kita", label: "北区" },
        ],
      },
      {
        value: "tokyo",
        label: "東京都",
        children: [
          { value: "shinjuku", label: "新宿区" },
          { value: "shibuya", label: "渋谷区" },
        ],
      },
    ],
  },
];

export const ORG_TREE: TreeOptionProp[] = [
  {
    value: "godx",
    label: "GODX",
    children: [
      {
        value: "logistics",
        label: "Logistics",
        children: [
          { value: "warehouse-osaka", label: "Kho Osaka" },
          { value: "warehouse-hcm", label: "Kho HCM" },
        ],
      },
      {
        value: "platform",
        label: "Platform",
        children: [
          { value: "identity", label: "Identity" },
          { value: "media", label: "Media" },
        ],
      },
    ],
  },
];

export const TRANSFER_MOCK = Array.from({ length: 12 }, (_, i) => ({
  key: `user-${i + 1}`,
  title: `NV-${String(i + 1).padStart(3, "0")}`,
  description: i % 3 === 0 ? "Kho Osaka" : "Kho HCM",
}));
