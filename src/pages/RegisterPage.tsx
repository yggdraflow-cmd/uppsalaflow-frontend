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
import type { AuthResponse } from "../types/auth";

export function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

      const response = await api.post<AuthResponse>("/auth/register", {
        name,
        email,
        password,
      });

      saveAuth(response.data.token, response.data.user);
      navigate("/dashboard");
    } catch {
      setError("Não foi possível criar a conta da empresa.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AuthLayout variant="plain">
      <RegisterPanel
        accountType="business"
        title="Criar conta da empresa"
        description="Cadastre seu acesso para gerenciar agenda, clientes, serviços e profissionais."
        onSubmit={handleSubmit}
        error={error}
        isSaving={isSaving}
        submitLabel="Criar conta da empresa"
        savingLabel="Criando conta..."
        loginPath="/login"
        loginLabel="Entrar no painel"
      >
        <FloatingInput
          id="business-name"
          label="Seu nome"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <FloatingInput
          id="business-email"
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <PasswordInput
          id="business-password"
          label="Senha"
          autoComplete="new-password"
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <PasswordInput
          id="business-confirm-password"
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
