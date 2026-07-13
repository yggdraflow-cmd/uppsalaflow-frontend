import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

import { Card } from "../components/Card";
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

export function BusinessOnboardingPage() {
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedSegment, setSelectedSegment] =
    useState<BusinessSegment | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const targetBusiness = useMemo(() => {
    return (
      businesses.find((business) => !business.segment) || businesses[0] || null
    );
  }, [businesses]);

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

  async function saveSegment(
    segment: BusinessSegment,
    specialty: BusinessSpecialty | null = null
  ) {
    if (!targetBusiness) {
      setError("Cadastre um negócio antes de escolher o ramo.");
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");
      setError("");

      const response = await api.patch<Business>(
        `/businesses/${targetBusiness.id}/segment`,
        {
          segment,
          specialty,
        }
      );

      const theme = getBusinessTheme(response.data.segment, response.data.specialty);

      localStorage.setItem(
        "@yggdraflow:business-theme",
        JSON.stringify({
          segment: response.data.segment,
          specialty: response.data.specialty,
          brandName: theme.brandName,
        })
      );

      window.dispatchEvent(new Event("yggdraflow:theme-updated"));

      setMessage(`Ramo configurado como ${theme.segmentLabel}.`);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Não foi possível salvar o ramo do negócio.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleSegmentClick(option: SegmentOption) {
    setSelectedSegment(option.segment);
    setMessage("");
    setError("");

    if (option.segment !== "BEAUTY") {
      saveSegment(option.segment, null);
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

  if (!targetBusiness) {
    return (
      <div>
        <div className="mb-8">
          <p className="text-sm font-black text-[#171717]">Primeiro acesso</p>
          <h1 className="text-3xl font-black text-[#171717]">
            Antes do ramo, vem o negócio
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-[#666]">
            Cadastre seu negócio primeiro. Depois o sistema libera a escolha do
            ramo e adapta a marca automaticamente.
          </p>
        </div>

        <Card title="Nenhum negócio cadastrado">
          <p className="text-sm text-zinc-600">
            Ainda não existe negócio vinculado à sua conta.
          </p>

          <Link
            to="/businesses"
            className="mt-5 inline-flex rounded-full bg-[#171717] px-5 py-3 text-sm font-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.18)]"
          >
            Cadastrar negócio
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-black text-[#171717]">Primeiro acesso</p>
        <h1 className="text-3xl font-black tracking-tight text-[#171717]">
          Qual é o ramo do seu negócio?
        </h1>
        <p className="mt-2 max-w-3xl text-sm font-medium text-[#666]">
          Essa escolha ajusta a marca, os textos e a experiência do painel para
          o tipo de atendimento que você oferece. Sim, o sistema vai parar de
          tratar barbeiro, veterinário e nail designer como se fossem a mesma
          entidade cósmica.
        </p>

        <div className="mt-4 inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-black text-[#171717] shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
          Negócio: {targetBusiness.name}
        </div>
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
              onClick={() => handleSegmentClick(option)}
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
            {beautySpecialtyOptions.map((option) => (
              <button
                key={option.specialty}
                type="button"
                disabled={isSaving}
                onClick={() => saveSegment("BEAUTY", option.specialty)}
                className="rounded-[24px] border border-zinc-200 bg-white p-4 text-left transition hover:-translate-y-1 hover:border-[#171717] hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f2f2f2] text-[#171717]">
                  <WandSparkles size={20} />
                </div>

                <h3 className="font-black text-[#171717]">{option.title}</h3>

                <p className="mt-2 text-sm font-medium text-[#666]">
                  {option.description}
                </p>

                <span className="mt-4 inline-flex rounded-full bg-[#171717] px-3 py-1 text-xs font-black text-white">
                  {option.brandName}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isSaving && (
        <p className="mt-5 text-sm font-black text-[#171717]">
          Salvando escolha...
        </p>
      )}

      {message && <p className="mt-5 text-sm font-black text-green-700">{message}</p>}
      {error && <p className="mt-5 text-sm font-black text-red-600">{error}</p>}
    </div>
  );
}
