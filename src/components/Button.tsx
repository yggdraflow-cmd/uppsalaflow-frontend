import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-[var(--yggdra-primary,#171717)] bg-[var(--yggdra-primary,#171717)] text-[var(--yggdra-primary-text,#ffffff)] hover:opacity-90",
  secondary:
    "border-[#d7d7d7] bg-white text-[#171717] hover:bg-[var(--yggdra-muted,#f3f3f3)]",
  ghost:
    "border-transparent bg-transparent text-[#555555] shadow-none hover:bg-[var(--yggdra-muted,#f3f3f3)] hover:text-[#171717]",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={[
        "inline-flex min-h-12 items-center justify-center gap-2",
        "rounded-2xl border px-5 py-3 text-sm font-black",
        "shadow-[0_10px_24px_var(--yggdra-shadow,rgba(0,0,0,0.06))]",
        "transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
