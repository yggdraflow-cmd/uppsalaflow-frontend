import { FormEvent, useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { api } from "../services/api";
import type { Business } from "../types/business";
import type { BeautyService } from "../types/service";

export function ServicesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [services, setServices] = useState<BeautyService[]>([]);

  const [editingServiceId, setEditingServiceId] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

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
    async function loadServices() {
      if (!selectedBusinessId) {
        setServices([]);
        return;
      }

      try {
        setError("");

        const response = await api.get<BeautyService[]>("/services", {
          params: {
            businessId: selectedBusinessId,
          },
        });

        setServices(response.data);
      } catch {
        setError("Não foi possível carregar os serviços.");
      }
    }

    loadServices();
  }, [selectedBusinessId]);

  function resetForm() {
    setEditingServiceId("");
    setName("");
    setPrice("");
    setDurationMinutes("");
    setCategory("");
    setDescription("");
  }

  function handleEdit(service: BeautyService) {
    setEditingServiceId(service.id);
    setName(service.name);
    setPrice(String(service.price));
    setDurationMinutes(String(service.durationMinutes));
    setCategory(service.category || "");
    setDescription(service.description || "");
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!selectedBusinessId) {
      setError("Cadastre um negócio antes de cadastrar serviços.");
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");
      setError("");

      const payload = {
        name,
        price: Number(price),
        durationMinutes: Number(durationMinutes),
        category: category || undefined,
        description: description || undefined,
      };

      if (editingServiceId) {
        const response = await api.put<BeautyService>(
          `/services/${editingServiceId}`,
          payload
        );

        setServices((currentServices) =>
          currentServices.map((service) =>
            service.id === editingServiceId ? response.data : service
          )
        );

        setMessage("Serviço atualizado com sucesso.");
        resetForm();
        return;
      }

      const response = await api.post<BeautyService>("/services", {
        businessId: selectedBusinessId,
        ...payload,
      });

      setServices((currentServices) => [response.data, ...currentServices]);

      setMessage("Serviço cadastrado com sucesso.");
      resetForm();
    } catch {
      setError("Não foi possível salvar o serviço.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(serviceId: string) {
    try {
      setMessage("");
      setError("");

      await api.delete(`/services/${serviceId}`);

      setServices((currentServices) =>
        currentServices.filter((service) => service.id !== serviceId)
      );

      if (editingServiceId === serviceId) {
        resetForm();
      }

      setMessage("Serviço removido com sucesso.");
    } catch {
      setError("Não foi possível remover o serviço.");
    }
  }

  function formatCurrency(value: string | number) {
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-beauty-700">Cadastro</p>
        <h1 className="text-3xl font-bold text-zinc-950">Serviços</h1>
        <p className="mt-2 text-zinc-600">
          Cadastre, edite e organize os serviços oferecidos pelo negócio.
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
        <Card title={editingServiceId ? "Editar serviço" : "Cadastrar serviço"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome do serviço"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Corte masculino"
              required
            />

            <Input
              label="Preço"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Ex: 45"
              required
            />

            <Input
              label="Duração em minutos"
              type="number"
              min="1"
              step="1"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              placeholder="Ex: 40"
              required
            />

            <Input
              label="Categoria"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Ex: Cabelo, barba, unha..."
            />

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">
                Descrição
              </span>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                placeholder="Detalhes do serviço..."
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-beauty-500 focus:ring-2 focus:ring-beauty-100"
              />
            </label>

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving
                ? "Salvando..."
                : editingServiceId
                  ? "Salvar alterações"
                  : "Salvar serviço"}
            </Button>

            {editingServiceId && (
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

        <Card title="Serviços cadastrados">
          {services.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Nenhum serviço cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-zinc-950">
                          {service.name}
                        </h2>

                        <span className="rounded-full bg-beauty-50 px-3 py-1 text-xs font-semibold text-beauty-700">
                          {service.active ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-zinc-500">
                        Preço:{" "}
                        <span className="font-medium text-zinc-900">
                          {formatCurrency(service.price)}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Duração: {service.durationMinutes} minutos
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Categoria: {service.category || "Não informada"}
                      </p>

                      {service.description && (
                        <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-zinc-600 ring-1 ring-zinc-200">
                          {service.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleEdit(service)}
                      >
                        Editar
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleDelete(service.id)}
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