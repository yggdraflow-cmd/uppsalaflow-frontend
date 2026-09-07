import { CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { PasswordInput } from "../components/RegisterPanel";
import { AuthLayout } from "../layouts/AuthLayout";
import { api } from "../services/api";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const isClientMode = searchParams.get("mode") === "client";
  const loginPath = isClientMode ? "/cliente/login" : "/login";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("O link de recuperação é inválido.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas informadas não são iguais.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const response = await api.post<{ message: string }>(
        "/auth/reset-password",
        {
          token,
          password,
        }
      );

      setSuccess(response.data.message);
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Não foi possível redefinir sua senha."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AuthLayout
      variant="plain"
      registerTheme={isClientMode ? "client" : "business"}
      showSiteBackButton
    >
      <section className="w-full overflow-hidden rounded-[26px] border border-white/10 bg-[rgba(18,18,18,0.94)] p-5 text-white shadow-[0_26px_70px_rgba(0,0,0,0.42)] backdrop-blur-md sm:p-6">
        {success ? (
          <div className="flex flex-col items-center text-center">
            <CheckCircle2
              size={48}
              className="text-emerald-400"
              aria-hidden="true"
            />

            <h1 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#00bfff]">
              Senha redefinida
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/70">
              {success}
            </p>

            <Link
              to={loginPath}
              className="mt-6 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#00bfff] px-5 py-2 text-sm font-black text-white shadow-[0_8px_20px_rgba(0,191,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#29c8ff]"
            >
              Entrar no YggdraFlow
            </Link>
          </div>
        ) : (
          <>
            <header className="mb-5">
              <h1 className="text-2xl font-black tracking-[-0.04em] text-[#00bfff]">
                Criar nova senha
              </h1>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Informe sua nova senha para recuperar o acesso à sua conta.
              </p>
            </header>

            <form
              className="flex flex-col gap-3"
              onSubmit={handleSubmit}
            >
              <PasswordInput
                id="reset-password"
                label="Nova senha"
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <PasswordInput
                id="reset-confirm-password"
                label="Confirmar nova senha"
                autoComplete="new-password"
                minLength={6}
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                required
              />

              {error ? (
                <p
                  className="rounded-xl border border-red-400/25 bg-red-950/30 px-3 py-2 text-xs leading-5 text-red-200"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSaving}
                className="mt-1 min-h-10 rounded-xl bg-[#00bfff] px-4 py-2 text-sm font-black text-white shadow-[0_8px_20px_rgba(0,191,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#29c8ff] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isSaving
                  ? "Redefinindo..."
                  : "Redefinir senha"}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-white/70">
              <Link
                to={loginPath}
                className="font-black text-[#00bfff] hover:underline"
              >
                Voltar para o login
              </Link>
            </p>
          </>
        )}
      </section>
    </AuthLayout>
  );
}
