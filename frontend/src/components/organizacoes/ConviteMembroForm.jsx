import React, { useMemo, useState } from "react";
import Button from "../ui/Button";

/*
Contrato sugerido:
- loading?: estado externo de submissão
- onSubmit(payload): função async/sync
- defaultRole?: papel inicial
- showMessage?: exibe mensagens internas de sucesso/erro

Payload gerado:
{
  email,
  nome,
  papel,
  mensagem
}
*/

const ROLE_OPTIONS = [
  { value: "member", label: "Membro" },
  { value: "viewer", label: "Leitor" },
  { value: "admin", label: "Administrador" },
];

const DEFAULT_VALUES = {
  nome: "",
  email: "",
  papel: "member",
  mensagem: "",
};

function normalizeValues(defaultRole) {
  return {
    ...DEFAULT_VALUES,
    papel: defaultRole || DEFAULT_VALUES.papel,
  };
}

function validate(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = "O e-mail do membro é obrigatório.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  if (values.nome && values.nome.trim().length > 120) {
    errors.nome = "O nome deve ter no máximo 120 caracteres.";
  }

  if (!values.papel) {
    errors.papel = "Selecione um papel.";
  }

  if (values.mensagem && values.mensagem.length > 500) {
    errors.mensagem = "A mensagem deve ter no máximo 500 caracteres.";
  }

  return errors;
}

export default function ConviteMembroForm({
  loading = false,
  onSubmit,
  defaultRole = "member",
  showMessage = true,
}) {
  const initialValues = useMemo(() => normalizeValues(defaultRole), [defaultRole]);

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  function updateField(name, value) {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    updateField(name, value);
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(values));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const preparedValues = {
      nome: values.nome.trim(),
      email: values.email.trim().toLowerCase(),
      papel: values.papel,
      mensagem: values.mensagem.trim(),
    };

    const nextErrors = validate(preparedValues);
    setErrors(nextErrors);
    setTouched({
      nome: true,
      email: true,
      papel: true,
      mensagem: true,
    });
    setSubmitError("");
    setSubmitSuccess("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (typeof onSubmit !== "function") {
      return;
    }

    try {
      await onSubmit(preparedValues);
      setSubmitSuccess("Convite enviado com sucesso.");
      setValues(initialValues);
      setTouched({});
      setErrors({});
    } catch (error) {
      setSubmitError(error?.message || "Não foi possível enviar o convite.");
    }
  }

  const mensagemLength = values.mensagem.length;

  return (
    <form
      onSubmit={handleSubmit}
      className="convite-membro-form"
      noValidate
    >
      <div className="convite-membro-form__field">
        <label
          htmlFor="convite-membro-email"
          className="convite-membro-form__label"
        >
          E-mail
        </label>
        <input
          id="convite-membro-email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="membro@empresa.com"
          aria-invalid={Boolean(touched.email && errors.email)}
          aria-describedby={
            touched.email && errors.email
              ? "convite-membro-email-erro"
              : "convite-membro-email-ajuda"
          }
        />
        {touched.email && errors.email ? (
          <p
            id="convite-membro-email-erro"
            className="convite-membro-form__field-feedback convite-membro-form__field-feedback--error"
            role="alert"
          >
            {errors.email}
          </p>
        ) : (
          <p
            id="convite-membro-email-ajuda"
            className="convite-membro-form__field-feedback convite-membro-form__field-feedback--hint"
          >
            O convite será enviado para este endereço.
          </p>
        )}
      </div>

      <div className="convite-membro-form__field">
        <label
          htmlFor="convite-membro-nome"
          className="convite-membro-form__label"
        >
          Nome do membro
        </label>
        <input
          id="convite-membro-nome"
          name="nome"
          type="text"
          value={values.nome}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Opcional"
          aria-invalid={Boolean(touched.nome && errors.nome)}
          aria-describedby={touched.nome && errors.nome ? "convite-membro-nome-erro" : undefined}
        />
        {touched.nome && errors.nome ? (
          <p
            id="convite-membro-nome-erro"
            className="convite-membro-form__field-feedback convite-membro-form__field-feedback--error"
            role="alert"
          >
            {errors.nome}
          </p>
        ) : null}
      </div>

      <div className="convite-membro-form__field">
        <label
          htmlFor="convite-membro-papel"
          className="convite-membro-form__label"
        >
          Papel inicial
        </label>
        <select
          id="convite-membro-papel"
          name="papel"
          value={values.papel}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={Boolean(touched.papel && errors.papel)}
          aria-describedby={touched.papel && errors.papel ? "convite-membro-papel-erro" : undefined}
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {touched.papel && errors.papel ? (
          <p
            id="convite-membro-papel-erro"
            className="convite-membro-form__field-feedback convite-membro-form__field-feedback--error"
            role="alert"
          >
            {errors.papel}
          </p>
        ) : null}
      </div>

      <div className="convite-membro-form__field">
        <label
          htmlFor="convite-membro-mensagem"
          className="convite-membro-form__label"
        >
          Mensagem opcional
        </label>
        <textarea
          id="convite-membro-mensagem"
          name="mensagem"
          rows={4}
          value={values.mensagem}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Adicione uma mensagem curta ao convite."
          aria-invalid={Boolean(touched.mensagem && errors.mensagem)}
          aria-describedby={
            touched.mensagem && errors.mensagem
              ? "convite-membro-mensagem-erro"
              : "convite-membro-mensagem-ajuda"
          }
        />
        <div className="convite-membro-form__message-meta">
          {touched.mensagem && errors.mensagem ? (
            <p
              id="convite-membro-mensagem-erro"
              className="convite-membro-form__field-feedback convite-membro-form__field-feedback--error"
              role="alert"
            >
              {errors.mensagem}
            </p>
          ) : (
            <p
              id="convite-membro-mensagem-ajuda"
              className="convite-membro-form__field-feedback convite-membro-form__field-feedback--hint"
            >
              Campo opcional. Máximo de 500 caracteres.
            </p>
          )}

          <span
            className="convite-membro-form__counter"
            aria-live="polite"
          >
            {mensagemLength}/500
          </span>
        </div>
      </div>

      {showMessage && submitError ? (
        <div
          className="convite-membro-form__feedback convite-membro-form__feedback--error"
          role="alert"
        >
          {submitError}
        </div>
      ) : null}

      {showMessage && submitSuccess ? (
        <div
          className="convite-membro-form__feedback convite-membro-form__feedback--success"
          role="status"
        >
          {submitSuccess}
        </div>
      ) : null}

      <div className="convite-membro-form__actions">
        <Button type="submit" variant="primary" loading={loading}>
          Enviar convite
        </Button>

        <Button
          type="button"
          variant="ghost"
          disabled={loading}
          onClick={() => {
            setValues(initialValues);
            setErrors({});
            setTouched({});
            setSubmitError("");
            setSubmitSuccess("");
          }}
        >
          Limpar
        </Button>
      </div>
    </form>
  );
}