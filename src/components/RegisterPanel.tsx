import { Building2, Eye, EyeOff, UserRound } from "lucide-react";
import {
  createContext,
  useContext,
  useState,
  type FocusEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";

type AccountType = "business" | "client";
type RegisterTheme = "business" | "client";

type RegisterPanelProps = {
  accountType: AccountType;
  theme: RegisterTheme;
  title: string;
  description: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  error?: string;
  success?: string;
  isSaving: boolean;
  submitLabel: string;
  savingLabel: string;
  loginPath: string;
  loginLabel: string;
  clientRegisterPath?: string;
  businessPath?: string;
  clientPath?: string;
  footerText?: string;
};

type FloatingInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
};

const RegisterThemeContext = createContext<RegisterTheme>("business");

const themes = {
  business: {
    panel:
      "border-white/10 bg-[rgba(18,18,18,0.94)] text-white shadow-[0_26px_70px_rgba(0,0,0,0.42)]",
    tabs: "border-white/10 bg-[#292929]",
    activeTab:
      "bg-[#00bfff] text-white shadow-[0_7px_18px_rgba(0,191,255,0.25)]",
    inactiveTab: "text-[#aaaaaa] hover:bg-white/5 hover:text-white",
    title: "text-[#00bfff]",
    description: "text-white/70",
    dot: "bg-[#00bfff]",
    input:
      "border-[#4c4c4c] bg-[#303030] text-white hover:border-[#606060] focus:border-[#00bfff] focus:bg-[#343434] focus:ring-[#00bfff]/15",
    label: "text-white/50",
    floatingLabel: "text-[#00bfff]",
    eye: "text-[#999999] hover:bg-white/10 hover:text-[#00bfff]",
    submit:
      "bg-[#00bfff] text-white shadow-[0_8px_20px_rgba(0,191,255,0.22)] hover:bg-[#29c8ff]",
    footer: "text-white/70",
    link: "text-[#00bfff]",
    error: "border-red-400/25 bg-red-950/30 text-red-200",
    success: "border-emerald-400/25 bg-emerald-950/30 text-emerald-200",
  },
  client: {
    panel:
      "border-[#e3d8c1] bg-[rgba(255,255,255,0.96)] text-[#292929] shadow-[0_26px_70px_rgba(77,52,8,0.22)]",
    tabs: "border-[#ded4bf] bg-[#eeeeee]",
    activeTab:
      "bg-[#c89a2b] text-white shadow-[0_7px_18px_rgba(200,154,43,0.28)]",
    inactiveTab:
      "text-[#6d6d6d] hover:bg-white hover:text-[#8a6818]",
    title: "text-[#b88717]",
    description: "text-[#666666]",
    dot: "bg-[#c89a2b]",
    input:
      "border-[#d0d0d0] bg-[#eeeeee] text-[#292929] hover:border-[#bbbbbb] focus:border-[#c89a2b] focus:bg-white focus:ring-[#c89a2b]/15",
    label: "text-[#777777]",
    floatingLabel: "text-[#a97c12]",
    eye: "text-[#888888] hover:bg-black/5 hover:text-[#a97c12]",
    submit:
      "bg-[#c89a2b] text-white shadow-[0_8px_20px_rgba(200,154,43,0.25)] hover:bg-[#d5a83b]",
    footer: "text-[#666666]",
    link: "text-[#a97c12]",
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
} as const;

function useRegisterTheme() {
  return useContext(RegisterThemeContext);
}

function getLabelClassName(
  theme: RegisterTheme,
  isFloating: boolean
) {
  const currentTheme = themes[theme];

  return [
    "pointer-events-none absolute left-3 max-w-[calc(100%-24px)] truncate",
    "font-bold leading-none transition-all duration-200",
    isFloating
      ? `top-[7px] text-[10px] ${currentTheme.floatingLabel}`
      : `top-1/2 -translate-y-1/2 text-sm ${currentTheme.label}`,
  ].join(" ");
}

export function FloatingInput({
  label,
  id,
  className = "",
  value,
  onFocus,
  onBlur,
  ...props
}: FloatingInputProps) {
  const theme = useRegisterTheme();
  const currentTheme = themes[theme];

  const [isFocused, setIsFocused] = useState(false);

  const hasValue = value !== undefined && String(value).length > 0;
  const isFloating = isFocused || hasValue;

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    setIsFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setIsFocused(false);
    onBlur?.(event);
  }

  return (
    <div className="relative min-w-0">
      <input
        id={id}
        className={[
          "h-[50px] w-full min-w-0 rounded-xl border px-3 pb-1.5 pt-4",
          "text-sm font-semibold outline-none transition",
          "placeholder:text-transparent focus:ring-4",
          currentTheme.input,
          className,
        ].join(" ")}
        placeholder=" "
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />

      <label className={getLabelClassName(theme, isFloating)} htmlFor={id}>
        {label}
      </label>
    </div>
  );
}

export function PasswordInput({
  label,
  id,
  className = "",
  value,
  onFocus,
  onBlur,
  ...props
}: PasswordInputProps) {
  const theme = useRegisterTheme();
  const currentTheme = themes[theme];

  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = value !== undefined && String(value).length > 0;
  const isFloating = isFocused || hasValue;

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    setIsFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setIsFocused(false);
    onBlur?.(event);
  }

  return (
    <div className="relative min-w-0">
      <input
        id={id}
        className={[
          "h-[50px] w-full min-w-0 rounded-xl border px-3 pb-1.5 pt-4 pr-12",
          "text-sm font-semibold outline-none transition",
          "placeholder:text-transparent focus:ring-4",
          currentTheme.input,
          className,
        ].join(" ")}
        type={isVisible ? "text" : "password"}
        placeholder=" "
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />

      <label className={getLabelClassName(theme, isFloating)} htmlFor={id}>
        {label}
      </label>

      <button
        type="button"
        className={[
          "absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2",
          "items-center justify-center rounded-lg transition",
          currentTheme.eye,
        ].join(" ")}
        onClick={() => setIsVisible((currentValue) => !currentValue)}
        aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
        title={isVisible ? "Ocultar senha" : "Mostrar senha"}
      >
        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function RegisterPanel({
  accountType,
  theme,
  title,
  description,
  onSubmit,
  children,
  error,
  success,
  isSaving,
  submitLabel,
  savingLabel,
  loginPath,
  loginLabel,
  clientRegisterPath = "/cliente/cadastro",
  businessPath = "/register",
  clientPath = clientRegisterPath,
  footerText = "Já tem uma conta?",
}: RegisterPanelProps) {
  const currentTheme = themes[theme];

  return (
    <RegisterThemeContext.Provider value={theme}>
      <section
        className={[
          "relative w-full overflow-hidden rounded-[26px] border p-3.5 backdrop-blur-md sm:p-4",
          currentTheme.panel,
        ].join(" ")}
      >
        <nav
          className={[
            "mb-3 grid grid-cols-2 gap-1.5 rounded-2xl border p-1.5",
            currentTheme.tabs,
          ].join(" ")}
          aria-label="Tipo de cadastro"
        >
          <Link
            to={businessPath}
            className={[
              "flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2",
              "text-sm font-black transition",
              accountType === "business"
                ? currentTheme.activeTab
                : currentTheme.inactiveTab,
            ].join(" ")}
            aria-current={accountType === "business" ? "page" : undefined}
          >
            <Building2 size={16} />
            Empresa
          </Link>

          <Link
            to={clientPath}
            className={[
              "flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2",
              "text-sm font-black transition",
              accountType === "client"
                ? currentTheme.activeTab
                : currentTheme.inactiveTab,
            ].join(" ")}
            aria-current={accountType === "client" ? "page" : undefined}
          >
            <UserRound size={16} />
            Cliente
          </Link>
        </nav>

        <header className="mb-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span
                className={[
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                  currentTheme.dot,
                ].join(" ")}
              />

              <span
                className={[
                  "relative inline-flex h-3.5 w-3.5 rounded-full",
                  currentTheme.dot,
                ].join(" ")}
              />
            </span>

            <h2
              className={[
                "text-[1.45rem] font-black leading-tight tracking-[-0.04em] sm:text-[1.6rem]",
                currentTheme.title,
              ].join(" ")}
            >
              {title}
            </h2>
          </div>

          <p
            className={[
              "mt-1.5 text-xs leading-5 sm:text-[13px]",
              currentTheme.description,
            ].join(" ")}
          >
            {description}
          </p>
        </header>

        <form className="flex flex-col gap-2" onSubmit={onSubmit}>
          {children}

          {success ? (
            <p
              className={[
                "rounded-xl border px-3 py-2 text-xs leading-5",
                currentTheme.success,
              ].join(" ")}
              role="status"
            >
              {success}
            </p>
          ) : null}

          {error ? (
            <p
              className={[
                "rounded-xl border px-3 py-2 text-xs leading-5",
                currentTheme.error,
              ].join(" ")}
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            className={[
              "mt-0.5 min-h-10 rounded-xl border-0 px-4 py-2",
              "text-sm font-black transition hover:-translate-y-0.5",
              "disabled:cursor-not-allowed disabled:opacity-60",
              "disabled:hover:translate-y-0",
              currentTheme.submit,
            ].join(" ")}
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? savingLabel : submitLabel}
          </button>
        </form>

        <p
          className={[
            "mt-3 text-center text-xs",
            currentTheme.footer,
          ].join(" ")}
        >
          {footerText}{" "}
          <Link
            to={loginPath}
            className={[
              "font-black hover:underline",
              currentTheme.link,
            ].join(" ")}
          >
            {loginLabel}
          </Link>
        </p>
      </section>
    </RegisterThemeContext.Provider>
  );
}
