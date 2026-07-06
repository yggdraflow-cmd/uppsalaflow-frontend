import { FormEvent, useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { api } from "../services/api";
import type { Business } from "../types/business";

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

        setMessage("Negócio atualizado com sucesso.");
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
        "Não foi possível salvar o negócio. Verifique se o slug já está em uso."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-[#171717]">Configuração</p>
        <h1 className="text-3xl font-bold text-zinc-950">Meu negócio</h1>
        <p className="mt-2 text-zinc-600">
          Cadastre e edite as informações do salão, barbearia, estúdio ou
          atendimento autônomo.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card title={editingBusinessId ? "Editar negócio" : "Cadastrar negócio"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome do negócio"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Barbearia Lothbrock"
              required
            />

            <Input
              label="Slug público"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="barbearia-lothbrock"
              required
            />

            <Input
              label="Categoria"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Salão, barbearia, estética..."
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

          {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </Card>

        <Card title="Negócios cadastrados">
          {isLoading ? (
            <p className="text-sm text-zinc-500">Carregando negócios...</p>
          ) : businesses.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Nenhum negócio cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {businesses.map((business) => (
                <div
                  key={business.id}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-950">
                        {business.name}
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        Categoria: {business.category || "Não informada"}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Slug público:{" "}
                        <span className="font-medium text-zinc-800">
                          {business.slug}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Telefone: {business.phone || "Não informado"}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        E-mail: {business.email || "Não informado"}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Endereço: {business.address || "Não informado"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="rounded-full bg-[#f3f3f3] px-3 py-1 text-center text-xs font-semibold text-[#171717]">
                        Ativo
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

                  <div className="mt-4 rounded-xl bg-white px-3 py-2 text-sm text-zinc-600 ring-1 ring-zinc-200">
                    Página pública futura:{" "}
                    <span className="font-medium text-zinc-950">
                      /agendar/{business.slug}
                    </span>
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