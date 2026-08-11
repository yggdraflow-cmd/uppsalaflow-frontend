import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  CalendarDays,
  Compass,
  LogOut,
  Menu,
  PlusCircle,
  UserRound,
  X,
} from "lucide-react";

import TextSphere from "@/components/originkit/ui/hero-08/text-sphere";
import { clearAuthStorage, getApiAssetUrl } from "../services/api";
import { getUser } from "../services/authStorage";

type ClientPortalLayoutProps = {
  children?: ReactNode;
};

function getPortalHeading(pathname: string) {
  if (pathname === "/cliente/agendamentos") {
    return {
      eyebrow: "Meus agendamentos",
      title: "Seus horários, sem complicação.",
      description:
        "Acompanhe seus próximos atendimentos e mantenha tudo organizado em um só lugar.",
    };
  }

  if (pathname === "/cliente/conta") {
    return {
      eyebrow: "Minha conta",
      title: "Seu perfil. Seus dados. Seu acesso.",
      description:
        "Gerencie suas informações pessoais e mantenha sua conta protegida.",
    };
  }

  if (pathname.startsWith("/agendar/")) {
    return {
      eyebrow: "Novo agendamento",
      title: "Seu próximo horário começa aqui.",
      description:
        "Escolha o serviço, o profissional e o melhor horário para você.",
    };
  }

  return {
    eyebrow: "Portal do cliente",
    title: "Encontre seu próximo atendimento.",
    description:
      "Descubra estabelecimentos, serviços e profissionais e agende de forma simples.",
  };
}

export function ClientPortalLayout({ children }: ClientPortalLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(getUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleUserUpdated() {
      setUser(getUser());
    }

    window.addEventListener("yggdraflow:user-updated", handleUserUpdated);

    return () => {
      window.removeEventListener(
        "yggdraflow:user-updated",
        handleUserUpdated
      );
    };
  }, []);

  useEffect(() => {
    const activeElement = document.activeElement;

    if (
      activeElement instanceof HTMLElement &&
      mobileNavigationRef.current?.contains(activeElement)
    ) {
      activeElement.blur();
    }

    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const mobileNavigation = mobileNavigationRef.current;

    if (!mobileNavigation) {
      return;
    }

    if (isMobileMenuOpen) {
      mobileNavigation.removeAttribute("inert");
    } else {
      mobileNavigation.setAttribute("inert", "");
    }
  }, [isMobileMenuOpen]);

  const profileImageUrl = getApiAssetUrl(user?.profileImageUrl);

  const storedPublicBookingPath = window.localStorage.getItem(
    "@yggdraflow:last-public-booking"
  );

  const lastPublicBookingPath =
    storedPublicBookingPath?.startsWith("/agendar/")
      ? storedPublicBookingPath
      : null;

  const portalHeading = getPortalHeading(location.pathname);

  function closeMobileMenu(restoreFocus = true) {
    const activeElement = document.activeElement;

    if (
      activeElement instanceof HTMLElement &&
      mobileNavigationRef.current?.contains(activeElement)
    ) {
      activeElement.blur();
    }

    setIsMobileMenuOpen(false);

    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        mobileMenuButtonRef.current?.focus();
      });
    }
  }

  function handleLogout() {
    clearAuthStorage();
    closeMobileMenu(false);
    navigate("/cliente/login");
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#081120] text-[#081120]">
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={() => closeMobileMenu()}
        className={[
          "fixed inset-0 z-40 bg-[#081120]/70 backdrop-blur-[3px] transition-opacity duration-300 md:hidden",
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        ref={mobileNavigationRef}
        id="client-mobile-navigation"
        aria-hidden={!isMobileMenuOpen}
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[min(86vw,330px)] flex-col overflow-hidden border-r border-white/10 bg-[#081120] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] text-white shadow-[0_30px_100px_rgba(0,0,0,0.48)] transition-transform duration-300 md:hidden",
          isMobileMenuOpen
            ? "pointer-events-auto translate-x-0"
            : "pointer-events-none -translate-x-full",
        ].join(" ")}
      >
        <img
          src="/originkit/hero-08/pattern.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.05]"
        />

        <div className="relative z-10 mb-8 flex items-start justify-between gap-4">
          <Link
            to="/cliente"
            onClick={() => closeMobileMenu()}
            className="flex min-w-0 items-center gap-3"
            title="YggdraFlow"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#12B8D6]/50 bg-[#12B8D6]/10 text-[#5BD7EB]">
              <CalendarDays size={24} />
            </span>

            <span className="min-w-0">
              <strong className="block truncate text-lg font-black tracking-tight text-white">
                YggdraFlow
              </strong>

              <span className="block text-xs font-bold leading-5 text-white/45">
                Portal do cliente
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => closeMobileMenu()}
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-white/60 transition hover:border-[#12B8D6]/40 hover:text-[#5BD7EB]"
            aria-label="Fechar menu"
            title="Fechar menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="relative z-10 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pb-2 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {lastPublicBookingPath ? (
            <Link
              to={lastPublicBookingPath}
              onClick={() => closeMobileMenu()}
              className="mb-3 flex items-center gap-3 border border-[#12B8D6] bg-[#12B8D6] px-4 py-3 text-sm font-black text-[#081120] shadow-[0_16px_40px_rgba(18,184,214,0.18)] transition hover:bg-[#5BD7EB]"
            >
              <PlusCircle size={20} />
              <span className="min-w-0 truncate">Agendar horário</span>
            </Link>
          ) : null}

          <NavLink
            to="/cliente"
            end
            onClick={() => closeMobileMenu()}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 border px-4 py-3 text-sm font-black transition-all duration-200",
                isActive
                  ? "border-[#12B8D6]/50 bg-[#12B8D6]/10 text-[#5BD7EB]"
                  : "border-transparent text-white/55 hover:border-white/10 hover:bg-white/5 hover:text-white",
              ].join(" ")
            }
          >
            <Compass size={20} />
            <span className="min-w-0 truncate">Explorar</span>
          </NavLink>

          <NavLink
            to="/cliente/agendamentos"
            onClick={() => closeMobileMenu()}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 border px-4 py-3 text-sm font-black transition-all duration-200",
                isActive
                  ? "border-[#12B8D6]/50 bg-[#12B8D6]/10 text-[#5BD7EB]"
                  : "border-transparent text-white/55 hover:border-white/10 hover:bg-white/5 hover:text-white",
              ].join(" ")
            }
          >
            <CalendarDays size={20} />
            <span className="min-w-0 truncate">Meus agendamentos</span>
          </NavLink>

          <NavLink
            to="/cliente/conta"
            onClick={() => closeMobileMenu()}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 border px-4 py-3 text-sm font-black transition-all duration-200",
                isActive
                  ? "border-[#12B8D6]/50 bg-[#12B8D6]/10 text-[#5BD7EB]"
                  : "border-transparent text-white/55 hover:border-white/10 hover:bg-white/5 hover:text-white",
              ].join(" ")
            }
          >
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={user?.name || "Foto do cliente"}
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <UserRound size={20} />
            )}

            <span className="min-w-0 truncate">
              {user?.name || "Minha conta"}
            </span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 border border-transparent px-4 py-3 text-sm font-black text-white/45 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
            title="Sair"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </nav>

        <div className="pointer-events-none absolute -bottom-14 -right-20 h-64 w-64 opacity-20">
          <TextSphere
            word="YggdraFlow"
            color="#5BD7EB"
            speed={4}
            twist={50}
            letterSpacing={800}
          />
        </div>
      </aside>

      <header className="relative z-30 flex min-h-[72px] w-full items-center justify-between gap-3 border-b border-white/10 bg-[#081120]/95 px-4 py-3 text-white backdrop-blur-xl sm:px-6 md:px-8 md:py-4 xl:px-10 2xl:px-12">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-white transition hover:border-[#12B8D6]/40 hover:text-[#5BD7EB] md:hidden"
            aria-label="Abrir menu"
            aria-controls="client-mobile-navigation"
            aria-expanded={isMobileMenuOpen}
            title="Abrir menu"
          >
            <Menu size={23} />
          </button>

          <Link
            to="/cliente"
            className="hidden h-12 w-12 shrink-0 items-center justify-center border border-[#12B8D6]/40 bg-[#12B8D6]/10 text-[#5BD7EB] transition hover:bg-[#12B8D6]/15 md:flex"
            title="YggdraFlow"
          >
            <CalendarDays size={24} />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <strong className="truncate text-sm font-black tracking-tight text-white">
                YggdraFlow
              </strong>

              <span className="hidden h-1 w-1 rounded-full bg-[#12B8D6] sm:block" />

              <span className="hidden truncate text-xs font-bold uppercase tracking-[0.18em] text-white/40 sm:block">
                Portal do cliente
              </span>
            </div>
          </div>
        </div>

        <Link
          to="/cliente/conta"
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-white md:hidden"
          title="Minha conta"
        >
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={user?.name || "Foto do cliente"}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound size={20} />
          )}
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {lastPublicBookingPath ? (
            <Link
              to={lastPublicBookingPath}
              className="inline-flex items-center gap-2 border border-[#12B8D6] bg-[#12B8D6] px-4 py-2.5 text-sm font-black text-[#081120] transition hover:bg-[#5BD7EB]"
            >
              <PlusCircle size={17} />
              Agendar horário
            </Link>
          ) : null}

          <NavLink
            to="/cliente"
            end
            className={({ isActive }) =>
              [
                "border px-4 py-2.5 text-sm font-bold transition",
                isActive
                  ? "border-[#12B8D6]/50 bg-[#12B8D6]/10 text-[#5BD7EB]"
                  : "border-transparent text-white/55 hover:border-white/10 hover:text-white",
              ].join(" ")
            }
          >
            Explorar
          </NavLink>

          <NavLink
            to="/cliente/agendamentos"
            className={({ isActive }) =>
              [
                "border px-4 py-2.5 text-sm font-bold transition",
                isActive
                  ? "border-[#12B8D6]/50 bg-[#12B8D6]/10 text-[#5BD7EB]"
                  : "border-transparent text-white/55 hover:border-white/10 hover:text-white",
              ].join(" ")
            }
          >
            Meus agendamentos
          </NavLink>

          <NavLink
            to="/cliente/conta"
            className={({ isActive }) =>
              [
                "inline-flex items-center gap-2 border px-3 py-2 text-sm font-bold transition",
                isActive
                  ? "border-[#12B8D6]/50 bg-[#12B8D6]/10 text-[#5BD7EB]"
                  : "border-transparent text-white/55 hover:border-white/10 hover:text-white",
              ].join(" ")
            }
          >
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={user?.name || "Foto do cliente"}
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <UserRound size={18} />
            )}

            <span className="max-w-36 truncate">
              {user?.name || "Minha conta"}
            </span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 border border-transparent px-3 py-2.5 text-sm font-bold text-white/45 transition hover:border-white/10 hover:text-white"
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </header>

      <section className="relative isolate min-h-[220px] w-full overflow-hidden border-b border-white/10 bg-[#081120] px-4 py-8 text-white sm:px-6 sm:py-10 md:min-h-[260px] md:px-8 md:py-12 xl:px-10 2xl:px-12">
        <img
          src="/originkit/hero-08/pattern.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.075]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 82% 50%, rgba(18,184,214,0.15), transparent 34%), linear-gradient(90deg, rgba(8,17,32,1) 0%, rgba(8,17,32,0.92) 55%, rgba(8,17,32,0.70) 100%)",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-full w-px bg-white/10"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-full w-px bg-white/10"
        />

        <div className="relative z-10 flex min-h-[150px] max-w-[820px] flex-col justify-center md:min-h-[165px]">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-[#5BD7EB]">
            {portalHeading.eyebrow}
          </p>

          <h1 className="max-w-[760px] text-3xl font-black tracking-[-0.045em] text-white sm:text-4xl md:text-5xl">
            {portalHeading.title}
          </h1>

          <p className="mt-4 max-w-[620px] text-sm font-medium leading-6 text-white/50 sm:text-base sm:leading-7">
            {portalHeading.description}
          </p>
        </div>

        <div className="pointer-events-none absolute -right-16 top-1/2 h-[300px] w-[300px] -translate-y-1/2 opacity-35 sm:right-0 sm:h-[360px] sm:w-[360px] md:right-8 md:h-[430px] md:w-[430px] lg:right-16">
          <TextSphere
            word="YggdraFlow"
            color="#5BD7EB"
            speed={4}
            twist={50}
            letterSpacing={800}
          />
        </div>

        <div
          aria-hidden="true"
          className="absolute bottom-0 left-4 h-3 w-3 -translate-x-1/2 translate-y-1/2 border border-[#5BD7EB]/60 sm:left-6 md:left-8 xl:left-10 2xl:left-12"
        />

        <div
          aria-hidden="true"
          className="absolute bottom-0 right-4 h-3 w-3 translate-x-1/2 translate-y-1/2 border border-[#5BD7EB]/60 sm:right-6 md:right-8 xl:right-10 2xl:right-12"
        />
      </section>

      <main className="relative z-10 min-h-[calc(100vh-292px)] w-full overflow-x-hidden bg-[#F7F7F5] px-4 py-6 sm:px-6 sm:py-7 md:px-8 md:py-8 xl:px-10 2xl:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#12B8D6]/25"
        />

        {children ?? <Outlet />}
      </main>
    </div>
  );
}
