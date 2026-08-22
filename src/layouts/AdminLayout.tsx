import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  ChevronDown,
  CircleDollarSign,
  Globe2,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
  UsersRound,
  Wrench,
} from "lucide-react";

import {
  clearAuthStorage,
  getApiAssetUrl,
} from "../services/api";
import { getUser } from "../services/authStorage";

type AdminLayoutProps = {
  children: ReactNode;
};

type AdminTheme = "dark" | "light";

const ADMIN_THEME_STORAGE_KEY = "@yggdraflow:admin-theme";

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

function getStoredAdminTheme(): AdminTheme {
  const storedTheme = localStorage.getItem(
    ADMIN_THEME_STORAGE_KEY
  );

  return storedTheme === "light" ? "light" : "dark";
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => getUser());
  const [theme, setTheme] = useState<AdminTheme>(
    getStoredAdminTheme
  );

  const searchParams = new URLSearchParams(location.search);

  const currentView =
    searchParams.get("view") || "overview";

  const currentSection =
    searchParams.get("section") || "about";

  const [isYggdraTechOpen, setIsYggdraTechOpen] =
    useState(currentView === "yggdratech");

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

  useEffect(() => {
    localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme);
  }, [theme]);

  function handleThemeToggle() {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  }

  function handleLogout() {
    clearAuthStorage();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div
      className="admin-dashboard-shell"
      data-admin-theme={theme}
    >
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

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setIsYggdraTechOpen((current) => !current)
                }
                className={[
                  "admin-dashboard-nav-link",
                  currentView === "yggdratech"
                    ? "is-active"
                    : "",
                ].join(" ")}
                aria-expanded={isYggdraTechOpen}
              >
                <Globe2 size={16} />
                <span>Site YggdraTech</span>
                <ChevronDown
                  size={15}
                  className={[
                    "ml-auto transition-transform",
                    isYggdraTechOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>

              {isYggdraTechOpen ? (
                <div className="admin-dashboard-yggdratech-submenu absolute left-0 top-full z-50 mt-2 grid min-w-[190px] gap-1 rounded-2xl p-2 shadow-xl backdrop-blur">
                  <Link
                    to="/admin?view=yggdratech&section=home"
                    className={[
                      "admin-dashboard-nav-link",
                      currentView === "yggdratech" &&
                      currentSection === "home"
                        ? "is-active"
                        : "",
                    ].join(" ")}
                  >
                    <Home size={15} />
                    <span>Home</span>
                  </Link>

                  <Link
                    to="/admin?view=yggdratech&section=about"
                    className={[
                      "admin-dashboard-nav-link",
                      currentView === "yggdratech" &&
                      currentSection === "about"
                        ? "is-active"
                        : "",
                    ].join(" ")}
                  >
                    <UsersRound size={15} />
                    <span>Quem Somos</span>
                  </Link>

                  <Link
                    to="/admin?view=yggdratech&section=services"
                    className={[
                      "admin-dashboard-nav-link",
                      currentView === "yggdratech" &&
                      currentSection === "services"
                        ? "is-active"
                        : "",
                    ].join(" ")}
                  >
                    <Wrench size={15} />
                    <span>Serviços</span>
                  </Link>
                </div>
              ) : null}
            </div>
          </nav>

          <div className="admin-dashboard-actions">
            <button
              type="button"
              onClick={handleThemeToggle}
              className="admin-dashboard-theme-toggle"
              title={
                theme === "dark"
                  ? "Usar tema claro"
                  : "Usar tema escuro"
              }
              aria-label={
                theme === "dark"
                  ? "Ativar tema claro"
                  : "Ativar tema escuro"
              }
            >
              {theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

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
