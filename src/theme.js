import { createTheme, rem } from "@mantine/core";

const brand = [
  "#e6f7ff",
  "#cfefff",
  "#a0dfff",
  "#6ccfff",
  "#40c0ff",
  "#22b8ff",
  "#12a4f5",
  "#0d8dd8",
  "#0b79ba",
  "#085f93",
];

const dark = [
  "#d7dce6",
  "#b5bccb",
  "#8e97aa",
  "#676e80",
  "#4c5263",
  "#3b3f4f",
  "#2b2f3c",
  "#1f222c",
  "#151821",
  "#0c0f16",
];

export const theme = createTheme({
  colors: { brand, dark },
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 5 },
  fontFamily: "'Space Grotesk', sans-serif",
  headings: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: "700",
    sizes: {
      h1: { fontSize: rem(44), lineHeight: "1.05" },
      h2: { fontSize: rem(34), lineHeight: "1.15" },
    },
  },
  defaultRadius: "md",
  components: {
    Button: {
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});
