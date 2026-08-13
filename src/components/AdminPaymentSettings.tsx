import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Link2,
  LoaderCircle,
  QrCode,
  RefreshCw,
  Save,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { api } from "../services/api";
import type { BillingCycle } from "../types/business";

type PaymentOption = {
  id: string;
  cycle: BillingCycle;
  paymentLink?: string | null;
  pixCopyPaste?: string | null;
  pixQrCodeUrl?: string | null;
  instructions?: string | null;
  active: boolean;
  updatedAt: string;
};

type PaymentOptionForm = {
  paymentLink: string;
  pixCopyPaste: string;
  pixQrCodeUrl: string;
  instructions: string;
  active: boolean;
};

type BillingPlan = {
  id: string;
  cycle: BillingCycle;
  label: string;
  installments: number;
  installmentAmount: number;
  totalAmount: number;
  active: boolean;
  updatedById?: string | null;
  createdAt: string;
  updatedAt: string;
};

type BillingPlanForm = {
  installmentAmount: string;
  active: boolean;
};

const cycleOptions: Array<{
  cycle: BillingCycle;
  title: string;
  installments: number;
}> = [
  {
    cycle: "MONTHLY",
    title: "Mensal",
    installments: 1,
  },
  {
    cycle: "SEMIANNUAL",
    title: "Semestral",
    installments: 6,
  },
  {
    cycle: "ANNUAL",
    title: "Anual",
    installments: 12,
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function parseMoneyInput(value: string) {
  return Number(
    value
      .trim()
      .replace(/\s/g, "")
      .replace(",", ".")
  );
}

function createEmptyPaymentForm(): PaymentOptionForm {
  return {
    paymentLink: "",
    pixCopyPaste: "",
    pixQrCodeUrl: "",
    instructions: "",
    active: true,
  };
}

function createInitialPaymentForms(): Record<
  BillingCycle,
  PaymentOptionForm
> {
  return {
    MONTHLY: createEmptyPaymentForm(),
    SEMIANNUAL: createEmptyPaymentForm(),
    ANNUAL: createEmptyPaymentForm(),
  };
}

function createEmptyBillingPlanForm(): BillingPlanForm {
  return {
    installmentAmount: "",
    active: true,
  };
}

function createInitialBillingPlanForms(): Record<
  BillingCycle,
  BillingPlanForm
> {
  return {
    MONTHLY: createEmptyBillingPlanForm(),
    SEMIANNUAL: createEmptyBillingPlanForm(),
    ANNUAL: createEmptyBillingPlanForm(),
  };
}

function optionToForm(
  option: PaymentOption
): PaymentOptionForm {
  return {
    paymentLink: option.paymentLink || "",
    pixCopyPaste: option.pixCopyPaste || "",
    pixQrCodeUrl: option.pixQrCodeUrl || "",
    instructions: option.instructions || "",
    active: option.active,
  };
}

function billingPlanToForm(
  plan: BillingPlan
): BillingPlanForm {
  return {
    installmentAmount: String(
      plan.installmentAmount
    ).replace(".", ","),
    active: plan.active,
  };
}

export function AdminPaymentSettings() {
  const [paymentForms, setPaymentForms] = useState<
    Record<BillingCycle, PaymentOptionForm>
  >(createInitialPaymentForms);

  const [billingPlanForms, setBillingPlanForms] =
    useState<
      Record<BillingCycle, BillingPlanForm>
    >(createInitialBillingPlanForms);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [
    savingPaymentCycle,
    setSavingPaymentCycle,
  ] = useState<BillingCycle | null>(null);

  const [
    savingBillingCycle,
    setSavingBillingCycle,
  ] = useState<BillingCycle | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadSettings = useCallback(
    async (refresh = false) => {
      try {
        refresh
          ? setIsRefreshing(true)
          : setIsLoading(true);

        setError("");
        setSuccess("");

        const [
          paymentOptionsResponse,
          billingPlansResponse,
        ] = await Promise.all([
          api.get<PaymentOption[]>(
            "/billing/admin/payment-options"
          ),
          api.get<BillingPlan[]>(
            "/billing/admin/billing-plans"
          ),
        ]);

        const nextPaymentForms =
          createInitialPaymentForms();

        paymentOptionsResponse.data.forEach(
          (option) => {
            nextPaymentForms[option.cycle] =
              optionToForm(option);
          }
        );

        const nextBillingPlanForms =
          createInitialBillingPlanForms();

        billingPlansResponse.data.forEach(
          (plan) => {
            nextBillingPlanForms[plan.cycle] =
              billingPlanToForm(plan);
          }
        );

        setPaymentForms(nextPaymentForms);
        setBillingPlanForms(
          nextBillingPlanForms
        );
      } catch {
        setError(
          "Não foi possível carregar as configurações financeiras."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function updatePaymentField(
    cycle: BillingCycle,
    field: keyof PaymentOptionForm,
    value: string | boolean
  ) {
    setPaymentForms((current) => ({
      ...current,
      [cycle]: {
        ...current[cycle],
        [field]: value,
      },
    }));
  }

  function updateBillingPlanField(
    cycle: BillingCycle,
    field: keyof BillingPlanForm,
    value: string | boolean
  ) {
    setBillingPlanForms((current) => ({
      ...current,
      [cycle]: {
        ...current[cycle],
        [field]: value,
      },
    }));
  }

  async function saveBillingPlan(
    cycle: BillingCycle
  ) {
    const form =
      billingPlanForms[cycle];

    const installmentAmount =
      parseMoneyInput(
        form.installmentAmount
      );

    if (
      !Number.isFinite(
        installmentAmount
      ) ||
      installmentAmount <= 0
    ) {
      setError(
        "Informe um valor válido maior que zero."
      );
      setSuccess("");
      return;
    }

    try {
      setSavingBillingCycle(cycle);
      setError("");
      setSuccess("");

      const response = await api.put<{
        message: string;
        plan: BillingPlan;
      }>(
        `/billing/admin/billing-plans/${cycle}`,
        {
          installmentAmount,
          active: form.active,
        }
      );

      setBillingPlanForms(
        (current) => ({
          ...current,
          [cycle]:
            billingPlanToForm(
              response.data.plan
            ),
        })
      );

      setSuccess(
        `${response.data.plan.label}: ${response.data.message}`
      );
    } catch (requestError: unknown) {
      let message =
        "Não foi possível atualizar o valor do plano.";

      if (
        typeof requestError ===
          "object" &&
        requestError !== null &&
        "response" in requestError
      ) {
        const response = (
          requestError as {
            response?: {
              data?: {
                message?: string;
                error?: string;
              };
            };
          }
        ).response;

        message =
          response?.data?.message ||
          response?.data?.error ||
          message;
      }

      setError(message);
    } finally {
      setSavingBillingCycle(null);
    }
  }

  async function savePaymentOption(
    cycle: BillingCycle
  ) {
    try {
      setSavingPaymentCycle(cycle);
      setError("");
      setSuccess("");

      const response = await api.put<{
        message: string;
        option: PaymentOption;
      }>(
        `/billing/admin/payment-options/${cycle}`,
        paymentForms[cycle]
      );

      setPaymentForms((current) => ({
        ...current,
        [cycle]: optionToForm(
          response.data.option
        ),
      }));

      setSuccess(response.data.message);
    } catch (requestError: unknown) {
      let message =
        "Não foi possível salvar a configuração de pagamento.";

      if (
        typeof requestError ===
          "object" &&
        requestError !== null &&
        "response" in requestError
      ) {
        const response = (
          requestError as {
            response?: {
              data?: {
                message?: string;
                error?: string;
              };
            };
          }
        ).response;

        message =
          response?.data?.message ||
          response?.data?.error ||
          message;
      }

      setError(message);
    } finally {
      setSavingPaymentCycle(null);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-payment-settings flex min-h-52 items-center justify-center rounded-[28px] border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-sm font-black text-slate-500">
          <LoaderCircle
            className="animate-spin"
            size={20}
          />
          Carregando configurações financeiras...
        </div>
      </div>
    );
  }

  return (
    <section className="admin-payment-settings rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black text-zinc-400">
            Cobrança da plataforma
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-950">
            Configuração financeira
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Gerencie os valores dos planos e os
            meios de pagamento apresentados aos
            clientes durante a contratação.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadSettings(true)
          }
          disabled={isRefreshing}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-300 disabled:opacity-60"
        >
          <RefreshCw
            className={
              isRefreshing
                ? "animate-spin"
                : ""
            }
            size={17}
          />
          Atualizar
        </button>
      </div>

      {error ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <AlertTriangle
            className="mt-0.5 shrink-0"
            size={18}
          />
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2
            className="mt-0.5 shrink-0"
            size={18}
          />
          {success}
        </div>
      ) : null}

      <div className="mt-7">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102b3a] text-white">
              <CircleDollarSign
                size={21}
              />
            </span>

            <div>
              <h3 className="text-xl font-black text-slate-950">
                Valores dos planos
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Defina o valor mensal ou da
                parcela de cada modalidade.
              </p>
            </div>
          </div>

          <p className="mt-4 max-w-4xl rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold leading-5 text-slate-500">
            Alterações feitas aqui serão usadas
            nas novas escolhas de plano. Empresas
            que já possuem uma assinatura
            registrada mantêm os valores gravados
            no momento da contratação.
          </p>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          {cycleOptions.map(
            (option) => {
              const form =
                billingPlanForms[
                  option.cycle
                ];

              const amount =
                parseMoneyInput(
                  form.installmentAmount
                );

              const validAmount =
                Number.isFinite(amount) &&
                amount > 0
                  ? amount
                  : 0;

              const total =
                Math.round(
                  validAmount *
                    option.installments *
                    100
                ) / 100;

              const isSaving =
                savingBillingCycle ===
                option.cycle;

              return (
                <article
                  key={option.cycle}
                  className="flex flex-col rounded-[26px] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Plano
                      </p>

                      <h4 className="mt-1 text-2xl font-black text-slate-950">
                        {option.title}
                      </h4>

                      <p className="mt-2 text-sm font-black text-zinc-400">
                        {option.installments ===
                        1
                          ? "Cobrança mensal"
                          : `${option.installments} parcelas`}
                      </p>
                    </div>

                    <span className="rounded-2xl bg-[#102b3a] p-3 text-white">
                      <CircleDollarSign
                        size={21}
                      />
                    </span>
                  </div>

                  <div className="mt-6 space-y-5">
                    <label className="block">
                      <span className="text-sm font-black text-slate-700">
                        Valor da{" "}
                        {option.installments ===
                        1
                          ? "mensalidade"
                          : "parcela"}{" "}
                        (R$)
                      </span>

                      <input
                        type="text"
                        inputMode="decimal"
                        value={
                          form.installmentAmount
                        }
                        onChange={(event) =>
                          updateBillingPlanField(
                            option.cycle,
                            "installmentAmount",
                            event.target.value
                          )
                        }
                        placeholder="0,00"
                        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-lg font-black outline-none focus:border-[#102b3a]"
                      />
                    </label>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        Total do ciclo
                      </p>

                      <strong className="mt-2 block text-2xl font-black text-slate-950">
                        {formatCurrency(
                          total
                        )}
                      </strong>

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {option.installments}{" "}
                        {option.installments ===
                        1
                          ? "cobrança"
                          : "parcelas"}{" "}
                        de{" "}
                        {formatCurrency(
                          validAmount
                        )}
                      </p>
                    </div>

                    <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <span>
                        <strong className="block text-sm text-slate-800">
                          Disponível para contratação
                        </strong>

                        <span className="mt-1 block text-xs text-slate-500">
                          Desative para ocultar
                          este plano da tela de
                          contratação.
                        </span>
                      </span>

                      <input
                        type="checkbox"
                        checked={
                          form.active
                        }
                        onChange={(event) =>
                          updateBillingPlanField(
                            option.cycle,
                            "active",
                            event.target
                              .checked
                          )
                        }
                        className="h-5 w-5 accent-[#102b3a]"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void saveBillingPlan(
                        option.cycle
                      )
                    }
                    disabled={
                      Boolean(
                        savingBillingCycle
                      ) ||
                      validAmount <= 0
                    }
                    className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#102b3a] px-5 text-sm font-black text-white transition hover:bg-[#173d50] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? (
                      <LoaderCircle
                        className="animate-spin"
                        size={18}
                      />
                    ) : (
                      <Save size={18} />
                    )}

                    {isSaving
                      ? "Salvando..."
                      : `Salvar ${option.title}`}
                  </button>
                </article>
              );
            }
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102b3a] text-white">
            <CreditCard size={21} />
          </span>

          <div>
            <h3 className="text-xl font-black text-slate-950">
              Links e Pix dos planos
            </h3>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Configure o link de pagamento, o
              Pix copia e cola e a imagem do QR
              Code mostrados ao cliente depois da
              escolha do plano.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          {cycleOptions.map(
            (option) => {
              const form =
                paymentForms[
                  option.cycle
                ];

              const isSaving =
                savingPaymentCycle ===
                option.cycle;

              const billingForm =
                billingPlanForms[
                  option.cycle
                ];

              const currentAmount =
                parseMoneyInput(
                  billingForm
                    .installmentAmount
                );

              const validAmount =
                Number.isFinite(
                  currentAmount
                ) &&
                currentAmount > 0
                  ? currentAmount
                  : 0;

              const total =
                Math.round(
                  validAmount *
                    option.installments *
                    100
                ) / 100;

              return (
                <article
                  key={option.cycle}
                  className="flex flex-col rounded-[26px] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Plano
                      </p>

                      <h3 className="mt-1 text-2xl font-black text-slate-950">
                        {option.title}
                      </h3>

                      <p className="mt-2 text-sm font-black text-zinc-400">
                        {option.installments}x
                        de{" "}
                        {formatCurrency(
                          validAmount
                        )}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        Total de{" "}
                        {formatCurrency(
                          total
                        )}
                      </p>
                    </div>

                    <span className="rounded-2xl bg-[#102b3a] p-3 text-white">
                      <CreditCard
                        size={21}
                      />
                    </span>
                  </div>

                  <div className="mt-6 space-y-5">
                    <label className="block">
                      <span className="flex items-center gap-2 text-sm font-black text-slate-700">
                        <Link2 size={17} />
                        Link de pagamento
                      </span>

                      <input
                        type="url"
                        value={
                          form.paymentLink
                        }
                        onChange={(event) =>
                          updatePaymentField(
                            option.cycle,
                            "paymentLink",
                            event.target
                              .value
                          )
                        }
                        placeholder="https://pagamento..."
                        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#102b3a]"
                      />
                    </label>

                    <label className="block">
                      <span className="flex items-center gap-2 text-sm font-black text-slate-700">
                        <QrCode size={17} />
                        Pix copia e cola
                      </span>

                      <textarea
                        value={
                          form.pixCopyPaste
                        }
                        onChange={(event) =>
                          updatePaymentField(
                            option.cycle,
                            "pixCopyPaste",
                            event.target
                              .value
                          )
                        }
                        rows={4}
                        placeholder="Cole aqui o código Pix completo."
                        className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-[#102b3a]"
                      />
                    </label>

                    <label className="block">
                      <span className="flex items-center gap-2 text-sm font-black text-slate-700">
                        <QrCode size={17} />
                        URL da imagem do QR Code
                      </span>

                      <input
                        type="url"
                        value={
                          form.pixQrCodeUrl
                        }
                        onChange={(event) =>
                          updatePaymentField(
                            option.cycle,
                            "pixQrCodeUrl",
                            event.target
                              .value
                          )
                        }
                        placeholder="https://site.com/qrcode.png"
                        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#102b3a]"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-black text-slate-700">
                        Instruções para o cliente
                      </span>

                      <textarea
                        value={
                          form.instructions
                        }
                        onChange={(event) =>
                          updatePaymentField(
                            option.cycle,
                            "instructions",
                            event.target
                              .value
                          )
                        }
                        rows={3}
                        maxLength={1000}
                        placeholder="Exemplo: após o pagamento, aguarde a confirmação automática."
                        className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-[#102b3a]"
                      />

                      <span className="mt-1 block text-right text-xs text-slate-400">
                        {
                          form.instructions
                            .length
                        }
                        /1000
                      </span>
                    </label>

                    <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <span>
                        <strong className="block text-sm text-slate-800">
                          Disponível para pagamento
                        </strong>

                        <span className="mt-1 block text-xs text-slate-500">
                          Desative para ocultar
                          este meio de pagamento
                          do cliente.
                        </span>
                      </span>

                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(event) =>
                          updatePaymentField(
                            option.cycle,
                            "active",
                            event.target
                              .checked
                          )
                        }
                        className="h-5 w-5 accent-[#102b3a]"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void savePaymentOption(
                        option.cycle
                      )
                    }
                    disabled={
                      Boolean(
                        savingPaymentCycle
                      ) ||
                      (!form.paymentLink.trim() &&
                        !form.pixCopyPaste.trim() &&
                        !form.pixQrCodeUrl.trim())
                    }
                    className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#102b3a] px-5 text-sm font-black text-white transition hover:bg-[#173d50] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? (
                      <LoaderCircle
                        className="animate-spin"
                        size={18}
                      />
                    ) : (
                      <Save size={18} />
                    )}

                    {isSaving
                      ? "Salvando..."
                      : `Salvar ${option.title}`}
                  </button>
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}
