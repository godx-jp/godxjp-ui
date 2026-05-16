import type { Preview } from "@storybook/react";

import "../src/tokens/tailwind.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "app",
      values: [
        { name: "app", value: "var(--background)" },
        { name: "surface", value: "var(--surface-2)" },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Light / dark",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
    tenant: {
      name: "Tenant",
      description: "Tenant token override",
      defaultValue: "godx",
      toolbar: {
        icon: "user",
        items: [
          { value: "godx", title: "godx" },
          { value: "kintai", title: "kintai" },
          { value: "tempo", title: "tempo" },
          { value: "betoya", title: "betoya" },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      name: "Density",
      description: "Spacing density",
      defaultValue: "default",
      toolbar: {
        icon: "component",
        items: [
          { value: "compact", title: "Compact" },
          { value: "default", title: "Default" },
          { value: "comfortable", title: "Comfortable" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const { theme, tenant, density } = context.globals as {
        theme: string;
        tenant: string;
        density: string;
      };
      if (typeof document !== "undefined") {
        document.documentElement.dataset.theme = theme;
        document.documentElement.dataset.tenant = tenant;
        document.documentElement.dataset.density = density;
      }
      return Story();
    },
  ],
};

export default preview;
