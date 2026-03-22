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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="w-full md:w-1/2 p-6 sm:p-10 relative z-20 border-t-0 border-r-0 border-b-0 rounded-none mt-6 sm:mt-0 sm:border-t-2 sm:border-b-2 sm:border-r-2 sm:border-calm-lavender-300 sm:dark:border-calm-lavender-800/50 sm:rounded-r-2xl container-bg-dark">
        <div class="w-full max-w-sm mx-auto">

          <div v-if="isFirstLogin"
            class="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 flex gap-3 items-start animate-in">
            <div class="mt-0.5 text-blue-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Security First</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Protect student data by choosing a unique, high-strength password for your facilitator account.
              </p>
            </div>
          </div>

          <div class="mb-8 text-center sm:text-left mt-[-1rem] md:mt-0">
            <h1 class="form-title mb-1">
              {{ isFirstLogin ? 'Set' : 'Update' }} Access
            </h1>
            <p class="form-subtitle">
              Configure your secure facilitator credentials.
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">

            <div v-if="!isFirstLogin" class="space-y-1.5">
              <label for="currentPassword" class="block field-label">Current Key</label>
              <input id="currentPassword" v-model="form.currentPassword" type="password" placeholder="••••••••" required
                class="input-field" :class="{ 'input-field-error': errors.currentPassword }" />
              <p v-if="errors.currentPassword" class="field-subtext-error">{{ errors.currentPassword }}</p>
            </div>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <label for="newPassword" class="block field-label">New Access Key</label>
                <input id="newPassword" v-model="form.newPassword" type="password" placeholder="••••••••" required
                  @input="validatePassword" class="input-field" :class="{ 'input-field-error': errors.newPassword }" />
                <p v-if="errors.newPassword" class="field-subtext-error">{{ errors.newPassword }}</p>
              </div>

              <div v-if="form.newPassword" class="space-y-3 px-1.5 animate-in">
                <div class="w-full bg-slate-200 dark:bg-abyss-800 rounded-full h-1 overflow-hidden shadow-inner">
                  <div class="h-full transition-all duration-700 ease-out animate-pulse" :class="strengthBarColor"
                    :style="{ width: strengthWidth }"></div>
                </div>
                <div class="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  <div v-for="(check, key) in passwordChecksDisplay" :key="key"
                    class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide transition-all duration-300"
                    :class="check.valid ? 'text-calm-lavender-600 dark:text-calm-lavender-400' : 'text-slate-400 dark:text-slate-600'">
                    <div class="w-1 h-1 rounded-full bg-current"></div> {{ check.label }}
                  </div>
                </div>
              </div>

              <div class="space-y-1.5">
                <label for="confirm" class="block field-label">Repeat Key</label>
                <input id="confirm" v-model="form.confirmPassword" type="password" placeholder="••••••••" required
                  class="input-field" :class="{ 'input-field-error': errors.confirmPassword }" />
                <p v-if="errors.confirmPassword" class="field-subtext-error">{{ errors.confirmPassword }}</p>
              </div>
            </div>

            <div class="pt-4 pb-2">
              <button type="submit" :disabled="isLoading || !isPasswordValid"
                class="w-full py-3 px-4 bg-calm-lavender-600 text-white font-semibold rounded-lg 
                                       hover:bg-calm-lavender-700 focus:ring-4 focus:ring-calm-lavender-500/30
                                       disabled:opacity-60 disabled:cursor-not-allowed
                                       transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                <span v-if="!isLoading" class="relative z-10 drop-shadow-xl">{{ isFirstLogin ? 'Set & Authorize' :
                  'Sync Credentials' }}</span>
                <div v-else class="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              </button>
            </div>

          </form>

          <div v-if="!isFirstLogin" class="mt-4 pt-4 border-t border-platinum-200 dark:border-abyss-800 text-center">
            <router-link :to="{ name: 'facilitator.dashboard' }"
              class="text-xs font-medium text-slate-500 hover:text-calm-lavender-600 transition-colors">
              Cancel and return to dashboard
            </router-link>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/utils/useToast';

// Imported to match the new Hero layout
import hero from '@/assets/bgimage.jpg';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const isFirstLogin = computed(() => route.query.firstLogin === 'true');

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const errors = ref({});
const isLoading = ref(false);

// Synchronized Password validation logic
const passwordChecks = computed(() => ({
  length: form.value.newPassword.length >= 8,
  uppercase: /[A-Z]/.test(form.value.newPassword),
  number: /[0-9]/.test(form.value.newPassword)
}));

const passwordChecksDisplay = computed(() => [
  { label: '8+ Characters', valid: passwordChecks.value.length },
  { label: 'Uppercase', valid: passwordChecks.value.uppercase },
  { label: 'Number', valid: passwordChecks.value.number },
  { label: 'Match', valid: form.value.newPassword && form.value.newPassword === form.value.confirmPassword }
]);

const passwordStrength = computed(() => {
  if (!form.value.newPassword) return 0;
  return Object.values(passwordChecks.value).filter(Boolean).length;
});

const strengthWidth = computed(() => {
  const count = Object.values(passwordChecksDisplay.value).filter(c => c.valid).length;
  return ['25%', '50%', '75%', '100%'][count - 1] || '0%';
});

const strengthBarColor = computed(() => {
  const count = Object.values(passwordChecksDisplay.value).filter(c => c.valid).length;
  return ['bg-red-500', 'bg-calm-lavender-500', 'bg-calm-lavender-600', 'bg-purple-600'][count - 1] || 'bg-slate-500';
});

const isPasswordValid = computed(() => {
  return Object.values(passwordChecks.value).every(Boolean) &&
    form.value.newPassword === form.value.confirmPassword;
});

const validatePassword = () => {
  errors.value.newPassword = '';
};

const handleSubmit = async () => {
  errors.value = {};
  isLoading.value = true;

  try {
    const payload = {
      password: form.value.newPassword,
      password_confirmation: form.value.confirmPassword
    };

    if (!isFirstLogin.value) payload.current_password = form.value.currentPassword;

    const result = await authStore.changePassword(payload);

    if (result.ok) {
      toast.success('Access keys updated.');
      router.push({ name: 'facilitator.dashboard' });
    }
  } catch (error) {
    toast.error(error.message || 'Update rejected.');
    if (error.message.includes('Current password')) errors.value.currentPassword = error.message;
    else errors.value.newPassword = error.message;
  } finally {
    isLoading.value = false;
  }
};
</script>