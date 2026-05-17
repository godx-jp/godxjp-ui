import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: [
    // Storybook 10 folded former addon-essentials features
    // (controls, viewport, backgrounds, toolbars, measure, outline)
    // into core. addon-docs still ships separately and powers the
    // `tags: ["autodocs"]` Docs view + the Code panel.
    "@storybook/addon-docs",
    // Turns every story's `play()` into a Vitest test (browser mode +
    // Playwright provider) so interactive primitives are regression-
    // gated by CI. See `vitest.config.ts` for the wiring.
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (vConfig) => {
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    vConfig.plugins = vConfig.plugins ?? [];
    vConfig.plugins.push(tailwindcss());
    return vConfig;
  },
};

export default config;
