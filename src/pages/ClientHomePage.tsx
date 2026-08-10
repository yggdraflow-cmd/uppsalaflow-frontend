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
  segment?: string | null;
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
  const [categoryFilter, setCategoryFilter] = useState("");
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

  const categoryOptions = useMemo(() => {
    return Array.from(
      new Set(businesses.map((business) => getBusinessCategory(business)))
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [businesses]);

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
      const businessCategory = getBusinessCategory(business);

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
        !categoryFilter || businessCategory === categoryFilter;

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

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/80 bg-white/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:p-8">
        <div className="max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">
            <Compass size={15} />
            Explorar
          </span>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-[#171717] sm:text-4xl">
            Olá, {firstName}. Encontre seu próximo atendimento.
          </h1>

          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#6f7d89] sm:text-base">
            Descubra estabelecimentos e serviços disponíveis no YggdraFlow.
          </p>

          <div className="relative mt-6">
            <Search
              size={20}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#7b8791]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Busque por estabelecimento, categoria ou serviço..."
              className="h-14 w-full rounded-2xl border border-[#dedede] bg-white pl-14 pr-5 text-sm font-semibold text-[#171717] outline-none transition placeholder:text-[#9aa3aa] focus:border-[#171717]"
            />
          </div>

          <div className="mt-5 rounded-[26px] border border-white/90 bg-white/60 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.05)] backdrop-blur-xl sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171717] text-white">
                  <SlidersHorizontal size={16} />
                </span>

                <div>
                  <p className="text-sm font-black text-[#171717]">
                    Filtrar resultados
                  </p>
                  <p className="text-xs font-semibold text-[#8b959d]">
                    Refine por categoria, serviço ou valor.
                  </p>
                </div>
              </div>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f1f1] px-3 py-2 text-xs font-black text-[#646f77] transition hover:bg-[#171717] hover:text-white"
                >
                  <X size={14} />
                  Limpar
                </button>
              ) : null}
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-[#8b959d]">
                Categoria
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("")}
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-black transition",
                    !categoryFilter
                      ? "border-[#171717] bg-[#171717] text-white"
                      : "border-[#dedede] bg-white text-[#606b73] hover:border-[#171717] hover:text-[#171717]",
                  ].join(" ")}
                >
                  Todas
                </button>

                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setCategoryFilter(category)}
                    className={[
                      "rounded-full border px-4 py-2 text-sm font-black transition",
                      categoryFilter === category
                        ? "border-[#171717] bg-[#171717] text-white"
                        : "border-[#dedede] bg-white text-[#606b73] hover:border-[#171717] hover:text-[#171717]",
                    ].join(" ")}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-[#8b959d]">
                  Serviço
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setServiceFilter("")}
                    className={[
                      "rounded-full border px-4 py-2 text-sm font-black transition",
                      !serviceFilter
                        ? "border-[#171717] bg-[#171717] text-white"
                        : "border-[#dedede] bg-white text-[#606b73] hover:border-[#171717] hover:text-[#171717]",
                    ].join(" ")}
                  >
                    Todos
                  </button>

                  {serviceOptions.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => setServiceFilter(service)}
                      className={[
                        "rounded-full border px-4 py-2 text-sm font-black transition",
                        serviceFilter === service
                          ? "border-[#171717] bg-[#171717] text-white"
                          : "border-[#dedede] bg-white text-[#606b73] hover:border-[#171717] hover:text-[#171717]",
                      ].join(" ")}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-[#8b959d]">
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
                      className={[
                        "rounded-full border px-4 py-2 text-sm font-black transition",
                        maxPrice === option.value
                          ? "border-[#171717] bg-[#171717] text-white"
                          : "border-[#dedede] bg-white text-[#606b73] hover:border-[#171717] hover:text-[#171717]",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8a969f]">
            Estabelecimentos
          </p>

          <h2 className="mt-1 text-2xl font-black text-[#171717]">
            Encontre onde se cuidar
          </h2>
        </div>

        {!isLoading && !error ? (
          <span className="text-sm font-bold text-[#78848e]">
            {filteredBusinesses.length}{" "}
            {filteredBusinesses.length === 1
              ? "estabelecimento encontrado"
              : "estabelecimentos encontrados"}
          </span>
        ) : null}
      </section>

      {isLoading ? (
        <div className="rounded-[28px] border border-white/80 bg-white/65 p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
          <p className="text-sm font-bold text-[#78848e]">
            Carregando estabelecimentos...
          </p>
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-6">
          <p className="font-black text-red-700">
            Não foi possível carregar o catálogo.
          </p>
          <p className="mt-1 text-sm font-semibold text-red-600">
            {error}
          </p>
        </div>
      ) : null}

      {!isLoading && !error && filteredBusinesses.length === 0 ? (
        <div className="rounded-[28px] border border-white/80 bg-white/65 p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
          <Search size={28} className="mx-auto text-[#8a969f]" />

          <h3 className="mt-4 text-lg font-black text-[#171717]">
            Nenhum estabelecimento encontrado
          </h3>

          <p className="mt-2 text-sm font-semibold text-[#78848e]">
            Ajuste sua busca ou remova alguns filtros.
          </p>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-black text-white"
            >
              <X size={17} />
              Limpar filtros
            </button>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !error && filteredBusinesses.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
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
                className="overflow-hidden rounded-[30px] border border-white/80 bg-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl"
              >
                <div
                  className={[
                    "relative flex h-48 items-end overflow-hidden p-5",
                    coverImageUrl
                      ? "bg-cover bg-center"
                      : "bg-gradient-to-br from-[#171717] to-[#444444]",
                  ].join(" ")}
                  style={
                    coverImageUrl
                      ? {
                          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.68)), url("${coverImageUrl}")`,
                        }
                      : undefined
                  }
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="relative flex min-w-0 items-end gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-white shadow-lg">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={`Logo de ${business.name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2
                          size={28}
                          className="text-[#171717]"
                        />
                      )}
                    </div>

                    <div className="min-w-0 pb-1">
                      <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#171717] backdrop-blur">
                        {businessCategory}
                      </span>

                      <h3 className="mt-2 truncate text-2xl font-black text-white">
                        {business.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#8a969f]">
                        Serviços disponíveis
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#606c75]">
                        {business.services.length}{" "}
                        {business.services.length === 1
                          ? "serviço"
                          : "serviços"}
                      </p>
                    </div>

                    {startingPrice !== undefined ? (
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#8a969f]">
                          A partir de
                        </p>
                        <p className="text-lg font-black text-[#171717]">
                          {formatCurrency(startingPrice)}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 space-y-2">
                    {business.services.slice(0, 3).map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-[#f4f4f4] px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[#171717]">
                            {service.name}
                          </p>

                          <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#7a858d]">
                            <Clock3 size={13} />
                            {service.durationMinutes} min
                          </div>
                        </div>

                        <span className="shrink-0 text-sm font-black text-[#171717]">
                          {formatCurrency(service.price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {business.services.length > 3 ? (
                    <p className="mt-3 text-xs font-bold text-[#89949c]">
                      + {business.services.length - 3} outros serviços
                    </p>
                  ) : null}

                  <Link
                    to={`/agendar/${business.slug}`}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#171717] px-5 py-4 text-sm font-black text-white transition hover:bg-black"
                  >
                    Ver estabelecimento
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      <section className="rounded-[28px] border border-white/80 bg-white/60 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#171717]">
              Seus atendimentos
            </h2>

            <p className="mt-2 text-sm font-semibold leading-6 text-[#74818c]">
              Consulte seus horários e acompanhe seus agendamentos.
            </p>
          </div>

          <Link
            to="/cliente/agendamentos"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-black text-white transition hover:bg-black"
          >
            <CalendarDays size={18} />
            Meus agendamentos
          </Link>
        </div>
      </section>
    </div>
  );
}
