import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { AuthLayout } from "../layouts/AuthLayout";
import { api } from "../services/api";
import { saveAuth } from "../services/authStorage";
import type { AuthResponse } from "../types/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      const response = await api.post<AuthResponse>("/auth/register", {
        name,
        email,
        password,
      });

      saveAuth(response.data.token, response.data.user);
      navigate("/dashboard");
    } catch {
      setError("Não foi possível criar a conta.");
    }
  }

  return (
    <AuthLayout>
      <Card title="Criar conta">
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

          <Input
            label="Senha"
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full">
            Criar conta
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600">
          Já tem conta?{" "}
          <Link to="/login" className="font-semibold text-beauty-700">
            Entrar
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
