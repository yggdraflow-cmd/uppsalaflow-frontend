import { useState, type CSSProperties, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, LogOut, Palette, ShieldCheck, X } from "lucide-react";

import { clearAuthStorage } from "../services/api";
import { getUser } from "../services/authStorage";
import { defaultBusinessTheme } from "../utils/businessTheme";
import {
  applyColorTheme,
  colorThemeOptions,
  getStoredAdminColorThemeId,
  saveAdminColorThemeId,
  type ColorThemeId,
} from "../utils/colorTheme";

type AdminLayoutProps = {
  children: ReactNode;
};

function createAdminStyle(themeId: ColorThemeId): {
  theme: ReturnType<typeof applyColorTheme>;
  style: CSSProperties;
} {
  const theme = applyColorTheme(defaultBusinessTheme, themeId);

  return {
    theme,
    style: {
      "--yggdra-primary": theme.styles.primary,
      "--yggdra-primary-text": theme.styles.primaryText,
      "--yggdra-accent": theme.styles.accent,
      "--yggdra-accent-text": theme.styles.accentText,
      "--yggdra-muted": theme.styles.muted,
      "--yggdra-card": theme.styles.card,
      "--yggdra-sidebar": theme.styles.sidebar,
      "--yggdra-shadow": theme.styles.shadow,
      background: theme.styles.background,
    } as CSSProperties,
  };
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const user = getUser();

  const [selectedThemeId, setSelectedThemeId] = useState<ColorThemeId>(
    getStoredAdminColorThemeId
  );
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  const { theme, style } = createAdminStyle(selectedThemeId);

  function handleLogout() {
    clearAuthStorage();
    navigate("/login");
  }

  function handleThemeChange(themeId: ColorThemeId) {
    setSelectedThemeId(themeId);
    saveAdminColorThemeId(themeId);
  }

  return (
    <div className="min-h-screen p-4 text-[#171717]" style={style}>
      <div
        className="mx-auto min-h-[calc(100vh-32px)] max-w-[1500px] overflow-hidden rounded-[34px] border border-white/80 backdrop-blur-3xl"
        style={{
          background: theme.styles.card,
          boxShadow: `0 30px 100px ${theme.styles.shadow}`,
        }}
      >
        <header className="flex min-h-[88px] items-center justify-between gap-4 border-b border-white/70 px-5 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-[0_18px_42px_rgba(0,0,0,0.22)]"
              style={{
                background: theme.styles.primary,
                color: theme.styles.primaryText,
              }}
            >
              <ShieldCheck size={27} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-[#6a7a89]">
                <span>YggdraFlow</span>
                <span className="h-1 w-1 rounded-full bg-[#aab8c3]" />
                <span style={{ color: theme.styles.primary }}>
                  Admin da plataforma
                </span>
              </div>

              <p className="mt-1 hidden text-xs font-semibold text-[#8a99a6] sm:block">
                Gestão interna de usuários, empresas, planos e pagamentos.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsThemePickerOpen(true)}
              className="flex h-12 items-center gap-2 rounded-2xl border border-white/80 bg-white/55 px-3 text-sm font-bold text-[#555555] shadow-sm backdrop-blur-xl transition hover:text-[#171717] sm:px-4"
              title="Escolher tema do Super Admin"
            >
              <Palette size={20} />
              <span className="hidden sm:inline">Tema</span>
            </button>

            <Link
              to="/admin/account"
              className="hidden rounded-full border border-white/80 bg-white/55 px-5 py-3 text-sm font-bold text-[#171717] shadow-sm backdrop-blur-xl transition hover:text-[#171717] lg:block"
              title="Minha conta"
            >
              {user?.name || user?.email || "Admin"}
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-12 items-center gap-2 rounded-2xl border border-white/80 bg-white/55 px-3 text-sm font-bold text-[#555555] shadow-sm backdrop-blur-xl transition hover:text-[#171717] sm:px-4"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        <main className="px-5 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>

      {isThemePickerOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsThemePickerOpen(false);
            }
          }}
        >
          <section
            className="max-h-[calc(100vh-32px)] w-full max-w-[780px] overflow-y-auto rounded-[30px] border border-white/80 bg-[#f7fafc] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.28)] sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-theme-picker-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#7b7b7b]">
                  Aparência do Super Admin
                </p>
                <h2
                  id="admin-theme-picker-title"
                  className="mt-2 text-2xl font-black tracking-tight text-[#171717]"
                >
                  Escolha o tema
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-medium text-[#737373]">
                  Esta preferência fica apenas neste navegador e não altera os
                  temas escolhidos pelos empresários.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsThemePickerOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#52606d] shadow-sm transition hover:text-[#171717]"
                aria-label="Fechar seletor de tema"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {colorThemeOptions.map((option) => {
                const isSelected = option.id === selectedThemeId;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleThemeChange(option.id)}
                    className="flex min-h-[104px] items-center gap-4 rounded-[24px] border bg-white/75 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    style={
                      isSelected
                        ? {
                            borderColor: theme.styles.primary,
                            background: theme.styles.muted,
                          }
                        : { borderColor: "rgba(0,0,0,0.10)" }
                    }
                  >
                    <span className="flex shrink-0 -space-x-2">
                      {option.colors.map((color) => (
                        <span
                          key={color}
                          className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
                          style={{ background: color }}
                        />
                      ))}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-black text-[#171717]">
                        {option.label}
                        {isSelected ? (
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full"
                            style={{
                              background: theme.styles.primary,
                              color: theme.styles.primaryText,
                            }}
                          >
                            <Check size={15} strokeWidth={3} />
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block text-xs font-medium leading-5 text-[#737373]">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
