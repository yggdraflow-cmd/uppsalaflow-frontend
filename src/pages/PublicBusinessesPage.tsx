import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Clock3,
  Search,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import TextBlockAnimation from "../components/ui/TextBlockAnimation";
import { api, getApiAssetUrl } from "../services/api";

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
  averageRating?: number | null;
  ratingCount?: number;
  services: PublicCatalogService[];
};

const officialSegmentOptions = [
  { segment: "BARBERSHOP", label: "Barbearia" },
  { segment: "BEAUTY", label: "Estética feminina" },
  { segment: "ODONTOLOGY", label: "Odonto" },
  { segment: "VETERINARY", label: "Veterinária" },
  { segment: "WELLNESS", label: "Bem-estar" },
  { segment: "OTHER", label: "Outro ramo" },
] as const;

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

export function PublicBusinessesPage() {
  const [businesses, setBusinesses] = useState<PublicCatalogBusiness[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
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
              "Não foi possível carregar as empresas."
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

  const filteredBusinesses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return businesses.filter((business) => {
      const searchableValues = [
        business.name,
        business.category,
        business.segment,
        business.specialty,
        business.address,
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

      return matchesSearch && matchesCategory;
    });
  }, [businesses, search, categoryFilter]);

  return (
    <>
      <main className="min-h-screen bg-[#f7f7f5] text-[#081120]">
        <header className="sticky top-0 z-50 border-b border-[#e2e8f0]/80 bg-[#f7f7f5]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
            <div className="flex items-center gap-5">
              <a
                href="http://localhost:3000"
                className="inline-flex items-center gap-2 text-sm font-black text-[#64748b] transition hover:text-[#081120]"
              >
                <ArrowLeft size={17} />
                <span className="hidden sm:inline">
                  Voltar para Yggdra Tech
                </span>
              </a>

              <span className="hidden h-5 w-px bg-[#dbe2e7] sm:block" />

              <span className="text-xl font-black tracking-[-0.04em] text-[#081120]">
                YggdraFlow
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/cliente/login"
                className="hidden rounded-full px-4 py-2.5 text-sm font-black text-[#475569] transition hover:bg-white md:inline-flex"
              >
                Entrar como cliente
              </Link>

              <Link
                to="/login"
                className="rounded-full bg-[#081120] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#0f172a] sm:px-5 sm:text-sm"
              >
                Acesso empresarial
              </Link>
            </div>
          </div>
        </header>

        <section className="bg-[#f7f7f5]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="max-w-4xl">
              <TextBlockAnimation
                blockColor="#12b8d6"
                duration={0.9}
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#087f95]">
                  Empresas na YggdraFlow
                </p>
              </TextBlockAnimation>

              <TextBlockAnimation
                blockColor="#081120"
                duration={1}
                delay={0.08}
                className="mt-5"
              >
                <h2 className="text-4xl font-black leading-[1] tracking-[-0.05em] text-[#081120] sm:text-6xl">
                  Agora escolha onde você quer ser atendido.
                </h2>
              </TextBlockAnimation>

              <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-[#64748b]">
                Pesquise pelo nome da empresa, categoria ou serviço.
              </p>

              <div className="relative mt-8 max-w-3xl">
                <Search
                  size={21}
                  className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#64748b]"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Busque por empresa, serviço ou categoria..."
                  className="h-16 w-full rounded-2xl border border-[#dfe5e9] bg-white pl-14 pr-5 text-sm font-bold text-[#081120] shadow-[0_14px_40px_rgba(8,17,32,0.06)] outline-none transition placeholder:text-[#94a3b8] focus:border-[#12b8d6] focus:ring-4 focus:ring-[#12b8d6]/10"
                />
              </div>
            </div>

            <div className="mt-12">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">
                Categorias
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("")}
                  className={[
                    "rounded-full border px-4 py-2.5 text-sm font-black transition",
                    !categoryFilter
                      ? "border-[#081120] bg-[#081120] text-white"
                      : "border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#12b8d6] hover:text-[#087f95]",
                  ].join(" ")}
                >
                  Todas
                </button>

                {officialSegmentOptions.map((option) => (
                  <button
                    key={option.segment}
                    type="button"
                    onClick={() => setCategoryFilter(option.segment)}
                    className={[
                      "rounded-full border px-4 py-2.5 text-sm font-black transition",
                      categoryFilter === option.segment
                        ? "border-[#081120] bg-[#081120] text-white"
                        : "border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#12b8d6] hover:text-[#087f95]",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-12 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#12b8d6]">
                  Catálogo
                </p>

                <h3 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#081120]">
                  Empresas disponíveis
                </h3>
              </div>

              {!isLoading && !error ? (
                <p className="hidden text-sm font-bold text-[#64748b] sm:block">
                  {filteredBusinesses.length}{" "}
                  {filteredBusinesses.length === 1
                    ? "empresa encontrada"
                    : "empresas encontradas"}
                </p>
              ) : null}
            </div>

            {isLoading ? (
              <div className="mt-8 rounded-[24px] border border-[#e2e8f0] bg-white p-10 text-center">
                <p className="font-bold text-[#64748b]">
                  Carregando empresas...
                </p>
              </div>
            ) : null}

            {!isLoading && error ? (
              <div className="mt-8 rounded-[24px] border border-red-200 bg-red-50 p-8">
                <p className="font-black text-red-700">
                  Não foi possível carregar as empresas.
                </p>

                <p className="mt-2 text-sm font-semibold text-red-600">
                  {error}
                </p>
              </div>
            ) : null}

            {!isLoading &&
            !error &&
            filteredBusinesses.length === 0 ? (
              <div className="mt-8 rounded-[24px] border border-[#e2e8f0] bg-white p-10 text-center">
                <Search
                  size={28}
                  className="mx-auto text-[#94a3b8]"
                />

                <h3 className="mt-4 text-lg font-black text-[#081120]">
                  Nenhuma empresa encontrada
                </h3>

                <p className="mt-2 text-sm font-semibold text-[#64748b]">
                  Tente outro nome, serviço ou categoria.
                </p>
              </div>
            ) : null}

            {!isLoading &&
            !error &&
            filteredBusinesses.length > 0 ? (
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredBusinesses.map((business) => {
                  const coverImageUrl = getApiAssetUrl(
                    business.coverImageUrl
                  );

                  const logoUrl = getApiAssetUrl(business.logoUrl);
                  const category = getBusinessCategory(business);
                  const averageRating = business.averageRating ?? null;
                  const ratingCount = business.ratingCount ?? 0;
                  const roundedRating =
                    averageRating === null ? 0 : Math.round(averageRating);

                  const prices = business.services
                    .map((service) => Number(service.price))
                    .filter((price) => !Number.isNaN(price));

                  const startingPrice =
                    prices.length > 0 ? Math.min(...prices) : null;

                  return (
                    <article
                      key={business.id}
                      className="group overflow-hidden rounded-[26px] border border-[#e2e8f0] bg-white shadow-[0_16px_50px_rgba(8,17,32,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(8,17,32,0.10)]"
                    >
                      <div
                        className={[
                          "relative h-52 overflow-hidden",
                          coverImageUrl
                            ? "bg-cover bg-center"
                            : "bg-gradient-to-br from-[#081120] via-[#0f172a] to-[#087f95]",
                        ].join(" ")}
                        style={
                          coverImageUrl
                            ? {
                                backgroundImage: `url("${coverImageUrl}")`,
                              }
                            : undefined
                        }
                      >
                        {coverImageUrl ? (
                          <div className="absolute inset-0 bg-gradient-to-t from-[#081120]/75 via-transparent to-transparent" />
                        ) : null}

                        <div className="absolute bottom-5 left-5 right-5 flex items-end gap-4">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/60 bg-white shadow-lg">
                            {logoUrl ? (
                              <img
                                src={logoUrl}
                                alt={`Logo de ${business.name}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Building2
                                size={27}
                                className="text-[#081120]"
                              />
                            )}
                          </div>

                          <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#081120] backdrop-blur">
                            {category}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-2xl font-black tracking-[-0.03em] text-[#081120]">
                          {business.name}
                        </h3>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <div
                            className="flex items-center gap-0.5"
                            aria-label={
                              averageRating === null
                                ? "Ainda sem avaliações"
                                : `Avaliação ${averageRating.toFixed(1)} de 5`
                            }
                          >
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={
                                  star <= roundedRating
                                    ? "fill-[#12B8D6] text-[#12B8D6]"
                                    : "text-[#cbd5e1]"
                                }
                              />
                            ))}
                          </div>

                          {averageRating !== null && ratingCount > 0 ? (
                            <span className="text-sm font-black text-[#081120]">
                              {averageRating.toFixed(1)}
                              <span className="ml-1 font-bold text-[#64748b]">
                                ({ratingCount}{" "}
                                {ratingCount === 1
                                  ? "avaliação"
                                  : "avaliações"})
                              </span>
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-[#94a3b8]">
                              Ainda sem avaliações
                            </span>
                          )}
                        </div>

                        {business.address ? (
                          <p className="mt-2 text-sm font-semibold leading-6 text-[#64748b]">
                            {business.address}
                          </p>
                        ) : null}

                        <div className="mt-6 border-t border-[#edf1f3] pt-5">
                          <div className="flex items-end justify-between gap-4">
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                                Serviços
                              </p>

                              <p className="mt-1 text-sm font-bold text-[#475569]">
                                {business.services.length}{" "}
                                {business.services.length === 1
                                  ? "disponível"
                                  : "disponíveis"}
                              </p>
                            </div>

                            {startingPrice !== null ? (
                              <div className="text-right">
                                <p className="text-xs font-bold text-[#94a3b8]">
                                  A partir de
                                </p>

                                <p className="mt-1 text-lg font-black text-[#081120]">
                                  {formatCurrency(startingPrice)}
                                </p>
                              </div>
                            ) : null}
                          </div>

                          <div className="mt-5 space-y-2">
                            {business.services
                              .slice(0, 2)
                              .map((service) => (
                                <div
                                  key={service.id}
                                  className="flex items-center justify-between gap-4 rounded-xl bg-[#f7f7f5] px-4 py-3"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-black text-[#081120]">
                                      {service.name}
                                    </p>

                                    <span className="mt-1 flex items-center gap-1 text-xs font-bold text-[#64748b]">
                                      <Clock3 size={12} />
                                      {service.durationMinutes} min
                                    </span>
                                  </div>

                                  <span className="shrink-0 text-sm font-black text-[#087f95]">
                                    {formatCurrency(service.price)}
                                  </span>
                                </div>
                              ))}
                          </div>

                          <Link
                            to={`/agendar/${business.slug}`}
                            className="mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#12b8d6] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#087f95]"
                          >
                            Conhecer empresa
                            <ArrowRight size={17} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>

        <footer className="border-t border-[#e2e8f0] bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-10 sm:px-8 lg:px-10">
            <p className="font-black text-[#081120]">
              YggdraFlow
            </p>

            <p className="text-sm font-semibold text-[#64748b]">
              Encontre, escolha e agende.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
