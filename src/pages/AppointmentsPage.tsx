import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { api } from "../services/api";
import type { Appointment, AppointmentStatus } from "../types/appointment";
import type { Business } from "../types/business";
import type { Client } from "../types/client";
import type { Professional } from "../types/professional";
import type { BeautyService } from "../types/service";

type AppointmentWithRelations = Appointment & {
  client: Client;
  professional: Professional;
  service: BeautyService;
};

const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  SCHEDULED: "Agendado",
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em atendimento",
  FINISHED: "Finalizado",
  CANCELED: "Cancelado",
  NO_SHOW: "Não compareceu",
};

const appointmentStatusOptions: AppointmentStatus[] = [
  "SCHEDULED",
  "CONFIRMED",
  "IN_PROGRESS",
  "FINISHED",
  "CANCELED",
  "NO_SHOW",
];

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes + minutesToAdd);
  date.setSeconds(0);
  date.setMilliseconds(0);

  const finalHours = String(date.getHours()).padStart(2, "0");
  const finalMinutes = String(date.getMinutes()).padStart(2, "0");

  return `${finalHours}:${finalMinutes}`;
}

function formatCurrency(value: string | number) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function AppointmentsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<BeautyService[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);

  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [startTime, setStartTime] = useState("09:00");
  const [notes, setNotes] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedService = useMemo(() => {
    return services.find((service) => service.id === selectedServiceId);
  }, [services, selectedServiceId]);

  const calculatedEndTime = useMemo(() => {
    if (!selectedService || !startTime) {
      return "";
    }

    return addMinutesToTime(startTime, selectedService.durationMinutes);
  }, [selectedService, startTime]);

  useEffect(() => {
    async function loadBusinesses() {
      try {
        setError("");

        const response = await api.get<Business[]>("/businesses");

        setBusinesses(response.data);

        if (response.data.length > 0) {
          setSelectedBusinessId(response.data[0].id);
        }
      } catch {
        setError("Não foi possível carregar os negócios.");
      }
    }

    loadBusinesses();
  }, []);

  useEffect(() => {
    async function loadBusinessData() {
      if (!selectedBusinessId) {
        setClients([]);
        setServices([]);
        setProfessionals([]);
        setAppointments([]);
        return;
      }

      try {
        setError("");

        const [clientsResponse, servicesResponse, professionalsResponse] =
          await Promise.all([
            api.get<Client[]>("/clients", {
              params: { businessId: selectedBusinessId },
            }),
            api.get<BeautyService[]>("/services", {
              params: { businessId: selectedBusinessId },
            }),
            api.get<Professional[]>("/professionals", {
              params: { businessId: selectedBusinessId },
            }),
          ]);

        setClients(clientsResponse.data);
        setServices(servicesResponse.data);
        setProfessionals(professionalsResponse.data);

        setSelectedClientId(clientsResponse.data[0]?.id || "");
        setSelectedServiceId(servicesResponse.data[0]?.id || "");
        setSelectedProfessionalId(professionalsResponse.data[0]?.id || "");
      } catch {
        setError("Não foi possível carregar os dados do negócio.");
      }
    }

    loadBusinessData();
  }, [selectedBusinessId]);

  useEffect(() => {
    async function loadAppointments() {
      if (!selectedBusinessId || !selectedDate) {
        setAppointments([]);
        return;
      }

      try {
        setError("");

        const response = await api.get<AppointmentWithRelations[]>("/appointments", {
          params: {
            businessId: selectedBusinessId,
            date: new Date(`${selectedDate}T00:00:00`).toISOString(),
          },
        });

        setAppointments(response.data);
      } catch {
        setError("Não foi possível carregar a agenda do dia.");
      }
    }

    loadAppointments();
  }, [selectedBusinessId, selectedDate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!selectedBusinessId) {
      setError("Cadastre um negócio antes de criar agendamentos.");
      return;
    }

    if (!selectedClientId || !selectedServiceId || !selectedProfessionalId) {
      setError("Cadastre cliente, serviço e profissional antes de criar agendamentos.");
      return;
    }

    if (!selectedService || !calculatedEndTime) {
      setError("Selecione um serviço válido.");
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");
      setError("");

      const response = await api.post<AppointmentWithRelations>("/appointments", {
        businessId: selectedBusinessId,
        clientId: selectedClientId,
        professionalId: selectedProfessionalId,
        serviceId: selectedServiceId,
        date: new Date(`${selectedDate}T00:00:00`).toISOString(),
        startTime,
        endTime: calculatedEndTime,
        price: Number(selectedService.price),
        notes: notes || undefined,
      });

      setAppointments((currentAppointments) => [
        response.data,
        ...currentAppointments,
      ]);

      setMessage("Agendamento criado com sucesso.");
      setNotes("");
    } catch {
      setError("Não foi possível criar o agendamento.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusChange(
    appointmentId: string,
    status: AppointmentStatus
  ) {
    try {
      setMessage("");
      setError("");

      const response = await api.patch<AppointmentWithRelations>(
        `/appointments/${appointmentId}/status`,
        { status }
      );

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId ? response.data : appointment
        )
      );

      setMessage("Status do agendamento atualizado.");
    } catch {
      setError("Não foi possível atualizar o status do agendamento.");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-beauty-700">Agenda</p>
        <h1 className="text-3xl font-bold text-zinc-950">Agendamentos</h1>
        <p className="mt-2 text-zinc-600">
          Crie atendimentos, liste a agenda por dia e altere o status.
        </p>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <Card title="Negócio selecionado">
          {businesses.length === 0 ? (
            <p className="text-sm text-red-600">
              Nenhum negócio cadastrado. Cadastre um negócio primeiro.
            </p>
          ) : (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">
                Escolha o negócio
              </span>

              <select
                value={selectedBusinessId}
                onChange={(event) => setSelectedBusinessId(event.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-beauty-500 focus:ring-2 focus:ring-beauty-100"
              >
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </Card>

        <Card title="Dia da agenda">
          <Input
            label="Data"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card title="Criar agendamento">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">
                Cliente
              </span>

              <select
                value={selectedClientId}
                onChange={(event) => setSelectedClientId(event.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-beauty-500 focus:ring-2 focus:ring-beauty-100"
              >
                {clients.length === 0 ? (
                  <option value="">Nenhum cliente cadastrado</option>
                ) : (
                  clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">
                Serviço
              </span>

              <select
                value={selectedServiceId}
                onChange={(event) => setSelectedServiceId(event.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-beauty-500 focus:ring-2 focus:ring-beauty-100"
              >
                {services.length === 0 ? (
                  <option value="">Nenhum serviço cadastrado</option>
                ) : (
                  services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {formatCurrency(service.price)}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">
                Profissional
              </span>

              <select
                value={selectedProfessionalId}
                onChange={(event) =>
                  setSelectedProfessionalId(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-beauty-500 focus:ring-2 focus:ring-beauty-100"
              >
                {professionals.length === 0 ? (
                  <option value="">Nenhum profissional cadastrado</option>
                ) : (
                  professionals.map((professional) => (
                    <option key={professional.id} value={professional.id}>
                      {professional.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <Input
              label="Horário inicial"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              required
            />

            <div className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600 ring-1 ring-zinc-200">
              <p>
                Horário final:{" "}
                <span className="font-semibold text-zinc-950">
                  {calculatedEndTime || "--:--"}
                </span>
              </p>

              <p className="mt-1">
                Preço:{" "}
                <span className="font-semibold text-zinc-950">
                  {selectedService ? formatCurrency(selectedService.price) : "R$ 0,00"}
                </span>
              </p>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">
                Observações
              </span>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Observações do atendimento..."
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-beauty-500 focus:ring-2 focus:ring-beauty-100"
              />
            </label>

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? "Salvando..." : "Criar agendamento"}
            </Button>
          </form>

          {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </Card>

        <Card title="Agenda do dia">
          {appointments.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Nenhum agendamento cadastrado para este dia.
            </p>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-zinc-950">
                          {appointment.client.name}
                        </h2>

                        <span className="rounded-full bg-beauty-50 px-3 py-1 text-xs font-semibold text-beauty-700">
                          {appointmentStatusLabels[appointment.status]}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-zinc-500">
                        Serviço:{" "}
                        <span className="font-medium text-zinc-900">
                          {appointment.service.name}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Profissional: {appointment.professional.name}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Horário: {appointment.startTime} até {appointment.endTime}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Preço: {formatCurrency(appointment.price)}
                      </p>

                      {appointment.notes && (
                        <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-zinc-600 ring-1 ring-zinc-200">
                          {appointment.notes}
                        </p>
                      )}
                    </div>

                    <label className="block min-w-52">
                      <span className="mb-1 block text-sm font-medium text-zinc-700">
                        Status
                      </span>

                      <select
                        value={appointment.status}
                        onChange={(event) =>
                          handleStatusChange(
                            appointment.id,
                            event.target.value as AppointmentStatus
                          )
                        }
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-beauty-500 focus:ring-2 focus:ring-beauty-100"
                      >
                        {appointmentStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {appointmentStatusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}