import {
  Activity,
  AlertCircle,
  Ban,
  BriefcaseBusiness,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Scissors,
  Sparkles,
  UserPlus,
  UsersRound,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Input } from "../components/Input";
import { api } from "../services/api";
import type { Business } from "../types/business";
import type { Client } from "../types/client";
import type { BeautyService } from "../types/service";

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
  return new Date(value).toLocaleTimeString("pt-BR", {
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
    localStorage.getItem("@uppsalaflow:user") ||
    localStorage.getItem("user");

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

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Bom dia";
  }

  if (hour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
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

  const userName = getStoredUserName();

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

  const activeServices = services.filter((service) => service.active).length;
  const upcomingAppointments = summary?.upcomingAppointments || [];

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

  const totalStatusCount = statusItems.reduce((total, item) => {
    return total + item.value;
  }, 0);

  const metricCards = [
    {
      title: "Atendimentos no dia",
      value: String(summary?.totalAppointments || 0),
      description: "Marcados para a data selecionada",
      icon: CalendarCheck,
      highlight: true,
    },
    {
      title: "Faturamento estimado",
      value: formatCurrency(summary?.estimatedRevenue || 0),
      description: "Baseado nos serviços do dia",
      icon: CircleDollarSign,
      highlight: false,
    },
    {
      title: "Clientes cadastrados",
      value: String(clients.length),
      description: "Base total do negócio",
      icon: UsersRound,
      highlight: false,
    },
    {
      title: "Serviços ativos",
      value: String(activeServices),
      description: "Disponíveis para agendamento",
      icon: Scissors,
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/80 bg-white/55 p-7 shadow-[0_24px_80px_rgba(55,73,89,0.14)] backdrop-blur-2xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-orange-500 shadow-sm">
              <Sparkles size={15} />
              Dashboard
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-[#101828] md:text-4xl">
              {getGreeting()}, {userName}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#667789]">
              Acompanhe agenda, faturamento estimado, clientes e serviços do
              negócio selecionado. Um painel útil, não um quadro bonito fingindo
              que trabalha.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:w-[560px]">
            <label className="block rounded-[24px] border border-white/80 bg-white/65 p-4 shadow-sm backdrop-blur-xl">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#718196]">
                Negócio
              </span>

              <select
                value={selectedBusinessId}
                onChange={(event) => setSelectedBusinessId(event.target.value)}
                className="w-full rounded-2xl border border-[#d8e2ea] bg-white px-4 py-3 text-sm font-bold text-[#132033] outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              >
                {businesses.length === 0 ? (
                  <option value="">Nenhum negócio cadastrado</option>
                ) : (
                  businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <div className="rounded-[24px] border border-white/80 bg-white/65 p-4 shadow-sm backdrop-blur-xl">
              <Input
                label="Data do resumo"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <section className="rounded-[30px] border border-white/80 bg-white/55 p-7 shadow-[0_18px_55px_rgba(55,73,89,0.10)] backdrop-blur-2xl">
          <p className="text-sm font-bold text-[#667789]">
            Carregando dashboard...
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className={[
                    "rounded-[30px] border p-6 shadow-[0_18px_55px_rgba(55,73,89,0.10)] backdrop-blur-2xl",
                    item.highlight
                      ? "border-orange-200 bg-gradient-to-br from-orange-500 to-orange-400 text-white"
                      : "border-white/80 bg-white/55 text-[#132033]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className={[
                          "text-sm font-black",
                          item.highlight ? "text-white/85" : "text-[#667789]",
                        ].join(" ")}
                      >
                        {item.title}
                      </p>

                      <strong className="mt-4 block text-3xl font-black tracking-tight">
                        {item.value}
                      </strong>

                      <span
                        className={[
                          "mt-3 block text-xs font-bold",
                          item.highlight ? "text-white/80" : "text-[#8a99a6]",
                        ].join(" ")}
                      >
                        {item.description}
                      </span>
                    </div>

                    <span
                      className={[
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                        item.highlight
                          ? "bg-white/20 text-white"
                          : "bg-[#eef4fb] text-[#132033]",
                      ].join(" ")}
                    >
                      <Icon size={23} />
                    </span>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
            <article className="rounded-[34px] border border-white/80 bg-white/55 p-7 shadow-[0_22px_70px_rgba(55,73,89,0.12)] backdrop-blur-2xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#132033]">
                    Movimento do dia
                  </h2>

                  <p className="mt-2 text-sm text-[#667789]">
                    {formatDateLabel(selectedDate)}
                  </p>
                </div>

                <div className="rounded-full bg-[#132033] px-5 py-3 text-sm font-black text-white">
                  {summary?.totalAppointments || 0} atendimentos
                </div>
              </div>

              <div className="mt-8 flex min-h-[260px] items-end gap-4 rounded-[28px] border border-white/80 bg-white/45 px-5 py-6">
                {statusItems.map((item) => {
                  const Icon = item.icon;
                  const percentage =
                    totalStatusCount > 0
                      ? Math.max((item.value / totalStatusCount) * 100, 8)
                      : 8;

                  return (
                    <div
                      key={item.label}
                      className="flex flex-1 flex-col items-center gap-3"
                    >
                      <div className="flex h-[180px] w-full items-end justify-center rounded-full bg-[#edf3f8] p-1">
                        <div
                          className="w-full rounded-full bg-[#132033]"
                          style={{ height: `${percentage}%` }}
                        />
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                        <Icon size={18} />
                      </div>

                      <strong className="text-sm font-black text-[#132033]">
                        {item.value}
                      </strong>

                      <span className="text-center text-[11px] font-bold leading-4 text-[#718196]">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="rounded-[34px] border border-white/80 bg-white/55 p-7 shadow-[0_22px_70px_rgba(55,73,89,0.12)] backdrop-blur-2xl">
              <h2 className="text-xl font-black text-[#132033]">
                Resumo do negócio
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#667789]">
                Dados rápidos do negócio selecionado.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-[26px] border border-white/80 bg-white/55 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#132033] text-white">
                      <BriefcaseBusiness size={21} />
                    </span>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#718196]">
                        Negócio atual
                      </p>
                      <strong className="mt-1 block text-lg font-black text-[#132033]">
                        {selectedBusiness?.name || "Nenhum negócio selecionado"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[26px] border border-white/80 bg-white/55 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#667789]">
                        Total de serviços
                      </span>
                      <strong className="text-2xl font-black text-[#132033]">
                        {services.length}
                      </strong>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-white/80 bg-white/55 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#667789]">
                        Serviços ativos
                      </span>
                      <strong className="text-2xl font-black text-[#132033]">
                        {activeServices}
                      </strong>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-white/80 bg-white/55 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#667789]">
                        Base de clientes
                      </span>
                      <strong className="text-2xl font-black text-[#132033]">
                        {clients.length}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-[34px] border border-white/80 bg-white/55 p-7 shadow-[0_22px_70px_rgba(55,73,89,0.12)] backdrop-blur-2xl">
              <h2 className="text-xl font-black text-[#132033]">
                Atendimentos por status
              </h2>

              <div className="mt-6 space-y-3">
                {statusItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-[22px] border border-white/80 bg-white/55 px-5 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4fb] text-[#132033]">
                          <Icon size={19} />
                        </span>

                        <span className="text-sm font-bold text-[#667789]">
                          {item.label}
                        </span>
                      </div>

                      <strong className="text-lg font-black text-[#132033]">
                        {item.value}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="rounded-[34px] border border-white/80 bg-white/55 p-7 shadow-[0_22px_70px_rgba(55,73,89,0.12)] backdrop-blur-2xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#132033]">
                    Próximos atendimentos
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#667789]">
                    Atendimentos ativos da data selecionada, ordenados por
                    horário.
                  </p>
                </div>

                <span className="inline-flex rounded-full bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-orange-500">
                  {upcomingAppointments.length} na agenda
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {upcomingAppointments.length === 0 ? (
                  <div className="rounded-[26px] border border-slate-200 bg-white/60 p-5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-1 text-[#132033]" size={22} />

                      <div>
                        <strong className="text-sm font-black text-[#132033]">
                          Nenhum atendimento ativo
                        </strong>

                        <p className="mt-1 text-sm leading-6 text-[#667789]">
                          Não há agendamentos, confirmações ou atendimentos em
                          andamento para esta data.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-[26px] border border-white/80 bg-white/60 p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#132033] text-white">
                            <Clock3 size={20} />
                          </span>

                          <div>
                            <strong className="block text-base font-black text-[#132033]">
                              {formatTime(appointment.startTime)} até{" "}
                              {formatTime(appointment.endTime)}
                            </strong>

                            <p className="mt-1 text-sm font-bold text-[#667789]">
                              {appointment.serviceName} ·{" "}
                              {appointment.serviceDurationMinutes} min
                            </p>

                            <p className="mt-2 text-sm text-[#667789]">
                              Profissional:{" "}
                              <span className="font-bold text-[#132033]">
                                {appointment.professionalName}
                              </span>
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-[#dbeafe] px-4 py-2 text-xs font-black text-blue-700">
                          {getAppointmentStatusLabel(appointment.status)}
                        </span>
                      </div>

                      <div className="mt-4 rounded-[22px] border border-white/80 bg-white/70 p-4">
                        <div className="flex items-start gap-3">
                          <UserPlus className="mt-1 text-orange-500" size={20} />

                          <div>
                            <strong className="block text-sm font-black text-[#132033]">
                              {appointment.clientName}
                            </strong>

                            <p className="mt-1 text-sm text-[#667789]">
                              {appointment.clientPhone ||
                                appointment.clientEmail ||
                                "Contato não informado"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}
