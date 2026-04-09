import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";

import useAuth from "../../hooks/useAuth";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";

import "../../styles/pages/login.css";

function validateLoginForm({ email, senha }) {
  const errors = {};

  if (!email.trim()) {
    errors.email = "O e-mail é obrigatório.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!senha) {
    errors.senha = "A senha é obrigatória.";
  } else if (senha.length < 6) {
    errors.senha = "A senha deve ter pelo menos 6 caracteres.";
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

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }

  function handleBlur(event) {
    const { name } = event.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const nextData = {
      ...formData,
      [name]: event.target.value,
    };

    setFieldErrors(validateLoginForm(nextData));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    const email = formData.email.trim();
    const senha = formData.senha;

    const errors = validateLoginForm({ email, senha });

    setFieldErrors(errors);
    setTouched({
      email: true,
      senha: true,
    });

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setCarregando(true);
      await login(email, senha);
      navigate(from, { replace: true });
    } catch (err) {
      setErro(
        err?.response?.data?.message ||
          err?.message ||
          "Erro ao autenticar. Verifique suas credenciais."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login">
      <a href="#login-formulario" className="skip-link">
        Ir para o formulário de login
      </a>

      <main className="login__container">
        <section
          className="login__hero"
          aria-label="Apresentação do sistema"
        >
          <div className="login__hero-content">
            <div className="login__brand">
              <ShieldCheck size={28} aria-hidden="true" />
              <div>
                <h1>Projeto Integrador 3</h1>
                <span>UNIVESP 2026</span>
              </div>
            </div>

            <div className="login__hero-text">
              <h2>
                Gestão de tarefas
                <br />
                com estrutura e clareza
              </h2>
              <p>
                Organize quadros, listas e cartões com controle de acesso,
                consistência visual e arquitetura preparada para evolução.
              </p>
            </div>
          </div>
        </section>

        <section className="login__form">
          <div className="login__card">
            <header className="login__card-header">
              <h2>Bem-vindo</h2>
              <p>Entre com suas credenciais para continuar.</p>
            </header>

            <form
              id="login-formulario"
              onSubmit={handleSubmit}
              noValidate
              className="login__form-content"
            >
              <div className="login__field">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="email"
                  autoFocus
                  disabled={carregando}
                  aria-invalid={Boolean(touched.email && fieldErrors.email)}
                  aria-describedby={
                    touched.email && fieldErrors.email
                      ? "email-error"
                      : undefined
                  }
                />
                {touched.email && fieldErrors.email && (
                  <span id="email-error" className="error" role="alert">
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              <div className="login__field">
                <div className="login__field-row">
                  <label htmlFor="senha">Senha</label>
                  <Link to="/esqueci-senha">Esqueceu a senha?</Link>
                </div>

                <div className="login__password">
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
                        ? "senha-error"
                        : undefined
                    }
                  />

                  <IconButton
                    type="button"
                    onClick={() => setMostrarSenha((prev) => !prev)}
                    icon={
                      mostrarSenha ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )
                    }
                    label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    disabled={carregando}
                  />
                </div>

                {touched.senha && fieldErrors.senha && (
                  <span id="senha-error" className="error" role="alert">
                    {fieldErrors.senha}
                  </span>
                )}
              </div>

              {erro && (
                <div className="login__error" role="alert" aria-live="polite">
                  {erro}
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                loading={carregando}
                leftIcon={!carregando ? <LogIn size={18} /> : null}
              >
                {carregando ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <footer className="login__card-footer">
              <span>
                Ainda não tem uma conta?{" "}
                <Link to="/cadastro">Criar conta</Link>
              </span>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}