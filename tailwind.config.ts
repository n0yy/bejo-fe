import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100%",
            color: "inherit",
            a: {
              color: "inherit",
              textDecoration: "none",
              fontWeight: "500",
            },
            strong: {
              color: "inherit",
            },
            code: {
              color: "inherit",
            },
            pre: {
              backgroundColor: "rgb(0 0 0 / 0.05)",
              color: "inherit",
            },
            blockquote: {
              color: "inherit",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
  darkMode: "class",
};

export default config;
