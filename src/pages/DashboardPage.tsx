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
  UsersRound,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
    totalAppointments > 0 ? Math.round((completedCount / totalAppointments) * 100) : 0;

  const totalStatusCount = statusItems.reduce((total, item) => {
    return total + item.value;
  }, 0);

  return (
    <div className="space-y-7 pb-4">
      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="flex min-h-[110px] flex-col justify-end">
          <h1 className="text-4xl font-black tracking-tight text-[#171717] md:text-5xl">
            Olá, {userName}!
          </h1>

          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#5f6368]">
            Acompanhe o dia do negócio sem decoração inútil fingindo ser
            inteligência operacional.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="rounded-[24px] bg-white/82 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.08)] backdrop-blur-xl">
            <span className="mb-3 block text-xs font-black uppercase tracking-[0.28em] text-[#777]">
              Negócio
            </span>

            <select
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="w-full rounded-2xl border border-[#d7d7d7] bg-white px-4 py-3 text-sm font-black text-[#171717] outline-none transition focus:border-[#171717]"
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

          <label className="rounded-[24px] bg-white/82 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.08)] backdrop-blur-xl">
            <span className="mb-3 block text-xs font-black uppercase tracking-[0.28em] text-[#777]">
              Data
            </span>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full rounded-2xl border border-[#d7d7d7] bg-white px-4 py-3 text-sm font-black text-[#171717] outline-none transition focus:border-[#171717]"
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
        <section className="rounded-[30px] bg-white/82 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <p className="text-sm font-black text-[#5f6368]">
            Carregando dashboard...
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-5 xl:grid-cols-[1fr_1fr_0.8fr]">
            <article className="rounded-[30px] bg-[#1f1f1f] p-7 text-white shadow-[0_24px_60px_rgba(0,0,0,0.26)]">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black">Informações gerais</h2>
                  <p className="mt-2 text-xs font-bold text-white/55">
                    Resumo do dia selecionado
                  </p>
                </div>

                <ClipboardCheck size={22} className="text-white/70" />
              </div>

              <div className="mt-8 grid grid-cols-2 gap-6">
                <div>
                  <strong className="text-5xl font-black">
                    {totalAppointments}
                  </strong>
                  <p className="mt-2 text-xs font-bold leading-5 text-white/60">
                    atendimentos no dia
                  </p>
                </div>

                <div>
                  <strong className="text-5xl font-black">{activeServices}</strong>
                  <p className="mt-2 text-xs font-bold leading-5 text-white/60">
                    serviços ativos
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white p-4 text-[#171717]">
                  <UsersRound size={20} />
                  <strong className="mt-5 block text-2xl font-black">
                    {clients.length}
                  </strong>
                  <span className="text-xs font-bold text-[#777]">Clientes</span>
                </div>

                <div className="rounded-2xl bg-white p-4 text-[#171717]">
                  <CheckCircle2 size={20} />
                  <strong className="mt-5 block text-2xl font-black">
                    {summary?.appointmentsByStatus.confirmed || 0}
                  </strong>
                  <span className="text-xs font-bold text-[#777]">
                    Confirmados
                  </span>
                </div>

                <div className="rounded-2xl bg-white p-4 text-[#171717]">
                  <CircleDollarSign size={20} />
                  <strong className="mt-5 block text-xl font-black">
                    {formatCurrency(summary?.estimatedRevenue || 0)}
                  </strong>
                  <span className="text-xs font-bold text-[#777]">Receita</span>
                </div>
              </div>
            </article>

            <article className="rounded-[30px] bg-white/82 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#171717]">
                    Movimento do dia
                  </h2>
                  <p className="mt-2 text-xs font-bold text-[#777]">
                    {formatDateLabel(selectedDate)}
                  </p>
                </div>

                <Activity size={22} />
              </div>

              <div className="mt-8 h-[190px] rounded-[24px] border border-[#dedede] bg-[#f5f5f5] p-5">
                <svg viewBox="0 0 420 150" className="h-full w-full">
                  <path
                    d="M10 115 C 60 35, 100 45, 145 82 S 230 130, 270 55 S 350 15, 410 78"
                    fill="none"
                    stroke="#171717"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10 105 C 65 95, 95 120, 145 72 S 220 20, 270 80 S 340 115, 410 45"
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="mt-5 grid grid-cols-6 gap-2 text-center text-xs font-black text-[#777]">
                <span>A</span>
                <span>C</span>
                <span>E</span>
                <span>F</span>
                <span>CA</span>
                <span>N</span>
              </div>
            </article>

            <article className="rounded-[30px] bg-white/82 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#171717]">
                    Progresso
                  </h2>
                  <p className="mt-2 text-xs font-bold text-[#777]">
                    Finalizados no dia
                  </p>
                </div>

                <Scissors size={22} />
              </div>

              <div className="mt-8 flex justify-center">
                <div
                  className="flex h-40 w-40 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#171717 ${progressPercentage}%, #e5e5e5 ${progressPercentage}% 100%)`,
                  }}
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                    <strong className="text-3xl font-black text-[#171717]">
                      {progressPercentage}%
                    </strong>
                    <span className="text-xs font-bold text-[#777]">
                      concluído
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[30px] bg-white/82 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <h2 className="text-xl font-black text-[#171717]">
                Checklist do dia
              </h2>

              <div className="mt-6 space-y-4">
                {[
                  "Confirmar pendências da agenda",
                  "Finalizar atendimentos concluídos",
                  "Marcar cancelados e não compareceu",
                  "Verificar mensagens dos clientes",
                ].map((item, index) => (
                  <label
                    key={item}
                    className="flex items-center gap-3 text-sm font-bold text-[#555]"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={index === 0}
                      className="h-4 w-4 rounded border-[#999] accent-[#171717]"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </article>

            <article className="rounded-[30px] bg-white/82 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#171717]">
                    Próximos atendimentos
                  </h2>
                  <p className="mt-2 text-sm font-medium text-[#666]">
                    Atendimentos ativos da data selecionada.
                  </p>
                </div>

                <span className="rounded-full border border-[#171717] px-4 py-2 text-xs font-black text-[#171717]">
                  {upcomingAppointments.length} na agenda
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {upcomingAppointments.length === 0 ? (
                  <div className="rounded-[26px] border border-dashed border-[#999] p-6 text-sm font-bold text-[#666]">
                    Nenhum atendimento ativo para esta data.
                  </div>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-[26px] bg-white p-5 shadow-[0_16px_34px_rgba(0,0,0,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <Clock3 size={22} />

                        <span className="rounded-full bg-[#171717] px-3 py-1.5 text-xs font-black text-white">
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
                        Profissional:{" "}
                        <span className="font-black text-[#171717]">
                          {appointment.professionalName}
                        </span>
                      </p>

                      <div className="mt-5 rounded-2xl bg-[#f2f2f2] p-4">
                        <strong className="block text-sm font-black text-[#171717]">
                          {appointment.clientName}
                        </strong>

                        <p className="mt-1 text-sm font-medium text-[#666]">
                          {appointment.clientPhone ||
                            appointment.clientEmail ||
                            "Contato não informado"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-[#171717]">
                Status da agenda
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
                      "rounded-[26px] p-5 shadow-[0_16px_34px_rgba(0,0,0,0.08)]",
                      isDark ? "bg-[#1f1f1f] text-white" : "bg-white/82 text-[#171717]",
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
                            isDark ? "text-white/55" : "text-[#777]",
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

          <section className="rounded-[30px] bg-[#1f1f1f] p-7 text-white shadow-[0_24px_60px_rgba(0,0,0,0.26)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black">Resumo do negócio</h2>
                <p className="mt-2 text-sm font-bold text-white/55">
                  {selectedBusiness?.name || "Nenhum negócio selecionado"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 px-5 py-4">
                  <BriefcaseBusiness size={20} />
                  <strong className="mt-4 block text-2xl font-black">
                    {services.length}
                  </strong>
                  <span className="text-xs font-bold text-white/55">
                    Serviços
                  </span>
                </div>

                <div className="rounded-2xl bg-white/10 px-5 py-4">
                  <Scissors size={20} />
                  <strong className="mt-4 block text-2xl font-black">
                    {activeServices}
                  </strong>
                  <span className="text-xs font-bold text-white/55">
                    Ativos
                  </span>
                </div>

                <div className="rounded-2xl bg-white/10 px-5 py-4">
                  <UsersRound size={20} />
                  <strong className="mt-4 block text-2xl font-black">
                    {clients.length}
                  </strong>
                  <span className="text-xs font-bold text-white/55">
                    Clientes
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
