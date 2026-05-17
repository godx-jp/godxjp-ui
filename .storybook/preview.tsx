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
    // Make the Code panel the default tab in the bottom addons drawer
    // so the source JSX is the first thing reviewers see on every
    // Story view — no Controls/Actions click-through.
    options: {
      selectedPanel: "storybook/docs/panel",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Auto-instrument every callback prop matching `onValueChange`,
    // `onOpenChange`, `onClick`, `onSelect`, `onChange`, … so the
    // Actions panel logs every invocation without per-story wiring.
    // The regex matches React event/handler conventions (`on` +
    // PascalCase). Stories can still override per-arg via argTypes.
    actions: { argTypesRegex: "^on[A-Z].*" },
    backgrounds: { disable: true },
    docs: {
      toc: { headingSelector: "h2, h3" },
      // Storybook 10 ships an inline Code panel via `@storybook/addon-docs`
      // (the replacement for the discontinued `addon-storysource`).
      // Toggle it on so the Story view (`?viewMode=story`) carries a
      // "Code" tab beside Controls / Actions / Interactions — same
      // snippet the Source doc block renders, with `args` inlined.
      codePanel: true,
      // Keep the Docs view collapsed by default (`hidden`) — auto-
      // expanding source under every story bloats the Docs page to
      // unreadable heights when a component ships 5+ stories. Source
      // remains one click away via "Show code", and consumers chasing
      // a single story should use the Story view's Code panel.
      canvas: { sourceState: "hidden" },
      // `type: "dynamic"` lets Storybook render just the JSX (with
      // current `args` inlined) instead of the literal story-object
      // wrapper `{ name: "...", render: () => … }`. Reads as a clean
      // copy-paste-able snippet that consumers can drop into their
      // own code, matching the Ant / MUI / shadcn doc convention.
      source: { type: "dynamic" },
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
