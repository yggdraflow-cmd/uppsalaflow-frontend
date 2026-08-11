import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FloatingInput,
  PasswordInput,
  RegisterPanel,
} from "../components/RegisterPanel";
import { AuthLayout } from "../layouts/AuthLayout";
import { api } from "../services/api";
import { saveAuth } from "../services/authStorage";
import type { AuthResponse, UserRole } from "../types/auth";

function getRouteForRole(role: UserRole) {
  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "CLIENT") {
    return "/cliente";
  }

  return "/dashboard";
}

export function ClientLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = new URLSearchParams(location.search).get("redirect");
  const safeRedirectTo = redirectTo?.startsWith("/") ? redirectTo : "";

  const redirectQuery = safeRedirectTo
    ? `?redirect=${encodeURIComponent(safeRedirectTo)}`
    : "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const response = await api.post<AuthResponse>(
        "/auth/client/login",
        {
          email,
          password,
        }
      );

      saveAuth(response.data.token, response.data.user);

      if (response.data.user.role === "CLIENT" && safeRedirectTo) {
        navigate(safeRedirectTo);
        return;
      }

      navigate(getRouteForRole(response.data.user.role));
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "E-mail ou senha inválidos."
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
        title="Entrar como cliente"
        description="Acesse sua conta para agendar horários e acompanhar seus atendimentos."
        onSubmit={handleSubmit}
        error={error}
        isSaving={isSaving}
        submitLabel="Entrar"
        savingLabel="Entrando..."
        loginPath={`/cliente/cadastro${redirectQuery}`}
        loginLabel="Criar conta de cliente"
        businessPath="/login"
        clientPath={`/cliente/login${redirectQuery}`}
        footerText="Ainda não tem uma conta?"
      >
        <FloatingInput
          id="client-login-email"
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <PasswordInput
          id="client-login-password"
          label="Senha"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </RegisterPanel>
    </AuthLayout>
  );
}
