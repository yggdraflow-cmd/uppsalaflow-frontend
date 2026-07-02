import { useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

export function PublicBookingPage() {
  const { slug } = useParams();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-beauty-50 via-white to-zinc-100 px-4">
      <div className="w-full max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-beauty-600">
          Uppsalaflow
        </p>
        <h1 className="mt-3 text-3xl font-bold text-zinc-950">
          Agendamento online
        </h1>
        <p className="mt-2 text-zinc-600">
          Página pública reservada para o negócio: <strong>{slug}</strong>
        </p>

        <div className="mt-8">
          <Card title="Em breve">
            <p className="text-sm text-zinc-600">
              Aqui o cliente final poderá escolher serviço, profissional, data e horário.
            </p>

            <Button className="mt-4" disabled>
              Agendamento em desenvolvimento
            </Button>
          </Card>
        </div>
      </div>
    </main>
  );
}
