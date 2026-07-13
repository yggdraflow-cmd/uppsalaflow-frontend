import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Brush,
  Building2,
  HeartPulse,
  Leaf,
  Scissors,
  Sparkles,
  Stethoscope,
  WandSparkles,
} from "lucide-react";

import { Input } from "../components/Input";
import { api } from "../services/api";
import type {
  Business,
  BusinessSegment,
  BusinessSpecialty,
} from "../types/business";
import { getBusinessTheme } from "../utils/businessTheme";

type SegmentOption = {
  segment: BusinessSegment;
  title: string;
  description: string;
  brandName: string;
  icon: typeof Scissors;
};

type SpecialtyOption = {
  specialty: BusinessSpecialty;
  title: string;
  description: string;
  brandName: string;
};

const segmentOptions: SegmentOption[] = [
  {
    segment: "BARBERSHOP",
    title: "Barbearia",
    description: "Agenda, clientes, serviços e profissionais para barbearias.",
    brandName: "YggdraBarber",
    icon: Scissors,
  },
  {
    segment: "BEAUTY",
    title: "Estética feminina",
    description: "Cabelo, unhas, cílios, maquiagem e estética completa.",
    brandName: "YggdraBeauty",
    icon: Sparkles,
  },
  {
    segment: "ODONTOLOGY",
    title: "Odonto",
    description: "Organização para consultórios e clínicas odontológicas.",
    brandName: "YggdraOdonto",
    icon: Stethoscope,
  },
  {
    segment: "VETERINARY",
    title: "Veterinária",
    description: "Agenda e gestão para clínicas veterinárias e pet care.",
    brandName: "YggdraVet",
    icon: HeartPulse,
  },
  {
    segment: "WELLNESS",
    title: "Bem-estar",
    description: "Massoterapia, terapias, studios e atendimentos especializados.",
    brandName: "YggdraWell",
    icon: Leaf,
  },
  {
    segment: "OTHER",
    title: "Outro ramo",
    description: "Use a base geral do YggdraFlow para o seu negócio.",
    brandName: "YggdraFlow",
    icon: Building2,
  },
];

const beautySpecialtyOptions: SpecialtyOption[] = [
  {
    specialty: "BEAUTY_GENERAL",
    title: "Estética completa",
    description: "Abrange cabelo, unhas, cílios, maquiagem e outros serviços.",
    brandName: "YggdraBeauty",
  },
  {
    specialty: "HAIR",
    title: "Cabelo",
    description: "Cortes, escovas, tintura, tratamento e finalização.",
    brandName: "YggdraHair",
  },
  {
    specialty: "NAILS",
    title: "Unhas",
    description: "Manicure, pedicure, alongamento e nail design.",
    brandName: "YggdraNails",
  },
  {
    specialty: "LASHES",
    title: "Cílios",
    description: "Extensão, manutenção, lash lifting e design do olhar.",
    brandName: "YggdraLashes",
  },
  {
    specialty: "MAKEUP",
    title: "Maquiagem",
    description: "Maquiagem social, eventos, noivas e produção.",
    brandName: "YggdraMakeup",
  },
  {
    specialty: "SKINCARE",
    title: "Estética facial",
    description: "Limpeza de pele, tratamentos faciais e procedimentos estéticos.",
    brandName: "YggdraSkin",
  },
  {
    specialty: "EYEBROWS",
    title: "Sobrancelhas",
    description: "Design, henna, brow lamination e manutenção.",
    brandName: "YggdraBrows",
  },
];

function makeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

export function BusinessOnboardingPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedSegment, setSelectedSegment] =
    useState<BusinessSegment | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] =
    useState<BusinessSpecialty | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [businessSlug, setBusinessSlug] = useState("");
  const [phone, setPhone] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const targetBusiness = useMemo(() => {
    return businesses.find((business) => !business.segment) || null;
  }, [businesses]);

  const hasBusiness = businesses.length > 0;
  const selectedTheme = getBusinessTheme(selectedSegment, selectedSpecialty);

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

  function handleBusinessNameChange(value: string) {
    setBusinessName(value);

    if (!businessSlug) {
      setBusinessSlug(makeSlug(value));
    }
  }

  function chooseSegment(segment: BusinessSegment) {
    setSelectedSegment(segment);
    setMessage("");
    setError("");

    if (segment !== "BEAUTY") {
      setSelectedSpecialty(null);
    }

    if (segment === "BEAUTY") {
      setSelectedSpecialty("BEAUTY_GENERAL");
    }
  }

  async function saveExistingBusinessSegment() {
    if (!targetBusiness || !selectedSegment) {
      return;
    }

    if (selectedSegment === "BEAUTY" && !selectedSpecialty) {
      setError("Escolha uma área de estética.");
      return;
    }

    const response = await api.patch<Business>(
      `/businesses/${targetBusiness.id}/segment`,
      {
        segment: selectedSegment,
        specialty: selectedSegment === "BEAUTY" ? selectedSpecialty : null,
      }
    );

    return response.data;
  }

  async function createFirstBusiness() {
    if (!selectedSegment) {
      setError("Escolha o ramo do negócio.");
      return null;
    }

    if (selectedSegment === "BEAUTY" && !selectedSpecialty) {
      setError("Escolha uma área de estética.");
      return null;
    }

    if (!businessName.trim()) {
      setError("Informe o nome do negócio.");
      return null;
    }

    if (!businessSlug.trim()) {
      setError("Informe o slug público.");
      return null;
    }

    const response = await api.post<Business>("/businesses", {
      name: businessName.trim(),
      slug: makeSlug(businessSlug),
      phone: phone.trim() || undefined,
      category: selectedTheme.segmentLabel,
      segment: selectedSegment,
      specialty: selectedSegment === "BEAUTY" ? selectedSpecialty : null,
    });

    return response.data;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setMessage("");
      setError("");

      const business = hasBusiness
        ? await saveExistingBusinessSegment()
        : await createFirstBusiness();

      if (!business) {
        return;
      }

      const theme = getBusinessTheme(business.segment, business.specialty);

      localStorage.setItem(
        "@yggdraflow:business-theme",
        JSON.stringify({
          segment: business.segment,
          specialty: business.specialty,
          brandName: theme.brandName,
        })
      );

      window.dispatchEvent(new Event("yggdraflow:theme-updated"));

      setMessage(`Ramo configurado como ${theme.segmentLabel}.`);

      window.location.href = "/dashboard";
    } catch {
      setError(
        "Não foi possível concluir a configuração. Verifique o slug e tente novamente."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-[28px] bg-white/90 px-8 py-6 text-sm font-black text-[#171717] shadow-[0_20px_60px_rgba(0,0,0,0.10)]">
          Carregando configuração inicial...
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <p className="text-sm font-black text-[#171717]">Primeiro acesso</p>
        <h1 className="text-3xl font-black tracking-tight text-[#171717]">
          Qual é o ramo do seu negócio?
        </h1>
        <p className="mt-2 max-w-3xl text-sm font-medium text-[#666]">
          Escolha o tipo de negócio para adaptar marca, textos e experiência do
          painel. O sistema continua sendo o YggdraFlow, mas a vitrine muda para
          o seu ramo.
        </p>

        {targetBusiness && (
          <div className="mt-4 inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-black text-[#171717] shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
            Negócio: {targetBusiness.name}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {segmentOptions.map((option) => {
          const Icon = option.icon;
          const isActive = selectedSegment === option.segment;

          return (
            <button
              key={option.segment}
              type="button"
              disabled={isSaving}
              onClick={() => chooseSegment(option.segment)}
              className={[
                "group rounded-[28px] border p-5 text-left shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition",
                isActive
                  ? "border-[#171717] bg-[#171717] text-white"
                  : "border-white/80 bg-white/86 text-[#171717] hover:-translate-y-1 hover:bg-white",
              ].join(" ")}
            >
              <div
                className={[
                  "mb-5 flex h-13 w-13 items-center justify-center rounded-2xl",
                  isActive ? "bg-white text-[#171717]" : "bg-[#171717] text-white",
                ].join(" ")}
              >
                <Icon size={24} />
              </div>

              <h2 className="text-lg font-black">{option.title}</h2>

              <p
                className={[
                  "mt-2 text-sm font-medium",
                  isActive ? "text-white/78" : "text-[#666]",
                ].join(" ")}
              >
                {option.description}
              </p>

              <div
                className={[
                  "mt-5 inline-flex rounded-full px-3 py-1 text-xs font-black",
                  isActive
                    ? "bg-white text-[#171717]"
                    : "bg-[#f2f2f2] text-[#171717]",
                ].join(" ")}
              >
                {option.brandName}
              </div>
            </button>
          );
        })}
      </div>

      {selectedSegment === "BEAUTY" && (
        <div className="mt-8 rounded-[32px] border border-white/80 bg-white/60 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#171717] text-white">
              <Brush size={22} />
            </div>

            <div>
              <h2 className="text-xl font-black text-[#171717]">
                Escolha a área de estética
              </h2>
              <p className="text-sm font-medium text-[#666]">
                Se atende várias áreas, escolha estética completa.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {beautySpecialtyOptions.map((option) => {
              const isActive = selectedSpecialty === option.specialty;

              return (
                <button
                  key={option.specialty}
                  type="button"
                  disabled={isSaving}
                  onClick={() => setSelectedSpecialty(option.specialty)}
                  className={[
                    "rounded-[24px] border p-4 text-left transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)]",
                    isActive
                      ? "border-[#171717] bg-[#171717] text-white"
                      : "border-zinc-200 bg-white text-[#171717] hover:border-[#171717]",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "mb-4 flex h-10 w-10 items-center justify-center rounded-2xl",
                      isActive
                        ? "bg-white text-[#171717]"
                        : "bg-[#f2f2f2] text-[#171717]",
                    ].join(" ")}
                  >
                    <WandSparkles size={20} />
                  </div>

                  <h3 className="font-black">{option.title}</h3>

                  <p
                    className={[
                      "mt-2 text-sm font-medium",
                      isActive ? "text-white/75" : "text-[#666]",
                    ].join(" ")}
                  >
                    {option.description}
                  </p>

                  <span
                    className={[
                      "mt-4 inline-flex rounded-full px-3 py-1 text-xs font-black",
                      isActive
                        ? "bg-white text-[#171717]"
                        : "bg-[#171717] text-white",
                    ].join(" ")}
                  >
                    {option.brandName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!hasBusiness && (
        <div className="mt-8 rounded-[32px] border border-white/80 bg-white/86 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
          <div className="mb-5">
            <h2 className="text-xl font-black text-[#171717]">
              Dados iniciais do negócio
            </h2>
            <p className="mt-1 text-sm font-medium text-[#666]">
              Depois você pode completar endereço, e-mail, serviços e
              profissionais na área Negócio.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Input
              label="Nome do negócio"
              value={businessName}
              onChange={(event) => handleBusinessNameChange(event.target.value)}
              placeholder="Ex: Clínica Vet Aurora"
              required
            />

            <Input
              label="Slug público"
              value={businessSlug}
              onChange={(event) => setBusinessSlug(makeSlug(event.target.value))}
              placeholder="clinica-vet-aurora"
              required
            />

            <Input
              label="Telefone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black text-[#171717]">
            Marca selecionada: {selectedTheme.brandName}
          </p>
          <p className="mt-1 text-sm font-medium text-[#666]">
            {selectedTheme.subtitle}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving || !selectedSegment}
          className="rounded-full bg-[#171717] px-6 py-3 text-sm font-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Salvando..." : "Continuar para o painel"}
        </button>
      </div>

      {message && <p className="mt-5 text-sm font-black text-green-700">{message}</p>}
      {error && <p className="mt-5 text-sm font-black text-red-600">{error}</p>}
    </form>
  );
}
