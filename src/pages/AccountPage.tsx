import { ChangeEvent, FormEvent, useState } from "react";
import { Camera, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { api, getApiAssetUrl } from "../services/api";
import { getUser, updateStoredUser } from "../services/authStorage";
import type { User } from "../types/auth";

type PasswordFieldProps = {
  label: string;
  value: string;
  minLength?: number;
  onChange: (value: string) => void;
};

function PasswordField({
  label,
  value,
  minLength,
  onChange,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="block">
      <span className="upp-label">{label}</span>

      <div className="relative">
        <input
          className="upp-input pr-14"
          type={isVisible ? "text" : "password"}
          value={value}
          minLength={minLength}
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
  const [user, setUser] = useState<User | null>(() => getUser());

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const profileImageUrl = getApiAssetUrl(user?.profileImageUrl);

  async function handleProfileImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Envie uma imagem válida.");
      setMessage("");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("A imagem precisa ter no máximo 2MB.");
      setMessage("");
      event.target.value = "";
      return;
    }

    try {
      setIsUploadingImage(true);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("image", file);

      const response = await api.patch<User>("/users/me/profile-image", formData);

      setUser(response.data);
      updateStoredUser(response.data);
      window.dispatchEvent(new Event("yggdraflow:user-updated"));

      setMessage("Foto de perfil atualizada com sucesso.");
    } catch (error) {
      setError(
        getApiErrorMessage(error, "Não foi possível atualizar a foto de perfil.")
      );
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  }

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
    <div className="yggdra-page">
      <div className="mb-8">
        <p className="text-sm font-medium text-[#171717]">Minha conta</p>
        <h1 className="text-3xl font-bold text-zinc-950">Dados da conta</h1>
        <p className="mt-2 max-w-3xl text-zinc-600">
          Gerencie seus dados de acesso, foto de perfil e senha com segurança.
        </p>
      </div>

      <div className="yggdra-split-grid">
        <Card title="Usuário logado">
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-[var(--yggdra-primary)] text-[var(--yggdra-primary-text)] shadow-[0_16px_38px_var(--yggdra-shadow)]">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={user?.name || "Foto do usuário"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={32} />
                )}
              </span>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-zinc-950">
                  {user?.name || "Usuário"}
                </h2>

                <p className="mt-1 truncate text-sm text-zinc-500">
                  {user?.email || "E-mail não encontrado"}
                </p>

                <p className="mt-3 inline-flex rounded-full bg-[var(--yggdra-muted)] px-3 py-1 text-xs font-bold text-[#171717]">
                  {user?.role || "Sem perfil"}
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/80 bg-[var(--yggdra-muted)] px-4 py-3 text-sm font-black text-[#171717] transition hover:bg-white">
              <Camera size={18} />
              <span>
                {isUploadingImage ? "Enviando..." : "Enviar ou trocar foto"}
              </span>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleProfileImageChange}
                disabled={isUploadingImage}
                className="hidden"
              />
            </label>

            <p className="text-xs font-medium leading-5 text-zinc-500">
              Use JPG, PNG ou WEBP com até 2MB. Essa foto aparece no topo do
              sistema enquanto você estiver logado.
            </p>
          </div>
        </Card>

        <Card title="Alterar senha">
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField
              label="Senha atual"
              value={currentPassword}
              onChange={setCurrentPassword}
            />

            <PasswordField
              label="Nova senha"
              minLength={8}
              value={newPassword}
              onChange={setNewPassword}
            />

            <PasswordField
              label="Confirmar nova senha"
              minLength={8}
              value={confirmNewPassword}
              onChange={setConfirmNewPassword}
            />

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              <div className="flex items-start gap-3">
                <LockKeyhole
                  className="mt-0.5 shrink-0 text-[#171717]"
                  size={20}
                />
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

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? "Alterando..." : "Alterar senha"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
