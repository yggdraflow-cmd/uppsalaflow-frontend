import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { api } from "../services/api";
import type {
  BillingCycle,
  Business,
} from "../types/business";

type BillingPlan = {
  cycle: BillingCycle;
  label: string;
  installments: number;
  installmentAmount: number;
  totalAmount: number;
  description: string;
};

type SelectPlanResponse = {
  business: Business;
  plan: BillingPlan;
};

function formatCurrency(value: number | string | undefined) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function PlanSelectionPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<BillingCycle | null>(
    null
  );
  const [error, setError] = useState("");

  const selectedPlan = useMemo(() => {
    if (!business?.subscription) {
      return null;
    }

    return (
      plans.find(
        (plan) =>
          plan.cycle === business.subscription?.cycle
      ) || null
    );
  }, [business, plans]);

  const canChoosePlan =
    !business?.subscription ||
    business.status === "PENDING";

  async function loadData(showLoading = true) {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      setError("");

      const [businessesResponse, plansResponse] =
        await Promise.all([
          api.get<Business[]>("/businesses"),
          api.get<BillingPlan[]>("/billing/plans"),
        ]);

      const requestedBusinessId =
        new URLSearchParams(window.location.search).get(
          "businessId"
        );

      const foundBusiness =
        businessesResponse.data.find(
          (item) => item.id === requestedBusinessId
        ) || businessesResponse.data[0];

      if (!foundBusiness) {
        window.location.href = "/business-onboarding";
        return;
      }

      if (
        foundBusiness.status === "ACTIVE" &&
        foundBusiness.subscription?.status === "ACTIVE"
      ) {
        window.location.href = "/dashboard";
        return;
      }

      setBusiness(foundBusiness);
      setPlans(plansResponse.data);
    } catch {
      setError(
        "Não foi possível carregar os planos e o status da empresa."
      );
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    loadData();

    const intervalId = window.setInterval(() => {
      loadData(false);
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  async function handleSelectPlan(cycle: BillingCycle) {
    if (!business) {
      return;
    }

    try {
      setIsSaving(cycle);
      setError("");

      const response = await api.post<SelectPlanResponse>(
        "/billing/select-plan",
        {
          businessId: business.id,
          cycle,
        }
      );

      setBusiness(response.data.business);
    } catch {
      setError(
        "Não foi possível registrar o plano escolhido. Tente novamente."
      );
    } finally {
      setIsSaving(null);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eceff0] px-6 text-[#171717]">
        <div className="rounded-[28px] bg-white px-8 py-6 text-sm font-black shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
          Carregando planos disponíveis...
        </div>
      </main>
    );
  }

  const statusTitle =
    business?.status === "UNDER_REVIEW"
      ? "Pagamento confirmado"
      : business?.status === "BLOCKED"
        ? "Acesso bloqueado"
        : business?.status === "SUSPENDED"
          ? "Acesso suspenso"
          : business?.status === "CANCELED"
            ? "Cadastro cancelado"
            : "Plano registrado";

  const statusDescription =
    business?.status === "UNDER_REVIEW"
      ? "Seu pagamento foi confirmado. Agora a empresa aguarda a aprovação e liberação do Super Admin."
      : business?.status === "BLOCKED"
        ? "A empresa foi bloqueada pelo Super Admin. Entre em contato com o suporte."
        : business?.status === "SUSPENDED"
          ? "A empresa está temporariamente suspensa. Entre em contato com o suporte."
          : business?.status === "CANCELED"
            ? "O cadastro desta empresa foi cancelado."
            : "Seu plano foi escolhido. Aguarde a confirmação do pagamento e a liberação do Super Admin.";

  return (
    <main
      className="min-h-screen px-5 py-8 text-[#171717] md:px-8"
      style={{
        background:
          "radial-gradient(circle at 15% 10%, rgba(255,255,255,0.96), transparent 28%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.72), transparent 28%), linear-gradient(135deg, #d7d7d7 0%, #eeeeee 48%, #cfd4d6 100%)",
      }}
    >
      <div className="mx-auto min-h-[calc(100vh-64px)] max-w-[1280px] rounded-[42px] border border-white/80 bg-white/35 p-6 shadow-[0_34px_110px_rgba(0,0,0,0.16)] backdrop-blur-3xl md:p-10">
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171717] text-white shadow-[0_18px_42px_rgba(0,0,0,0.24)]">
              <Sparkles size={26} />
            </div>

            <div>
              <strong className="block text-2xl font-black tracking-tight">
                YggdraFlow
              </strong>
              <span className="text-sm font-bold text-[#666]">
                Escolha do plano e liberação do acesso
              </span>
            </div>
          </div>

          <div className="rounded-full bg-white/80 px-4 py-2 text-xs font-black shadow-[0_12px_34px_rgba(0,0,0,0.08)]">
            Etapa final
          </div>
        </header>

        {canChoosePlan ? (
          <section className="mt-10">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d97706]">
                Empresa cadastrada
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                Escolha o plano do seu negócio
              </h1>

              <p className="mt-4 text-base font-medium leading-7 text-[#666]">
                A empresa{" "}
                <strong className="text-[#171717]">
                  {business?.name}
                </strong>{" "}
                foi cadastrada. Escolha o ciclo desejado para
                continuar. O painel só será liberado depois da
                aprovação do Super Admin.
              </p>
            </div>

            <div className="mt-9 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => {
                const isAnnual = plan.cycle === "ANNUAL";
                const isSavingThisPlan =
                  isSaving === plan.cycle;

                return (
                  <article
                    key={plan.cycle}
                    className={[
                      "relative flex min-h-[430px] flex-col rounded-[34px] border p-7 shadow-[0_24px_80px_rgba(0,0,0,0.10)]",
                      isAnnual
                        ? "border-[#171717] bg-[#171717] text-white"
                        : "border-white/90 bg-white/90 text-[#171717]",
                    ].join(" ")}
                  >
                    {isAnnual && (
                      <span className="absolute right-6 top-6 rounded-full bg-[#f59e0b] px-3 py-1 text-xs font-black text-[#171717]">
                        Melhor economia
                      </span>
                    )}

                    <div
                      className={[
                        "flex h-14 w-14 items-center justify-center rounded-2xl",
                        isAnnual
                          ? "bg-white text-[#171717]"
                          : "bg-[#171717] text-white",
                      ].join(" ")}
                    >
                      <CreditCard size={25} />
                    </div>

                    <h2 className="mt-7 text-3xl font-black">
                      {plan.label}
                    </h2>

                    <p
                      className={[
                        "mt-2 text-sm font-bold",
                        isAnnual
                          ? "text-white/65"
                          : "text-[#666]",
                      ].join(" ")}
                    >
                      YggdraFlow completo
                    </p>

                    <div className="mt-7">
                      <strong className="block text-4xl font-black">
                        {formatCurrency(
                          plan.installmentAmount
                        )}
                      </strong>

                      <span
                        className={[
                          "mt-2 block text-sm font-bold",
                          isAnnual
                            ? "text-white/65"
                            : "text-[#666]",
                        ].join(" ")}
                      >
                        {plan.installments === 1
                          ? "por mês"
                          : `em ${plan.installments} parcelas`}
                      </span>
                    </div>

                    <div
                      className={[
                        "mt-7 space-y-3 border-t pt-6",
                        isAnnual
                          ? "border-white/15"
                          : "border-[#e5e5e5]",
                      ].join(" ")}
                    >
                      <p className="flex items-center gap-3 text-sm font-bold">
                        <Check size={18} />
                        Agenda e agendamentos
                      </p>

                      <p className="flex items-center gap-3 text-sm font-bold">
                        <Check size={18} />
                        Clientes e profissionais
                      </p>

                      <p className="flex items-center gap-3 text-sm font-bold">
                        <Check size={18} />
                        Serviços e página pública
                      </p>

                      <p className="flex items-center gap-3 text-sm font-bold">
                        <Check size={18} />
                        Total de{" "}
                        {formatCurrency(plan.totalAmount)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={Boolean(isSaving)}
                      onClick={() =>
                        handleSelectPlan(plan.cycle)
                      }
                      className={[
                        "mt-auto w-full rounded-full px-6 py-4 text-sm font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50",
                        isAnnual
                          ? "bg-white text-[#171717]"
                          : "bg-[#171717] text-white",
                      ].join(" ")}
                    >
                      {isSavingThisPlan
                        ? "Registrando plano..."
                        : `Escolher ${plan.label}`}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="mx-auto mt-12 max-w-780px">
            <div className="rounded-[38px] border border-white/90 bg-white/90 p-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.12)] md:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#171717] text-white">
                {business?.status === "UNDER_REVIEW" ? (
                  <CheckCircle2 size={36} />
                ) : business?.status === "BLOCKED" ||
                  business?.status === "SUSPENDED" ||
                  business?.status === "CANCELED" ? (
                  <ShieldCheck size={36} />
                ) : (
                  <Clock3 size={36} />
                )}
              </div>

              <p className="mt-7 text-sm font-black uppercase tracking-[0.2em] text-[#d97706]">
                {business?.name}
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight">
                {statusTitle}
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-[#666]">
                {statusDescription}
              </p>

              {selectedPlan && (
                <div className="mx-auto mt-8 max-w-xl rounded-[28px] bg-[#f3f4f4] p-6 text-left">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#777]">
                        Plano escolhido
                      </p>

                      <h2 className="mt-2 text-2xl font-black">
                        {selectedPlan.label}
                      </h2>
                    </div>

                    <CreditCard size={28} />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold text-[#777]">
                        Parcelamento
                      </p>
                      <p className="mt-1 font-black">
                        {selectedPlan.description}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#777]">
                        Valor total
                      </p>
                      <p className="mt-1 font-black">
                        {formatCurrency(
                          selectedPlan.totalAmount
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => loadData()}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#171717] px-6 py-4 text-sm font-black text-white transition hover:-translate-y-0.5"
              >
                <RefreshCw size={18} />
                Atualizar status
              </button>

              <p className="mt-5 text-xs font-bold text-[#888]">
                Esta página atualiza automaticamente a cada 15
                segundos.
              </p>
            </div>
          </section>
        )}

        {error && (
          <p className="mt-7 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 ring-1 ring-red-100">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
