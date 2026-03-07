// =============================================================
// SERVICE API - Instance Axios centralisee
// Au lieu de repeter l'URL du backend partout,
// on cree une seule instance configuree ici
// Usage : import api from "../services/api";
//         api.get("/products") → GET http://localhost:5001/api/products
// =============================================================

import axios from "axios";

// Vite : les variables d'env doivent commencer par VITE_
// Définir VITE_API_URL dans .env (ex: http://localhost:5001/api)
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
    baseURL,
    timeout: 10000,
});

// 🔐 Ajouter automatiquement le token si présent
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ⚠️ Gestion des erreurs globales (ex: token expiré)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            // optionnel : redirection login
            // window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;
