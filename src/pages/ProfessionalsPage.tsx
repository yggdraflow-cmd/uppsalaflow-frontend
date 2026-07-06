import { FormEvent, useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { api } from "../services/api";
import type { Business } from "../types/business";
import type { Professional } from "../types/professional";

export function ProfessionalsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  const [editingProfessionalId, setEditingProfessionalId] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadBusinesses() {
      try {
        setError("");

        const response = await api.get<Business[]>("/businesses");

        setBusinesses(response.data);

        if (response.data.length > 0) {
          setSelectedBusinessId(response.data[0].id);
        }
      } catch {
        setError("Não foi possível carregar os negócios.");
      }
    }

    loadBusinesses();
  }, []);

  useEffect(() => {
    async function loadProfessionals() {
      if (!selectedBusinessId) {
        setProfessionals([]);
        return;
      }

      try {
        setError("");

        const response = await api.get<Professional[]>("/professionals", {
          params: {
            businessId: selectedBusinessId,
          },
        });

        setProfessionals(response.data);
      } catch {
        setError("Não foi possível carregar os profissionais.");
      }
    }

    loadProfessionals();
  }, [selectedBusinessId]);

  function resetForm() {
    setEditingProfessionalId("");
    setName("");
    setPhone("");
    setEmail("");
  }

  function handleEdit(professional: Professional) {
    setEditingProfessionalId(professional.id);
    setName(professional.name);
    setPhone(professional.phone || "");
    setEmail(professional.email || "");
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!selectedBusinessId) {
      setError("Cadastre um negócio antes de cadastrar profissionais.");
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
      };

      if (editingProfessionalId) {
        const response = await api.put<Professional>(
          `/professionals/${editingProfessionalId}`,
          payload
        );

        setProfessionals((currentProfessionals) =>
          currentProfessionals.map((professional) =>
            professional.id === editingProfessionalId
              ? response.data
              : professional
          )
        );

        setMessage("Profissional atualizado com sucesso.");
        resetForm();
        return;
      }

      const response = await api.post<Professional>("/professionals", {
        businessId: selectedBusinessId,
        ...payload,
      });

      setProfessionals((currentProfessionals) => [
        response.data,
        ...currentProfessionals,
      ]);

      setMessage("Profissional cadastrado com sucesso.");
      resetForm();
    } catch {
      setError("Não foi possível salvar o profissional.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(professionalId: string) {
    try {
      setMessage("");
      setError("");

      await api.delete(`/professionals/${professionalId}`);

      setProfessionals((currentProfessionals) =>
        currentProfessionals.filter(
          (professional) => professional.id !== professionalId
        )
      );

      if (editingProfessionalId === professionalId) {
        resetForm();
      }

      setMessage("Profissional removido com sucesso.");
    } catch {
      setError("Não foi possível remover o profissional.");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-[#171717]">Equipe</p>
        <h1 className="text-3xl font-bold text-zinc-950">Profissionais</h1>
        <p className="mt-2 text-zinc-600">
          Cadastre, edite e organize os profissionais que realizam os
          atendimentos do negócio.
        </p>
      </div>

      <div className="mb-6">
        <Card title="Negócio selecionado">
          {businesses.length === 0 ? (
            <p className="text-sm text-red-600">
              Nenhum negócio cadastrado. Cadastre um negócio primeiro.
            </p>
          ) : (
            <label className="block max-w-xl">
              <span className="mb-1 block text-sm font-medium text-zinc-700">
                Escolha o negócio
              </span>

              <select
                value={selectedBusinessId}
                onChange={(event) => {
                  setSelectedBusinessId(event.target.value);
                  resetForm();
                }}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#171717] focus:ring-2 focus:ring-[#dedede]"
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
        <Card
          title={
            editingProfessionalId
              ? "Editar profissional"
              : "Cadastrar profissional"
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Floki Anderson"
              required
            />

            <Input
              label="Telefone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Ex: (11) 98888-7777"
            />

            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="profissional@email.com"
            />

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving
                ? "Salvando..."
                : editingProfessionalId
                  ? "Salvar alterações"
                  : "Salvar profissional"}
            </Button>

            {editingProfessionalId && (
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

        <Card title="Profissionais cadastrados">
          {professionals.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Nenhum profissional cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {professionals.map((professional) => (
                <div
                  key={professional.id}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-zinc-950">
                          {professional.name}
                        </h2>

                        <span className="rounded-full bg-[#f3f3f3] px-3 py-1 text-xs font-semibold text-[#171717]">
                          {professional.active ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-zinc-500">
                        Telefone: {professional.phone || "Não informado"}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        E-mail: {professional.email || "Não informado"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleEdit(professional)}
                      >
                        Editar
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleDelete(professional.id)}
                      >
                        Remover
                      </Button>
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