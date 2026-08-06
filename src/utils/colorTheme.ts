import type {
  BusinessTheme,
  BusinessThemeStyles,
} from "./businessTheme";

export type ColorThemeId =
  | "ocean"
  | "forest"
  | "rose"
  | "violet"
  | "gold"
  | "graphite"
  | "terracotta"
  | "turquoise";

export type ColorThemeOption = {
  id: ColorThemeId;
  label: string;
  description: string;
  colors: readonly [string, string, string];
  styles: BusinessThemeStyles;
};

const STORAGE_KEY = "@yggdraflow:color-theme";
const ADMIN_STORAGE_KEY = "@yggdraflow:admin-color-theme";

export const colorThemeOptions: readonly ColorThemeOption[] = [
  {
    id: "ocean",
    label: "Oceano",
    description: "Marinho profundo com ciano aquático.",
    colors: ["#083B66", "#22B8CF", "#E8FAFF"],
    styles: {
      primary: "#083B66",
      primaryText: "#FFFFFF",
      accent: "#22B8CF",
      accentText: "#06314A",
      muted: "#DDF5FA",
      card: "rgba(245,252,255,0.93)",
      sidebar: "rgba(232,247,252,0.96)",
      background:
        "radial-gradient(circle at 14% 10%, rgba(34,184,207,0.38), transparent 30%), radial-gradient(circle at 88% 4%, rgba(8,59,102,0.30), transparent 29%), linear-gradient(135deg, #6B9EB2 0%, #EAFBFF 47%, #315E79 100%)",
      shadow: "rgba(8,59,102,0.25)",
    },
  },
  {
    id: "forest",
    label: "Floresta",
    description: "Verde pinho, musgo e marfim natural.",
    colors: ["#174A32", "#97B65D", "#F4F0D9"],
    styles: {
      primary: "#174A32",
      primaryText: "#FFFFFF",
      accent: "#97B65D",
      accentText: "#233817",
      muted: "#E5EED2",
      card: "rgba(249,250,239,0.93)",
      sidebar: "rgba(239,245,222,0.96)",
      background:
        "radial-gradient(circle at 15% 12%, rgba(111,151,76,0.39), transparent 31%), radial-gradient(circle at 86% 2%, rgba(213,221,157,0.35), transparent 29%), linear-gradient(135deg, #78947B 0%, #F5F3DF 47%, #506D56 100%)",
      shadow: "rgba(23,74,50,0.25)",
    },
  },
  {
    id: "rose",
    label: "Rosé",
    description: "Vinho elegante com rosa antigo.",
    colors: ["#812653", "#E3A0B7", "#FFF0F5"],
    styles: {
      primary: "#812653",
      primaryText: "#FFFFFF",
      accent: "#E3A0B7",
      accentText: "#50162F",
      muted: "#F7D9E4",
      card: "rgba(255,247,250,0.94)",
      sidebar: "rgba(255,238,245,0.96)",
      background:
        "radial-gradient(circle at 14% 10%, rgba(227,160,183,0.40), transparent 31%), radial-gradient(circle at 88% 5%, rgba(129,38,83,0.25), transparent 29%), linear-gradient(135deg, #D99DB2 0%, #FFF3F7 48%, #AC637D 100%)",
      shadow: "rgba(129,38,83,0.23)",
    },
  },
  {
    id: "violet",
    label: "Violeta",
    description: "Roxo profundo com violeta elétrico.",
    colors: ["#4A187D", "#9B5DE5", "#F6EFFF"],
    styles: {
      primary: "#4A187D",
      primaryText: "#FFFFFF",
      accent: "#9B5DE5",
      accentText: "#2E0D4F",
      muted: "#EAD9FF",
      card: "rgba(251,247,255,0.94)",
      sidebar: "rgba(245,237,255,0.96)",
      background:
        "radial-gradient(circle at 15% 11%, rgba(155,93,229,0.41), transparent 31%), radial-gradient(circle at 87% 4%, rgba(74,24,125,0.27), transparent 28%), linear-gradient(135deg, #A486CC 0%, #F8F1FF 47%, #72509E 100%)",
      shadow: "rgba(74,24,125,0.25)",
    },
  },
  {
    id: "gold",
    label: "Dourado",
    description: "Ébano, ouro metálico e champanhe.",
    colors: ["#261D0E", "#D9A514", "#FFF3CC"],
    styles: {
      primary: "#261D0E",
      primaryText: "#FFF8E8",
      accent: "#D9A514",
      accentText: "#3D2C00",
      muted: "#F4E4AE",
      card: "rgba(255,249,231,0.95)",
      sidebar: "rgba(255,244,211,0.97)",
      background:
        "radial-gradient(circle at 15% 10%, rgba(217,165,20,0.42), transparent 31%), radial-gradient(circle at 86% 4%, rgba(54,40,17,0.29), transparent 29%), linear-gradient(135deg, #B69A55 0%, #FFF7DF 47%, #745F34 100%)",
      shadow: "rgba(38,29,14,0.27)",
    },
  },
  {
    id: "graphite",
    label: "Grafite",
    description: "Carvão urbano com prata fria.",
    colors: ["#22282D", "#A9B4BC", "#F2F5F7"],
    styles: {
      primary: "#22282D",
      primaryText: "#FFFFFF",
      accent: "#A9B4BC",
      accentText: "#20282D",
      muted: "#DDE4E8",
      card: "rgba(247,249,250,0.94)",
      sidebar: "rgba(235,240,243,0.97)",
      background:
        "radial-gradient(circle at 14% 10%, rgba(169,180,188,0.40), transparent 31%), radial-gradient(circle at 88% 4%, rgba(34,40,45,0.25), transparent 29%), linear-gradient(135deg, #929DA4 0%, #F3F6F7 47%, #606B72 100%)",
      shadow: "rgba(34,40,45,0.26)",
    },
  },
  {
    id: "terracotta",
    label: "Terracota",
    description: "Ferrugem, laranja queimado e areia.",
    colors: ["#984526", "#E28752", "#FFF0DF"],
    styles: {
      primary: "#984526",
      primaryText: "#FFFFFF",
      accent: "#E28752",
      accentText: "#58230E",
      muted: "#F5D2BB",
      card: "rgba(255,247,239,0.94)",
      sidebar: "rgba(255,237,224,0.97)",
      background:
        "radial-gradient(circle at 15% 10%, rgba(226,135,82,0.42), transparent 31%), radial-gradient(circle at 87% 4%, rgba(152,69,38,0.27), transparent 29%), linear-gradient(135deg, #CB8F70 0%, #FFF2E4 47%, #9D6248 100%)",
      shadow: "rgba(152,69,38,0.25)",
    },
  },
  {
    id: "turquoise",
    label: "Turquesa",
    description: "Petróleo, turquesa e branco aquático.",
    colors: ["#006466", "#4DD0C8", "#E8FFFD"],
    styles: {
      primary: "#006466",
      primaryText: "#FFFFFF",
      accent: "#4DD0C8",
      accentText: "#003F40",
      muted: "#D4F5F1",
      card: "rgba(246,255,253,0.94)",
      sidebar: "rgba(233,251,248,0.97)",
      background:
        "radial-gradient(circle at 15% 10%, rgba(77,208,200,0.43), transparent 31%), radial-gradient(circle at 87% 4%, rgba(0,100,102,0.26), transparent 29%), linear-gradient(135deg, #79BBB6 0%, #ECFFFC 47%, #3E8986 100%)",
      shadow: "rgba(0,100,102,0.25)",
    },
  },
] as const;

export function getStoredColorThemeId(): ColorThemeId {
  const stored = localStorage.getItem(STORAGE_KEY);

  return colorThemeOptions.some((option) => option.id === stored)
    ? (stored as ColorThemeId)
    : "ocean";
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
  const option =
    colorThemeOptions.find((item) => item.id === themeId) ??
    colorThemeOptions[0];

  return {
    ...businessTheme,
    styles: option.styles,
  };
}
