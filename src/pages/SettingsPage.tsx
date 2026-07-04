import {
  Bell,
  CalendarDays,
  Link2,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Card } from "../components/Card";

const settingsItems = [
  {
    title: "Conta",
    description:
      "Área reservada para dados do usuário logado, troca de senha e preferências de acesso.",
    icon: UserRound,
    status: "Em breve",
  },
  {
    title: "Negócio",
    description:
      "Configurações futuras do negócio, como expediente, link público, dados de contato e regras da agenda.",
    icon: Settings,
    status: "Planejado",
  },
  {
    title: "Agenda",
    description:
      "Hoje o expediente padrão está fixo entre 08:00 e 18:00, com horários em blocos de 30 minutos.",
    icon: CalendarDays,
    status: "Ativo",
  },
  {
    title: "Página pública",
    description:
      "O agendamento público já usa o slug do negócio para clientes escolherem serviço, profissional, data e horário.",
    icon: Link2,
    status: "Ativo",
  },
  {
    title: "Notificações",
    description:
      "Espaço preparado para futuros avisos por e-mail, WhatsApp ou alertas internos.",
    icon: Bell,
    status: "Em breve",
  },
  {
    title: "Segurança",
    description:
      "Autenticação por token JWT já protege as áreas internas do sistema.",
    icon: ShieldCheck,
    status: "Ativo",
  },
];

export function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-orange-500">Configurações</p>
        <h1 className="text-3xl font-bold text-zinc-950">
          Configurações do sistema
        </h1>
        <p className="mt-2 max-w-3xl text-zinc-600">
          Central inicial de ajustes do Uppsalaflow. Por enquanto, esta tela
          organiza o que já está ativo e o que será configurável nas próximas
          etapas do MVP.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {settingsItems.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <div className="flex h-full flex-col">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#121b35] text-white shadow-[0_16px_34px_rgba(18,27,53,0.18)]">
                    <Icon size={23} />
                  </span>

                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                    {item.status}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-zinc-950">
                  {item.title}
                </h2>

                <p className="mt-2 flex-1 text-sm leading-6 text-zinc-600">
                  {item.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card title="Próximos ajustes reais" className="mt-6">
        <div className="grid gap-3 text-sm text-zinc-600 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <strong className="block text-zinc-950">Expediente editável</strong>
            <span className="mt-1 block">
              Trocar o horário fixo por configuração salva no negócio.
            </span>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <strong className="block text-zinc-950">Perfil do usuário</strong>
            <span className="mt-1 block">
              Exibir nome e e-mail reais do usuário logado no topo.
            </span>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <strong className="block text-zinc-950">Link público</strong>
            <span className="mt-1 block">
              Copiar e divulgar o link de agendamento do negócio.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
