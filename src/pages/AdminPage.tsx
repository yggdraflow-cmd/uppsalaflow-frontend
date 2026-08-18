import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Ban,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  LoaderCircle,
  PauseCircle,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

import { Card } from "../components/Card";
import { AdminPaymentSettings } from "../components/AdminPaymentSettings";
import { AdminYggdraTechAbout } from "../components/AdminYggdraTechAbout";
import { api } from "../services/api";

type CompanyStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "UNDER_REVIEW"
  | "ACTIVE"
  | "BLOCKED"
  | "SUSPENDED"
  | "CANCELED";

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "OVERDUE"
  | "FAILED"
  | "CANCELED"
  | "REFUNDED";

type AdminView =
  | "overview"
  | "businesses"
  | "approvals"
  | "payments"
  | "yggdratech";
type BusinessAction =
  | "approve"
  | "reject"
  | "block"
  | "suspend"
  | "reactivate";

type Subscription = {
  id: string;
  plan: string;
  cycle?: "MONTHLY" | "SEMIANNUAL" | "ANNUAL";
  status: string;
  startedAt: string;
  expiresAt?: string | null;
};

type Payment = {
  id: string;
  provider: string;
  providerPaymentId?: string | null;
  amount: string | number;
  status: PaymentStatus;
  dueAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  business?: {
    id: string;
    name: string;
    slug: string;
    status: CompanyStatus;
    owner: {
      id: string;
      name: string;
      email: string;
    };
  };
  subscription?: Subscription | null;
};

type Business = {
  id: string;
  name: string;
  slug: string;
  status: CompanyStatus;
  statusReason?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  subscription?: Subscription | null;
  payments?: Payment[];
  _count: {
    clients: number;
    services: number;
    professionals: number;
    appointments: number;
    payments?: number;
  };
};

type Overview = {
  summary: {
    totalUsers: number;
    totalBusinesses: number;
    activeBusinesses: number;
    pendingBusinesses: number;
    paymentPendingBusinesses: number;
    underReviewBusinesses: number;
    blockedBusinesses: number;
    suspendedBusinesses: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    paymentAttentionSubscriptions: number;
    businessesWithoutSubscription: number;
    totalPayments: number;
    paidPayments: number;
    pendingPayments: number;
    overduePayments: number;
    failedPayments: number;
    paidRevenue: number;
  };
  businesses: Business[];
};

type ActionDialog = {
  business: Business;
  action: BusinessAction;
} | null;

const validViews: AdminView[] = [
  "overview",
  "businesses",
  "approvals",
  "payments",
  "yggdratech",
];

const actionMeta: Record<
  BusinessAction,
  {
    title: string;
    button: string;
    description: string;
    reasonRequired: boolean;
  }
> = {
  approve: {
    title: "Aprovar empresa",
    button: "Aprovar e liberar",
    description:
      "A empresa será marcada como ativa e poderá acessar os módulos contratados.",
    reasonRequired: false,
  },
  reject: {
    title: "Rejeitar empresa",
    button: "Confirmar rejeição",
    description:
      "A solicitação será cancelada e o motivo ficará registrado na auditoria.",
    reasonRequired: true,
  },
  block: {
    title: "Bloquear empresa",
    button: "Confirmar bloqueio",
    description:
      "O acesso operacional será interrompido até uma futura reativação.",
    reasonRequired: true,
  },
  suspend: {
    title: "Suspender empresa",
    button: "Confirmar suspensão",
    description:
      "A empresa ficará temporariamente impedida de operar na plataforma.",
    reasonRequired: true,
  },
  reactivate: {
    title: "Reativar empresa",
    button: "Reativar empresa",
    description:
      "A empresa voltará ao status ativo se assinatura e pagamento forem válidos.",
    reasonRequired: false,
  },
};

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("pt-BR") : "Não informado";
}

function formatDateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString("pt-BR") : "Não informado";
}

function formatCurrency(value: string | number) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function planLabel(subscription?: Subscription | null) {
  if (!subscription) {
    return "Sem plano";
  }

  const cycleLabels: Record<string, string> = {
    MONTHLY: "Mensal",
    SEMIANNUAL: "Semestral",
    ANNUAL: "Anual",
  };

  return (
    cycleLabels[subscription.cycle || ""] ||
    subscription.plan ||
    "Sem plano"
  );
}

function subscriptionLabel(status?: string | null) {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    ACTIVE: "Ativa",
    PAST_DUE: "Pagamento atrasado",
    CANCELED: "Cancelada",
    EXPIRED: "Expirada",
  };

  return status ? labels[status] || status : "Sem assinatura";
}

function companyStatusMeta(status: CompanyStatus) {
  const metadata: Record<CompanyStatus, { label: string; style: string }> = {
    PENDING: {
      label: "Cadastro pendente",
      style: "bg-amber-50 text-amber-700 ring-amber-200",
    },
    PAYMENT_PENDING: {
      label: "Pagamento pendente",
      style: "bg-orange-50 text-orange-700 ring-orange-200",
    },
    UNDER_REVIEW: {
      label: "Em análise",
      style: "bg-sky-50 text-sky-700 ring-sky-200",
    },
    ACTIVE: {
      label: "Ativa",
      style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
    BLOCKED: {
      label: "Bloqueada",
      style: "bg-red-50 text-red-700 ring-red-200",
    },
    SUSPENDED: {
      label: "Suspensa",
      style: "bg-violet-50 text-violet-700 ring-violet-200",
    },
    CANCELED: {
      label: "Cancelada",
      style: "bg-slate-100 text-slate-700 ring-slate-200",
    },
  };

  return metadata[status];
}

function paymentStatusMeta(status: PaymentStatus) {
  const metadata: Record<PaymentStatus, { label: string; style: string }> = {
    PENDING: {
      label: "Pendente",
      style: "bg-amber-50 text-amber-700 ring-amber-200",
    },
    PAID: {
      label: "Pago",
      style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
    OVERDUE: {
      label: "Atrasado",
      style: "bg-red-50 text-red-700 ring-red-200",
    },
    FAILED: {
      label: "Falhou",
      style: "bg-red-50 text-red-700 ring-red-200",
    },
    CANCELED: {
      label: "Cancelado",
      style: "bg-slate-100 text-slate-700 ring-slate-200",
    },
    REFUNDED: {
      label: "Estornado",
      style: "bg-violet-50 text-violet-700 ring-violet-200",
    },
  };

  return metadata[status];
}

type BillingAlert = {
  label: string;
  details: string;
  style: string;
};

function getSaoPauloDateOnly(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function dateOnlyToUtcTimestamp(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return Date.UTC(year, month - 1, day);
}

function differenceInCalendarDays(target: Date, current: Date) {
  const targetDate = getSaoPauloDateOnly(target);
  const currentDate = getSaoPauloDateOnly(current);

  return Math.round(
    (dateOnlyToUtcTimestamp(targetDate) -
      dateOnlyToUtcTimestamp(currentDate)) /
      86_400_000
  );
}

function getBillingAlert(
  payment?: Payment | null
): BillingAlert | null {
  if (
    !payment?.dueAt ||
    !["PENDING", "OVERDUE"].includes(payment.status)
  ) {
    return null;
  }

  const dueDate = new Date(payment.dueAt);

  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  const daysUntilDue = differenceInCalendarDays(
    dueDate,
    new Date()
  );

  const dueDateLabel = formatDate(payment.dueAt);

  if (daysUntilDue > 7) {
    return null;
  }

  if (daysUntilDue > 1) {
    return {
      label: `Vence em ${daysUntilDue} dias`,
      details: `Vencimento em ${dueDateLabel}`,
      style:
        "bg-amber-50 text-amber-800 ring-amber-200",
    };
  }

  if (daysUntilDue === 1) {
    return {
      label: "Vence amanhã",
      details: `Vencimento em ${dueDateLabel}`,
      style:
        "bg-amber-50 text-amber-800 ring-amber-200",
    };
  }

  if (daysUntilDue === 0) {
    return {
      label: "Vence hoje",
      details:
        "Regularize o pagamento para evitar suspensão.",
      style:
        "bg-orange-50 text-orange-800 ring-orange-200",
    };
  }

  const overdueDays = Math.abs(daysUntilDue);

  return {
    label:
      overdueDays === 1
        ? "Atrasado há 1 dia"
        : `Atrasado há ${overdueDays} dias`,
    details: `Venceu em ${dueDateLabel}`,
    style: "bg-red-50 text-red-800 ring-red-200",
  };
}

function BillingAlertBadge({
  payment,
}: {
  payment?: Payment | null;
}) {
  const alert = getBillingAlert(payment);

  if (!alert) {
    return null;
  }

  return (
    <div
      className={`mt-3 inline-flex max-w-full items-start gap-2 rounded-xl px-3 py-2 text-xs font-bold ring-1 ${alert.style}`}
    >
      <AlertTriangle
        className="mt-0.5 shrink-0"
        size={16}
      />

      <span className="min-w-0">
        <strong className="block font-black">
          {alert.label}
        </strong>

        <span className="mt-0.5 block">
          {alert.details}
        </span>
      </span>
    </div>
  );
}

function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  const meta = companyStatusMeta(status);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${meta.style}`}
    >
      {meta.label}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const meta = paymentStatusMeta(status);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${meta.style}`}
    >
      {meta.label}
    </span>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="admin-dashboard-empty rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <ShieldCheck className="mx-auto text-slate-400" size={34} />
      <h3 className="mt-4 font-black text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{text}</p>
    </div>
  );
}

export function AdminPage() {
  const [searchParams] = useSearchParams();

  const requestedView =
    searchParams.get("view") as AdminView | null;

  const currentView =
    requestedView && validViews.includes(requestedView)
      ? requestedView
      : "overview";

  const yggdraTechSection =
    searchParams.get("section") || "about";

  const [overview, setOverview] = useState<Overview | null>(null);
  const [approvals, setApprovals] = useState<Business[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
const [pendingStepIndex, setPendingStepIndex] = useState(0);
  const [companyStatus, setCompanyStatus] = useState<CompanyStatus | "ALL">(
    "ALL"
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "ALL">(
    "ALL"
  );
  const [dialog, setDialog] = useState<ActionDialog>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<
    string | null
  >(null);

  const loadData = useCallback(async (refresh = false) => {
    try {
      refresh ? setIsRefreshing(true) : setIsLoading(true);
      setError("");

      const [overviewResponse, approvalsResponse, paymentsResponse] =
        await Promise.all([
          api.get<Overview>("/admin/overview"),
          api.get<Business[]>("/admin/approvals"),
          api.get<Payment[]>("/admin/payments"),
        ]);

      setOverview(overviewResponse.data);
      setApprovals(approvalsResponse.data);
      setPayments(paymentsResponse.data);
    } catch {
      setError(
        "Não foi possível carregar o Super Admin. Confirme se o backend está ativo e se a conta possui papel ADMIN."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setSuccess("");
  }, [currentView]);

  const filteredBusinesses = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase("pt-BR");

    return (overview?.businesses || []).filter((business) => {
      const matchesStatus =
        companyStatus === "ALL" || business.status === companyStatus;
      const matchesSearch =
        !normalized ||
        business.name.toLocaleLowerCase("pt-BR").includes(normalized) ||
        business.slug.toLocaleLowerCase("pt-BR").includes(normalized) ||
        business.owner.name
          .toLocaleLowerCase("pt-BR")
          .includes(normalized) ||
        business.owner.email
          .toLocaleLowerCase("pt-BR")
          .includes(normalized);

      return matchesStatus && matchesSearch;
    });
  }, [companyStatus, overview?.businesses, search]);

  const filteredPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          paymentStatus === "ALL" || payment.status === paymentStatus
      ),
    [paymentStatus, payments]
  );

  const billingAttentionPayments = useMemo(
    () =>
      payments.filter((payment) =>
        Boolean(getBillingAlert(payment))
      ),
    [payments]
  );

  function openDialog(business: Business, action: BusinessAction) {
    setReason("");
    setDialog({ business, action });
  }

  function closeDialog() {
    if (!isSubmitting) {
      setDialog(null);
      setReason("");
    }
  }

  async function submitAction() {
    if (!dialog) {
      return;
    }

    const meta = actionMeta[dialog.action];
    const normalizedReason = reason.trim();

    if (meta.reasonRequired && normalizedReason.length < 3) {
      setError("Informe um motivo com pelo menos 3 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      const response = await api.patch<{ message: string }>(
        `/admin/businesses/${dialog.business.id}/${dialog.action}`,
        normalizedReason ? { reason: normalizedReason } : {}
      );

      setSuccess(response.data.message);
      setDialog(null);
      setReason("");
      await loadData(true);
    } catch (requestError: unknown) {
      let message = "Não foi possível concluir a ação administrativa.";

      if (
        typeof requestError === "object" &&
        requestError !== null &&
        "response" in requestError
      ) {
        const response = (
          requestError as { response?: { data?: { message?: string } } }
        ).response;

        message = response?.data?.message || message;
      }

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function getPaymentForBusiness(businessId: string) {
    return (
      payments.find(
        (payment) =>
          payment.business?.id === businessId &&
          (payment.status === "PENDING" ||
            payment.status === "OVERDUE")
      ) ||
      payments.find(
        (payment) => payment.business?.id === businessId
      )
    );
  }

  async function confirmPayment(payment: Payment) {
    try {
      setConfirmingPaymentId(payment.id);
      setError("");
      setSuccess("");

      const response = await api.patch<{ message: string }>(
        `/billing/admin/payments/${payment.id}/confirm`
      );

      setSuccess(response.data.message);
      await loadData(true);
    } catch (requestError: unknown) {
      let message =
        "Não foi possível confirmar o pagamento.";

      if (
        typeof requestError === "object" &&
        requestError !== null &&
        "response" in requestError
      ) {
        const response = (
          requestError as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        ).response;

        message = response?.data?.message || message;
      }

      setError(message);
    } finally {
      setConfirmingPaymentId(null);
    }
  }

  const revenueLast7Days = useMemo(() => {
    const today = new Date();

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      return {
        key,
        label: date
          .toLocaleDateString("pt-BR", { weekday: "short" })
          .replace(".", ""),
        revenue: 0,
      };
    });

    const daysByKey = new Map(days.map((day) => [day.key, day]));

    payments.forEach((payment) => {
      if (payment.status !== "PAID") {
        return;
      }

      const paymentDate = new Date(payment.paidAt || payment.createdAt);

      if (Number.isNaN(paymentDate.getTime())) {
        return;
      }

      const key = [
        paymentDate.getFullYear(),
        String(paymentDate.getMonth() + 1).padStart(2, "0"),
        String(paymentDate.getDate()).padStart(2, "0"),
      ].join("-");

      const day = daysByKey.get(key);

      if (!day) {
        return;
      }

      day.revenue += Number(payment.amount) || 0;
    });

    const total = days.reduce((sum, day) => sum + day.revenue, 0);
    const maxRevenue = Math.max(...days.map((day) => day.revenue), 0);

    const baseline = 84;
    const chartHeight = 62;

    const points = days.map((day, index) => {
      const x = index * (300 / (days.length - 1));

      const y =
        maxRevenue > 0
          ? baseline - (day.revenue / maxRevenue) * chartHeight
          : baseline;

      return {
        x,
        y,
      };
    });

    const path = points.reduce((currentPath, point, index) => {
      if (index === 0) {
        return `M${point.x},${point.y}`;
      }

      const previousPoint = points[index - 1];
      const middleX = (previousPoint.x + point.x) / 2;

      return `${currentPath} C${middleX},${previousPoint.y} ${middleX},${point.y} ${point.x},${point.y}`;
    }, "");

    const areaPath = path ? `${path} L300,100 L0,100 Z` : "";

    const lastPoint = points[points.length - 1] || {
      x: 300,
      y: baseline,
    };

    return {
      days,
      total,
      path,
      areaPath,
      lastPoint,
    };
  }, [payments]);

  const attentionItems = [
    {
      label: "Aguardando pagamento",
      value: overview?.summary.paymentPendingBusinesses || 0,
      description: "Empresas aguardando confirmação de pagamento",
      icon: CreditCard,
    },
    {
      label: "Em análise",
      value: overview?.summary.underReviewBusinesses || 0,
      description: "Cadastros aguardando análise administrativa",
      icon: ShieldCheck,
    },
    {
      label: "Pagamentos atrasados",
      value: overview?.summary.overduePayments || 0,
      description: "Cobranças vencidas que exigem atenção",
      icon: AlertTriangle,
    },
    {
      label: "Empresas suspensas",
      value: overview?.summary.suspendedBusinesses || 0,
      description: "Empresas temporariamente sem acesso",
      icon: PauseCircle,
    },
  ];

  const activeAttentionItem =
    attentionItems[pendingStepIndex] || attentionItems[0];

  const summaryCards = [
    {
      title: "Empresas ativas",
      value: overview?.summary.activeBusinesses || 0,
      helper: `${overview?.summary.totalBusinesses || 0} cadastradas`,
      icon: Building2,
    },
    {
      title: "Aguardando liberação",
      value:
        (overview?.summary.pendingBusinesses || 0) +
        (overview?.summary.paymentPendingBusinesses || 0) +
        (overview?.summary.underReviewBusinesses || 0),
      helper: "Cadastros em análise",
      icon: Clock3,
    },
    {
      title: "Pagamentos confirmados",
      value: overview?.summary.paidPayments || 0,
      helper: `${overview?.summary.overduePayments || 0} atrasados`,
      icon: CheckCircle2,
    },
    {
      title: "Receita confirmada",
      value: formatCurrency(overview?.summary.paidRevenue || 0),
      helper: "Pagamentos com status pago",
      icon: CircleDollarSign,
    },
  ];

  if (isLoading) {
    return (
      <Card className="admin-dashboard-card">
        <div className="flex min-h-64 items-center justify-center gap-3 text-sm font-bold text-slate-500">
          <LoaderCircle className="animate-spin" size={22} />
          Carregando administração da plataforma...
        </div>
      </Card>
    );
  }

  return (
    <div className="admin-dashboard-page min-w-0">
      <div className="admin-dashboard-heading mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="admin-dashboard-kicker text-sm font-black">
            Super Admin da plataforma
          </p>
          <h1 className="admin-dashboard-title mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            {currentView === "overview" && "Dashboard"}
            {currentView === "businesses" && "Empresas"}
            {currentView === "approvals" && "Liberações pendentes"}
            {currentView === "payments" && "Pagamentos"}
            {currentView === "yggdratech" &&
              yggdraTechSection === "home" &&
              "YggdraTech · Home"}
            {currentView === "yggdratech" &&
              yggdraTechSection === "about" &&
              "YggdraTech · Quem Somos"}
            {currentView === "yggdratech" &&
              yggdraTechSection === "services" &&
              "YggdraTech · Soluções"}
          </h1>
          <p className="admin-dashboard-description mt-2 max-w-3xl text-sm leading-6">
            {currentView === "yggdratech"
              ? "Gerencie o conteúdo institucional exibido no site público da YggdraTech."
              : "Controle central de empresas, cobranças, assinaturas e acesso ao YggdraFlow."}
          </p>
        </div>

        {currentView !== "yggdratech" ? (
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="admin-dashboard-refresh inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black transition disabled:opacity-60"
          >
            <RefreshCw
              className={isRefreshing ? "animate-spin" : ""}
              size={18}
            />
            Atualizar dados
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <AlertTriangle className="mt-0.5 shrink-0" size={19} />
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="mt-0.5 shrink-0" size={19} />
          {success}
        </div>
      ) : null}

      {billingAttentionPayments.length > 0 &&
      (currentView === "overview" ||
        currentView === "businesses" ||
        currentView === "payments") ? (
        <div className="admin-dashboard-alert mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <AlertTriangle
            className="mt-0.5 shrink-0 text-amber-700"
            size={22}
          />

          <div className="min-w-0">
            <strong className="block font-black">
              {billingAttentionPayments.length}{" "}
              {billingAttentionPayments.length === 1
                ? "cobrança exige"
                : "cobranças exigem"}{" "}
              atenção
            </strong>

            <p className="mt-1 text-sm font-semibold leading-6 text-amber-800">
              {billingAttentionPayments
                .map(
                  (payment) =>
                    payment.business?.name ||
                    "Empresa não informada"
                )
                .join(", ")}
            </p>
          </div>
        </div>
      ) : null}

      {currentView === "overview" ? (
        <div className="space-y-6">
          <div className="admin-dashboard-summary-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((item) => {
              const Icon = item.icon;

              return (
                <Card className="admin-dashboard-card" key={item.title}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-500">
                        {item.title}
                      </p>
                      <strong className="mt-2 block text-3xl font-black text-slate-950">
                        {item.value}
                      </strong>
                      <p className="mt-2 text-xs font-semibold text-slate-400">
                        {item.helper}
                      </p>
                    </div>
                    <span className="rounded-2xl bg-[#e9f0f3] p-3 text-[#102b3a]">
                      <Icon size={22} />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <article className="admin-dashboard-chart-panel overflow-hidden rounded-2xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--admin-muted)] text-[var(--admin-accent)]">
                  <CircleDollarSign size={24} />
                </span>

                <div>
                  <h2 className="text-xl font-black text-[var(--admin-primary-text)]">
                    Receita da plataforma
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[var(--admin-primary-text)] opacity-50">
                    Movimento financeiro dos últimos 7 dias
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex divide-x divide-[var(--admin-muted)] border-t border-[var(--admin-muted)] pt-6">
              <div className="min-w-0 flex-1 pr-5 sm:pr-8">
                <p className="text-xs font-semibold text-[var(--admin-primary-text)] opacity-45">
                  Receita confirmada
                </p>

                <p className="mt-1 truncate text-2xl font-black text-[var(--admin-primary-text)] sm:text-3xl">
                  {formatCurrency(overview?.summary.paidRevenue || 0)}
                </p>

                <p className="mt-2 text-xs font-bold text-[var(--admin-accent)]">
                  {overview?.summary.paidPayments || 0} pagamentos pagos
                </p>
              </div>

              <div className="min-w-0 flex-1 pl-5 sm:pl-8">
                <p className="text-xs font-semibold text-[var(--admin-primary-text)] opacity-45">
                  Últimos 7 dias
                </p>

                <p className="mt-1 truncate text-2xl font-black text-[var(--admin-primary-text)] sm:text-3xl">
                  {formatCurrency(revenueLast7Days.total)}
                </p>

                <p className="mt-2 text-xs font-bold text-[var(--admin-accent)]">
                  {(overview?.summary.pendingPayments || 0) +
                    (overview?.summary.overduePayments || 0)}{" "}
                  exigem atenção
                </p>
              </div>
            </div>

            <div className="admin-dashboard-bar-chart mt-8">
              {revenueLast7Days.days.map((day) => {
                const maxRevenue = Math.max(
                  ...revenueLast7Days.days.map((item) => item.revenue),
                  1
                );

                const height = Math.max(
                  day.revenue > 0 ? 14 : 4,
                  (day.revenue / maxRevenue) * 100
                );

                return (
                  <div
                    key={day.key}
                    className="admin-dashboard-bar-column"
                  >
                    <div className="admin-dashboard-bar-track">
                      <div
                        className="admin-dashboard-bar"
                        style={{ height: height + "%" }}
                        title={
                          day.label +
                          ": " +
                          formatCurrency(day.revenue)
                        }
                      />
                    </div>

                    <span>{day.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[var(--admin-muted)] pt-5">
              <span className="text-xs font-semibold text-[var(--admin-primary-text)] opacity-45">
                Somente pagamentos confirmados
              </span>

              <span className="text-xs font-black text-[var(--admin-primary-text)] opacity-75">
                {overview?.summary.totalPayments || 0} pagamentos registrados
              </span>
            </div>
          </article>

            <article className="admin-dashboard-recent-panel rounded-2xl p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-black">
                  Pagamentos recentes
                </h2>

                <p className="mt-1 text-sm admin-dashboard-muted">
                  Últimos registros financeiros da plataforma.
                </p>
              </div>

              <div className="admin-dashboard-recent-list mt-6">
                {payments.length === 0 ? (
                  <div className="admin-dashboard-recent-empty">
                    Nenhum pagamento registrado.
                  </div>
                ) : (
                  payments.slice(0, 5).map((payment) => (
                    <div
                      key={payment.id}
                      className="admin-dashboard-recent-row"
                    >
                      <span className="admin-dashboard-recent-avatar">
                        <CircleDollarSign size={17} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <strong className="block truncate text-sm">
                          {payment.business?.name ||
                            "Empresa não informada"}
                        </strong>

                        <span className="mt-1 block truncate text-xs admin-dashboard-muted">
                          {payment.business?.owner.email ||
                            payment.provider}
                        </span>
                      </div>

                      <div className="shrink-0 text-right">
                        <strong className="block text-sm">
                          {formatCurrency(payment.amount)}
                        </strong>

                        <span className="mt-1 block text-xs admin-dashboard-muted">
                          {paymentStatusMeta(payment.status).label}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>

          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <Card className="admin-dashboard-card" title="Pendências que exigem atenção">
              {activeAttentionItem ? (() => {
                const Icon = activeAttentionItem.icon;
                const hasAttention = activeAttentionItem.value > 0;

                return (
                  <div className="flex min-h-[360px] flex-col justify-between py-3">
                    <div>
                      <div className="mb-8 flex items-center justify-between">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-black"
                          style={{
                            background: "var(--admin-muted)",
                            color: "var(--admin-primary)",
                          }}
                        >
                          {pendingStepIndex + 1} de {attentionItems.length}
                        </span>

                        <div className="flex gap-2">
                          {attentionItems.map((item, index) => (
                            <span
                              key={item.label}
                              className="h-2.5 w-2.5 rounded-full transition-all"
                              style={{
                                background:
                                  index === pendingStepIndex
                                    ? "var(--admin-primary)"
                                    : "var(--admin-muted)",
                                transform:
                                  index === pendingStepIndex
                                    ? "scale(1.2)"
                                    : "scale(1)",
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-start gap-5">
                        <div className="relative flex shrink-0 flex-col items-center">
                          <div
                            className="admin-attention-icon flex h-16 w-16 items-center justify-center rounded-full shadow-[0_12px_30px_var(--admin-shadow)]"
                            style={
                              hasAttention
                                ? {
                                    border: "2px solid var(--admin-accent)",
                                    background: "var(--admin-card)",
                                    color: "var(--admin-accent-text)",
                                  }
                                : {
                                    background: "var(--admin-primary)",
                                    color: "var(--admin-primary-text)",
                                  }
                            }
                          >
                            {hasAttention ? (
                              <Icon size={27} />
                            ) : (
                              <CheckCircle2 size={28} />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-2xl font-black text-slate-950">
                            {activeAttentionItem.label}
                          </h3>

                          <span
                            className="admin-attention-badge mt-3 inline-flex rounded-full px-4 py-1.5 text-sm font-black"
                            style={
                              hasAttention
                                ? {
                                    background: "var(--admin-accent)",
                                    color: "var(--admin-accent-text)",
                                  }
                                : {
                                    background: "var(--admin-muted)",
                                    color: "var(--admin-primary)",
                                  }
                            }
                          >
                            {hasAttention
                              ? `${activeAttentionItem.value} ${
                                  activeAttentionItem.value === 1
                                    ? "pendência"
                                    : "pendências"
                                }`
                              : "Sem pendências"}
                          </span>

                          <p className="mt-4 max-w-lg text-sm font-semibold leading-6 text-slate-400">
                            {activeAttentionItem.description}
                          </p>

                          <div
                            className="mt-7 rounded-[22px] p-5"
                            style={{
                              background: "var(--admin-muted)",
                            }}
                          >
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                              Total atual
                            </p>

                            <strong
                              className="admin-attention-total mt-2 block text-4xl font-black"
                              style={{
                                color: hasAttention
                                  ? "var(--admin-accent-text)"
                                  : "var(--admin-primary)",
                              }}
                            >
                              {activeAttentionItem.value}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
                      <button
                        type="button"
                        onClick={() =>
                          setPendingStepIndex((current) =>
                            Math.max(0, current - 1)
                          )
                        }
                        disabled={pendingStepIndex === 0}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <ArrowLeft size={17} />
                        Voltar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setPendingStepIndex((current) =>
                            current === attentionItems.length - 1
                              ? 0
                              : current + 1
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black shadow-[0_10px_24px_var(--admin-shadow)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
                        style={{
                          background: "var(--admin-primary)",
                          color: "var(--admin-primary-text)",
                        }}
                      >
                        Próximo
                        <ArrowRight size={17} />
                      </button>
                    </div>
                  </div>
                );
              })() : null}
            </Card>

            <Card className="admin-dashboard-card">
              <div className="admin-health-palette">
                <div className="admin-health-palette-header">
                  <h2 className="admin-health-palette-title">
                    Saúde da plataforma
                  </h2>

                  <p className="admin-health-palette-subtitle">
                    Visão geral operacional
                  </p>
                </div>

                <div className="admin-health-palette-list">
                  <div className="admin-health-palette-row admin-health-palette-primary">
                    <span>Usuários</span>
                    <strong>{overview?.summary.totalUsers || 0}</strong>
                  </div>

                  <div className="admin-health-palette-row admin-health-palette-accent">
                    <span>Assinaturas ativas</span>
                    <strong>
                      {overview?.summary.activeSubscriptions || 0}
                    </strong>
                  </div>

                  <div className="admin-health-palette-row admin-health-palette-muted">
                    <span>Sem assinatura</span>
                    <strong>
                      {overview?.summary.businessesWithoutSubscription || 0}
                    </strong>
                  </div>

                  <div className="admin-health-palette-row admin-health-palette-card">
                    <span>Pagamentos registrados</span>
                    <strong>{overview?.summary.totalPayments || 0}</strong>
                  </div>
                </div>

                <p className="admin-health-palette-footer">
                  Indicadores atualizados com os dados da plataforma
                </p>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {currentView === "approvals" ? (
        <Card className="admin-dashboard-card" title={`Fila de liberações (${approvals.length})`}>
          {approvals.length === 0 ? (
            <EmptyState
              title="Nenhuma liberação pendente"
              text="Quando uma empresa concluir cadastro e pagamento, ela aparecerá aqui para análise."
            />
          ) : (
            <div className="space-y-4">
              {approvals.map((business) => {
                const latestPayment = business.payments?.[0];

                return (
                  <article
                    key={business.id}
                    className="admin-dashboard-list-card rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-black text-slate-950">
                            {business.name}
                          </h2>
                          <CompanyStatusBadge status={business.status} />
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          Responsável: <strong>{business.owner.name}</strong> •{" "}
                          {business.owner.email}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Cadastro em {formatDateTime(business.createdAt)} • plano{" "}
                          {planLabel(business.subscription)}
                        </p>

                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Último pagamento
                          </p>
                          {latestPayment ? (
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              <strong className="text-lg text-slate-950">
                                {formatCurrency(latestPayment.amount)}
                              </strong>
                              <PaymentStatusBadge status={latestPayment.status} />
                              <span className="text-sm text-slate-500">
                                {latestPayment.provider}
                              </span>
                            </div>
                          ) : (
                            <p className="mt-2 text-sm font-semibold text-amber-700">
                              Nenhum pagamento registrado.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        {business.status === "PAYMENT_PENDING" &&
                        latestPayment?.status === "PENDING" ? (
                          <button
                            type="button"
                            disabled={
                              confirmingPaymentId === latestPayment.id
                            }
                            onClick={() =>
                              confirmPayment(latestPayment)
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {confirmingPaymentId === latestPayment.id ? (
                              <LoaderCircle
                                className="animate-spin"
                                size={17}
                              />
                            ) : (
                              <CircleDollarSign size={17} />
                            )}
                            Confirmar pagamento
                          </button>
                        ) : null}

                        {business.status === "UNDER_REVIEW" ? (
                          <button
                            type="button"
                            onClick={() =>
                              openDialog(business, "approve")
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700"
                          >
                            <CheckCircle2 size={17} />
                            Aprovar e liberar
                          </button>
                        ) : null}

                        {business.status === "PENDING" ? (
                          <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-700 ring-1 ring-amber-200">
                            <Clock3 size={17} />
                            Aguardando escolha do plano
                          </span>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => openDialog(business, "reject")}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-black text-red-700 hover:bg-red-50"
                        >
                          <XCircle size={17} />
                          Rejeitar
                        </button>
                        <button
                          type="button"
                          onClick={() => openDialog(business, "block")}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-100"
                        >
                          <Ban size={17} />
                          Bloquear
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Card>
      ) : null}

      {currentView === "businesses" ? (
        <Card className="admin-dashboard-card" title={`Empresas cadastradas (${filteredBusinesses.length})`}>
          <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_230px]">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={19}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por empresa, dono, e-mail ou slug"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold outline-none focus:border-[#102b3a]"
              />
            </label>

            <select
              value={companyStatus}
              onChange={(event) =>
                setCompanyStatus(event.target.value as CompanyStatus | "ALL")
              }
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#102b3a]"
            >
              <option value="ALL">Todos os status</option>
              <option value="PENDING">Cadastro pendente</option>
              <option value="PAYMENT_PENDING">Pagamento pendente</option>
              <option value="UNDER_REVIEW">Em análise</option>
              <option value="ACTIVE">Ativas</option>
              <option value="BLOCKED">Bloqueadas</option>
              <option value="SUSPENDED">Suspensas</option>
              <option value="CANCELED">Canceladas</option>
            </select>
          </div>

          {filteredBusinesses.length === 0 ? (
            <EmptyState
              title="Nenhuma empresa encontrada"
              text="Ajuste a busca ou o filtro de status para consultar outro conjunto de empresas."
            />
          ) : (
            <div className="space-y-3">
              {filteredBusinesses.map((business) => (
                <article
                  key={business.id}
                  className="admin-dashboard-list-card rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-black text-slate-950">
                          {business.name}
                        </h2>
                        <CompanyStatusBadge status={business.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        {business.owner.name} • {business.owner.email}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Plano {planLabel(business.subscription)} •{" "}
                        {subscriptionLabel(business.subscription?.status)}
                      </p>

                      <BillingAlertBadge
                        payment={getPaymentForBusiness(business.id)}
                      />

                      {business.statusReason ? (
                        <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                          Motivo atual: {business.statusReason}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                        <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                          {business._count.clients} clientes
                        </span>
                        <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                          {business._count.professionals} profissionais
                        </span>
                        <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                          {business._count.appointments} agendamentos
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      {business.status === "PAYMENT_PENDING" &&
                      getPaymentForBusiness(business.id)?.status ===
                        "PENDING" ? (
                        <button
                          type="button"
                          disabled={
                            confirmingPaymentId ===
                            getPaymentForBusiness(business.id)?.id
                          }
                          onClick={() => {
                            const payment =
                              getPaymentForBusiness(business.id);

                            if (payment) {
                              void confirmPayment(payment);
                            }
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {confirmingPaymentId ===
                          getPaymentForBusiness(business.id)?.id ? (
                            <LoaderCircle
                              className="animate-spin"
                              size={17}
                            />
                          ) : (
                            <CircleDollarSign size={17} />
                          )}
                          Confirmar pagamento
                        </button>
                      ) : null}

                      {business.status === "UNDER_REVIEW" ? (
                        <button
                          type="button"
                          onClick={() =>
                            openDialog(business, "approve")
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700"
                        >
                          <CheckCircle2 size={17} />
                          Aprovar e liberar
                        </button>
                      ) : null}

                      {business.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-700 ring-1 ring-amber-200">
                          <Clock3 size={17} />
                          Aguardando plano
                        </span>
                      ) : null}

                      {business.status === "ACTIVE" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => openDialog(business, "suspend")}
                            className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-black text-violet-700 hover:bg-violet-50"
                          >
                            <PauseCircle size={17} />
                            Suspender
                          </button>
                          <button
                            type="button"
                            onClick={() => openDialog(business, "block")}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-black text-red-700 hover:bg-red-50"
                          >
                            <Ban size={17} />
                            Bloquear
                          </button>
                        </>
                      ) : null}

                      {business.status === "BLOCKED" ||
                      business.status === "SUSPENDED" ? (
                        <button
                          type="button"
                          onClick={() => openDialog(business, "reactivate")}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#102b3a] px-4 py-2.5 text-sm font-black text-white hover:bg-[#173d50]"
                        >
                          <RotateCcw size={17} />
                          Reativar
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      ) : null}

      {currentView === "yggdratech" &&
      yggdraTechSection === "about" ? (
        <AdminYggdraTechAbout />
      ) : null}

      {currentView === "yggdratech" &&
      yggdraTechSection === "home" ? (
        <Card
          className="admin-dashboard-card"
          title="Home da YggdraTech"
        >
          <p className="text-sm font-semibold leading-6 text-slate-500">
            A gestão dinâmica da Home será configurada em uma etapa própria.
          </p>
        </Card>
      ) : null}

      {currentView === "yggdratech" &&
      yggdraTechSection === "services" ? (
        <Card
          className="admin-dashboard-card"
          title="Soluções da YggdraTech"
        >
          <p className="text-sm font-semibold leading-6 text-slate-500">
            Esta será a próxima área administrável, com destaque para o
            YggdraFlow e as soluções de desenvolvimento da YggdraTech.
          </p>
        </Card>
      ) : null}

      {currentView === "payments" ? (
        <div className="space-y-6">
          <AdminPaymentSettings />

          <Card className="admin-dashboard-card" title={`Pagamentos (${filteredPayments.length})`}>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Histórico financeiro registrado pela plataforma.
            </p>
            <select
              value={paymentStatus}
              onChange={(event) =>
                setPaymentStatus(event.target.value as PaymentStatus | "ALL")
              }
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#102b3a]"
            >
              <option value="ALL">Todos os status</option>
              <option value="PAID">Pagos</option>
              <option value="PENDING">Pendentes</option>
              <option value="OVERDUE">Atrasados</option>
              <option value="FAILED">Falharam</option>
              <option value="CANCELED">Cancelados</option>
              <option value="REFUNDED">Estornados</option>
            </select>
          </div>

          {filteredPayments.length === 0 ? (
            <EmptyState
              title="Nenhum pagamento encontrado"
              text="Os pagamentos aparecerão aqui assim que forem registrados pelo provedor de cobrança."
            />
          ) : (
            <div className="admin-dashboard-table overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-[900px] w-full border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">Plano</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Vencimento</th>
                    <th className="px-4 py-3">Pagamento</th>
                    <th className="px-4 py-3">Provedor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-4">
                        <strong className="block text-slate-950">
                          {payment.business?.name || "Empresa não informada"}
                        </strong>
                        <span className="text-xs text-slate-500">
                          {payment.business?.owner.email || ""}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-600">
                        {planLabel(payment.subscription)}
                      </td>
                      <td className="px-4 py-4 font-black text-slate-950">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-4">
                        <PaymentStatusBadge status={payment.status} />

                        <BillingAlertBadge payment={payment} />
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(payment.dueAt)}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(payment.paidAt)}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {payment.provider}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </Card>
        </div>
      ) : null}

      {dialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="admin-dashboard-modal w-full max-w-lg rounded-[28px] border border-white/80 bg-white p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                  Ação administrativa
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  {actionMeta[dialog.action].title}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Fechar"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <strong className="block text-slate-950">
                {dialog.business.name}
              </strong>
              <p className="mt-1 text-sm text-slate-500">
                {actionMeta[dialog.action].description}
              </p>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-black text-slate-700">
                Motivo{actionMeta[dialog.action].reasonRequired ? " *" : ""}
              </span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Registre o motivo ou uma observação administrativa."
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-[#102b3a]"
              />
              <span className="mt-1 block text-right text-xs text-slate-400">
                {reason.length}/500
              </span>
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDialog}
                disabled={isSubmitting}
                className="h-12 rounded-2xl border border-slate-200 px-5 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submitAction}
                disabled={isSubmitting}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#102b3a] px-5 text-sm font-black text-white hover:bg-[#173d50] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <LoaderCircle className="animate-spin" size={18} />
                ) : (
                  <ShieldCheck size={18} />
                )}
                {actionMeta[dialog.action].button}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
