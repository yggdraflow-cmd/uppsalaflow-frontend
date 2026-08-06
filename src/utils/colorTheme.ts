import {
  defaultBusinessTheme,
  getBusinessTheme,
  type BusinessTheme,
  type BusinessThemeStyles,
} from "./businessTheme";

export type ColorThemeId =
  | "automatic"
  | "ocean"
  | "forest"
  | "rose"
  | "violet"
  | "gold"
  | "graphite";

type ColorThemeOption = {
  id: ColorThemeId;
  label: string;
  description: string;
  colors: readonly [string, string, string];
  styles?: BusinessThemeStyles;
};

const STORAGE_KEY = "@yggdraflow:color-theme";

export const colorThemeOptions: readonly ColorThemeOption[] = [
  {
    id: "automatic",
    label: "Automático",
    description: "Cores recomendadas para o segmento.",
    colors: ["#174f7a", "#eef8ff", "#ffffff"],
  },
  {
    id: "ocean",
    label: "Oceano",
    description: "Azul profissional e claro.",
    colors: ["#174f7a", "#c7e9ff", "#f4fbff"],
    styles: getBusinessTheme("ODONTOLOGY", null).styles,
  },
  {
    id: "forest",
    label: "Floresta",
    description: "Verde sóbrio e acolhedor.",
    colors: ["#145c4b", "#b9eadb", "#f4fff9"],
    styles: getBusinessTheme("VETERINARY", null).styles,
  },
  {
    id: "rose",
    label: "Rosé",
    description: "Rosa elegante e delicado.",
    colors: ["#8a3a5b", "#ffd3e3", "#fff6fa"],
    styles: getBusinessTheme("BEAUTY", "NAILS").styles,
  },
  {
    id: "violet",
    label: "Violeta",
    description: "Roxo moderno e distinto.",
    colors: ["#4d3a78", "#ddd1ff", "#faf7ff"],
    styles: getBusinessTheme("BEAUTY", "LASHES").styles,
  },
  {
    id: "gold",
    label: "Dourado",
    description: "Dourado quente e elegante.",
    colors: ["#1f1b16", "#d6a354", "#fff8ee"],
    styles: getBusinessTheme("BARBERSHOP", null).styles,
  },
  {
    id: "graphite",
    label: "Grafite",
    description: "Neutro, limpo e discreto.",
    colors: ["#171717", "#e7e7e7", "#ffffff"],
    styles: defaultBusinessTheme.styles,
  },
] as const;

export function getStoredColorThemeId(): ColorThemeId {
  const stored = localStorage.getItem(STORAGE_KEY);
  return colorThemeOptions.some((option) => option.id === stored)
    ? (stored as ColorThemeId)
    : "automatic";
}

export function saveColorThemeId(themeId: ColorThemeId) {
  localStorage.setItem(STORAGE_KEY, themeId);
}

export function applyColorTheme(
  businessTheme: BusinessTheme,
  themeId: ColorThemeId
): BusinessTheme {
  const option = colorThemeOptions.find((item) => item.id === themeId);

  return option?.styles
    ? { ...businessTheme, styles: option.styles }
    : businessTheme;
}
