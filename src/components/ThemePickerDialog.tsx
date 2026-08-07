import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";

import {
  colorThemeOptions,
  type ColorThemeId,
} from "../utils/colorTheme";

type ThemePickerDialogProps = {
  eyebrow: string;
  title: string;
  description: string;
  selectedThemeId: ColorThemeId;
  onSelect: (themeId: ColorThemeId) => void;
  onClose: () => void;
  closeLabel?: string;
};

export function ThemePickerDialog({
  eyebrow,
  title,
  description,
  selectedThemeId,
  onSelect,
  onClose,
  closeLabel = "Fechar seleção de tema",
}: ThemePickerDialogProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-3 backdrop-blur-[4px] sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-picker-dialog-title"
        className="relative flex max-h-[92dvh] w-full max-w-[1100px] flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white/95 shadow-[0_36px_120px_rgba(15,23,42,0.32)] backdrop-blur-3xl sm:rounded-[34px]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200/80 px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
              {eyebrow}
            </p>

            <h2
              id="theme-picker-dialog-title"
              className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-[28px]"
            >
              {title}
            </h2>

            <p className="mt-1.5 max-w-3xl text-sm font-semibold leading-5 text-slate-500">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
            aria-label={closeLabel}
            title={closeLabel}
          >
            <X size={21} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6 sm:py-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {colorThemeOptions.map((option) => {
              const isSelected = option.id === selectedThemeId;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelect(option.id)}
                  aria-pressed={isSelected}
                  className={[
                    "group relative min-h-[112px] overflow-hidden rounded-[22px] border p-4 text-left transition-all duration-200",
                    isSelected
                      ? "border-slate-900 bg-slate-50 shadow-[0_14px_34px_rgba(15,23,42,0.14)]"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.10)]",
                  ].join(" ")}
                >
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 w-1.5"
                    style={{ backgroundColor: option.colors[0] }}
                  />

                  <span className="flex h-full flex-col justify-between gap-3 pl-1">
                    <span className="flex items-center justify-between gap-2">
                      <strong className="truncate text-sm font-black text-slate-950">
                        {option.label}
                      </strong>

                      {isSelected ? (
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                          style={{ backgroundColor: option.colors[0] }}
                        >
                          <Check size={14} strokeWidth={3} />
                        </span>
                      ) : null}
                    </span>

                    <span className="block text-xs font-semibold leading-4 text-slate-500">
                      {option.description}
                    </span>

                    <span className="flex shrink-0 -space-x-2">
                      {option.colors.map((color) => (
                        <span
                          key={color}
                          className="h-9 w-9 rounded-full border-2 border-white shadow-sm ring-1 ring-black/5"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}
