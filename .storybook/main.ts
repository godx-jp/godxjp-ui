import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
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
