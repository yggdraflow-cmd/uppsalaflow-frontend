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
        "min-w-0 w-full max-w-full rounded-[24px] bg-white/82 p-4 text-[#171717]",
        "shadow-[0_18px_45px_rgba(0,0,0,0.08)] backdrop-blur-xl",
        "sm:rounded-[28px] sm:p-5 md:rounded-[30px] md:p-7",
        className,
      ].join(" ")}
    >
      {title ? (
        <h2 className="mb-4 break-words text-xl font-black leading-tight tracking-tight text-[#171717] sm:mb-5 sm:text-2xl md:mb-6">
          {title}
        </h2>
      ) : null}

      <div className="min-w-0 max-w-full">{children}</div>
    </section>
  );
}
