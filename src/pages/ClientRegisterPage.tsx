import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FloatingInput,
  PasswordInput,
  RegisterPanel,
} from "../components/RegisterPanel";
import { AuthLayout } from "../layouts/AuthLayout";
import { api } from "../services/api";
import type { RegisterResponse } from "../types/auth";

export function ClientRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = new URLSearchParams(location.search).get("redirect");
  const safeRedirectTo = redirectTo?.startsWith("/") ? redirectTo : "";

  const redirectQuery = safeRedirectTo
    ? `?redirect=${encodeURIComponent(safeRedirectTo)}`
    : "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("As senhas informadas não são iguais.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const response = await api.post<RegisterResponse>(
        "/auth/client/register",
        {
          name,
          email,
          phone,
          password,
        }
      );

      navigate(`/cliente/login${redirectQuery}`, {
        replace: true,
        state: {
          successMessage: response.data.message,
        },
      });
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Não foi possível criar sua conta de cliente."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AuthLayout
      variant="plain"
      registerTheme="client"
      showSiteBackButton
    >
      <RegisterPanel
        accountType="client"
        theme="client"
        title="Criar conta de cliente"
        description="Crie seu acesso para agendar horários e acompanhar seus atendimentos."
        onSubmit={handleSubmit}
        error={error}
        isSaving={isSaving}
        submitLabel="Criar conta de cliente"
        savingLabel="Criando conta..."
        loginPath={`/cliente/login${redirectQuery}`}
        loginLabel="Entrar como cliente"
        clientRegisterPath={`/cliente/cadastro${redirectQuery}`}
      >
        <FloatingInput
          id="client-name"
          label="Nome completo"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <FloatingInput
          id="client-email"
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <FloatingInput
          id="client-phone"
          label="Telefone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />

        <PasswordInput
          id="client-password"
          label="Senha"
          autoComplete="new-password"
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <PasswordInput
          id="client-confirm-password"
          label="Confirmar senha"
          autoComplete="new-password"
          minLength={6}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
      </RegisterPanel>
    </AuthLayout>
  );
}
