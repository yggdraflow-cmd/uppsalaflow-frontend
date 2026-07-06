import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin, PlusCircle, Scissors, UserRound } from "lucide-react";

import { Card } from "../components/Card";
import { api } from "../services/api";

type ClientAppointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  price: string;
  notes?: string | null;
  business: {
    id: string;
    name: string;
    slug: string;
    phone?: string | null;
    address?: string | null;
  };
  service: {
    id: string;
    name: string;
    durationMinutes: number;
  };
  professional: {
    id: string;
    name: string;
  };
};

type ClientAppointmentsResponse = {
  appointments: ClientAppointment[];
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Agendado",
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em atendimento",
  FINISHED: "Finalizado",
  CANCELED: "Cancelado",
  NO_SHOW: "Não compareceu",
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

export function ClientAppointmentsPage() {
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAppointments() {
      try {
        setErrorMessage("");

        const response = await api.get<ClientAppointmentsResponse>(
          "/client/appointments"
        );

        setAppointments(response.data.appointments);
      } catch {
        setErrorMessage("Não foi possível carregar seus agendamentos.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAppointments();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-orange-500">
          Portal do cliente
        </p>

        <h1 className="text-3xl font-bold text-zinc-950">
          Meus agendamentos
        </h1>

        <p className="mt-2 max-w-3xl text-zinc-600">
          Veja seus horários marcados, serviços escolhidos e status dos
          atendimentos.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <p className="text-sm font-bold text-[#667789]">
            Carregando seus agendamentos...
          </p>
        </Card>
      ) : null}

      {!isLoading && errorMessage ? (
        <Card>
          <p className="text-sm font-bold text-red-600">{errorMessage}</p>
        </Card>
      ) : null}

      {!isLoading && !errorMessage && appointments.length === 0 ? (
        <Card>
          <div className="text-center">
            <CalendarDays className="mx-auto text-orange-500" size={34} />

            <h2 className="mt-4 text-2xl font-black text-[#101828]">
              Nenhum agendamento encontrado
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#667789]">
              Quando você marcar um horário em uma página pública de
              agendamento, ele aparecerá aqui.
            </p>

            <Link
              to="/agendar/salao-da-mayara"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#121b35] bg-[#121b35] px-5 text-sm font-black text-white transition hover:bg-[#1c294b]"
            >
              <PlusCircle size={18} />
              Agendar no Salão da Mayara
            </Link>
          </div>
        </Card>
      ) : null}

      {!isLoading && !errorMessage && appointments.length > 0 ? (
        <div className="grid gap-5">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                      {statusLabels[appointment.status] ?? appointment.status}
                    </span>

                    <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-black text-[#506173]">
                      {formatCurrency(appointment.price)}
                    </span>
                  </div>

                  <h2 className="mt-4 text-2xl font-black text-[#101828]">
                    {appointment.business.name}
                  </h2>

                  <div className="mt-4 grid gap-3 text-sm font-bold text-[#506173]">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={18} className="text-orange-500" />
                      <span>
                        {formatDate(appointment.date)} às{" "}
                        {appointment.startTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-orange-500" />
                      <span>
                        {appointment.startTime} até {appointment.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Scissors size={18} className="text-orange-500" />
                      <span>
                        {appointment.service.name} ·{" "}
                        {appointment.service.durationMinutes} min
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <UserRound size={18} className="text-orange-500" />
                      <span>{appointment.professional.name}</span>
                    </div>

                    {appointment.business.address ? (
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-orange-500" />
                        <span>{appointment.business.address}</span>
                      </div>
                    ) : null}
                  </div>

                  {appointment.notes ? (
                    <p className="mt-5 rounded-2xl border border-white/80 bg-white/45 p-4 text-sm font-semibold text-[#667789]">
                      {appointment.notes}
                    </p>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
