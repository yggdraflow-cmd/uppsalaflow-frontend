import type { ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Scissors,
  Settings,
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
  {
    label: "Configurações",
    path: "/settings",
    icon: Settings,
  },
];

function getStoredUserLabel() {
  const rawUser =
    localStorage.getItem("@uppsalaflow:user") || localStorage.getItem("user");

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
    <div className="min-h-screen bg-[#e9eef1] p-4 text-[#111827]">
      <div className="mx-auto flex min-h-[calc(100vh-32px)] max-w-[1540px] overflow-hidden rounded-[34px] border border-white/80 bg-white/25 shadow-[0_28px_90px_rgba(15,23,42,0.16)] backdrop-blur-3xl">
        <aside className="hidden w-[282px] shrink-0 flex-col border-r border-white/70 bg-white/62 px-5 py-6 backdrop-blur-2xl lg:flex">
          <NavLink
            to="/dashboard"
            className="mb-10 flex items-center gap-3 rounded-[26px] bg-white px-4 py-4 text-[#111827] shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
            title="Uppsalaflow"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111827] text-white">
              <CalendarDays size={25} />
            </span>

            <div>
              <strong className="block text-base font-black tracking-tight">
                Uppsalaflow
              </strong>
              <span className="text-xs font-bold text-[#7a8794]">
                Gestão de beleza
              </span>
            </div>
          </NavLink>

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
                        ? "bg-[#111827] text-white shadow-[0_16px_34px_rgba(15,23,42,0.18)]"
                        : "text-[#536273] hover:bg-white/80 hover:text-[#f97316]",
                    ].join(" ")
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-[#536273] transition hover:bg-white/80 hover:text-[#f97316]"
            title="Sair"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </aside>

        <aside className="flex w-[86px] shrink-0 flex-col items-center border-r border-white/70 bg-white/62 px-3 py-5 backdrop-blur-2xl lg:hidden">
          <NavLink
            to="/dashboard"
            className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111827] text-white shadow-[0_18px_42px_rgba(15,23,42,0.20)]"
            title="Uppsalaflow"
          >
            <CalendarDays size={25} />
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
                      "flex h-13 w-13 items-center justify-center rounded-2xl p-4 transition-all duration-200",
                      isActive
                        ? "bg-[#111827] text-white shadow-[0_16px_34px_rgba(15,23,42,0.18)]"
                        : "text-[#536273] hover:bg-white/80 hover:text-[#f97316]",
                    ].join(" ")
                  }
                >
                  <Icon size={22} />
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 flex h-13 w-13 items-center justify-center rounded-2xl p-4 text-[#536273] transition hover:bg-white/80 hover:text-[#f97316]"
            title="Sair"
          >
            <LogOut size={22} />
          </button>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-[88px] items-center justify-between border-b border-white/70 bg-white/24 px-6 backdrop-blur-2xl md:px-8">
            <div>
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.22em] text-[#7a8794]">
                <span>Uppsalaflow</span>
                <span className="h-1 w-1 rounded-full bg-[#aab8c3]" />
                <span className="text-[#111827]">Painel interno</span>
              </div>

              <p className="mt-2 hidden text-sm font-medium text-[#718196] sm:block">
                Operação, agenda e clientes em um só lugar.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/70 text-[#111827] shadow-sm backdrop-blur-xl"
                title="Notificações em breve"
              >
                <Bell size={21} />
              </div>

              <Link
                to="/account"
                className="hidden items-center gap-3 rounded-full border border-white/80 bg-white/70 px-4 py-2.5 text-sm font-black text-[#111827] shadow-sm backdrop-blur-xl transition hover:text-[#f97316] sm:flex"
                title="Minha conta"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111827] text-xs font-black text-white">
                  {userLabel.slice(0, 1).toUpperCase()}
                </span>

                <span className="max-w-[180px] truncate">{userLabel}</span>
              </Link>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto px-5 py-7 md:px-8">
            {children ?? <Outlet />}
          </main>
        </section>
      </div>
    </div>
  );
}
