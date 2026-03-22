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
            <svg class="w-8 h-8 md:w-12 md:h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9V6a6 6 0 10-12 0v2h-1v14h14V8h-1zm-6-8a4 4 0 014 4v2H8V6a4 4 0 014-4z" />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="w-full md:w-1/2 p-6 sm:p-10 relative z-20 border-t-0 border-r-0 border-b-0 rounded-none mt-6 sm:mt-0 sm:border-t-2 sm:border-b-2 sm:border-r-2 sm:border-calm-lavender-300 sm:dark:border-calm-lavender-800/50 sm:rounded-r-2xl container-bg-dark flex flex-col justify-center">
        <div class="w-full max-w-sm mx-auto">

          <div class="mb-8 text-center sm:text-left mt-[-1rem] md:mt-0">
            <h1 class="form-title mb-1">
              Forgot Access?
            </h1>
            <p class="form-subtitle">
              Enter your email to reset your password.
            </p>
          </div>

          <form @submit.prevent="submit" class="space-y-6">

            <div class="space-y-1.5">
              <label for="email" class="block field-label">
                Email Address
              </label>
              <input id="email" v-model.trim="email" type="email" placeholder="you@example.com" required
                class="input-field" :class="{ 'input-field-error': fieldError }" />
              <p v-if="fieldError" class="field-subtext-error">{{ fieldError }}</p>
            </div>

            <button type="submit" :disabled="loading"
              class="w-full py-3 px-4 main-button-text bg-calm-lavender-600 text-white rounded-lg 
                                   hover:bg-calm-lavender-700 focus:ring-4 focus:ring-calm-lavender-500/30
                                   disabled:opacity-70 disabled:cursor-not-allowed
                                   transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              <span v-if="!loading">Send Reset Link</span>
              <span v-else class="flex items-center gap-2">
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </span>
            </button>
          </form>

          <div class="mt-8 pt-6 text-center link-lavender">
            <router-link :to="{ name: 'login' }"
              class="inline-flex items-center justify-center gap-2 return-button-text">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to secure login
            </router-link>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from "vue-router";
import { useAuthStore } from "@stores/auth";
import { useToast } from '@/utils/useToast';

// Import Hero Image for the left pane
import hero from '@/assets/bgimage.jpg';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const email = ref('')
const loading = ref(false)
const fieldError = ref('')

async function submit() {
  fieldError.value = ''
  loading.value = true

  try {
    await authStore.requestPasswordReset(email.value);
    toast.success('If that email exists, a reset link has been sent.');
    email.value = '';
  } catch (e) {
    const data = e?.response?.data;
    if (data?.errors?.email) {
      fieldError.value = data.errors.email[0];
    } else {
      toast.error(data?.message || 'Something went wrong. Please try again.');
    }
  } finally {
    loading.value = false;
  }
}
</script>