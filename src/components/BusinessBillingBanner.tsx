import {
  AlertTriangle,
  CalendarClock,
  ShieldAlert,
} from "lucide-react";

import type { Business } from "../types/business";

type BusinessBillingBannerProps = {
  business: Business;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "não informado";
  }

  return new Date(value).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

export function BusinessBillingBanner({
  business,
}: BusinessBillingBannerProps) {
  const billing = business.billing;

  if (
    !billing ||
    billing.state === "FREE" ||
    billing.state === "CURRENT" ||
    billing.state === "NO_OPEN_PAYMENT"
  ) {
    return null;
  }

  if (billing.state === "DUE_SOON") {
    return (
      <section className="mb-5 flex flex-col gap-4 rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 shadow-[0_14px_36px_rgba(120,80,0,0.08)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <CalendarClock
            size={22}
            className="mt-0.5 shrink-0 text-amber-700"
          />

          <div>
            <strong className="block text-sm font-black">
              Pagamento próximo do vencimento
            </strong>

            <p className="mt-1 text-sm font-semibold leading-6 text-amber-800">
              O plano da empresa <strong>{business.name}</strong> vence em{" "}
              {billing.daysUntilDue} dias, no dia{" "}
              {formatDate(billing.dueAt)}.
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-amber-200 px-4 py-2 text-xs font-black text-amber-900">
          {billing.daysUntilDue} dias restantes
        </span>
      </section>
    );
  }

  if (billing.state === "DUE_TODAY") {
    return (
      <section className="mb-5 flex flex-col gap-4 rounded-[24px] border border-orange-300 bg-orange-50 px-5 py-4 text-orange-900 shadow-[0_14px_36px_rgba(140,70,0,0.10)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={22}
            className="mt-0.5 shrink-0 text-orange-700"
          />

          <div>
            <strong className="block text-sm font-black">
              O pagamento vence hoje
            </strong>

            <p className="mt-1 text-sm font-semibold leading-6 text-orange-800">
              Regularize o plano da empresa <strong>{business.name}</strong>{" "}
              para evitar a suspensão do acesso.
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-orange-200 px-4 py-2 text-xs font-black text-orange-900">
          Vence hoje
        </span>
      </section>
    );
  }

  if (billing.state === "PAST_DUE") {
    const remainingGraceDays = Math.max(
      0,
      billing.graceDays - billing.overdueDays
    );

    return (
      <section className="mb-5 flex flex-col gap-4 rounded-[24px] border border-red-300 bg-red-50 px-5 py-4 text-red-900 shadow-[0_14px_36px_rgba(140,0,0,0.10)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldAlert
            size={22}
            className="mt-0.5 shrink-0 text-red-700"
          />

          <div>
            <strong className="block text-sm font-black">
              Pagamento atrasado
            </strong>

            <p className="mt-1 text-sm font-semibold leading-6 text-red-800">
              O pagamento venceu em {formatDate(billing.dueAt)} e está
              atrasado há {billing.overdueDays}{" "}
              {billing.overdueDays === 1 ? "dia" : "dias"}. O acesso será
              suspenso quando terminar o período de tolerância.
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-red-200 px-4 py-2 text-xs font-black text-red-900">
          {remainingGraceDays > 0
            ? `${remainingGraceDays} dias de tolerância`
            : "Suspensão iminente"}
        </span>
      </section>
    );
  }

  return null;
}
