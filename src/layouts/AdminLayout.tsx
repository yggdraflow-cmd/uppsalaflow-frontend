import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  CircleDollarSign,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  clearAuthStorage,
  getApiAssetUrl,
} from "../services/api";
import { getUser } from "../services/authStorage";
import { AdminThemePicker } from "../components/AdminThemePicker";

type AdminLayoutProps = {
  children: ReactNode;
};

const navigationItems = [
  {
    label: "Visão geral",
    to: "/admin?view=overview",
    view: "overview",
    icon: LayoutDashboard,
  },
  {
    label: "Empresas",
    to: "/admin?view=businesses",
    view: "businesses",
    icon: Building2,
  },
  {
    label: "Aprovações",
    to: "/admin?view=approvals",
    view: "approvals",
    icon: ListChecks,
  },
  {
    label: "Pagamentos",
    to: "/admin?view=payments",
    view: "payments",
    icon: CircleDollarSign,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => getUser());

  const currentView =
    new URLSearchParams(location.search).get("view") || "overview";

  const profileImageUrl = getApiAssetUrl(user?.profileImageUrl);

  useEffect(() => {
    function synchronizeUser() {
      setUser(getUser());
    }

    window.addEventListener(
      "yggdraflow:user-updated",
      synchronizeUser
    );

    window.addEventListener("storage", synchronizeUser);

    return () => {
      window.removeEventListener(
        "yggdraflow:user-updated",
        synchronizeUser
      );

      window.removeEventListener("storage", synchronizeUser);
    };
  }, []);

  function handleLogout() {
    clearAuthStorage();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="admin-premium-shell min-h-screen p-3 text-[#17222b] sm:p-4">
      <div className="admin-premium-frame mx-auto min-h-[calc(100vh-24px)] max-w-[1600px] overflow-hidden rounded-[28px] border border-white/90 bg-white/65 shadow-[0_28px_90px_rgba(25,45,55,0.16)] backdrop-blur-3xl sm:min-h-[calc(100vh-32px)] sm:rounded-[34px]">
        <div className="grid min-h-[calc(100vh-24px)] lg:grid-cols-[270px_minmax(0,1fr)] sm:min-h-[calc(100vh-32px)]">
          <aside className="admin-premium-sidebar border-b border-slate-200/80 p-5 text-white lg:border-b-0 lg:border-r lg:border-white/10 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="admin-premium-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--admin-primary)] shadow-lg">
                <ShieldCheck size={25} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-lg font-black tracking-tight">
                  YggdraFlow
                </p>

                <p className="text-xs font-semibold text-slate-300">
                  Super Admin da plataforma
                </p>
              </div>
            </div>

            <nav className="admin-premium-nav mt-6 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;

                return (
                  <Link
                    key={item.view}
                    to={item.to}
                    className={[
                      "admin-premium-nav-link flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition",
                      isActive
                        ? "bg-white text-[var(--admin-primary)] shadow-lg"
                        : "text-slate-300 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    <Icon size={19} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 hidden border-t border-white/10 pt-6 lg:block">
              <Link
                to="/admin/account"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <Settings size={19} />
                Minha conta
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-red-500/15 hover:text-red-100"
              >
                <LogOut size={19} />
                Sair
              </button>
            </div>
          </aside>

          <div className="min-w-0">
            <header className="admin-premium-topbar flex min-h-[82px] items-center justify-between gap-4 border-b border-slate-200/80 px-5 py-4 sm:px-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-primary)]">
                  Operação central
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Empresas, pagamentos e liberações.
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <AdminThemePicker />

                <Link
                  to="/admin/account"
                  className="admin-premium-profile flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300 sm:px-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--admin-muted)] text-[var(--admin-primary)]">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={user?.name || "Foto do administrador"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound size={18} />
                    )}
                  </span>

                  <span className="hidden min-w-0 text-left sm:block">
                    <strong className="block max-w-40 truncate text-sm text-slate-900">
                      {user?.name || "Administrador"}
                    </strong>

                    <span className="block max-w-40 truncate text-xs text-slate-500">
                      {user?.email || "Conta administrativa"}
                    </span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-red-200 hover:text-red-600 lg:hidden"
                  title="Sair"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </header>

            <main className="admin-premium-content min-w-0 px-5 py-6 sm:px-8 sm:py-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
