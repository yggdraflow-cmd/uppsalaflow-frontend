import type { ReactNode } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { clearAuthStorage } from "../services/api";
import { getUser } from "../services/authStorage";

type AdminLayoutProps = {
  children: ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    clearAuthStorage();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#e8f0f3] p-4 text-[#132033]">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-[1500px] overflow-hidden rounded-[34px] border border-white/80 bg-white/32 shadow-[0_30px_100px_rgba(55,73,89,0.18)] backdrop-blur-3xl">
        <header className="flex h-[88px] items-center justify-between border-b border-white/70 px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#121b35] text-white shadow-[0_18px_42px_rgba(18,27,53,0.22)]">
              <ShieldCheck size={27} />
            </div>

            <div>
              <div className="flex items-center gap-3 text-sm font-bold text-[#6a7a89]">
                <span>Uppsalaflow</span>
                <span className="h-1 w-1 rounded-full bg-[#aab8c3]" />
                <span className="text-[#132033]">Admin da plataforma</span>
              </div>

              <p className="mt-1 text-xs font-semibold text-[#8a99a6]">
                Gestão interna de usuários, empresas, planos e pagamentos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-white/80 bg-white/45 px-5 py-3 text-sm font-bold text-[#132033] shadow-sm backdrop-blur-xl sm:block">
              {user?.name || user?.email || "Admin"}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-12 items-center gap-2 rounded-2xl border border-white/80 bg-white/45 px-4 text-sm font-bold text-[#506173] shadow-sm backdrop-blur-xl transition hover:text-[#f97316]"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </header>

        <main className="px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
