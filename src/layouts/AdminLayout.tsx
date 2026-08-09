import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  CircleDollarSign,
  LayoutDashboard,
  ListChecks,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  clearAuthStorage,
  getApiAssetUrl,
} from "../services/api";
import { getUser } from "../services/authStorage";

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
    <div className="admin-dashboard-shell">
      <div className="admin-dashboard-window">
        <header className="admin-dashboard-navbar">
          <Link
            to="/admin?view=overview"
            className="admin-dashboard-brand"
          >
            <span className="admin-dashboard-brand-icon">
              <ShieldCheck size={22} />
            </span>

            <span>
              <strong>YggdraFlow</strong>
              <small>Super Admin</small>
            </span>
          </Link>

          <nav className="admin-dashboard-nav">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;

              return (
                <Link
                  key={item.view}
                  to={item.to}
                  className={[
                    "admin-dashboard-nav-link",
                    isActive ? "is-active" : "",
                  ].join(" ")}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="admin-dashboard-actions">
            <Link
              to="/admin/account"
              className="admin-dashboard-profile"
              title="Minha conta"
            >
              <span className="admin-dashboard-avatar">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={user?.name || "Foto do administrador"}
                  />
                ) : (
                  <UserRound size={17} />
                )}
              </span>

              <span className="admin-dashboard-profile-copy">
                <strong>{user?.name || "Administrador"}</strong>
                <small>{user?.email || "Conta administrativa"}</small>
              </span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="admin-dashboard-logout"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="admin-dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}
