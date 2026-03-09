import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const TOKEN_STORAGE_KEY = "sgt_token";

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const authService = {
  async login({ email, senha }) {
    const response = await api.post("/auth/login", {
      email,
      senha,
    });

    return response.data;
  },

  async register({ nomeExibicao, email, senha }) {
    const response = await api.post("/auth/cadastro", {
      nomeExibicao,
      email,
      senha,
    });

    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post("/auth/esqueci-senha", {
      email,
    });

    return response.data;
  },

  async resetPassword({ token, senha }) {
    const response = await api.post("/auth/redefinir-senha", {
      token,
      senha,
    });

    return response.data;
  },

  async getMe(tokenParam) {
    const config = tokenParam
      ? {
          headers: {
            Authorization: `Bearer ${tokenParam}`,
          },
        }
      : undefined;

    const response = await api.get("/auth/me", config);

    return response.data;
  },

  async logout() {
    const response = await api.post("/auth/logout");

    return response.data;
  },
};

export { api };
export default authService;
