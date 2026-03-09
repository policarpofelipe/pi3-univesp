import { useState } from "react";

export default function CadastroForm({
  onSubmit,
  loading = false,
  error = "",
  success = "",
  initialValues = {
    nomeExibicao: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  },
}) {
  const [formData, setFormData] = useState({
    nomeExibicao: initialValues.nomeExibicao || "",
    email: initialValues.email || "",
    senha: initialValues.senha || "",
    confirmarSenha: initialValues.confirmarSenha || "",
  });

  const [validationError, setValidationError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationError) {
      setValidationError("");
    }
  }

  function validateForm() {
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

  function handleSubmit(event) {
    event.preventDefault();

    const errorMessage = validateForm();

    if (errorMessage) {
      setValidationError(errorMessage);
      return;
    }

    if (typeof onSubmit === "function") {
      onSubmit({
        nomeExibicao: formData.nomeExibicao.trim(),
        email: formData.email.trim(),
        senha: formData.senha,
        confirmarSenha: formData.confirmarSenha,
      });
    }
  }

  const displayedError = validationError || error;

  return (
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
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
          style={styles.input}
        />
      </div>

      {displayedError ? <div style={styles.errorBox}>{displayedError}</div> : null}
      {success ? <div style={styles.successBox}>{success}</div> : null}

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? "Cadastrando..." : "Criar conta"}
      </button>
    </form>
  );
}

const styles = {
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
};
