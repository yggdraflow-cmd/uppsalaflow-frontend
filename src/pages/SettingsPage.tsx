export function SettingsPage() {
  const futureSettings = [
    "Horário de funcionamento do negócio",
    "Intervalo entre atendimentos",
    "Dados públicos do link de agendamento",
    "Preferências de confirmação do cliente",
    "Mensagens padrão para reagendamento",
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/80 bg-white/55 p-8 shadow-[0_22px_70px_rgba(55,73,89,0.12)] backdrop-blur-2xl">
        <p className="text-xs font-black uppercase tracking-[0.32em] text-orange-500">
          Configurações
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#101828]">
          Configurações do negócio
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#667789]">
          Esta área será usada para ajustar regras do negócio, horários,
          preferências da agenda e informações exibidas no agendamento público.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[30px] border border-white/80 bg-white/50 p-6 shadow-[0_18px_55px_rgba(55,73,89,0.10)] backdrop-blur-2xl">
          <h2 className="text-lg font-black text-[#132033]">
            Expediente padrão
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#667789]">
            No MVP, o expediente está fixo das 08:00 às 18:00 e os horários
            seguem blocos de 30 minutos.
          </p>

          <div className="mt-5 rounded-2xl bg-[#132033] px-5 py-4 text-sm font-black text-white">
            08:00 até 18:00
          </div>
        </div>

        <div className="rounded-[30px] border border-white/80 bg-white/50 p-6 shadow-[0_18px_55px_rgba(55,73,89,0.10)] backdrop-blur-2xl">
          <h2 className="text-lg font-black text-[#132033]">
            Próximas configurações
          </h2>

          <ul className="mt-4 space-y-3 text-sm font-bold text-[#667789]">
            {futureSettings.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-white/80 bg-white/55 px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
