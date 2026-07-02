import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <section className={`upp-card rounded-[32px] p-6 ${className}`}>
      {title ? (
        <h2 className="mb-6 text-2xl upp-title">
          {title}
        </h2>
      ) : null}

      {children}
    </section>
  );
}