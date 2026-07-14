import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <section
      className={[
        "h-fit min-w-0 self-start rounded-[28px] border border-white/80",
        "bg-[var(--yggdra-card,#ffffff)] p-5 text-[#171717]",
        "shadow-[0_18px_45px_var(--yggdra-shadow,rgba(0,0,0,0.08))]",
        "backdrop-blur-xl sm:p-6",
        className,
      ].join(" ")}
    >
      {title ? (
        <h2 className="mb-5 text-2xl font-black tracking-tight text-[#171717]">
          {title}
        </h2>
      ) : null}

      {children}
    </section>
  );
}
