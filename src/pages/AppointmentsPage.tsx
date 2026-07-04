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

type TimeOption = {
  time: string;
  disabled: boolean;
  reason: string;
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

const BUSINESS_CLOSE_TIME = "18:00";

const availableTimes = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function getDateOnly(date: string | Date) {
  return new Date(date).toISOString().split("T")[0];
}

function formatDisplayDate(date: string | Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
}

function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date(2000, 0, 1, hours, minutes);
  date.setMinutes(date.getMinutes() + minutesToAdd);

  const finalHours = String(date.getHours()).padStart(2, "0");
  const finalMinutes = String(date.getMinutes()).padStart(2, "0");

  return `${finalHours}:${finalMinutes}`;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function hasTimeConflict(
  newStartTime: string,
  newEndTime: string,
  existingStartTime: string,
  existingEndTime: string
) {
  const newStart = timeToMinutes(newStartTime);
  const newEnd = timeToMinutes(newEndTime);
  const existingStart = timeToMinutes(existingStartTime);
  const existingEnd = timeToMinutes(existingEndTime);

  return newStart < existingEnd && newEnd > existingStart;
}

function formatCurrency(value: string | number) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function sortAppointmentsByTime(appointments: AppointmentWithRelations[]) {
  return [...appointments].sort((firstAppointment, secondAppointment) =>
    firstAppointment.startTime.localeCompare(secondAppointment.startTime)
  );
}

function sortHistoryAppointments(appointments: AppointmentWithRelations[]) {
  return [...appointments].sort((firstAppointment, secondAppointment) => {
    const firstDate = new Date(firstAppointment.date).getTime();
    const secondDate = new Date(secondAppointment.date).getTime();

    if (firstDate !== secondDate) {
      return secondDate - firstDate;
    }

    return secondAppointment.startTime.localeCompare(
      firstAppointment.startTime
    );
  });
}

function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return fallbackMessage;
}

function isHistoryStatus(status: AppointmentStatus) {
  return (
    status === "FINISHED" || status === "CANCELED" || status === "NO_SHOW"
  );
}

function isCanceledStatus(status: AppointmentStatus) {
  return status === "CANCELED" || status === "NO_SHOW";
}

export function AppointmentsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<BeautyService[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<
    AppointmentWithRelations[]
  >([]);
  const [historyAppointments, setHistoryAppointments] = useState<
    AppointmentWithRelations[]
  >([]);

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

  const activeDayAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => !isHistoryStatus(appointment.status)
    );
  }, [appointments]);

  const daySummary = useMemo(() => {
    const finishedCount = appointments.filter(
      (appointment) => appointment.status === "FINISHED"
    ).length;

    const canceledCount = appointments.filter((appointment) =>
      isCanceledStatus(appointment.status)
    ).length;

    const estimatedRevenue = appointments.reduce((total, appointment) => {
      if (isCanceledStatus(appointment.status)) {
        return total;
      }

      return total + Number(appointment.price);
    }, 0);

    return {
      total: appointments.length,
      active: activeDayAppointments.length,
      finished: finishedCount,
      canceled: canceledCount,
      estimatedRevenue,
    };
  }, [appointments, activeDayAppointments.length]);

  const historySummary = useMemo(() => {
    const finishedCount = historyAppointments.filter(
      (appointment) => appointment.status === "FINISHED"
    ).length;

    const canceledCount = historyAppointments.filter((appointment) =>
      isCanceledStatus(appointment.status)
    ).length;

    const revenue = historyAppointments.reduce((total, appointment) => {
      if (isCanceledStatus(appointment.status)) {
        return total;
      }

      return total + Number(appointment.price);
    }, 0);

    return {
      total: historyAppointments.length,
      finished: finishedCount,
      canceled: canceledCount,
      revenue,
    };
  }, [historyAppointments]);

  const timeOptions = useMemo<TimeOption[]>(() => {
    return availableTimes.map((time) => {
      if (!selectedService || !selectedProfessionalId) {
        return {
          time,
          disabled: false,
          reason: "",
        };
      }

      const endTime = addMinutesToTime(time, selectedService.durationMinutes);

      if (timeToMinutes(endTime) > timeToMinutes(BUSINESS_CLOSE_TIME)) {
        return {
          time,
          disabled: true,
          reason: "fora do expediente",
        };
      }

      const hasConflict = appointments.some((appointment) => {
        if (appointment.professionalId !== selectedProfessionalId) {
          return false;
        }

        if (
          appointment.status === "CANCELED" ||
          appointment.status === "NO_SHOW"
        ) {
          return false;
        }

        return hasTimeConflict(
          time,
          endTime,
          appointment.startTime,
          appointment.endTime
        );
      });

      return {
        time,
        disabled: hasConflict,
        reason: hasConflict ? "indisponível" : "",
      };
    });
  }, [appointments, selectedProfessionalId, selectedService]);

  const selectedTimeOption = useMemo(() => {
    return timeOptions.find((option) => option.time === startTime);
  }, [startTime, timeOptions]);

  useEffect(() => {
    async function loadBusinesses() {
      try {
        setError("");

        const response = await api.get<Business[]>("/businesses");

        setBusinesses(response.data);

        if (response.data.length > 0) {
          setSelectedBusinessId(response.data[0].id);
        }
      } catch (error) {
        setBusinesses([]);
        setError(
          getApiErrorMessage(error, "Não foi possível carregar os negócios.")
        );
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
        setHistoryAppointments([]);
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
      } catch (error) {
        setClients([]);
        setServices([]);
        setProfessionals([]);
        setError(
          getApiErrorMessage(
            error,
            "Não foi possível carregar os dados do negócio."
          )
        );
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

        const response = await api.get<AppointmentWithRelations[]>(
          "/appointments",
          {
            params: {
              businessId: selectedBusinessId,
              date: new Date(`${selectedDate}T00:00:00`).toISOString(),
            },
          }
        );

        setAppointments(sortAppointmentsByTime(response.data));
      } catch (error) {
        setAppointments([]);
        setError(
          getApiErrorMessage(error, "Não foi possível carregar a agenda do dia.")
        );
      }
    }

    loadAppointments();
  }, [selectedBusinessId, selectedDate]);

  useEffect(() => {
    async function loadHistoryAppointments() {
      if (!selectedBusinessId) {
        setHistoryAppointments([]);
        return;
      }

      try {
        setError("");

        const response = await api.get<AppointmentWithRelations[]>(
          "/appointments/history",
          {
            params: {
              businessId: selectedBusinessId,
            },
          }
        );

        setHistoryAppointments(sortHistoryAppointments(response.data));
      } catch (error) {
        setHistoryAppointments([]);
        setError(
          getApiErrorMessage(
            error,
            "Não foi possível carregar o histórico geral."
          )
        );
      }
    }

    loadHistoryAppointments();
  }, [selectedBusinessId]);

  useEffect(() => {
    if (timeOptions.length === 0) {
      return;
    }

    const currentTimeOption = timeOptions.find(
      (option) => option.time === startTime
    );

    if (currentTimeOption && !currentTimeOption.disabled) {
      return;
    }

    const firstAvailableTimeOption = timeOptions.find(
      (option) => !option.disabled
    );

    setStartTime(firstAvailableTimeOption?.time || "");
  }, [startTime, timeOptions]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!selectedBusinessId) {
      setError("Cadastre um negócio antes de criar agendamentos.");
      return;
    }

    if (!selectedClientId || !selectedServiceId || !selectedProfessionalId) {
      setError(
        "Cadastre cliente, serviço e profissional antes de criar agendamentos."
      );
      return;
    }

    if (!selectedService || !calculatedEndTime) {
      setError("Selecione um serviço válido.");
      return;
    }

    if (!startTime) {
      setError("Não há horário disponível para este serviço nesta data.");
      return;
    }

    if (selectedTimeOption?.disabled) {
      setError("Esse horário não está disponível. Escolha outro horário.");
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");
      setError("");

      const response = await api.post<AppointmentWithRelations>(
        "/appointments",
        {
          businessId: selectedBusinessId,
          clientId: selectedClientId,
          professionalId: selectedProfessionalId,
          serviceId: selectedServiceId,
          date: new Date(`${selectedDate}T00:00:00`).toISOString(),
          startTime,
          endTime: calculatedEndTime,
          price: Number(selectedService.price),
          notes: notes || undefined,
        }
      );

      setAppointments((currentAppointments) =>
        sortAppointmentsByTime([response.data, ...currentAppointments])
      );

      setMessage("Agendamento criado com sucesso.");
      setNotes("");
    } catch (error) {
      setError(
        getApiErrorMessage(error, "Não foi possível criar o agendamento.")
      );
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

      const updatedAppointment = response.data;

      setAppointments((currentAppointments) => {
        const selectedDateOnly = selectedDate;
        const appointmentDateOnly = getDateOnly(updatedAppointment.date);

        if (appointmentDateOnly !== selectedDateOnly) {
          return currentAppointments;
        }

        const appointmentAlreadyExists = currentAppointments.some(
          (appointment) => appointment.id === appointmentId
        );

        if (!appointmentAlreadyExists) {
          return sortAppointmentsByTime([
            updatedAppointment,
            ...currentAppointments,
          ]);
        }

        return sortAppointmentsByTime(
          currentAppointments.map((appointment) =>
            appointment.id === appointmentId ? updatedAppointment : appointment
          )
        );
      });

      setHistoryAppointments((currentHistoryAppointments) => {
        const withoutUpdatedAppointment = currentHistoryAppointments.filter(
          (appointment) => appointment.id !== appointmentId
        );

        if (!isHistoryStatus(updatedAppointment.status)) {
          return sortHistoryAppointments(withoutUpdatedAppointment);
        }

        return sortHistoryAppointments([
          updatedAppointment,
          ...withoutUpdatedAppointment,
        ]);
      });

      setMessage("Status do agendamento atualizado.");
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Não foi possível atualizar o status do agendamento."
        )
      );
    }
  }

  function renderAppointmentCard(
    appointment: AppointmentWithRelations,
    showDate = false
  ) {
    return (
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

              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                {appointmentStatusLabels[appointment.status]}
              </span>
            </div>

            {showDate && (
              <p className="mt-1 text-sm text-zinc-500">
                Data:{" "}
                <span className="font-medium text-zinc-900">
                  {formatDisplayDate(appointment.date)}
                </span>
              </p>
            )}

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

          <div className="flex min-w-52 flex-col gap-3">
            <label className="block">
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
                className="upp-input"
              >
                {appointmentStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {appointmentStatusLabels[status]}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleStatusChange(appointment.id, "CONFIRMED")}
              >
                Confirmar
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => handleStatusChange(appointment.id, "FINISHED")}
              >
                Finalizar
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => handleStatusChange(appointment.id, "CANCELED")}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-orange-500">Agenda</p>
        <h1 className="text-3xl font-bold text-zinc-950">Agendamentos</h1>
        <p className="mt-2 text-zinc-600">
          Crie atendimentos, acompanhe a agenda do dia e consulte o histórico
          geral do negócio.
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
                className="upp-input"
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
                className="upp-input"
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
                className="upp-input"
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
                className="upp-input"
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

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">
                Horário inicial
              </span>

              <select
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="upp-input"
                required
              >
                {timeOptions.length === 0 ? (
                  <option value="">Nenhum horário disponível</option>
                ) : (
                  timeOptions.map((option) => (
                    <option
                      key={option.time}
                      value={option.time}
                      disabled={option.disabled}
                    >
                      {option.disabled
                        ? `${option.time} - ${option.reason}`
                        : option.time}
                    </option>
                  ))
                )}
              </select>
            </label>

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
                  {selectedService
                    ? formatCurrency(selectedService.price)
                    : "R$ 0,00"}
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
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <Button
              type="submit"
              disabled={
                isSaving || !startTime || Boolean(selectedTimeOption?.disabled)
              }
              className="w-full"
            >
              {isSaving ? "Salvando..." : "Criar agendamento"}
            </Button>
          </form>

          {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </Card>

        <div className="space-y-6">
          <Card title="Agenda do dia">
            <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Horários do dia
                </p>
                <strong className="mt-2 block text-2xl text-zinc-950">
                  {daySummary.total}
                </strong>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Ativos
                </p>
                <strong className="mt-2 block text-2xl text-zinc-950">
                  {daySummary.active}
                </strong>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Finalizados no dia
                </p>
                <strong className="mt-2 block text-2xl text-zinc-950">
                  {daySummary.finished}
                </strong>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Cancelados no dia
                </p>
                <strong className="mt-2 block text-2xl text-zinc-950">
                  {daySummary.canceled}
                </strong>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-zinc-950">
                    Horários agendados no dia
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Aqui aparecem somente os horários reais marcados na data
                    selecionada.
                  </p>
                </div>

                <strong className="text-sm text-zinc-700">
                  Faturamento estimado do dia:{" "}
                  <span className="text-zinc-950">
                    {formatCurrency(daySummary.estimatedRevenue)}
                  </span>
                </strong>
              </div>

              {appointments.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">
                  Nenhum horário agendado para este dia.
                </p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {appointments.map((appointment) => (
                    <span
                      key={appointment.id}
                      className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
                    >
                      {appointment.startTime} até {appointment.endTime} •{" "}
                      {appointment.client.name} •{" "}
                      {appointmentStatusLabels[appointment.status]}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-zinc-950">
                Atendimentos ativos do dia
              </h2>

              {activeDayAppointments.length === 0 ? (
                <p className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
                  Nenhum atendimento ativo para este dia.
                </p>
              ) : (
                <div className="space-y-3">
                  {activeDayAppointments.map((appointment) =>
                    renderAppointmentCard(appointment)
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card title="Histórico geral">
            <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Total histórico
                </p>
                <strong className="mt-2 block text-2xl text-zinc-950">
                  {historySummary.total}
                </strong>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Finalizados
                </p>
                <strong className="mt-2 block text-2xl text-zinc-950">
                  {historySummary.finished}
                </strong>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Cancelados / faltas
                </p>
                <strong className="mt-2 block text-2xl text-zinc-950">
                  {historySummary.canceled}
                </strong>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Receita realizada
                </p>
                <strong className="mt-2 block text-2xl text-zinc-950">
                  {formatCurrency(historySummary.revenue)}
                </strong>
              </div>
            </div>

            <div className="mb-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <h2 className="text-base font-semibold text-zinc-950">
                Histórico do negócio
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Lista geral de atendimentos finalizados, cancelados e marcados
                como não compareceu, independente da data selecionada na agenda.
              </p>
            </div>

            {historyAppointments.length === 0 ? (
              <p className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
                Nenhum atendimento no histórico geral ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {historyAppointments.map((appointment) =>
                  renderAppointmentCard(appointment, true)
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}