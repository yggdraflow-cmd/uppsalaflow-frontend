import { CalendarDays, LayoutDashboard, LogOut, Scissors, Store, Users } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../services/authStorage";

type AppLayoutProps = {
  children: ReactNode;
};

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/businesses", label: "Negócio", icon: Store },
  { to: "/clients", label: "Clientes", icon: Users },
  { to: "/services", label: "Serviços", icon: Scissors },
  { to: "/professionals", label: "Profissionais", icon: Users },
  { to: "/appointments", label: "Agenda", icon: CalendarDays },
];

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-zinc-200 bg-white p-5 lg:block">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-beauty-600">
            Uppsalaflow
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            {user?.name || "Usuário"}
          </p>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-beauty-50 text-beauty-700"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-5 left-5 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
        >
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      <main className="min-h-screen p-4 lg:ml-64 lg:p-8">
        {children}
      </main>
    </div>
  );
}
