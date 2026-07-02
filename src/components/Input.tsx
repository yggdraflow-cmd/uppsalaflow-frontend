import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  className?: string;
};

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="block">
      <span className="upp-label">{label}</span>

      <input className={`upp-input ${className}`} {...props} />
    </label>
  );
}