export type Business = {
  id: string;
  ownerId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  category?: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
};
