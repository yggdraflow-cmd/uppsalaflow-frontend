import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { AuthLayout } from "../layouts/AuthLayout";
import { api } from "../services/api";
import { saveAuth } from "../services/authStorage";
import type { AuthResponse } from "../types/auth";

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
          minLength={6}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />

        <button
          type="button"
          onClick={() => setIsVisible((currentValue) => !currentValue)}
          className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#506173] transition hover:text-[#f97316]"
          aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
          title={isVisible ? "Ocultar senha" : "Mostrar senha"}
        >
          {isVisible ? <EyeOff size={21} /> : <Eye size={21} />}
        </button>
      </div>
    </label>
  );
}

export function ClientRegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const response = await api.post<AuthResponse>("/auth/client/register", {
        name,
        email,
        password,
      });

      saveAuth(response.data.token, response.data.user);
      navigate("/cliente/agendamentos");
    } catch {
      setError("Não foi possível criar sua conta de cliente.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AuthLayout>
      <Card title="Criar conta de cliente">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

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
            {isSaving ? "Criando..." : "Criar conta"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600">
          Já tem conta?{" "}
          <Link to="/cliente/login" className="font-semibold text-orange-600">
            Entrar como cliente
          </Link>
        </p>

        <p className="mt-3 text-center text-sm text-zinc-600">
          Tem um negócio?{" "}
          <Link to="/register" className="font-semibold text-orange-600">
            Criar conta da empresa
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
