<template>
    <div class="min-h-screen w-full flex items-center justify-center bg-[#fdfcff] dark:bg-[#04020a] font-['Poppins'] relative overflow-hidden p-4 transition-colors duration-700">
        
        <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div class="w-full max-w-[500px] relative z-10 animate-in">
            <div class="bg-white/40 dark:bg-white/[0.03] backdrop-blur-3xl border border-white dark:border-white/10 p-8 sm:p-12 rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)]">
                
                <div class="text-center mb-10">
                    <h1 class="text-4xl font-[900] text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-3">
                        Create <span class="text-transparent bg-clip-text bg-gradient-to-br from-purple-600 via-fuchsia-500 to-fuchsia-600">Account</span>
                    </h1>
                    <p class="text-slate-500 dark:text-slate-400 text-sm font-medium italic">Join ProtectEd and start your learning journey.</p>
                    <div class="h-1.5 w-24 liquid-3d-underline mt-4 rounded-full shadow-[0_10px_20px_rgba(168,85,247,0.3)] mx-auto"></div>
                </div>

                <form @submit.prevent="handleSignUp" class="space-y-5">
                    <div class="space-y-2">
                        <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Email Protocol</label>
                        <input v-model.trim="form.email" type="email" required placeholder="you@example.com"
                            class="w-full px-6 py-4 rounded-[1.5rem] bg-white/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)] dark:shadow-none"
                            :class="{ 'border-red-500/50 focus:ring-red-500/30': errors.email }" />
                        <p v-if="errors.email" class="text-[10px] text-red-500 font-black ml-2 uppercase italic">{{ errors.email }}</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div class="space-y-2">
                            <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Password</label>
                            <input v-model="form.password" type="password" required placeholder="••••••••"
                                class="w-full px-6 py-4 rounded-[1.5rem] bg-white/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)] dark:shadow-none"
                                :class="{ 'border-red-500/50 focus:ring-red-500/30': errors.password }" />
                        </div>
                        <div class="space-y-2">
                            <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Confirm</label>
                            <input v-model="form.confirmPassword" type="password" required placeholder="••••••••"
                                class="w-full px-6 py-4 rounded-[1.5rem] bg-white/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)] dark:shadow-none"
                                :class="{ 'border-red-500/50 focus:ring-red-500/30': errors.confirmPassword }" />
                        </div>
                    </div>
                    <p v-if="errors.password || errors.confirmPassword" class="text-[10px] text-red-500 font-black ml-2 uppercase italic">
                        {{ errors.password || errors.confirmPassword }}
                    </p>

                    <div class="flex items-center gap-3 px-2 py-2">
                        <input id="terms" type="checkbox" v-model="form.agreeToTerms" 
                            class="w-5 h-5 rounded-lg bg-white/5 border-slate-200 dark:border-white/10 text-purple-600 focus:ring-purple-500/40 transition cursor-pointer" />
                        <label for="terms" class="text-[11px] text-slate-500 font-bold italic">
                            I accept the <span class="text-purple-600 hover:text-fuchsia-500 cursor-pointer transition-colors">Terms</span> and 
                            <span class="text-fuchsia-500 hover:text-purple-600 cursor-pointer transition-colors">Privacy Policy</span>
                        </label>
                    </div>

                    <button type="submit" :disabled="isLoading" 
                        class="btn-purple-liquid w-full py-5 text-white font-[900] uppercase tracking-[0.3em] rounded-[1.5rem] transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden group hover:scale-[1.03] active:scale-[0.97] shadow-2xl disabled:opacity-50">
                        <span v-if="!isLoading" class="relative z-10 drop-shadow-lg">Initialize Protocol</span>
                        <div v-else class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <div class="absolute top-[10%] left-[10%] w-full h-full bg-gradient-to-br from-white/30 to-transparent opacity-50 blur-[2px]"></div>
                    </button>
                </form>

                <div class="flex items-center my-10 gap-4">
                    <div class="h-[1px] flex-1 bg-slate-200 dark:bg-white/10"></div>
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Express Entry</span>
                    <div class="h-[1px] flex-1 bg-slate-200 dark:bg-white/10"></div>
                </div>

                <button @click="signUpWithGoogle" :disabled="isGoogleLoading" 
                    class="w-full py-5 rounded-[1.5rem] bg-white/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white dark:hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm">
                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google Protocol
                </button>
            </div>

            <div class="mt-8 text-center">
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic inline-block">
                    Already part of the Academy? 
                </p>
                <router-link :to="{ name: 'login' }" class="text-purple-600 dark:text-fuchsia-400 font-black uppercase tracking-[0.2em] text-[10px] hover:text-fuchsia-500 transition-colors ml-2 underline underline-offset-4 decoration-fuchsia-500">Sign In</router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@stores/auth";
import api from '@/utils/api';
import { useToast } from '@/utils/useToast';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const form = ref({ email: "", password: "", confirmPassword: "", agreeToTerms: false });
const errors = ref({ email: "", password: "", confirmPassword: "" });
const isLoading = ref(false);
const isGoogleLoading = ref(false);

const signUpWithGoogle = async () => {
    isGoogleLoading.value = true;
    try {
        const { data } = await api.get('/api/auth/google/redirect');
        window.location.href = data.authUrl;
    } catch (error) {
        isGoogleLoading.value = false;
        toast.error("Failed to connect to Google. Please try again.");
    }
}

const handleSignUp = async () => {
    errors.value = { email: "", password: "", confirmPassword: "" };

    if (!form.value.email) { errors.value.email = "Email protocol required"; return; }
    if (!form.value.password || form.value.password.length < 8) { errors.value.password = "Minimum 8 characters required"; return; }
    if (form.value.password !== form.value.confirmPassword) { errors.value.confirmPassword = "Access keys do not match"; return; }
    if (!form.value.agreeToTerms) {
        toast.error("Protocol agreement required to continue.");
        return;
    }

    isLoading.value = true;
    try {
        const { success, email, message } = await authStore.signup({
            email: form.value.email,
            password: form.value.password,
            password_confirmation: form.value.confirmPassword,
        });

        if (success) {
            authStore.setPendingEmail(email || form.value.email);
            toast.success("Protocol Initialized Successfully!");
            router.push({ name: "verify-notice", query: { email: email || form.value.email } });
        } else {
            toast.error(message || "Sign up rejected.");
        }
    } catch (err) {
        if (err.details) {
            errors.value.email = err.details?.email;
            errors.value.password = err.details?.password;
            toast.error("Please review protocol errors.");
        } else {
            toast.error(err.message || "An unexpected error occurred.");
        }
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,600;0,700;0,900;1,400;1,700;1,900&display=swap');

/* --- 3D LIQUID PURPLE BUTTON --- */
.btn-purple-liquid {
  background: radial-gradient(circle at 30% 30%, #7c3aed 0%, #4c1d95 55%, #1e1b4b 100%);
  box-shadow: 
    inset -8px -8px 20px rgba(0,0,0,0.6),
    inset 8px 8px 15px rgba(255,255,255,0.2),
    0 25px 50px rgba(76, 29, 149, 0.4);
}

:where(.dark) .btn-purple-liquid {
  background: radial-gradient(circle at 30% 30%, #a855f7 0%, #6d28d9 55%, #2e1065 100%);
}

/* --- VOLUMETRIC UNDERLINE --- */
.liquid-3d-underline {
  background: radial-gradient(circle at 30% 30%, #f472b6 0%, #db2777 55%, #831843 100%);
  box-shadow: inset -2px -2px 5px rgba(0,0,0,0.4), inset 2px 2px 5px rgba(255,255,255,0.4);
}

/* Entrance Animation */
.animate-in {
    animation: slideUpScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUpScale {
    from { opacity: 0; transform: scale(0.95) translateY(40px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}

input {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>