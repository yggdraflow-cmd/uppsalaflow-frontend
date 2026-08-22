import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  Save,
} from "lucide-react";

import { api } from "../services/api";
import { Card } from "./Card";

type HomeSection = {
  kicker?: string;
  title: string;
  description: string;
};

type SocialLink = {
  id?: string;
  platform: "instagram" | "x" | "linkedin" | "email";
  label: string;
  url: string;
  order: number;
};

type HomeContent = {
  intro: {
    hello: string;
    title: string;
    highlight: string;
    description: string;
  };
  hero: {
    badge: string;
    title: string;
    highlight: string;
    description: string;
    exploreLabel: string;
    exploreHref: string;
  };
  clarity: HomeSection;
  information: HomeSection;
  finalCta: {
    title: string;
    description: string;
    buttonLabel: string;
    buttonHref: string;
  };
  social: {
    title: string;
    links: SocialLink[];
  };
  footerText: string;
  chatbot: {
    title: string;
    placeholder: string;
  };
};

type AdminHomeResponse = {
  id: string | null;
  key: "HOME";
  content: HomeContent;
  published: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  updatedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
};

type EditableSection =
  | "intro"
  | "hero"
  | "clarity"
  | "information"
  | "finalCta"
  | "social"
  | "footer"
  | "chatbot"
  | null;

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

const fieldClass =
  "h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-[#102b3a]";

const textareaClass =
  "resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-900 outline-none focus:border-[#102b3a]";

function SectionCard({
  label,
  title,
  description,
  onClick,
}: {
  label: string;
  title: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[22px] border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-slate-300 hover:bg-white"
    >
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <h3 className="mt-2 whitespace-pre-line text-base font-black text-slate-950">
        {title || "Sem título cadastrado."}
      </h3>

      {description ? (
        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-700">
          {description}
        </p>
      ) : null}

      <span className="mt-3 block text-xs font-black text-slate-400">
        Clique para editar
      </span>
    </button>
  );
}

export function AdminYggdraTechHome() {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [published, setPublished] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] =
    useState<AdminHomeResponse["updatedBy"]>(null);

  const [editingSection, setEditingSection] =
    useState<EditableSection>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response =
        await api.get<AdminHomeResponse>(
          "/admin/yggdratech/home"
        );

      setContent(response.data.content);
      setPublished(response.data.published);
      setUpdatedAt(response.data.updatedAt);
      setUpdatedBy(response.data.updatedBy);
      setEditingSection(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  async function handleSave() {
    if (!content) {
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...content,
        social: {
          ...content.social,
          links: content.social.links.map((link, index) => ({
            ...(link.id ? { id: link.id } : {}),
            platform: link.platform,
            label: link.label,
            url: link.url,
            order: index,
          })),
        },
        published,
      };

      const response = await api.put<{
        message: string;
        content: AdminHomeResponse;
      }>("/admin/yggdratech/home", payload);

      setContent(response.data.content.content);
      setPublished(response.data.content.published);
      setUpdatedAt(response.data.content.updatedAt);
      setUpdatedBy(response.data.content.updatedBy);
      setEditingSection(null);
      setSuccess(response.data.message);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  function updateSocialLink(
    index: number,
    field: keyof SocialLink,
    value: string
  ) {
    if (!content) {
      return;
    }

    setContent({
      ...content,
      social: {
        ...content.social,
        links: content.social.links.map((link, linkIndex) =>
          linkIndex === index
            ? {
                ...link,
                [field]: value,
              }
            : link
        ),
      },
    });
  }

  if (isLoading) {
    return (
      <Card className="admin-dashboard-card">
        <div className="flex min-h-56 items-center justify-center gap-3 text-sm font-bold text-slate-500">
          <LoaderCircle className="animate-spin" size={22} />
          Carregando Home da YggdraTech...
        </div>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card className="admin-dashboard-card">
        <p className="text-sm font-semibold text-red-600">
          Não foi possível carregar o conteúdo da Home.
        </p>
      </Card>
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
        title="Home da YggdraTech"
      >
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold leading-6 text-slate-500">
              Gerencie o conteúdo exibido na Home a partir da seção
              YggdraFlow para você.
            </p>

            {updatedAt ? (
              <p className="mt-2 text-xs font-semibold text-slate-400">
                Última alteração:{" "}
                {new Date(updatedAt).toLocaleString("pt-BR")}
                {updatedBy ? ` por ${updatedBy.name}` : ""}
              </p>
            ) : null}
          </div>

          <SectionCard
            label="Carrossel animado"
            title={`${content.intro.hello} ${content.intro.title} ${content.intro.highlight}`}
            description={content.intro.description}
            onClick={() => setEditingSection("intro")}
          />

          {editingSection === "intro" ? (
            <div className="grid gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  Sequência da animação
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  Estes textos aparecem antes do logo da YggdraTech.
                  O logo e o comportamento da animação permanecem fixos.
                </p>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Texto inicial
                </span>

                <input
                  className={fieldClass}
                  value={content.intro.hello}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      intro: {
                        ...content.intro,
                        hello: event.target.value,
                      },
                    })
                  }
                  placeholder="Ex.: Olá."
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Título
                </span>

                <input
                  className={fieldClass}
                  value={content.intro.title}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      intro: {
                        ...content.intro,
                        title: event.target.value,
                      },
                    })
                  }
                  placeholder="Ex.: Transformamos ideias em"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Destaque do título
                </span>

                <input
                  className={fieldClass}
                  value={content.intro.highlight}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      intro: {
                        ...content.intro,
                        highlight: event.target.value,
                      },
                    })
                  }
                  placeholder="Ex.: soluções digitais."
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Descrição
                </span>

                <textarea
                  rows={4}
                  className={textareaClass}
                  value={content.intro.description}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      intro: {
                        ...content.intro,
                        description: event.target.value,
                      },
                    })
                  }
                  placeholder="Texto apresentado antes do logo."
                />
              </label>
            </div>
          ) : null}

          <SectionCard
            label="Bloco 1"
            title={content.hero.title}
            description={content.hero.description}
            onClick={() => setEditingSection("hero")}
          />

          {editingSection === "hero" ? (
            <div className="grid gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-5">
              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Badge
                </span>
                <input
                  className={fieldClass}
                  value={content.hero.badge}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      hero: {
                        ...content.hero,
                        badge: event.target.value,
                      },
                    })
                  }
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Título
                </span>
                <textarea
                  rows={3}
                  className={textareaClass}
                  value={content.hero.title}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      hero: {
                        ...content.hero,
                        title: event.target.value,
                      },
                    })
                  }
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Destaque
                </span>
                <input
                  className={fieldClass}
                  value={content.hero.highlight}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      hero: {
                        ...content.hero,
                        highlight: event.target.value,
                      },
                    })
                  }
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Descrição
                </span>
                <textarea
                  rows={4}
                  className={textareaClass}
                  value={content.hero.description}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      hero: {
                        ...content.hero,
                        description: event.target.value,
                      },
                    })
                  }
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-slate-800">
                    Texto do link
                  </span>
                  <input
                    className={fieldClass}
                    value={content.hero.exploreLabel}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        hero: {
                          ...content.hero,
                          exploreLabel: event.target.value,
                        },
                      })
                    }
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black text-slate-800">
                    Destino do link
                  </span>
                  <input
                    className={fieldClass}
                    value={content.hero.exploreHref}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        hero: {
                          ...content.hero,
                          exploreHref: event.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>
            </div>
          ) : null}

          <SectionCard
            label="Bloco 2"
            title={content.clarity.title}
            description={content.clarity.description}
            onClick={() => setEditingSection("clarity")}
          />

          {editingSection === "clarity" ? (
            <div className="grid gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-5">
              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Texto superior
                </span>
                <input
                  className={fieldClass}
                  value={content.clarity.kicker || ""}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      clarity: {
                        ...content.clarity,
                        kicker: event.target.value,
                      },
                    })
                  }
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Título
                </span>
                <textarea
                  rows={3}
                  className={textareaClass}
                  value={content.clarity.title}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      clarity: {
                        ...content.clarity,
                        title: event.target.value,
                      },
                    })
                  }
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Descrição
                </span>
                <textarea
                  rows={4}
                  className={textareaClass}
                  value={content.clarity.description}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      clarity: {
                        ...content.clarity,
                        description: event.target.value,
                      },
                    })
                  }
                />
              </label>
            </div>
          ) : null}

          <SectionCard
            label="Bloco 3"
            title={content.information.title}
            description={content.information.description}
            onClick={() => setEditingSection("information")}
          />

          {editingSection === "information" ? (
            <div className="grid gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-5">
              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Texto superior
                </span>
                <input
                  className={fieldClass}
                  value={content.information.kicker || ""}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      information: {
                        ...content.information,
                        kicker: event.target.value,
                      },
                    })
                  }
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Título
                </span>
                <textarea
                  rows={4}
                  className={textareaClass}
                  value={content.information.title}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      information: {
                        ...content.information,
                        title: event.target.value,
                      },
                    })
                  }
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Descrição
                </span>
                <textarea
                  rows={4}
                  className={textareaClass}
                  value={content.information.description}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      information: {
                        ...content.information,
                        description: event.target.value,
                      },
                    })
                  }
                />
              </label>
            </div>
          ) : null}

          <SectionCard
            label="Bloco 4"
            title={content.finalCta.title}
            description={content.finalCta.description}
            onClick={() => setEditingSection("finalCta")}
          />

          {editingSection === "finalCta" ? (
            <div className="grid gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-5">
              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Título
                </span>
                <textarea
                  rows={3}
                  className={textareaClass}
                  value={content.finalCta.title}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      finalCta: {
                        ...content.finalCta,
                        title: event.target.value,
                      },
                    })
                  }
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Descrição
                </span>
                <textarea
                  rows={4}
                  className={textareaClass}
                  value={content.finalCta.description}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      finalCta: {
                        ...content.finalCta,
                        description: event.target.value,
                      },
                    })
                  }
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-slate-800">
                    Texto do botão
                  </span>
                  <input
                    className={fieldClass}
                    value={content.finalCta.buttonLabel}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        finalCta: {
                          ...content.finalCta,
                          buttonLabel: event.target.value,
                        },
                      })
                    }
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black text-slate-800">
                    Destino do botão
                  </span>
                  <input
                    className={fieldClass}
                    value={content.finalCta.buttonHref}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        finalCta: {
                          ...content.finalCta,
                          buttonHref: event.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>
            </div>
          ) : null}

          <SectionCard
            label="Redes sociais"
            title={content.social.title}
            description={`${content.social.links.length} links configurados`}
            onClick={() => setEditingSection("social")}
          />

          {editingSection === "social" ? (
            <div className="grid gap-5 rounded-[22px] border border-slate-200 bg-slate-50 p-5">
              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Título
                </span>
                <input
                  className={fieldClass}
                  value={content.social.title}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      social: {
                        ...content.social,
                        title: event.target.value,
                      },
                    })
                  }
                />
              </label>

              {content.social.links.map((link, index) => (
                <div
                  key={link.id || `${link.platform}-${index}`}
                  className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2"
                >
                  <label className="grid gap-2">
                    <span className="text-sm font-black text-slate-800">
                      Nome
                    </span>
                    <input
                      className={fieldClass}
                      value={link.label}
                      onChange={(event) =>
                        updateSocialLink(
                          index,
                          "label",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-black text-slate-800">
                      Link
                    </span>
                    <input
                      className={fieldClass}
                      value={link.url}
                      onChange={(event) =>
                        updateSocialLink(
                          index,
                          "url",
                          event.target.value
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          ) : null}

          <SectionCard
            label="Rodapé"
            title={content.footerText}
            onClick={() => setEditingSection("footer")}
          />

          {editingSection === "footer" ? (
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Texto do rodapé
                </span>
                <input
                  className={fieldClass}
                  value={content.footerText}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      footerText: event.target.value,
                    })
                  }
                />
              </label>
            </div>
          ) : null}

          <SectionCard
            label="Chatbot"
            title={content.chatbot.title}
            description={content.chatbot.placeholder}
            onClick={() => setEditingSection("chatbot")}
          />

          {editingSection === "chatbot" ? (
            <div className="grid gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Nome do chatbot
                </span>
                <input
                  className={fieldClass}
                  value={content.chatbot.title}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      chatbot: {
                        ...content.chatbot,
                        title: event.target.value,
                      },
                    })
                  }
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">
                  Texto do campo
                </span>
                <input
                  className={fieldClass}
                  value={content.chatbot.placeholder}
                  onChange={(event) =>
                    setContent({
                      ...content,
                      chatbot: {
                        ...content.chatbot,
                        placeholder: event.target.value,
                      },
                    })
                  }
                />
              </label>
            </div>
          ) : null}

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) =>
                setPublished(event.target.checked)
              }
              className="h-5 w-5"
            />

            <div>
              <strong className="block text-sm font-black text-slate-900">
                Publicar Home
              </strong>
              <span className="text-xs font-semibold text-slate-500">
                Quando ativado, o conteúdo poderá ser consumido pelo site público.
              </span>
            </div>
          </label>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleSave()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#102b3a] px-5 py-3 text-sm font-black text-white hover:bg-[#173d50] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <LoaderCircle className="animate-spin" size={18} />
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
