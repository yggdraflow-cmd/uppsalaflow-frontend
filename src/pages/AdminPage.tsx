import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CreditCard,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { Card } from "../components/Card";
import { api } from "../services/api";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type AdminBusiness = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  category?: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  subscription?: {
    id: string;
    plan: string;
    status: string;
    startedAt: string;
    expiresAt?: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  _count: {
    clients: number;
    services: number;
    professionals: number;
    appointments: number;
  };
};

type AdminSubscription = {
  id: string;
  businessId: string;
  plan: string;
  status: string;
  startedAt: string;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type AdminOverview = {
  summary: {
    totalUsers: number;
    totalBusinesses: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    paymentAttentionSubscriptions: number;
    businessesWithoutSubscription: number;
  };
  users: AdminUser[];
  businesses: AdminBusiness[];
  subscriptions: AdminSubscription[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
}

function getSubscriptionLabel(status?: string | null) {
  if (!status) {
    return "Sem assinatura";
  }

  const labels: Record<string, string> = {
    ACTIVE: "Em dia",
    PAST_DUE: "Pagamento pendente",
    CANCELED: "Cancelada",
    EXPIRED: "Expirada",
  };

  return labels[status] || status;
}

function getPlanLabel(plan?: string | null) {
  if (!plan) {
    return "Sem plano";
  }

  const labels: Record<string, string> = {
    FREE: "Gratuito",
    BASIC: "Básico",
    PRO: "Pro",
  };

  return labels[plan] || plan;
}

export function AdminPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const summaryCards = useMemo(() => {
    return [
      {
        title: "Usuários",
        value: String(overview?.summary.totalUsers || 0),
        icon: Users,
      },
      {
        title: "Empresas",
        value: String(overview?.summary.totalBusinesses || 0),
        icon: Building2,
      },
      {
        title: "Assinaturas ativas",
        value: String(overview?.summary.activeSubscriptions || 0),
        icon: CreditCard,
      },
      {
        title: "Atenção no pagamento",
        value: String(overview?.summary.paymentAttentionSubscriptions || 0),
        icon: ShieldCheck,
      },
    ];
  }, [overview]);

  useEffect(() => {
    async function loadOverview() {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get<AdminOverview>("/admin/overview");

        setOverview(response.data);
      } catch {
        setError(
          "Não foi possível carregar o painel admin. Verifique se o usuário logado é ADMIN."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadOverview();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-[#171717]">
          Admin da plataforma
        </p>
        <h1 className="text-3xl font-bold text-zinc-950">
          Visão geral do YggdraFlow
        </h1>
        <p className="mt-2 max-w-3xl text-zinc-600">
          Área interna para acompanhar usuários, empresas cadastradas,
          assinaturas e situação de pagamento da plataforma.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <Card>
          <p className="text-sm text-zinc-500">Carregando painel admin...</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((item) => {
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

                    <span className="rounded-2xl bg-[#f3f3f3] p-3 text-[#171717]">
                      <Icon size={22} />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
            <Card title="Empresas cadastradas">
              {!overview || overview.businesses.length === 0 ? (
                <p className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
                  Nenhuma empresa cadastrada ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {overview.businesses.map((business) => (
                    <div
                      key={business.id}
                      className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-zinc-950">
                            {business.name}
                          </h2>

                          <p className="mt-1 text-sm text-zinc-500">
                            Dono:{" "}
                            <span className="font-medium text-zinc-900">
                              {business.owner.name}
                            </span>{" "}
                            • {business.owner.email}
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            Slug público:{" "}
                            <span className="font-medium text-zinc-900">
                              {business.slug}
                            </span>
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-zinc-600">
                            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-zinc-200">
                              Clientes: {business._count.clients}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-zinc-200">
                              Serviços: {business._count.services}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-zinc-200">
                              Profissionais: {business._count.professionals}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-zinc-200">
                              Agendamentos: {business._count.appointments}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white bg-white px-4 py-3 text-sm shadow-sm">
                          <p className="font-bold text-zinc-950">
                            {getPlanLabel(business.subscription?.plan)}
                          </p>
                          <p className="mt-1 text-zinc-500">
                            {getSubscriptionLabel(
                              business.subscription?.status
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Usuários da plataforma">
              {!overview || overview.users.length === 0 ? (
                <p className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
                  Nenhum usuário cadastrado.
                </p>
              ) : (
                <div className="space-y-3">
                  {overview.users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#171717] text-white">
                        <UserRound size={20} />
                      </span>

                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-zinc-950">
                          {user.name}
                        </h2>
                        <p className="truncate text-sm text-zinc-500">
                          {user.email}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#171717]">
                          {user.role} • criado em {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
