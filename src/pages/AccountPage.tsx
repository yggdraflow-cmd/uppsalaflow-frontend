import { FormEvent, useState } from "react";
import { LockKeyhole, UserRound } from "lucide-react";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { api } from "../services/api";
import { getUser } from "../services/authStorage";

function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return fallbackMessage;
}

export function AccountPage() {
  const user = getUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setError("A confirmação da nova senha não confere.");
      setMessage("");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setMessage("");

      await api.patch("/users/me/password", {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setMessage("Senha alterada com sucesso.");
    } catch (error) {
      setError(
        getApiErrorMessage(error, "Não foi possível alterar sua senha.")
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-orange-500">Minha conta</p>
        <h1 className="text-3xl font-bold text-zinc-950">
          Dados da conta
        </h1>
        <p className="mt-2 max-w-3xl text-zinc-600">
          Gerencie seus dados de acesso e altere sua senha com segurança.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card title="Usuário logado">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#121b35] text-white">
              <UserRound size={25} />
            </span>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-zinc-950">
                {user?.name || "Usuário"}
              </h2>

              <p className="mt-1 truncate text-sm text-zinc-500">
                {user?.email || "E-mail não encontrado"}
              </p>

              <p className="mt-3 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                {user?.role || "Sem perfil"}
              </p>
            </div>
          </div>
        </Card>

        <Card title="Alterar senha">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Senha atual"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />

            <Input
              label="Nova senha"
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />

            <Input
              label="Confirmar nova senha"
              type="password"
              minLength={8}
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              required
            />

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 shrink-0 text-orange-500" size={20} />
                <p>
                  Use uma senha nova, com pelo menos 8 caracteres. Não reutilize
                  senha que apareceu em alerta de vazamento do navegador.
                </p>
              </div>
            </div>

            {message ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                {message}
              </p>
            ) : null}

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? "Alterando..." : "Alterar senha"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
