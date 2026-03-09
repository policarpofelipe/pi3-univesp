import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function CadastroPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nomeExibicao: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validarFormulario() {
    const nomeExibicao = formData.nomeExibicao.trim();
    const email = formData.email.trim();
    const senha = formData.senha;
    const confirmarSenha = formData.confirmarSenha;

    if (!nomeExibicao || !email || !senha || !confirmarSenha) {
      return "Preencha todos os campos.";
    }

    if (senha.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }

    if (senha !== confirmarSenha) {
      return "A confirmação de senha não confere.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    const erroValidacao = validarFormulario();

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setCarregando(true);

      // Esperado: register({ nomeExibicao, email, senha })
      await register({
        nomeExibicao: formData.nomeExibicao.trim(),
        email: formData.email.trim(),
        senha: formData.senha,
      });

      setSucesso("Cadastro realizado com sucesso.");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      const mensagem =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível concluir o cadastro.";

      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Criar conta</h1>
          <p style={styles.subtitle}>
            Cadastre-se para acessar o sistema e começar a usar seus quadros.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="nomeExibicao" style={styles.label}>
              Nome de exibição
            </label>
            <input
              id="nomeExibicao"
              name="nomeExibicao"
              type="text"
              placeholder="Digite seu nome"
              value={formData.nomeExibicao}
              onChange={handleChange}
              disabled={carregando}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={carregando}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="senha" style={styles.label}>
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              placeholder="Crie uma senha"
              value={formData.senha}
              onChange={handleChange}
              autoComplete="new-password"
              disabled={carregando}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="confirmarSenha" style={styles.label}>
              Confirmar senha
            </label>
            <input
              id="confirmarSenha"
              name="confirmarSenha"
              type="password"
              placeholder="Repita a senha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              autoComplete="new-password"
              disabled={carregando}
              style={styles.input}
            />
          </div>

          {erro ? <div style={styles.errorBox}>{erro}</div> : null}
          {sucesso ? <div style={styles.successBox}>{sucesso}</div> : null}

          <button type="submit" disabled={carregando} style={styles.button}>
            {carregando ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Já tem conta?</span>{" "}
          <Link to="/login" style={styles.link}>
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.20)",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#0f172a",
  },
  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    fontSize: "14px",
    color: "#475569",
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1e293b",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    fontSize: "14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    marginTop: "6px",
    padding: "12px 16px",
    fontSize: "15px",
    fontWeight: 600,
    color: "#ffffff",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  errorBox: {
    padding: "12px 14px",
    borderRadius: "10px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    fontSize: "14px",
    border: "1px solid #fecaca",
  },
  successBox: {
    padding: "12px 14px",
    borderRadius: "10px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    fontSize: "14px",
    border: "1px solid #bbf7d0",
  },
  footer: {
    marginTop: "22px",
    textAlign: "center",
    fontSize: "14px",
  },
  footerText: {
    color: "#475569",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 600,
  },
};
