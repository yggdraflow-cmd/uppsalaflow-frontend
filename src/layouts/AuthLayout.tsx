import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type RegisterTheme = "business" | "client";

type AuthLayoutProps = {
  children: ReactNode;
  variant?: "framed" | "plain";
  registerTheme?: RegisterTheme;
  showSiteBackButton?: boolean;
};

export function AuthLayout({
  children,
  variant = "framed",
  registerTheme = "business",
  showSiteBackButton = false,
}: AuthLayoutProps) {
  const isRegisterPage = variant === "plain";
  const isClientRegister = registerTheme === "client";

  const backgroundImage = isClientRegister
    ? "/register-client-bg.png"
    : "/register-background.webp";

  const siteUrl =
    import.meta.env.VITE_SITE_URL || "http://localhost:3000";

  return (
    <main
      className={[
        "auth-shell relative min-h-[100dvh] overflow-x-hidden overflow-y-auto",
        "bg-white px-3 py-3 sm:px-4 sm:py-4",
      ].join(" ")}
    >
      {showSiteBackButton ? (
        <a
          href={siteUrl}
          className={[
            "fixed left-4 top-4 z-40 inline-flex items-center gap-2 rounded-full border px-4 py-2.5",
            "text-xs font-black shadow-lg backdrop-blur-xl transition sm:left-5 sm:top-5",
            isClientRegister
              ? "border-[#d5b65f]/55 bg-white/85 text-[#8c6914] hover:bg-white"
              : "border-white/20 bg-black/45 text-white hover:border-[#12B8D6]/60 hover:text-[#5BD7EB]",
          ].join(" ")}
        >
          <ArrowLeft size={16} />
          Voltar para o site
        </a>
      ) : null}

      {isRegisterPage ? (
        <div className="pointer-events-none fixed inset-0">
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div
            className={[
              "absolute inset-0",
              isClientRegister
                ? "bg-[rgba(57,39,12,0.18)]"
                : "bg-[rgba(2,10,20,0.38)]",
            ].join(" ")}
          />
        </div>
      ) : (
        <>
          <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-white/40 blur-3xl" />

          <div className="pointer-events-none absolute bottom-[-220px] right-[-160px] h-[420px] w-[420px] rounded-full bg-slate-200/50 blur-3xl" />

          <div className="pointer-events-none absolute left-[-180px] top-1/3 h-[360px] w-[360px] rounded-full bg-slate-100/70 blur-3xl" />
        </>
      )}

      <div className="relative z-10 flex min-h-[calc(100dvh-24px)] w-full items-center justify-center sm:min-h-[calc(100dvh-32px)]">
        <div className="w-full max-w-[450px]">
          <div
            className={
              isRegisterPage
                ? "fixed left-1/2 top-4 z-30 -translate-x-1/2 whitespace-nowrap text-center sm:top-5"
                : "mb-8 text-center"
            }
          >
            <p
              className={[
                "inline-flex rounded-full border px-5 py-2",
                "text-xs font-black uppercase tracking-[0.32em]",
                "shadow-lg backdrop-blur-xl",
                isRegisterPage
                  ? isClientRegister
                    ? "border-[#d5b65f]/60 bg-white/80 text-[#8c6914]"
                    : "border-white/25 bg-black/40 text-white"
                  : "border-slate-200 bg-white/70 text-[#171717]",
              ].join(" ")}
            >
              YggdraFlow
            </p>

            {!isRegisterPage ? (
              <>
                <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
                  Gestão simples para negócios de estilo
                </h1>

                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Organize agenda, clientes, serviços e profissionais em um
                  fluxo leve, moderno e direto.
                </p>
              </>
            ) : null}
          </div>

          {variant === "framed" ? (
            <div className="rounded-[32px] border border-white/70 bg-white/55 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl">
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </main>
  );
}
