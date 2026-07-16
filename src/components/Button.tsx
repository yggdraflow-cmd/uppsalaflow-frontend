import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-[#171717] bg-[#171717] text-white hover:border-black hover:bg-black",
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
        "inline-flex min-h-12 min-w-0 max-w-full items-center justify-center gap-2",
        "h-auto whitespace-normal rounded-2xl border px-4 py-3 text-center",
        "text-sm font-black leading-5 shadow-[0_10px_24px_rgba(0,0,0,0.06)]",
        "transition-all duration-200 sm:min-h-[52px] sm:px-5",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "[&>svg]:shrink-0",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
