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
import { getBusinessTheme } from "../utils/businessTheme";

type AppointmentProposalStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELED";

type AppointmentMessageSender = "OWNER" | "CLIENT";

type AppointmentProposal = {
  id: string;
  suggestedDate: string | Date;
  suggestedStartTime: string;
  suggestedEndTime: string;
  message?: string | null;
  status: AppointmentProposalStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type AppointmentMessage = {
  id: string;
  sender: AppointmentMessageSender;
  message: string;
  createdAt: string | Date;
};

type AppointmentWithRelations = Appointment & {
  client: Client;
  professional: Professional;
  service: BeautyService;
  proposals?: AppointmentProposal[];
  messages?: AppointmentMessage[];
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

const proposalStatusLabels: Record<AppointmentProposalStatus, string> = {
  PENDING: "Aguardando cliente",
  ACCEPTED: "Aceita",
  DECLINED: "Recusada",
  CANCELED: "Cancelada",
};

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

function getAppointmentsCopy(business?: Business) {
  const theme = getBusinessTheme(business?.segment, business?.specialty);

  if (business?.segment === "ODONTOLOGY") {
    return {
      theme,
      eyebrow: "Agenda do consultório",
      title: "Consultas",
      description: "Crie consultas, acompanhe a agenda do dia e consulte o histórico geral do consultório.",
      businessCardTitle: "Consultório selecionado",
      businessSelectLabel: "Escolha o consultório",
      emptyBusiness: "Nenhum consultório cadastrado. Cadastre um consultório primeiro.",
      dateCardTitle: "Dia da agenda",
      createTitle: "Criar consulta",
      customerLabel: "Paciente",
      customerSingular: "Paciente",
      emptyCustomer: "Nenhum paciente cadastrado",
      serviceLabel: "Procedimento",
      serviceSingularLabel: "Procedimento",
      emptyService: "Nenhum procedimento cadastrado",
      professionalLabel: "Profissional",
      emptyProfessional: "Nenhum profissional cadastrado",
      notesPlaceholder: "Observações da consulta...",
      submitLabel: "Criar consulta",
      createdMessage: "Consulta criada com sucesso.",
      pendingTitle: "Pendências de confirmação",
      pendingHeader: "Pacientes aguardando confirmação",
      pendingDescription: "Aqui aparecem todas as consultas solicitadas pelos pacientes, independente da data selecionada.",
      pendingTotalLabel: "Total pendente",
      emptyPending: "Nenhum paciente aguardando confirmação no momento.",
      dayTitle: "Agenda do dia",
      dayTotalLabel: "Consultas do dia",
      activeLabel: "Ativas",
      bookedHeader: "Consultas agendadas no dia",
      bookedDescription: "Aqui aparecem somente as consultas reais marcadas na data selecionada.",
      emptyBooked: "Nenhuma consulta agendada para este dia.",
      activeDayTitle: "Consultas ativas do dia",
      emptyActive: "Nenhuma consulta ativa para este dia.",
      historyTitle: "Histórico geral",
      historyBusinessTitle: "Histórico do consultório",
      historyDescription: "Lista geral de consultas finalizadas, canceladas e marcadas como não compareceu, independente da data selecionada.",
      emptyHistory: "Nenhuma consulta no histórico geral ainda.",
      conversationTitle: "Conversa com o paciente",
      businessSenderLabel: "Consultório",
      messageToCustomerLabel: "Mensagem para o paciente",
      sendMessagePlaceholder: "Digite uma mensagem para o paciente...",
      createMissingDataError: "Cadastre paciente, procedimento e profissional antes de criar consultas.",
      createBusinessError: "Cadastre um consultório antes de criar consultas.",
      createFailedError: "Não foi possível criar a consulta.",
      statusUpdatedMessage: "Status da consulta atualizado.",
    };
  }

  if (business?.segment === "VETERINARY") {
    return {
      theme,
      eyebrow: "Agenda da clínica",
      title: "Atendimentos",
      description: "Crie atendimentos, acompanhe a agenda do dia e consulte o histórico geral da clínica veterinária.",
      businessCardTitle: "Clínica selecionada",
      businessSelectLabel: "Escolha a clínica",
      emptyBusiness: "Nenhuma clínica cadastrada. Cadastre uma clínica primeiro.",
      dateCardTitle: "Dia da agenda",
      createTitle: "Criar atendimento",
      customerLabel: "Tutor",
      customerSingular: "Tutor",
      emptyCustomer: "Nenhum tutor cadastrado",
      serviceLabel: "Serviço",
      serviceSingularLabel: "Serviço",
      emptyService: "Nenhum serviço cadastrado",
      professionalLabel: "Profissional",
      emptyProfessional: "Nenhum profissional cadastrado",
      notesPlaceholder: "Observações do atendimento...",
      submitLabel: "Criar atendimento",
      createdMessage: "Atendimento criado com sucesso.",
      pendingTitle: "Pendências de confirmação",
      pendingHeader: "Tutores aguardando confirmação",
      pendingDescription: "Aqui aparecem todos os atendimentos solicitados pelos tutores, independente da data selecionada.",
      pendingTotalLabel: "Total pendente",
      emptyPending: "Nenhum tutor aguardando confirmação no momento.",
      dayTitle: "Agenda do dia",
      dayTotalLabel: "Atendimentos do dia",
      activeLabel: "Ativos",
      bookedHeader: "Atendimentos agendados no dia",
      bookedDescription: "Aqui aparecem somente os atendimentos reais marcados na data selecionada.",
      emptyBooked: "Nenhum atendimento agendado para este dia.",
      activeDayTitle: "Atendimentos ativos do dia",
      emptyActive: "Nenhum atendimento ativo para este dia.",
      historyTitle: "Histórico geral",
      historyBusinessTitle: "Histórico da clínica",
      historyDescription: "Lista geral de atendimentos finalizados, cancelados e marcados como não compareceu, independente da data selecionada.",
      emptyHistory: "Nenhum atendimento no histórico geral ainda.",
      conversationTitle: "Conversa com o tutor",
      businessSenderLabel: "Clínica",
      messageToCustomerLabel: "Mensagem para o tutor",
      sendMessagePlaceholder: "Digite uma mensagem para o tutor...",
      createMissingDataError: "Cadastre tutor, serviço e profissional antes de criar atendimentos.",
      createBusinessError: "Cadastre uma clínica antes de criar atendimentos.",
      createFailedError: "Não foi possível criar o atendimento.",
      statusUpdatedMessage: "Status do atendimento atualizado.",
    };
  }

  if (business?.segment === "BARBERSHOP") {
    return {
      theme,
      eyebrow: "Agenda da barbearia",
      title: "Horários",
      description: "Crie horários, acompanhe a agenda do dia e consulte o histórico geral da barbearia.",
      businessCardTitle: "Barbearia selecionada",
      businessSelectLabel: "Escolha a barbearia",
      emptyBusiness: "Nenhuma barbearia cadastrada. Cadastre uma barbearia primeiro.",
      dateCardTitle: "Dia da agenda",
      createTitle: "Criar horário",
      customerLabel: "Cliente",
      customerSingular: "Cliente",
      emptyCustomer: "Nenhum cliente cadastrado",
      serviceLabel: "Serviço",
      serviceSingularLabel: "Serviço",
      emptyService: "Nenhum serviço cadastrado",
      professionalLabel: "Barbeiro",
      emptyProfessional: "Nenhum barbeiro cadastrado",
      notesPlaceholder: "Observações do horário...",
      submitLabel: "Criar horário",
      createdMessage: "Horário criado com sucesso.",
      pendingTitle: "Pendências de confirmação",
      pendingHeader: "Clientes aguardando confirmação",
      pendingDescription: "Aqui aparecem todos os horários solicitados pelos clientes, independente da data selecionada.",
      pendingTotalLabel: "Total pendente",
      emptyPending: "Nenhum cliente aguardando confirmação no momento.",
      dayTitle: "Agenda do dia",
      dayTotalLabel: "Horários do dia",
      activeLabel: "Ativos",
      bookedHeader: "Horários agendados no dia",
      bookedDescription: "Aqui aparecem somente os horários reais marcados na data selecionada.",
      emptyBooked: "Nenhum horário agendado para este dia.",
      activeDayTitle: "Horários ativos do dia",
      emptyActive: "Nenhum horário ativo para este dia.",
      historyTitle: "Histórico geral",
      historyBusinessTitle: "Histórico da barbearia",
      historyDescription: "Lista geral de horários finalizados, cancelados e marcados como não compareceu, independente da data selecionada.",
      emptyHistory: "Nenhum horário no histórico geral ainda.",
      conversationTitle: "Conversa com o cliente",
      businessSenderLabel: "Barbearia",
      messageToCustomerLabel: "Mensagem para o cliente",
      sendMessagePlaceholder: "Digite uma mensagem para o cliente...",
      createMissingDataError: "Cadastre cliente, serviço e barbeiro antes de criar horários.",
      createBusinessError: "Cadastre uma barbearia antes de criar horários.",
      createFailedError: "Não foi possível criar o horário.",
      statusUpdatedMessage: "Status do horário atualizado.",
    };
  }

  if (business?.segment === "BEAUTY" && business.specialty === "NAILS") {
    return {
      theme,
      eyebrow: "Agenda do studio",
      title: "Horários do studio",
      description: "Crie horários, acompanhe a agenda do studio e consulte o histórico geral de serviços de unhas.",
      businessCardTitle: "Studio selecionado",
      businessSelectLabel: "Escolha o studio",
      emptyBusiness: "Nenhum studio cadastrado. Cadastre um studio primeiro.",
      dateCardTitle: "Dia da agenda",
      createTitle: "Criar horário",
      customerLabel: "Cliente",
      customerSingular: "Cliente",
      emptyCustomer: "Nenhuma cliente cadastrada",
      serviceLabel: "Serviço de unhas",
      serviceSingularLabel: "Serviço de unhas",
      emptyService: "Nenhum serviço de unhas cadastrado",
      professionalLabel: "Nail designer",
      emptyProfessional: "Nenhuma nail designer cadastrada",
      notesPlaceholder: "Observações do serviço de unhas...",
      submitLabel: "Criar horário",
      createdMessage: "Horário criado com sucesso.",
      pendingTitle: "Pendências de confirmação",
      pendingHeader: "Clientes aguardando confirmação",
      pendingDescription: "Aqui aparecem todos os horários solicitados pelas clientes, independente da data selecionada.",
      pendingTotalLabel: "Total pendente",
      emptyPending: "Nenhuma cliente aguardando confirmação no momento.",
      dayTitle: "Agenda do studio",
      dayTotalLabel: "Horários do dia",
      activeLabel: "Ativos",
      bookedHeader: "Horários agendados no dia",
      bookedDescription: "Aqui aparecem somente os horários reais marcados na data selecionada.",
      emptyBooked: "Nenhum horário agendado para este dia.",
      activeDayTitle: "Horários ativos do dia",
      emptyActive: "Nenhum horário ativo para este dia.",
      historyTitle: "Histórico geral",
      historyBusinessTitle: "Histórico do studio",
      historyDescription: "Lista geral de serviços finalizados, cancelados e marcados como não compareceu, independente da data selecionada.",
      emptyHistory: "Nenhum serviço no histórico geral ainda.",
      conversationTitle: "Conversa com a cliente",
      businessSenderLabel: "Studio",
      messageToCustomerLabel: "Mensagem para a cliente",
      sendMessagePlaceholder: "Digite uma mensagem para a cliente...",
      createMissingDataError: "Cadastre cliente, serviço de unhas e nail designer antes de criar horários.",
      createBusinessError: "Cadastre um studio antes de criar horários.",
      createFailedError: "Não foi possível criar o horário.",
      statusUpdatedMessage: "Status do horário atualizado.",
    };
  }

  return {
    theme,
    eyebrow: "Agenda",
    title: "Agendamentos",
    description: "Crie atendimentos, acompanhe a agenda do dia e consulte o histórico geral do negócio.",
    businessCardTitle: "Negócio selecionado",
    businessSelectLabel: "Escolha o negócio",
    emptyBusiness: "Nenhum negócio cadastrado. Cadastre um negócio primeiro.",
    dateCardTitle: "Dia da agenda",
    createTitle: "Criar agendamento",
    customerLabel: "Cliente",
    customerSingular: "Cliente",
    emptyCustomer: "Nenhum cliente cadastrado",
    serviceLabel: "Serviço",
    serviceSingularLabel: "Serviço",
    emptyService: "Nenhum serviço cadastrado",
    professionalLabel: "Profissional",
    emptyProfessional: "Nenhum profissional cadastrado",
    notesPlaceholder: "Observações do atendimento...",
    submitLabel: "Criar agendamento",
    createdMessage: "Agendamento criado com sucesso.",
    pendingTitle: "Pendências de confirmação",
    pendingHeader: "Clientes aguardando confirmação",
    pendingDescription: "Aqui aparecem todos os agendamentos solicitados pelos clientes, independente da data selecionada na agenda do dia.",
    pendingTotalLabel: "Total pendente",
    emptyPending: "Nenhum cliente aguardando confirmação no momento.",
    dayTitle: "Agenda do dia",
    dayTotalLabel: "Horários do dia",
    activeLabel: "Ativos",
    bookedHeader: "Horários agendados no dia",
    bookedDescription: "Aqui aparecem somente os horários reais marcados na data selecionada.",
    emptyBooked: "Nenhum horário agendado para este dia.",
    activeDayTitle: "Atendimentos ativos do dia",
    emptyActive: "Nenhum atendimento ativo para este dia.",
    historyTitle: "Histórico geral",
    historyBusinessTitle: "Histórico do negócio",
    historyDescription: "Lista geral de atendimentos finalizados, cancelados e marcados como não compareceu, independente da data selecionada na agenda.",
    emptyHistory: "Nenhum atendimento no histórico geral ainda.",
    conversationTitle: "Conversa com o cliente",
    businessSenderLabel: "Equipe",
    messageToCustomerLabel: "Mensagem para o cliente",
    sendMessagePlaceholder: "Digite uma mensagem para o cliente...",
    createMissingDataError: "Cadastre cliente, serviço e profissional antes de criar agendamentos.",
    createBusinessError: "Cadastre um negócio antes de criar agendamentos.",
    createFailedError: "Não foi possível criar o agendamento.",
    statusUpdatedMessage: "Status do agendamento atualizado.",
  };
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
  const [pendingAppointments, setPendingAppointments] = useState<
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

  const [proposalAppointmentId, setProposalAppointmentId] = useState("");
  const [proposalDate, setProposalDate] = useState(getTodayDate());
  const [proposalStartTime, setProposalStartTime] = useState("09:00");
  const [proposalMessage, setProposalMessage] = useState("");

  const [messageAppointmentId, setMessageAppointmentId] = useState("");
  const [ownerMessage, setOwnerMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  const appointmentCopy = getAppointmentsCopy(selectedBusiness);

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
        setPendingAppointments([]);
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
    async function loadPendingAppointments() {
      if (!selectedBusinessId) {
        setPendingAppointments([]);
        return;
      }

      try {
        setError("");

        const response = await api.get<AppointmentWithRelations[]>(
          "/appointments/pending",
          {
            params: {
              businessId: selectedBusinessId,
            },
          }
        );

        setPendingAppointments(sortHistoryAppointments(response.data));
      } catch (error) {
        setPendingAppointments([]);
        setError(
          getApiErrorMessage(
            error,
            "Não foi possível carregar as pendências de confirmação."
          )
        );
      }
    }

    loadPendingAppointments();
  }, [selectedBusinessId]);

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

  function syncAppointmentInLists(updatedAppointment: AppointmentWithRelations) {
    setAppointments((currentAppointments) => {
      const selectedDateOnly = selectedDate;
      const appointmentDateOnly = getDateOnly(updatedAppointment.date);

      if (appointmentDateOnly !== selectedDateOnly) {
        return currentAppointments.filter(
          (appointment) => appointment.id !== updatedAppointment.id
        );
      }

      const appointmentAlreadyExists = currentAppointments.some(
        (appointment) => appointment.id === updatedAppointment.id
      );

      if (!appointmentAlreadyExists && isHistoryStatus(updatedAppointment.status)) {
        return currentAppointments;
      }

      if (!appointmentAlreadyExists) {
        return sortAppointmentsByTime([
          updatedAppointment,
          ...currentAppointments,
        ]);
      }

      return sortAppointmentsByTime(
        currentAppointments.map((appointment) =>
          appointment.id === updatedAppointment.id
            ? updatedAppointment
            : appointment
        )
      );
    });

    setPendingAppointments((currentPendingAppointments) => {
      const withoutUpdatedAppointment = currentPendingAppointments.filter(
        (appointment) => appointment.id !== updatedAppointment.id
      );

      if (updatedAppointment.status !== "SCHEDULED") {
        return sortHistoryAppointments(withoutUpdatedAppointment);
      }

      return sortHistoryAppointments([
        updatedAppointment,
        ...withoutUpdatedAppointment,
      ]);
    });

    setHistoryAppointments((currentHistoryAppointments) => {
      const withoutUpdatedAppointment = currentHistoryAppointments.filter(
        (appointment) => appointment.id !== updatedAppointment.id
      );

      if (!isHistoryStatus(updatedAppointment.status)) {
        return sortHistoryAppointments(withoutUpdatedAppointment);
      }

      return sortHistoryAppointments([
        updatedAppointment,
        ...withoutUpdatedAppointment,
      ]);
    });
  }

  function openProposalForm(appointment: AppointmentWithRelations) {
    if (proposalAppointmentId === appointment.id) {
      setProposalAppointmentId("");
      return;
    }

    setProposalAppointmentId(appointment.id);
    setProposalDate(getDateOnly(appointment.date));
    setProposalStartTime(appointment.startTime);
    setProposalMessage(
      `Olá, ${appointment.client.name}. Esse horário não está disponível para confirmação. Posso te atender neste novo horário?`
    );
  }

  async function handleCreateProposal(appointment: AppointmentWithRelations) {
    if (!proposalDate || !proposalStartTime || !proposalMessage.trim()) {
      setError("Informe data, horário e mensagem para sugerir outro horário.");
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await api.post<AppointmentWithRelations>(
        `/appointments/${appointment.id}/proposals`,
        {
          date: new Date(`${proposalDate}T00:00:00`).toISOString(),
          startTime: proposalStartTime,
          message: proposalMessage.trim(),
        }
      );

      syncAppointmentInLists(response.data);

      setProposalAppointmentId("");
      setProposalMessage("");
      setMessage("Sugestão de novo horário enviada ao cliente.");
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Não foi possível enviar a sugestão de novo horário."
        )
      );
    }
  }

  function openMessageForm(appointment: AppointmentWithRelations) {
    if (messageAppointmentId === appointment.id) {
      setMessageAppointmentId("");
      return;
    }

    setMessageAppointmentId(appointment.id);
    setOwnerMessage("");
  }

  async function handleCreateOwnerMessage(appointment: AppointmentWithRelations) {
    if (!ownerMessage.trim()) {
      setError("Digite uma mensagem antes de enviar.");
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await api.post<AppointmentWithRelations>(
        `/appointments/${appointment.id}/messages`,
        {
          message: ownerMessage.trim(),
        }
      );

      syncAppointmentInLists(response.data);

      setMessageAppointmentId("");
      setOwnerMessage("");
      setMessage("Mensagem enviada ao cliente.");
    } catch (error) {
      setError(
        getApiErrorMessage(error, "Não foi possível enviar a mensagem.")
      );
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!selectedBusinessId) {
      setError(appointmentCopy.createBusinessError);
      return;
    }

    if (!selectedClientId || !selectedServiceId || !selectedProfessionalId) {
      setError(appointmentCopy.createMissingDataError);
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

      setPendingAppointments((currentPendingAppointments) =>
        sortHistoryAppointments([response.data, ...currentPendingAppointments])
      );

      setMessage(appointmentCopy.createdMessage);
      setNotes("");
    } catch (error) {
      setError(
        getApiErrorMessage(error, appointmentCopy.createFailedError)
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

      setPendingAppointments((currentPendingAppointments) => {
        const withoutUpdatedAppointment = currentPendingAppointments.filter(
          (appointment) => appointment.id !== appointmentId
        );

        if (updatedAppointment.status !== "SCHEDULED") {
          return sortHistoryAppointments(withoutUpdatedAppointment);
        }

        return sortHistoryAppointments([
          updatedAppointment,
          ...withoutUpdatedAppointment,
        ]);
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

      setMessage(appointmentCopy.statusUpdatedMessage);
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
    const proposals = appointment.proposals ?? [];
    const messages = appointment.messages ?? [];
    const pendingProposal = proposals.find(
      (proposal) => proposal.status === "PENDING"
    );

    return (
      <div
        key={appointment.id}
        className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
      >
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-zinc-950">
                {appointment.client.name}
              </h2>

              <span className="rounded-full bg-[#f3f3f3] px-3 py-1 text-xs font-semibold text-[#171717]">
                {appointmentStatusLabels[appointment.status]}
              </span>

              {pendingProposal ? (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Proposta enviada
                </span>
              ) : null}
            </div>

            {showDate && (
              <p className="mt-1 break-words text-sm text-zinc-500">
                Data:{" "}
                <span className="font-medium text-zinc-900">
                  {formatDisplayDate(appointment.date)}
                </span>
              </p>
            )}

            <p className="mt-1 break-words text-sm text-zinc-500">
              {appointmentCopy.serviceSingularLabel}:{" "}
              <span className="font-medium text-zinc-900">
                {appointment.service.name}
              </span>
            </p>

            <p className="mt-1 break-words text-sm text-zinc-500">
              {appointmentCopy.professionalLabel}: {appointment.professional.name}
            </p>

            <p className="mt-1 break-words text-sm text-zinc-500">
              Horário: {appointment.startTime} até {appointment.endTime}
            </p>

            <p className="mt-1 break-words text-sm text-zinc-500">
              Preço: {formatCurrency(appointment.price)}
            </p>

            {appointment.notes && (
              <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-zinc-600 ring-1 ring-zinc-200">
                {appointment.notes}
              </p>
            )}

            {proposals.length > 0 ? (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <h3 className="text-sm font-black text-blue-900">
                  Sugestões de horário
                </h3>

                <div className="mt-3 space-y-3">
                  {proposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="rounded-xl bg-white/80 p-3 text-sm text-blue-900 ring-1 ring-blue-100"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong>
                          {formatDisplayDate(proposal.suggestedDate)} ·{" "}
                          {proposal.suggestedStartTime} até{" "}
                          {proposal.suggestedEndTime}
                        </strong>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                          {proposalStatusLabels[proposal.status]}
                        </span>
                      </div>

                      {proposal.message ? (
                        <p className="mt-2 text-blue-800">{proposal.message}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.length > 0 ? (
              <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">
                <h3 className="text-sm font-black text-zinc-950">
                  {appointmentCopy.conversationTitle}
                </h3>

                <div className="mt-3 space-y-2">
                  {messages.map((appointmentMessage) => (
                    <div
                      key={appointmentMessage.id}
                      className={[
                        "rounded-xl px-3 py-2 text-sm ring-1",
                        appointmentMessage.sender === "OWNER"
                          ? "bg-[#f3f3f3] text-[#171717] ring-[#dedede]"
                          : "bg-zinc-50 text-zinc-700 ring-zinc-200",
                      ].join(" ")}
                    >
                      <strong className="block text-xs uppercase tracking-wide">
                        {appointmentMessage.sender === "OWNER"
                          ? appointmentCopy.businessSenderLabel
                          : appointmentCopy.customerSingular}
                      </strong>
                      <span>{appointmentMessage.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {proposalAppointmentId === appointment.id ? (
              <div className="mt-4 rounded-2xl border border-[#dedede] bg-[#f3f3f3] p-4">
                <h3 className="text-sm font-black text-[#171717]">
                  Sugerir outro horário
                </h3>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <Input
                    label="Nova data"
                    type="date"
                    value={proposalDate}
                    onChange={(event) => setProposalDate(event.target.value)}
                  />

                  <label className="block">
                    <span className="upp-label">Novo horário</span>

                    <select
                      value={proposalStartTime}
                      onChange={(event) =>
                        setProposalStartTime(event.target.value)
                      }
                      className="upp-input w-full"
                    >
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="mt-3 block">
                  <span className="mb-1 block text-sm font-medium text-zinc-700">
                    {appointmentCopy.messageToCustomerLabel}
                  </span>

                  <textarea
                    value={proposalMessage}
                    onChange={(event) => setProposalMessage(event.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#171717] focus:ring-2 focus:ring-[#dedede]"
                  />
                </label>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => handleCreateProposal(appointment)}
                  >
                    Enviar sugestão
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setProposalAppointmentId("")}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            ) : null}

            {messageAppointmentId === appointment.id ? (
              <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">
                <h3 className="text-sm font-black text-zinc-950">
                  Enviar mensagem
                </h3>

                <textarea
                  value={ownerMessage}
                  onChange={(event) => setOwnerMessage(event.target.value)}
                  rows={3}
                  placeholder={appointmentCopy.sendMessagePlaceholder}
                  className="mt-3 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#171717] focus:ring-2 focus:ring-[#dedede]"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => handleCreateOwnerMessage(appointment)}
                  >
                    Enviar mensagem
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setMessageAppointmentId("")}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-56 lg:shrink-0">
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
                className="upp-input w-full"
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
                onClick={() => openProposalForm(appointment)}
              >
                Sugerir outro horário
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => openMessageForm(appointment)}
              >
                Mensagem
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
        <p className="text-sm font-black text-[var(--yggdra-primary)]">{appointmentCopy.eyebrow}</p>
        <h1 className="text-3xl font-black text-zinc-950">{appointmentCopy.title}</h1>
        <p className="mt-2 max-w-3xl text-zinc-600">{appointmentCopy.description}</p>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <Card title={appointmentCopy.businessCardTitle}>
          {businesses.length === 0 ? (
            <p className="text-sm text-red-600">
              {appointmentCopy.emptyBusiness}
            </p>
          ) : (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">
                {appointmentCopy.businessSelectLabel}
              </span>

              <select
                value={selectedBusinessId}
                onChange={(event) => setSelectedBusinessId(event.target.value)}
                className="upp-input w-full"
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

        <Card title={appointmentCopy.dateCardTitle}>
          <Input
            label="Data"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card title={appointmentCopy.createTitle}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">
                {appointmentCopy.customerLabel}
              </span>

              <select
                value={selectedClientId}
                onChange={(event) => setSelectedClientId(event.target.value)}
                className="upp-input w-full"
              >
                {clients.length === 0 ? (
                  <option value="">{appointmentCopy.emptyCustomer}</option>
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
                {appointmentCopy.serviceLabel}
              </span>

              <select
                value={selectedServiceId}
                onChange={(event) => setSelectedServiceId(event.target.value)}
                className="upp-input w-full"
              >
                {services.length === 0 ? (
                  <option value="">{appointmentCopy.emptyService}</option>
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
                {appointmentCopy.professionalLabel}
              </span>

              <select
                value={selectedProfessionalId}
                onChange={(event) =>
                  setSelectedProfessionalId(event.target.value)
                }
                className="upp-input w-full"
              >
                {professionals.length === 0 ? (
                  <option value="">{appointmentCopy.emptyProfessional}</option>
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
                className="upp-input w-full"
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
                placeholder={appointmentCopy.notesPlaceholder}
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#171717] focus:ring-2 focus:ring-[#dedede]"
              />
            </label>

            <Button
              type="submit"
              disabled={
                isSaving || !startTime || Boolean(selectedTimeOption?.disabled)
              }
              className="w-full"
            >
              {isSaving ? "Salvando..." : appointmentCopy.submitLabel}
            </Button>
          </form>

          {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </Card>

        <div className="space-y-6">
          <Card title={appointmentCopy.pendingTitle}>
            <div className="mb-5 rounded-2xl border border-[#dedede] bg-[#f3f3f3] p-4">
              <h2 className="text-base font-semibold text-zinc-950">
                {appointmentCopy.pendingHeader}
              </h2>

              <p className="mt-1 text-sm text-zinc-600">
                {appointmentCopy.pendingDescription}
              </p>

              <strong className="mt-3 block text-sm text-[#171717]">
                {appointmentCopy.pendingTotalLabel}: {pendingAppointments.length}
              </strong>
            </div>

            {pendingAppointments.length === 0 ? (
              <p className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
                {appointmentCopy.emptyPending}
              </p>
            ) : (
              <div className="space-y-3">
                {pendingAppointments.map((appointment) =>
                  renderAppointmentCard(appointment, true)
                )}
              </div>
            )}
          </Card>

          <Card title={appointmentCopy.dayTitle}>
            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {appointmentCopy.dayTotalLabel}
                </p>
                <strong className="mt-2 block text-2xl text-zinc-950">
                  {daySummary.total}
                </strong>
              </div>

              <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {appointmentCopy.activeLabel}
                </p>
                <strong className="mt-2 block text-2xl text-zinc-950">
                  {daySummary.active}
                </strong>
              </div>

              <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Finalizados no dia
                </p>
                <strong className="mt-2 block text-2xl text-zinc-950">
                  {daySummary.finished}
                </strong>
              </div>

              <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
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
                    {appointmentCopy.bookedHeader}
                  </h2>
                  <p className="mt-1 break-words text-sm text-zinc-500">
                    {appointmentCopy.bookedDescription}
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
                  {appointmentCopy.emptyBooked}
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
                {appointmentCopy.activeDayTitle}
              </h2>

              {activeDayAppointments.length === 0 ? (
                <p className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
                  {appointmentCopy.emptyActive}
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

          <Card title={appointmentCopy.historyTitle}>
            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Total histórico
                </p>
                <strong className="mt-2 block text-2xl text-zinc-950">
                  {historySummary.total}
                </strong>
              </div>

              <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Finalizados
                </p>
                <strong className="mt-2 block text-2xl text-zinc-950">
                  {historySummary.finished}
                </strong>
              </div>

              <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Cancelados / faltas
                </p>
                <strong className="mt-2 block text-2xl text-zinc-950">
                  {historySummary.canceled}
                </strong>
              </div>

              <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
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
                {appointmentCopy.historyBusinessTitle}
              </h2>
              <p className="mt-1 break-words text-sm text-zinc-500">
                {appointmentCopy.historyDescription}
              </p>
            </div>

            {historyAppointments.length === 0 ? (
              <p className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
                {appointmentCopy.emptyHistory}
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