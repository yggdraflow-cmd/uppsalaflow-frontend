import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Camera,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import { api, getApiAssetUrl } from "../services/api";
import { Card } from "./Card";

type AboutMember = {
  id?: string;
  name: string;
  role: string;
  shortBio: string;
  biography: string;
  imageUrl?: string | null;
  order: number;
};

type AboutContent = {
  title: string;
  description: string;
  members: AboutMember[];
};

type AdminAboutResponse = {
  id: string | null;
  key: "ABOUT";
  content: AboutContent;
  published: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  updatedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
};

const emptyMember = (): AboutMember => ({
  name: "",
  role: "",
  shortBio: "",
  biography: "",
  imageUrl: null,
  order: 0,
});

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return "Não foi possível concluir a operação.";
}

export function AdminYggdraTechAbout() {
  const [content, setContent] = useState<AboutContent>({
    title: "",
    description: "",
    members: [],
  });

  const [published, setPublished] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] =
    useState<AdminAboutResponse["updatedBy"]>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingMemberIndex, setUploadingMemberIndex] =
    useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response =
        await api.get<AdminAboutResponse>(
          "/admin/yggdratech/about"
        );

      setContent(response.data.content);
      setIsEditing(false);
      setPublished(response.data.published);
      setUpdatedAt(response.data.updatedAt);
      setUpdatedBy(response.data.updatedBy);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  function updateMember(
    index: number,
    field: keyof AboutMember,
    value: string | number
  ) {
    setContent((current) => ({
      ...current,
      members: current.members.map((member, memberIndex) =>
        memberIndex === index
          ? {
              ...member,
              [field]: value,
            }
          : member
      ),
    }));
  }

  function addMember() {
    setContent((current) => ({
      ...current,
      members: [
        ...current.members,
        {
          ...emptyMember(),
          order: current.members.length,
        },
      ],
    }));
  }

  function removeMember(index: number) {
    setContent((current) => ({
      ...current,
      members: current.members
        .filter((_, memberIndex) => memberIndex !== index)
        .map((member, memberIndex) => ({
          ...member,
          order: memberIndex,
        })),
    }));
  }

  async function handleMemberImageUpload(
    index: number,
    file: File
  ) {
    try {
      setUploadingMemberIndex(index);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post<{
        imageUrl: string;
      }>(
        "/admin/yggdratech/about/member-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setContent((current) => ({
        ...current,
        members: current.members.map((member, memberIndex) =>
          memberIndex === index
            ? {
                ...member,
                imageUrl: response.data.imageUrl,
              }
            : member
        ),
      }));

      setSuccess(
        "Imagem enviada. Salve as alterações para vincular a foto ao integrante."
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setUploadingMemberIndex(null);
    }
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        title: content.title,
        description: content.description,
        members: content.members.map((member, index) => ({
          ...(member.id ? { id: member.id } : {}),
          name: member.name,
          role: member.role,
          shortBio: member.shortBio,
          biography: member.biography,
          imageUrl: member.imageUrl || null,
          order: index,
        })),
        published,
      };

      const response = await api.put<{
        message: string;
        content: AdminAboutResponse;
      }>("/admin/yggdratech/about", payload);

      setContent(response.data.content.content);
      setIsEditing(false);
      setPublished(response.data.content.published);
      setUpdatedAt(response.data.content.updatedAt);
      setUpdatedBy(response.data.content.updatedBy);
      setSuccess(response.data.message);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="admin-dashboard-card">
        <div className="flex min-h-56 items-center justify-center gap-3 text-sm font-bold text-slate-500">
          <LoaderCircle className="animate-spin" size={22} />
          Carregando conteúdo da YggdraTech...
        </div>
      </Card>
    );
  }

  if (!isEditing) {
    return (
      <div className="space-y-6">
        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertTriangle className="mt-0.5 shrink-0" size={19} />
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="mt-0.5 shrink-0" size={19} />
            {success}
          </div>
        ) : null}

        <Card
          className="admin-dashboard-card"
          title="Quem Somos"
        >
          <button
            type="button"
            onClick={() => {
              setSuccess("");
              setError("");
              setIsEditing(true);
            }}
            className="w-full rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-slate-300 hover:bg-white"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  Conteúdo institucional
                </p>

                <h3 className="mt-2 text-lg font-black text-slate-950">
                  {content.title || "Quem Somos"}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">
                  {content.description ||
                    "Nenhuma descrição cadastrada."}
                </p>

                <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-slate-400">
                  <span>
                    {content.members.length}{" "}
                    {content.members.length === 1
                      ? "integrante"
                      : "integrantes"}
                  </span>

                  <span>•</span>

                  <span>
                    {published ? "Publicado" : "Não publicado"}
                  </span>
                </div>

                {updatedAt ? (
                  <p className="mt-3 text-xs font-semibold text-slate-400">
                    Última alteração:{" "}
                    {new Date(updatedAt).toLocaleString("pt-BR")}
                    {updatedBy ? ` por ${updatedBy.name}` : ""}
                  </p>
                ) : null}
              </div>

              <span className="shrink-0 text-sm font-black text-slate-500">
                Clique para editar
              </span>
            </div>
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <AlertTriangle className="mt-0.5 shrink-0" size={19} />
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="mt-0.5 shrink-0" size={19} />
          {success}
        </div>
      ) : null}

      <Card
        className="admin-dashboard-card"
        title="Quem Somos"
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold leading-6 text-slate-500">
              Este conteúdo será exibido publicamente no site
              institucional da YggdraTech quando estiver publicado.
            </p>

            {updatedAt ? (
              <p className="mt-2 text-xs font-semibold text-slate-400">
                Última alteração:{" "}
                {new Date(updatedAt).toLocaleString("pt-BR")}
                {updatedBy ? ` por ${updatedBy.name}` : ""}
              </p>
            ) : null}
          </div>

          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-800">
                Título
              </span>
              <input
                type="text"
                value={content.title}
                onChange={(event) =>
                  setContent((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Ex.: Duas visões. Uma direção."
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-[#102b3a]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-800">
                Descrição
              </span>
              <textarea
                value={content.description}
                onChange={(event) =>
                  setContent((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Apresentação institucional da YggdraTech."
                rows={5}
                className="resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-900 outline-none focus:border-[#102b3a]"
              />
            </label>
          </div>
        </div>
      </Card>

      <Card
        className="admin-dashboard-card"
        title={`Integrantes (${content.members.length})`}
      >
        <div className="space-y-5">
          {content.members.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
              <p className="text-sm font-bold text-slate-600">
                Nenhum integrante cadastrado.
              </p>
            </div>
          ) : null}

          {content.members.map((member, index) => (
            <article
              key={member.id || `member-${index}`}
              className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Integrante {index + 1}
                  </p>
                  <h3 className="mt-1 font-black text-slate-950">
                    {member.name || "Novo integrante"}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50"
                  title="Remover integrante"
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                  {member.imageUrl ? (
                    <img
                      src={getApiAssetUrl(member.imageUrl)}
                      alt={
                        member.name
                          ? `Foto de ${member.name}`
                          : "Foto do integrante"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera
                      size={30}
                      className="text-slate-400"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <strong className="block text-sm font-black text-slate-900">
                    Foto do integrante
                  </strong>

                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    JPG, PNG ou WEBP. Limite máximo de 5 MB.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#102b3a] px-4 py-2.5 text-sm font-black text-white hover:bg-[#173d50]">
                      {uploadingMemberIndex === index ? (
                        <LoaderCircle
                          className="animate-spin"
                          size={17}
                        />
                      ) : (
                        <Camera size={17} />
                      )}

                      {uploadingMemberIndex === index
                        ? "Enviando..."
                        : member.imageUrl
                          ? "Trocar foto"
                          : "Adicionar foto"}

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={uploadingMemberIndex !== null}
                        onChange={(event) => {
                          const file = event.target.files?.[0];

                          if (file) {
                            void handleMemberImageUpload(
                              index,
                              file
                            );
                          }

                          event.target.value = "";
                        }}
                      />
                    </label>

                    {member.imageUrl ? (
                      <button
                        type="button"
                        onClick={() =>
                          setContent((current) => ({
                            ...current,
                            members: current.members.map(
                              (currentMember, memberIndex) =>
                                memberIndex === index
                                  ? {
                                      ...currentMember,
                                      imageUrl: null,
                                    }
                                  : currentMember
                            ),
                          }))
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
                      >
                        <Trash2 size={16} />
                        Remover foto
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-slate-800">
                    Nome
                  </span>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(event) =>
                      updateMember(
                        index,
                        "name",
                        event.target.value
                      )
                    }
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-[#102b3a]"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black text-slate-800">
                    Função
                  </span>
                  <input
                    type="text"
                    value={member.role}
                    onChange={(event) =>
                      updateMember(
                        index,
                        "role",
                        event.target.value
                      )
                    }
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-[#102b3a]"
                  />
                </label>

                <label className="grid gap-2 lg:col-span-2">
                  <span className="text-sm font-black text-slate-800">
                    Resumo curto
                  </span>
                  <textarea
                    value={member.shortBio}
                    onChange={(event) =>
                      updateMember(
                        index,
                        "shortBio",
                        event.target.value
                      )
                    }
                    rows={3}
                    className="resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-[#102b3a]"
                  />
                </label>

                <label className="grid gap-2 lg:col-span-2">
                  <span className="text-sm font-black text-slate-800">
                    Biografia
                  </span>
                  <textarea
                    value={member.biography}
                    onChange={(event) =>
                      updateMember(
                        index,
                        "biography",
                        event.target.value
                      )
                    }
                    rows={6}
                    className="resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-[#102b3a]"
                  />
                </label>
              </div>
            </article>
          ))}

          <button
            type="button"
            onClick={addMember}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            <Plus size={18} />
            Adicionar integrante
          </button>
        </div>
      </Card>

      <Card className="admin-dashboard-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) =>
                setPublished(event.target.checked)
              }
              className="h-5 w-5 rounded border-slate-300"
            />

            <span>
              <strong className="block text-sm font-black text-slate-900">
                Publicar Quem Somos
              </strong>
              <small className="text-xs font-semibold text-slate-500">
                Quando ativo, o conteúdo poderá ser exibido no
                site público da YggdraTech.
              </small>
            </span>
          </label>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#102b3a] px-6 text-sm font-black text-white transition hover:bg-[#173d50] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <LoaderCircle
                className="animate-spin"
                size={18}
              />
            ) : (
              <Save size={18} />
            )}

            {isSaving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </Card>
    </div>
  );
}
