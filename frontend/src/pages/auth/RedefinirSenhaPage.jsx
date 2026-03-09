import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/authService";

export default function RedefinirSenhaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [formData, setFormData] = useState({
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
    if (!token) {
      return "Token de redefinição inválido ou ausente.";
    }

    if (!formData.senha || !formData.confirmarSenha) {
      return "Preencha todos os campos.";
    }

    if (formData.senha.length < 6) {
      return "A nova senha deve ter pelo menos 6 caracteres.";
    }

    if (formData.senha !== formData.confirmarSenha) {
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

      // Esperado no authService:
      // resetPassword({ token, senha })
      await authService.resetPassword({
        token,
        senha: formData.senha,
      });

      setSucesso("Senha redefinida com sucesso. Você será redirecionado para o login.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      const mensagem =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível redefinir a senha.";

      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Redefinir senha</h1>
          <p style={styles.subtitle}>
            Digite sua nova senha para concluir a recuperação de acesso.
          </p>
        </div>

        {!token ? (
          <div style={styles.errorBox}>
            Link de redefinição inválido. Solicite um novo link de recuperação.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label htmlFor="senha" style={styles.label}>
                Nova senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                placeholder="Digite a nova senha"
                value={formData.senha}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={carregando}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="confirmarSenha" style={styles.label}>
                Confirmar nova senha
              </label>
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                placeholder="Repita a nova senha"
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
              {carregando ? "Redefinindo..." : "Redefinir senha"}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <Link to="/login" style={styles.link}>
            Voltar para o login
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
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 600,
  },
};
