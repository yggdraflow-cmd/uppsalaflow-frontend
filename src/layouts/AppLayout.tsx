import type { ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Scissors,
  UserRound,
  Users,
} from "lucide-react";

import { clearAuthStorage } from "../services/api";

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
];

function getStoredUserLabel() {
  const rawUser =
    localStorage.getItem("@uppsalaflow:user") ||
    localStorage.getItem("user");

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

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const userLabel = getStoredUserLabel();

  function handleLogout() {
    clearAuthStorage();
    navigate("/login");
  }

  return (
    <div className="app-shell min-h-screen p-4 text-[#132033]">
      <div className="mx-auto flex min-h-[calc(100vh-32px)] max-w-[1500px] overflow-hidden rounded-[34px] border border-white/80 bg-white/28 shadow-[0_30px_100px_rgba(55,73,89,0.18)] backdrop-blur-3xl">
        <aside className="flex w-[92px] shrink-0 flex-col items-center border-r border-white/70 bg-white/45 px-3 py-5 backdrop-blur-2xl">
          <NavLink
            to="/dashboard"
            className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#121b35] text-white shadow-[0_18px_42px_rgba(18,27,53,0.22)]"
            title="Uppsalaflow"
          >
            <CalendarDays size={28} />
          </NavLink>

          <nav className="flex flex-1 flex-col items-center gap-3">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={({ isActive }) =>
                    [
                      "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200",
                      isActive
                        ? "bg-[#121b35] text-white shadow-[0_16px_34px_rgba(18,27,53,0.20)]"
                        : "text-[#506173] hover:bg-white/70 hover:text-[#f97316]",
                    ].join(" ")
                  }
                >
                  <Icon size={24} />
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl text-[#506173] transition hover:bg-white/70 hover:text-[#f97316]"
            title="Sair"
          >
            <LogOut size={23} />
          </button>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[88px] items-center justify-between border-b border-white/70 px-8">
            <div>
              <div className="flex items-center gap-3 text-sm font-bold text-[#6a7a89]">
                <span>Uppsalaflow</span>
                <span className="h-1 w-1 rounded-full bg-[#aab8c3]" />
                <span className="text-[#132033]">Painel interno</span>
              </div>

              <p className="mt-1 text-xs font-semibold text-[#8a99a6]">
                Gestão para negócios de estilo, cuidado e beleza.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/45 text-[#506173] shadow-sm backdrop-blur-xl"
                title="Notificações em breve"
              >
                <Bell size={22} />
              </div>

              <Link
                to="/account"
                className="hidden rounded-full border border-white/80 bg-white/45 px-5 py-3 text-sm font-bold text-[#132033] shadow-sm backdrop-blur-xl transition hover:text-[#f97316] sm:block"
                title="Minha conta"
              >
                {userLabel}
              </Link>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto px-8 py-8">
            {children ?? <Outlet />}
          </main>
        </section>
      </div>
    </div>
  );
}
