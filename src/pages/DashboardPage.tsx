import {
  Activity,
  Ban,
  BriefcaseBusiness,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Scissors,
  Stethoscope,
  UsersRound,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { api, getApiAssetUrl } from "../services/api";
import type { Business } from "../types/business";
import type { Client } from "../types/client";
import type { BeautyService } from "../types/service";
import { getBusinessTheme } from "../utils/businessTheme";

type UpcomingAppointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  professionalName: string;
  serviceName: string;
  serviceDurationMinutes: number;
};

type DashboardSummary = {
  date: string;
  totalAppointments: number;
  estimatedRevenue: number;
  upcomingAppointments: UpcomingAppointment[];
  appointmentsByStatus: {
    scheduled: number;
    confirmed: number;
    inProgress: number;
    finished: number;
    canceled: number;
    noShow: number;
  };
};

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value: string) {
  if (!value) {
    return "--:--";
  }

  if (/^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 5);
  }

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAppointmentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    SCHEDULED: "Agendado",
    CONFIRMED: "Confirmado",
    IN_PROGRESS: "Em atendimento",
    FINISHED: "Finalizado",
    CANCELED: "Cancelado",
    NO_SHOW: "Não compareceu",
  };

  return labels[status] || status;
}

function getStoredUserName() {
  const rawUser =
    localStorage.getItem("@yggdraflow:user") || localStorage.getItem("user");

  if (!rawUser) {
    return "usuário";
  }

  try {
    const user = JSON.parse(rawUser) as {
      name?: string;
      email?: string;
    };

    return user.name || user.email || "usuário";
  } catch {
    return "usuário";
  }
}

function getDashboardCopy(business?: Business) {
  const theme = getBusinessTheme(business?.segment, business?.specialty);

  if (business?.segment === "ODONTOLOGY") {
    return {
      theme,
      description:
        "Acompanhe consultas, procedimentos, pacientes e movimentação do consultório.",
      mainTitle: "Informações do consultório",
      mainSubtitle: "Resumo odontológico do dia selecionado",
      appointmentsLabel: "consultas no dia",
      servicesLabel: "procedimentos ativos",
      clientsLabel: "Pacientes",
      servicesSummaryLabel: "Procedimentos",
      activeServicesSummaryLabel: "Ativos",
      progressTitle: "Procedimentos",
      progressSubtitle: "Finalizados no dia",
      checklistTitle: "Checklist do consultório",
      checklistItems: [
        "Confirmar consultas pendentes",
        "Finalizar procedimentos concluídos",
        "Verificar retornos e observações",
        "Conferir mensagens dos pacientes",
      ],
      upcomingTitle: "Próximas consultas",
      upcomingSubtitle: "Consultas ativas da data selecionada.",
      upcomingCountLabel: "na agenda",
      emptyUpcoming: "Nenhuma consulta ativa para esta data.",
      professionalLabel: "Profissional",
      contactLabel: "Paciente",
      statusTitle: "Status da agenda",
      businessSummaryTitle: "Resumo do consultório",
      businessSelectLabel: "Consultório",
      emptyBusinessLabel: "Nenhum consultório cadastrado",
      progressIcon: Stethoscope,
    };
  }

  if (business?.segment === "VETERINARY") {
    return {
      theme,
      description:
        "Acompanhe atendimentos, tutores, pets, serviços e movimentação da clínica.",
      mainTitle: "Informações da clínica",
      mainSubtitle: "Resumo veterinário do dia selecionado",
      appointmentsLabel: "atendimentos no dia",
      servicesLabel: "serviços ativos",
      clientsLabel: "Tutores",
      servicesSummaryLabel: "Serviços",
      activeServicesSummaryLabel: "Ativos",
      progressTitle: "Atendimentos",
      progressSubtitle: "Finalizados no dia",
      checklistTitle: "Checklist da clínica",
      checklistItems: [
        "Confirmar atendimentos pendentes",
        "Finalizar consultas concluídas",
        "Verificar retornos e vacinas",
        "Conferir mensagens dos tutores",
      ],
      upcomingTitle: "Próximos atendimentos",
      upcomingSubtitle: "Atendimentos ativos da data selecionada.",
      upcomingCountLabel: "na agenda",
      emptyUpcoming: "Nenhum atendimento ativo para esta data.",
      professionalLabel: "Profissional",
      contactLabel: "Tutor",
      statusTitle: "Status da agenda",
      businessSummaryTitle: "Resumo da clínica",
      businessSelectLabel: "Clínica",
      emptyBusinessLabel: "Nenhuma clínica cadastrada",
      progressIcon: Activity,
    };
  }

  if (business?.segment === "BARBERSHOP") {
    return {
      theme,
      description:
        "Acompanhe cortes, clientes, barbeiros, serviços e faturamento estimado do dia.",
      mainTitle: "Informações da barbearia",
      mainSubtitle: "Resumo da barbearia no dia selecionado",
      appointmentsLabel: "horários no dia",
      servicesLabel: "serviços ativos",
      clientsLabel: "Clientes",
      servicesSummaryLabel: "Serviços",
      activeServicesSummaryLabel: "Ativos",
      progressTitle: "Atendimentos",
      progressSubtitle: "Finalizados no dia",
      checklistTitle: "Checklist da barbearia",
      checklistItems: [
        "Confirmar horários pendentes",
        "Finalizar atendimentos concluídos",
        "Verificar cancelamentos e faltas",
        "Conferir mensagens dos clientes",
      ],
      upcomingTitle: "Próximos horários",
      upcomingSubtitle: "Horários ativos da data selecionada.",
      upcomingCountLabel: "na agenda",
      emptyUpcoming: "Nenhum horário ativo para esta data.",
      professionalLabel: "Barbeiro",
      contactLabel: "Cliente",
      statusTitle: "Status da agenda",
      businessSummaryTitle: "Resumo da barbearia",
      businessSelectLabel: "Barbearia",
      emptyBusinessLabel: "Nenhuma barbearia cadastrada",
      progressIcon: Scissors,
    };
  }

  if (business?.segment === "BEAUTY") {
    const isNails = business.specialty === "NAILS";

    return {
      theme,
      description: isNails
        ? "Acompanhe horários, clientes, nail designers, serviços e movimento do studio."
        : "Acompanhe agenda, clientes, profissionais, serviços e movimento do estúdio.",
      mainTitle: isNails ? "Informações do studio" : "Informações do estúdio",
      mainSubtitle: isNails
        ? "Resumo do studio de unhas no dia selecionado"
        : "Resumo do estúdio no dia selecionado",
      appointmentsLabel: "horários no dia",
      servicesLabel: isNails ? "serviços de unhas ativos" : "serviços ativos",
      clientsLabel: "Clientes",
      servicesSummaryLabel: "Serviços",
      activeServicesSummaryLabel: "Ativos",
      progressTitle: isNails ? "Serviços de unhas" : "Atendimentos",
      progressSubtitle: "Finalizados no dia",
      checklistTitle: isNails ? "Checklist do studio" : "Checklist do estúdio",
      checklistItems: isNails
        ? [
            "Confirmar horários pendentes",
            "Finalizar serviços concluídos",
            "Verificar manutenção e retornos",
            "Conferir mensagens das clientes",
          ]
        : [
            "Confirmar pendências da agenda",
            "Finalizar atendimentos concluídos",
            "Verificar cancelamentos e faltas",
            "Conferir mensagens das clientes",
          ],
      upcomingTitle: isNails ? "Próximos horários" : "Próximos atendimentos",
      upcomingSubtitle: "Atendimentos ativos da data selecionada.",
      upcomingCountLabel: "na agenda",
      emptyUpcoming: "Nenhum atendimento ativo para esta data.",
      professionalLabel: isNails ? "Nail designer" : "Profissional",
      contactLabel: "Cliente",
      statusTitle: "Status da agenda",
      businessSummaryTitle: isNails ? "Resumo do studio" : "Resumo do estúdio",
      businessSelectLabel: isNails ? "Studio" : "Estúdio",
      emptyBusinessLabel: "Nenhum estúdio cadastrado",
      progressIcon: Scissors,
    };
  }

  if (business?.segment === "WELLNESS") {
    return {
      theme,
      description:
        "Acompanhe sessões, clientes, profissionais, serviços e movimento do espaço.",
      mainTitle: "Informações do espaço",
      mainSubtitle: "Resumo do espaço no dia selecionado",
      appointmentsLabel: "sessões no dia",
      servicesLabel: "serviços ativos",
      clientsLabel: "Clientes",
      servicesSummaryLabel: "Serviços",
      activeServicesSummaryLabel: "Ativos",
      progressTitle: "Sessões",
      progressSubtitle: "Finalizadas no dia",
      checklistTitle: "Checklist do espaço",
      checklistItems: [
        "Confirmar sessões pendentes",
        "Finalizar sessões concluídas",
        "Verificar retornos e remarcações",
        "Conferir mensagens dos clientes",
      ],
      upcomingTitle: "Próximas sessões",
      upcomingSubtitle: "Sessões ativas da data selecionada.",
      upcomingCountLabel: "na agenda",
      emptyUpcoming: "Nenhuma sessão ativa para esta data.",
      professionalLabel: "Profissional",
      contactLabel: "Cliente",
      statusTitle: "Status da agenda",
      businessSummaryTitle: "Resumo do espaço",
      businessSelectLabel: "Espaço",
      emptyBusinessLabel: "Nenhum espaço cadastrado",
      progressIcon: Activity,
    };
  }

  return {
    theme,
    description:
      "Acompanhe agenda, clientes, serviços e movimento do negócio em um só lugar.",
    mainTitle: "Informações gerais",
    mainSubtitle: "Resumo do dia selecionado",
    appointmentsLabel: "atendimentos no dia",
    servicesLabel: "serviços ativos",
    clientsLabel: "Clientes",
    servicesSummaryLabel: "Serviços",
    activeServicesSummaryLabel: "Ativos",
    progressTitle: "Progresso",
    progressSubtitle: "Finalizados no dia",
    checklistTitle: "Checklist do dia",
    checklistItems: [
      "Confirmar pendências da agenda",
      "Finalizar atendimentos concluídos",
      "Marcar cancelados e não compareceu",
      "Verificar mensagens dos clientes",
    ],
    upcomingTitle: "Próximos atendimentos",
    upcomingSubtitle: "Atendimentos ativos da data selecionada.",
    upcomingCountLabel: "na agenda",
    emptyUpcoming: "Nenhum atendimento ativo para esta data.",
    professionalLabel: "Profissional",
    contactLabel: "Cliente",
    statusTitle: "Status da agenda",
    businessSummaryTitle: "Resumo do negócio",
    businessSelectLabel: "Negócio",
    emptyBusinessLabel: "Nenhum negócio cadastrado",
    progressIcon: Scissors,
  };
}

export function DashboardPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<BeautyService[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === selectedBusinessId),
    [businesses, selectedBusinessId]
  );

  const copy = getDashboardCopy(selectedBusiness);
  const ProgressIcon = copy.progressIcon;

  const userName = getStoredUserName();
  const coverImageUrl = getApiAssetUrl(selectedBusiness?.coverImageUrl);
  const activeServices = services.filter((service) => service.active).length;
  const upcomingAppointments = summary?.upcomingAppointments || [];

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
    async function loadDashboard() {
      if (!selectedBusinessId) {
        setSummary(null);
        setClients([]);
        setServices([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const [summaryResponse, clientsResponse, servicesResponse] =
          await Promise.all([
            api.get<DashboardSummary>("/dashboard/summary", {
              params: {
                businessId: selectedBusinessId,
                date: new Date(`${selectedDate}T00:00:00`).toISOString(),
              },
            }),
            api.get<Client[]>("/clients", {
              params: {
                businessId: selectedBusinessId,
              },
            }),
            api.get<BeautyService[]>("/services", {
              params: {
                businessId: selectedBusinessId,
              },
            }),
          ]);

        setSummary(summaryResponse.data);
        setClients(clientsResponse.data);
        setServices(servicesResponse.data);
      } catch {
        setError("Não foi possível carregar os dados do dashboard.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [selectedBusinessId, selectedDate]);

  const statusItems = [
    {
      label: "Agendados",
      value: summary?.appointmentsByStatus.scheduled || 0,
      icon: CalendarDays,
    },
    {
      label: "Confirmados",
      value: summary?.appointmentsByStatus.confirmed || 0,
      icon: CheckCircle2,
    },
    {
      label: "Em atendimento",
      value: summary?.appointmentsByStatus.inProgress || 0,
      icon: Activity,
    },
    {
      label: "Finalizados",
      value: summary?.appointmentsByStatus.finished || 0,
      icon: CalendarCheck,
    },
    {
      label: "Cancelados",
      value: summary?.appointmentsByStatus.canceled || 0,
      icon: XCircle,
    },
    {
      label: "Não compareceu",
      value: summary?.appointmentsByStatus.noShow || 0,
      icon: Ban,
    },
  ];

  const completedCount = summary?.appointmentsByStatus.finished || 0;
  const totalAppointments = summary?.totalAppointments || 0;
  const progressPercentage =
    totalAppointments > 0
      ? Math.round((completedCount / totalAppointments) * 100)
      : 0;

  const totalStatusCount = statusItems.reduce((total, item) => {
    return total + item.value;
  }, 0);

  return (
    <div className="min-w-0 w-full max-w-full space-y-5 pb-4 sm:space-y-7">
      <section className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div
          className={[
            "relative min-w-0 overflow-hidden rounded-[28px] border border-white/70 p-6 shadow-[0_20px_55px_var(--yggdra-shadow)] sm:min-h-[220px] sm:p-8",
            coverImageUrl ? "text-white" : "bg-[var(--yggdra-card)]",
          ].join(" ")}
          style={
            coverImageUrl
              ? {
                  backgroundImage: `linear-gradient(90deg, rgba(8,20,32,0.78) 0%, rgba(8,20,32,0.38) 55%, rgba(8,20,32,0.14) 100%), url("${coverImageUrl}")`,
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                }
              : undefined
          }
        >
          <div className="relative z-10 flex h-full min-h-[150px] flex-col justify-end">
            <div
              className={[
                "mb-3 inline-flex w-fit rounded-full px-4 py-2 text-xs font-black shadow-[0_12px_34px_var(--yggdra-shadow)]",
                coverImageUrl
                  ? "bg-white/20 text-white backdrop-blur-md"
                  : "bg-[var(--yggdra-accent)] text-[var(--yggdra-accent-text)]",
              ].join(" ")}
            >
              {copy.theme.brandName}
            </div>

            <h1
              className={[
                "break-words text-[clamp(2rem,5vw,3.2rem)] font-black leading-[1] tracking-tight",
                coverImageUrl ? "text-white" : "text-[#171717]",
              ].join(" ")}
            >
              Olá, {userName}!
            </h1>

            <p
              className={[
                "mt-3 max-w-xl text-sm font-medium leading-6",
                coverImageUrl ? "text-white/85" : "text-[#5f6368]",
              ].join(" ")}
            >
              {copy.description}
            </p>
          </div>
        </div>

        <div className="grid min-w-0 w-full grid-cols-1 gap-4 self-start sm:grid-cols-2 xl:max-w-[560px] xl:justify-self-end">
          <label className="min-w-0 max-w-full rounded-[24px] bg-[var(--yggdra-card)] p-4 shadow-[0_18px_45px_var(--yggdra-shadow)] backdrop-blur-xl sm:p-5">
            <span className="mb-3 block text-xs font-black uppercase tracking-[0.28em] text-[#777]">
              {copy.businessSelectLabel}
            </span>

            <select
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="min-w-0 w-full max-w-full rounded-2xl border border-[#d7d7d7] bg-white px-4 py-3 text-base font-black text-[#171717] outline-none transition focus:border-[var(--yggdra-primary)] sm:text-sm"
            >
              {businesses.length === 0 ? (
                <option value="">{copy.emptyBusinessLabel}</option>
              ) : (
                businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="rounded-[24px] bg-[var(--yggdra-card)] p-5 shadow-[0_18px_45px_var(--yggdra-shadow)] backdrop-blur-xl">
            <span className="mb-3 block text-xs font-black uppercase tracking-[0.28em] text-[#777]">
              Data
            </span>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full rounded-2xl border border-[#d7d7d7] bg-white px-4 py-3 text-sm font-black text-[#171717] outline-none transition focus:border-[var(--yggdra-primary)]"
            />
          </label>
        </div>
      </section>

      {error && (
        <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm font-black text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <section className="min-w-0 w-full max-w-full rounded-[24px] bg-[var(--yggdra-card)] p-4 shadow-[0_18px_45px_var(--yggdra-shadow)] backdrop-blur-xl sm:rounded-[28px] sm:p-5 md:rounded-[30px] md:p-7">
          <p className="text-sm font-black text-[#5f6368]">
            Carregando dashboard...
          </p>
        </section>
      ) : (
        <>
          <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
            <article className="min-w-0 w-full max-w-full rounded-[24px] bg-[var(--yggdra-primary)] p-4 text-[var(--yggdra-primary-text)] shadow-[0_24px_60px_var(--yggdra-shadow)] sm:rounded-[28px] sm:p-5 md:rounded-[30px] md:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black">{copy.mainTitle}</h2>
                  <p className="mt-2 text-xs font-bold opacity-65">
                    {copy.mainSubtitle}
                  </p>
                </div>

                <ClipboardCheck size={22} className="opacity-75" />
              </div>

              <div className="mt-6 grid min-w-0 grid-cols-2 gap-3 sm:mt-8 sm:gap-6">
                <div>
                  <strong className="text-4xl font-black sm:text-5xl">
                    {totalAppointments}
                  </strong>
                  <p className="mt-2 text-xs font-bold leading-5 opacity-65">
                    {copy.appointmentsLabel}
                  </p>
                </div>

                <div>
                  <strong className="text-4xl font-black sm:text-5xl">{activeServices}</strong>
                  <p className="mt-2 text-xs font-bold leading-5 opacity-65">
                    {copy.servicesLabel}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                <div className="min-w-0 overflow-hidden rounded-2xl bg-white/95 p-3 text-[#171717]">
                  <UsersRound size={20} />
                  <strong className="mt-4 block truncate text-2xl font-black">
                    {clients.length}
                  </strong>
                  <span className="block truncate text-[11px] font-bold leading-4 text-[#777]">
                    {copy.clientsLabel}
                  </span>
                </div>

                <div className="min-w-0 overflow-hidden rounded-2xl bg-white/95 p-3 text-[#171717]">
                  <CheckCircle2 size={20} />
                  <strong className="mt-4 block truncate text-2xl font-black">
                    {summary?.appointmentsByStatus.confirmed || 0}
                  </strong>
                  <span className="block truncate text-[11px] font-bold leading-4 text-[#777]">
                    Confirmados
                  </span>
                </div>

                <div className="min-w-0 overflow-hidden rounded-2xl bg-white/95 p-3 text-[#171717]">
                  <CircleDollarSign size={20} />
                  <strong className="mt-4 block truncate text-lg font-black">
                    {formatCurrency(summary?.estimatedRevenue || 0)}
                  </strong>
                  <span className="block truncate text-[11px] font-bold leading-4 text-[#777]">Receita</span>
                </div>
              </div>
            </article>

            <article className="min-w-0 w-full max-w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#090c08] p-5 text-white shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:rounded-[28px] sm:p-6 md:rounded-[30px] md:p-7">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#19250d] text-lime-400">
                    <Activity size={24} />
                  </span>

                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-black text-neutral-100">
                      Movimento do dia
                    </h2>

                    <p className="mt-1 text-xs font-medium text-neutral-500">
                      {formatDateLabel(selectedDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-neutral-800 pt-6">
                <div className="flex divide-x divide-neutral-800">
                  <div className="min-w-0 flex-1 pr-5 sm:pr-6">
                    <p className="text-xs font-medium text-neutral-500">
                      Receita estimada
                    </p>

                    <p className="mt-1 truncate text-2xl font-semibold text-neutral-100">
                      {formatCurrency(summary?.estimatedRevenue || 0)}
                    </p>

                    <p className="mt-1 text-xs font-medium text-lime-400">
                      {summary?.appointmentsByStatus.confirmed || 0} confirmados
                    </p>
                  </div>

                  <div className="min-w-0 flex-1 pl-5 sm:pl-6">
                    <p className="text-xs font-medium text-neutral-500">
                      Atendimentos
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-neutral-100">
                      {totalAppointments}
                    </p>

                    <p className="mt-1 text-xs font-medium text-[#61b7ff]">
                      {summary?.appointmentsByStatus.finished || 0} finalizados
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative mt-8 h-28 w-full">
                <svg
                  className="h-full w-full"
                  viewBox="0 0 300 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="dashboard-movement-gradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#a3e635"
                        stopOpacity="0.22"
                      />
                      <stop
                        offset="100%"
                        stopColor="#a3e635"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d="M0,65 C50,20 80,80 150,70 S250,50 300,85"
                    fill="none"
                    stroke="#a3e635"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  <path
                    d="M0,100 L0,65 C50,20 80,80 150,70 S250,50 300,85 L300,100 Z"
                    fill="url(#dashboard-movement-gradient)"
                  />
                </svg>

                <div className="absolute right-0 top-[95px]">
                  <div className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-400 shadow-[0_0_18px_rgba(163,230,53,0.55)]" />
                  <div className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-lime-400/25" />
                </div>
              </div>

              <div className="mt-7 flex items-center justify-between border-t border-neutral-800 pt-5 text-xs font-medium">
                <span className="text-neutral-500">
                  Resumo da data selecionada
                </span>

                <span className="font-bold text-neutral-300">
                  {totalAppointments} registros
                </span>
              </div>
            </article>

            <article className="min-w-0 w-full max-w-full rounded-[24px] bg-[var(--yggdra-card)] p-4 shadow-[0_18px_45px_var(--yggdra-shadow)] backdrop-blur-xl sm:rounded-[28px] sm:p-5 md:rounded-[30px] md:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#171717]">
                    {copy.progressTitle}
                  </h2>
                  <p className="mt-2 text-xs font-bold text-[#777]">
                    {copy.progressSubtitle}
                  </p>
                </div>

                <ProgressIcon size={22} className="text-[var(--yggdra-primary)]" />
              </div>

              <div className="mt-8 flex justify-center">
                <div
                  className="flex h-40 w-40 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(var(--yggdra-primary) ${progressPercentage}%, #e5e5e5 ${progressPercentage}% 100%)`,
                  }}
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                    <strong className="text-3xl font-black text-[#171717]">
                      {progressPercentage}%
                    </strong>
                    <span className="block truncate text-[11px] font-bold leading-4 text-[#777]">
                      concluído
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="min-w-0 w-full max-w-full rounded-[24px] bg-[var(--yggdra-card)] p-4 shadow-[0_18px_45px_var(--yggdra-shadow)] backdrop-blur-xl sm:rounded-[28px] sm:p-5 md:rounded-[30px] md:p-7">
              <h2 className="text-xl font-black text-[#171717]">
                {copy.checklistTitle}
              </h2>

              <div className="mt-6 space-y-4">
                {copy.checklistItems.map((item, index) => (
                  <label
                    key={item}
                    className="flex items-center gap-3 text-sm font-bold text-[#555]"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={index === 0}
                      className="h-4 w-4 rounded border-[#999] accent-[var(--yggdra-primary)]"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </article>

            <article className="min-w-0 w-full max-w-full rounded-[24px] bg-[var(--yggdra-card)] p-4 shadow-[0_18px_45px_var(--yggdra-shadow)] backdrop-blur-xl sm:rounded-[28px] sm:p-5 md:rounded-[30px] md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#171717]">
                    {copy.upcomingTitle}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-[#666]">
                    {copy.upcomingSubtitle}
                  </p>
                </div>

                <span className="rounded-full border border-[var(--yggdra-primary)] px-4 py-2 text-xs font-black text-[var(--yggdra-primary)]">
                  {upcomingAppointments.length} {copy.upcomingCountLabel}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {upcomingAppointments.length === 0 ? (
                  <div className="rounded-[26px] border border-dashed border-[#999] p-6 text-sm font-bold text-[#666]">
                    {copy.emptyUpcoming}
                  </div>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-[26px] bg-white/88 p-5 shadow-[0_16px_34px_var(--yggdra-shadow)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <Clock3 size={22} className="text-[var(--yggdra-primary)]" />

                        <span className="rounded-full bg-[var(--yggdra-primary)] px-3 py-1.5 text-xs font-black text-[var(--yggdra-primary-text)]">
                          {getAppointmentStatusLabel(appointment.status)}
                        </span>
                      </div>

                      <strong className="mt-5 block text-xl font-black text-[#171717]">
                        {formatTime(appointment.startTime)} até{" "}
                        {formatTime(appointment.endTime)}
                      </strong>

                      <p className="mt-3 text-sm font-bold text-[#666]">
                        {appointment.serviceName} ·{" "}
                        {appointment.serviceDurationMinutes} min
                      </p>

                      <p className="mt-2 text-sm text-[#666]">
                        {copy.professionalLabel}:{" "}
                        <span className="font-black text-[#171717]">
                          {appointment.professionalName}
                        </span>
                      </p>

                      <div className="mt-5 rounded-2xl bg-[var(--yggdra-muted)] p-4">
                        <strong className="block text-sm font-black text-[#171717]">
                          {appointment.clientName}
                        </strong>

                        <p className="mt-1 text-sm font-medium text-[#666]">
                          {appointment.clientPhone ||
                            appointment.clientEmail ||
                            `${copy.contactLabel} sem contato informado`}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          <section>
            <div className="mb-4 flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-black text-[#171717]">
                {copy.statusTitle}
              </h2>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#777]">
                {totalStatusCount} registros
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {statusItems.map((item, index) => {
                const Icon = item.icon;
                const isDark = index === 1 || index === 2;

                return (
                  <div
                    key={item.label}
                    className={[
                      "rounded-[26px] p-5 shadow-[0_16px_34px_var(--yggdra-shadow)]",
                      isDark
                        ? "bg-[var(--yggdra-primary)] text-[var(--yggdra-primary-text)]"
                        : "bg-[var(--yggdra-card)] text-[#171717]",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <strong className="text-lg font-black">
                          {item.label}
                        </strong>
                        <p
                          className={[
                            "mt-2 text-xs font-bold",
                            isDark ? "opacity-65" : "text-[#777]",
                          ].join(" ")}
                        >
                          Total no dia
                        </p>
                      </div>

                      <Icon size={22} />
                    </div>

                    <strong className="mt-8 block text-4xl font-black">
                      {item.value}
                    </strong>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="min-w-0 w-full max-w-full rounded-[24px] bg-[var(--yggdra-primary)] p-4 text-[var(--yggdra-primary-text)] shadow-[0_24px_60px_var(--yggdra-shadow)] sm:rounded-[28px] sm:p-5 md:rounded-[30px] md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black">{copy.businessSummaryTitle}</h2>
                <p className="mt-2 text-sm font-bold opacity-65">
                  {selectedBusiness?.name || "Nenhum negócio selecionado"}
                </p>
              </div>

              <div className="grid min-w-0 w-full grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 px-5 py-4">
                  <BriefcaseBusiness size={20} />
                  <strong className="mt-4 block text-2xl font-black">
                    {services.length}
                  </strong>
                  <span className="text-xs font-bold opacity-65">
                    {copy.servicesSummaryLabel}
                  </span>
                </div>

                <div className="rounded-2xl bg-white/10 px-5 py-4">
                  <CheckCircle2 size={20} />
                  <strong className="mt-4 block text-2xl font-black">
                    {activeServices}
                  </strong>
                  <span className="text-xs font-bold opacity-65">
                    {copy.activeServicesSummaryLabel}
                  </span>
                </div>

                <div className="rounded-2xl bg-white/10 px-5 py-4">
                  <UsersRound size={20} />
                  <strong className="mt-4 block text-2xl font-black">
                    {clients.length}
                  </strong>
                  <span className="text-xs font-bold opacity-65">
                    {copy.clientsLabel}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
