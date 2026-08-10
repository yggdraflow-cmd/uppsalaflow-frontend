import { CalendarDays, Compass, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { getUser } from "../services/authStorage";

export function ClientHomePage() {
  const user = getUser();
  const firstName = user?.name?.trim().split(/\s+/)[0] || "cliente";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/80 bg-white/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:p-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">
            <Compass size={15} />
            Explorar
          </span>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-[#171717] sm:text-4xl">
            Olá, {firstName}. Encontre seu próximo atendimento.
          </h1>

          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#6f7d89] sm:text-base">
            Descubra estabelecimentos, serviços e profissionais disponíveis no YggdraFlow.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[28px] border border-white/80 bg-white/60 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171717] text-white">
            <Search size={22} />
          </div>

          <h2 className="mt-5 text-xl font-black text-[#171717]">
            Descobrir estabelecimentos
          </h2>

          <p className="mt-2 text-sm font-semibold leading-6 text-[#74818c]">
            Encontre empresas por categoria, serviço, preço e avaliação.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/80 bg-white/60 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#171717] shadow-sm">
            <CalendarDays size={22} />
          </div>

          <h2 className="mt-5 text-xl font-black text-[#171717]">
            Seus atendimentos
          </h2>

          <p className="mt-2 text-sm font-semibold leading-6 text-[#74818c]">
            Consulte seus horários futuros e acompanhe todos os seus agendamentos.
          </p>

          <Link
            to="/cliente/agendamentos"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-black text-white transition hover:bg-black"
          >
            <CalendarDays size={18} />
            Meus agendamentos
          </Link>
        </div>
      </section>
    </div>
  );
}
