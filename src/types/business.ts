export type BusinessSegment =
  | "BARBERSHOP"
  | "BEAUTY"
  | "ODONTOLOGY"
  | "VETERINARY"
  | "WELLNESS"
  | "OTHER";

export type BusinessSpecialty =
  | "BEAUTY_GENERAL"
  | "HAIR"
  | "NAILS"
  | "LASHES"
  | "MAKEUP"
  | "SKINCARE"
  | "EYEBROWS";

export type Business = {
  id: string;
  ownerId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  category?: string | null;
  slug: string;
  segment?: BusinessSegment | null;
  specialty?: BusinessSpecialty | null;
  createdAt: string;
  updatedAt: string;
};
