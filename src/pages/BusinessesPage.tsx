import { FormEvent, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { api } from "../services/api";

export function BusinessesPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    await api.post("/businesses", {
      name,
      slug,
      category,
    });

    setMessage("Negócio cadastrado com sucesso.");
    setName("");
    setSlug("");
    setCategory("");
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

      <Card title="Cadastrar negócio">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nome do negócio"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <Input
            label="Slug público"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="studio-bela-flor"
            required
          />

          <Input
            label="Categoria"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Salão, barbearia, estética..."
          />

          <div className="flex items-end">
            <Button type="submit">Salvar negócio</Button>
          </div>
        </form>

        {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
      </Card>
    </div>
  );
}
