import {
  defaultBusinessTheme,
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

export type ColorThemeOption = {
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
    description: "Mantém a identidade do segmento.",
    colors: ["#174f7a", "#d9efff", "#ffffff"],
  },
  {
    id: "ocean",
    label: "Oceano",
    description: "Marinho profundo com turquesa.",
    colors: ["#0b3954", "#2ec4b6", "#e8fffb"],
    styles: {
      primary: "#0b3954",
      primaryText: "#ffffff",
      accent: "#2ec4b6",
      accentText: "#062a32",
      muted: "#dff8f5",
      card: "rgba(245,255,253,0.92)",
      sidebar: "rgba(235,250,249,0.95)",
      background:
        "radial-gradient(circle at 14% 10%, rgba(46,196,182,0.34), transparent 30%), radial-gradient(circle at 88% 5%, rgba(83,144,178,0.30), transparent 28%), linear-gradient(135deg, #7ba7b7 0%, #eaf9f8 48%, #4f7f94 100%)",
      shadow: "rgba(11,57,84,0.24)",
    },
  },
  {
    id: "forest",
    label: "Floresta",
    description: "Pinho escuro, musgo e marfim.",
    colors: ["#1b4332", "#95a96d", "#f4f1de"],
    styles: {
      primary: "#1b4332",
      primaryText: "#ffffff",
      accent: "#95a96d",
      accentText: "#20351d",
      muted: "#e7edd7",
      card: "rgba(250,250,240,0.92)",
      sidebar: "rgba(242,246,227,0.95)",
      background:
        "radial-gradient(circle at 15% 12%, rgba(93,132,88,0.34), transparent 31%), radial-gradient(circle at 86% 2%, rgba(207,214,164,0.34), transparent 29%), linear-gradient(135deg, #8fa58c 0%, #f5f4e6 47%, #6f856e 100%)",
      shadow: "rgba(27,67,50,0.24)",
    },
  },
  {
    id: "rose",
    label: "Rosé",
    description: "Vinho elegante com rosa antigo.",
    colors: ["#7d2855", "#d88ca6", "#fff0f5"],
    styles: {
      primary: "#7d2855",
      primaryText: "#ffffff",
      accent: "#d88ca6",
      accentText: "#4d1734",
      muted: "#f7dce6",
      card: "rgba(255,247,250,0.93)",
      sidebar: "rgba(255,240,246,0.95)",
      background:
        "radial-gradient(circle at 14% 10%, rgba(216,140,166,0.34), transparent 31%), radial-gradient(circle at 88% 5%, rgba(125,40,85,0.20), transparent 29%), linear-gradient(135deg, #d6a0b3 0%, #fff3f7 48%, #b77690 100%)",
      shadow: "rgba(125,40,85,0.22)",
    },
  },
  {
    id: "violet",
    label: "Violeta",
    description: "Índigo intenso com violeta vivo.",
    colors: ["#4c1d95", "#8b5cf6", "#f5f3ff"],
    styles: {
      primary: "#4c1d95",
      primaryText: "#ffffff",
      accent: "#8b5cf6",
      accentText: "#2c1454",
      muted: "#e8ddff",
      card: "rgba(250,248,255,0.93)",
      sidebar: "rgba(245,240,255,0.95)",
      background:
        "radial-gradient(circle at 15% 11%, rgba(139,92,246,0.35), transparent 31%), radial-gradient(circle at 87% 4%, rgba(76,29,149,0.24), transparent 28%), linear-gradient(135deg, #a891d5 0%, #f7f3ff 47%, #7660a8 100%)",
      shadow: "rgba(76,29,149,0.24)",
    },
  },
  {
    id: "gold",
    label: "Dourado",
    description: "Carvão, ouro metálico e champanhe.",
    colors: ["#221c12", "#d4a017", "#fff7e0"],
    styles: {
      primary: "#221c12",
      primaryText: "#fff8e8",
      accent: "#d4a017",
      accentText: "#3f2e00",
      muted: "#f5e8bd",
      card: "rgba(255,250,236,0.94)",
      sidebar: "rgba(255,247,224,0.96)",
      background:
        "radial-gradient(circle at 15% 10%, rgba(212,160,23,0.36), transparent 31%), radial-gradient(circle at 86% 4%, rgba(73,57,25,0.25), transparent 29%), linear-gradient(135deg, #b59b62 0%, #fff8e8 47%, #806c45 100%)",
      shadow: "rgba(34,28,18,0.25)",
    },
  },
  {
    id: "graphite",
    label: "Grafite",
    description: "Carvão moderno com prata fria.",
    colors: ["#263238", "#90a4ae", "#f4f7f8"],
    styles: {
      primary: "#263238",
      primaryText: "#ffffff",
      accent: "#90a4ae",
      accentText: "#1d272c",
      muted: "#e1e8eb",
      card: "rgba(248,250,251,0.93)",
      sidebar: "rgba(239,244,246,0.96)",
      background:
        "radial-gradient(circle at 14% 10%, rgba(144,164,174,0.34), transparent 31%), radial-gradient(circle at 88% 4%, rgba(38,50,56,0.20), transparent 29%), linear-gradient(135deg, #9aa6ac 0%, #f4f7f8 47%, #6b777d 100%)",
      shadow: "rgba(38,50,56,0.24)",
    },
  },
  {
    id: "sapphire",
    label: "Safira",
    description: "Azul real com brilho de gelo.",
    colors: ["#0b3d91", "#4ea8de", "#eef6ff"],
    styles: {
      primary: "#0b3d91",
      primaryText: "#ffffff",
      accent: "#4ea8de",
      accentText: "#082a60",
      muted: "#d8ebff",
      card: "rgba(245,250,255,0.93)",
      sidebar: "rgba(235,245,255,0.96)",
      background:
        "radial-gradient(circle at 15% 10%, rgba(78,168,222,0.37), transparent 31%), radial-gradient(circle at 87% 3%, rgba(11,61,145,0.26), transparent 29%), linear-gradient(135deg, #7da7d8 0%, #eff7ff 47%, #4f72a6 100%)",
      shadow: "rgba(11,61,145,0.25)",
    },
  },
  {
    id: "mint",
    label: "Menta",
    description: "Verde-azulado com menta fresca.",
    colors: ["#006d77", "#83c5be", "#edfaf7"],
    styles: {
      primary: "#006d77",
      primaryText: "#ffffff",
      accent: "#83c5be",
      accentText: "#00464d",
      muted: "#d7f1ed",
      card: "rgba(247,255,253,0.93)",
      sidebar: "rgba(237,250,247,0.96)",
      background:
        "radial-gradient(circle at 15% 10%, rgba(131,197,190,0.39), transparent 31%), radial-gradient(circle at 87% 4%, rgba(0,109,119,0.23), transparent 29%), linear-gradient(135deg, #8bbdb8 0%, #effbf8 47%, #5f9692 100%)",
      shadow: "rgba(0,109,119,0.23)",
    },
  },
  {
    id: "terracotta",
    label: "Terracota",
    description: "Ferrugem, argila e areia quente.",
    colors: ["#9c4a2d", "#d77a61", "#fff3e8"],
    styles: {
      primary: "#9c4a2d",
      primaryText: "#ffffff",
      accent: "#d77a61",
      accentText: "#5b2818",
      muted: "#f5d8c8",
      card: "rgba(255,248,242,0.93)",
      sidebar: "rgba(255,241,232,0.96)",
      background:
        "radial-gradient(circle at 15% 10%, rgba(215,122,97,0.37), transparent 31%), radial-gradient(circle at 87% 4%, rgba(156,74,45,0.24), transparent 29%), linear-gradient(135deg, #cc957c 0%, #fff4ea 47%, #a86f58 100%)",
      shadow: "rgba(156,74,45,0.24)",
    },
  },
  {
    id: "lavender",
    label: "Lavanda",
    description: "Ameixa suave com lavanda acinzentada.",
    colors: ["#5b3a70", "#b8a1d9", "#f8f1ff"],
    styles: {
      primary: "#5b3a70",
      primaryText: "#ffffff",
      accent: "#b8a1d9",
      accentText: "#382246",
      muted: "#eadff4",
      card: "rgba(252,248,255,0.93)",
      sidebar: "rgba(247,240,252,0.96)",
      background:
        "radial-gradient(circle at 15% 10%, rgba(184,161,217,0.38), transparent 31%), radial-gradient(circle at 87% 4%, rgba(91,58,112,0.22), transparent 29%), linear-gradient(135deg, #b8a9c7 0%, #faf4ff 47%, #8f7b9d 100%)",
      shadow: "rgba(91,58,112,0.23)",
    },
  },
  {
    id: "coral",
    label: "Coral",
    description: "Coral intenso com pêssego luminoso.",
    colors: ["#c44536", "#ff8a65", "#fff1ec"],
    styles: {
      primary: "#c44536",
      primaryText: "#ffffff",
      accent: "#ff8a65",
      accentText: "#69251e",
      muted: "#ffd9ce",
      card: "rgba(255,248,245,0.93)",
      sidebar: "rgba(255,239,234,0.96)",
      background:
        "radial-gradient(circle at 15% 10%, rgba(255,138,101,0.40), transparent 31%), radial-gradient(circle at 87% 4%, rgba(196,69,54,0.24), transparent 29%), linear-gradient(135deg, #e49a88 0%, #fff3ee 47%, #bd7568 100%)",
      shadow: "rgba(196,69,54,0.24)",
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
