// src/stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api, {
    setAuthToken,
    clearAuthToken,
    getAuthToken,
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

    async function signup(payload) {
        isLoading.value = true;
        try {
            const res = await api.post("/api/v1/auth/register", payload);
            toast.success("Account created! Please verify your email to continue.");
            return { success: true, message: res.data.message, email: res.data.email };
        } catch (e) {
            const errorMsg = e.response?.data?.message || "Registration failed. Please try again.";
            toast.error(errorMsg);
            throw e;
        } finally {
            isLoading.value = false;
        }
    }

    async function restoreSession() {
        if (!getAuthToken()) return null;
        return await fetchUser();
    }

async function login({ email, password }) {
    isLoading.value = true;
    try {
        const res = await api.post("/api/v1/auth/login", { email, password });
        const token = res?.data?.token;

        if (!token) throw new Error("Login failed: Access token missing.");

        setAuthToken(token);
        user.value = res.data.user;
        
        // 🟢 Alisin ang toast.success dito kung mayroon man, sa component na lang
        return { ok: true, user: user.value };
    } catch (e) {
        // 🔴 ALISIN ang toast.error(message) dito!
        // Hayaan ang LoginNew.vue o ang API interceptor ang magpakita ng error.
        
        const data = e?.response?.data;
        throw e; // I-throw lang ang error pabalik sa component
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
            clearAuthToken();
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
        signup, login, logout, fetchUser, restoreSession, changePassword
    };
});