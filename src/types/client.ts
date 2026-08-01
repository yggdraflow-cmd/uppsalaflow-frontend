export type Client = {
  id: string;
  businessId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  birthDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};
