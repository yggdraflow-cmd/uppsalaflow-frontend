import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { ThemePickerDialog } from "../components/ThemePickerDialog";
import { BusinessBillingBanner } from "../components/BusinessBillingBanner";
import {
  BriefcaseBusiness,
  CalendarDays,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Palette,
  Scissors,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { api, clearAuthStorage, getApiAssetUrl } from "../services/api";
import type { Business } from "../types/business";
import {
  defaultBusinessTheme,
  getBusinessTheme,
  type BusinessTheme,
} from "../utils/businessTheme";
import {
  applyColorTheme,
  getStoredColorThemeId,
  saveColorThemeId,
  type ColorThemeId,
} from "../utils/colorTheme";

const SUPPORT_URL =
  import.meta.env.VITE_SUPPORT_URL || "http://localhost:3000/#contato";

type AppLayoutProps = {
  children?: ReactNode;
};

function getMenuItems(theme: BusinessTheme) {
  const customerLabel =
    theme.brandName === "YggdraOdonto"
      ? "Pacientes"
      : theme.brandName === "YggdraVet"
        ? "Tutores"
        : "Clientes";

  const servicesLabel =
    theme.brandName === "YggdraOdonto"
      ? "Procedimentos"
      : theme.brandName === "YggdraNails"
        ? "Serviços de unhas"
        : "Serviços";

  const professionalsLabel =
    theme.brandName === "YggdraBarber"
      ? "Barbeiros"
      : theme.brandName === "YggdraNails"
        ? "Nail designers"
        : theme.brandName === "YggdraVet"
          ? "Veterinários"
          : "Profissionais";

  return [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Negócio",
      path: "/businesses",
      icon: BriefcaseBusiness,
    },
    {
      label: customerLabel,
      path: "/clients",
      icon: Users,
    },
    {
      label: servicesLabel,
      path: "/services",
      icon: Scissors,
    },
    {
      label: professionalsLabel,
      path: "/professionals",
      icon: UserRound,
    },
    {
      label: "Agenda",
      path: "/appointments",
      icon: CalendarDays,
    },
  ];
}

function getQuickActionItems(theme: BusinessTheme) {
  if (theme.brandName === "YggdraOdonto") {
    return [
      {
        label: "Nova consulta",
        description: "Agendar paciente existente",
        path: "/appointments",
        icon: CalendarDays,
      },
      {
        label: "Novo procedimento",
        description: "Cadastrar procedimento",
        path: "/services",
        icon: Scissors,
      },
      {
        label: "Novo profissional",
        description: "Cadastrar profissional",
        path: "/professionals",
        icon: UserRound,
      },
    ];
  }

  if (theme.brandName === "YggdraVet") {
    return [
      {
        label: "Novo atendimento",
        description: "Agendar tutor existente",
        path: "/appointments",
        icon: CalendarDays,
      },
      {
        label: "Novo serviço",
        description: "Cadastrar serviço",
        path: "/services",
        icon: Scissors,
      },
      {
        label: "Novo profissional",
        description: "Cadastrar profissional",
        path: "/professionals",
        icon: UserRound,
      },
    ];
  }

  if (theme.brandName === "YggdraBarber") {
    return [
      {
        label: "Novo horário",
        description: "Agendar cliente existente",
        path: "/appointments",
        icon: CalendarDays,
      },
      {
        label: "Novo serviço",
        description: "Cadastrar serviço",
        path: "/services",
        icon: Scissors,
      },
      {
        label: "Novo barbeiro",
        description: "Cadastrar barbeiro",
        path: "/professionals",
        icon: UserRound,
      },
    ];
  }

  if (theme.brandName === "YggdraNails") {
    return [
      {
        label: "Novo horário",
        description: "Agendar cliente existente",
        path: "/appointments",
        icon: CalendarDays,
      },
      {
        label: "Serviço de unhas",
        description: "Cadastrar serviço",
        path: "/services",
        icon: Scissors,
      },
      {
        label: "Nail designer",
        description: "Cadastrar profissional",
        path: "/professionals",
        icon: UserRound,
      },
    ];
  }

  if (theme.brandName === "YggdraWell") {
    return [
      {
        label: "Nova sessão",
        description: "Agendar cliente existente",
        path: "/appointments",
        icon: CalendarDays,
      },
      {
        label: "Novo serviço",
        description: "Cadastrar serviço",
        path: "/services",
        icon: Scissors,
      },
      {
        label: "Novo profissional",
        description: "Cadastrar profissional",
        path: "/professionals",
        icon: UserRound,
      },
    ];
  }

  return [
    {
      label: "Novo agendamento",
      description: "Criar horário na agenda",
      path: "/appointments",
      icon: CalendarDays,
    },
    {
      label: "Novo serviço",
      description: "Cadastrar serviço",
      path: "/services",
      icon: Scissors,
    },
    {
      label: "Novo profissional",
      description: "Cadastrar profissional",
      path: "/professionals",
      icon: UserRound,
    },
  ];
}

type StoredUserInfo = {
  label: string;
  profileImageUrl: string;
};

function getStoredUserInfo(): StoredUserInfo {
  const rawUser =
    localStorage.getItem("@yggdraflow:user") || localStorage.getItem("user");

  if (!rawUser) {
    return {
      label: "Usuário logado",
      profileImageUrl: "",
    };
  }

  try {
    const user = JSON.parse(rawUser) as {
      name?: string;
      email?: string;
      profileImageUrl?: string | null;
    };

    return {
      label: user.name || user.email || "Usuário logado",
      profileImageUrl: getApiAssetUrl(user.profileImageUrl),
    };
  } catch {
    return {
      label: "Usuário logado",
      profileImageUrl: "",
    };
  }
}

function getStoredBusinessTheme(): BusinessTheme {
  const rawTheme = localStorage.getItem("@yggdraflow:business-theme");

  if (!rawTheme) {
    return defaultBusinessTheme;
  }

  try {
    const theme = JSON.parse(rawTheme) as {
      segment?: Business["segment"];
      specialty?: Business["specialty"];
    };

    return getBusinessTheme(theme.segment, theme.specialty);
  } catch {
    return defaultBusinessTheme;
  }
}

function createLayoutStyle(theme: BusinessTheme): CSSProperties {
  return {
    "--yggdra-primary": theme.styles.primary,
    "--yggdra-primary-text": theme.styles.primaryText,
    "--yggdra-accent": theme.styles.accent,
    "--yggdra-accent-text": theme.styles.accentText,
    "--yggdra-muted": theme.styles.muted,
    "--yggdra-card": theme.styles.card,
    "--yggdra-sidebar": theme.styles.sidebar,
    "--yggdra-shadow": theme.styles.shadow,
    background: theme.styles.background,
  } as CSSProperties;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [storedUserInfo, setStoredUserInfo] = useState<StoredUserInfo>(
    getStoredUserInfo
  );

  const [businessTheme, setBusinessTheme] = useState<BusinessTheme>(
    getStoredBusinessTheme
  );

  const [activeBusiness, setActiveBusiness] =
    useState<Business | null>(null);

  const [selectedColorThemeId, setSelectedColorThemeId] =
    useState<ColorThemeId>(getStoredColorThemeId);

  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  const layoutTheme = applyColorTheme(businessTheme, selectedColorThemeId);

  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBusinessTheme() {
      try {
        const response = await api.get<Business[]>("/businesses");

        const businessWithSegment =
          response.data.find((business) => business.segment) || response.data[0];

        const theme = getBusinessTheme(
          businessWithSegment?.segment,
          businessWithSegment?.specialty
        );

        if (!isMounted) {
          return;
        }

        setBusinessTheme(theme);
        setActiveBusiness(businessWithSegment || null);

        localStorage.setItem(
          "@yggdraflow:business-theme",
          JSON.stringify({
            segment: businessWithSegment?.segment || null,
            specialty: businessWithSegment?.specialty || null,
            brandName: theme.brandName,
          })
        );
      } catch {
        if (isMounted) {
          setBusinessTheme(getStoredBusinessTheme());
          setActiveBusiness(null);
        }
      }
    }

    function handleThemeUpdated() {
      loadBusinessTheme();
    }

    function handleUserUpdated() {
      setStoredUserInfo(getStoredUserInfo());
    }

    setStoredUserInfo(getStoredUserInfo());
    setIsQuickActionsOpen(false);

    const activeElement = document.activeElement;

    if (
      activeElement instanceof HTMLElement &&
      mobileNavigationRef.current?.contains(activeElement)
    ) {
      activeElement.blur();
    }

    setIsMobileMenuOpen(false);
    loadBusinessTheme();

    window.addEventListener("yggdraflow:theme-updated", handleThemeUpdated);
    window.addEventListener("yggdraflow:user-updated", handleUserUpdated);

    return () => {
      isMounted = false;

      window.removeEventListener(
        "yggdraflow:theme-updated",
        handleThemeUpdated
      );

      window.removeEventListener(
        "yggdraflow:user-updated",
        handleUserUpdated
      );
    };
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

  function handleColorThemeChange(themeId: ColorThemeId) {
    setSelectedColorThemeId(themeId);
    saveColorThemeId(themeId);
  }

  function openThemePickerFromMobile() {
    closeMobileMenu(false);
    setIsThemePickerOpen(true);
  }

  function handleLogout() {
    clearAuthStorage();
    closeMobileMenu(false);
    navigate("/login");
  }

  return (
    <div
      className="min-h-screen overflow-x-hidden p-0 text-[#171717] sm:p-5"
      style={createLayoutStyle(layoutTheme)}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1540px] overflow-hidden border border-white/80 bg-white/20 shadow-[0_30px_100px_var(--yggdra-shadow)] backdrop-blur-3xl sm:min-h-[calc(100vh-40px)] sm:rounded-[34px]">
        <aside className="m-5 hidden w-[255px] shrink-0 flex-col rounded-[32px] bg-[var(--yggdra-sidebar)] px-5 py-6 shadow-[0_24px_70px_var(--yggdra-shadow)] backdrop-blur-2xl lg:flex">
          <Link
            to="/dashboard"
            className="mb-10 flex items-center gap-3 px-2"
            title={businessTheme.brandName}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--yggdra-primary)] text-[var(--yggdra-primary-text)] shadow-[0_16px_38px_var(--yggdra-shadow)]">
              <CalendarDays size={24} />
            </span>

            <div className="min-w-0">
              <strong className="block truncate text-lg font-black tracking-tight text-[#171717]">
                {businessTheme.brandName}
              </strong>

              <span className="block max-w-[150px] text-xs font-bold leading-5 text-[#7a7a7a]">
                {businessTheme.subtitle}
              </span>
            </div>
          </Link>

          <nav className="flex flex-1 flex-col gap-2">
            {getMenuItems(businessTheme).map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-200",
                      isActive
                        ? "bg-[var(--yggdra-primary)] text-[var(--yggdra-primary-text)] shadow-[0_18px_38px_var(--yggdra-shadow)]"
                        : "text-[#4f4f4f] hover:bg-[var(--yggdra-muted)] hover:text-[#171717]",
                    ].join(" ")
                  }
                >
                  <Icon size={19} />
                  <span className="min-w-0 truncate">{item.label}</span>
                </NavLink>
              );
            })}

            <button
              type="button"
              onClick={() => setIsThemePickerOpen(true)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-[#4f4f4f] transition hover:bg-[var(--yggdra-muted)] hover:text-[#171717]"
              title="Escolher tema da plataforma"
            >
              <Palette size={19} />
              <span className="font-black">Tema</span>
            </button>

            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-[#4f4f4f] transition hover:bg-[var(--yggdra-muted)] hover:text-[#171717]"
              title="Abrir suporte da YggdraTech"
            >
              <LifeBuoy size={19} />
              <span>Suporte</span>
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-[#4f4f4f] transition hover:bg-[var(--yggdra-muted)] hover:text-[#171717]"
              title="Sair"
            >
              <LogOut size={19} />
              <span>Sair</span>
            </button>
          </nav>
        </aside>

        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => closeMobileMenu()}
          className={[
            "fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
            isMobileMenuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          ].join(" ")}
        />

        <aside
          ref={mobileNavigationRef}
          id="mobile-navigation"
          aria-hidden={!isMobileMenuOpen}
          className={[
            "fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[min(86vw,320px)] flex-col overflow-hidden bg-[var(--yggdra-sidebar)] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl transition-transform duration-300 lg:hidden",
            isMobileMenuOpen
              ? "pointer-events-auto translate-x-0"
              : "pointer-events-none -translate-x-full",
          ].join(" ")}
        >
          <div className="mb-8 flex items-start justify-between gap-4">
            <Link
              to="/dashboard"
              onClick={() => closeMobileMenu()}
              className="flex min-w-0 items-center gap-3"
              title={businessTheme.brandName}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--yggdra-primary)] text-[var(--yggdra-primary-text)] shadow-[0_16px_38px_var(--yggdra-shadow)]">
                <CalendarDays size={24} />
              </span>

              <span className="min-w-0">
                <strong className="block truncate text-lg font-black tracking-tight text-[#171717]">
                  {businessTheme.brandName}
                </strong>

                <span className="block text-xs font-bold leading-5 text-[#7a7a7a]">
                  {businessTheme.subtitle}
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => closeMobileMenu()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--yggdra-muted)] text-[#4f4f4f] transition hover:text-[#171717]"
              aria-label="Fechar menu"
              title="Fechar menu"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pb-2 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {getMenuItems(businessTheme).map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => closeMobileMenu()}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-200",
                      isActive
                        ? "bg-[var(--yggdra-primary)] text-[var(--yggdra-primary-text)] shadow-[0_18px_38px_var(--yggdra-shadow)]"
                        : "text-[#4f4f4f] hover:bg-[var(--yggdra-muted)] hover:text-[#171717]",
                    ].join(" ")
                  }
                >
                  <Icon size={20} />
                  <span className="min-w-0 truncate">{item.label}</span>
                </NavLink>
              );
            })}

            <button
              type="button"
              onClick={openThemePickerFromMobile}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-[#4f4f4f] transition hover:bg-[var(--yggdra-muted)] hover:text-[#171717]"
              title="Escolher tema da plataforma no menu móvel"
            >
              <Palette size={20} />
              <span className="font-black">Tema</span>
            </button>

            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => closeMobileMenu(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-[#4f4f4f] transition hover:bg-[var(--yggdra-muted)] hover:text-[#171717]"
              title="Abrir suporte da YggdraTech no menu móvel"
            >
              <LifeBuoy size={20} />
              <span>Suporte</span>
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-[#4f4f4f] transition hover:bg-[var(--yggdra-muted)] hover:text-[#171717]"
              title="Sair"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-[72px] items-center justify-between gap-3 border-b border-white/40 px-3 sm:min-h-[86px] sm:px-5 md:px-8 lg:justify-end lg:border-b-0">
            <button
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--yggdra-card)] text-[#171717] shadow-[0_12px_34px_var(--yggdra-shadow)] backdrop-blur-xl transition hover:bg-white lg:hidden"
              aria-label="Abrir menu"
              aria-controls="mobile-navigation"
              aria-expanded={isMobileMenuOpen}
              title="Abrir menu"
            >
              <Menu size={23} />
            </button>

            <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() =>
                    setIsQuickActionsOpen((current) => !current)
                  }
                  className="rounded-full bg-[var(--yggdra-primary)] px-5 py-3 text-xs font-black text-[var(--yggdra-primary-text)] shadow-[0_14px_34px_var(--yggdra-shadow)] transition hover:opacity-90"
                  title="Abrir ações rápidas"
                  aria-expanded={isQuickActionsOpen}
                >
                  + Criar
                </button>

                {isQuickActionsOpen ? (
                  <div className="absolute right-0 z-30 mt-3 w-[270px] rounded-[24px] border border-white/80 bg-[var(--yggdra-card)] p-3 shadow-[0_24px_70px_var(--yggdra-shadow)] backdrop-blur-2xl">
                    <p className="px-3 pb-2 text-xs font-black uppercase tracking-[0.18em] text-[#888]">
                      Ações rápidas
                    </p>

                    <div className="space-y-1">
                      {getQuickActionItems(businessTheme).map((item) => {
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsQuickActionsOpen(false)}
                            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-black text-[#171717] transition hover:bg-[var(--yggdra-muted)]"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--yggdra-primary)] text-[var(--yggdra-primary-text)]">
                              <Icon size={18} />
                            </span>

                            <span className="min-w-0">
                              <span className="block truncate">
                                {item.label}
                              </span>

                              <span className="block truncate text-xs font-bold text-[#777]">
                                {item.description}
                              </span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              <Link
                to="/account"
                className="flex min-w-0 items-center gap-3 rounded-full bg-[var(--yggdra-card)] px-2 py-2 text-sm font-black text-[#171717] shadow-[0_12px_34px_var(--yggdra-shadow)] backdrop-blur-xl transition hover:bg-white sm:px-3"
                title="Minha conta"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--yggdra-primary)] text-xs font-black text-[var(--yggdra-primary-text)]">
                  {storedUserInfo.profileImageUrl ? (
                    <img
                      src={storedUserInfo.profileImageUrl}
                      alt={storedUserInfo.label}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    storedUserInfo.label.slice(0, 1).toUpperCase()
                  )}
                </span>

                <span className="hidden max-w-[170px] truncate sm:block">
                  {storedUserInfo.label}
                </span>
              </Link>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pb-5 pt-4 sm:px-5 sm:pb-6 md:px-8 md:pb-7">
            {activeBusiness ? (
              <BusinessBillingBanner business={activeBusiness} />
            ) : null}

            {children ?? <Outlet />}
          </main>
        </section>
      </div>

      {isThemePickerOpen ? (
        <ThemePickerDialog
          eyebrow="Aparência"
          title="Escolha o tema"
          description="As cores mudam, mas o segmento, os nomes e os dados do negócio permanecem iguais."
          selectedThemeId={selectedColorThemeId}
          onSelect={handleColorThemeChange}
          onClose={() => setIsThemePickerOpen(false)}
        />
      ) : null}
    </div>
  );
}
