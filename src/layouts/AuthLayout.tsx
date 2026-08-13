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
  const isPlainPage = variant === "plain";
  const isClientTheme = registerTheme === "client";

  const backgroundImage = isClientTheme
    ? "/register-client-bg.png"
    : "/register-background.webp";

  const siteUrl =
    import.meta.env.VITE_SITE_URL || "http://localhost:3000";

  const backButtonClassName = [
    "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5",
    "text-xs font-black shadow-lg backdrop-blur-xl transition",
    isClientTheme
      ? "border-[#d5b65f]/55 bg-white/90 text-[#8c6914] hover:bg-white"
      : "border-white/20 bg-black/50 text-white hover:border-[#12B8D6]/60 hover:text-[#5BD7EB]",
  ].join(" ");

  const brandClassName = [
    "inline-flex rounded-full border px-5 py-2",
    "text-xs font-black uppercase tracking-[0.32em]",
    "shadow-lg backdrop-blur-xl",
    isPlainPage
      ? isClientTheme
        ? "border-[#d5b65f]/60 bg-white/85 text-[#8c6914]"
        : "border-white/25 bg-black/45 text-white"
      : "border-slate-200 bg-white/70 text-[#171717]",
  ].join(" ");

  return (
    <main
      className={[
        "auth-shell relative min-h-[100dvh] overflow-x-hidden overflow-y-auto",
        "bg-white px-4 py-4 sm:px-5 sm:py-5",
      ].join(" ")}
    >
      {isPlainPage ? (
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
              isClientTheme
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

      <div
        className={[
          "relative z-10 mx-auto flex w-full max-w-[450px] flex-col",
          "min-h-[calc(100dvh-32px)] sm:min-h-[calc(100dvh-40px)]",
          "justify-start md:justify-center",
        ].join(" ")}
      >
        {isPlainPage ? (
          <div className="mb-4 flex w-full flex-col gap-3 md:mb-0 md:block">
            {showSiteBackButton ? (
              <a
                href={siteUrl}
                className={[
                  backButtonClassName,
                  "self-start md:fixed md:left-5 md:top-5 md:z-40",
                ].join(" ")}
              >
                <ArrowLeft size={16} />
                Voltar para o site
              </a>
            ) : null}

            <div className="self-center md:fixed md:left-1/2 md:top-5 md:z-30 md:-translate-x-1/2">
              <p className={brandClassName}>YggdraFlow</p>
            </div>
          </div>
        ) : (
          <>
            {showSiteBackButton ? (
              <div className="mb-6">
                <a href={siteUrl} className={backButtonClassName}>
                  <ArrowLeft size={16} />
                  Voltar para o site
                </a>
              </div>
            ) : null}

            <div className="mb-8 text-center">
              <p className={brandClassName}>YggdraFlow</p>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
                Gestão simples para negócios de estilo
              </h1>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Organize agenda, clientes, serviços e profissionais em um
                fluxo leve, moderno e direto.
              </p>
            </div>
          </>
        )}

        <div className="w-full">
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
