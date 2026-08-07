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

import { BusinessPaymentInstructions } from "../components/BusinessPaymentInstructions";
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
  const [activeCycle, setActiveCycle] =
    useState<BillingCycle | null>(null);
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

  const activePlan = useMemo(() => {
    if (!activeCycle) {
      return plans[0] || null;
    }

    return (
      plans.find((plan) => plan.cycle === activeCycle) ||
      plans[0] ||
      null
    );
  }, [activeCycle, plans]);

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

      const loadedPlans = plansResponse.data;

      setBusiness(foundBusiness);
      setPlans(loadedPlans);

      setActiveCycle((currentCycle) => {
        if (
          currentCycle &&
          loadedPlans.some(
            (plan) => plan.cycle === currentCycle
          )
        ) {
          return currentCycle;
        }

        return (
          loadedPlans.find(
            (plan) => plan.cycle === "MONTHLY"
          )?.cycle ||
          loadedPlans[0]?.cycle ||
          null
        );
      });
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
            : "Seu plano foi escolhido. Use um dos meios de pagamento disponíveis abaixo e aguarde a liberação do Super Admin.";

  return (
    <main
      className="min-h-screen px-5 py-8 text-[#171717] md:px-8"
      style={{
        background:
          "radial-gradient(circle at 15% 10%, rgba(255,255,255,0.96), transparent 28%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.72), transparent 28%), linear-gradient(135deg,#d7d7d7 0%, #eeeeee 48%, #cfd4d6 100%)",
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
            <div className="mx-auto max-w-2xl text-center">
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
                continuar.
              </p>
            </div>

            {activePlan ? (
              <article
                className="mx-auto mt-9 w-full max-w-[560px] overflow-hidden rounded-[30px] border border-white bg-white shadow-[0_35px_90px_rgba(0,0,0,0.16)]"
                style={{
                  background:
                    "linear-gradient(180deg, #fff1d7 0%, #ffffff 31%)",
                }}
              >
                <div className="px-6 pb-5 pt-8 text-center sm:px-8 sm:pt-10">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171717] text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                    <CreditCard size={22} />
                  </div>

                  <h2 className="mt-5 text-2xl font-black tracking-tight text-[#2b2b2f]">
                    YggdraFlow para o seu negócio
                  </h2>

                  <p className="mx-auto mt-3 max-w-[430px] text-sm font-semibold leading-6 text-[#666571]">
                    Tenha agenda, clientes, profissionais,
                    serviços e agendamento online organizados em
                    um único lugar.
                  </p>
                </div>

                <div className="mx-6 mt-2 flex rounded-xl bg-[#ebebec] p-1 sm:mx-8">
                  {plans.map((plan) => {
                    const isActive =
                      plan.cycle === activePlan.cycle;

                    return (
                      <button
                        key={plan.cycle}
                        type="button"
                        onClick={() =>
                          setActiveCycle(plan.cycle)
                        }
                        className={[
                          "relative flex-1 rounded-[9px] px-3 py-2.5 text-sm font-black transition-all duration-200",
                          isActive
                            ? "bg-white text-[#171717] shadow-[0_3px_10px_rgba(0,0,0,0.14)]"
                            : "text-[#595959] hover:text-[#171717]",
                        ].join(" ")}
                      >
                        {plan.label}
                      </button>
                    );
                  })}
                </div>

                {activePlan.cycle === "ANNUAL" ? (
                  <div className="mx-auto mt-3 w-fit rounded-full bg-[#f59e0b]/15 px-3 py-1 text-xs font-black text-[#b56700]">
                    Melhor economia
                  </div>
                ) : null}

                <div className="px-6 py-8 sm:px-8">
                  <h3 className="text-xl font-black text-[#2b2b2f]">
                    O que oferecemos
                  </h3>

                  <ul className="mt-6 flex flex-col gap-4">
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#171717] text-white">
                        <Check size={15} strokeWidth={3} />
                      </span>

                      <span className="text-sm font-bold leading-6 text-[#656470]">
                        Agenda completa e criação de agendamentos
                      </span>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#171717] text-white">
                        <Check size={15} strokeWidth={3} />
                      </span>

                      <span className="text-sm font-bold leading-6 text-[#656470]">
                        Gestão de clientes e profissionais
                      </span>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#171717] text-white">
                        <Check size={15} strokeWidth={3} />
                      </span>

                      <span className="text-sm font-bold leading-6 text-[#656470]">
                        Serviços e página pública de agendamento
                      </span>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#171717] text-white">
                        <Check size={15} strokeWidth={3} />
                      </span>

                      <span className="text-sm font-bold leading-6 text-[#656470]">
                        {activePlan.description}
                      </span>
                    </li>
                  </ul>
                </div>

                <footer className="flex flex-col gap-5 border-t border-[#ebebec] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  <div>
                    <div className="flex items-end gap-1">
                      <strong className="text-4xl font-black tracking-tight text-[#2b2b2f]">
                        {formatCurrency(
                          activePlan.installmentAmount
                        )}
                      </strong>

                      <span className="mb-1 text-xs font-black text-[#656470]">
                        {activePlan.installments === 1
                          ? "/mês"
                          : "/parcela"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs font-bold text-[#777681]">
                      Total de{" "}
                      {formatCurrency(activePlan.totalAmount)}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={Boolean(isSaving)}
                    onClick={() =>
                      handleSelectPlan(activePlan.cycle)
                    }
                    className="min-h-12 rounded-xl bg-[#171717] px-7 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:min-w-[220px]"
                  >
                    {isSaving === activePlan.cycle
                      ? "Registrando plano..."
                      : `Escolher ${activePlan.label}`}
                  </button>
                </footer>
              </article>
            ) : (
              <div className="mx-auto mt-9 max-w-xl rounded-[28px] bg-white p-8 text-center font-black shadow-[0_24px_80px_rgba(0,0,0,0.10)]">
                Nenhum plano disponível no momento.
              </div>
            )}
          </section>
        ) : (
          <section className="mx-auto mt-12 max-w-[780px]">
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

              {business?.subscription?.cycle ? (
                <BusinessPaymentInstructions
                  cycle={business.subscription.cycle}
                />
              ) : null}

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
