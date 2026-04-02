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
                d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="w-full md:w-1/2 p-6 sm:p-10 relative z-20 border-t-0 border-r-0 border-b-0 rounded-none mt-6 sm:mt-0 sm:border-t-2 sm:border-b-2 sm:border-r-2 sm:border-calm-lavender-300 sm:dark:border-calm-lavender-800/50 sm:rounded-r-2xl container-bg-dark">
        <div class="w-full max-w-sm mx-auto">

          <div class="mb-8 text-center sm:text-left mt-[-1rem] md:mt-0">
            <h1 class="form-title mb-1">
              Reset Access
            </h1>
            <p class="form-subtitle">
              Establish a strong protocol to regain entry.
            </p>
          </div>

          <form @submit.prevent="submit" class="space-y-4">

            <div class="space-y-1.5">
              <label class="block field-label">Verified Identity</label>
              <div class="relative">
                <input v-model.trim="email" type="email" readonly
                  class="w-full px-4 py-2.5 rounded-lg border border-platinum-200 dark:border-abyss-800 bg-platinum-50 dark:bg-abyss-950 text-platinum-500 dark:text-abyss-600 cursor-not-allowed outline-none font-medium italic" />
                <Lock class="absolute right-4 top-3 w-4 h-4 text-platinum-300 dark:text-abyss-800" />
              </div>
            </div>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <label for="password" class="block field-label">New Password</label>
                <input id="password" v-model="password" type="password" placeholder="••••••••" required
                  @input="validatePassword" class="input-field" :class="{ 'input-field-error': errors.password }" />
              </div>

              <div v-if="password" class="space-y-3 px-1.5 animate-in">
                <div class="w-full bg-slate-200 dark:bg-abyss-800 rounded-full h-1 overflow-hidden shadow-inner">
                  <div class="h-full transition-all duration-700 ease-out animate-pulse" :class="strengthBarColor"
                    :style="{ width: strengthWidth }">
                  </div>
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
                <label for="confirm" class="block field-label">Repeat Password</label>
                <input id="confirm" v-model="password_confirmation" type="password" placeholder="••••••••" required
                  class="input-field" />
              </div>
            </div>

            <p v-if="errors.password" class="field-subtext-error text-center mt-1 pt-2">{{ errors.password }}</p>

            <div class="pt-4 pb-2">
              <button type="submit" :disabled="loading || !isPasswordValid"
                class="w-full py-3 px-4 bg-calm-lavender-600 text-white font-semibold rounded-lg 
                                       hover:bg-calm-lavender-700 focus:ring-4 focus:ring-calm-lavender-500/30
                                       disabled:opacity-60 disabled:cursor-not-allowed
                                       transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                <span v-if="!loading" class="relative z-10 drop-shadow-xl">Finalize Protocol</span>
                <div v-else class="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              </button>
            </div>

          </form>

          <div class="mt-4 pt-4 border-t border-platinum-200 dark:border-abyss-800 text-center">
            <router-link :to="{ name: 'login' }"
              class="text-xs font-medium text-slate-500 hover:text-calm-lavender-600 transition-colors">
              Cancel and return to login
            </router-link>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from "@stores/auth";
import { useToast } from '@/utils/useToast';
import { Lock } from 'lucide-vue-next';

// Imported to match the new Hero layout
import hero from '@/assets/bgimage.jpg';

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore();
const toast = useToast();

const token = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')

const loading = ref(false)
const errors = ref({ email: '', password: '' })

// Integrated Password validation logic (using global styles)
const passwordChecks = computed(() => ({
  length: password.value.length >= 8,
  uppercase: /[A-Z]/.test(password.value),
  number: /[0-9]/.test(password.value)
}));

const passwordChecksDisplay = computed(() => [
  { label: '8+ Characters', valid: passwordChecks.value.length },
  { label: 'Uppercase', valid: passwordChecks.value.uppercase },
  { label: 'Number', valid: passwordChecks.value.number },
  { label: 'Match', valid: password.value && password.value === password_confirmation.value }
]);

const strengthWidth = computed(() => {
  const count = Object.values(passwordChecks.value).filter(Boolean).length;
  // Map width percentages to standard tailwind fractions
  return ['25%', '50%', '75%', '100%'][count - 1] || '0%';
});

// Stylized bar colors using brand palette
const strengthBarColor = computed(() => {
  const count = Object.values(passwordChecks.value).filter(Boolean).length;
  // Maps: Red-500 -> Lavendar-500 -> Lavendar-600 -> Purple-600
  return ['bg-red-500', 'bg-calm-lavender-500', 'bg-calm-lavender-600', 'bg-purple-600'][count - 1] || 'bg-slate-500';
});

const isPasswordValid = computed(() => {
  return Object.values(passwordChecks.value).every(Boolean) &&
    password.value === password_confirmation.value;
});

const validatePassword = () => { errors.value.password = ''; };

onMounted(() => {
  token.value = route.query.token?.toString() || ''
  email.value = route.query.email?.toString() || ''
})

async function submit() {
  errors.value = { email: '', password: '' }
  loading.value = true

  try {
    await authStore.performPasswordReset({
      token: token.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
    })

    toast.success('System Updated. Re-authorizing...');
    setTimeout(() => router.push({ name: 'login' }), 1500)
  } catch (e) {
    const data = e?.response?.data
    if (data?.errors) {
      errors.value.email = data.errors.email?.[0] || ''
      errors.value.password = data.errors.password?.[0] || ''
    }
    toast.error(data?.message || 'Update rejected.');
  } finally {
    loading.value = false
  }
}
</script>