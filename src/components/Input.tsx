import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  className?: string;
};

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="block min-w-0 max-w-full">
      <span className="mb-2 block break-words text-sm font-black text-[#444]">
        {label}
      </span>

      <input
        className={[
          "min-h-12 min-w-0 w-full max-w-full rounded-2xl",
          "border border-[#d7d7d7] bg-white px-4 py-3",
          "text-base font-bold text-[#171717] outline-none transition",
          "placeholder:text-[#9a9a9a] focus:border-[#171717]",
          "sm:min-h-14 sm:text-sm",
          className,
        ].join(" ")}
        {...props}
      />
    </label>
  );
}
