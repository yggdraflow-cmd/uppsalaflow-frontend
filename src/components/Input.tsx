import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  className?: string;
};

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-[#444]">
        {label}
      </span>

      <input
        className={[
          "h-14 w-full rounded-2xl border border-[#d7d7d7] bg-white px-4",
          "text-sm font-bold text-[#171717] outline-none transition",
          "placeholder:text-[#9a9a9a] focus:border-[#171717]",
          className,
        ].join(" ")}
        {...props}
      />
    </label>
  );
}
