// src/utils/api.js
import axios from "axios";

// ====== Config ======
const API_ORIGIN = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:3000";
const TOKEN_KEY = "jwt";

// ====== Axios base instance ======
const api = axios.create({
    baseURL: API_ORIGIN,
    withCredentials: true, // MANDATORY: Allows browser to send/receive HttpOnly cookies
    timeout: 20000,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json",
    },
});

// ====== Access Token Helpers (LocalStorage is okay for short-lived tokens) ======
export function getAuthToken() {
    try {
        return localStorage.getItem(TOKEN_KEY) || null;
    } catch { return null; }
}

export function setAuthToken(token) {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch { }
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAuthToken() {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch { }
    delete api.defaults.headers.common.Authorization;
}

// Re-init access token on boot
const bootToken = getAuthToken();
if (bootToken) setAuthToken(bootToken);

// ====== Interceptors ======
const RETRY_FLAG = "_retry";
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
    refreshSubscribers.push(callback);
}

function onTokenRefreshed(newToken) {
    refreshSubscribers.forEach(callback => callback(newToken));
    refreshSubscribers = [];
}

// Request Interceptor: Attach Access Token to every request
api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle 401s via Silent Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error;
        if (!response) return Promise.reject(error);

        // If 401 and we haven't tried to refresh yet
        if (response.status === 401 && !config[RETRY_FLAG]) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((newToken) => {
                        config.headers.Authorization = `Bearer ${newToken}`;
                        config[RETRY_FLAG] = true;
                        resolve(api(config));
                    });
                });
            }

            config[RETRY_FLAG] = true;
            isRefreshing = true;

            try {
                // We send an empty body; the browser automatically attaches the HttpOnly cookie
                const { data } = await axios.post(`${API_ORIGIN}/api/v1/auth/refresh`, {}, { withCredentials: true });
                
                const newAccessToken = data?.token;
                setAuthToken(newAccessToken);
                onTokenRefreshed(newAccessToken);
                isRefreshing = false;

                config.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(config);
            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscribers = [];
                clearAuthToken();
                
                // Security Alert: Handle specific reuse detection from backend
                if (refreshError.response?.data?.code === 'TOKEN_REUSE_DETECTED') {
                    alert('Security alert: Multiple login attempts detected. Please log in again.');
                }
                
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export async function logoutEverywhere() {
    try { await api.post("/api/v1/auth/logout-all"); } catch { }
    clearAuthToken();
}

export async function logout() {
    try { await api.post("/api/v1/auth/logout"); } catch { }
    clearAuthToken();
}

export default api;