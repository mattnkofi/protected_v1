// src/stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api, {
    setAuthToken,
    clearAuthToken,
    getAuthToken,
    setRefreshToken,    // Added from his version
    clearRefreshToken,  // Added from his version
    logout as apiLogout,
    logoutEverywhere as apiLogoutEverywhere
} from "@/utils/api";
import { useToast } from "@/utils/useToast";

export const useAuthStore = defineStore("auth", () => {
    // ===== State =====
    const user = ref(null);
    const isLoading = ref(false);
    const isGoogleLoading = ref(false);
    const pendingEmail = ref(null);
    const activeSessions = ref([]);
    const toast = useToast();

    // ===== Getters =====
    const me = computed(() => user.value);
    const isAuthenticated = computed(() => !!user.value);

    // ===== Actions =====
    async function fetchUser() {
        try {
            const { data } = await api.get("/api/v1/auth/me");
            user.value = data;
            return data;
        } catch (error) {
            user.value = null;
            return null;
        }
    }

    // NEW: Session restoration for the ML features
    async function restoreSession() {
        const token = getAuthToken();
        if (!token) return null;
        return await fetchUser();
    }

    async function signup(payload) {
        isLoading.value = true;
        try {
            const res = await api.post("/api/v1/auth/register", payload);
            toast.success("Account created! Please verify your email to continue.");
            return { success: true, message: res.data.message, email: res.data.email };
        } catch (e) {
            const errorMsg = e.response?.data?.message || "Registration failed.";
            toast.error(errorMsg);
            throw e;
        } finally {
            isLoading.value = false;
        }
    }

    async function login(payload) {
        isLoading.value = true;
        try {
            const { data } = await api.post("/api/v1/auth/login", payload);
            
            // Core Security Update: Store both tokens
            if (data.token) setAuthToken(data.token);
            if (data.refreshToken) setRefreshToken(data.refreshToken);
            
            user.value = data.user;
            toast.success(`Welcome back, ${data.user.name}!`);
            return { ok: true, user: data.user };
        } catch (e) {
            const msg = e?.response?.data?.message || "Login failed. Please check your credentials.";
            toast.error(msg);
            throw e;
        } finally {
            isLoading.value = false;
        }
    }

    async function logout() {
        try { 
            await apiLogout(); 
            toast.info("Session ended. You have been safely logged out.");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clean up all security artifacts
            clearAuthToken();
            clearRefreshToken();
            user.value = null;
            activeSessions.value = [];
        }
        return { ok: true };
    }

    async function changePassword(payload) {
        try {
            const { data } = await api.post("/api/v1/auth/change-password", payload);
            if (data.token) setAuthToken(data.token);
            toast.success("Security Updated: Password changed successfully.");
            return { ok: true, message: data.message };
        } catch (e) {
            const msg = e?.response?.data?.message || "Password Update Failed.";
            toast.error(msg);
            throw e;
        }
    }

    return {
        user, isLoading, isGoogleLoading, isAuthenticated, me, pendingEmail, activeSessions,
        signup, login, logout, fetchUser, restoreSession, changePassword, 
    };
});