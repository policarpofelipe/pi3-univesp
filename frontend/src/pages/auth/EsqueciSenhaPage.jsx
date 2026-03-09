import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../../services/authService";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    const emailLimpo = email.trim();

    if (!emailLimpo) {
      setErro("Informe o e-mail cadastrado.");
      return;
    }

    try {
      setCarregando(true);

      // Esperado no authService:
      // forgotPassword(email)
      await authService.forgotPassword(emailLimpo);

      setSucesso(
        "Se existir uma conta vinculada a este e-mail, as instruções de recuperação foram enviadas."
      );
      setEmail("");
    } catch (error) {
      const mensagem =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível processar a solicitação no momento.";

      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Recuperar senha</h1>
          <p style={styles.subtitle}>
            Informe seu e-mail para receber as instruções de redefinição de
            senha.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={carregando}
              style={styles.input}
            />
          </div>

          {erro ? <div style={styles.errorBox}>{erro}</div> : null}
          {sucesso ? <div style={styles.successBox}>{sucesso}</div> : null}

          <button type="submit" disabled={carregando} style={styles.button}>
            {carregando ? "Enviando..." : "Enviar instruções"}
          </button>
        </form>

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
