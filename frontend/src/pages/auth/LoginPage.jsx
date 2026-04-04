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
    <div className="login-page">
      <a href="#login-main" className="skip-link">
        Ir para o formulário de login
      </a>

      <main id="login-main" className="login-layout">
        <section
          className="login-hero"
          aria-label="Informações sobre a plataforma"
        >
          <div className="login-hero__overlay" />

          <div className="login-hero__content">
            <div className="login-hero__brand">
              <div className="login-hero__brand-icon" aria-hidden="true">
                <ShieldCheck size={28} />
              </div>

              <div>
                <p className="login-hero__brand-title">PI3 Tasks</p>
                <p className="login-hero__brand-subtitle">
                  Gestão de tarefas, quadros e organizações
                </p>
              </div>
            </div>

            <div className="login-hero__text">
              <p className="login-hero__eyebrow">Acesso seguro</p>

              <h1 className="login-hero__title">
                Entre no sistema e continue seu trabalho com contexto, clareza e controle.
              </h1>

              <p className="login-hero__description">
                Acesse suas organizações, selecione quadros e mantenha uma navegação consistente,
                com suporte a contraste elevado e ajuste de tipografia.
              </p>
            </div>

            <div className="login-hero__features">
              <article className="login-hero__feature">
                <h2 className="login-hero__feature-title">Autenticação</h2>
                <p className="login-hero__feature-text">
                  Controle de sessão e proteção de rotas privadas.
                </p>
              </article>

              <article className="login-hero__feature">
                <h2 className="login-hero__feature-title">Acessibilidade</h2>
                <p className="login-hero__feature-text">
                  Suporte a alto contraste e escala global de fonte.
                </p>
              </article>

              <article className="login-hero__feature">
                <h2 className="login-hero__feature-title">Navegação</h2>
                <p className="login-hero__feature-text">
                  Entrada orientada por organização e quadro ativo.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="login-form-section">
          <div className="login-mobile-brand">
            <div className="login-mobile-brand__icon" aria-hidden="true">
              <ShieldCheck size={22} />
            </div>

            <div>
              <p className="login-mobile-brand__title">PI3 Tasks</p>
              <p className="login-mobile-brand__subtitle">Acesso à plataforma</p>
            </div>
          </div>

          <div className="login-card">
            <header className="login-card__header">
              <h2 className="login-card__title">Entrar no sistema</h2>
              <p className="login-card__subtitle">
                Faça login para acessar suas organizações e quadros.
              </p>
            </header>

            <form onSubmit={handleSubmit} noValidate className="login-form">
              <div className="form-field">
                <label htmlFor="email" className="form-field__label">
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
                  className="form-field__input"
                />

                {touched.email && fieldErrors.email ? (
                  <p
                    id="login-email-erro"
                    className="form-field__message form-field__message--error"
                    role="alert"
                  >
                    {fieldErrors.email}
                  </p>
                ) : (
                  <p
                    id="login-email-ajuda"
                    className="form-field__message form-field__message--hint"
                  >
                    Use o e-mail vinculado à sua conta.
                  </p>
                )}
              </div>

              <div className="form-field">
                <div className="form-field__label-row">
                  <label htmlFor="senha" className="form-field__label">
                    Senha
                  </label>

                  <Link to="/esqueci-senha" className="login-link login-link--small">
                    Esqueci minha senha
                  </Link>
                </div>

                <div className="password-field">
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
                    className="form-field__input password-field__input"
                  />

                  <div className="password-field__action">
                    <IconButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={
                        mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />
                      }
                      label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                      onClick={() => setMostrarSenha((prev) => !prev)}
                      disabled={carregando}
                    />
                  </div>
                </div>

                {touched.senha && fieldErrors.senha ? (
                  <p
                    id="login-senha-erro"
                    className="form-field__message form-field__message--error"
                    role="alert"
                  >
                    {fieldErrors.senha}
                  </p>
                ) : null}
              </div>

              {erro ? (
                <div className="login-alert login-alert--error" role="alert" aria-live="assertive">
                  {erro}
                </div>
              ) : null}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={carregando}
                leftIcon={!carregando ? <LogIn size={18} /> : null}
              >
                {carregando ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <footer className="login-card__footer">
              <p className="login-card__footer-text">
                Ainda não tem conta?{" "}
                <Link to="/cadastro" className="login-link">
                  Criar conta
                </Link>
              </p>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}