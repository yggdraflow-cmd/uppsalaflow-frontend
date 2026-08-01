export type BeautyService = {
  id: string;
  businessId: string;
  name: string;
  description?: string | null;
  price: string | number;
  durationMinutes: number;
  category?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
