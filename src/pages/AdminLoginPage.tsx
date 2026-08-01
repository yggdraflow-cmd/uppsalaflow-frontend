import { type FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { Input } from "../components/Input";
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f6f8] px-4 py-10">
      <div className="pointer-events-none absolute left-[-140px] top-[-160px] h-[420px] w-[420px] rounded-full bg-slate-200/70 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-180px] right-[-100px] h-[420px] w-[420px] rounded-full bg-orange-100/60 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.14)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden min-h-[620px] flex-col justify-between bg-[#0f2233] p-10 text-white lg:flex">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2">
              <ShieldCheck size={20} />
              <span className="text-xs font-black uppercase tracking-[0.22em]">
                Administração da plataforma
              </span>
            </div>

            <h1 className="mt-10 max-w-md text-4xl font-black leading-tight">
              Controle geral da plataforma YggdraTech
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
              Gerencie empresas, aprovações, pagamentos, assinaturas,
              bloqueios e módulos em um único ambiente administrativo.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-bold text-slate-200">
              Acesso restrito
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Esta área é exclusiva para administradores autorizados da
              plataforma. Todas as ações administrativas poderão ser
              registradas em auditoria.
            </p>
          </div>
        </section>

        <section className="flex min-h-[620px] items-center p-6 sm:p-10">
          <div className="mx-auto w-full max-w-md">
            <Link
              to="/login"
              className="mb-8 inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-[#0f2233]"
            >
              <ArrowLeft size={18} />
              Login empresarial
            </Link>

            <div className="mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <LockKeyhole size={28} />
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-orange-600">
                YggdraTech
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0f2233]">
                Super Admin
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Entre com a conta administrativa criada diretamente pela
                plataforma.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="E-mail administrativo"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@yggdratech.com"
                required
              />

              <label className="block">
                <span className="mb-2 block text-sm font-black text-[#444]">
                  Senha
                </span>

                <div className="relative">
                  <input
                    className="min-h-14 w-full rounded-2xl border border-[#d7d7d7] bg-white px-4 py-3 pr-14 text-sm font-bold text-[#171717] outline-none transition placeholder:text-[#9a9a9a] focus:border-[#0f2233]"
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Digite sua senha"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setIsPasswordVisible((currentValue) => !currentValue)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-[#0f2233]"
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
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0f2233] hover:bg-[#081521]"
              >
                {isSubmitting
                  ? "Validando acesso..."
                  : "Entrar no Super Admin"}
              </Button>
            </form>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Não existe cadastro público para administradores da
              plataforma.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
