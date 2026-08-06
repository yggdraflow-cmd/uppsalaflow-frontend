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
  | "graphite"
  | "sapphire"
  | "mint"
  | "terracotta"
  | "lavender"
  | "coral";

type ColorThemeOption = {
  id: ColorThemeId;
  label: string;
  description: string;
  colors: readonly [string, string, string];
  styles?: BusinessThemeStyles;
};

const STORAGE_KEY = "@yggdraflow:color-theme";
const ADMIN_STORAGE_KEY = "@yggdraflow:admin-color-theme";

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
  {
    id: "sapphire",
    label: "Safira",
    description: "Azul profundo e sofisticado.",
    colors: ["#173f73", "#a9c8f5", "#f4f8ff"],
    styles: {
      primary: "#173f73",
      primaryText: "#ffffff",
      accent: "#a9c8f5",
      accentText: "#102c50",
      muted: "#edf4ff",
      card: "rgba(247,250,255,0.92)",
      sidebar: "rgba(243,248,255,0.94)",
      background:
        "radial-gradient(circle at 18% 12%, rgba(74,132,214,0.28), transparent 30%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.80), transparent 28%), linear-gradient(135deg, #b7c9e2 0%, #f3f7ff 45%, #9fb3cf 100%)",
      shadow: "rgba(23,63,115,0.22)",
    },
  },
  {
    id: "mint",
    label: "Menta",
    description: "Verde claro, leve e moderno.",
    colors: ["#23685b", "#bfe9dd", "#f4fffb"],
    styles: {
      primary: "#23685b",
      primaryText: "#ffffff",
      accent: "#bfe9dd",
      accentText: "#173f38",
      muted: "#eefaf6",
      card: "rgba(248,255,252,0.92)",
      sidebar: "rgba(245,255,251,0.94)",
      background:
        "radial-gradient(circle at 18% 12%, rgba(94,196,168,0.27), transparent 30%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.80), transparent 28%), linear-gradient(135deg, #c8dfd8 0%, #f3fff9 45%, #adc9c0 100%)",
      shadow: "rgba(35,104,91,0.20)",
    },
  },
  {
    id: "terracotta",
    label: "Terracota",
    description: "Tons terrosos e acolhedores.",
    colors: ["#7a4434", "#e6b8a4", "#fff7f2"],
    styles: {
      primary: "#7a4434",
      primaryText: "#ffffff",
      accent: "#e6b8a4",
      accentText: "#4f2b21",
      muted: "#fbf0eb",
      card: "rgba(255,249,246,0.92)",
      sidebar: "rgba(255,247,243,0.94)",
      background:
        "radial-gradient(circle at 18% 12%, rgba(207,128,94,0.28), transparent 30%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.78), transparent 28%), linear-gradient(135deg, #dbc2b5 0%, #fff5ef 45%, #c4a493 100%)",
      shadow: "rgba(122,68,52,0.21)",
    },
  },
  {
    id: "lavender",
    label: "Lavanda",
    description: "Lilás suave e contemporâneo.",
    colors: ["#65528a", "#ded3f5", "#fbf8ff"],
    styles: {
      primary: "#65528a",
      primaryText: "#ffffff",
      accent: "#ded3f5",
      accentText: "#40345a",
      muted: "#f5f0fc",
      card: "rgba(252,249,255,0.92)",
      sidebar: "rgba(250,247,255,0.94)",
      background:
        "radial-gradient(circle at 18% 12%, rgba(172,148,220,0.29), transparent 30%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.80), transparent 28%), linear-gradient(135deg, #d4cae6 0%, #fbf8ff 45%, #beb1d5 100%)",
      shadow: "rgba(101,82,138,0.20)",
    },
  },
  {
    id: "coral",
    label: "Coral",
    description: "Coral vibrante e equilibrado.",
    colors: ["#8c3f46", "#f3b8ad", "#fff7f5"],
    styles: {
      primary: "#8c3f46",
      primaryText: "#ffffff",
      accent: "#f3b8ad",
      accentText: "#5b282d",
      muted: "#fff0ed",
      card: "rgba(255,249,247,0.92)",
      sidebar: "rgba(255,247,245,0.94)",
      background:
        "radial-gradient(circle at 18% 12%, rgba(239,124,108,0.28), transparent 30%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.80), transparent 28%), linear-gradient(135deg, #e3c1bb 0%, #fff5f2 45%, #cca8a0 100%)",
      shadow: "rgba(140,63,70,0.20)",
    },
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

export function getStoredAdminColorThemeId(): ColorThemeId {
  const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
  return colorThemeOptions.some((option) => option.id === stored)
    ? (stored as ColorThemeId)
    : "graphite";
}

export function saveAdminColorThemeId(themeId: ColorThemeId) {
  localStorage.setItem(ADMIN_STORAGE_KEY, themeId);
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
