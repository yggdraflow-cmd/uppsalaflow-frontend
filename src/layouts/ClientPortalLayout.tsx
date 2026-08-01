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
  LogOut,
  Menu,
  PlusCircle,
  UserRound,
  X,
} from "lucide-react";

import { clearAuthStorage, getApiAssetUrl } from "../services/api";
import { getUser } from "../services/authStorage";

type ClientPortalLayoutProps = {
  children?: ReactNode;
};

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
    storedPublicBookingPath &&
    storedPublicBookingPath !== "/agendar/salao-da-mayara"
      ? storedPublicBookingPath
      : null;

  if (storedPublicBookingPath === "/agendar/salao-da-mayara") {
    window.localStorage.removeItem("@yggdraflow:last-public-booking");
  }

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
    <div className="min-h-screen overflow-x-hidden bg-[#e9e9e9] p-0 text-[#171717] sm:p-4">
      <div className="mx-auto min-h-screen w-full max-w-[1200px] overflow-hidden border border-white/80 bg-white/32 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-3xl sm:min-h-[calc(100vh-32px)] sm:rounded-[34px]">
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => closeMobileMenu()}
          className={[
            "fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 md:hidden",
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
            "fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[min(86vw,320px)] flex-col overflow-hidden bg-[#f5f5f5] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition-transform duration-300 md:hidden",
            isMobileMenuOpen
              ? "pointer-events-auto translate-x-0"
              : "pointer-events-none -translate-x-full",
          ].join(" ")}
        >
          <div className="mb-8 flex items-start justify-between gap-4">
            <Link
              to="/cliente/agendamentos"
              onClick={() => closeMobileMenu()}
              className="flex min-w-0 items-center gap-3"
              title="YggdraFlow"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#171717] text-white shadow-[0_16px_38px_rgba(0,0,0,0.22)]">
                <CalendarDays size={24} />
              </span>

              <span className="min-w-0">
                <strong className="block truncate text-lg font-black tracking-tight text-[#171717]">
                  YggdraFlow
                </strong>

                <span className="block text-xs font-bold leading-5 text-[#7a7a7a]">
                  Portal do cliente
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => closeMobileMenu()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#555555] shadow-sm transition hover:text-[#171717]"
              aria-label="Fechar menu"
              title="Fechar menu"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pb-2 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {lastPublicBookingPath ? (
              <Link
                to={lastPublicBookingPath}
                onClick={() => closeMobileMenu()}
                className="flex items-center gap-3 rounded-2xl bg-[#171717] px-4 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(0,0,0,0.18)]"
              >
                <PlusCircle size={20} />
                <span className="min-w-0 truncate">Agendar horário</span>
              </Link>
            ) : null}

            <NavLink
              to="/cliente/agendamentos"
              onClick={() => closeMobileMenu()}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-200",
                  isActive
                    ? "bg-[#171717] text-white shadow-[0_16px_34px_rgba(0,0,0,0.18)]"
                    : "text-[#555555] hover:bg-white hover:text-[#171717]",
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
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-200",
                  isActive
                    ? "bg-[#171717] text-white shadow-[0_16px_34px_rgba(0,0,0,0.18)]"
                    : "text-[#555555] hover:bg-white hover:text-[#171717]",
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
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-[#555555] transition hover:bg-white hover:text-[#171717]"
              title="Sair"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </nav>
        </aside>

        <header className="flex min-h-[72px] items-center justify-between gap-3 border-b border-white/70 px-3 py-3 sm:px-5 md:min-h-0 md:flex-row md:px-8 md:py-6">
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <button
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-[#171717] shadow-sm backdrop-blur-xl transition hover:bg-white md:hidden"
              aria-label="Abrir menu"
              aria-controls="client-mobile-navigation"
              aria-expanded={isMobileMenuOpen}
              title="Abrir menu"
            >
              <Menu size={23} />
            </button>

            <Link
              to="/cliente/agendamentos"
              className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#171717] text-white shadow-[0_18px_42px_rgba(0,0,0,0.22)] md:flex"
              title="YggdraFlow"
            >
              <CalendarDays size={27} />
            </Link>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-[#6a7a89] md:gap-3">
                <span className="truncate">YggdraFlow</span>
                <span className="hidden h-1 w-1 shrink-0 rounded-full bg-[#aab8c3] sm:block" />
                <span className="hidden truncate text-[#171717] sm:block">
                  Portal do cliente
                </span>
              </div>

              <p className="mt-1 hidden text-xs font-semibold text-[#8a99a6] lg:block">
                Acompanhe seus horários, serviços e atendimentos.
              </p>
            </div>
          </div>

          <Link
            to="/cliente/conta"
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/70 text-[#171717] shadow-sm backdrop-blur-xl md:hidden"
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

          <div className="hidden flex-wrap items-center gap-3 md:flex">
            {lastPublicBookingPath ? (
              <Link
                to={lastPublicBookingPath}
                className="inline-flex items-center gap-2 rounded-full border border-[#171717] bg-[#171717] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#000000]"
              >
                <PlusCircle size={18} />
                Agendar horário
              </Link>
            ) : null}

            <NavLink
              to="/cliente/agendamentos"
              className={({ isActive }) =>
                [
                  "rounded-full border px-5 py-3 text-sm font-bold shadow-sm backdrop-blur-xl transition",
                  isActive
                    ? "border-[#171717] bg-[#171717] text-white"
                    : "border-white/80 bg-white/45 text-[#555555] hover:text-[#171717]",
                ].join(" ")
              }
            >
              Meus agendamentos
            </NavLink>

            <NavLink
              to="/cliente/conta"
              className={({ isActive }) =>
                [
                  "inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold shadow-sm backdrop-blur-xl transition",
                  isActive
                    ? "border-[#171717] bg-[#171717] text-white"
                    : "border-white/80 bg-white/45 text-[#555555] hover:text-[#171717]",
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

              {user?.name || "Minha conta"}
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/45 px-5 py-3 text-sm font-bold text-[#555555] shadow-sm backdrop-blur-xl transition hover:text-[#171717]"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </header>

        <main className="min-w-0 overflow-x-hidden px-3 py-5 sm:px-5 sm:py-6 md:px-8 md:py-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
