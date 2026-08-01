import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
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

type OnboardingStep = "segment" | "specialty" | "details";

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
  const [step, setStep] = useState<OnboardingStep>("segment");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedSegment, setSelectedSegment] =
    useState<BusinessSegment | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] =
    useState<BusinessSpecialty | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [businessSlug, setBusinessSlug] = useState("");
  const [phone, setPhone] = useState("");

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
    setSelectedSpecialty(null);
    setError("");

    if (segment === "BEAUTY") {
      setStep("specialty");
      return;
    }

    setStep("details");
  }

  function chooseSpecialty(specialty: BusinessSpecialty) {
    setSelectedSpecialty(specialty);
    setError("");
    setStep("details");
  }

  async function saveExistingBusinessSegment() {
    if (!targetBusiness || !selectedSegment) {
      return null;
    }

    if (selectedSegment === "BEAUTY" && !selectedSpecialty) {
      setError("Escolha uma área de estética.");
      return null;
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
      window.location.href = `/business-plans?businessId=${business.id}`;
    } catch {
      setError(
        "Não foi possível concluir a configuração. Verifique o slug e tente novamente."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function goBack() {
    setError("");

    if (step === "specialty") {
      setStep("segment");
      setSelectedSegment(null);
      setSelectedSpecialty(null);
      return;
    }

    if (step === "details") {
      if (selectedSegment === "BEAUTY") {
        setStep("specialty");
        setSelectedSpecialty(null);
        return;
      }

      setStep("segment");
      setSelectedSegment(null);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eeeeee] px-6 text-[#171717]">
        <div className="rounded-[30px] bg-white px-8 py-6 text-sm font-black shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
          Preparando configuração inicial...
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-6 py-8 text-[#171717]"
      style={{
        background:
          "radial-gradient(circle at 15% 10%, rgba(255,255,255,0.96), transparent 28%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.72), transparent 28%), linear-gradient(135deg, #d7d7d7 0%, #eeeeee 48%, #cfd4d6 100%)",
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1280px] flex-col rounded-[42px] border border-white/80 bg-white/30 p-6 shadow-[0_34px_110px_rgba(0,0,0,0.16)] backdrop-blur-3xl md:p-10">
        <header className="mb-10 flex items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171717] text-white shadow-[0_18px_42px_rgba(0,0,0,0.24)]">
              <Sparkles size={26} />
            </div>

            <div>
              <strong className="block text-2xl font-black tracking-tight">
                YggdraFlow
              </strong>
              <span className="text-sm font-bold text-[#666]">
                Configuração inicial do seu negócio
              </span>
            </div>
          </div>

          <div className="hidden rounded-full bg-white/80 px-4 py-2 text-xs font-black text-[#171717] shadow-[0_12px_34px_rgba(0,0,0,0.08)] md:block">
            Etapa{" "}
            {step === "segment" ? "1 de 4" : step === "specialty" ? "2 de 4" : "3 de 4"}
          </div>
        </header>

        <section className="grid flex-1 gap-8 lg:grid-cols-[0.9fr_1.4fr] lg:items-center">
          <aside className="rounded-[34px] bg-[#171717] p-7 text-white shadow-[0_28px_90px_rgba(0,0,0,0.22)]">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-white/50">
              Primeiro acesso
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
              Vamos adaptar o sistema ao seu ramo.
            </h1>

            <p className="mt-5 text-base font-medium leading-7 text-white/70">
              Antes de abrir o painel, escolha o tipo de negócio. Depois disso,
              o sistema ajusta marca, textos e experiência para a sua área.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm font-black">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#171717]">
                  {step !== "segment" ? <Check size={16} /> : "1"}
                </span>
                Escolher ramo
              </div>

              <div className="flex items-center gap-3 text-sm font-black">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#171717]">
                  {step === "details" ? <Check size={16} /> : "2"}
                </span>
                Ajustar especialidade
              </div>

              <div className="flex items-center gap-3 text-sm font-black">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#171717]">
                  3
                </span>
                Cadastrar dados iniciais
              </div>
            </div>

            {selectedSegment && (
              <div className="mt-10 rounded-[26px] bg-white/10 p-5 ring-1 ring-white/10">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
                  Marca selecionada
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  {selectedTheme.brandName}
                </h2>
                <p className="mt-1 text-sm font-medium text-white/62">
                  {selectedTheme.subtitle}
                </p>
              </div>
            )}
          </aside>

          <form onSubmit={handleSubmit} className="min-w-0">
            {step !== "segment" && (
              <button
                type="button"
                onClick={goBack}
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/82 px-4 py-2 text-sm font-black text-[#171717] shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition hover:bg-white"
              >
                <ArrowLeft size={17} />
                Voltar
              </button>
            )}

            {step === "segment" && (
              <div>
                <p className="text-sm font-black text-[#171717]">
                  Etapa 1
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  Qual é o ramo do seu negócio?
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-medium text-[#666]">
                  Clique em uma opção para continuar. O painel ainda não será
                  aberto enquanto essa configuração não terminar.
                </p>

                <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {segmentOptions.map((option) => {
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.segment}
                        type="button"
                        disabled={isSaving}
                        onClick={() => chooseSegment(option.segment)}
                        className="group rounded-[30px] border border-white/85 bg-white/88 p-5 text-left shadow-[0_20px_70px_rgba(0,0,0,0.09)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_28px_90px_rgba(0,0,0,0.14)]"
                      >
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171717] text-white">
                          <Icon size={24} />
                        </div>

                        <h3 className="text-lg font-black">
                          {option.title}
                        </h3>

                        <p className="mt-2 min-h-[48px] text-sm font-medium leading-6 text-[#666]">
                          {option.description}
                        </p>

                        <span className="mt-5 inline-flex rounded-full bg-[#f2f2f2] px-3 py-1 text-xs font-black text-[#171717]">
                          {option.brandName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === "specialty" && (
              <div>
                <p className="text-sm font-black text-[#171717]">
                  Etapa 2
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  Qual área de estética você atende?
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-medium text-[#666]">
                  Escolha uma área principal. Se o negócio atende várias áreas,
                  use estética completa. Sim, até o sistema precisa entender que
                  cílios e unha não são o mesmo planeta.
                </p>

                <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {beautySpecialtyOptions.map((option) => (
                    <button
                      key={option.specialty}
                      type="button"
                      disabled={isSaving}
                      onClick={() => chooseSpecialty(option.specialty)}
                      className="rounded-[30px] border border-white/85 bg-white/88 p-5 text-left shadow-[0_20px_70px_rgba(0,0,0,0.09)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_28px_90px_rgba(0,0,0,0.14)]"
                    >
                      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171717] text-white">
                        <WandSparkles size={24} />
                      </div>

                      <h3 className="text-lg font-black">
                        {option.title}
                      </h3>

                      <p className="mt-2 min-h-[48px] text-sm font-medium leading-6 text-[#666]">
                        {option.description}
                      </p>

                      <span className="mt-5 inline-flex rounded-full bg-[#f2f2f2] px-3 py-1 text-xs font-black text-[#171717]">
                        {option.brandName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === "details" && (
              <div>
                <p className="text-sm font-black text-[#171717]">
                  Etapa 3
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  {hasBusiness
                    ? "Confirmar configuração do negócio"
                    : "Dados iniciais do negócio"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-medium text-[#666]">
                  {hasBusiness
                    ? "Vamos salvar o ramo escolhido no negócio já cadastrado."
                    : "Preencha os dados agora. Na próxima etapa você escolherá o plano."}
                </p>

                <div className="mt-7 rounded-[34px] border border-white/85 bg-white/88 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.10)]">
                  <div className="mb-6 rounded-[26px] bg-[#171717] p-5 text-white">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
                      Experiência escolhida
                    </p>
                    <h3 className="mt-2 text-2xl font-black">
                      {selectedTheme.brandName}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-white/65">
                      {selectedTheme.subtitle}
                    </p>
                  </div>

                  {hasBusiness ? (
                    <div className="rounded-[24px] bg-[#f6f6f6] p-5">
                      <p className="text-sm font-black text-[#171717]">
                        Negócio encontrado
                      </p>
                      <p className="mt-2 text-lg font-black text-[#171717]">
                        {targetBusiness?.name}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#666]">
                        O ramo será salvo nesse negócio.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <Input
                        label="Nome do negócio"
                        value={businessName}
                        onChange={(event) =>
                          handleBusinessNameChange(event.target.value)
                        }
                        placeholder="Ex: Clínica Vet Aurora"
                        required
                      />

                      <Input
                        label="Slug público"
                        value={businessSlug}
                        onChange={(event) =>
                          setBusinessSlug(makeSlug(event.target.value))
                        }
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
                  )}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="mt-6 w-full rounded-full bg-[#171717] px-6 py-4 text-sm font-black text-white shadow-[0_18px_48px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? "Salvando..." : "Continuar para os planos"}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 ring-1 ring-red-100">
                {error}
              </p>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
