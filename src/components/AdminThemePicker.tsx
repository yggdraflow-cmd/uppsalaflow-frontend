import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

import { ThemePickerDialog } from "./ThemePickerDialog";

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
        <ThemePickerDialog
          eyebrow="Aparência do Super Admin"
          title="Escolha o tema"
          description="Esta preferência fica somente neste navegador e não altera os temas escolhidos pelos empresários."
          selectedThemeId={selectedThemeId}
          onSelect={handleThemeChange}
          onClose={() => setIsOpen(false)}
          closeLabel="Fechar seletor de tema do Super Admin"
        />
      ) : null}
    </>
  );
}
