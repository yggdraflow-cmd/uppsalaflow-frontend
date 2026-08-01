import { useEffect, useMemo, useState } from "react";
import { ExternalLink, LinkIcon, Pencil, X } from "lucide-react";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { api } from "../services/api";
import type { Business } from "../types/business";
import type { Client } from "../types/client";
import { getBusinessTheme } from "../utils/businessTheme";

function formatDateInput(date?: string | null) {
  if (!date) {
    return "";
  }

  return new Date(date).toISOString().split("T")[0];
}

function getPeopleCopy(business?: Business) {
  const theme = getBusinessTheme(business?.segment, business?.specialty);

  if (business?.segment === "ODONTOLOGY") {
    return {
      theme,
      eyebrow: "Base do consultório",
      title: "Pacientes",
      description:
        "Acompanhe os pacientes vinculados ao consultório. O cadastro deve ser feito pelo próprio paciente no link público.",
      businessCardTitle: "Consultório selecionado",
      businessSelectLabel: "Escolha o consultório",
      loadingBusinesses: "Carregando consultórios...",
      emptyBusiness:
        "Cadastre um consultório antes de visualizar pacientes.",
      publicLinkTitle: "Link público do consultório",
      publicLinkDescription:
        "Envie esse link para o paciente acessar a página pública, criar o cadastro e solicitar horário.",
      publicLinkButton: "Abrir página pública",
      copyLinkButton: "Copiar link",
      editTitle: "Editar paciente",
      listTitle: "Pacientes vinculados",
      emptyList:
        "Nenhum paciente vinculado ainda. Quando o paciente se cadastrar pelo link público, ele aparecerá aqui.",
      loadingList: "Carregando pacientes...",
      nameLabel: "Nome do paciente",
      phoneLabel: "Telefone",
      emailLabel: "E-mail",
      birthDateLabel: "Data de nascimento",
      notesLabel: "Observações administrativas",
      notesPlaceholder:
        "Observações internas do consultório sobre o paciente...",
      saveButton: "Salvar paciente",
      savingButton: "Salvando...",
      cancelButton: "Cancelar edição",
      editButton: "Editar",
      updatedMessage: "Paciente atualizado com sucesso.",
      updateError: "Não foi possível salvar o paciente.",
      loadError: "Não foi possível carregar os pacientes.",
      linkCopiedMessage: "Link público copiado.",
    };
  }

  if (business?.segment === "VETERINARY") {
    return {
      theme,
      eyebrow: "Base da clínica",
      title: "Tutores",
      description:
        "Acompanhe os tutores vinculados à clínica. O cadastro deve ser feito pelo próprio tutor no link público.",
      businessCardTitle: "Clínica selecionada",
      businessSelectLabel: "Escolha a clínica",
      loadingBusinesses: "Carregando clínicas...",
      emptyBusiness:
        "Cadastre uma clínica antes de visualizar tutores.",
      publicLinkTitle: "Link público da clínica",
      publicLinkDescription:
        "Envie esse link para o tutor acessar a página pública, criar o cadastro e solicitar atendimento.",
      publicLinkButton: "Abrir página pública",
      copyLinkButton: "Copiar link",
      editTitle: "Editar tutor",
      listTitle: "Tutores vinculados",
      emptyList:
        "Nenhum tutor vinculado ainda. Quando o tutor se cadastrar pelo link público, ele aparecerá aqui.",
      loadingList: "Carregando tutores...",
      nameLabel: "Nome do tutor",
      phoneLabel: "Telefone",
      emailLabel: "E-mail",
      birthDateLabel: "Data de nascimento",
      notesLabel: "Observações administrativas",
      notesPlaceholder:
        "Observações internas da clínica sobre o tutor ou pet...",
      saveButton: "Salvar tutor",
      savingButton: "Salvando...",
      cancelButton: "Cancelar edição",
      editButton: "Editar",
      updatedMessage: "Tutor atualizado com sucesso.",
      updateError: "Não foi possível salvar o tutor.",
      loadError: "Não foi possível carregar os tutores.",
      linkCopiedMessage: "Link público copiado.",
    };
  }

  return {
    theme,
    eyebrow: business?.segment === "BEAUTY" ? "Base do estúdio" : "Base do negócio",
    title: "Clientes",
    description:
      "Acompanhe os clientes vinculados ao negócio. O cadastro deve ser feito pelo próprio cliente no link público.",
    businessCardTitle: business?.segment === "BEAUTY" ? "Estúdio selecionado" : "Negócio selecionado",
    businessSelectLabel: business?.segment === "BEAUTY" ? "Escolha o estúdio" : "Escolha o negócio",
    loadingBusinesses: "Carregando negócios...",
    emptyBusiness:
      "Cadastre um negócio antes de visualizar clientes.",
    publicLinkTitle: "Link público do negócio",
    publicLinkDescription:
      "Envie esse link para o cliente acessar a página pública, criar o cadastro e solicitar horário.",
    publicLinkButton: "Abrir página pública",
    copyLinkButton: "Copiar link",
    editTitle: "Editar cliente",
    listTitle: "Clientes vinculados",
    emptyList:
      "Nenhum cliente vinculado ainda. Quando o cliente se cadastrar pelo link público, ele aparecerá aqui.",
    loadingList: "Carregando clientes...",
    nameLabel: "Nome do cliente",
    phoneLabel: "Telefone",
    emailLabel: "E-mail",
    birthDateLabel: "Data de nascimento",
    notesLabel: "Observações administrativas",
    notesPlaceholder:
      "Observações internas do negócio sobre o cliente...",
    saveButton: "Salvar cliente",
    savingButton: "Salvando...",
    cancelButton: "Cancelar edição",
    editButton: "Editar",
    updatedMessage: "Cliente atualizado com sucesso.",
    updateError: "Não foi possível salvar o cliente.",
    loadError: "Não foi possível carregar os clientes.",
    linkCopiedMessage: "Link público copiado.",
  };
}

export function ClientsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [clients, setClients] = useState<Client[]>([]);

  const [editingClientId, setEditingClientId] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [notes, setNotes] = useState("");

  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  const copy = getPeopleCopy(selectedBusiness);

  const publicLink = selectedBusiness?.slug
    ? `${window.location.origin}/agendar/${selectedBusiness.slug}`
    : "";

  useEffect(() => {
    async function loadBusinesses() {
      try {
        setIsLoadingBusinesses(true);
        setError("");

        const response = await api.get<Business[]>("/businesses");

        setBusinesses(response.data);

        if (response.data.length > 0) {
          setSelectedBusinessId(response.data[0].id);
        }
      } catch {
        setError("Não foi possível carregar os negócios cadastrados.");
      } finally {
        setIsLoadingBusinesses(false);
      }
    }

    loadBusinesses();
  }, []);

  useEffect(() => {
    async function loadClients() {
      if (!selectedBusinessId) {
        setClients([]);
        return;
      }

      try {
        setIsLoadingClients(true);
        setError("");

        const response = await api.get<Client[]>("/clients", {
          params: {
            businessId: selectedBusinessId,
          },
        });

        setClients(response.data);
      } catch {
        setError(copy.loadError);
      } finally {
        setIsLoadingClients(false);
      }
    }

    loadClients();
  }, [selectedBusinessId, copy.loadError]);

  function resetForm() {
    setEditingClientId("");
    setName("");
    setPhone("");
    setEmail("");
    setBirthDate("");
    setNotes("");
  }

  function handleEdit(client: Client) {
    setEditingClientId(client.id);
    setName(client.name);
    setPhone(client.phone || "");
    setEmail(client.email || "");
    setBirthDate(formatDateInput(client.birthDate));
    setNotes(client.notes || "");
    setMessage("");
    setError("");
  }

  async function handleCopyPublicLink() {
    if (!publicLink) {
      return;
    }

    await navigator.clipboard.writeText(publicLink);
    setMessage(copy.linkCopiedMessage);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!editingClientId) {
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");
      setError("");

      const payload = {
        name,
        phone: phone || undefined,
        email: email || undefined,
        birthDate: birthDate ? new Date(birthDate).toISOString() : undefined,
        notes: notes || undefined,
      };

      const response = await api.put<Client>(
        `/clients/${editingClientId}`,
        payload
      );

      setClients((currentClients) =>
        currentClients.map((client) =>
          client.id === editingClientId ? response.data : client
        )
      );

      setMessage(copy.updatedMessage);
      resetForm();
    } catch {
      setError(copy.updateError);
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
      </div>

      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 [&>*]:min-w-0 xl:grid-cols-2">
        <Card title={copy.businessCardTitle}>
          {isLoadingBusinesses ? (
            <p className="text-sm text-zinc-500">{copy.loadingBusinesses}</p>
          ) : businesses.length === 0 ? (
            <p className="text-sm text-red-600">{copy.emptyBusiness}</p>
          ) : (
            <label className="block min-w-0 max-w-full">
              <span className="mb-1 block text-sm font-medium text-zinc-700">
                {copy.businessSelectLabel}
              </span>

              <select
                value={selectedBusinessId}
                onChange={(event) => {
                  setSelectedBusinessId(event.target.value);
                  resetForm();
                }}
                className="min-w-0 max-w-full w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--yggdra-primary)] focus:ring-2 focus:ring-[var(--yggdra-accent)]"
              >
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </Card>

        <Card title={copy.publicLinkTitle}>
          <div className="min-w-0 max-w-full space-y-4 overflow-hidden">
            <p className="break-words text-sm text-zinc-600">
              {copy.publicLinkDescription}
            </p>

            <div className="flex min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-2xl bg-[var(--yggdra-muted)] px-3 py-3 text-sm font-bold text-zinc-700 sm:px-4">
              <LinkIcon size={18} className="shrink-0 text-[var(--yggdra-primary)]" />
              <span className="block min-w-0 flex-1 truncate">
                {publicLink || "Link indisponível"}
              </span>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="secondary"
                className="w-full min-w-0"
                disabled={!publicLink}
                onClick={handleCopyPublicLink}
              >
                {copy.copyLinkButton}
              </Button>

              <a
                href={publicLink || "#"}
                target="_blank"
                rel="noreferrer"
                className={[
                  "inline-flex min-w-0 w-full items-center justify-center gap-2 whitespace-normal rounded-xl px-4 py-2 text-center text-sm font-black transition",
                  publicLink
                    ? "bg-[var(--yggdra-primary)] text-[var(--yggdra-primary-text)]"
                    : "pointer-events-none bg-zinc-200 text-zinc-500",
                ].join(" ")}
              >
                <ExternalLink size={17} />
                {copy.publicLinkButton}
              </a>
            </div>
          </div>
        </Card>
      </div>

      <div className="yggdra-split-grid">
        <Card title={editingClientId ? copy.editTitle : "Edição administrativa"}>
          {editingClientId ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={copy.nameLabel}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />

              <Input
                label={copy.phoneLabel}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Ex: (11) 99999-9999"
              />

              <Input
                label={copy.emailLabel}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="cliente@email.com"
              />

              <Input
                label={copy.birthDateLabel}
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
              />

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-zinc-700">
                  {copy.notesLabel}
                </span>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  placeholder={copy.notesPlaceholder}
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--yggdra-primary)] focus:ring-2 focus:ring-[var(--yggdra-accent)]"
                />
              </label>

              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? copy.savingButton : copy.saveButton}
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={resetForm}
              >
                {copy.cancelButton}
              </Button>
            </form>
          ) : (
            <div className="rounded-2xl bg-[var(--yggdra-muted)] p-4 text-sm font-medium leading-6 text-zinc-700">
              Selecione uma pessoa na lista para editar dados administrativos.
              O cadastro inicial deve ser feito pela própria pessoa no link
              público do negócio.
            </div>
          )}

          {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </Card>

        <Card title={copy.listTitle}>
          {isLoadingClients ? (
            <p className="text-sm text-zinc-500">{copy.loadingList}</p>
          ) : clients.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--yggdra-primary)] bg-[var(--yggdra-muted)] p-4 text-sm font-bold text-zinc-600">
              {copy.emptyList}
            </p>
          ) : (
            <div className="space-y-3">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-2xl border border-white/80 bg-[var(--yggdra-card)] p-4 shadow-[0_16px_34px_var(--yggdra-shadow)]"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-black text-zinc-950">
                        {client.name}
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        Telefone: {client.phone || "Não informado"}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        E-mail: {client.email || "Não informado"}
                      </p>

                      {client.birthDate && (
                        <p className="mt-1 text-sm text-zinc-500">
                          Nascimento:{" "}
                          {new Date(client.birthDate).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      )}

                      {client.notes && (
                        <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-zinc-600 ring-1 ring-zinc-200">
                          {client.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleEdit(client)}
                      >
                        <Pencil size={16} />
                        {copy.editButton}
                      </Button>

                      {editingClientId === client.id ? (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={resetForm}
                        >
                          <X size={16} />
                          Fechar
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
