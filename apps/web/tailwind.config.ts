import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

import baseConfig from "@acme/tailwind-config/web";

export default {
  content: [...baseConfig.content, "../../packages/ui/src/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Figtree", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
      },
    },
  },
} satisfies Config;
