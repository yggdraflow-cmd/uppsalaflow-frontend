import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  className?: string;
};

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="block min-w-0">
      <span className="upp-label">{label}</span>

      <input
        className={["upp-input", className].join(" ")}
        {...props}
      />
    </label>
  );
}
