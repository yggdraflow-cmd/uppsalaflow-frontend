import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

import { api, getApiAssetUrl } from "../services/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { getToken, getUser } from "../services/authStorage";

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

type BookedAppointment = {
  startTime: string;
  endTime: string;
};

type BookedTimesResponse = {
  bookedTimes: string[];
  appointments: BookedAppointment[];
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

const BUSINESS_CLOSE_TIME = "18:00";

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

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date(2000, 0, 1, hours, minutes);
  date.setMinutes(date.getMinutes() + minutesToAdd);

  const finalHours = String(date.getHours()).padStart(2, "0");
  const finalMinutes = String(date.getMinutes()).padStart(2, "0");

  return `${finalHours}:${finalMinutes}`;
}

function hasTimeConflict(
  newStartTime: string,
  newEndTime: string,
  existingStartTime: string,
  existingEndTime: string
) {
  const newStart = timeToMinutes(newStartTime);
  const newEnd = timeToMinutes(newEndTime);
  const existingStart = timeToMinutes(existingStartTime);
  const existingEnd = timeToMinutes(existingEndTime);

  return newStart < existingEnd && newEnd > existingStart;
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return "Não foi possível confirmar o agendamento.";
}

export function PublicBookingPage() {
  const { slug } = useParams();

  const authUser = getUser();
  const isClientLoggedIn = Boolean(getToken() && authUser?.role === "CLIENT");
  const clientProfileImageUrl = getApiAssetUrl(authUser?.profileImageUrl);
  const authRedirectPath = slug ? `/agendar/${slug}` : "/cliente/agendamentos";
  const authRedirectQuery = `?redirect=${encodeURIComponent(authRedirectPath)}`;

  const [business, setBusiness] = useState<PublicBusiness | null>(null);
  const [bookedAppointments, setBookedAppointments] = useState<
    BookedAppointment[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState<BookingFormData>({
    serviceId: "",
    professionalId: "",
    date: getTodayDate(),
    startTime: "",
    clientName: isClientLoggedIn ? authUser?.name ?? "" : "",
    clientPhone: isClientLoggedIn ? authUser?.phone ?? "" : "",
    clientEmail: isClientLoggedIn ? authUser?.email ?? "" : "",
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

  const timeOptions = useMemo(() => {
    return availableTimes.map((time) => {
      if (!selectedService) {
        return {
          time,
          disabled: false,
          reason: "",
        };
      }

      const endTime = addMinutesToTime(time, selectedService.durationMinutes);

      if (timeToMinutes(endTime) > timeToMinutes(BUSINESS_CLOSE_TIME)) {
        return {
          time,
          disabled: true,
          reason: "fora do expediente",
        };
      }

      const hasConflict = bookedAppointments.some((appointment) =>
        hasTimeConflict(
          time,
          endTime,
          appointment.startTime,
          appointment.endTime
        )
      );

      return {
        time,
        disabled: hasConflict,
        reason: hasConflict ? "ocupado" : "",
      };
    });
  }, [bookedAppointments, selectedService]);

  const selectedTimeOption = useMemo(() => {
    return timeOptions.find((option) => option.time === formData.startTime);
  }, [formData.startTime, timeOptions]);

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

        window.localStorage.setItem(
          "@yggdraflow:last-public-booking",
          `/agendar/${response.data.slug}`
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

  useEffect(() => {
    async function loadBookedTimes() {
      if (!slug || !formData.date || !formData.professionalId) {
        setBookedAppointments([]);
        return;
      }

      setIsLoadingTimes(true);

      try {
        const response = await api.get<BookedTimesResponse>(
          `/public/businesses/${slug}/booked-times`,
          {
            params: {
              date: formData.date,
              professionalId: formData.professionalId,
            },
          }
        );

        setBookedAppointments(response.data.appointments);
      } catch {
        setBookedAppointments([]);
      } finally {
        setIsLoadingTimes(false);
      }
    }

    loadBookedTimes();
  }, [slug, formData.date, formData.professionalId]);

  useEffect(() => {
    if (timeOptions.length === 0) {
      return;
    }

    const currentOption = timeOptions.find(
      (option) => option.time === formData.startTime
    );

    if (currentOption && !currentOption.disabled) {
      return;
    }

    const firstAvailableOption = timeOptions.find((option) => !option.disabled);

    setFormData((currentFormData) => ({
      ...currentFormData,
      startTime: firstAvailableOption?.time ?? "",
    }));
  }, [formData.startTime, timeOptions]);

  function updateFormField(field: keyof BookingFormData, value: string) {
    setSuccessMessage("");

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

    if (!isClientLoggedIn) {
      setErrorMessage("Para agendar, entre ou crie sua conta de cliente.");
      return;
    }

    if (!formData.startTime) {
      setErrorMessage("Não há horário disponível para este serviço nesta data.");
      return;
    }

    if (selectedTimeOption?.disabled) {
      setErrorMessage("Esse horário não está disponível. Escolha outro horário.");
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

      if (selectedService) {
        setBookedAppointments((currentAppointments) => [
          ...currentAppointments,
          {
            startTime: formData.startTime,
            endTime: addMinutesToTime(
              formData.startTime,
              selectedService.durationMinutes
            ),
          },
        ]);
      }

      setFormData((currentFormData) => ({
        ...currentFormData,
        clientName: isClientLoggedIn ? currentFormData.clientName : "",
        clientPhone: isClientLoggedIn ? currentFormData.clientPhone : "",
        clientEmail: isClientLoggedIn ? currentFormData.clientEmail : "",
        notes: "",
      }));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#e9e9e9] px-4 py-8 text-[#171717]">
        <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center justify-center rounded-[36px] border border-white/80 bg-white/35 shadow-[0_30px_100px_rgba(0,0,0,0.14)] backdrop-blur-3xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#667789]">
            Carregando agendamento...
          </p>
        </section>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-[#e9e9e9] px-4 py-8 text-[#171717]">
        <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center justify-center rounded-[36px] border border-white/80 bg-white/35 p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.14)] backdrop-blur-3xl">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#171717]">
              YggdraFlow
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
    <main className="min-h-screen bg-[#e9e9e9] px-4 py-8 text-[#171717]">
      <section className="mx-auto min-h-[calc(100vh-64px)] max-w-7xl overflow-hidden rounded-[38px] border border-white/80 bg-white/32 shadow-[0_30px_100px_rgba(0,0,0,0.16)] backdrop-blur-3xl">
        <header className="border-b border-white/70 px-6 py-6 md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-[#171717]">
                YggdraFlow
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

            <div className="w-full space-y-3 md:max-w-md">
              <div className="rounded-[28px] border border-white/80 bg-white/45 p-5 text-sm font-bold text-[#667789] shadow-sm backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-[#171717]" size={22} />
                  <span>Escolha seu serviço e confirme seu horário.</span>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/80 bg-white/45 p-5 text-sm font-bold text-[#667789] shadow-sm backdrop-blur-2xl">
                {isClientLoggedIn ? (
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-[#171717]">
                      Cliente logado
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      {clientProfileImageUrl ? (
                        <img
                          src={clientProfileImageUrl}
                          alt={authUser?.name || "Foto do cliente"}
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#171717] text-sm font-black text-white">
                          {(authUser?.name || authUser?.email || "C")
                            .slice(0, 1)
                            .toUpperCase()}
                        </span>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-black text-[#171717]">
                          {authUser?.name || authUser?.email}
                        </p>

                        <p className="text-xs font-semibold text-[#667789]">
                          Cliente autenticado
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/cliente/agendamentos"
                      className="mt-4 inline-flex font-black text-[#171717] transition hover:opacity-70"
                    >
                      Ver meus agendamentos
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-[#171717]">
                      Portal do cliente
                    </p>

                    <p className="mt-2">
                      Entre como cliente para acompanhar seus horários depois.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link
                        to={`/cliente/login${authRedirectQuery}`}
                        className="font-black text-[#171717] transition hover:text-[#171717]"
                      >
                        Entrar
                      </Link>

                      <Link
                        to={`/cliente/cadastro${authRedirectQuery}`}
                        className="font-black text-[#171717] transition hover:text-[#171717]"
                      >
                        Criar conta
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {!isClientLoggedIn ? (
          <section className="mx-auto max-w-xl px-6 py-12">
            <div className="rounded-[34px] border border-white/80 bg-white/60 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.10)] backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#171717]">
                Portal do Cliente
              </p>

              <h2 className="mt-4 text-3xl font-black text-[#101828]">
                Entre para agendar
              </h2>

              <p className="mt-4 text-base leading-7 text-[#667789]">
                Para realizar um agendamento na <strong>{business.name}</strong>,
                primeiro entre na sua conta ou crie um cadastro de cliente.
              </p>

              <div className="mt-8 flex flex-col gap-4">
                <Link
                  to={`/cliente/login${authRedirectQuery}`}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#171717] px-5 text-sm font-black text-white transition hover:bg-black"
                >
                  Entrar como cliente
                </Link>

                <Link
                  to={`/cliente/cadastro${authRedirectQuery}`}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#171717] bg-white px-5 text-sm font-black text-[#171717] transition hover:bg-[#f3f3f3]"
                >
                  Criar conta de cliente
                </Link>
              </div>
            </div>
          </section>
        ) : (
        <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="space-y-6">
            <section className="upp-card rounded-[34px] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-[#171717]">
                    Serviços
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[#101828]">
                    Escolha o atendimento
                  </h2>
                </div>

                <Scissors className="text-[#555555]" size={26} />
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
                            ? "border-[#171717] bg-[#171717] text-white shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
                            : "border-white/80 bg-white/45 text-[#171717] hover:bg-white/70",
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
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-[#171717]">
                    Profissional
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[#101828]">
                    Quem vai atender
                  </h2>
                </div>

                <UserRound className="text-[#555555]" size={26} />
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
                            ? "border-[#171717] bg-[#171717] text-white shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
                            : "border-white/80 bg-white/45 text-[#171717] hover:bg-white/70",
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
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#171717]">
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

              <CalendarDays className="shrink-0 text-[#555555]" size={30} />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="upp-label">Data</span>

                <input
                  type="date"
                  className="upp-input"
                  value={formData.date}
                  min={getTodayDate()}
                  onChange={(event) =>
                    updateFormField("date", event.target.value)
                  }
                  required
                />
              </label>

              <label className="block">
                <span className="upp-label">
                  Horário {isLoadingTimes ? "(verificando...)" : ""}
                </span>

                <select
                  className="upp-input"
                  value={formData.startTime}
                  onChange={(event) =>
                    updateFormField("startTime", event.target.value)
                  }
                  required
                >
                  {timeOptions.map((option) => (
                    <option
                      key={option.time}
                      value={option.time}
                      disabled={option.disabled}
                    >
                      {option.disabled
                        ? `${option.time} - ${option.reason}`
                        : option.time}
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
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#171717]">
                Resumo
              </p>

              <div className="mt-4 grid gap-3 text-sm font-bold text-[#555555]">
                <div className="flex items-center justify-between gap-4">
                  <span>Serviço</span>
                  <strong className="text-right text-[#171717]">
                    {selectedService?.name ?? "Selecione"}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Profissional</span>
                  <strong className="text-right text-[#171717]">
                    {selectedProfessional?.name ?? "Selecione"}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Data</span>
                  <strong className="text-right text-[#171717]">
                    {formData.date}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Horário</span>
                  <strong className="text-right text-[#171717]">
                    {formData.startTime || "Sem horário disponível"}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Valor</span>
                  <strong className="text-right text-[#171717]">
                    {selectedService
                      ? formatCurrency(selectedService.price)
                      : "R$ 0,00"}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Duração</span>
                  <strong className="text-right text-[#171717]">
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

            {!isClientLoggedIn ? (
        <div className="mx-6 mt-6 rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.10)] md:mx-10">
          <h2 className="text-xl font-black text-[#101828]">
            Entre ou crie sua conta para agendar
          </h2>

          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#667789]">
            Seu cadastro fica ligado ao seu e-mail e seus agendamentos aparecem
            no portal do cliente.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/cliente/login${authRedirectQuery}`}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#171717] px-5 text-sm font-black text-white transition hover:bg-black"
            >
              Entrar como cliente
            </Link>

            <Link
              to={`/cliente/cadastro${authRedirectQuery}`}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#171717] bg-white px-5 text-sm font-black text-[#171717] transition hover:bg-[#f3f3f3]"
            >
              Criar conta de cliente
            </Link>
          </div>
        </div>
      ) : null}

      {successMessage ? (
              <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-sm font-bold text-emerald-700">
                <p>{successMessage}</p>

                {isClientLoggedIn ? (
                  <Link
                    to="/cliente/agendamentos"
                    className="mt-3 inline-flex rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-800"
                  >
                    Ver meus agendamentos
                  </Link>
                ) : (
                  <p className="mt-3 text-emerald-800">
                    Para acompanhar seus horários depois, entre ou crie uma
                    conta de cliente.
                  </p>
                )}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#667789]">
                <Clock size={18} className="text-[#171717]" />
                <span>Confirmação rápida pelo YggdraFlow.</span>
              </div>

              <Button
                type="submit"
                disabled={
                  isSaving ||
                  isLoadingTimes ||
                  Boolean(successMessage) ||
                  !formData.serviceId ||
                  !formData.professionalId ||
                  !formData.date ||
                  !formData.startTime ||
                  Boolean(selectedTimeOption?.disabled)
                }
                className="w-full sm:w-auto"
              >
                {successMessage
                  ? "Agendamento solicitado"
                  : isSaving
                    ? "Confirmando..."
                    : "Confirmar agendamento"}
              </Button>
            </div>
          </form>
        </div>
        )}
      </section>
    </main>
  );
}
