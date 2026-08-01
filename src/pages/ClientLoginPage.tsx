import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
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

type PasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

function PasswordField({ value, onChange }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="block">
      <span className="upp-label">Senha</span>

      <div className="relative">
        <input
          className="upp-input pr-14"
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />

        <button
          type="button"
          onClick={() => setIsVisible((currentValue) => !currentValue)}
          className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#555555] transition hover:text-[#171717]"
          aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
          title={isVisible ? "Ocultar senha" : "Mostrar senha"}
        >
          {isVisible ? <EyeOff size={21} /> : <Eye size={21} />}
        </button>
      </div>
    </label>
  );
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const response = await api.post<AuthResponse>("/auth/client/login", {
        email,
        password,
      });

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
    <AuthLayout>
      <Card title="Entrar como cliente">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <PasswordField value={password} onChange={setPassword} />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600">
          Ainda não tem conta?{" "}
          <Link
            to={`/cliente/cadastro${redirectQuery}`}
            className="font-semibold text-[#171717]"
          >
            Criar conta de cliente
          </Link>
        </p>

        <p className="mt-3 text-center text-sm text-zinc-600">
          Tem um negócio?{" "}
          <Link to="/login" className="font-semibold text-[#171717]">
            Entrar no painel da empresa
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
