import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Scissors,
  Settings,
  UserRound,
  Users,
} from "lucide-react";

import { api, clearAuthStorage } from "../services/api";
import type { Business } from "../types/business";
import {
  defaultBusinessTheme,
  getBusinessTheme,
  type BusinessTheme,
} from "../utils/businessTheme";

type AppLayoutProps = {
  children?: ReactNode;
};

const menuItems = [
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
    label: "Clientes",
    path: "/clients",
    icon: Users,
  },
  {
    label: "Serviços",
    path: "/services",
    icon: Scissors,
  },
  {
    label: "Profissionais",
    path: "/professionals",
    icon: UserRound,
  },
  {
    label: "Agenda",
    path: "/appointments",
    icon: CalendarDays,
  },
  {
    label: "Configurações",
    path: "/settings",
    icon: Settings,
  },
];

const quickActionItems = [
  {
    label: "Novo agendamento",
    description: "Criar horário na agenda",
    path: "/appointments",
    icon: CalendarDays,
  },
  {
    label: "Novo cliente",
    description: "Cadastrar cliente",
    path: "/clients",
    icon: Users,
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

function getStoredUserLabel() {
  const rawUser =
    localStorage.getItem("@yggdraflow:user") || localStorage.getItem("user");

  if (!rawUser) {
    return "Usuário logado";
  }

  try {
    const user = JSON.parse(rawUser) as {
      name?: string;
      email?: string;
    };

    return user.name || user.email || "Usuário logado";
  } catch {
    return "Usuário logado";
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
  const userLabel = getStoredUserLabel();
  const [businessTheme, setBusinessTheme] = useState<BusinessTheme>(
    getStoredBusinessTheme
  );
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

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
        }
      }
    }

    function handleThemeUpdated() {
      loadBusinessTheme();
    }

    setIsQuickActionsOpen(false);
    loadBusinessTheme();

    window.addEventListener("yggdraflow:theme-updated", handleThemeUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("yggdraflow:theme-updated", handleThemeUpdated);
    };
  }, [location.pathname]);

  function handleLogout() {
    clearAuthStorage();
    navigate("/login");
  }

  return (
    <div
      className="min-h-screen p-3 text-[#171717] sm:p-5"
      style={createLayoutStyle(businessTheme)}
    >
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1540px] overflow-hidden rounded-[26px] border border-white/80 bg-white/20 shadow-[0_30px_100px_var(--yggdra-shadow)] backdrop-blur-3xl sm:min-h-[calc(100vh-40px)] sm:rounded-[34px]">
        <aside className="m-5 hidden w-[255px] shrink-0 flex-col rounded-[32px] bg-[var(--yggdra-sidebar)] px-5 py-6 shadow-[0_24px_70px_var(--yggdra-shadow)] backdrop-blur-2xl lg:flex">
          <Link
            to="/dashboard"
            className="mb-10 flex items-center gap-3 px-2"
            title={businessTheme.brandName}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--yggdra-primary)] text-[var(--yggdra-primary-text)] shadow-[0_16px_38px_var(--yggdra-shadow)]">
              <CalendarDays size={24} />
            </span>

            <div>
              <strong className="block text-lg font-black tracking-tight text-[#171717]">
                {businessTheme.brandName}
              </strong>
              <span className="text-xs font-bold text-[#7a7a7a]">
                {businessTheme.subtitle}
              </span>
            </div>
          </Link>

          <nav className="flex flex-1 flex-col gap-2">
            {menuItems.map((item) => {
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
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[24px] bg-[var(--yggdra-muted)] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8a8a8a]">
              Tema ativo
            </p>
            <p className="mt-1 text-sm font-black text-[#171717]">
              {businessTheme.segmentLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-[#4f4f4f] transition hover:bg-[var(--yggdra-muted)] hover:text-[#171717]"
            title="Sair"
          >
            <LogOut size={19} />
            <span>Sair</span>
          </button>
        </aside>

        <aside className="flex w-[74px] shrink-0 flex-col items-center bg-[var(--yggdra-sidebar)] px-2 py-4 backdrop-blur-2xl sm:w-[82px] sm:px-3 sm:py-5 lg:hidden">
          <NavLink
            to="/dashboard"
            className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--yggdra-primary)] text-[var(--yggdra-primary-text)] shadow-[0_18px_42px_var(--yggdra-shadow)] sm:mb-8 sm:h-14 sm:w-14"
            title={businessTheme.brandName}
          >
            <CalendarDays size={24} />
          </NavLink>

          <nav className="flex flex-1 flex-col items-center gap-2 sm:gap-3">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={({ isActive }) =>
                    [
                      "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 sm:h-14 sm:w-14",
                      isActive
                        ? "bg-[var(--yggdra-primary)] text-[var(--yggdra-primary-text)] shadow-[0_16px_34px_var(--yggdra-shadow)]"
                        : "text-[#4f4f4f] hover:bg-[var(--yggdra-muted)] hover:text-[#171717]",
                    ].join(" ")
                  }
                >
                  <Icon size={21} />
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl text-[#4f4f4f] transition hover:bg-[var(--yggdra-muted)] hover:text-[#171717] sm:mt-5 sm:h-14 sm:w-14"
            title="Sair"
          >
            <LogOut size={22} />
          </button>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-[76px] items-center justify-end gap-3 px-4 sm:min-h-[86px] md:px-8">
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setIsQuickActionsOpen((current) => !current)}
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
                    {quickActionItems.map((item) => {
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
                            <span className="block truncate">{item.label}</span>
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
              className="flex min-w-0 items-center gap-3 rounded-full bg-[var(--yggdra-card)] px-3 py-2 text-sm font-black text-[#171717] shadow-[0_12px_34px_var(--yggdra-shadow)] backdrop-blur-xl transition hover:bg-white"
              title="Minha conta"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--yggdra-primary)] text-xs font-black text-[var(--yggdra-primary-text)]">
                {userLabel.slice(0, 1).toUpperCase()}
              </span>

              <span className="hidden max-w-[170px] truncate sm:block">
                {userLabel}
              </span>
            </Link>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-6 md:px-8 md:pb-7">
            {children ?? <Outlet />}
          </main>
        </section>
      </div>
    </div>
  );
}
