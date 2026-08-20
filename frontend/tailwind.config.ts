/**
 * Tailwind CSS 主题配置
 * 定义前端项目的字体、颜色和阴影扩展
 */
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"LXGW WenKai Screen"',
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          "sans-serif",
        ],
        mono: ['"JetBrains Mono"', '"SFMono-Regular"', "Consolas", "monospace"],
      },
      colors: {
        surface: "#f8fafc",
        ink: "#0f172a",
        inkSoft: "#1e293b",
        primary: "#2563eb",
        accent: "#3b82f6",
        danger: "#dc2626",
        line: "#e2e8f0",
      },
      boxShadow: {
        line: "0 1px 0 rgba(15, 23, 42, 0.06)",
        panel: "0 24px 70px rgba(15, 23, 42, 0.14)",
      },
    },
  },
  plugins: [],
} satisfies Config;
