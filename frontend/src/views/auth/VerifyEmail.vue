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
                        class="inline-flex items-center justify-center h-16 w-16 md:h-24 md:w-24 rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 shadow-2xl transition-all duration-500">

                        <svg v-if="status === 'loading'"
                            class="w-8 h-8 md:w-12 md:h-12 text-white drop-shadow-lg animate-spin" fill="none"
                            viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>

                        <svg v-else-if="status === 'success'"
                            class="w-8 h-8 md:w-12 md:h-12 text-green-300 drop-shadow-lg" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>

                        <svg v-else class="w-8 h-8 md:w-12 md:h-12 text-red-300 drop-shadow-lg" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>
            </div>

            <div
                class="w-full md:w-1/2 p-6 sm:p-10 relative z-20 border-t-0 border-r-0 border-b-0 rounded-none mt-6 sm:mt-0 sm:border-t-2 sm:border-b-2 sm:border-r-2 sm:border-calm-lavender-300 sm:dark:border-calm-lavender-800/50 sm:rounded-r-2xl container-bg-dark flex flex-col justify-center">
                <div class="w-full max-w-sm mx-auto text-center sm:text-left">

                    <div v-if="status === 'loading'" class="space-y-6 mt-[-1rem] md:mt-0">
                        <div class="space-y-2">
                            <h1 class="form-title mb-1 !w-full sm:!w-fit mx-auto sm:mx-0">
                                Verifying Identity
                            </h1>
                            <p class="form-subtitle">
                                Please wait while we secure your account node.
                            </p>
                        </div>

                        <div
                            class="relative h-1.5 w-full bg-slate-200 dark:bg-abyss-800 rounded-full overflow-hidden shadow-inner">
                            <div class="absolute inset-0 bg-calm-lavender-500 animate-pulse"></div>
                        </div>
                    </div>

                    <div v-else-if="status === 'success'" class="space-y-6 mt-[-1rem] md:mt-0">
                        <div class="space-y-2">
                            <h1 class="form-title mb-1 !w-full sm:!w-fit mx-auto sm:mx-0 !from-green-500 !to-teal-400">
                                Access Confirmed
                            </h1>
                            <p class="form-subtitle text-slate-600 dark:text-slate-300">
                                Your account is now fully active. You can now proceed to initialize your dashboard.
                            </p>
                        </div>

                        <router-link :to="{ name: 'login' }"
                            class="w-full py-3 px-4 mt-4 bg-calm-lavender-600 text-white font-semibold rounded-lg 
                                   hover:bg-calm-lavender-700 focus:ring-4 focus:ring-calm-lavender-500/30
                                   transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                            <span>Enter Platform</span>
                        </router-link>
                    </div>

                    <div v-else class="space-y-6 mt-[-1rem] md:mt-0">
                        <div class="space-y-2">
                            <h1 class="form-title mb-1 !w-full sm:!w-fit mx-auto sm:mx-0 !from-red-600 !to-orange-500">
                                Signal Failed
                            </h1>
                            <p class="form-subtitle text-red-500 dark:text-red-400">
                                {{ errorMessage }}
                            </p>
                        </div>

                        <div class="flex flex-col gap-3 mt-4">
                            <router-link :to="{ name: 'verify-notice' }"
                                class="w-full py-3 px-4 bg-white dark:bg-abyss-900 border border-platinum-300 dark:border-abyss-700 text-slate-700 dark:text-platinum-300 font-semibold rounded-lg hover:bg-platinum-50 dark:hover:bg-abyss-800 focus:ring-4 focus:ring-platinum-200 dark:focus:ring-abyss-800 transition-all duration-200 text-center shadow-sm hover:shadow">
                                Request New Link
                            </router-link>

                            <router-link :to="{ name: 'login' }"
                                class="text-sm font-medium text-slate-500 hover:text-calm-lavender-600 transition-colors mt-2">
                                Cancel and return to login
                            </router-link>
                        </div>
                    </div>

                    <div class="mt-8 pt-6 border-t border-platinum-200 dark:border-abyss-800 text-center">
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/utils/api'

// Imported to match the new Hero layout
import hero from '@/assets/bgimage.jpg';

const route = useRoute()
const status = ref('loading')
const errorMessage = ref('')

onMounted(async () => {
    const token = route.query.token

    if (!token) {
        status.value = 'error'
        errorMessage.value = 'The verification signal is missing. Please check your email link.'
        return
    }

    try {
        await api.get(`/api/v1/auth/verify-email?token=${token}`)
        status.value = 'success'
    } catch (error) {
        status.value = 'error'
        errorMessage.value = error.response?.data?.message || 'This link has expired or is no longer valid.'
    }
})
</script>