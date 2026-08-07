import {
  Building2,
  Eye,
  EyeOff,
  UserRound,
} from "lucide-react";
import {
  useState,
  type FocusEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";

type AccountType = "business" | "client";

type RegisterPanelProps = {
  accountType: AccountType;
  title: string;
  description: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  error?: string;
  isSaving: boolean;
  submitLabel: string;
  savingLabel: string;
  loginPath: string;
  loginLabel: string;
  clientRegisterPath?: string;
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

const inputClassName = [
  "h-[58px] w-full min-w-0 rounded-xl border border-[#484848]",
  "bg-[#303030] px-3 pb-2 pt-5 text-base font-semibold text-white",
  "outline-none transition placeholder:text-transparent",
  "hover:border-[#5b5b5b] focus:border-[#00bfff]",
  "focus:bg-[#333333] focus:ring-4 focus:ring-[#00bfff]/15",
].join(" ");

function getLabelClassName(isFloating: boolean) {
  return [
    "pointer-events-none absolute left-3 max-w-[calc(100%-24px)] truncate",
    "font-bold leading-none transition-all duration-200",
    isFloating
      ? "top-2 text-[11px] text-[#00bfff]"
      : "top-1/2 -translate-y-1/2 text-sm text-white/50",
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
        className={`${inputClassName} ${className}`.trim()}
        placeholder=" "
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />

      <label className={getLabelClassName(isFloating)} htmlFor={id}>
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
        className={`${inputClassName} pr-12 ${className}`.trim()}
        type={isVisible ? "text" : "password"}
        placeholder=" "
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />

      <label className={getLabelClassName(isFloating)} htmlFor={id}>
        {label}
      </label>

      <button
        type="button"
        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#9a9a9a] transition hover:bg-white/10 hover:text-[#00bfff]"
        onClick={() => setIsVisible((currentValue) => !currentValue)}
        aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
        title={isVisible ? "Ocultar senha" : "Mostrar senha"}
      >
        {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}

export function RegisterPanel({
  accountType,
  title,
  description,
  onSubmit,
  children,
  error,
  isSaving,
  submitLabel,
  savingLabel,
  loginPath,
  loginLabel,
  clientRegisterPath = "/cliente/cadastro",
}: RegisterPanelProps) {
  const businessTabClassName =
    accountType === "business"
      ? "bg-[#00bfff] text-white shadow-[0_8px_20px_rgba(0,191,255,0.22)]"
      : "text-[#a9a9a9] hover:text-white";

  const clientTabClassName =
    accountType === "client"
      ? "bg-[#00bfff] text-white shadow-[0_8px_20px_rgba(0,191,255,0.22)]"
      : "text-[#a9a9a9] hover:text-white";

  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-[#343434] bg-[#191919] p-4 text-white shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-5">
      <div className="pointer-events-none absolute right-[-90px] top-[-120px] h-64 w-64 rounded-full bg-[#00bfff]/10 blur-3xl" />

      <nav
        className="relative mb-5 grid grid-cols-2 gap-1.5 rounded-2xl border border-[#393939] bg-[#242424] p-1.5"
        aria-label="Tipo de cadastro"
      >
        <Link
          to="/register"
          className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-black transition ${businessTabClassName}`}
          aria-current={accountType === "business" ? "page" : undefined}
        >
          <Building2 size={17} />
          Empresa
        </Link>

        <Link
          to={clientRegisterPath}
          className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-black transition ${clientTabClassName}`}
          aria-current={accountType === "client" ? "page" : undefined}
        >
          <UserRound size={17} />
          Cliente
        </Link>
      </nav>

      <header className="relative mb-5">
        <div className="flex items-center gap-3">
          <span className="relative flex h-4 w-4 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00bfff] opacity-70" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-[#00bfff]" />
          </span>

          <h2 className="text-[1.65rem] font-black leading-tight tracking-[-0.045em] text-[#00bfff] sm:text-[1.85rem]">
            {title}
          </h2>
        </div>

        <p className="mt-2.5 text-sm leading-6 text-white/65">
          {description}
        </p>
      </header>

      <form className="relative flex flex-col gap-3" onSubmit={onSubmit}>
        {children}

        {error ? (
          <p
            className="rounded-xl border border-red-400/25 bg-red-950/30 px-3 py-2.5 text-sm leading-5 text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          className="mt-0.5 min-h-11 rounded-xl border-0 bg-[#00bfff] px-4 py-2.5 text-base font-black text-white shadow-[0_10px_24px_rgba(0,191,255,0.20)] transition hover:-translate-y-0.5 hover:bg-[#29c9ff] hover:shadow-[0_13px_28px_rgba(0,191,255,0.26)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? savingLabel : submitLabel}
        </button>
      </form>

      <p className="relative mt-4 text-center text-sm text-white/70">
        Já tem uma conta?{" "}
        <Link
          to={loginPath}
          className="font-black text-[#00bfff] hover:underline"
        >
          {loginLabel}
        </Link>
      </p>
    </section>
  );
}
