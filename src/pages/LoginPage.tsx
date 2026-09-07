import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
    return "/cliente/agendamentos";
  }

  return "/dashboard";
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage =
    typeof location.state?.successMessage === "string"
      ? location.state.successMessage
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

      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      saveAuth(response.data.token, response.data.user);
      navigate(getRouteForRole(response.data.user.role), {
        state: { showLoginTransition: true },
      });
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
      registerTheme="business"
      showSiteBackButton
    >
      <RegisterPanel
        accountType="business"
        theme="business"
        title="Entrar como empresa"
        description="Acesse o painel para gerenciar sua agenda, clientes, serviços e profissionais."
        onSubmit={handleSubmit}
        error={error}
        success={successMessage}
        isSaving={isSaving}
        submitLabel="Entrar"
        savingLabel="Entrando..."
        loginPath="/register"
        loginLabel="Criar conta da empresa"
        businessPath="/login"
        clientPath="/cliente/login"
        footerText="Ainda não tem uma conta?"
      >
        <FloatingInput
          id="business-login-email"
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <PasswordInput
          id="business-login-password"
          label="Senha"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-black text-[#00bfff] hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>
      </RegisterPanel>
    </AuthLayout>
  );
}
