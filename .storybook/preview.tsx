import React from "react";
import type { Preview } from "@storybook/react";

import "../src/tokens/tailwind.css";
import "./preview.css";
import { initI18n } from "../src/i18n";

// Initialize the i18n singleton at module load — TweaksPanel calls
// `i18next.changeLanguage()` which crashes with "Cannot read
// properties of undefined (reading 'toResolveHierarchy')" if the
// singleton has no resolver wired.
initI18n();

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
    density: {
      name: "Density",
      description: "Global spacing density — rebinds --density-element / --density-card / --density-page / --header-height across the system.",
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
    fontSize: {
      name: "Font size",
      description: "Global root font-size — rescales every rem-based token (spacing, density, type, radii) across the system.",
      defaultValue: "base",
      toolbar: {
        icon: "type",
        items: [
          { value: "sm", title: "Small (14px)" },
          { value: "base", title: "Base (16px)" },
          { value: "lg", title: "Large (18px)" },
          { value: "xl", title: "XLarge (20px)" },
        ],
        dynamicTitle: true,
      },
    },
    accent: {
      name: "Color theme",
      description: "Global brand color theme — flips --primary, --ring, --brand, --sidebar-active-* across the whole UI.",
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
      const { theme, density, accent, fontSize } = context.globals as {
        theme: string;
        density: string;
        accent: string;
        fontSize: string;
      };
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        root.dataset.theme = theme;
        root.dataset.density = density;
        root.dataset.accent = accent;
        root.dataset.fontSize = fontSize;
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
