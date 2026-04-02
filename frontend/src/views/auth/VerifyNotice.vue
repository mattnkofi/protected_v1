<template>
    <div
        class="min-h-screen w-full flex items-center justify-center container-bg-dark transition-colors duration-500 font-sans p-0 sm:p-6">

        <div class="w-full max-w-4xl flex flex-col md:flex-row overflow-hidden sm:rounded-2xl">

            <div class="relative w-full md:w-1/2 h-48 md:h-auto flex items-center justify-center bg-cover bg-center overflow-hidden"
                :style="{ backgroundImage: `url(${hero})` }">

                <div class="absolute inset-0 bg-calm-lavender-300 dark:bg-calm-lavender-800 opacity-70">
                </div>

                <div class="absolute inset-0 bg-abyss-900/10"></div>

                <div
                    class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-platinum-50 dark:from-abyss-800 to-transparent md:hidden z-10">
                </div>

                <div class="relative z-20 p-4">
                    <div
                        class="inline-flex items-center justify-center h-16 w-16 md:h-24 md:w-24 rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 shadow-2xl group transition-transform duration-500 hover:scale-105">
                        <MailIcon
                            class="w-8 h-8 md:w-12 md:h-12 text-white drop-shadow-lg group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                </div>
            </div>

            <div
                class="w-full md:w-1/2 p-6 sm:p-10 relative z-20 border-t-0 border-r-0 border-b-0 rounded-none mt-6 sm:mt-0 sm:border-t-2 sm:border-b-2 sm:border-r-2 sm:border-calm-lavender-300 sm:dark:border-calm-lavender-800/50 sm:rounded-r-2xl container-bg-dark">
                <div class="w-full max-w-sm mx-auto">

                    <div class="mb-6 text-center sm:text-left mt-[-1rem] md:mt-0">
                        <p class="heading-subtitle mb-2">Action Required</p>
                        <h1 class="form-title mb-1">
                            Check Email
                        </h1>
                        <p class="form-subtitle">
                            We have sent a verification link to your inbox.
                        </p>
                    </div>

                    <div class="space-y-6">

                        <div
                            class="p-4 rounded-xl bg-platinum-50 dark:bg-abyss-950 border border-platinum-200 dark:border-abyss-800 text-center sm:text-left">
                            <span
                                class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Target
                                Account</span>
                            <span
                                class="text-calm-lavender-600 dark:text-calm-lavender-400 font-bold tracking-wide break-all">
                                {{ model.email || "AUTHORIZED_NODE" }}
                            </span>
                        </div>

                        <form @submit.prevent="onResend" class="space-y-3">
                            <button type="submit"
                                class="w-full py-3 px-4 bg-calm-lavender-600 text-white font-semibold rounded-lg hover:bg-calm-lavender-700 focus:ring-4 focus:ring-calm-lavender-500/30 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                :disabled="isLoading || !isValidEmail || cooldown > 0">

                                <span v-if="!isLoading && cooldown === 0">Resend Email Link</span>

                                <span v-else-if="cooldown > 0" class="flex items-center gap-2">
                                    <span class="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
                                    Wait {{ cooldown }}s
                                </span>

                                <span v-else class="flex items-center gap-2">
                                    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                        </path>
                                    </svg>
                                    Sending...
                                </span>
                            </button>

                            <button @click="refreshFromQuery" type="button"
                                class="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors bg-platinum-100/50 dark:bg-abyss-900 border border-transparent hover:border-platinum-200 dark:hover:border-abyss-700 rounded-lg">
                                Refresh Status
                            </button>
                        </form>

                        <div
                            class="p-4 bg-calm-lavender-50 dark:bg-calm-lavender-900/20 border border-calm-lavender-100 dark:border-calm-lavender-800/50 rounded-xl flex gap-3 items-start">
                            <div class="mt-0.5 text-calm-lavender-500">
                                <InfoIcon class="w-4 h-4" />
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Quick Tip</h4>
                                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Don't see it? Check your <span class="text-calm-lavender-600 font-medium">Spam/Junk
                                        folder</span>. Verification links expire in 1 hour.
                                </p>
                            </div>
                        </div>

                        <div
                            class="flex items-center justify-between border-t border-platinum-200 dark:border-abyss-800 pt-6 px-1">
                            <router-link :to="{ name: 'login' }"
                                class="text-xs font-medium text-slate-500 hover:text-calm-lavender-600 transition-colors">
                                Return to Sign In
                            </router-link>
                            <router-link :to="{ name: 'signup' }"
                                class="text-xs font-medium text-slate-500 hover:text-calm-lavender-600 transition-colors">
                                Edit Details
                            </router-link>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Mail as MailIcon, Info as InfoIcon } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useToast } from '@/utils/useToast';

// Imported to match the new Hero layout
import hero from '@/assets/bgimage.jpg';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const toast = useToast();

const COOLDOWN_SEC = 60;

const model = reactive({
    email: route.query.email?.toString() || auth.pendingEmail || "",
});

const errs = reactive({ email: "" });
const isLoading = ref(false);
const cooldown = ref(0);
let timer = null;

const isValidEmail = computed(() => {
    const v = model.email?.trim() || "";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
});

function startCooldown() {
    cooldown.value = COOLDOWN_SEC;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        cooldown.value -= 1;
        if (cooldown.value <= 0) {
            clearInterval(timer);
            timer = null;
        }
    }, 1000);
}

function refreshFromQuery() {
    const q = route.query.email?.toString() || "";
    if (q) model.email = q;
}

async function onResend() {
    errs.email = "";
    if (!isValidEmail.value) {
        errs.email = "Invalid email address.";
        return;
    }

    try {
        isLoading.value = true;
        auth.setPendingEmail(model.email);
        await auth.resendVerificationEmail(model.email);
        toast.success("Verification email sent!");
        if (cooldown.value === 0) startCooldown();
    } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to resend email.");
    } finally {
        isLoading.value = false;
    }
}

onMounted(() => {
    if (!model.email && auth.pendingEmail) model.email = auth.pendingEmail;
});

onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
});

watch(() => model.email, (val) => auth.setPendingEmail(val));
</script>