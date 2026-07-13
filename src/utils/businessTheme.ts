import type { BusinessSegment, BusinessSpecialty } from "../types/business";

export type BusinessThemeStyles = {
  primary: string;
  primaryText: string;
  accent: string;
  accentText: string;
  muted: string;
  card: string;
  sidebar: string;
  background: string;
  shadow: string;
};

export type BusinessTheme = {
  brandName: string;
  subtitle: string;
  segmentLabel: string;
  styles: BusinessThemeStyles;
};

const neutralStyles: BusinessThemeStyles = {
  primary: "#171717",
  primaryText: "#ffffff",
  accent: "#f2f2f2",
  accentText: "#171717",
  muted: "#f6f6f6",
  card: "rgba(255,255,255,0.88)",
  sidebar: "rgba(255,255,255,0.90)",
  background:
    "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.95), transparent 28%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.7), transparent 30%), linear-gradient(135deg, #d7d7d7 0%, #eeeeee 45%, #cfd4d6 100%)",
  shadow: "rgba(0,0,0,0.18)",
};

export const defaultBusinessTheme: BusinessTheme = {
  brandName: "YggdraFlow",
  subtitle: "Gestão inteligente",
  segmentLabel: "Geral",
  styles: neutralStyles,
};

export function getBusinessTheme(
  segment?: BusinessSegment | null,
  specialty?: BusinessSpecialty | null
): BusinessTheme {
  if (segment === "BARBERSHOP") {
    return {
      brandName: "YggdraBarber",
      subtitle: "Gestão premium para barbearias",
      segmentLabel: "Barbearia",
      styles: {
        primary: "#1f1b16",
        primaryText: "#fff7ed",
        accent: "#d6a354",
        accentText: "#1f1b16",
        muted: "#f4eee6",
        card: "rgba(255,250,244,0.90)",
        sidebar: "rgba(255,248,238,0.93)",
        background:
          "radial-gradient(circle at 20% 10%, rgba(214,163,84,0.22), transparent 28%), radial-gradient(circle at 82% 4%, rgba(255,255,255,0.80), transparent 28%), linear-gradient(135deg, #d8c7ad 0%, #f2eadf 45%, #b9aa93 100%)",
        shadow: "rgba(55,38,20,0.24)",
      },
    };
  }

  if (segment === "VETERINARY") {
    return {
      brandName: "YggdraVet",
      subtitle: "Gestão para clínicas veterinárias",
      segmentLabel: "Veterinária",
      styles: {
        primary: "#145c4b",
        primaryText: "#ffffff",
        accent: "#b9eadb",
        accentText: "#123f35",
        muted: "#edf8f4",
        card: "rgba(248,255,252,0.90)",
        sidebar: "rgba(244,255,250,0.94)",
        background:
          "radial-gradient(circle at 18% 12%, rgba(70,190,155,0.24), transparent 30%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.76), transparent 28%), linear-gradient(135deg, #c8dfd7 0%, #f1fbf7 46%, #b7cec6 100%)",
        shadow: "rgba(20,92,75,0.20)",
      },
    };
  }

  if (segment === "ODONTOLOGY") {
    return {
      brandName: "YggdraOdonto",
      subtitle: "Gestão para consultórios odontológicos",
      segmentLabel: "Odontologia",
      styles: {
        primary: "#174f7a",
        primaryText: "#ffffff",
        accent: "#c7e9ff",
        accentText: "#133d5d",
        muted: "#eef8ff",
        card: "rgba(247,252,255,0.92)",
        sidebar: "rgba(244,251,255,0.94)",
        background:
          "radial-gradient(circle at 18% 12%, rgba(97,183,232,0.25), transparent 30%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.82), transparent 28%), linear-gradient(135deg, #c7dbe9 0%, #f2faff 45%, #b7c9d8 100%)",
        shadow: "rgba(23,79,122,0.20)",
      },
    };
  }

  if (segment === "WELLNESS") {
    return {
      brandName: "YggdraWell",
      subtitle: "Gestão para bem-estar",
      segmentLabel: "Bem-estar",
      styles: {
        primary: "#4d5f2c",
        primaryText: "#ffffff",
        accent: "#e2efbb",
        accentText: "#303b1d",
        muted: "#f5f8eb",
        card: "rgba(253,255,247,0.91)",
        sidebar: "rgba(250,255,241,0.94)",
        background:
          "radial-gradient(circle at 18% 12%, rgba(174,204,92,0.28), transparent 30%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.76), transparent 28%), linear-gradient(135deg, #d9dfc4 0%, #fbfff0 45%, #c8cfad 100%)",
        shadow: "rgba(77,95,44,0.20)",
      },
    };
  }

  if (segment === "BEAUTY") {
    if (specialty === "HAIR") {
      return {
        brandName: "YggdraHair",
        subtitle: "Gestão para cabelo",
        segmentLabel: "Cabelo",
        styles: {
          primary: "#5c3d22",
          primaryText: "#fff8ed",
          accent: "#e8c891",
          accentText: "#3f2916",
          muted: "#faf2e5",
          card: "rgba(255,250,242,0.91)",
          sidebar: "rgba(255,248,238,0.94)",
          background:
            "radial-gradient(circle at 18% 12%, rgba(232,200,145,0.32), transparent 30%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.78), transparent 28%), linear-gradient(135deg, #dac5a4 0%, #fff6e8 45%, #c6ad85 100%)",
          shadow: "rgba(92,61,34,0.21)",
        },
      };
    }

    if (specialty === "NAILS") {
      return {
        brandName: "YggdraNails",
        subtitle: "Gestão para unhas",
        segmentLabel: "Unhas",
        styles: {
          primary: "#8a3a5b",
          primaryText: "#ffffff",
          accent: "#ffd3e3",
          accentText: "#5c263c",
          muted: "#fff0f6",
          card: "rgba(255,248,251,0.92)",
          sidebar: "rgba(255,246,250,0.94)",
          background:
            "radial-gradient(circle at 18% 12%, rgba(255,165,200,0.28), transparent 30%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.78), transparent 28%), linear-gradient(135deg, #e4c4d1 0%, #fff4f8 45%, #d4acbd 100%)",
          shadow: "rgba(138,58,91,0.20)",
        },
      };
    }

    if (specialty === "LASHES") {
      return {
        brandName: "YggdraLashes",
        subtitle: "Gestão para cílios",
        segmentLabel: "Cílios",
        styles: {
          primary: "#4d3a78",
          primaryText: "#ffffff",
          accent: "#ddd1ff",
          accentText: "#332351",
          muted: "#f5f1ff",
          card: "rgba(250,247,255,0.92)",
          sidebar: "rgba(249,246,255,0.94)",
          background:
            "radial-gradient(circle at 18% 12%, rgba(180,154,235,0.30), transparent 30%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.78), transparent 28%), linear-gradient(135deg, #cec3e5 0%, #faf6ff 45%, #b9acd6 100%)",
          shadow: "rgba(77,58,120,0.20)",
        },
      };
    }

    if (specialty === "MAKEUP") {
      return {
        brandName: "YggdraMakeup",
        subtitle: "Gestão para maquiagem",
        segmentLabel: "Maquiagem",
        styles: {
          primary: "#7d2948",
          primaryText: "#ffffff",
          accent: "#ffc2d5",
          accentText: "#561c31",
          muted: "#fff0f5",
          card: "rgba(255,247,250,0.92)",
          sidebar: "rgba(255,245,249,0.94)",
          background:
            "radial-gradient(circle at 18% 12%, rgba(255,117,164,0.28), transparent 30%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.78), transparent 28%), linear-gradient(135deg, #e3bbc9 0%, #fff2f7 45%, #cfa1b4 100%)",
          shadow: "rgba(125,41,72,0.20)",
        },
      };
    }

    if (specialty === "SKINCARE") {
      return {
        brandName: "YggdraSkin",
        subtitle: "Gestão para estética facial",
        segmentLabel: "Estética facial",
        styles: {
          primary: "#7a5842",
          primaryText: "#ffffff",
          accent: "#f2d6c4",
          accentText: "#4f3829",
          muted: "#fbf2ed",
          card: "rgba(255,250,247,0.92)",
          sidebar: "rgba(255,248,244,0.94)",
          background:
            "radial-gradient(circle at 18% 12%, rgba(232,188,158,0.30), transparent 30%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.78), transparent 28%), linear-gradient(135deg, #dfc8b9 0%, #fff7f2 45%, #cdb3a2 100%)",
          shadow: "rgba(122,88,66,0.20)",
        },
      };
    }

    if (specialty === "EYEBROWS") {
      return {
        brandName: "YggdraBrows",
        subtitle: "Gestão para sobrancelhas",
        segmentLabel: "Sobrancelhas",
        styles: {
          primary: "#513929",
          primaryText: "#ffffff",
          accent: "#e5c3aa",
          accentText: "#38261b",
          muted: "#f7eee8",
          card: "rgba(255,250,246,0.92)",
          sidebar: "rgba(255,248,244,0.94)",
          background:
            "radial-gradient(circle at 18% 12%, rgba(201,155,121,0.30), transparent 30%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.78), transparent 28%), linear-gradient(135deg, #d7c2b2 0%, #fff7f0 45%, #bfa690 100%)",
          shadow: "rgba(81,57,41,0.20)",
        },
      };
    }

    return {
      brandName: "YggdraBeauty",
      subtitle: "Gestão para estética feminina",
      segmentLabel: "Estética completa",
      styles: {
        primary: "#7c3f63",
        primaryText: "#ffffff",
        accent: "#ffd6ec",
        accentText: "#51243e",
        muted: "#fff1f8",
        card: "rgba(255,248,252,0.92)",
        sidebar: "rgba(255,246,251,0.94)",
        background:
          "radial-gradient(circle at 18% 12%, rgba(255,184,220,0.30), transparent 30%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.78), transparent 28%), linear-gradient(135deg, #e6c4d8 0%, #fff4fb 45%, #d2afc5 100%)",
        shadow: "rgba(124,63,99,0.20)",
      },
    };
  }

  return defaultBusinessTheme;
}
