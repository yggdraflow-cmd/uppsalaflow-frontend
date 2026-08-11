import { ChangeEvent, FormEvent, useState } from "react";
import {
  Camera,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

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
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#64748B]">
        {label}
      </span>

      <div className="relative">
        <input
          type={isVisible ? "text" : "password"}
          value={value}
          minLength={minLength}
          onChange={(event) => onChange(event.target.value)}
          required
          className="h-14 w-full border border-[#dfe5e9] bg-[#F7F7F5] px-4 pr-14 text-sm font-bold text-[#081120] outline-none transition focus:border-[#12B8D6] focus:bg-white focus:shadow-[0_0_0_3px_rgba(18,184,214,0.08)]"
        />

        <button
          type="button"
          onClick={() => setIsVisible((currentValue) => !currentValue)}
          className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#94A3B8] transition hover:text-[#087F95]"
          aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
          title={isVisible ? "Ocultar senha" : "Mostrar senha"}
        >
          {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
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

export function ClientAccountPage() {
  const [user, setUser] = useState<User | null>(() => getUser());

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const profileImageUrl = getApiAssetUrl(user?.profileImageUrl);

  async function handleProfileImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
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

      const response = await api.patch<User>(
        "/users/me/profile-image",
        formData
      );

      setUser(response.data);
      updateStoredUser(response.data);
      window.dispatchEvent(new Event("yggdraflow:user-updated"));

      setMessage("Foto de perfil atualizada com sucesso.");
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Não foi possível atualizar a foto de perfil."
        )
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
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Não foi possível alterar sua senha."
        )
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(300px,0.7fr)_minmax(0,1.3fr)]">
      <section className="relative overflow-hidden border border-[#081120] bg-[#081120] p-6 text-white shadow-[0_18px_50px_rgba(8,17,32,0.12)] sm:p-7">
        <img
          src="/originkit/hero-08/pattern.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.06]"
        />

        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5BD7EB]">
            Perfil
          </p>

          <div className="mt-7 flex flex-col items-start">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden border border-[#12B8D6]/40 bg-[#12B8D6]/10 text-[#5BD7EB]">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={user?.name || "Foto do cliente"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound size={43} />
              )}
            </div>

            <h2 className="mt-5 max-w-full truncate text-2xl font-black tracking-tight">
              {user?.name || "Cliente"}
            </h2>

            <p className="mt-1 max-w-full truncate text-sm font-semibold text-white/50">
              {user?.email || "E-mail não encontrado"}
            </p>

            <span className="mt-4 border border-[#12B8D6]/30 bg-[#12B8D6]/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#5BD7EB]">
              Cliente YggdraFlow
            </span>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <label
              className={[
                "inline-flex cursor-pointer items-center justify-center gap-2 border border-[#12B8D6] bg-[#12B8D6] px-5 py-3 text-sm font-black text-[#081120] transition hover:bg-[#5BD7EB]",
                isUploadingImage
                  ? "pointer-events-none opacity-60"
                  : "",
              ].join(" ")}
            >
              <Camera size={18} />

              {isUploadingImage
                ? "Enviando..."
                : "Trocar foto de perfil"}

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleProfileImageChange}
                disabled={isUploadingImage}
                className="hidden"
              />
            </label>

            <p className="mt-4 max-w-sm text-xs font-semibold leading-5 text-white/40">
              Use JPG, PNG ou WEBP com até 2MB. A foto também será exibida no
              menu do seu portal.
            </p>
          </div>
        </div>
      </section>

      <section className="border border-[#dfe5e9] bg-white shadow-[0_18px_50px_rgba(8,17,32,0.05)]">
        <div className="flex items-start gap-4 border-b border-[#dfe5e9] bg-[#F7F7F5] p-5 sm:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#12B8D6]/25 bg-[#12B8D6]/8 text-[#087F95]">
            <LockKeyhole size={21} />
          </span>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#087F95]">
              Segurança
            </p>

            <h2 className="mt-1 text-xl font-black tracking-tight text-[#081120]">
              Alterar senha
            </h2>

            <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-[#64748B]">
              Atualize sua senha de acesso sem alterar seus agendamentos ou
              dados do perfil.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          <div className="grid gap-5">
            <PasswordField
              label="Senha atual"
              value={currentPassword}
              onChange={setCurrentPassword}
            />

            <div className="grid gap-5 lg:grid-cols-2">
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
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 border border-[#dfe5e9] bg-[#F7F7F5] p-4">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#087F95]"
            />

            <p className="text-sm font-semibold leading-6 text-[#64748B]">
              Use pelo menos 8 caracteres e evite reutilizar senhas utilizadas
              em outros serviços.
            </p>
          </div>

          {message ? (
            <p className="mt-5 border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="mt-5 border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 inline-flex min-h-12 items-center justify-center border border-[#081120] bg-[#081120] px-6 py-3 text-sm font-black text-white transition hover:border-[#087F95] hover:bg-[#087F95] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Alterando..." : "Alterar senha"}
          </button>
        </form>
      </section>
    </div>
  );
}
