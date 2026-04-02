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
            <svg class="w-8 h-8 md:w-12 md:h-12 text-white drop-shadow-lg" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="w-full md:w-1/2 p-6 sm:p-10 relative z-20 border-t-0 border-r-0 border-b-0 rounded-none mt-6 sm:mt-0 sm:border-t-2 sm:border-b-2 sm:border-r-2 sm:border-calm-lavender-300 sm:dark:border-calm-lavender-800/50 sm:rounded-r-2xl container-bg-dark flex flex-col justify-center">
        <div class="w-full max-w-sm mx-auto">

          <Transition name="slide-fade">
            <div v-if="showFirstTimeNotice"
              class="mb-6 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 flex gap-3 items-start relative pr-8">
              <div class="mt-0.5 text-purple-600 dark:text-purple-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  Temporary password from admin is required for first-time login.
                </p>
              </div>
              <button @click="showFirstTimeNotice = false"
                class="absolute top-3 right-3 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </Transition>

          <div class="mb-8 text-center sm:text-left mt-[-1rem] md:mt-0">
            <h1 class="form-title mb-1">
              Facilitator Portal
            </h1>
            <p class="form-subtitle">
              Manage education protocols and track student analytics.
            </p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5">

            <div class="space-y-1.5">
              <label for="email" class="block field-label">Work Email</label>
              <input id="email" v-model.trim="form.email" type="email" placeholder="facilitator@school.edu" required
                class="input-field" />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <label for="password" class="block field-label">Access Key</label>
                <router-link :to="{ name: 'facilitator.forgotPassword' }"
                  class="text-xs font-semibold text-calm-lavender-600 dark:text-calm-lavender-400 hover:text-calm-lavender-700 transition-colors">
                  Reset Key?
                </router-link>
              </div>
              <input id="password" v-model="form.password" type="password" placeholder="••••••••" required
                class="input-field" />
            </div>

            <div class="flex items-center gap-3 pt-1 pb-2">
              <input id="remember" type="checkbox" v-model="form.rememberMe"
                class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 !bg-transparent text-calm-lavender-600 focus:ring-calm-lavender-500 focus:ring-2 transition cursor-pointer" />
              <label for="remember" class="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                Trust device
              </label>
            </div>

            <button type="submit" :disabled="isLoading"
              class="w-full py-3 px-4 bg-calm-lavender-600 text-white font-semibold rounded-lg 
                                   hover:bg-calm-lavender-700 focus:ring-4 focus:ring-calm-lavender-500/30
                                   disabled:opacity-70 disabled:cursor-not-allowed
                                   transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              <span v-if="!isLoading">Enter Portal</span>
              <span v-else class="flex items-center gap-2">
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                Authenticating...
              </span>
            </button>

            <div class="text-center pt-2">
              <a href="mailto:support@protected.edu"
                class="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-calm-lavender-600 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Need Technical Support?
              </a>
            </div>
          </form>

          <div class="mt-8 pt-6 border-t border-platinum-200 dark:border-abyss-800 text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              Switch to
              <router-link :to="{ name: 'login' }"
                class="text-calm-lavender-600 dark:text-calm-lavender-400 font-semibold hover:text-calm-lavender-700 transition-colors ml-1">
                Student Login
              </router-link>
            </p>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/utils/useToast';

// Imported to match the new Hero layout
import hero from '@/assets/bgimage.jpg';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const form = ref({ email: '', password: '', rememberMe: false });
const isLoading = ref(false);
const showFirstTimeNotice = ref(true);

const handleLogin = async () => {
  isLoading.value = true;
  try {
    const result = await authStore.login({
      email: form.value.email,
      password: form.value.password
    });

    if (result.ok && result.user) {
      if (!['educator', 'admin'].includes(result.user.role)) {
        toast.error('Facilitator access only.');
        await authStore.logout();
        return;
      }
      toast.success('System Authorized.');
      if (result.user.requires_password_change) {
        router.push({ name: 'facilitator.changePassword', query: { firstLogin: true } });
      } else {
        router.push({ name: 'facilitator.dashboard' });
      }
    }
  } catch (error) {
    toast.error(error.message || 'Authentication Failed.');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (authStore.isAuthenticated) authStore.logout();
});
</script>

<style scoped>
/* Ensure smooth transition for the First Time Notice */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>