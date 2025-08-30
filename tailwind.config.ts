import { heroui } from "@heroui/react";

export default {
  content: [
    "./index.html",
    "./src/**/*.{html,js,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  themes: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};
