import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = "sgt_token";
const USER_STORAGE_KEY = "sgt_usuario";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(token && usuario);

  const persistAuth = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUsuario(newUser);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUsuario(null);
  }, []);

  useEffect(() => {
    async function loadSession() {
      try {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (!storedToken || !storedUser) {
          clearAuth();
          return;
        }

        const parsedUser = JSON.parse(storedUser);

        setToken(storedToken);
        setUsuario(parsedUser);

        // Opcional: validar sessão no backend e atualizar dados do usuário
        // Esperado no authService:
        // getMe(token) -> { usuario }
        if (typeof authService.getMe === "function") {
          const response = await authService.getMe(storedToken);
          const freshUser = response?.usuario || response?.data?.usuario || parsedUser;

          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUser));
          setUsuario(freshUser);
        }
      } catch (error) {
        clearAuth();
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [clearAuth]);

  const login = useCallback(
    async (email, senha) => {
      const response = await authService.login({ email, senha });

      const responseData = response?.data || response;
      const newToken = responseData?.token;
      const newUser = responseData?.usuario;

      if (!newToken || !newUser) {
        throw new Error("Resposta de autenticação inválida.");
      }

      persistAuth(newToken, newUser);

      return responseData;
    },
    [persistAuth]
  );

  const register = useCallback(async ({ nomeExibicao, email, senha }) => {
    const response = await authService.register({
      nomeExibicao,
      email,
      senha,
    });

    return response?.data || response;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (typeof authService.logout === "function") {
        await authService.logout();
      }
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const updateUsuario = useCallback(
    (updatedUser) => {
      if (!updatedUser) return;

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setUsuario(updatedUser);
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      usuario,
      token,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      updateUsuario,
    }),
    [usuario, token, loading, isAuthenticated, login, register, logout, updateUsuario]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext deve ser usado dentro de AuthProvider.");
  }

  return context;
}

export default AuthContext;
