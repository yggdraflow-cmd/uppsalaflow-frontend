import type { BusinessSegment, BusinessSpecialty } from "../types/business";

export type BusinessTheme = {
  brandName: string;
  subtitle: string;
  segmentLabel: string;
};

export const defaultBusinessTheme: BusinessTheme = {
  brandName: "YggdraFlow",
  subtitle: "Gestão inteligente",
  segmentLabel: "Geral",
};

export function getBusinessTheme(
  segment?: BusinessSegment | null,
  specialty?: BusinessSpecialty | null
): BusinessTheme {
  if (segment === "BARBERSHOP") {
    return {
      brandName: "YggdraBarber",
      subtitle: "Gestão para barbearias",
      segmentLabel: "Barbearia",
    };
  }

  if (segment === "VETERINARY") {
    return {
      brandName: "YggdraVet",
      subtitle: "Gestão para clínicas veterinárias",
      segmentLabel: "Veterinária",
    };
  }

  if (segment === "ODONTOLOGY") {
    return {
      brandName: "YggdraOdonto",
      subtitle: "Gestão para consultórios odontológicos",
      segmentLabel: "Odontologia",
    };
  }

  if (segment === "WELLNESS") {
    return {
      brandName: "YggdraWell",
      subtitle: "Gestão para bem-estar",
      segmentLabel: "Bem-estar",
    };
  }

  if (segment === "BEAUTY") {
    if (specialty === "HAIR") {
      return {
        brandName: "YggdraHair",
        subtitle: "Gestão para cabelo",
        segmentLabel: "Cabelo",
      };
    }

    if (specialty === "NAILS") {
      return {
        brandName: "YggdraNails",
        subtitle: "Gestão para unhas",
        segmentLabel: "Unhas",
      };
    }

    if (specialty === "LASHES") {
      return {
        brandName: "YggdraLashes",
        subtitle: "Gestão para cílios",
        segmentLabel: "Cílios",
      };
    }

    if (specialty === "MAKEUP") {
      return {
        brandName: "YggdraMakeup",
        subtitle: "Gestão para maquiagem",
        segmentLabel: "Maquiagem",
      };
    }

    if (specialty === "SKINCARE") {
      return {
        brandName: "YggdraSkin",
        subtitle: "Gestão para estética facial",
        segmentLabel: "Estética facial",
      };
    }

    if (specialty === "EYEBROWS") {
      return {
        brandName: "YggdraBrows",
        subtitle: "Gestão para sobrancelhas",
        segmentLabel: "Sobrancelhas",
      };
    }

    return {
      brandName: "YggdraBeauty",
      subtitle: "Gestão para estética feminina",
      segmentLabel: "Estética completa",
    };
  }

  return defaultBusinessTheme;
}
