import { Card } from "../components/Card";

export function ClientsPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-beauty-700">Cadastro</p>
        <h1 className="text-3xl font-bold text-zinc-950">Clientes</h1>
        <p className="mt-2 text-zinc-600">
          A tela de clientes será conectada ao backend depois do negócio estar cadastrado.
        </p>
      </div>

      <Card title="Lista de clientes">
        <p className="text-sm text-zinc-500">
          Nenhum cliente carregado ainda.
        </p>
      </Card>
    </div>
  );
}
