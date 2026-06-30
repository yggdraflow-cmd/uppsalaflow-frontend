import { Card } from "../components/Card";

export function ProfessionalsPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-beauty-700">Equipe</p>
        <h1 className="text-3xl font-bold text-zinc-950">Profissionais</h1>
        <p className="mt-2 text-zinc-600">
          Controle quem realiza os atendimentos dentro do negócio.
        </p>
      </div>

      <Card title="Lista de profissionais">
        <p className="text-sm text-zinc-500">
          Nenhum profissional carregado ainda.
        </p>
      </Card>
    </div>
  );
}
