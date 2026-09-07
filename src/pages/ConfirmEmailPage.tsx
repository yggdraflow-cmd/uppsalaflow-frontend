import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AuthLayout } from "../layouts/AuthLayout";
import { api } from "../services/api";

type ConfirmationStatus = "loading" | "success" | "error";

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const hasRequestedConfirmation = useRef(false);

  const [status, setStatus] = useState<ConfirmationStatus>("loading");
  const [message, setMessage] = useState(
    "Estamos confirmando seu endereço de e-mail."
  );

  useEffect(() => {
    if (hasRequestedConfirmation.current) {
      return;
    }

    hasRequestedConfirmation.current = true;

    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("O link de confirmação é inválido.");
      return;
    }

    async function confirmEmail() {
      try {
        const response = await api.post<{ message: string }>(
          "/auth/verify-email",
          { token }
        );

        setStatus("success");
        setMessage(response.data.message);
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error?.response?.data?.message ||
            "Não foi possível confirmar seu e-mail."
        );
      }
    }

    confirmEmail();
  }, [searchParams]);

  return (
    <AuthLayout
      variant="plain"
      registerTheme="business"
      showSiteBackButton
    >
      <section className="w-full overflow-hidden rounded-[26px] border border-white/10 bg-[rgba(18,18,18,0.94)] p-5 text-white shadow-[0_26px_70px_rgba(0,0,0,0.42)] backdrop-blur-md sm:p-6">
        <div className="flex flex-col items-center text-center">
          {status === "loading" ? (
            <LoaderCircle
              size={48}
              className="animate-spin text-[#00bfff]"
              aria-hidden="true"
            />
          ) : null}

          {status === "success" ? (
            <CheckCircle2
              size={48}
              className="text-emerald-400"
              aria-hidden="true"
            />
          ) : null}

          {status === "error" ? (
            <XCircle
              size={48}
              className="text-red-400"
              aria-hidden="true"
            />
          ) : null}

          <h1 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#00bfff]">
            {status === "loading"
              ? "Confirmando seu e-mail"
              : status === "success"
                ? "E-mail confirmado"
                : "Não foi possível confirmar"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/70">
            {message}
          </p>

          {status === "success" ? (
            <Link
              to="/login"
              className="mt-6 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#00bfff] px-5 py-2 text-sm font-black text-white shadow-[0_8px_20px_rgba(0,191,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#29c8ff]"
            >
              Entrar no YggdraFlow
            </Link>
          ) : null}

          {status === "error" ? (
            <Link
              to="/login"
              className="mt-6 text-sm font-black text-[#00bfff] hover:underline"
            >
              Voltar para o login
            </Link>
          ) : null}
        </div>
      </section>
    </AuthLayout>
  );
}
