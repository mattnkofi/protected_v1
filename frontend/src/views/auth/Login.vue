<template>
    <AuthShellSvg page-title="Login" :hero-image="hero" :artist="artist">
        <div class="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div class="w-full max-w-md mx-auto relative z-10 font-['Poppins'] animate-in">
            <div class="mb-10 text-center sm:text-left">
                <h1 class="text-5xl font-[900] text-slate-900 dark:text-white mb-3 uppercase italic tracking-tighter leading-none">
                    Welcome <span class="text-transparent bg-clip-text bg-gradient-to-br from-purple-600 via-fuchsia-500 to-fuchsia-600">Back</span>
                </h1>
                <p class="text-slate-500 dark:text-slate-400 font-medium italic">
                    Sign in to access your interactive learning dashboard.
                </p>
                <div class="h-1.5 w-20 liquid-3d-underline mt-4 rounded-full shadow-[0_5px_15px_rgba(168,85,247,0.3)] mx-auto sm:mx-0"></div>
            </div>

            <div class="bg-transparent">
                <form @submit.prevent="handleLogin" class="space-y-7">

                    <div class="space-y-3">
                        <label for="email" class="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">
                            Email Address
                        </label>
                        <input id="email" v-model.trim="form.email" type="email" placeholder="you@example.com" required
                            class="w-full px-6 py-4 rounded-[1.5rem] border border-slate-200 dark:border-white/10 
                                   bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl text-slate-900 dark:text-white
                                   placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500
                                   transition-all duration-300 shadow-[inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-none"
                            :class="{ 'border-red-500 focus:ring-red-500/20': errors.email }" />
                        <p v-if="errors.email" class="text-[10px] text-red-500 mt-1 font-black uppercase italic">{{ errors.email }}</p>
                    </div>

                    <div class="space-y-3">
                        <div class="flex items-center justify-between ml-1">
                            <label for="password" class="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                Password
                            </label>
                            <router-link :to="{ name: 'forgotPassword' }"
                                class="text-[10px] font-black text-purple-600 dark:text-fuchsia-400 hover:text-fuchsia-500 uppercase tracking-tighter transition-colors">
                                Forgot password?
                            </router-link>
                        </div>
                        <input id="password" v-model="form.password" type="password" placeholder="••••••••" required
                            class="w-full px-6 py-4 rounded-[1.5rem] border border-slate-200 dark:border-white/10 
                                   bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl text-slate-900 dark:text-white
                                   placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500
                                   transition-all duration-300 shadow-[inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-none"
                            :class="{ 'border-red-500 focus:ring-red-500/20': errors.password }" />
                        <p v-if="errors.password" class="text-[10px] text-red-500 mt-1 font-black uppercase italic">{{ errors.password }}</p>
                    </div>

                    <button type="submit" :disabled="isLoading || isGoogleLoading"
                        class="btn-purple-liquid w-full py-5 px-6 text-white font-[900] uppercase tracking-[0.3em] rounded-[1.5rem] 
                               disabled:opacity-50 transition-all duration-500 transform active:scale-95 flex items-center justify-center gap-2 overflow-hidden relative">
                        <span v-if="!isLoading" class="relative z-10 drop-shadow-md">Sign In</span>
                        <div v-else class="flex items-center gap-3 relative z-10">
                            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span class="drop-shadow-md">Initializing...</span>
                        </div>
                        <div class="absolute top-[10%] left-[10%] w-full h-full bg-gradient-to-br from-white/30 to-transparent opacity-50 blur-[2px]"></div>
                    </button>
                </form>

                <div class="relative my-10">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-slate-100 dark:border-white/5"></div>
                    </div>
                    <div class="relative flex justify-center">
                        <span class="bg-white dark:bg-[#060606] px-4 text-[9px] text-slate-400 uppercase tracking-[0.4em] font-black italic">
                            Or Connect Protocols
                        </span>
                    </div>
                </div>

                <button @click="loginWithGoogle" :disabled="isLoading || isGoogleLoading" 
                    class="w-full py-5 px-6 rounded-[1.5rem] border border-slate-200 dark:border-white/10
                           bg-white/50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 font-black uppercase tracking-[0.2em] text-[10px]
                           transition-all duration-300 flex items-center justify-center gap-3
                           disabled:opacity-60 shadow-[inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-none hover:bg-white dark:hover:bg-white/5">
                    <div v-if="!isGoogleLoading" class="flex items-center gap-3">
                        <svg class="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Google Sync</span>
                    </div>
                    <div v-else class="flex items-center gap-2">
                        <svg class="w-5 h-5 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Syncing Protocols...</span>
                    </div>
                </button>
            </div>

            <p class="mt-12 text-center text-[11px] text-slate-500 font-bold italic">
                First time in the academy?
                <router-link :to="{ name: 'signup' }"
                    class="text-fuchsia-600 font-black uppercase tracking-tighter hover:text-purple-600 transition-all ml-1">
                    Create a new protocol
                </router-link>
            </p>
        </div>
    </AuthShellSvg>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@stores/auth";
import AuthShellSvg from "@components/ui/auth_design.vue";
import api from '@/utils/api';
import { useToast } from '@/utils/useToast';

// Background Asset
const hero = "/illustrations_1.jpg";
const artist = "Charlie Davis";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const form = ref({ email: "", password: "" });
const errors = ref({ email: "", password: "" });
const isLoading = ref(false);
const isGoogleLoading = ref(false);

const loginWithGoogle = async () => {
    isGoogleLoading.value = true;
    try {
        const { data } = await api.get('/api/auth/google/redirect');
        window.location.href = data.authUrl;
    } catch (error) {
        isGoogleLoading.value = false;
        toast.error("Failed to connect to Google. Please try again.");
    }
}

const handleLogin = async () => {
    errors.value = { email: "", password: "" };

    if (!form.value.email) {
        errors.value.email = "Email protocol is required";
        return;
    }
    if (!form.value.password) {
        errors.value.password = "Access key is required";
        return;
    }

    isLoading.value = true;

    try {
        await authStore.login({
            email: form.value.email,
            password: form.value.password,
        })

        toast.success("Identity Verified. Welcome back.");
        router.push(route.query.redirect || { name: 'user.dashboard' });

    } catch (error) {
        const unverified = error?.unverified;

        if (unverified) {
            const email = form.value.email;
            authStore.setPendingEmail(email);
            toast.info("Please verify your email address.");
            router.push({ name: 'verify-notice', query: { email } });
            return;
        }

        const msg = error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
        toast.error(msg);
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');

/* Entrance Animation */
.animate-in {
    animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUpFade {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

/* 3D Liquid Purple Button */
.btn-purple-liquid {
  background: radial-gradient(circle at 30% 30%, #7c3aed 0%, #4c1d95 55%, #1e1b4b 100%);
  box-shadow: 
    inset -6px -6px 15px rgba(0,0,0,0.7),
    inset 6px 6px 12px rgba(255,255,255,0.2),
    0 20px 40px rgba(76, 29, 149, 0.3);
}

:where(.dark) .btn-purple-liquid {
  background: radial-gradient(circle at 30% 30%, #a855f7 0%, #6d28d9 55%, #2e1065 100%);
}

/* Volumetric Underline */
.liquid-3d-underline {
  background: radial-gradient(circle at 30% 30%, #f472b6 0%, #db2777 55%, #831843 100%);
  box-shadow: inset -2px -2px 5px rgba(0,0,0,0.4), inset 2px 2px 5px rgba(255,255,255,0.4);
}

/* Input Glass Effect */
input {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>