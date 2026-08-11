import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  MapPin,
  Phone,
  Scissors,
  Sparkles,
  UserRound,
} from "lucide-react";

import TextSphere from "@/components/originkit/ui/hero-08/text-sphere";
import { api, getApiAssetUrl } from "../services/api";
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
  currentDate: string;
  currentTime: string;
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

function getSaoPauloDateTime(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

function getTodayDate() {
  return getSaoPauloDateTime().date;
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

  const [currentDateTime, setCurrentDateTime] = useState(
    getSaoPauloDateTime
  );

  const [isTimeMenuOpen, setIsTimeMenuOpen] = useState(false);
  const timeMenuRef = useRef<HTMLDivElement>(null);

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
    const options: Array<{
      time: string;
      disabled: boolean;
      reason: string;
    }> = [];

    for (const time of availableTimes) {
      const selectedDateIsPast =
        formData.date < currentDateTime.date;

      const selectedTimeIsPast =
        formData.date === currentDateTime.date &&
        timeToMinutes(time) <= timeToMinutes(currentDateTime.time);

      if (selectedDateIsPast || selectedTimeIsPast) {
        continue;
      }

      if (!selectedService) {
        options.push({
          time,
          disabled: false,
          reason: "",
        });

        continue;
      }

      const endTime = addMinutesToTime(
        time,
        selectedService.durationMinutes
      );

      if (timeToMinutes(endTime) > timeToMinutes(BUSINESS_CLOSE_TIME)) {
        options.push({
          time,
          disabled: true,
          reason: "fora do expediente",
        });

        continue;
      }

      const hasConflict = bookedAppointments.some((appointment) =>
        hasTimeConflict(
          time,
          endTime,
          appointment.startTime,
          appointment.endTime
        )
      );

      options.push({
        time,
        disabled: hasConflict,
        reason: hasConflict ? "ocupado" : "",
      });
    }

    return options;
  }, [
    bookedAppointments,
    currentDateTime.date,
    currentDateTime.time,
    formData.date,
    selectedService,
  ]);

  const selectedTimeOption = useMemo(() => {
    return timeOptions.find((option) => option.time === formData.startTime);
  }, [formData.startTime, timeOptions]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        timeMenuRef.current &&
        event.target instanceof Node &&
        !timeMenuRef.current.contains(event.target)
      ) {
        setIsTimeMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsTimeMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

        setCurrentDateTime({
          date: response.data.currentDate,
          time: response.data.currentTime,
        });
      } catch {
        setBookedAppointments([]);
      } finally {
        setIsLoadingTimes(false);
      }
    }

    loadBookedTimes();
  }, [slug, formData.date, formData.professionalId]);

  useEffect(() => {
    function updateCurrentDateTime() {
      setCurrentDateTime(getSaoPauloDateTime());
    }

    updateCurrentDateTime();

    const intervalId = window.setInterval(
      updateCurrentDateTime,
      30_000
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

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

    const current = getSaoPauloDateTime();

    const selectedDateIsPast =
      formData.date < current.date;

    const selectedTimeIsPast =
      formData.date === current.date &&
      timeToMinutes(formData.startTime) <= timeToMinutes(current.time);

    if (selectedDateIsPast || selectedTimeIsPast) {
      setErrorMessage(
        "Esse horário já passou. Escolha um horário futuro."
      );
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
      <div
        className={[
          "relative flex min-h-[360px] w-full items-center justify-center overflow-hidden",
          isClientLoggedIn
            ? "border border-[#dfe5e9] bg-white"
            : "min-h-screen bg-[#081120] text-white",
        ].join(" ")}
      >
        {!isClientLoggedIn ? (
          <>
            <img
              src="/originkit/hero-08/pattern.svg"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.06]"
            />

            <div className="pointer-events-none absolute right-[-100px] top-1/2 h-[520px] w-[520px] -translate-y-1/2 opacity-25">
              <TextSphere
                word="YggdraFlow"
                color="#5BD7EB"
                speed={4}
                twist={50}
                letterSpacing={800}
              />
            </div>
          </>
        ) : null}

        <div className="relative z-10 flex items-center gap-3">
          <span className="h-2.5 w-2.5 animate-pulse bg-[#12B8D6]" />

          <p
            className={[
              "text-xs font-black uppercase tracking-[0.28em]",
              isClientLoggedIn ? "text-[#64748B]" : "text-white/60",
            ].join(" ")}
          >
            Carregando agendamento...
          </p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#081120] px-5 py-10 text-white">
        <img
          src="/originkit/hero-08/pattern.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.06]"
        />

        <div className="pointer-events-none absolute right-[-120px] top-1/2 h-[560px] w-[560px] -translate-y-1/2 opacity-20">
          <TextSphere
            word="YggdraFlow"
            color="#5BD7EB"
            speed={4}
            twist={50}
            letterSpacing={800}
          />
        </div>

        <div className="relative z-10 w-full max-w-3xl border border-white/10 bg-[#081120]/80 p-7 backdrop-blur-xl sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5BD7EB]">
            YggdraFlow
          </p>

          <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] sm:text-5xl">
            Página não encontrada
          </h1>

          <p className="mt-5 max-w-xl text-sm font-semibold leading-7 text-white/50 sm:text-base">
            {errorMessage ||
              "O link usado não corresponde a nenhum negócio cadastrado."}
          </p>

          <Link
            to="/cliente"
            className="mt-7 inline-flex border border-[#12B8D6] bg-[#12B8D6] px-5 py-3 text-sm font-black text-[#081120] transition hover:bg-[#5BD7EB]"
          >
            Ir para o YggdraFlow
          </Link>
        </div>
      </div>
    );
  }

  if (!isClientLoggedIn) {
    return (
      <main className="min-h-screen w-full bg-[#F7F7F5] text-[#081120]">
        <section className="relative isolate min-h-[520px] overflow-hidden bg-[#081120] px-5 py-8 text-white sm:px-8 lg:min-h-[620px] lg:px-12 xl:px-16">
          <img
            src="/originkit/hero-08/pattern.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.07]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 80% 50%, rgba(18,184,214,0.17), transparent 31%), linear-gradient(90deg, rgba(8,17,32,1) 0%, rgba(8,17,32,0.95) 54%, rgba(8,17,32,0.72) 100%)",
            }}
          />

          <header className="relative z-20 flex items-center justify-between border-b border-white/10 pb-6">
            <Link
              to="/cliente"
              className="inline-flex items-center gap-3 text-white"
            >
              <span className="flex h-11 w-11 items-center justify-center border border-[#12B8D6]/40 bg-[#12B8D6]/10 text-[#5BD7EB]">
                <CalendarDays size={21} />
              </span>

              <span>
                <strong className="block text-sm font-black">
                  YggdraFlow
                </strong>

                <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                  Agendamento online
                </span>
              </span>
            </Link>

            <Link
              to={`/cliente/login${authRedirectQuery}`}
              className="border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-black text-white transition hover:border-[#12B8D6]/40 hover:text-[#5BD7EB]"
            >
              Entrar
            </Link>
          </header>

          <div className="relative z-10 grid min-h-[430px] items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5BD7EB]">
                Agendamento público
              </p>

              <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                {business.name}
              </h1>

              <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-white/50">
                Escolha seu atendimento e reserve seu horário pelo YggdraFlow.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {business.category ? (
                  <span className="border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/70">
                    {business.category}
                  </span>
                ) : null}

                {business.phone ? (
                  <span className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/70">
                    <Phone size={14} className="text-[#5BD7EB]" />
                    {business.phone}
                  </span>
                ) : null}

                {business.address ? (
                  <span className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/70">
                    <MapPin size={14} className="text-[#5BD7EB]" />
                    {business.address}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="relative hidden min-h-[420px] lg:block">
              <div className="pointer-events-none absolute inset-[-50px] opacity-45">
                <TextSphere
                  word="YggdraFlow"
                  color="#5BD7EB"
                  speed={4}
                  twist={50}
                  letterSpacing={800}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid w-full lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="border-b border-[#dfe5e9] bg-[#081120] p-6 text-white sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5BD7EB]">
              Antes de continuar
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
              Entre para agendar.
            </h2>

            <p className="mt-4 max-w-lg text-sm font-semibold leading-7 text-white/50">
              Sua conta mantém seus horários organizados e permite acompanhar
              confirmações, alterações e mensagens do estabelecimento.
            </p>

            <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-5 text-sm font-bold text-white/50">
              <Sparkles size={19} className="text-[#5BD7EB]" />
              <span>Uma conta para todos os seus agendamentos.</span>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#087F95]">
              Portal do cliente
            </p>

            <h2 className="mt-3 text-2xl font-black tracking-tight text-[#081120]">
              Já tem uma conta?
            </h2>

            <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-[#64748B]">
              Entre para continuar o agendamento em{" "}
              <strong className="text-[#081120]">{business.name}</strong>.
              Se ainda não tiver cadastro, crie sua conta em poucos passos.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/cliente/login${authRedirectQuery}`}
                className="inline-flex min-h-12 items-center justify-center border border-[#081120] bg-[#081120] px-6 py-3 text-sm font-black text-white transition hover:border-[#087F95] hover:bg-[#087F95]"
              >
                Entrar como cliente
              </Link>

              <Link
                to={`/cliente/cadastro${authRedirectQuery}`}
                className="inline-flex min-h-12 items-center justify-center border border-[#dfe5e9] bg-[#F7F7F5] px-6 py-3 text-sm font-black text-[#081120] transition hover:border-[#12B8D6]"
              >
                Criar conta
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden border border-[#081120] bg-[#081120] p-6 text-white shadow-[0_18px_50px_rgba(8,17,32,0.10)] sm:p-7">
        <img
          src="/originkit/hero-08/pattern.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.05]"
        />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5BD7EB]">
              Estabelecimento
            </p>

            <h2 className="mt-3 text-2xl font-black tracking-[-0.035em] sm:text-3xl">
              {business.name}
            </h2>

            <div className="mt-5 flex flex-wrap gap-2">
              {business.category ? (
                <span className="border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/60">
                  {business.category}
                </span>
              ) : null}

              {business.phone ? (
                <span className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/60">
                  <Phone size={14} className="text-[#5BD7EB]" />
                  {business.phone}
                </span>
              ) : null}

              {business.address ? (
                <span className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/60">
                  <MapPin size={14} className="text-[#5BD7EB]" />
                  {business.address}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 border border-white/10 bg-white/5 p-4">
            {clientProfileImageUrl ? (
              <img
                src={clientProfileImageUrl}
                alt={authUser?.name || "Foto do cliente"}
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#12B8D6] text-sm font-black text-[#081120]">
                {(authUser?.name || authUser?.email || "C")
                  .slice(0, 1)
                  .toUpperCase()}
              </span>
            )}

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#5BD7EB]">
                Cliente logado
              </p>

              <p className="mt-1 max-w-52 truncate text-sm font-black text-white">
                {authUser?.name || authUser?.email}
              </p>

              <Link
                to="/cliente/agendamentos"
                className="mt-1 inline-flex text-xs font-bold text-white/45 transition hover:text-[#5BD7EB]"
              >
                Ver meus agendamentos
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)]">
        <aside className="min-w-0 space-y-6">
          <section className="border border-[#dfe5e9] bg-white shadow-[0_16px_45px_rgba(8,17,32,0.04)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#dfe5e9] bg-[#F7F7F5] p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#087F95]">
                  Etapa 01
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight text-[#081120]">
                  Escolha o serviço
                </h2>
              </div>

              <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#12B8D6]/25 bg-[#12B8D6]/8 text-[#087F95]">
                <Scissors size={19} />
              </span>
            </div>

            <div className="p-4 sm:p-5">
              {business.services.length === 0 ? (
                <p className="border border-dashed border-[#dfe5e9] bg-[#F7F7F5] p-5 text-sm font-bold text-[#64748B]">
                  Nenhum serviço ativo no momento.
                </p>
              ) : (
                <div className="divide-y divide-[#e2e8f0] border-y border-[#e2e8f0]">
                  {business.services.map((service) => {
                    const isSelected = formData.serviceId === service.id;

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() =>
                          updateFormField("serviceId", service.id)
                        }
                        className={[
                          "relative flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition",
                          isSelected
                            ? "bg-[#081120] text-white"
                            : "bg-white text-[#081120] hover:bg-[#F7F7F5]",
                        ].join(" ")}
                      >
                        {isSelected ? (
                          <span className="absolute inset-y-0 left-0 w-1 bg-[#12B8D6]" />
                        ) : null}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-black">
                              {service.name}
                            </h3>

                            {isSelected ? (
                              <CheckCircle2
                                size={16}
                                className="shrink-0 text-[#5BD7EB]"
                              />
                            ) : null}
                          </div>

                          {service.description ? (
                            <p
                              className={[
                                "mt-2 line-clamp-2 text-xs font-semibold leading-5",
                                isSelected
                                  ? "text-white/45"
                                  : "text-[#64748B]",
                              ].join(" ")}
                            >
                              {service.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-sm font-black">
                            {formatCurrency(service.price)}
                          </p>

                          <p
                            className={[
                              "mt-1 text-xs font-bold",
                              isSelected
                                ? "text-white/40"
                                : "text-[#94A3B8]",
                            ].join(" ")}
                          >
                            {service.durationMinutes} min
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="border border-[#dfe5e9] bg-white shadow-[0_16px_45px_rgba(8,17,32,0.04)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#dfe5e9] bg-[#F7F7F5] p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#087F95]">
                  Etapa 02
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight text-[#081120]">
                  Escolha o profissional
                </h2>
              </div>

              <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#12B8D6]/25 bg-[#12B8D6]/8 text-[#087F95]">
                <UserRound size={19} />
              </span>
            </div>

            <div className="p-4 sm:p-5">
              {business.professionals.length === 0 ? (
                <p className="border border-dashed border-[#dfe5e9] bg-[#F7F7F5] p-5 text-sm font-bold text-[#64748B]">
                  Nenhum profissional ativo no momento.
                </p>
              ) : (
                <div className="divide-y divide-[#e2e8f0] border-y border-[#e2e8f0]">
                  {business.professionals.map((professional) => {
                    const isSelected =
                      formData.professionalId === professional.id;

                    return (
                      <button
                        key={professional.id}
                        type="button"
                        onClick={() =>
                          updateFormField(
                            "professionalId",
                            professional.id
                          )
                        }
                        className={[
                          "relative flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-black transition",
                          isSelected
                            ? "bg-[#081120] text-white"
                            : "bg-white text-[#081120] hover:bg-[#F7F7F5]",
                        ].join(" ")}
                      >
                        {isSelected ? (
                          <span className="absolute inset-y-0 left-0 w-1 bg-[#12B8D6]" />
                        ) : null}

                        <span className="truncate">
                          {professional.name}
                        </span>

                        {isSelected ? (
                          <CheckCircle2
                            size={18}
                            className="shrink-0 text-[#5BD7EB]"
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </aside>

        <form
          onSubmit={handleSubmit}
          className="min-w-0 border border-[#dfe5e9] bg-white shadow-[0_18px_50px_rgba(8,17,32,0.05)]"
        >
          <div className="flex items-start justify-between gap-5 border-b border-[#dfe5e9] bg-[#F7F7F5] p-5 sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#087F95]">
                Etapa 03
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#081120]">
                Confirme seu horário
              </h2>

              <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-[#64748B]">
                Escolha data e horário. Seus dados já estão vinculados à sua
                conta YggdraFlow.
              </p>
            </div>

            <span className="hidden h-11 w-11 shrink-0 items-center justify-center border border-[#12B8D6]/25 bg-[#12B8D6]/8 text-[#087F95] sm:flex">
              <CalendarDays size={21} />
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
                  Data
                </span>

                <input
                  type="date"
                  value={formData.date}
                  min={getTodayDate()}
                  onChange={(event) =>
                    updateFormField("date", event.target.value)
                  }
                  required
                  className="h-14 w-full border border-[#dfe5e9] bg-[#F7F7F5] px-4 text-sm font-bold text-[#081120] outline-none transition focus:border-[#12B8D6] focus:bg-white focus:shadow-[0_0_0_3px_rgba(18,184,214,0.08)]"
                />
              </label>

              <div ref={timeMenuRef} className="relative">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
                  Horário {isLoadingTimes ? "· verificando" : ""}
                </span>

                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isTimeMenuOpen}
                  disabled={
                    isLoadingTimes || timeOptions.length === 0
                  }
                  onClick={() =>
                    setIsTimeMenuOpen((currentValue) => !currentValue)
                  }
                  className="flex h-14 w-full items-center justify-between gap-3 border border-[#dfe5e9] bg-[#F7F7F5] px-4 text-left text-sm font-bold text-[#081120] outline-none transition hover:border-[#12B8D6] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>
                    {formData.startTime || "Sem horário disponível"}
                  </span>

                  <ChevronDown
                    size={18}
                    className={[
                      "shrink-0 text-[#087F95] transition-transform duration-200",
                      isTimeMenuOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {isTimeMenuOpen ? (
                  <div
                    role="listbox"
                    className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto border border-[#dfe5e9] bg-white p-2 shadow-[0_20px_55px_rgba(8,17,32,0.16)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {timeOptions.map((option) => {
                      const isSelected =
                        option.time === formData.startTime;

                      return (
                        <button
                          key={option.time}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          disabled={option.disabled}
                          onClick={() => {
                            updateFormField("startTime", option.time);
                            setIsTimeMenuOpen(false);
                          }}
                          className={[
                            "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-black transition",
                            isSelected
                              ? "bg-[#081120] text-white"
                              : "text-[#081120] hover:bg-[#F7F7F5]",
                            option.disabled
                              ? "cursor-not-allowed opacity-35"
                              : "",
                          ].join(" ")}
                        >
                          <span>{option.time}</span>

                          {option.disabled ? (
                            <span className="text-[10px] font-black uppercase tracking-[0.1em]">
                              {option.reason}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
                  Seu nome
                </span>

                <input
                  value={formData.clientName}
                  onChange={(event) =>
                    updateFormField(
                      "clientName",
                      event.target.value
                    )
                  }
                  required
                  className="h-14 w-full border border-[#dfe5e9] bg-[#F7F7F5] px-4 text-sm font-bold text-[#081120] outline-none transition focus:border-[#12B8D6] focus:bg-white focus:shadow-[0_0_0_3px_rgba(18,184,214,0.08)]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
                  Telefone
                </span>

                <input
                  value={formData.clientPhone}
                  onChange={(event) =>
                    updateFormField(
                      "clientPhone",
                      event.target.value
                    )
                  }
                  required
                  className="h-14 w-full border border-[#dfe5e9] bg-[#F7F7F5] px-4 text-sm font-bold text-[#081120] outline-none transition focus:border-[#12B8D6] focus:bg-white focus:shadow-[0_0_0_3px_rgba(18,184,214,0.08)]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
                  E-mail
                </span>

                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(event) =>
                    updateFormField(
                      "clientEmail",
                      event.target.value
                    )
                  }
                  className="h-14 w-full border border-[#dfe5e9] bg-[#F7F7F5] px-4 text-sm font-bold text-[#081120] outline-none transition focus:border-[#12B8D6] focus:bg-white focus:shadow-[0_0_0_3px_rgba(18,184,214,0.08)]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
                  Observações
                </span>

                <input
                  value={formData.notes}
                  placeholder="Preferência, aviso ou detalhe"
                  onChange={(event) =>
                    updateFormField("notes", event.target.value)
                  }
                  className="h-14 w-full border border-[#dfe5e9] bg-[#F7F7F5] px-4 text-sm font-bold text-[#081120] outline-none transition placeholder:text-[#94A3B8] focus:border-[#12B8D6] focus:bg-white focus:shadow-[0_0_0_3px_rgba(18,184,214,0.08)]"
                />
              </label>
            </div>

            <section className="mt-7 overflow-hidden border border-[#081120] bg-[#081120] text-white">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5BD7EB]">
                  Resumo do agendamento
                </p>
              </div>

              <div className="grid gap-px bg-white/10 sm:grid-cols-2">
                {[
                  [
                    "Serviço",
                    selectedService?.name ?? "Selecione",
                  ],
                  [
                    "Profissional",
                    selectedProfessional?.name ?? "Selecione",
                  ],
                  ["Data", formData.date],
                  [
                    "Horário",
                    formData.startTime || "Sem horário disponível",
                  ],
                  [
                    "Valor",
                    selectedService
                      ? formatCurrency(selectedService.price)
                      : "R$ 0,00",
                  ],
                  [
                    "Duração",
                    selectedService
                      ? `${selectedService.durationMinutes} min`
                      : "-",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="bg-[#081120] px-5 py-4"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                      {label}
                    </p>

                    <p className="mt-1 text-sm font-black text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {errorMessage ? (
              <p className="mt-5 border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                {errorMessage}
              </p>
            ) : null}

            {successMessage ? (
              <div className="mt-5 border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                <p>{successMessage}</p>

                <Link
                  to="/cliente/agendamentos"
                  className="mt-4 inline-flex border border-emerald-700 bg-emerald-700 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-800"
                >
                  Ver meus agendamentos
                </Link>
              </div>
            ) : null}

            <div className="mt-7 flex flex-col gap-4 border-t border-[#e2e8f0] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#64748B]">
                <Clock
                  size={18}
                  className="shrink-0 text-[#087F95]"
                />
                <span>Confirmação rápida pelo YggdraFlow.</span>
              </div>

              <button
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
                className="inline-flex min-h-12 w-full items-center justify-center border border-[#12B8D6] bg-[#12B8D6] px-6 py-3 text-sm font-black text-[#081120] transition hover:bg-[#5BD7EB] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {successMessage
                  ? "Agendamento solicitado"
                  : isSaving
                    ? "Confirmando..."
                    : "Confirmar agendamento"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
