import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Clock3,
  Compass,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { api, getApiAssetUrl } from "../services/api";
import type { BusinessSegment } from "../types/business";
import { getUser } from "../services/authStorage";

type PublicCatalogService = {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  durationMinutes: number;
  category?: string | null;
};

type PublicCatalogBusiness = {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  category?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  slug: string;
  segment?: BusinessSegment | null;
  specialty?: string | null;
  services: PublicCatalogService[];
};

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatLabel(value?: string | null) {
  if (!value) {
    return "";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const officialSegmentOptions: Array<{
  segment: BusinessSegment;
  label: string;
}> = [
  { segment: "BARBERSHOP", label: "Barbearia" },
  { segment: "BEAUTY", label: "Estética feminina" },
  { segment: "ODONTOLOGY", label: "Odonto" },
  { segment: "VETERINARY", label: "Veterinária" },
  { segment: "WELLNESS", label: "Bem-estar" },
  { segment: "OTHER", label: "Outro ramo" },
];

function getBusinessCategory(business: PublicCatalogBusiness) {
  return (
    business.category ||
    formatLabel(business.specialty) ||
    formatLabel(business.segment) ||
    "Estabelecimento"
  );
}

export function ClientHomePage() {
  const user = getUser();
  const firstName = user?.name?.trim().split(/\s+/)[0] || "cliente";

  const [businesses, setBusinesses] = useState<PublicCatalogBusiness[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<BusinessSegment | "">("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadBusinesses() {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get<PublicCatalogBusiness[]>(
          "/public/businesses"
        );

        if (isMounted) {
          setBusinesses(response.data);
        }
      } catch (requestError: any) {
        if (isMounted) {
          setError(
            requestError?.response?.data?.message ||
              "Não foi possível carregar os estabelecimentos."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBusinesses();

    return () => {
      isMounted = false;
    };
  }, []);

  const serviceOptions = useMemo(() => {
    return Array.from(
      new Set(
        businesses.flatMap((business) =>
          business.services.map((service) => service.name)
        )
      )
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const maxPriceValue = Number(maxPrice);

    return businesses.filter((business) => {
      const searchableValues = [
        business.name,
        business.category,
        business.segment,
        business.specialty,
        ...business.services.flatMap((service) => [
          service.name,
          service.category,
          service.description,
        ]),
      ];

      const matchesSearch =
        !normalizedSearch ||
        searchableValues.some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(normalizedSearch)
        );

      const matchesCategory =
        !categoryFilter || business.segment === categoryFilter;

      const matchesService =
        !serviceFilter ||
        business.services.some(
          (service) => service.name === serviceFilter
        );

      const matchesPrice =
        !maxPrice.trim() ||
        Number.isNaN(maxPriceValue) ||
        business.services.some(
          (service) => Number(service.price) <= maxPriceValue
        );

      return (
        matchesSearch &&
        matchesCategory &&
        matchesService &&
        matchesPrice
      );
    });
  }, [
    businesses,
    search,
    categoryFilter,
    serviceFilter,
    maxPrice,
  ]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      categoryFilter ||
      serviceFilter ||
      maxPrice.trim()
  );

  function clearFilters() {
    setSearch("");
    setCategoryFilter("");
    setServiceFilter("");
    setMaxPrice("");
  }

  const filterButtonClass = (active: boolean) =>
    [
      "border px-4 py-2.5 text-sm font-black transition duration-200",
      active
        ? "border-[#081120] bg-[#081120] text-white shadow-[inset_0_-2px_0_#12B8D6]"
        : "border-[#dfe5e9] bg-white text-[#64748B] hover:border-[#12B8D6] hover:text-[#081120]",
    ].join(" ");

  return (
    <div className="space-y-8">
      <section className="overflow-hidden border border-[#dfe5e9] bg-white shadow-[0_18px_50px_rgba(8,17,32,0.05)]">
        <div className="grid lg:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.8fr)]">
          <div className="relative overflow-hidden border-b border-[#dfe5e9] bg-[#081120] p-6 text-white sm:p-8 lg:border-b-0 lg:border-r">
            <img
              src="/originkit/hero-08/pattern.svg"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.06]"
            />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 border border-[#12B8D6]/35 bg-[#12B8D6]/10 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#5BD7EB]">
                <Compass size={15} />
                Explorar
              </span>

              <h2 className="mt-7 text-2xl font-black tracking-[-0.035em] sm:text-3xl">
                Olá, {firstName}.
              </h2>

              <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-white/50">
                Encontre estabelecimentos, compare serviços e escolha seu
                próximo atendimento.
              </p>

              {!isLoading && !error ? (
                <div className="mt-8 border-t border-white/10 pt-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                    Catálogo disponível
                  </p>

                  <p className="mt-2 text-3xl font-black text-[#5BD7EB]">
                    {businesses.length}
                  </p>

                  <p className="mt-1 text-xs font-bold text-white/40">
                    {businesses.length === 1
                      ? "estabelecimento"
                      : "estabelecimentos"}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 p-5 sm:p-7 lg:p-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#087F95]">
                Pesquisa
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#081120]">
                O que você está procurando?
              </h2>
            </div>

            <div className="relative mt-5">
              <Search
                size={20}
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#087F95]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Estabelecimento, categoria ou serviço..."
                className="h-14 w-full border border-[#dfe5e9] bg-[#F7F7F5] pl-14 pr-5 text-sm font-bold text-[#081120] outline-none transition placeholder:text-[#94A3B8] focus:border-[#12B8D6] focus:bg-white focus:shadow-[0_0_0_3px_rgba(18,184,214,0.08)]"
              />
            </div>

            <div className="mt-6 border-t border-[#e2e8f0] pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center border border-[#12B8D6]/25 bg-[#12B8D6]/8 text-[#087F95]">
                    <SlidersHorizontal size={17} />
                  </span>

                  <div>
                    <p className="text-sm font-black text-[#081120]">
                      Refinar resultados
                    </p>

                    <p className="mt-0.5 text-xs font-semibold text-[#94A3B8]">
                      Categoria, serviço e faixa de preço.
                    </p>
                  </div>
                </div>

                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 border border-[#dfe5e9] bg-[#F7F7F5] px-3 py-2 text-xs font-black text-[#64748B] transition hover:border-[#081120] hover:bg-[#081120] hover:text-white"
                  >
                    <X size={14} />
                    Limpar filtros
                  </button>
                ) : null}
              </div>

              <div className="mt-6 grid gap-6">
                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
                    Categoria
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("")}
                      className={filterButtonClass(!categoryFilter)}
                    >
                      Todas
                    </button>

                    {officialSegmentOptions.map((option) => (
                      <button
                        key={option.segment}
                        type="button"
                        onClick={() => setCategoryFilter(option.segment)}
                        className={filterButtonClass(
                          categoryFilter === option.segment
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
                    Serviço
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setServiceFilter("")}
                      className={filterButtonClass(!serviceFilter)}
                    >
                      Todos
                    </button>

                    {serviceOptions.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => setServiceFilter(service)}
                        className={filterButtonClass(
                          serviceFilter === service
                        )}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
                    Preço máximo
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Sem limite", value: "" },
                      { label: "Até R$ 50", value: "50" },
                      { label: "Até R$ 100", value: "100" },
                      { label: "Até R$ 200", value: "200" },
                      { label: "Até R$ 500", value: "500" },
                    ].map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setMaxPrice(option.value)}
                        className={filterButtonClass(
                          maxPrice === option.value
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 border-b border-[#dfe5e9] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#087F95]">
            Estabelecimentos
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#081120]">
            Encontre onde se cuidar
          </h2>
        </div>

        {!isLoading && !error ? (
          <span className="text-sm font-bold text-[#64748B]">
            {filteredBusinesses.length}{" "}
            {filteredBusinesses.length === 1
              ? "resultado"
              : "resultados"}
          </span>
        ) : null}
      </section>

      {isLoading ? (
        <div className="border border-[#dfe5e9] bg-white p-8 text-center shadow-[0_14px_40px_rgba(8,17,32,0.04)]">
          <span className="mx-auto flex h-11 w-11 items-center justify-center border border-[#12B8D6]/25 bg-[#12B8D6]/8 text-[#087F95]">
            <Compass size={20} />
          </span>

          <p className="mt-4 text-sm font-bold text-[#64748B]">
            Carregando estabelecimentos...
          </p>
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="border border-red-200 bg-red-50 p-6">
          <p className="font-black text-red-700">
            Não foi possível carregar o catálogo.
          </p>

          <p className="mt-1 text-sm font-semibold text-red-600">
            {error}
          </p>
        </div>
      ) : null}

      {!isLoading && !error && filteredBusinesses.length === 0 ? (
        <div className="border border-[#dfe5e9] bg-white p-8 text-center shadow-[0_14px_40px_rgba(8,17,32,0.04)]">
          <span className="mx-auto flex h-12 w-12 items-center justify-center border border-[#12B8D6]/25 bg-[#12B8D6]/8 text-[#087F95]">
            <Search size={23} />
          </span>

          <h3 className="mt-5 text-lg font-black text-[#081120]">
            Nenhum estabelecimento encontrado
          </h3>

          <p className="mt-2 text-sm font-semibold text-[#64748B]">
            Ajuste sua busca ou remova alguns filtros.
          </p>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 border border-[#081120] bg-[#081120] px-5 py-3 text-sm font-black text-white transition hover:border-[#087F95] hover:bg-[#087F95]"
            >
              <X size={17} />
              Limpar filtros
            </button>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !error && filteredBusinesses.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredBusinesses.map((business) => {
            const coverImageUrl = getApiAssetUrl(
              business.coverImageUrl
            );
            const logoUrl = getApiAssetUrl(business.logoUrl);
            const startingPrice = business.services[0]?.price;
            const businessCategory = getBusinessCategory(business);

            return (
              <article
                key={business.id}
                className="group flex min-w-0 flex-col overflow-hidden border border-[#dfe5e9] bg-white shadow-[0_16px_45px_rgba(8,17,32,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#12B8D6]/55 hover:shadow-[0_24px_60px_rgba(8,17,32,0.10)]"
              >
                <div
                  className={[
                    "relative flex h-52 items-end overflow-hidden p-5",
                    coverImageUrl
                      ? "bg-cover bg-center"
                      : "bg-[#081120]",
                  ].join(" ")}
                  style={
                    coverImageUrl
                      ? {
                          backgroundImage: `linear-gradient(180deg, rgba(8,17,32,0.04), rgba(8,17,32,0.82)), url("${coverImageUrl}")`,
                        }
                      : undefined
                  }
                >
                  {!coverImageUrl ? (
                    <img
                      src="/originkit/hero-08/pattern.svg"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.08]"
                    />
                  ) : null}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#081120]/85 via-[#081120]/20 to-transparent" />

                  <div className="relative z-10 flex min-w-0 items-end gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-white/20 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.20)]">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={`Logo de ${business.name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2
                          size={28}
                          className="text-[#081120]"
                        />
                      )}
                    </div>

                    <div className="min-w-0 pb-0.5">
                      <span className="inline-flex border border-[#5BD7EB]/35 bg-[#081120]/55 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#5BD7EB] backdrop-blur-md">
                        {businessCategory}
                      </span>

                      <h3 className="mt-2 truncate text-xl font-black tracking-tight text-white sm:text-2xl">
                        {business.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e2e8f0] pb-5">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94A3B8]">
                        Serviços
                      </p>

                      <p className="mt-1.5 text-sm font-bold text-[#475569]">
                        {business.services.length}{" "}
                        {business.services.length === 1
                          ? "disponível"
                          : "disponíveis"}
                      </p>
                    </div>

                    {startingPrice !== undefined ? (
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#94A3B8]">
                          A partir de
                        </p>

                        <p className="mt-1 text-lg font-black text-[#081120]">
                          {formatCurrency(startingPrice)}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {business.address ? (
                    <p className="mt-4 line-clamp-1 text-xs font-semibold text-[#64748B]">
                      {business.address}
                    </p>
                  ) : null}

                  <div className="mt-5 divide-y divide-[#e2e8f0] border-y border-[#e2e8f0]">
                    {business.services.slice(0, 3).map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between gap-4 py-3.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[#081120]">
                            {service.name}
                          </p>

                          <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-[#94A3B8]">
                            <Clock3 size={13} className="text-[#087F95]" />
                            {service.durationMinutes} min
                          </div>
                        </div>

                        <span className="shrink-0 text-sm font-black text-[#081120]">
                          {formatCurrency(service.price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {business.services.length > 3 ? (
                    <p className="mt-3 text-xs font-bold text-[#94A3B8]">
                      + {business.services.length - 3} outros serviços
                    </p>
                  ) : null}

                  <Link
                    to={`/agendar/${business.slug}`}
                    className="mt-auto flex w-full items-center justify-between border border-[#081120] bg-[#081120] px-5 py-4 text-sm font-black text-white transition duration-200 hover:border-[#087F95] hover:bg-[#087F95]"
                  >
                    <span>Ver estabelecimento</span>
                    <ArrowUpRight
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      <section className="relative overflow-hidden border border-[#081120] bg-[#081120] p-6 text-white shadow-[0_18px_50px_rgba(8,17,32,0.12)] sm:p-7">
        <img
          src="/originkit/hero-08/pattern.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.05]"
        />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5BD7EB]">
              Sua agenda
            </p>

            <h2 className="mt-2 text-xl font-black tracking-tight text-white">
              Seus atendimentos em um só lugar.
            </h2>

            <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/50">
              Consulte seus horários e acompanhe seus próximos agendamentos.
            </p>
          </div>

          <Link
            to="/cliente/agendamentos"
            className="inline-flex shrink-0 items-center justify-center gap-2 border border-[#12B8D6] bg-[#12B8D6] px-5 py-3 text-sm font-black text-[#081120] transition hover:bg-[#5BD7EB]"
          >
            <CalendarDays size={18} />
            Meus agendamentos
          </Link>
        </div>
      </section>
    </div>
  );
}
