import { Card } from "../components/Card";

export function AppointmentsPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-beauty-700">Agenda</p>
        <h1 className="text-3xl font-bold text-zinc-950">Agendamentos</h1>
        <p className="mt-2 text-zinc-600">
          Criação, listagem por dia e alteração de status dos atendimentos.
        </p>
      </div>

      <Card title="Agenda do dia">
        <p className="text-sm text-zinc-500">
          Nenhum agendamento carregado ainda.
        </p>
      </Card>
    </div>
  );
}
