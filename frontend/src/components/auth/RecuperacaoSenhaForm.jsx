import { useState } from "react";

export default function RecuperacaoSenhaForm({
  onSubmit,
  loading = false,
  error = "",
  success = "",
  initialValues = {
    email: "",
  },
}) {
  const [email, setEmail] = useState(initialValues.email || "");
  const [validationError, setValidationError] = useState("");

  function handleChange(event) {
    setEmail(event.target.value);

    if (validationError) {
      setValidationError("");
    }
  }

  function validateForm() {
    const emailLimpo = email.trim();

    if (!emailLimpo) {
      return "Informe o e-mail cadastrado.";
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
        email: email.trim(),
      });
    }
  }

  const displayedError = validationError || error;

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
          value={email}
          onChange={handleChange}
          autoComplete="email"
          disabled={loading}
          style={styles.input}
        />
      </div>

      {displayedError ? <div style={styles.errorBox}>{displayedError}</div> : null}
      {success ? <div style={styles.successBox}>{success}</div> : null}

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? "Enviando..." : "Enviar instruções"}
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
