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
  }

  return errors;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", senha: "" });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const from = useMemo(() => {
    return location.state?.from?.pathname || "/home";
  }, [location.state]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (erro) setErro("");
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors(validateLoginForm(formData));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const email = formData.email.trim();
    const senha = formData.senha;

    const errors = validateLoginForm({ email, senha });
    setFieldErrors(errors);
    setTouched({ email: true, senha: true });

    if (Object.keys(errors).length > 0) return;

    try {
      setCarregando(true);
      await login(email, senha);
      navigate(from, { replace: true });
    } catch (err) {
      setErro(
        err?.response?.data?.message ||
          err?.message ||
          "Erro ao autenticar."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login">
      <main className="login__container">
        {/* LADO INSTITUCIONAL */}
        <section className="login__hero">
          <div className="login__hero-content">
            <div className="login__brand">
              <ShieldCheck size={28} />
              <div>
                <h1>Projeto Integrador 3</h1>
                <span>UNIVESP 2026</span>
              </div>
            </div>

            <div className="login__hero-text">
              <h2>Gestão de tarefas com estrutura e clareza</h2>
              <p>
                Organize quadros, listas e cartões com controle de acesso,
                consistência visual e arquitetura preparada para evolução.
              </p>
            </div>
          </div>
        </section>

        {/* FORM */}
        <section className="login__form">
          <div className="login__card">
            <header>
              <h2>Entrar</h2>
              <p>Acesse suas organizações e quadros.</p>
            </header>

            <form onSubmit={handleSubmit}>
              <div className="login__field">
                <label>E-mail</label>
                <input
                  name="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.email && fieldErrors.email && (
                  <span className="error">{fieldErrors.email}</span>
                )}
              </div>

              <div className="login__field">
                <div className="login__field-row">
                  <label>Senha</label>
                  <Link to="/esqueci-senha">Esqueci</Link>
                </div>

                <div className="login__password">
                  <input
                    name="senha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={formData.senha}
                    onChange={handleChange}
                    onBlur={handleBlur}
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
                  />
                </div>

                {touched.senha && fieldErrors.senha && (
                  <span className="error">{fieldErrors.senha}</span>
                )}
              </div>

              {erro && <div className="login__error">{erro}</div>}

              <Button
                type="submit"
                fullWidth
                loading={carregando}
                leftIcon={<LogIn size={18} />}
              >
                Entrar
              </Button>
            </form>

            <footer>
              <span>
                Não tem conta? <Link to="/cadastro">Criar conta</Link>
              </span>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}