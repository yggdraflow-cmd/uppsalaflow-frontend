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

export type CompanyStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "UNDER_REVIEW"
  | "ACTIVE"
  | "BLOCKED"
  | "SUSPENDED"
  | "CANCELED";

export type BillingCycle =
  | "MONTHLY"
  | "SEMIANNUAL"
  | "ANNUAL";

export type SubscriptionStatus =
  | "PENDING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "OVERDUE"
  | "FAILED"
  | "CANCELED"
  | "REFUNDED";

export type BillingState =
  | "FREE"
  | "NO_OPEN_PAYMENT"
  | "CURRENT"
  | "DUE_SOON"
  | "DUE_TODAY"
  | "PAST_DUE"
  | "SUSPENDED";

export type BusinessBilling = {
  state: BillingState;
  dueAt: string | null;
  daysUntilDue: number | null;
  overdueDays: number;
  warningDays: number;
  graceDays: number;
  message: string;
};

export type BusinessSubscription = {
  id: string;
  businessId: string;
  plan: string;
  cycle: BillingCycle;
  installments: number;
  installmentAmount: number | string;
  totalAmount: number | string;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BusinessPayment = {
  id: string;
  businessId: string;
  subscriptionId?: string | null;
  provider: string;
  amount: number | string;
  status: PaymentStatus;
  dueAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Business = {
  id: string;
  ownerId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  category?: string | null;
  coverImageUrl?: string | null;
  slug: string;
  segment?: BusinessSegment | null;
  specialty?: BusinessSpecialty | null;
  status?: CompanyStatus;
  statusReason?: string | null;
  approvedAt?: string | null;
  subscription?: BusinessSubscription | null;
  payments?: BusinessPayment[];
  billing?: BusinessBilling | null;
  createdAt: string;
  updatedAt: string;
};
