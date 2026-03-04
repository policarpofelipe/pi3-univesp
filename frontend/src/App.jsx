import { useState } from "react";
import univespLogo from "./assets/imagens/Univesp_logo.jpg";
import "./App.css";

export default function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    // Placeholder: aqui você vai chamar a API depois
    alert(`Login: ${email}`);
  }

  return (
    <div className="bg">
      <div className="card" role="main" aria-label="Tela de login do PI3">
        <header className="header">
          <img className="logo" src={univespLogo} alt="Logo da UNIVESP" />
          <div>
            <h1 className="title">UNIVESP — Projeto Integrador III (PI3)</h1>
            <p className="subtitle">Grupo 3 · 2023</p>
          </div>
        </header>

        <section className="grid">
          <div className="panel">
            <h2 className="h2">Acesso</h2>

            <form onSubmit={onSubmit} className="form" aria-label="Formulário de login">
              <div className="field">
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                />
              </div>

              <div className="field">
                <label htmlFor="senha" className="label">
                  Senha
                </label>
                <div className="passwordRow">
                  <input
                    id="senha"
                    name="senha"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="input"
                  />
                  <button
                    type="button"
                    className="btnGhost"
                    onClick={() => setMostrarSenha((v) => !v)}
                    aria-pressed={mostrarSenha}
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrarSenha ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              <button type="submit" className="btnPrimary">
                Entrar
              </button>

              <p className="hint" aria-live="polite">
                Dica: este login ainda é “mock”. Depois vamos ligar na API.
              </p>
            </form>
          </div>

          <aside className="panel">
            <h2 className="h2">Integrantes</h2>
            <ol className="list" aria-label="Lista de integrantes do Grupo 3">
              <li>Isabella Aparecida Marzola</li>
              <li>Julio Cesar Monteiro dos Santos</li>
              <li>Edenilson Cordeiro Joares</li>
              <li>Ana Flavia Damasceno Silva</li>
              <li>Diogo Katto Mimatani</li>
              <li>Felipe Martins Policarpo</li>
              <li>Norma Terezinha da Silva</li>
              <li>Jair Waldo Jara Palomino</li>
              <li>Cesar Yukio Kato</li>
            </ol>

            <div className="badge" aria-label="Contexto acadêmico">
              <span className="badgeDot" aria-hidden="true" />
              <span>Entrega: PI3 · Sistema de gestão de tarefas</span>
            </div>
          </aside>
        </section>

        <footer className="footer">
          <span>Flivo · Ambiente PI3</span>
          <span className="sep" aria-hidden="true">•</span>
          <span>Acessibilidade: labels, foco visível, sem depender de cor</span>
        </footer>
      </div>
    </div>
  );
}
