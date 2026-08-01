import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  LoaderCircle,
  QrCode,
} from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "../services/api";
import type { BillingCycle } from "../types/business";

type BusinessPaymentInstructionsProps = {
  cycle: BillingCycle;
};

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

type PaymentOptionResponse = {
  option: PaymentOption | null;
};

export function BusinessPaymentInstructions({
  cycle,
}: BusinessPaymentInstructionsProps) {
  const [option, setOption] =
    useState<PaymentOption | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPaymentOption() {
      try {
        setIsLoading(true);
        setError("");

        const response =
          await api.get<PaymentOptionResponse>(
            `/billing/payment-options/${cycle}`
          );

        if (isMounted) {
          setOption(response.data.option);
        }
      } catch {
        if (isMounted) {
          setError(
            "Não foi possível carregar os meios de pagamento."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPaymentOption();

    return () => {
      isMounted = false;
    };
  }, [cycle]);

  async function copyPixCode() {
    if (!option?.pixCopyPaste) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        option.pixCopyPaste
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      setError(
        "Não foi possível copiar o código automaticamente."
      );
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto mt-6 flex max-w-xl items-center justify-center gap-3 rounded-[28px] bg-[#f3f4f4] p-6 text-sm font-black text-[#666]">
        <LoaderCircle
          className="animate-spin"
          size={20}
        />
        Carregando meios de pagamento...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-6 flex max-w-xl items-start gap-3 rounded-[24px] border border-red-200 bg-red-50 p-5 text-left text-sm font-bold text-red-700">
        <AlertTriangle
          className="mt-0.5 shrink-0"
          size={19}
        />
        {error}
      </div>
    );
  }

  const hasPaymentMethod =
    Boolean(option?.paymentLink) ||
    Boolean(option?.pixCopyPaste) ||
    Boolean(option?.pixQrCodeUrl);

  if (!option || !option.active || !hasPaymentMethod) {
    return (
      <div className="mx-auto mt-6 max-w-xl rounded-[28px] border border-amber-200 bg-amber-50 p-6 text-left">
        <p className="text-sm font-black text-amber-800">
          Meio de pagamento em configuração
        </p>

        <p className="mt-2 text-sm font-medium leading-6 text-amber-700">
          O Super Admin ainda não cadastrou um link ou
          Pix para este plano. Aguarde a disponibilização
          das instruções de pagamento.
        </p>
      </div>
    );
  }

  return (
    <section className="mx-auto mt-6 max-w-xl rounded-[30px] border border-[#dedede] bg-white p-6 text-left shadow-[0_18px_55px_rgba(0,0,0,0.07)]">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#171717] text-white">
          <QrCode size={23} />
        </span>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.17em] text-[#d97706]">
            Realize o pagamento
          </p>

          <h2 className="mt-1 text-2xl font-black text-[#171717]">
            Meios de pagamento
          </h2>

          <p className="mt-2 text-sm font-medium leading-6 text-[#666]">
            Depois do pagamento, aguarde a confirmação e
            a liberação do acesso.
          </p>
        </div>
      </div>

      {option.paymentLink ? (
        <a
          href={option.paymentLink}
          target="_blank"
          rel="noreferrer"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#171717] px-6 py-4 text-sm font-black text-white transition hover:-translate-y-0.5"
        >
          <ExternalLink size={18} />
          Abrir página de pagamento
        </a>
      ) : null}

      {option.pixQrCodeUrl ? (
        <div className="mt-6 rounded-[26px] bg-[#f3f4f4] p-5 text-center">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#777]">
            QR Code Pix
          </p>

          <img
            src={option.pixQrCodeUrl}
            alt="QR Code para pagamento via Pix"
            className="mx-auto mt-4 max-h-64 max-w-full rounded-2xl bg-white object-contain p-3"
          />

          <p className="mt-3 text-xs font-bold text-[#777]">
            Leia o QR Code no aplicativo do seu banco.
          </p>
        </div>
      ) : null}

      {option.pixCopyPaste ? (
        <div className="mt-5 rounded-[26px] bg-[#f3f4f4] p-5">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#777]">
            Pix copia e cola
          </p>

          <div className="mt-3 break-all rounded-2xl bg-white p-4 text-xs font-semibold leading-5 text-[#555] ring-1 ring-[#dedede]">
            {option.pixCopyPaste}
          </div>

          <button
            type="button"
            onClick={() => void copyPixCode()}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#171717] bg-white px-5 py-3 text-sm font-black text-[#171717] transition hover:bg-[#171717] hover:text-white"
          >
            {copied ? (
              <>
                <Check size={18} />
                Código copiado
              </>
            ) : (
              <>
                <Copy size={18} />
                Copiar código Pix
              </>
            )}
          </button>
        </div>
      ) : null}

      {option.instructions ? (
        <div className="mt-5 rounded-[22px] border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-amber-800">
            Instruções
          </p>

          <p className="mt-2 whitespace-pre-line text-sm font-medium leading-6 text-amber-700">
            {option.instructions}
          </p>
        </div>
      ) : null}
    </section>
  );
}
