import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { AuthLayout } from "../layouts/AuthLayout";
import { api } from "../services/api";
import { saveAuth } from "../services/authStorage";
import type { AuthResponse } from "../types/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      saveAuth(response.data.token, response.data.user);
      navigate("/dashboard");
    } catch {
      setError("E-mail ou senha inválidos.");
    }
  }

  return (
    <AuthLayout>
      <Card title="Entrar">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600">
          Ainda não tem conta?{" "}
          <Link to="/register" className="font-semibold text-beauty-700">
            Criar conta
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
