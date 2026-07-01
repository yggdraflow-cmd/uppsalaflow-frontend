import { FormEvent, useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { api } from "../services/api";
import type { Business } from "../types/business";

export function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setMessage("");
      setError("");

      const response = await api.post<Business>("/businesses", {
        name,
        slug,
        category,
      });

      setBusinesses((currentBusinesses) => [
        response.data,
        ...currentBusinesses,
      ]);

      setMessage("Negócio cadastrado com sucesso.");
      setName("");
      setSlug("");
      setCategory("");
    } catch {
      setError("Não foi possível cadastrar o negócio. Verifique se o slug já está em uso.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-beauty-700">Configuração</p>
        <h1 className="text-3xl font-bold text-zinc-950">Meu negócio</h1>
        <p className="mt-2 text-zinc-600">
          Cadastre o salão, barbearia, estúdio ou atendimento autônomo.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card title="Cadastrar negócio">
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

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? "Salvando..." : "Salvar negócio"}
            </Button>
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
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
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
                    </div>

                    <span className="rounded-full bg-beauty-50 px-3 py-1 text-xs font-semibold text-beauty-700">
                      Ativo
                    </span>
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