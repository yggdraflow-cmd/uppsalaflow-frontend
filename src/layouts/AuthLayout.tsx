import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-beauty-50 via-white to-zinc-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-beauty-600">
            Uppsalaflow
          </p>
          <h1 className="mt-3 text-3xl font-bold text-zinc-950">
            Gestão simples para negócios de beleza
          </h1>
        </div>

        {children}
      </div>
    </main>
  );
}
