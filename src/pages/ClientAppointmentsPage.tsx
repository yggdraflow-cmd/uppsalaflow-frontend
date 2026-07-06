import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  MessageCircle,
  PlusCircle,
  Scissors,
  UserRound,
} from "lucide-react";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { api } from "../services/api";

type AppointmentProposalStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELED";

type AppointmentMessageSender = "OWNER" | "CLIENT";

type AppointmentProposal = {
  id: string;
  suggestedDate: string;
  suggestedStartTime: string;
  suggestedEndTime: string;
  message?: string | null;
  status: AppointmentProposalStatus;
  createdAt: string;
  updatedAt: string;
};

type AppointmentMessage = {
  id: string;
  sender: AppointmentMessageSender;
  message: string;
  createdAt: string;
};

type ClientAppointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  price: string;
  notes?: string | null;
  proposals?: AppointmentProposal[];
  messages?: AppointmentMessage[];
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

const proposalStatusLabels: Record<AppointmentProposalStatus, string> = {
  PENDING: "Aguardando sua resposta",
  ACCEPTED: "Aceita",
  DECLINED: "Recusada",
  CANCELED: "Cancelada",
};

function getDateOnly(date: string) {
  return date.split("T")[0];
}

function formatDate(date: string) {
  return new Date(`${getDateOnly(date)}T00:00:00`).toLocaleDateString("pt-BR");
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
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

export function ClientAppointmentsPage() {
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>(
    {}
  );

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

  useEffect(() => {
    loadAppointments();
  }, []);

  function updateAppointment(updatedAppointment: ClientAppointment) {
    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === updatedAppointment.id ? updatedAppointment : appointment
      )
    );
  }

  async function handleRespondProposal(
    appointment: ClientAppointment,
    proposal: AppointmentProposal,
    status: "ACCEPTED" | "DECLINED"
  ) {
    try {
      setIsResponding(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await api.patch<ClientAppointment>(
        `/client/appointments/${appointment.id}/proposals/${proposal.id}/respond`,
        {
          status,
          message: responseDrafts[proposal.id] || undefined,
        }
      );

      updateAppointment(response.data);

      setResponseDrafts((currentDrafts) => ({
        ...currentDrafts,
        [proposal.id]: "",
      }));

      setSuccessMessage(
        status === "ACCEPTED"
          ? "Novo horário aceito. Seu agendamento foi confirmado."
          : "Sugestão recusada. O salão recebeu sua resposta."
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Não foi possível responder essa sugestão.")
      );
    } finally {
      setIsResponding(false);
    }
  }

  async function handleSendMessage(appointment: ClientAppointment) {
    const message = messageDrafts[appointment.id]?.trim();

    if (!message) {
      setErrorMessage("Digite uma mensagem antes de enviar.");
      return;
    }

    try {
      setIsResponding(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await api.post<ClientAppointment>(
        `/client/appointments/${appointment.id}/messages`,
        {
          message,
        }
      );

      updateAppointment(response.data);

      setMessageDrafts((currentDrafts) => ({
        ...currentDrafts,
        [appointment.id]: "",
      }));

      setSuccessMessage("Mensagem enviada ao salão.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Não foi possível enviar a mensagem."));
    } finally {
      setIsResponding(false);
    }
  }

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
          Veja seus horários marcados, serviços escolhidos, status dos
          atendimentos e mensagens do salão.
        </p>
      </div>

      {successMessage ? (
        <p className="mb-5 rounded-3xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-sm font-bold text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mb-5 rounded-3xl border border-red-200 bg-red-50/80 px-5 py-4 text-sm font-bold text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <Card>
          <p className="text-sm font-bold text-[#667789]">
            Carregando seus agendamentos...
          </p>
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

      {!isLoading && appointments.length > 0 ? (
        <div className="grid gap-5">
          {appointments.map((appointment) => {
            const proposals = appointment.proposals ?? [];
            const messages = appointment.messages ?? [];
            const pendingProposal = proposals.find(
              (proposal) => proposal.status === "PENDING"
            );

            return (
              <Card key={appointment.id}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                        {statusLabels[appointment.status] ?? appointment.status}
                      </span>

                      <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-black text-[#506173]">
                        {formatCurrency(appointment.price)}
                      </span>

                      {pendingProposal ? (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                          Nova sugestão do salão
                        </span>
                      ) : null}
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

                    {proposals.length > 0 ? (
                      <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50/80 p-5">
                        <h3 className="text-lg font-black text-blue-950">
                          Sugestões de horário
                        </h3>

                        <div className="mt-4 space-y-4">
                          {proposals.map((proposal) => (
                            <div
                              key={proposal.id}
                              className="rounded-2xl bg-white/80 p-4 text-sm text-blue-950 ring-1 ring-blue-100"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <strong>
                                  {formatDate(proposal.suggestedDate)} ·{" "}
                                  {proposal.suggestedStartTime} até{" "}
                                  {proposal.suggestedEndTime}
                                </strong>

                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                                  {proposalStatusLabels[proposal.status]}
                                </span>
                              </div>

                              {proposal.message ? (
                                <p className="mt-3 leading-6 text-blue-800">
                                  {proposal.message}
                                </p>
                              ) : null}

                              {proposal.status === "PENDING" ? (
                                <div className="mt-4">
                                  <textarea
                                    value={responseDrafts[proposal.id] ?? ""}
                                    onChange={(event) =>
                                      setResponseDrafts((currentDrafts) => ({
                                        ...currentDrafts,
                                        [proposal.id]: event.target.value,
                                      }))
                                    }
                                    rows={3}
                                    placeholder="Responder com uma observação opcional..."
                                    className="w-full resize-none rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                  />

                                  <div className="mt-3 flex flex-wrap gap-3">
                                    <Button
                                      type="button"
                                      disabled={isResponding}
                                      onClick={() =>
                                        handleRespondProposal(
                                          appointment,
                                          proposal,
                                          "ACCEPTED"
                                        )
                                      }
                                    >
                                      Aceitar sugestão
                                    </Button>

                                    <Button
                                      type="button"
                                      variant="secondary"
                                      disabled={isResponding}
                                      onClick={() =>
                                        handleRespondProposal(
                                          appointment,
                                          proposal,
                                          "DECLINED"
                                        )
                                      }
                                    >
                                      Recusar
                                    </Button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-5 rounded-3xl border border-zinc-200 bg-white/70 p-5">
                      <div className="flex items-center gap-2">
                        <MessageCircle size={20} className="text-orange-500" />
                        <h3 className="text-lg font-black text-[#101828]">
                          Conversa com o salão
                        </h3>
                      </div>

                      {messages.length === 0 ? (
                        <p className="mt-3 text-sm font-semibold text-[#667789]">
                          Nenhuma mensagem ainda.
                        </p>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {messages.map((appointmentMessage) => (
                            <div
                              key={appointmentMessage.id}
                              className={[
                                "rounded-2xl px-4 py-3 text-sm ring-1",
                                appointmentMessage.sender === "CLIENT"
                                  ? "bg-orange-50 text-orange-900 ring-orange-100"
                                  : "bg-zinc-50 text-zinc-700 ring-zinc-200",
                              ].join(" ")}
                            >
                              <strong className="block text-xs uppercase tracking-wide">
                                {appointmentMessage.sender === "CLIENT"
                                  ? "Você"
                                  : "Salão"}
                              </strong>

                              <span>{appointmentMessage.message}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <textarea
                        value={messageDrafts[appointment.id] ?? ""}
                        onChange={(event) =>
                          setMessageDrafts((currentDrafts) => ({
                            ...currentDrafts,
                            [appointment.id]: event.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Digite uma mensagem para o salão..."
                        className="mt-4 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />

                      <Button
                        type="button"
                        className="mt-3"
                        disabled={isResponding}
                        onClick={() => handleSendMessage(appointment)}
                      >
                        Enviar mensagem
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
