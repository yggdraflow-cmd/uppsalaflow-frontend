import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
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
    description:
      "Agenda, clientes, serviços e profissionais para barbearias.",
    brandName: "YggdraBarber",
    icon: Scissors,
  },
  {
    segment: "BEAUTY",
    title: "Estética feminina",
    description:
      "Cabelo, unhas, cílios, maquiagem e estética completa.",
    brandName: "YggdraBeauty",
    icon: Sparkles,
  },
  {
    segment: "ODONTOLOGY",
    title: "Odonto",
    description:
      "Organização para consultórios e clínicas odontológicas.",
    brandName: "YggdraOdonto",
    icon: Stethoscope,
  },
  {
    segment: "VETERINARY",
    title: "Veterinária",
    description:
      "Agenda e gestão para clínicas veterinárias e pet care.",
    brandName: "YggdraVet",
    icon: HeartPulse,
  },
  {
    segment: "WELLNESS",
    title: "Bem-estar",
    description:
      "Massoterapia, terapias, studios e atendimentos especializados.",
    brandName: "YggdraWell",
    icon: Leaf,
  },
  {
    segment: "OTHER",
    title: "Outro ramo",
    description:
      "Use a base geral do YggdraFlow para o seu negócio.",
    brandName: "YggdraFlow",
    icon: Building2,
  },
];

const beautySpecialtyOptions: SpecialtyOption[] = [
  {
    specialty: "BEAUTY_GENERAL",
    title: "Estética completa",
    description:
      "Abrange cabelo, unhas, cílios, maquiagem e outros serviços.",
    brandName: "YggdraBeauty",
  },
  {
    specialty: "HAIR",
    title: "Cabelo",
    description:
      "Cortes, escovas, tintura, tratamento e finalização.",
    brandName: "YggdraHair",
  },
  {
    specialty: "NAILS",
    title: "Unhas",
    description:
      "Manicure, pedicure, alongamento e nail design.",
    brandName: "YggdraNails",
  },
  {
    specialty: "LASHES",
    title: "Cílios",
    description:
      "Extensão, manutenção, lash lifting e design do olhar.",
    brandName: "YggdraLashes",
  },
  {
    specialty: "MAKEUP",
    title: "Maquiagem",
    description:
      "Maquiagem social, eventos, noivas e produção.",
    brandName: "YggdraMakeup",
  },
  {
    specialty: "SKINCARE",
    title: "Estética facial",
    description:
      "Limpeza de pele, tratamentos faciais e procedimentos estéticos.",
    brandName: "YggdraSkin",
  },
  {
    specialty: "EYEBROWS",
    title: "Sobrancelhas",
    description:
      "Design, henna, brow lamination e manutenção.",
    brandName: "YggdraBrows",
  },
];



export function BusinessOnboardingPage() {
  const [step, setStep] =
    useState<OnboardingStep>("segment");

  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [selectedSegment, setSelectedSegment] =
    useState<BusinessSegment | null>(null);

  const [selectedSpecialty, setSelectedSpecialty] =
    useState<BusinessSpecialty | null>(null);

  const [businessName, setBusinessName] =
    useState("");



  const [phone, setPhone] =
    useState("");

  const [error, setError] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const targetBusiness = useMemo(() => {
    return (
      businesses.find(
        (business) => !business.segment
      ) || null
    );
  }, [businesses]);

  const hasBusiness =
    businesses.length > 0;

  const selectedTheme =
    getBusinessTheme(
      selectedSegment,
      selectedSpecialty
    );

  const stepNumber =
    step === "segment"
      ? 1
      : step === "specialty"
        ? 2
        : 3;

  useEffect(() => {
    async function loadBusinesses() {
      try {
        setIsLoading(true);
        setError("");

        const response =
          await api.get<Business[]>(
            "/businesses"
          );

        setBusinesses(response.data);
      } catch {
        setError(
          "Não foi possível carregar os negócios cadastrados."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadBusinesses();
  }, []);

function handleBusinessNameChange(
  value: string
) {
  setBusinessName(value);
}

  function chooseSegment(
    segment: BusinessSegment
  ) {
    setSelectedSegment(segment);
    setSelectedSpecialty(null);
    setError("");

    if (segment === "BEAUTY") {
      setStep("specialty");
      return;
    }

    setStep("details");
  }

  function chooseSpecialty(
    specialty: BusinessSpecialty
  ) {
    setSelectedSpecialty(specialty);
    setError("");
    setStep("details");
  }

  async function saveExistingBusinessSegment() {
    if (
      !targetBusiness ||
      !selectedSegment
    ) {
      return null;
    }

    if (
      selectedSegment === "BEAUTY" &&
      !selectedSpecialty
    ) {
      setError(
        "Escolha uma área de estética."
      );
      return null;
    }

    const response =
      await api.patch<Business>(
        `/businesses/${targetBusiness.id}/segment`,
        {
          segment: selectedSegment,
          specialty:
            selectedSegment === "BEAUTY"
              ? selectedSpecialty
              : null,
        }
      );

    return response.data;
  }

  async function createFirstBusiness() {
    if (!selectedSegment) {
      setError(
        "Escolha o ramo do negócio."
      );
      return null;
    }

    if (
      selectedSegment === "BEAUTY" &&
      !selectedSpecialty
    ) {
      setError(
        "Escolha uma área de estética."
      );
      return null;
    }

    if (!businessName.trim()) {
      setError(
        "Informe o nome do negócio."
      );
      return null;
    }


    const response =
      await api.post<Business>(
        "/businesses",

         {
  name: businessName.trim(),
  phone:
    phone.trim() ||
    undefined,
          category:
            selectedTheme.segmentLabel,
          segment: selectedSegment,
          specialty:
            selectedSegment === "BEAUTY"
              ? selectedSpecialty
              : null,
        }
      );

    return response.data;
  }

  async function handleSubmit(
    event: FormEvent
  ) {
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

      const theme =
        getBusinessTheme(
          business.segment,
          business.specialty
        );

      localStorage.setItem(
        "@yggdraflow:business-theme",
        JSON.stringify({
          segment: business.segment,
          specialty:
            business.specialty,
          brandName:
            theme.brandName,
        })
      );

      window.dispatchEvent(
        new Event(
          "yggdraflow:theme-updated"
        )
      );

      window.location.href =
        `/business-plans?businessId=${business.id}`;
    } catch {
  setError(
    "Não foi possível concluir a configuração. Tente novamente."
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
      if (
        selectedSegment === "BEAUTY"
      ) {
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
      <main
        className="flex min-h-[100dvh] items-center justify-center bg-slate-950 px-6 text-[#171717]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(2,10,20,0.62), rgba(2,10,20,0.40)), url('/plan-selection-bg.png')",
          backgroundPosition:
            "center",
          backgroundRepeat:
            "no-repeat",
          backgroundSize:
            "cover",
        }}
      >
        <div className="rounded-[28px] border border-white/90 bg-white/95 px-8 py-6 text-sm font-black shadow-[0_24px_80px_rgba(0,0,0,0.30)] backdrop-blur-xl">
          Preparando configuração inicial...
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden bg-slate-950 text-[#171717]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(2,10,20,0.52), rgba(2,10,20,0.30)), url('/plan-selection-bg.png')",
        backgroundPosition:
          "center",
        backgroundRepeat:
          "no-repeat",
        backgroundSize:
          "cover",
      }}
    >
      <div className="grid min-h-[100dvh] w-full grid-cols-1 gap-6 px-5 py-5 lg:grid-cols-[0.72fr_1.28fr] lg:px-10 xl:grid-cols-[0.82fr_1.38fr] xl:px-14">

        <section className="relative hidden min-h-[640px] items-center justify-center lg:flex">
          <div className="relative flex h-full w-full flex-col items-center justify-center">
            <div className="absolute h-[680px] w-[680px] rounded-full bg-[#00bfff]/15 blur-[100px]" />

            <img
              src="/yggdra-tech-logo.png"
              alt="Yggdra Tech"
              className="relative z-10 max-h-[52vh] max-w-[88%] object-contain drop-shadow-[0_24px_45px_rgba(0,0,0,0.35)]"
            />

            <div className="relative z-10 mt-8 max-w-[470px] rounded-[24px] border border-white/15 bg-black/25 px-6 py-5 text-center text-white backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5bd7eb]">
                Primeiro acesso
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight">
                Vamos preparar o YggdraFlow para o seu negócio.
              </h1>

              <p className="mt-3 text-sm font-medium leading-6 text-white/70">
                Escolha o seu ramo e configure as informações iniciais antes de seguir para o plano.
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-[100dvh] items-center justify-center py-3 lg:min-h-0">
          <div className="w-full max-w-[860px]">

            <div className="overflow-hidden rounded-[30px] border border-white/90 bg-white/95 shadow-[0_30px_90px_rgba(0,0,0,0.30)] backdrop-blur-xl">

              <header className="border-b border-[#ebebec] px-6 py-5 sm:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#171717] text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                      <Sparkles size={21} />
                    </div>

                    <div>
                      <strong className="block text-lg font-black tracking-tight text-[#2b2b2f]">
                        YggdraFlow
                      </strong>

                      <span className="text-xs font-bold text-[#777681]">
                        Configuração inicial do seu negócio
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex rounded-full bg-[#dff6ff] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#007da8]">
                    Etapa {stepNumber} de 4
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(
                    (item) => (
                      <div
                        key={item}
                        className={[
                          "h-1.5 rounded-full transition-colors",
                          item <=
                          stepNumber
                            ? "bg-[#00bfff]"
                            : "bg-[#e5e7eb]",
                        ].join(" ")}
                      />
                    )
                  )}
                </div>
              </header>

              <form
                onSubmit={handleSubmit}
                className="px-6 py-6 sm:px-8"
              >
                {step !== "segment" ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="mb-5 inline-flex items-center gap-2 rounded-xl border border-[#e4e4e4] bg-[#f7f7f7] px-4 py-2 text-sm font-black text-[#45454b] transition hover:border-[#00bfff] hover:bg-[#eefaff]"
                  >
                    <ArrowLeft
                      size={17}
                    />
                    Voltar
                  </button>
                ) : null}

                {step === "segment" ? (
                  <div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#00a9e0]">
                        Etapa 1
                      </p>

                      <h2 className="mt-2 text-3xl font-black tracking-tight text-[#2b2b2f]">
                        Qual é o ramo do seu negócio?
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#666571]">
                        Escolha uma opção para adaptar o YggdraFlow ao seu tipo de atendimento.
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {segmentOptions.map(
                        (option) => {
                          const Icon =
                            option.icon;

                          return (
                            <button
                              key={
                                option.segment
                              }
                              type="button"
                              disabled={
                                isSaving
                              }
                              onClick={() =>
                                chooseSegment(
                                  option.segment
                                )
                              }
                              className="group flex min-h-[190px] flex-col rounded-[22px] border border-[#e4e4e4] bg-white p-5 text-left shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:border-[#00bfff] hover:shadow-[0_18px_40px_rgba(0,191,255,0.14)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#171717] text-white transition group-hover:bg-[#00bfff]">
                                <Icon
                                  size={21}
                                />
                              </div>

                              <h3 className="mt-4 text-base font-black text-[#2b2b2f]">
                                {
                                  option.title
                                }
                              </h3>

                              <p className="mt-2 flex-1 text-xs font-semibold leading-5 text-[#777681]">
                                {
                                  option.description
                                }
                              </p>

                              <span className="mt-4 inline-flex w-fit rounded-full bg-[#f2f3f4] px-3 py-1 text-[10px] font-black text-[#595959]">
                                {
                                  option.brandName
                                }
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                ) : null}

                {step === "specialty" ? (
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#00a9e0]">
                      Etapa 2
                    </p>

                    <h2 className="mt-2 text-3xl font-black tracking-tight text-[#2b2b2f]">
                      Qual área de estética você atende?
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#666571]">
                      Escolha a especialidade principal do negócio. Para operações que atendem várias áreas, use estética completa.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {beautySpecialtyOptions.map(
                        (option) => (
                          <button
                            key={
                              option.specialty
                            }
                            type="button"
                            disabled={
                              isSaving
                            }
                            onClick={() =>
                              chooseSpecialty(
                                option.specialty
                              )
                            }
                            className="group flex min-h-[190px] flex-col rounded-[22px] border border-[#e4e4e4] bg-white p-5 text-left shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:border-[#00bfff] hover:shadow-[0_18px_40px_rgba(0,191,255,0.14)] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#171717] text-white transition group-hover:bg-[#00bfff]">
                              <WandSparkles
                                size={21}
                              />
                            </div>

                            <h3 className="mt-4 text-base font-black text-[#2b2b2f]">
                              {
                                option.title
                              }
                            </h3>

                            <p className="mt-2 flex-1 text-xs font-semibold leading-5 text-[#777681]">
                              {
                                option.description
                              }
                            </p>

                            <span className="mt-4 inline-flex w-fit rounded-full bg-[#f2f3f4] px-3 py-1 text-[10px] font-black text-[#595959]">
                              {
                                option.brandName
                              }
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ) : null}

                {step === "details" ? (
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#00a9e0]">
                      Etapa 3
                    </p>

                    <h2 className="mt-2 text-3xl font-black tracking-tight text-[#2b2b2f]">
                      {hasBusiness
                        ? "Confirmar configuração do negócio"
                        : "Dados iniciais do negócio"}
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#666571]">
                      {hasBusiness
                        ? "Vamos salvar o ramo escolhido no negócio já cadastrado."
                        : "Preencha os dados do negócio. Na próxima etapa você escolherá o plano."}
                    </p>

                    <div className="mt-6 rounded-[24px] border border-[#e4e4e4] bg-[#f8f9fa] p-5">
                      <div className="rounded-[18px] bg-[#171717] px-5 py-4 text-white">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5bd7eb]">
                          Experiência escolhida
                        </p>

                        <h3 className="mt-2 text-xl font-black">
                          {
                            selectedTheme.brandName
                          }
                        </h3>

                        <p className="mt-1 text-xs font-semibold text-white/65">
                          {
                            selectedTheme.subtitle
                          }
                        </p>
                      </div>

                      {hasBusiness ? (
                        <div className="mt-4 rounded-[18px] border border-[#e4e4e4] bg-white p-5">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#777681]">
                            Negócio encontrado
                          </p>

                          <p className="mt-2 text-lg font-black text-[#2b2b2f]">
                            {
                              targetBusiness?.name
                            }
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#666571]">
                            O ramo será salvo nesse negócio.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-5 grid gap-4">
                          <Input
                            label="Nome do negócio"
                            value={
                              businessName
                            }
                            onChange={(
                              event
                            ) =>
                              handleBusinessNameChange(
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Ex: Clínica Vet Aurora"
                            required
                          />



                          <Input
                            label="Telefone"
                            value={
                              phone
                            }
                            onChange={(
                              event
                            ) =>
                              setPhone(
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={
                          isSaving
                        }
                        className="mt-6 w-full rounded-xl bg-[#00bfff] px-6 py-4 text-sm font-black text-white shadow-[0_10px_24px_rgba(0,191,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#29c9ff] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSaving
                          ? "Salvando..."
                          : "Continuar para os planos"}
                      </button>
                    </div>
                  </div>
                ) : null}

                {error ? (
                  <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 ring-1 ring-red-100">
                    {error}
                  </p>
                ) : null}
              </form>
            </div>

            <p className="mt-3 text-center text-xs font-bold text-white/55">
              YggdraFlow · configuração segura do seu negócio
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
