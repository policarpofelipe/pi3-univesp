import { useState } from "react";

export default function LoginForm({
  onSubmit,
  loading = false,
  error = "",
  initialValues = { email: "", senha: "" },
}) {
  const [formData, setFormData] = useState({
    email: initialValues.email || "",
    senha: initialValues.senha || "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (typeof onSubmit === "function") {
      onSubmit({
        email: formData.email.trim(),
        senha: formData.senha,
      });
    }
  }

  return (
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
          placeholder="Digite sua senha"
          value={formData.senha}
          onChange={handleChange}
          autoComplete="current-password"
          disabled={loading}
          style={styles.input}
        />
      </div>

      {error ? <div style={styles.errorBox}>{error}</div> : null}

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? "Entrando..." : "Entrar"}
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
};
