import { FormEvent, useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { api } from "../services/api";
import type { Business } from "../types/business";
import type { Client } from "../types/client";

export function ClientsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [clients, setClients] = useState<Client[]>([]);

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
        setError("Não foi possível carregar os clientes.");
      } finally {
        setIsLoadingClients(false);
      }
    }

    loadClients();
  }, [selectedBusinessId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!selectedBusinessId) {
      setError("Cadastre um negócio antes de cadastrar clientes.");
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");
      setError("");

      const response = await api.post<Client>("/clients", {
        businessId: selectedBusinessId,
        name,
        phone: phone || undefined,
        email: email || undefined,
        birthDate: birthDate ? new Date(birthDate).toISOString() : undefined,
        notes: notes || undefined,
      });

      setClients((currentClients) => [response.data, ...currentClients]);

      setMessage("Cliente cadastrado com sucesso.");
      setName("");
      setPhone("");
      setEmail("");
      setBirthDate("");
      setNotes("");
    } catch {
      setError("Não foi possível cadastrar o cliente.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(clientId: string) {
    try {
      setMessage("");
      setError("");

      await api.delete(`/clients/${clientId}`);

      setClients((currentClients) =>
        currentClients.filter((client) => client.id !== clientId)
      );

      setMessage("Cliente removido com sucesso.");
    } catch {
      setError("Não foi possível remover o cliente.");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-beauty-700">Cadastro</p>
        <h1 className="text-3xl font-bold text-zinc-950">Clientes</h1>
        <p className="mt-2 text-zinc-600">
          Cadastre e acompanhe os clientes do negócio selecionado.
        </p>
      </div>

      <div className="mb-6">
        <Card title="Negócio selecionado">
          {isLoadingBusinesses ? (
            <p className="text-sm text-zinc-500">Carregando negócios...</p>
          ) : businesses.length === 0 ? (
            <p className="text-sm text-red-600">
              Cadastre um negócio antes de cadastrar clientes.
            </p>
          ) : (
            <label className="block max-w-xl">
              <span className="mb-1 block text-sm font-medium text-zinc-700">
                Escolha o negócio
              </span>

              <select
                value={selectedBusinessId}
                onChange={(event) => setSelectedBusinessId(event.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-beauty-500 focus:ring-2 focus:ring-beauty-100"
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
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card title="Cadastrar cliente">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Ana Souza"
              required
            />

            <Input
              label="Telefone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Ex: (11) 99999-9999"
            />

            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="cliente@email.com"
            />

            <Input
              label="Data de nascimento"
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">
                Observações
              </span>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Preferências, alergias, histórico ou observações gerais..."
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-beauty-500 focus:ring-2 focus:ring-beauty-100"
              />
            </label>

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? "Salvando..." : "Salvar cliente"}
            </Button>
          </form>

          {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </Card>

        <Card title="Clientes cadastrados">
          {isLoadingClients ? (
            <p className="text-sm text-zinc-500">Carregando clientes...</p>
          ) : clients.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Nenhum cliente cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-950">
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
                          {new Date(client.birthDate).toLocaleDateString("pt-BR")}
                        </p>
                      )}

                      {client.notes && (
                        <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-zinc-600 ring-1 ring-zinc-200">
                          {client.notes}
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleDelete(client.id)}
                    >
                      Remover
                    </Button>
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