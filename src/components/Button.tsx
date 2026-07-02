import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#121b35] text-white border-[#121b35] hover:bg-[#1c294b] hover:border-[#1c294b]",
  secondary:
    "bg-white/50 text-[#405263] border-white/80 hover:bg-white/75 hover:text-[#f97316]",
  ghost:
    "bg-transparent text-[#506173] border-transparent hover:bg-white/50 hover:text-[#f97316]",
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
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-black transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}