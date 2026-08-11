import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  RefreshCw,
  Scissors,
  Send,
  Star,
  UserRound,
  X,
} from "lucide-react";

import { api } from "../services/api";

type AppointmentProposalStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELED";

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

type AppointmentReview = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
};


type ClientAppointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  displayStatus?: string;
  price: string;
  notes?: string | null;
  proposals?: AppointmentProposal[];
  messages?: AppointmentMessage[];
  review?: AppointmentReview | null;
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
  PENDING_UPDATE: "Pendente de atualização",
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
  return new Date(`${getDateOnly(date)}T00:00:00`).toLocaleDateString(
    "pt-BR"
  );
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

function getStatusClasses(status: string) {
  if (status === "CONFIRMED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "IN_PROGRESS") {
    return "border-[#12B8D6]/30 bg-[#12B8D6]/10 text-[#087F95]";
  }

  if (status === "FINISHED") {
    return "border-[#dfe5e9] bg-[#F7F7F5] text-[#475569]";
  }

  if (status === "CANCELED" || status === "NO_SHOW") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "PENDING_UPDATE") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-[#12B8D6]/25 bg-[#12B8D6]/8 text-[#087F95]";
}

function getProposalClasses(status: AppointmentProposalStatus) {
  if (status === "ACCEPTED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "DECLINED" || status === "CANCELED") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-[#12B8D6]/30 bg-[#12B8D6]/10 text-[#087F95]";
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

  const [reviewDrafts, setReviewDrafts] = useState<
    Record<string, { rating: number; comment: string }>
  >({});

  const [reviewingAppointmentId, setReviewingAppointmentId] =
    useState<string | null>(null);

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
        appointment.id === updatedAppointment.id
          ? updatedAppointment
          : appointment
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
          : `Sugestão recusada. ${appointment.business.name} recebeu sua resposta.`
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Não foi possível responder essa sugestão."
        )
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

      setSuccessMessage(
        `Mensagem enviada para ${appointment.business.name}.`
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Não foi possível enviar a mensagem.")
      );
    } finally {
      setIsResponding(false);
    }
  }

  async function handleSubmitReview(appointment: ClientAppointment) {
    const draft = reviewDrafts[appointment.id] ?? {
      rating: 0,
      comment: "",
    };

    if (draft.rating < 1 || draft.rating > 5) {
      setErrorMessage("Escolha uma nota de 1 a 5 estrelas.");
      return;
    }

    try {
      setReviewingAppointmentId(appointment.id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await api.post<AppointmentReview>(
        `/client/appointments/${appointment.id}/review`,
        {
          rating: draft.rating,
          comment: draft.comment.trim() || undefined,
        }
      );

      setAppointments((currentAppointments) =>
        currentAppointments.map((currentAppointment) =>
          currentAppointment.id === appointment.id
            ? {
                ...currentAppointment,
                review: response.data,
              }
            : currentAppointment
        )
      );

      setReviewDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts };
        delete nextDrafts[appointment.id];
        return nextDrafts;
      });

      setSuccessMessage(
        `Sua avaliação de ${appointment.business.name} foi registrada.`
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Não foi possível registrar sua avaliação.")
      );
    } finally {
      setReviewingAppointmentId(null);
    }
  }

  const pendingProposalCount = useMemo(
    () =>
      appointments.reduce(
        (total, appointment) =>
          total +
          (appointment.proposals ?? []).filter(
            (proposal) => proposal.status === "PENDING"
          ).length,
        0
      ),
    [appointments]
  );

  const activeCount = useMemo(
    () =>
      appointments.filter((appointment) => {
        const status = appointment.displayStatus ?? appointment.status;

        return ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"].includes(status);
      }).length,
    [appointments]
  );

  return (
    <div className="space-y-7">
      <section className="grid gap-px overflow-hidden border border-[#dfe5e9] bg-[#dfe5e9] sm:grid-cols-3">
        <div className="bg-white p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#94A3B8]">
            Total
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-[#081120]">
            {appointments.length}
          </p>

          <p className="mt-1 text-xs font-bold text-[#64748B]">
            Agendamentos registrados
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#087F95]">
            Ativos
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-[#081120]">
            {activeCount}
          </p>

          <p className="mt-1 text-xs font-bold text-[#64748B]">
            Próximos ou em andamento
          </p>
        </div>

        <div className="bg-[#081120] p-5 text-white sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5BD7EB]">
            Aguardando você
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight">
            {pendingProposalCount}
          </p>

          <p className="mt-1 text-xs font-bold text-white/45">
            Sugestões de horário pendentes
          </p>
        </div>
      </section>

      {successMessage ? (
        <div className="flex items-start gap-3 border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
          <Check size={19} className="mt-0.5 shrink-0" />
          <p>{successMessage}</p>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="flex items-start gap-3 border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          <X size={19} className="mt-0.5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {isLoading ? (
        <div className="border border-[#dfe5e9] bg-white p-8">
          <div className="flex items-center gap-3">
            <RefreshCw
              size={20}
              className="animate-spin text-[#087F95]"
            />

            <p className="text-sm font-bold text-[#64748B]">
              Carregando seus agendamentos...
            </p>
          </div>
        </div>
      ) : null}

      {!isLoading && !errorMessage && appointments.length === 0 ? (
        <div className="border border-[#dfe5e9] bg-white p-8 text-center shadow-[0_16px_45px_rgba(8,17,32,0.04)]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center border border-[#12B8D6]/25 bg-[#12B8D6]/8 text-[#087F95]">
            <CalendarDays size={27} />
          </span>

          <h2 className="mt-5 text-2xl font-black tracking-tight text-[#081120]">
            Nenhum agendamento encontrado
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-[#64748B]">
            Quando você marcar um horário em uma página pública de
            agendamento, ele aparecerá aqui.
          </p>

          <div className="mx-auto mt-6 max-w-2xl border border-[#dfe5e9] bg-[#F7F7F5] px-5 py-4 text-sm font-bold leading-6 text-[#64748B]">
            Para marcar um horário, acesse o link público enviado pela
            clínica, estúdio, barbearia ou profissional.
          </div>
        </div>
      ) : null}

      {!isLoading && appointments.length > 0 ? (
        <div className="space-y-6">
          {appointments.map((appointment) => {
            const proposals = appointment.proposals ?? [];
            const messages = appointment.messages ?? [];

            const pendingProposal = proposals.find(
              (proposal) => proposal.status === "PENDING"
            );

            const displayStatus =
              appointment.displayStatus ?? appointment.status;

            const isPendingUpdate = displayStatus === "PENDING_UPDATE";

            return (
              <article
                key={appointment.id}
                className="overflow-hidden border border-[#dfe5e9] bg-white shadow-[0_18px_50px_rgba(8,17,32,0.05)]"
              >
                <div className="flex flex-col gap-4 border-b border-[#dfe5e9] bg-[#F7F7F5] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "border px-3 py-1.5 text-xs font-black",
                          getStatusClasses(displayStatus),
                        ].join(" ")}
                      >
                        {statusLabels[displayStatus] ?? displayStatus}
                      </span>

                      {pendingProposal ? (
                        <span className="border border-[#12B8D6]/30 bg-[#12B8D6]/10 px-3 py-1.5 text-xs font-black text-[#087F95]">
                          Nova sugestão de horário
                        </span>
                      ) : null}
                    </div>

                    <h2 className="mt-3 truncate text-xl font-black tracking-tight text-[#081120] sm:text-2xl">
                      {appointment.business.name}
                    </h2>
                  </div>

                  <div className="shrink-0 sm:text-right">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94A3B8]">
                      Valor
                    </p>

                    <p className="mt-1 text-xl font-black text-[#081120]">
                      {formatCurrency(appointment.price)}
                    </p>
                  </div>
                </div>

                <div className="grid min-w-0 xl:grid-cols-[minmax(0,0.85fr)_minmax(380px,1.15fr)]">
                  <div className="min-w-0 border-b border-[#dfe5e9] p-5 sm:p-6 xl:border-b-0 xl:border-r">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#087F95]">
                      Atendimento
                    </p>

                    <div className="mt-5 divide-y divide-[#e2e8f0] border-y border-[#e2e8f0]">
                      <div className="flex items-start gap-3 py-4">
                        <CalendarDays
                          size={19}
                          className="mt-0.5 shrink-0 text-[#087F95]"
                        />

                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                            Data
                          </p>

                          <p className="mt-1 text-sm font-black text-[#081120]">
                            {formatDate(appointment.date)} às{" "}
                            {appointment.startTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 py-4">
                        <Clock
                          size={19}
                          className="mt-0.5 shrink-0 text-[#087F95]"
                        />

                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                            Horário
                          </p>

                          <p className="mt-1 text-sm font-black text-[#081120]">
                            {appointment.startTime} até {appointment.endTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 py-4">
                        <Scissors
                          size={19}
                          className="mt-0.5 shrink-0 text-[#087F95]"
                        />

                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                            Serviço
                          </p>

                          <p className="mt-1 text-sm font-black text-[#081120]">
                            {appointment.service.name}
                          </p>

                          <p className="mt-1 text-xs font-bold text-[#64748B]">
                            {appointment.service.durationMinutes} min
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 py-4">
                        <UserRound
                          size={19}
                          className="mt-0.5 shrink-0 text-[#087F95]"
                        />

                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                            Profissional
                          </p>

                          <p className="mt-1 text-sm font-black text-[#081120]">
                            {appointment.professional.name}
                          </p>
                        </div>
                      </div>

                      {appointment.business.address ? (
                        <div className="flex items-start gap-3 py-4">
                          <MapPin
                            size={19}
                            className="mt-0.5 shrink-0 text-[#087F95]"
                          />

                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                              Local
                            </p>

                            <p className="mt-1 text-sm font-black leading-6 text-[#081120]">
                              {appointment.business.address}
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {isPendingUpdate ? (
                      <div className="mt-5 border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-800">
                        Este atendimento já terminou e aguarda atualização da
                        empresa.
                      </div>
                    ) : null}

                    {appointment.notes ? (
                      <div className="mt-5 border border-[#dfe5e9] bg-[#F7F7F5] p-4">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94A3B8]">
                          Observações
                        </p>

                        <p className="mt-2 text-sm font-semibold leading-6 text-[#64748B]">
                          {appointment.notes}
                        </p>
                      </div>
                    ) : null}

                    {displayStatus === "FINISHED" ? (
                      <section className="mt-5 border border-[#dfe5e9] bg-white">
                        <div className="border-b border-[#dfe5e9] bg-[#F7F7F5] p-4">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#087F95]">
                            Avaliação
                          </p>

                          <h3 className="mt-1 text-lg font-black text-[#081120]">
                            {appointment.review
                              ? "Sua avaliação"
                              : "Avalie seu atendimento"}
                          </h3>
                        </div>

                        {appointment.review ? (
                          <div className="p-4">
                            <div
                              className="flex items-center gap-1"
                              aria-label={`Avaliação ${appointment.review.rating} de 5`}
                            >
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={22}
                                  className={
                                    star <= appointment.review!.rating
                                      ? "fill-[#12B8D6] text-[#12B8D6]"
                                      : "text-[#cbd5e1]"
                                  }
                                />
                              ))}
                            </div>

                            <p className="mt-3 text-sm font-black text-[#081120]">
                              {appointment.review.rating} de 5 estrelas
                            </p>

                            {appointment.review.comment ? (
                              <p className="mt-3 border-l-2 border-[#12B8D6] pl-4 text-sm font-semibold leading-6 text-[#64748B]">
                                {appointment.review.comment}
                              </p>
                            ) : (
                              <p className="mt-2 text-xs font-bold text-[#94A3B8]">
                                Avaliação enviada sem comentário.
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="p-4">
                            <p className="text-sm font-semibold leading-6 text-[#64748B]">
                              Como foi seu atendimento em{" "}
                              <strong className="text-[#081120]">
                                {appointment.business.name}
                              </strong>
                              ?
                            </p>

                            <div className="mt-4 flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const selectedRating =
                                  reviewDrafts[appointment.id]?.rating ?? 0;

                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() =>
                                      setReviewDrafts((currentDrafts) => ({
                                        ...currentDrafts,
                                        [appointment.id]: {
                                          rating: star,
                                          comment:
                                            currentDrafts[appointment.id]
                                              ?.comment ?? "",
                                        },
                                      }))
                                    }
                                    className="p-1 transition hover:scale-110"
                                    aria-label={`${star} ${
                                      star === 1 ? "estrela" : "estrelas"
                                    }`}
                                  >
                                    <Star
                                      size={28}
                                      className={
                                        star <= selectedRating
                                          ? "fill-[#12B8D6] text-[#12B8D6]"
                                          : "text-[#cbd5e1] transition hover:text-[#5BD7EB]"
                                      }
                                    />
                                  </button>
                                );
                              })}
                            </div>

                            <p className="mt-2 text-xs font-bold text-[#64748B]">
                              {reviewDrafts[appointment.id]?.rating
                                ? `${reviewDrafts[appointment.id].rating} de 5 estrelas`
                                : "Selecione de 1 a 5 estrelas"}
                            </p>

                            <textarea
                              value={
                                reviewDrafts[appointment.id]?.comment ?? ""
                              }
                              onChange={(event) =>
                                setReviewDrafts((currentDrafts) => ({
                                  ...currentDrafts,
                                  [appointment.id]: {
                                    rating:
                                      currentDrafts[appointment.id]?.rating ??
                                      0,
                                    comment: event.target.value,
                                  },
                                }))
                              }
                              rows={3}
                              maxLength={1000}
                              placeholder="Conte como foi sua experiência. Comentário opcional."
                              className="mt-4 w-full resize-none border border-[#dfe5e9] bg-[#F7F7F5] px-4 py-3 text-sm font-semibold text-[#081120] outline-none transition placeholder:text-[#94A3B8] focus:border-[#12B8D6] focus:bg-white focus:shadow-[0_0_0_3px_rgba(18,184,214,0.08)]"
                            />

                            <button
                              type="button"
                              disabled={
                                reviewingAppointmentId === appointment.id ||
                                !reviewDrafts[appointment.id]?.rating
                              }
                              onClick={() =>
                                handleSubmitReview(appointment)
                              }
                              className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 border border-[#12B8D6] bg-[#12B8D6] px-5 py-3 text-sm font-black text-[#081120] transition hover:bg-[#5BD7EB] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Star size={17} />
                              {reviewingAppointmentId === appointment.id
                                ? "Enviando..."
                                : "Enviar avaliação"}
                            </button>
                          </div>
                        )}
                      </section>
                    ) : null}
                  </div>

                  <div className="min-w-0 bg-[#fbfcfc] p-5 sm:p-6">
                    {proposals.length > 0 ? (
                      <section className="mb-6 border border-[#12B8D6]/20 bg-white">
                        <div className="border-b border-[#dfe5e9] px-5 py-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#087F95]">
                            Ajuste de horário
                          </p>

                          <h3 className="mt-1 text-lg font-black text-[#081120]">
                            Sugestões da empresa
                          </h3>
                        </div>

                        <div className="divide-y divide-[#e2e8f0]">
                          {proposals.map((proposal) => (
                            <div key={proposal.id} className="p-5">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-black text-[#081120]">
                                    {formatDate(proposal.suggestedDate)}
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-[#64748B]">
                                    {proposal.suggestedStartTime} até{" "}
                                    {proposal.suggestedEndTime}
                                  </p>
                                </div>

                                <span
                                  className={[
                                    "border px-3 py-1.5 text-xs font-black",
                                    getProposalClasses(proposal.status),
                                  ].join(" ")}
                                >
                                  {proposalStatusLabels[proposal.status]}
                                </span>
                              </div>

                              {proposal.message ? (
                                <p className="mt-4 border-l-2 border-[#12B8D6] pl-4 text-sm font-semibold leading-6 text-[#64748B]">
                                  {proposal.message}
                                </p>
                              ) : null}

                              {proposal.status === "PENDING" ? (
                                <div className="mt-5">
                                  <textarea
                                    value={
                                      responseDrafts[proposal.id] ?? ""
                                    }
                                    onChange={(event) =>
                                      setResponseDrafts(
                                        (currentDrafts) => ({
                                          ...currentDrafts,
                                          [proposal.id]:
                                            event.target.value,
                                        })
                                      )
                                    }
                                    rows={3}
                                    placeholder="Observação opcional para sua resposta..."
                                    className="w-full resize-none border border-[#dfe5e9] bg-[#F7F7F5] px-4 py-3 text-sm font-semibold text-[#081120] outline-none transition placeholder:text-[#94A3B8] focus:border-[#12B8D6] focus:bg-white focus:shadow-[0_0_0_3px_rgba(18,184,214,0.08)]"
                                  />

                                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                    <button
                                      type="button"
                                      disabled={isResponding}
                                      onClick={() =>
                                        handleRespondProposal(
                                          appointment,
                                          proposal,
                                          "ACCEPTED"
                                        )
                                      }
                                      className="inline-flex items-center justify-center gap-2 border border-[#12B8D6] bg-[#12B8D6] px-4 py-3 text-sm font-black text-[#081120] transition hover:bg-[#5BD7EB] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <Check size={17} />
                                      Aceitar sugestão
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isResponding}
                                      onClick={() =>
                                        handleRespondProposal(
                                          appointment,
                                          proposal,
                                          "DECLINED"
                                        )
                                      }
                                      className="inline-flex items-center justify-center gap-2 border border-[#dfe5e9] bg-white px-4 py-3 text-sm font-black text-[#64748B] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <X size={17} />
                                      Recusar
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </section>
                    ) : null}

                    <section className="border border-[#dfe5e9] bg-white">
                      <div className="flex items-start gap-3 border-b border-[#dfe5e9] px-5 py-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#12B8D6]/25 bg-[#12B8D6]/8 text-[#087F95]">
                          <MessageCircle size={19} />
                        </span>

                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#087F95]">
                            Mensagens
                          </p>

                          <h3 className="mt-1 truncate text-base font-black text-[#081120]">
                            Conversa com {appointment.business.name}
                          </h3>
                        </div>
                      </div>

                      <div className="p-5">
                        {messages.length === 0 ? (
                          <div className="border border-dashed border-[#dfe5e9] bg-[#F7F7F5] px-4 py-5 text-center">
                            <p className="text-sm font-semibold text-[#64748B]">
                              Nenhuma mensagem ainda.
                            </p>
                          </div>
                        ) : (
                          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                            {messages.map((appointmentMessage) => (
                              <div
                                key={appointmentMessage.id}
                                className={[
                                  "max-w-[90%] border px-4 py-3 text-sm",
                                  appointmentMessage.sender === "CLIENT"
                                    ? "ml-auto border-[#12B8D6]/25 bg-[#12B8D6]/8 text-[#081120]"
                                    : "mr-auto border-[#dfe5e9] bg-[#F7F7F5] text-[#475569]",
                                ].join(" ")}
                              >
                                <strong className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#087F95]">
                                  {appointmentMessage.sender === "CLIENT"
                                    ? "Você"
                                    : appointment.business.name}
                                </strong>

                                <span className="font-semibold leading-6">
                                  {appointmentMessage.message}
                                </span>
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
                          placeholder={`Digite uma mensagem para ${appointment.business.name}...`}
                          className="mt-4 w-full resize-none border border-[#dfe5e9] bg-[#F7F7F5] px-4 py-3 text-sm font-semibold text-[#081120] outline-none transition placeholder:text-[#94A3B8] focus:border-[#12B8D6] focus:bg-white focus:shadow-[0_0_0_3px_rgba(18,184,214,0.08)]"
                        />

                        <button
                          type="button"
                          disabled={isResponding}
                          onClick={() =>
                            handleSendMessage(appointment)
                          }
                          className="mt-3 inline-flex items-center justify-center gap-2 border border-[#081120] bg-[#081120] px-5 py-3 text-sm font-black text-white transition hover:border-[#087F95] hover:bg-[#087F95] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Send size={17} />
                          Enviar mensagem
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
