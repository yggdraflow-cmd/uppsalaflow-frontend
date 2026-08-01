import {
  AlertTriangle,
  CheckCircle2,
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

const cycleOptions: Array<{
  cycle: BillingCycle;
  title: string;
  price: string;
  total: string;
}> = [
  {
    cycle: "MONTHLY",
    title: "Mensal",
    price: "1x de R$ 100,00",
    total: "Total de R$ 100,00",
  },
  {
    cycle: "SEMIANNUAL",
    title: "Semestral",
    price: "6x de R$ 89,90",
    total: "Total de R$ 539,40",
  },
  {
    cycle: "ANNUAL",
    title: "Anual",
    price: "12x de R$ 83,33",
    total: "Total de R$ 999,96",
  },
];

function createEmptyForm(): PaymentOptionForm {
  return {
    paymentLink: "",
    pixCopyPaste: "",
    pixQrCodeUrl: "",
    instructions: "",
    active: true,
  };
}

function createInitialForms(): Record<
  BillingCycle,
  PaymentOptionForm
> {
  return {
    MONTHLY: createEmptyForm(),
    SEMIANNUAL: createEmptyForm(),
    ANNUAL: createEmptyForm(),
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

export function AdminPaymentSettings() {
  const [forms, setForms] = useState<
    Record<BillingCycle, PaymentOptionForm>
  >(createInitialForms);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [savingCycle, setSavingCycle] =
    useState<BillingCycle | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadOptions = useCallback(
    async (refresh = false) => {
      try {
        refresh
          ? setIsRefreshing(true)
          : setIsLoading(true);

        setError("");

        const response = await api.get<PaymentOption[]>(
          "/billing/admin/payment-options"
        );

        const nextForms = createInitialForms();

        response.data.forEach((option) => {
          nextForms[option.cycle] =
            optionToForm(option);
        });

        setForms(nextForms);
      } catch {
        setError(
          "Não foi possível carregar as configurações de pagamento."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  function updateField(
    cycle: BillingCycle,
    field: keyof PaymentOptionForm,
    value: string | boolean
  ) {
    setForms((current) => ({
      ...current,
      [cycle]: {
        ...current[cycle],
        [field]: value,
      },
    }));
  }

  async function saveOption(
    cycle: BillingCycle
  ) {
    try {
      setSavingCycle(cycle);
      setError("");
      setSuccess("");

      const response = await api.put<{
        message: string;
        option: PaymentOption;
      }>(
        `/billing/admin/payment-options/${cycle}`,
        forms[cycle]
      );

      setForms((current) => ({
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
        typeof requestError === "object" &&
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
      setSavingCycle(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-52 items-center justify-center rounded-[28px] border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-sm font-black text-slate-500">
          <LoaderCircle
            className="animate-spin"
            size={20}
          />
          Carregando meios de pagamento...
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black text-[#d97706]">
            Cobrança da plataforma
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-950">
            Links e Pix dos planos
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Configure o link de pagamento, o Pix
            copia e cola e a imagem do QR Code que
            serão mostrados ao cliente após a escolha
            do plano.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadOptions(true)}
          disabled={isRefreshing}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-300 disabled:opacity-60"
        >
          <RefreshCw
            className={
              isRefreshing ? "animate-spin" : ""
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

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {cycleOptions.map((option) => {
          const form = forms[option.cycle];
          const isSaving =
            savingCycle === option.cycle;

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

                  <p className="mt-2 text-sm font-black text-[#d97706]">
                    {option.price}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {option.total}
                  </p>
                </div>

                <span className="rounded-2xl bg-[#102b3a] p-3 text-white">
                  <CreditCard size={21} />
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
                    value={form.paymentLink}
                    onChange={(event) =>
                      updateField(
                        option.cycle,
                        "paymentLink",
                        event.target.value
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
                    value={form.pixCopyPaste}
                    onChange={(event) =>
                      updateField(
                        option.cycle,
                        "pixCopyPaste",
                        event.target.value
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
                    value={form.pixQrCodeUrl}
                    onChange={(event) =>
                      updateField(
                        option.cycle,
                        "pixQrCodeUrl",
                        event.target.value
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
                    value={form.instructions}
                    onChange={(event) =>
                      updateField(
                        option.cycle,
                        "instructions",
                        event.target.value
                      )
                    }
                    rows={3}
                    maxLength={1000}
                    placeholder="Exemplo: após o pagamento, aguarde a confirmação automática."
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-[#102b3a]"
                  />

                  <span className="mt-1 block text-right text-xs text-slate-400">
                    {form.instructions.length}/1000
                  </span>
                </label>

                <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <span>
                    <strong className="block text-sm text-slate-800">
                      Disponível para pagamento
                    </strong>

                    <span className="mt-1 block text-xs text-slate-500">
                      Desative para ocultar este meio
                      de pagamento do cliente.
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) =>
                      updateField(
                        option.cycle,
                        "active",
                        event.target.checked
                      )
                    }
                    className="h-5 w-5 accent-[#102b3a]"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() =>
                  void saveOption(option.cycle)
                }
                disabled={
                  Boolean(savingCycle) ||
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
        })}
      </div>
    </section>
  );
}
