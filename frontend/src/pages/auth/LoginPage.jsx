import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";

import useAuth from "../../hooks/useAuth";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";

function validateLoginForm({ email, senha }) {
  const errors = {};

  if (!email.trim()) {
    errors.email = "O e-mail é obrigatório.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!senha) {
    errors.senha = "A senha é obrigatória.";
  }

  return errors;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const from = useMemo(() => {
    return location.state?.from?.pathname || "/home";
  }, [location.state]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (erro) {
      setErro("");
    }
  }

  function handleBlur(event) {
    const { name } = event.target;
    const nextTouched = { ...touched, [name]: true };
    setTouched(nextTouched);
    setFieldErrors(validateLoginForm(formData));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    const email = formData.email.trim();
    const senha = formData.senha;

    const nextErrors = validateLoginForm({ email, senha });
    setFieldErrors(nextErrors);
    setTouched({
      email: true,
      senha: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setCarregando(true);

      await login(email, senha);

      navigate(from, { replace: true });
    } catch (error) {
      const mensagem =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível entrar. Verifique suas credenciais.";

      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <a href="#login-main" className="skip-link">
        Ir para o formulário de login
      </a>

      <main
        id="login-main"
        className="grid min-h-screen grid-cols-1 lg:grid-cols-2"
      >
        {/* Painel institucional / visual */}
        <section
          className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[var(--color-sidebar-bg)] px-10 py-10 text-[var(--color-text-inverse)]"
          aria-label="Informações sobre o sistema"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-sidebar-bg)] via-[var(--color-primary-active)] to-[var(--color-sidebar-bg)] opacity-90" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-sidebar-border)] bg-[var(--color-surface)]/10">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>

            <div>
              <p className="text-[var(--font-size-lg)] font-semibold text-white">
                PI3 Tasks
              </p>
              <p className="text-[var(--font-size-sm)] text-white/80">
                Gestão de tarefas, quadros e organizações
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <p className="text-[var(--font-size-xs)] uppercase tracking-[0.2em] text-white/70">
              Acesso seguro
            </p>
            <h1 className="mt-4 text-[2.5rem] font-bold leading-tight text-white">
              Entre no sistema e continue seu trabalho com contexto, clareza e controle.
            </h1>
            <p className="mt-5 max-w-lg text-[var(--font-size-md)] leading-7 text-white/85">
              Acesse suas organizações, selecione quadros e mantenha uma navegação consistente,
              com suporte a contraste elevado e ajuste de tipografia.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-[var(--font-size-sm)] font-semibold text-white">
                Autenticação
              </p>
              <p className="mt-2 text-[var(--font-size-sm)] leading-6 text-white/75">
                Controle de sessão e proteção de rotas privadas.
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-[var(--font-size-sm)] font-semibold text-white">
                Acessibilidade
              </p>
              <p className="mt-2 text-[var(--font-size-sm)] leading-6 text-white/75">
                Suporte a alto contraste e escala global de fonte.
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-[var(--font-size-sm)] font-semibold text-white">
                Navegação
              </p>
              <p className="mt-2 text-[var(--font-size-sm)] leading-6 text-white/75">
                Entrada orientada por organização e quadro ativo.
              </p>
            </div>
          </div>
        </section>

        {/* Área do formulário */}
        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-6 lg:hidden">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-primary)]">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>

                <div>
                  <p className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text)]">
                    PI3 Tasks
                  </p>
                  <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                    Acesso à plataforma
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-md)] sm:p-8">
              <header className="mb-6">
                <h2 className="text-[var(--font-size-heading-2)] font-semibold text-[var(--color-text)]">
                  Entrar no sistema
                </h2>
                <p className="mt-2 text-[var(--font-size-sm)] leading-6 text-[var(--color-text-muted)]">
                  Faça login para acessar suas organizações e quadros.
                </p>
              </header>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
                  >
                    E-mail
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="email"
                    disabled={carregando}
                    aria-invalid={Boolean(touched.email && fieldErrors.email)}
                    aria-describedby={
                      touched.email && fieldErrors.email
                        ? "login-email-erro"
                        : "login-email-ajuda"
                    }
                  />

                  {touched.email && fieldErrors.email ? (
                    <p
                      id="login-email-erro"
                      className="mt-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
                      role="alert"
                    >
                      {fieldErrors.email}
                    </p>
                  ) : (
                    <p
                      id="login-email-ajuda"
                      className="mt-2 text-[var(--font-size-xs)] text-[var(--color-text-soft)]"
                    >
                      Use o e-mail vinculado à sua conta.
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="senha"
                      className="block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
                    >
                      Senha
                    </label>

                    <Link
                      to="/esqueci-senha"
                      className="text-[var(--font-size-xs)] font-medium text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 rounded-sm"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      id="senha"
                      name="senha"
                      type={mostrarSenha ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={formData.senha}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="current-password"
                      disabled={carregando}
                      aria-invalid={Boolean(touched.senha && fieldErrors.senha)}
                      aria-describedby={
                        touched.senha && fieldErrors.senha
                          ? "login-senha-erro"
                          : undefined
                      }
                      className="pr-12"
                    />

                    <div className="absolute inset-y-0 right-1 flex items-center">
                      <IconButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon={
                          mostrarSenha ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )
                        }
                        label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                        onClick={() => setMostrarSenha((prev) => !prev)}
                        disabled={carregando}
                        className="h-9 w-9"
                      />
                    </div>
                  </div>

                  {touched.senha && fieldErrors.senha ? (
                    <p
                      id="login-senha-erro"
                      className="mt-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
                      role="alert"
                    >
                      {fieldErrors.senha}
                    </p>
                  ) : null}
                </div>

                {erro ? (
                  <div
                    className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-4 py-3 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
                    role="alert"
                    aria-live="assertive"
                  >
                    {erro}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={carregando}
                  leftIcon={!carregando ? <LogIn className="h-4 w-4" /> : null}
                >
                  {carregando ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <footer className="mt-6 border-t border-[var(--color-border)] pt-5 text-center">
                <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                  Ainda não tem conta?{" "}
                  <Link
                    to="/cadastro"
                    className="font-semibold text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 rounded-sm"
                  >
                    Criar conta
                  </Link>
                </p>
              </footer>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}