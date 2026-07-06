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
        "rounded-[30px] bg-white/82 p-7 text-[#171717]",
        "shadow-[0_18px_45px_rgba(0,0,0,0.08)] backdrop-blur-xl",
        className,
      ].join(" ")}
    >
      {title ? (
        <h2 className="mb-6 text-2xl font-black tracking-tight text-[#171717]">
          {title}
        </h2>
      ) : null}

      {children}
    </section>
  );
}
