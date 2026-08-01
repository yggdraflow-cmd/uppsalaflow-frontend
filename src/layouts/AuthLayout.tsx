import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="auth-shell relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-10">
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-white/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-220px] right-[-160px] h-[420px] w-[420px] rounded-full bg-slate-200/50 blur-3xl" />
      <div className="pointer-events-none absolute left-[-180px] top-1/3 h-[360px] w-[360px] rounded-full bg-slate-100/70 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="inline-flex rounded-full border border-slate-200 bg-white/70 px-5 py-2 text-xs font-bold uppercase tracking-[0.32em] text-[#171717] shadow-sm backdrop-blur-xl">
            YggdraFlow
          </p>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
            Gestão simples para negócios de estilo
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Organize agenda, clientes, serviços e profissionais em um fluxo
            leve, moderno e direto.
          </p>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/55 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl">
          {children}
        </div>
      </div>
    </main>
  );
}