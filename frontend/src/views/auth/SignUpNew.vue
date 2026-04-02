<template>
  <div
    class="min-h-screen w-full flex items-center justify-center container-bg-dark transition-colors duration-500 font-sans p-0 sm:p-6">

    <div class="w-full max-w-4xl flex flex-col md:flex-row overflow-hidden sm:rounded-2xl">

      <div
        class="relative w-full md:w-1/2 h-48 md:h-auto flex items-center justify-center bg-cover bg-center overflow-hidden"
        :style="{ backgroundImage: `url(${hero})` }">

        <div class="absolute inset-0 bg-calm-lavender-300 dark:bg-calm-lavender-800 opacity-70">
        </div>

        <div class="absolute inset-0 bg-abyss-900/10"></div>

        <div
          class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-platinum-50 dark:from-abyss-800 to-transparent md:hidden z-10">
        </div>

        <div class="relative z-20 p-4">
          <div
            class="inline-flex items-center justify-center h-16 w-16 md:h-24 md:w-24 rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 shadow-2xl group hover:scale-105 transition-transform duration-500">
            <svg class="w-8 h-8 md:w-12 md:h-12 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="w-full md:w-1/2 p-6 sm:p-10 relative z-20 border-t-0 border-r-0 border-b-0 rounded-none mt-6 sm:mt-0 sm:border-t-2 sm:border-b-2 sm:border-r-2 sm:border-calm-lavender-300 sm:dark:border-calm-lavender-800/50 sm:rounded-r-2xl container-bg-dark">
        <div class="w-full max-w-sm mx-auto">

          <div class="mb-8 text-center sm:text-left mt-[-1rem] md:mt-0">
            <h1 class="form-title mb-1">
              Create Account
            </h1>
            <p class="form-subtitle">
              Join us to start your journey.
            </p>
          </div>

          <form @submit.prevent="handleSignUp" class="space-y-4">

            <div class="space-y-1.5">
              <label for="email" class="block field-label">
                Email Address
              </label>
              <input id="email" v-model.trim="form.email" type="email" placeholder="you@example.com" required
                class="input-field" :class="{ 'input-field-error': errors.email }" />
              <p v-if="errors.email" class="field-subtext-error">{{ errors.email }}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="password" class="block field-label">
                  Password
                </label>
                <input id="password" v-model="form.password" type="password" placeholder="8+ chars" required
                  class="input-field" :class="{ 'input-field-error': errors.password }" />
              </div>

              <div class="space-y-1.5">
                <label for="confirm" class="block field-label">
                  Confirm
                </label>
                <input id="confirm" v-model="form.confirmPassword" type="password" placeholder="Repeat" required
                  class="input-field" :class="{ 'input-field-error': errors.confirmPassword }" />
              </div>
            </div>
            <p v-if="errors.password || errors.confirmPassword" class="field-subtext-error mt-1">
              {{ errors.password || errors.confirmPassword }}
            </p>

            <div class="flex items-center gap-3 pb-8">
              <input id="terms" type="checkbox" v-model="form.agreeToTerms"
                class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 accent-calm-lavender-600 text-calm-lavender-600 focus:ring-calm-lavender-500 focus:ring-2 transition cursor-pointer" />
              <label for="terms" class="field-subtext">
                I agree to the <a href="#" class="link-lavender">Terms</a> and <a href="#" class="link-lavender">Privacy
                  Policy</a>
              </label>
            </div>

            <button type="submit" :disabled="isLoading || isGoogleLoading"
              class="w-full py-3 px-4 bg-calm-lavender-600 text-white font-semibold rounded-lg 
                                   hover:bg-calm-lavender-700 focus:ring-4 focus:ring-calm-lavender-500/30
                                   disabled:opacity-70 disabled:cursor-not-allowed
                                   transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              <span v-if="!isLoading">Create Account</span>
              <span v-else class="flex items-center gap-2">
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </span>
            </button>
          </form>

          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-platinum-300 dark:border-abyss-600"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="container-bg-dark divider-label">
                Or continue with
              </span>
            </div>
          </div>

          <button @click="signUpWithGoogle" :disabled="isLoading || isGoogleLoading"
            class="button-gray-pink-hover w-full">
            <div v-if="!isGoogleLoading" class="flex items-center gap-3">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google</span>
            </div>
            <div v-else class="flex items-center gap-2">
              <svg class="w-5 h-5 animate-spin text-abyss-600 dark:text-platinum-300" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Connecting...</span>
            </div>
          </button>

          <p class="mt-8 text-center body-subtext">
            Already have an account?
            <router-link :to="{ name: 'login' }" class="link-pink font-semibold">
              Sign in
            </router-link>
          </p>
        </div>
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

// Imported to match the new Hero layout
import hero from '@/assets/bgimage.jpg';

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
    const { data } = await api.get('/api/v1/auth/google/redirect');
    window.location.href = data.authUrl;
  } catch (error) {
    isGoogleLoading.value = false;
    toast.error("Failed to connect to Google. Please try again.");
  }
}

const handleSignUp = async () => {
  errors.value = { email: "", password: "", confirmPassword: "" };

  if (!form.value.email) { errors.value.email = "Email is required"; return; }
  if (!form.value.password || form.value.password.length < 8) { errors.value.password = "Min 8 characters"; return; }
  if (form.value.password !== form.value.confirmPassword) { errors.value.confirmPassword = "Passwords don't match"; return; }
  if (!form.value.agreeToTerms) {
    toast.error("Please agree to terms.");
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
      toast.success("Account created!");
      router.push({ name: "verify-notice", query: { email: email || form.value.email } });
    } else {
      toast.error(message || "Signup failed.");
    }
  } catch (err) {
    if (err.details) {
      errors.value.email = err.details?.email;
      errors.value.password = err.details?.password;
      toast.error("Check the form for errors.");
    } else {
      toast.error(err.message || "Something went wrong.");
    }
  } finally {
    isLoading.value = false;
  }
};
</script>