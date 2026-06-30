import { Card } from "../components/Card";

export function ServicesPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-beauty-700">Cadastro</p>
        <h1 className="text-3xl font-bold text-zinc-950">Serviços</h1>
        <p className="mt-2 text-zinc-600">
          Cadastre cortes, unhas, sobrancelhas, maquiagem, estética e outros serviços.
        </p>
      </div>

      <Card title="Lista de serviços">
        <p className="text-sm text-zinc-500">
          Nenhum serviço carregado ainda.
        </p>
      </Card>
    </div>
  );
}
