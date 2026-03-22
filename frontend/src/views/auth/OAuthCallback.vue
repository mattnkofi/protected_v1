<template>
  <div
    class="min-h-screen w-full flex items-center justify-center container-bg-dark transition-colors duration-500 font-sans p-0 sm:p-6">

    <div class="auth-container">

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
            class="inline-flex items-center justify-center h-16 w-16 md:h-24 md:w-24 rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 shadow-2xl group transition-transform duration-500"
            :class="{ 'animate-pulse': !error }">
            <svg class="w-8 h-8 md:w-12 md:h-12 text-white drop-shadow-lg" :class="{ 'animate-spin': !error }"
              style="animation-duration: 3s;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="w-full md:w-1/2 p-6 sm:p-10 relative z-20 border-t-0 border-r-0 border-b-0 rounded-none mt-6 sm:mt-0 sm:border-t-2 sm:border-b-2 sm:border-r-2 sm:border-calm-lavender-300 sm:dark:border-calm-lavender-800/50 sm:rounded-r-2xl container-bg-dark flex flex-col justify-center">
        <div class="w-full max-w-sm mx-auto text-center sm:text-left">

          <div v-if="!error" class="space-y-8 mt-[-1rem] md:mt-0">
            <div class="space-y-2">
              <h1 class="form-title mb-1 !w-full sm:!w-fit mx-auto sm:mx-0">
                Syncing Account
              </h1>
              <p class="form-subtitle">
                Connecting with Google Secure Auth...
              </p>
            </div>

            <div class="relative h-1.5 w-full bg-slate-200 dark:bg-abyss-800 rounded-full overflow-hidden shadow-inner">
              <div class="absolute inset-0 bg-calm-lavender-500 animate-pulse"></div>
            </div>
          </div>

          <div v-else class="space-y-8 mt-[-1rem] md:mt-0">
            <div class="space-y-2">
              <h1 class="form-title mb-1 !w-full sm:!w-fit mx-auto sm:mx-0 !from-red-600 !to-orange-500">
                Sync Failed
              </h1>
              <p class="form-subtitle text-red-500 dark:text-red-400">
                {{ error }}
              </p>
            </div>

            <router-link :to="{ name: 'login' }"
              class="w-full py-3 px-4 bg-calm-lavender-600 text-white font-semibold rounded-lg 
                                   hover:bg-calm-lavender-700 focus:ring-4 focus:ring-calm-lavender-500/30
                                   transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              <span>Return to Login</span>
            </router-link>
          </div>

          <div class="mt-12 pt-6 border-t border-platinum-200 dark:border-abyss-800 text-center">
            <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              ProtectEd Security Protocol
            </p>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { setAuthToken } from '@/utils/api';
import { useToast } from '@/utils/useToast';
import api from '@/utils/api';

// Imported to match the new Hero layout
import hero from '@/assets/bgimage.jpg';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const toast = useToast();
const error = ref(null);

onMounted(async () => {
  const code = route.query.code;
  if (!code) {
    error.value = "Authorization code not found.";
    return;
  }

  try {
    const { data } = await api.post('/api/v1/auth/google/exchange', { code });
    setAuthToken(data.token);
    auth.user = data.user;
    toast.success(`Identity Verified. Welcome!`);
    router.replace({ name: 'user.dashboard' });
  } catch (err) {
    error.value = err.response?.data?.message || "Google synchronization failed.";
  }
});
</script>