import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Scissors,
  Sparkles,
  UserRound,
} from "lucide-react";

import { api } from "../services/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

type PublicService = {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  durationMinutes: number;
  category?: string | null;
  active: boolean;
};

type PublicProfessional = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  active: boolean;
};

type PublicBusiness = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  category?: string | null;
  slug: string;
  services: PublicService[];
  professionals: PublicProfessional[];
};

type BookingFormData = {
  serviceId: string;
  professionalId: string;
  date: string;
  startTime: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
};

const availableTimes = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

export function PublicBookingPage() {
  const { slug } = useParams();

  const [business, setBusiness] = useState<PublicBusiness | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState<BookingFormData>({
    serviceId: "",
    professionalId: "",
    date: getTodayDate(),
    startTime: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    notes: "",
  });

  const selectedService = useMemo(() => {
    if (!business) {
      return null;
    }

    return (
      business.services.find((service) => service.id === formData.serviceId) ??
      null
    );
  }, [business, formData.serviceId]);

  const selectedProfessional = useMemo(() => {
    if (!business) {
      return null;
    }

    return (
      business.professionals.find(
        (professional) => professional.id === formData.professionalId
      ) ?? null
    );
  }, [business, formData.professionalId]);

  useEffect(() => {
    async function loadPublicBusiness() {
      if (!slug) {
        setErrorMessage("Link de agendamento inválido.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<PublicBusiness>(
          `/public/businesses/${slug}`
        );

        setBusiness(response.data);

        setFormData((currentFormData) => ({
          ...currentFormData,
          serviceId: response.data.services[0]?.id ?? "",
          professionalId: response.data.professionals[0]?.id ?? "",
          startTime: availableTimes[0],
        }));
      } catch {
        setErrorMessage("Não foi possível carregar essa página de agendamento.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPublicBusiness();
  }, [slug]);

  function updateFormField(field: keyof BookingFormData, value: string) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!slug) {
      setErrorMessage("Link de agendamento inválido.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await api.post(`/public/businesses/${slug}/appointments`, {
        serviceId: formData.serviceId,
        professionalId: formData.professionalId,
        date: formData.date,
        startTime: formData.startTime,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail || undefined,
        notes: formData.notes || undefined,
      });

      setSuccessMessage(
        "Agendamento solicitado com sucesso. O negócio já recebeu sua solicitação."
      );

      setFormData((currentFormData) => ({
        ...currentFormData,
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        notes: "",
      }));
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ??
          "Não foi possível confirmar o agendamento."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#e8f0f3] px-4 py-8 text-[#132033]">
        <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center justify-center rounded-[36px] border border-white/80 bg-white/35 shadow-[0_30px_100px_rgba(55,73,89,0.14)] backdrop-blur-3xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#667789]">
            Carregando agendamento...
          </p>
        </section>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-[#e8f0f3] px-4 py-8 text-[#132033]">
        <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center justify-center rounded-[36px] border border-white/80 bg-white/35 p-8 text-center shadow-[0_30px_100px_rgba(55,73,89,0.14)] backdrop-blur-3xl">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-orange-500">
              Uppsalaflow
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-[#101828]">
              Página não encontrada
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#667789]">
              {errorMessage ||
                "O link usado não corresponde a nenhum negócio cadastrado."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#e8f0f3] px-4 py-8 text-[#132033]">
      <section className="mx-auto min-h-[calc(100vh-64px)] max-w-7xl overflow-hidden rounded-[38px] border border-white/80 bg-white/32 shadow-[0_30px_100px_rgba(55,73,89,0.16)] backdrop-blur-3xl">
        <header className="border-b border-white/70 px-6 py-6 md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-500">
                Uppsalaflow
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-[#101828] md:text-5xl">
                {business.name}
              </h1>

              <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-[#667789]">
                {business.category ? (
                  <span className="rounded-full border border-white/80 bg-white/45 px-4 py-2 backdrop-blur-xl">
                    {business.category}
                  </span>
                ) : null}

                {business.phone ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/45 px-4 py-2 backdrop-blur-xl">
                    <Phone size={15} />
                    {business.phone}
                  </span>
                ) : null}

                {business.address ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/45 px-4 py-2 backdrop-blur-xl">
                    <MapPin size={15} />
                    {business.address}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/80 bg-white/45 p-5 text-sm font-bold text-[#667789] shadow-sm backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <Sparkles className="text-orange-500" size={22} />
                <span>Escolha seu serviço e confirme seu horário.</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="space-y-6">
            <section className="upp-card rounded-[34px] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-500">
                    Serviços
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[#101828]">
                    Escolha o atendimento
                  </h2>
                </div>

                <Scissors className="text-[#506173]" size={26} />
              </div>

              {business.services.length === 0 ? (
                <p className="rounded-3xl border border-white/80 bg-white/45 p-5 text-sm font-bold text-[#667789]">
                  Nenhum serviço ativo no momento.
                </p>
              ) : (
                <div className="space-y-3">
                  {business.services.map((service) => {
                    const isSelected = formData.serviceId === service.id;

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => updateFormField("serviceId", service.id)}
                        className={[
                          "w-full rounded-[24px] border p-4 text-left transition-all duration-200",
                          isSelected
                            ? "border-[#121b35] bg-[#121b35] text-white shadow-[0_18px_45px_rgba(18,27,53,0.18)]"
                            : "border-white/80 bg-white/45 text-[#132033] hover:bg-white/70",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-base font-black">
                              {service.name}
                            </h3>

                            {service.description ? (
                              <p
                                className={[
                                  "mt-1 text-sm leading-6",
                                  isSelected
                                    ? "text-white/75"
                                    : "text-[#667789]",
                                ].join(" ")}
                              >
                                {service.description}
                              </p>
                            ) : null}
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-black">
                              {formatCurrency(service.price)}
                            </p>

                            <p
                              className={[
                                "mt-1 text-xs font-bold",
                                isSelected
                                  ? "text-white/70"
                                  : "text-[#8796a4]",
                              ].join(" ")}
                            >
                              {service.durationMinutes} min
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="upp-card rounded-[34px] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-500">
                    Profissional
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[#101828]">
                    Quem vai atender
                  </h2>
                </div>

                <UserRound className="text-[#506173]" size={26} />
              </div>

              {business.professionals.length === 0 ? (
                <p className="rounded-3xl border border-white/80 bg-white/45 p-5 text-sm font-bold text-[#667789]">
                  Nenhum profissional ativo no momento.
                </p>
              ) : (
                <div className="space-y-3">
                  {business.professionals.map((professional) => {
                    const isSelected =
                      formData.professionalId === professional.id;

                    return (
                      <button
                        key={professional.id}
                        type="button"
                        onClick={() =>
                          updateFormField("professionalId", professional.id)
                        }
                        className={[
                          "flex w-full items-center justify-between rounded-[24px] border p-4 text-left transition-all duration-200",
                          isSelected
                            ? "border-[#121b35] bg-[#121b35] text-white shadow-[0_18px_45px_rgba(18,27,53,0.18)]"
                            : "border-white/80 bg-white/45 text-[#132033] hover:bg-white/70",
                        ].join(" ")}
                      >
                        <span className="font-black">{professional.name}</span>

                        {isSelected ? <CheckCircle2 size={20} /> : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </aside>

          <form onSubmit={handleSubmit} className="upp-card rounded-[34px] p-6">
            <div className="mb-7 flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-500">
                  Agendamento
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight text-[#101828]">
                  Confirmar horário
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#667789]">
                  Informe seus dados para solicitar o atendimento. O horário
                  ficará visível no painel do negócio.
                </p>
              </div>

              <CalendarDays className="shrink-0 text-[#506173]" size={30} />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="upp-label">Data</span>

                <input
                  type="date"
                  className="upp-input"
                  value={formData.date}
                  onChange={(event) =>
                    updateFormField("date", event.target.value)
                  }
                  required
                />
              </label>

              <label className="block">
                <span className="upp-label">Horário</span>

                <select
                  className="upp-input"
                  value={formData.startTime}
                  onChange={(event) =>
                    updateFormField("startTime", event.target.value)
                  }
                  required
                >
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </label>

              <Input
                label="Seu nome"
                placeholder="Digite seu nome"
                value={formData.clientName}
                onChange={(event) =>
                  updateFormField("clientName", event.target.value)
                }
                required
              />

              <Input
                label="Telefone"
                placeholder="(11) 99999-9999"
                value={formData.clientPhone}
                onChange={(event) =>
                  updateFormField("clientPhone", event.target.value)
                }
                required
              />

              <Input
                label="E-mail"
                type="email"
                placeholder="voce@email.com"
                value={formData.clientEmail}
                onChange={(event) =>
                  updateFormField("clientEmail", event.target.value)
                }
              />

              <label className="block">
                <span className="upp-label">Observações</span>

                <input
                  className="upp-input"
                  placeholder="Ex: preferência, aviso ou detalhe"
                  value={formData.notes}
                  onChange={(event) =>
                    updateFormField("notes", event.target.value)
                  }
                />
              </label>
            </div>

            <div className="mt-7 rounded-[28px] border border-white/80 bg-white/45 p-5 backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-500">
                Resumo
              </p>

              <div className="mt-4 grid gap-3 text-sm font-bold text-[#506173]">
                <div className="flex items-center justify-between gap-4">
                  <span>Serviço</span>
                  <strong className="text-right text-[#132033]">
                    {selectedService?.name ?? "Selecione"}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Profissional</span>
                  <strong className="text-right text-[#132033]">
                    {selectedProfessional?.name ?? "Selecione"}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Valor</span>
                  <strong className="text-right text-[#132033]">
                    {selectedService
                      ? formatCurrency(selectedService.price)
                      : "R$ 0,00"}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Duração</span>
                  <strong className="text-right text-[#132033]">
                    {selectedService
                      ? `${selectedService.durationMinutes} min`
                      : "-"}
                  </strong>
                </div>
              </div>
            </div>

            {errorMessage ? (
              <p className="mt-5 rounded-3xl border border-red-200 bg-red-50/80 px-5 py-4 text-sm font-bold text-red-700">
                {errorMessage}
              </p>
            ) : null}

            {successMessage ? (
              <p className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-sm font-bold text-emerald-700">
                {successMessage}
              </p>
            ) : null}

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#667789]">
                <Clock size={18} className="text-orange-500" />
                <span>Confirmação rápida pelo Uppsalaflow.</span>
              </div>

              <Button
                type="submit"
                disabled={
                  isSaving ||
                  !formData.serviceId ||
                  !formData.professionalId ||
                  !formData.date ||
                  !formData.startTime
                }
                className="w-full sm:w-auto"
              >
                {isSaving ? "Confirmando..." : "Confirmar agendamento"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}