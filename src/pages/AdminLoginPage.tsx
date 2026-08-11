import { type FormEvent, useEffect, useState } from "react";
import { GrainGradient } from "@paper-design/shaders-react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { api } from "../services/api";
import {
  getToken,
  getUser,
  saveAuth,
} from "../services/authStorage";
import type { AuthResponse } from "../types/auth";

export function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (token && user?.role === "ADMIN") {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      const response = await api.post<AuthResponse>(
        "/auth/admin/login",
        {
          email: email.trim(),
          password,
        }
      );

      if (response.data.user.role !== "ADMIN") {
        setError("Esta conta não possui acesso administrativo.");
        return;
      }

      saveAuth(response.data.token, response.data.user);
      navigate("/admin", { replace: true });
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          "Não foi possível acessar o Super Admin."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] p-3 text-[#081120]">
      <div className="grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white shadow-[0_30px_90px_rgba(8,17,32,0.10)] lg:grid-cols-[0.94fr_1.06fr]">
        <section className="flex min-h-[720px] items-center bg-[#f7f7f5] px-6 py-12 sm:px-10 lg:min-h-0 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-[560px]">
            <div className="mb-10">
              <a
                href="http://localhost:3000"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#64748b] transition hover:text-[#081120]"
              >
                <ArrowLeft size={18} />
                Voltar para Yggdra Tech
              </a>
            </div>

            <div className="mb-10">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#e2e8f0] bg-white px-4 py-2 shadow-sm">
                <ShieldCheck size={18} className="text-[#12b8d6]" />

                <span className="text-xs font-black uppercase tracking-[0.22em] text-[#475569]">
                  Administração da plataforma
                </span>
              </div>

              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#12b8d6]">
                YggdraFlow
              </p>

              <h1 className="mt-4 text-4xl font-medium tracking-[-0.04em] text-[#081120] sm:text-5xl">
                Super Admin
              </h1>

              <p className="mt-4 max-w-lg text-lg leading-7 text-[#64748b]">
                Acesse o ambiente administrativo para gerenciar empresas,
                aprovações, assinaturas e operações da plataforma.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#475569]">
                  E-mail administrativo
                </span>

                <div className="flex min-h-16 items-center rounded-[14px] border border-[#dfe5e9] bg-white px-5 shadow-sm transition focus-within:border-[#12b8d6] focus-within:ring-4 focus-within:ring-[#12b8d6]/10">
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@yggdratech.com"
                    required
                    className="w-full bg-transparent text-base font-semibold text-[#081120] outline-none placeholder:text-[#94a3b8]"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#475569]">
                  Senha
                </span>

                <div className="relative flex min-h-16 items-center rounded-[14px] border border-[#dfe5e9] bg-white px-5 shadow-sm transition focus-within:border-[#12b8d6] focus-within:ring-4 focus-within:ring-[#12b8d6]/10">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Digite sua senha"
                    required
                    className="w-full bg-transparent pr-12 text-base font-semibold text-[#081120] outline-none placeholder:text-[#94a3b8]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setIsPasswordVisible((currentValue) => !currentValue)
                    }
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#94a3b8] transition hover:text-[#081120]"
                    aria-label={
                      isPasswordVisible
                        ? "Ocultar senha"
                        : "Mostrar senha"
                    }
                  >
                    {isPasswordVisible ? (
                      <EyeOff size={21} />
                    ) : (
                      <Eye size={21} />
                    )}
                  </button>
                </div>
              </label>

              {error ? (
                <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 flex min-h-14 w-full items-center justify-center rounded-[14px] bg-[#12b8d6] px-6 text-base font-black text-white shadow-[0_12px_30px_rgba(18,184,214,0.22)] transition hover:bg-[#087f95] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Validando acesso..."
                  : "Entrar no Super Admin"}
              </button>
            </form>

            <div className="mt-8 flex items-start gap-3 rounded-[16px] border border-[#e2e8f0] bg-white px-4 py-4 shadow-sm">
              <LockKeyhole
                size={19}
                className="mt-0.5 shrink-0 text-[#12b8d6]"
              />

              <p className="text-sm leading-6 text-[#64748b]">
                Área exclusiva para administradores autorizados. Não existe
                cadastro público para acesso ao Super Admin.
              </p>
            </div>
          </div>
        </section>

        <section className="relative hidden min-h-[720px] overflow-hidden bg-[#081120] lg:flex">
          <GrainGradient
            speed={1}
            scale={1}
            rotation={0}
            offsetX={0}
            offsetY={0}
            softness={0.55}
            intensity={0.55}
            noise={0.3}
            shape="corners"
            frame={2854.5}
            colors={[
              "#081120",
              "#12b8d6",
              "#5bd7eb",
              "#f7f7f5",
            ]}
            colorBack="#081120"
            className="absolute inset-0 h-full w-full"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-[#081120]/15 via-transparent to-[#081120]/25" />

          <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 sm:p-12 lg:p-14 xl:p-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#081120]/30 px-4 py-2 backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-[#12b8d6]" />

                <span className="text-xs font-black uppercase tracking-[0.24em] text-white/85">
                  Yggdra Tech
                </span>
              </div>

              <h2 className="mt-10 max-w-[680px] text-5xl font-medium leading-[0.96] tracking-[-0.055em] text-white lg:text-[62px] xl:text-[72px]">
                YggdraFlow
                <br />
                Operações
              </h2>

              <p className="mt-10 max-w-xl text-lg leading-7 text-white/70">
                Administração central da plataforma.
              </p>
            </div>

            <div className="max-w-xl rounded-[18px] border border-white/20 bg-[#081120]/55 p-5 backdrop-blur-xl">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#5bd7eb]">
                Administração central
              </p>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Ambiente restrito da plataforma, preparado para controle,
                acompanhamento e decisões administrativas.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
