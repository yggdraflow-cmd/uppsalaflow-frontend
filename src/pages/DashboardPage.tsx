import { CalendarDays, DollarSign, Scissors, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { api } from "../services/api";
import type { Business } from "../types/business";
import type { Client } from "../types/client";
import type { BeautyService } from "../types/service";

type DashboardSummary = {
  date: string;
  totalAppointments: number;
  estimatedRevenue: number;
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

export function DashboardPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<BeautyService[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const cards = [
    {
      title: "Atendimentos no dia",
      value: String(summary?.totalAppointments || 0),
      icon: CalendarDays,
    },
    {
      title: "Faturamento estimado",
      value: formatCurrency(summary?.estimatedRevenue || 0),
      icon: DollarSign,
    },
    {
      title: "Clientes",
      value: String(clients.length),
      icon: Users,
    },
    {
      title: "Serviços ativos",
      value: String(services.filter((service) => service.active).length),
      icon: Scissors,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-beauty-700">Painel</p>
        <h1 className="text-3xl font-bold text-zinc-950">Dashboard</h1>
        <p className="mt-2 text-zinc-600">
          Visão geral dos atendimentos, faturamento estimado, clientes e serviços.
        </p>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <Card title="Negócio selecionado">
          {businesses.length === 0 ? (
            <p className="text-sm text-red-600">
              Nenhum negócio cadastrado ainda.
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

        <Card title="Data do resumo">
          <Input
            label="Data"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </Card>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <Card>
          <p className="text-sm text-zinc-500">Carregando dashboard...</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">{item.title}</p>
                      <strong className="mt-2 block text-2xl text-zinc-950">
                        {item.value}
                      </strong>
                    </div>

                    <span className="rounded-2xl bg-beauty-50 p-3 text-beauty-700">
                      <Icon size={22} />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Card title="Atendimentos por status">
              {!summary ? (
                <p className="text-sm text-zinc-500">
                  Nenhum dado carregado ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                    <span className="text-sm text-zinc-600">Agendados</span>
                    <strong>{summary.appointmentsByStatus.scheduled}</strong>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                    <span className="text-sm text-zinc-600">Confirmados</span>
                    <strong>{summary.appointmentsByStatus.confirmed}</strong>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                    <span className="text-sm text-zinc-600">Em atendimento</span>
                    <strong>{summary.appointmentsByStatus.inProgress}</strong>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                    <span className="text-sm text-zinc-600">Finalizados</span>
                    <strong>{summary.appointmentsByStatus.finished}</strong>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                    <span className="text-sm text-zinc-600">Cancelados</span>
                    <strong>{summary.appointmentsByStatus.canceled}</strong>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                    <span className="text-sm text-zinc-600">Não compareceu</span>
                    <strong>{summary.appointmentsByStatus.noShow}</strong>
                  </div>
                </div>
              )}
            </Card>

            <Card title="Resumo do negócio">
              <div className="space-y-3">
                <div className="rounded-xl bg-zinc-50 px-4 py-3">
                  <p className="text-sm text-zinc-500">Clientes cadastrados</p>
                  <strong className="mt-1 block text-xl text-zinc-950">
                    {clients.length}
                  </strong>
                </div>

                <div className="rounded-xl bg-zinc-50 px-4 py-3">
                  <p className="text-sm text-zinc-500">Serviços cadastrados</p>
                  <strong className="mt-1 block text-xl text-zinc-950">
                    {services.length}
                  </strong>
                </div>

                <div className="rounded-xl bg-zinc-50 px-4 py-3">
                  <p className="text-sm text-zinc-500">Faturamento estimado do dia</p>
                  <strong className="mt-1 block text-xl text-zinc-950">
                    {formatCurrency(summary?.estimatedRevenue || 0)}
                  </strong>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}