import type { ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { CalendarDays, LogOut, PlusCircle, UserRound } from "lucide-react";

import { clearAuthStorage } from "../services/api";
import { getUser } from "../services/authStorage";

type ClientPortalLayoutProps = {
  children?: ReactNode;
};

export function ClientPortalLayout({ children }: ClientPortalLayoutProps) {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    clearAuthStorage();
    navigate("/cliente/login");
  }

  return (
    <div className="min-h-screen bg-[#e8f0f3] p-4 text-[#132033]">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-[1200px] overflow-hidden rounded-[34px] border border-white/80 bg-white/32 shadow-[0_30px_100px_rgba(55,73,89,0.18)] backdrop-blur-3xl">
        <header className="flex flex-col gap-5 border-b border-white/70 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-4">
            <Link
              to="/cliente/agendamentos"
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#121b35] text-white shadow-[0_18px_42px_rgba(18,27,53,0.22)]"
              title="Uppsalaflow"
            >
              <CalendarDays size={27} />
            </Link>

            <div>
              <div className="flex items-center gap-3 text-sm font-bold text-[#6a7a89]">
                <span>Uppsalaflow</span>
                <span className="h-1 w-1 rounded-full bg-[#aab8c3]" />
                <span className="text-[#132033]">Portal do cliente</span>
              </div>

              <p className="mt-1 text-xs font-semibold text-[#8a99a6]">
                Acompanhe seus horários, serviços e atendimentos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/agendar/salao-da-mayara"
              className="inline-flex items-center gap-2 rounded-full border border-[#121b35] bg-[#121b35] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1c294b]"
            >
              <PlusCircle size={18} />
              Agendar horário
            </Link>

            <NavLink
              to="/cliente/agendamentos"
              className={({ isActive }) =>
                [
                  "rounded-full border px-5 py-3 text-sm font-bold shadow-sm backdrop-blur-xl transition",
                  isActive
                    ? "border-[#121b35] bg-[#121b35] text-white"
                    : "border-white/80 bg-white/45 text-[#506173] hover:text-[#f97316]",
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
                    ? "border-[#121b35] bg-[#121b35] text-white"
                    : "border-white/80 bg-white/45 text-[#506173] hover:text-[#f97316]",
                ].join(" ")
              }
            >
              <UserRound size={18} />
              {user?.name || "Minha conta"}
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/45 px-5 py-3 text-sm font-bold text-[#506173] shadow-sm backdrop-blur-xl transition hover:text-[#f97316]"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </header>

        <main className="px-6 py-8 md:px-8">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
