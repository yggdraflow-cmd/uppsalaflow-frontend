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

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const userLabel = getStoredUserLabel();

  function handleLogout() {
    clearAuthStorage();
    navigate("/login");
  }

  return (
    <div
      className="min-h-screen p-5 text-[#171717]"
      style={{
        background:
          "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.95), transparent 28%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.7), transparent 30%), linear-gradient(135deg, #d7d7d7 0%, #eeeeee 45%, #cfd4d6 100%)",
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-[1540px] overflow-hidden rounded-[34px] border border-white/80 bg-white/20 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-3xl">
        <aside className="m-5 hidden w-[255px] shrink-0 flex-col rounded-[32px] bg-white/88 px-5 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.10)] backdrop-blur-2xl lg:flex">
          <Link
            to="/dashboard"
            className="mb-10 flex items-center gap-3 px-2"
            title="YggdraFlow"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171717] text-white">
              <CalendarDays size={24} />
            </span>

            <div>
              <strong className="block text-lg font-black tracking-tight text-[#171717]">
                YggdraFlow
              </strong>
              <span className="text-xs font-bold text-[#7a7a7a]">
                Gestão de beleza
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
                        ? "bg-[#171717] text-white shadow-[0_18px_38px_rgba(0,0,0,0.22)]"
                        : "text-[#4f4f4f] hover:bg-[#f2f2f2] hover:text-[#171717]",
                    ].join(" ")
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-[#4f4f4f] transition hover:bg-[#f2f2f2] hover:text-[#171717]"
            title="Sair"
          >
            <LogOut size={19} />
            <span>Sair</span>
          </button>
        </aside>

        <aside className="flex w-[82px] shrink-0 flex-col items-center bg-white/80 px-3 py-5 backdrop-blur-2xl lg:hidden">
          <NavLink
            to="/dashboard"
            className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171717] text-white shadow-[0_18px_42px_rgba(0,0,0,0.22)]"
            title="YggdraFlow"
          >
            <CalendarDays size={24} />
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
                        ? "bg-[#171717] text-white shadow-[0_16px_34px_rgba(0,0,0,0.18)]"
                        : "text-[#4f4f4f] hover:bg-[#f2f2f2] hover:text-[#171717]",
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
            className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl text-[#4f4f4f] transition hover:bg-[#f2f2f2] hover:text-[#171717]"
            title="Sair"
          >
            <LogOut size={22} />
          </button>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-[86px] items-center justify-end gap-3 px-6 md:px-8">
            <button
              type="button"
              className="hidden rounded-full bg-[#171717] px-5 py-3 text-xs font-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.22)] md:block"
              title="Ação rápida em breve"
            >
              + Criar
            </button>

            <div
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/88 text-[#171717] shadow-[0_12px_34px_rgba(0,0,0,0.10)] backdrop-blur-xl"
              title="Notificações em breve"
            >
              <Bell size={21} />
            </div>

            <Link
              to="/account"
              className="flex items-center gap-3 rounded-full bg-white/88 px-3 py-2 text-sm font-black text-[#171717] shadow-[0_12px_34px_rgba(0,0,0,0.10)] backdrop-blur-xl transition hover:bg-white"
              title="Minha conta"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#171717] text-xs font-black text-white">
                {userLabel.slice(0, 1).toUpperCase()}
              </span>

              <span className="hidden max-w-[170px] truncate sm:block">
                {userLabel}
              </span>
            </Link>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto px-5 pb-7 md:px-8">
            {children ?? <Outlet />}
          </main>
        </section>
      </div>
    </div>
  );
}
