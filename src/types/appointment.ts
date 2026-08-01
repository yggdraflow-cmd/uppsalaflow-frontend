export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "FINISHED"
  | "CANCELED"
  | "NO_SHOW";

export type Appointment = {
  id: string;
  businessId: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  price: string | number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};
