import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      {title && <h2 className="mb-4 text-lg font-semibold text-zinc-900">{title}</h2>}
      {children}
    </section>
  );
}
