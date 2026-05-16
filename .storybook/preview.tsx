import React from "react";
import type { Preview } from "@storybook/react";

import "../src/tokens/tailwind.css";
import "./preview.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disable: true },
    docs: {
      toc: { headingSelector: "h2, h3" },
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
    accent: {
      name: "Accent",
      description: "Primary accent palette",
      defaultValue: "blue",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "blue", title: "Blue" },
          { value: "green", title: "Green" },
          { value: "violet", title: "Violet" },
          { value: "amber", title: "Amber" },
          { value: "rose", title: "Rose" },
          { value: "slate", title: "Slate" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const { theme, tenant, density, accent } = context.globals as {
        theme: string;
        tenant: string;
        density: string;
        accent: string;
      };
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        root.dataset.theme = theme;
        root.dataset.tenant = tenant;
        root.dataset.density = density;
        root.dataset.accent = accent;
      }
      return (
        <div className="sb-stage">
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
