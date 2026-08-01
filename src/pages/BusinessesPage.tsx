import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { api } from "../services/api";
import type { Business } from "../types/business";
import { getBusinessTheme } from "../utils/businessTheme";

function getBusinessPageCopy(business?: Business | null) {
  const theme = getBusinessTheme(business?.segment, business?.specialty);

  if (business?.segment === "ODONTOLOGY") {
    return {
      eyebrow: "Configuração do consultório",
      title: "Meu consultório",
      description:
        "Cadastre e edite as informações do consultório, clínica odontológica ou atendimento odontológico.",
      formTitle: "Cadastrar consultório",
      editTitle: "Editar consultório",
      listTitle: "Consultórios cadastrados",
      emptyText: "Nenhum consultório cadastrado ainda.",
      nameLabel: "Nome do consultório",
      namePlaceholder: "Ex: Rodrigo Odonto",
      slugPlaceholder: "rodrigo-odonto",
      categoryPlaceholder: "Odontologia, clínica odontológica...",
      publicPageLabel: "Página pública de agendamento",
      activeLabel: "Ativo",
      theme,
    };
  }

  if (business?.segment === "VETERINARY") {
    return {
      eyebrow: "Configuração da clínica",
      title: "Minha clínica veterinária",
      description:
        "Cadastre e edite as informações da clínica veterinária, pet care ou atendimento animal.",
      formTitle: "Cadastrar clínica",
      editTitle: "Editar clínica",
      listTitle: "Clínicas cadastradas",
      emptyText: "Nenhuma clínica cadastrada ainda.",
      nameLabel: "Nome da clínica",
      namePlaceholder: "Ex: Clínica Vet Aurora",
      slugPlaceholder: "clinica-vet-aurora",
      categoryPlaceholder: "Veterinária, pet care...",
      publicPageLabel: "Página pública de agendamento",
      activeLabel: "Ativo",
      theme,
    };
  }

  if (business?.segment === "BARBERSHOP") {
    return {
      eyebrow: "Configuração da barbearia",
      title: "Minha barbearia",
      description:
        "Cadastre e edite as informações da barbearia, equipe, contato e página pública.",
      formTitle: "Cadastrar barbearia",
      editTitle: "Editar barbearia",
      listTitle: "Barbearias cadastradas",
      emptyText: "Nenhuma barbearia cadastrada ainda.",
      nameLabel: "Nome da barbearia",
      namePlaceholder: "Ex: Barbearia Lothbrock",
      slugPlaceholder: "barbearia-lothbrock",
      categoryPlaceholder: "Barbearia, grooming masculino...",
      publicPageLabel: "Página pública de agendamento",
      activeLabel: "Ativo",
      theme,
    };
  }

  if (business?.segment === "BEAUTY") {
    return {
      eyebrow: "Configuração do estúdio",
      title: "Meu estúdio de beleza",
      description:
        "Cadastre e edite as informações do estúdio, serviços de beleza, contato e página pública.",
      formTitle: "Cadastrar estúdio",
      editTitle: "Editar estúdio",
      listTitle: "Estúdios cadastrados",
      emptyText: "Nenhum estúdio cadastrado ainda.",
      nameLabel: "Nome do estúdio",
      namePlaceholder: "Ex: Studio Bella",
      slugPlaceholder: "studio-bella",
      categoryPlaceholder: theme.segmentLabel,
      publicPageLabel: "Página pública de agendamento",
      activeLabel: "Ativo",
      theme,
    };
  }

  if (business?.segment === "WELLNESS") {
    return {
      eyebrow: "Configuração do espaço",
      title: "Meu espaço de bem-estar",
      description:
        "Cadastre e edite as informações do espaço, terapias, contato e página pública.",
      formTitle: "Cadastrar espaço",
      editTitle: "Editar espaço",
      listTitle: "Espaços cadastrados",
      emptyText: "Nenhum espaço cadastrado ainda.",
      nameLabel: "Nome do espaço",
      namePlaceholder: "Ex: Espaço Essência",
      slugPlaceholder: "espaco-essencia",
      categoryPlaceholder: "Bem-estar, terapias, massoterapia...",
      publicPageLabel: "Página pública de agendamento",
      activeLabel: "Ativo",
      theme,
    };
  }

  return {
    eyebrow: "Configuração",
    title: "Meu negócio",
    description:
      "Cadastre e edite as informações principais do seu negócio, contato e página pública.",
    formTitle: "Cadastrar negócio",
    editTitle: "Editar negócio",
    listTitle: "Negócios cadastrados",
    emptyText: "Nenhum negócio cadastrado ainda.",
    nameLabel: "Nome do negócio",
    namePlaceholder: "Ex: Yggdra Studio",
    slugPlaceholder: "yggdra-studio",
    categoryPlaceholder: "Categoria do negócio...",
    publicPageLabel: "Página pública de agendamento",
    activeLabel: "Ativo",
    theme,
  };
}

export function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const [editingBusinessId, setEditingBusinessId] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const selectedBusiness = useMemo(() => {
    return (
      businesses.find((business) => business.id === editingBusinessId) ||
      businesses[0] ||
      null
    );
  }, [businesses, editingBusinessId]);

  const copy = getBusinessPageCopy(selectedBusiness);

  useEffect(() => {
    async function loadBusinesses() {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get<Business[]>("/businesses");

        setBusinesses(response.data);
      } catch {
        setError("Não foi possível carregar os negócios cadastrados.");
      } finally {
        setIsLoading(false);
      }
    }

    loadBusinesses();
  }, []);

  function resetForm() {
    setEditingBusinessId("");
    setName("");
    setSlug("");
    setCategory("");
    setPhone("");
    setEmail("");
    setAddress("");
  }

  function handleEdit(business: Business) {
    setEditingBusinessId(business.id);
    setName(business.name);
    setSlug(business.slug);
    setCategory(business.category || "");
    setPhone(business.phone || "");
    setEmail(business.email || "");
    setAddress(business.address || "");
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setMessage("");
      setError("");

      const payload = {
        name,
        slug,
        category: category || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
      };

      if (editingBusinessId) {
        const response = await api.put<Business>(
          `/businesses/${editingBusinessId}`,
          payload
        );

        setBusinesses((currentBusinesses) =>
          currentBusinesses.map((business) =>
            business.id === editingBusinessId ? response.data : business
          )
        );

        setMessage("Informações atualizadas com sucesso.");
        resetForm();
        return;
      }

      const response = await api.post<Business>("/businesses", payload);

      setBusinesses((currentBusinesses) => [
        response.data,
        ...currentBusinesses,
      ]);

      setMessage("Negócio cadastrado com sucesso.");
      resetForm();
    } catch {
      setError(
        "Não foi possível salvar. Verifique se o slug já está em uso."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="yggdra-page">
      <div className="mb-8">
        <p className="text-sm font-black text-[var(--yggdra-primary)]">
          {copy.eyebrow}
        </p>

        <h1 className="text-3xl font-black text-zinc-950">{copy.title}</h1>

        <p className="mt-2 max-w-3xl text-zinc-600">{copy.description}</p>

        <div className="mt-4 inline-flex rounded-full bg-[var(--yggdra-accent)] px-4 py-2 text-xs font-black text-[var(--yggdra-accent-text)] shadow-[0_12px_34px_var(--yggdra-shadow)]">
          Tema ativo: {copy.theme.brandName}
        </div>
      </div>

      <div className="yggdra-split-grid">
        <section className="rounded-[32px] border border-white/80 bg-[var(--yggdra-card)] p-6 shadow-[0_24px_70px_var(--yggdra-shadow)] backdrop-blur-2xl">
          <h2 className="mb-6 text-2xl font-black text-[#171717]">
            {editingBusinessId ? copy.editTitle : copy.formTitle}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={copy.nameLabel}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={copy.namePlaceholder}
              required
            />

            <Input
              label="Slug público"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder={copy.slugPlaceholder}
              required
            />

            <Input
              label="Categoria pública"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder={copy.categoryPlaceholder}
            />

            <Input
              label="Telefone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(11) 99999-9999"
            />

            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="contato@negocio.com"
            />

            <Input
              label="Endereço"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Rua, número, bairro e cidade"
            />

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving
                ? "Salvando..."
                : editingBusinessId
                  ? "Salvar alterações"
                  : "Salvar negócio"}
            </Button>

            {editingBusinessId && (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={resetForm}
              >
                Cancelar edição
              </Button>
            )}
          </form>

          {message && (
            <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-black text-green-700 ring-1 ring-green-100">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 ring-1 ring-red-100">
              {error}
            </p>
          )}
        </section>

        <section className="rounded-[32px] border border-white/80 bg-[var(--yggdra-card)] p-6 shadow-[0_24px_70px_var(--yggdra-shadow)] backdrop-blur-2xl">
          <h2 className="mb-6 text-2xl font-black text-[#171717]">
            {copy.listTitle}
          </h2>

          {isLoading ? (
            <p className="text-sm font-medium text-zinc-500">
              Carregando informações...
            </p>
          ) : businesses.length === 0 ? (
            <p className="text-sm font-medium text-zinc-500">
              {copy.emptyText}
            </p>
          ) : (
            <div className="space-y-4">
              {businesses.map((business) => {
                const businessTheme = getBusinessTheme(
                  business.segment,
                  business.specialty
                );

                return (
                  <div
                    key={business.id}
                    className="rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-[0_18px_50px_var(--yggdra-shadow)] backdrop-blur-xl"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-xl font-black text-zinc-950">
                          {business.name}
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[var(--yggdra-primary)] px-3 py-1 text-xs font-black text-[var(--yggdra-primary-text)]">
                            {businessTheme.brandName}
                          </span>

                          <span className="rounded-full bg-[var(--yggdra-accent)] px-3 py-1 text-xs font-black text-[var(--yggdra-accent-text)]">
                            {businessTheme.segmentLabel}
                          </span>
                        </div>

                        <div className="mt-4 space-y-1 text-sm font-medium text-zinc-600">
                          <p>
                            Categoria:{" "}
                            <span className="font-bold text-zinc-800">
                              {business.category || "Não informada"}
                            </span>
                          </p>

                          <p>
                            Slug público:{" "}
                            <span className="font-bold text-zinc-800">
                              {business.slug}
                            </span>
                          </p>

                          <p>Telefone: {business.phone || "Não informado"}</p>
                          <p>E-mail: {business.email || "Não informado"}</p>
                          <p>Endereço: {business.address || "Não informado"}</p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2">
                        <span className="rounded-full bg-[var(--yggdra-muted)] px-4 py-2 text-center text-xs font-black text-[#171717]">
                          {copy.activeLabel}
                        </span>

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleEdit(business)}
                        >
                          Editar
                        </Button>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl bg-white/86 px-4 py-3 text-sm font-medium text-zinc-600 ring-1 ring-white/80">
                      {copy.publicPageLabel}:{" "}
                      <span className="font-black text-zinc-950">
                        /agendar/{business.slug}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
