import { useEffect, useState } from "react";
import { Check, Palette, X } from "lucide-react";

import { defaultBusinessTheme } from "../utils/businessTheme";
import {
  applyColorTheme,
  colorThemeOptions,
  getStoredAdminColorThemeId,
  saveAdminColorThemeId,
  type ColorThemeId,
} from "../utils/colorTheme";

const ADMIN_THEME_VARIABLES = [
  "--admin-primary",
  "--admin-primary-text",
  "--admin-accent",
  "--admin-accent-text",
  "--admin-muted",
  "--admin-card",
  "--admin-sidebar",
  "--admin-background",
  "--admin-shadow",
] as const;

function applyAdminTheme(themeId: ColorThemeId) {
  const theme = applyColorTheme(defaultBusinessTheme, themeId);
  const root = document.documentElement;

  root.style.setProperty("--admin-primary", theme.styles.primary);
  root.style.setProperty("--admin-primary-text", theme.styles.primaryText);
  root.style.setProperty("--admin-accent", theme.styles.accent);
  root.style.setProperty("--admin-accent-text", theme.styles.accentText);
  root.style.setProperty("--admin-muted", theme.styles.muted);
  root.style.setProperty("--admin-card", theme.styles.card);
  root.style.setProperty("--admin-sidebar", theme.styles.sidebar);
  root.style.setProperty("--admin-background", theme.styles.background);
  root.style.setProperty("--admin-shadow", theme.styles.shadow);
}

function clearAdminTheme() {
  const root = document.documentElement;

  ADMIN_THEME_VARIABLES.forEach((variable) => {
    root.style.removeProperty(variable);
  });
}

export function AdminThemePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<ColorThemeId>(() =>
    getStoredAdminColorThemeId()
  );

  useEffect(() => {
    applyAdminTheme(selectedThemeId);
  }, [selectedThemeId]);

  useEffect(() => {
    return () => {
      clearAdminTheme();
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleThemeChange(themeId: ColorThemeId) {
    saveAdminColorThemeId(themeId);
    setSelectedThemeId(themeId);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] sm:px-4"
        title="Escolher tema do Super Admin"
      >
        <Palette size={20} />
        <span className="hidden sm:inline">Tema</span>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
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
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                  Aparência do Super Admin
                </p>

                <h2
                  id="admin-theme-picker-title"
                  className="mt-2 text-2xl font-black tracking-tight text-slate-900"
                >
                  Escolha o tema
                </h2>

                <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
                  Esta preferência fica apenas neste navegador e não altera os
                  temas escolhidos pelos empresários.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:text-slate-900"
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
                    className="flex min-h-[104px] items-center gap-4 rounded-[24px] border bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    style={
                      isSelected
                        ? {
                            borderColor: option.colors[0],
                            background: option.colors[2],
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
                      <span className="flex items-center gap-2 text-sm font-black text-slate-900">
                        {option.label}

                        {isSelected ? (
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                            style={{ background: option.colors[0] }}
                          >
                            <Check size={15} strokeWidth={3} />
                          </span>
                        ) : null}
                      </span>

                      <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">
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
    </>
  );
}
