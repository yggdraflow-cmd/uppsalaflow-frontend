import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-[#171717] bg-[#171717] text-white hover:bg-black hover:border-black",
  secondary:
    "border-[#d7d7d7] bg-white/85 text-[#171717] hover:bg-[#f2f2f2]",
  ghost:
    "border-transparent bg-transparent text-[#444] hover:bg-white/70 hover:text-[#171717]",
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
        "inline-flex h-13 min-h-13 items-center justify-center gap-2",
        "rounded-2xl border px-5 text-sm font-black",
        "shadow-[0_10px_24px_rgba(0,0,0,0.06)] transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
