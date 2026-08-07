import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

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
    <AuthLayout variant="plain" registerTheme="business">
      <RegisterPanel
        accountType="business"
        theme="business"
        title="Entrar como empresa"
        description="Acesse o painel para gerenciar sua agenda, clientes, serviços e profissionais."
        onSubmit={handleSubmit}
        error={error}
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
      </RegisterPanel>
    </AuthLayout>
  );
}
