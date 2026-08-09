import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  Camera,
  Eye,
  EyeOff,
  Image,
  LockKeyhole,
  Trash2,
  UserRound,
} from "lucide-react";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { api, getApiAssetUrl } from "../services/api";
import { getUser, updateStoredUser } from "../services/authStorage";
import type { User } from "../types/auth";
import type { Business } from "../types/business";

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

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isRemovingCover, setIsRemovingCover] = useState(false);

  const profileImageUrl = getApiAssetUrl(user?.profileImageUrl);
  const isAdmin = user?.role === "ADMIN";

  const selectedBusiness = businesses.find(
    (business) => business.id === selectedBusinessId
  );

  const coverImageUrl = getApiAssetUrl(selectedBusiness?.coverImageUrl);

  useEffect(() => {
    if (isAdmin) {
      setBusinesses([]);
      setSelectedBusinessId("");
      return;
    }

    async function loadBusinesses() {
      try {
        const response = await api.get<Business[]>("/businesses");

        setBusinesses(response.data);

        if (response.data.length > 0) {
          setSelectedBusinessId(response.data[0].id);
        }
      } catch (requestError) {
        setError(
          getApiErrorMessage(
            requestError,
            "Não foi possível carregar seus negócios."
          )
        );
      }
    }

    void loadBusinesses();
  }, [isAdmin]);

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

  async function handleCoverImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !selectedBusinessId) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Envie uma imagem válida para a capa.");
      setMessage("");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("A imagem da capa precisa ter no máximo 2MB.");
      setMessage("");
      event.target.value = "";
      return;
    }

    try {
      setIsUploadingCover(true);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("image", file);

      const response = await api.patch<Business>(
        `/businesses/${selectedBusinessId}/cover`,
        formData
      );

      setBusinesses((currentBusinesses) =>
        currentBusinesses.map((business) =>
          business.id === response.data.id ? response.data : business
        )
      );

      setMessage("Foto de capa atualizada com sucesso.");
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Não foi possível atualizar a foto de capa."
        )
      );
    } finally {
      setIsUploadingCover(false);
      event.target.value = "";
    }
  }

  async function handleRemoveCover() {
    if (!selectedBusinessId || !selectedBusiness?.coverImageUrl) {
      return;
    }

    try {
      setIsRemovingCover(true);
      setError("");
      setMessage("");

      const response = await api.delete<Business>(
        `/businesses/${selectedBusinessId}/cover`
      );

      setBusinesses((currentBusinesses) =>
        currentBusinesses.map((business) =>
          business.id === response.data.id ? response.data : business
        )
      );

      setMessage("Foto de capa removida com sucesso.");
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Não foi possível remover a foto de capa."
        )
      );
    } finally {
      setIsRemovingCover(false);
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
    <div
      className={
        isAdmin
          ? "yggdra-page admin-account-page"
          : "yggdra-page"
      }
    >
      <div className="mb-8">
        <p className="admin-account-kicker text-sm font-medium text-[#171717]">
          Minha conta
        </p>

        <h1 className="admin-account-title text-3xl font-bold text-zinc-950">
          Dados da conta
        </h1>

        <p className="admin-account-description mt-2 max-w-3xl text-zinc-600">
          {isAdmin
            ? "Gerencie sua foto de perfil e sua senha de acesso com segurança."
            : "Gerencie seus dados de acesso, foto de perfil, capa do negócio e senha com segurança."}
        </p>
      </div>

      <div
        className={
          isAdmin
            ? "grid gap-6 xl:grid-cols-2 xl:items-start"
            : "grid gap-6 xl:grid-cols-[minmax(340px,0.85fr)_minmax(0,1.65fr)] xl:items-start"
        }
      >
        <div
          className={
            isAdmin
              ? "grid gap-6"
              : "grid gap-6 xl:col-start-1 xl:row-start-1"
          }
        >
          <Card title="Usuário logado">
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <span className="admin-account-avatar flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-[var(--yggdra-primary)] text-[var(--yggdra-primary-text)] shadow-[0_16px_38px_var(--yggdra-shadow)]">
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

                  <p className="admin-account-role mt-3 inline-flex rounded-full bg-[var(--yggdra-muted)] px-3 py-1 text-xs font-bold text-[#171717]">
                    {user?.role || "Sem perfil"}
                  </p>
                </div>
              </div>

              <label className="admin-account-upload flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/80 bg-[var(--yggdra-muted)] px-4 py-3 text-sm font-black text-[#171717] transition hover:bg-white">
                <Camera size={18} />

                <span>
                  {isUploadingImage
                    ? "Enviando..."
                    : "Enviar ou trocar foto"}
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
        </div>

        {!isAdmin ? (
          <div className="xl:col-start-2 xl:row-start-1 xl:row-span-2">
            <Card title="Foto de capa do negócio">
              <div className="flex flex-col gap-5">
                {businesses.length > 1 ? (
                  <label>
                    <span className="mb-2 block text-sm font-bold text-zinc-700">
                      Negócio
                    </span>

                    <select
                      value={selectedBusinessId}
                      onChange={(event) =>
                        setSelectedBusinessId(event.target.value)
                      }
                      className="upp-input"
                    >
                      {businesses.map((business) => (
                        <option
                          key={business.id}
                          value={business.id}
                        >
                          {business.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                      Negócio
                    </p>

                    <p className="mt-1 font-black text-zinc-950">
                      {selectedBusiness?.name ||
                        "Nenhum negócio disponível"}
                    </p>
                  </div>
                )}

                <div className="relative h-44 overflow-hidden rounded-[24px] border border-white/80 bg-[var(--yggdra-muted)] shadow-[0_16px_38px_var(--yggdra-shadow)]">
                  {coverImageUrl ? (
                    <img
                      src={coverImageUrl}
                      alt={`Capa de ${
                        selectedBusiness?.name || "negócio"
                      }`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-500">
                      <Image size={34} />

                      <span className="text-sm font-bold">
                        Nenhuma foto de capa cadastrada
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label
                    className={[
                      "flex items-center justify-center gap-2 rounded-2xl border border-white/80 bg-[var(--yggdra-muted)] px-4 py-3 text-sm font-black text-[#171717] transition hover:bg-white",
                      !selectedBusinessId || isUploadingCover
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer",
                    ].join(" ")}
                  >
                    <Camera size={18} />

                    <span>
                      {isUploadingCover
                        ? "Enviando..."
                        : coverImageUrl
                          ? "Trocar capa"
                          : "Enviar capa"}
                    </span>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleCoverImageChange}
                      disabled={
                        !selectedBusinessId || isUploadingCover
                      }
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    disabled={
                      !selectedBusiness?.coverImageUrl ||
                      isRemovingCover ||
                      isUploadingCover
                    }
                    className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={18} />

                    {isRemovingCover
                      ? "Removendo..."
                      : "Remover capa"}
                  </button>
                </div>

                <p className="text-xs font-medium leading-5 text-zinc-500">
                  Use JPG, PNG ou WEBP com até 2MB. A imagem será exibida como
                  capa no Dashboard deste negócio.
                </p>
              </div>
            </Card>
          </div>
        ) : null}

        <div
          className={
            isAdmin
              ? "grid gap-6"
              : "grid gap-6 xl:col-start-1 xl:row-start-2"
          }
        >
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

              <div className="admin-account-security rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                <div className="flex items-start gap-3">
                  <LockKeyhole
                    className="mt-0.5 shrink-0 text-[#171717]"
                    size={20}
                  />

                  <p>
                    Use uma senha nova, com pelo menos 8 caracteres. Não
                    reutilize senha que apareceu em alerta de vazamento do
                    navegador.
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
    </div>
  );
}
