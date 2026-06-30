import { CalendarDays, DollarSign, Scissors, Users } from "lucide-react";
import { Card } from "../components/Card";

const cards = [
  {
    title: "Atendimentos hoje",
    value: "0",
    icon: CalendarDays,
  },
  {
    title: "Faturamento estimado",
    value: "R$ 0,00",
    icon: DollarSign,
  },
  {
    title: "Clientes",
    value: "0",
    icon: Users,
  },
  {
    title: "Serviços ativos",
    value: "0",
    icon: Scissors,
  },
];

export function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-beauty-700">Painel</p>
        <h1 className="text-3xl font-bold text-zinc-950">Dashboard</h1>
        <p className="mt-2 text-zinc-600">
          Visão inicial do negócio. Os números serão conectados ao backend nas próximas etapas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">{item.title}</p>
                  <strong className="mt-2 block text-2xl text-zinc-950">
                    {item.value}
                  </strong>
                </div>

                <span className="rounded-2xl bg-beauty-50 p-3 text-beauty-700">
                  <Icon size={22} />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6">
        <Card title="Agenda do dia">
          <p className="text-sm text-zinc-500">
            Nenhum atendimento carregado ainda.
          </p>
        </Card>
      </div>
    </div>
  );
}
