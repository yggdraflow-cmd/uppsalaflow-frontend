import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  FloatingInput,
  RegisterPanel,
} from "../components/RegisterPanel";
import { AuthLayout } from "../layouts/AuthLayout";
import { api } from "../services/api";

export function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const isClientMode = searchParams.get("mode") === "client";

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const response = await api.post<{ message: string }>(
        "/auth/forgot-password",
        { email, mode: isClientMode ? "client" : "business" }
      );

      setSuccess(response.data.message);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Não foi possível solicitar a redefinição de senha."
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
      <RegisterPanel
        accountType={isClientMode ? "client" : "business"}
        theme={isClientMode ? "client" : "business"}
        title="Recuperar senha"
        description="Informe seu e-mail para receber as instruções de redefinição de senha."
        onSubmit={handleSubmit}
        error={error}
        success={success}
        isSaving={isSaving}
        submitLabel="Enviar instruções"
        savingLabel="Enviando..."
        loginPath={isClientMode ? "/cliente/login" : "/login"}
        loginLabel="Voltar para o login"
        businessPath="/forgot-password"
        clientPath="/forgot-password?mode=client"
        footerText="Lembrou sua senha?"
      >
        <FloatingInput
          id="forgot-password-email"
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </RegisterPanel>

      <div className="mt-3 text-center">
        <Link
          to="/cliente/login"
          className="text-xs font-bold text-white/70 hover:text-white"
        >
          Recuperar acesso de cliente
        </Link>
      </div>
    </AuthLayout>
  );
}
