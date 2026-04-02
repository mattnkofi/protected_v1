<template>
    <div class="page-wrapper animate-in">

        <!-- Page Header -->
        <div class="page-header">
            <div class="space-y-1.5">
                <router-link :to="{ name: 'user.dashboard' }" class="back-btn group mb-2 inline-flex">
                    <ArrowLeftIcon class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to Dashboard</span>
                </router-link>
                <p class="section-eyebrow">Learning Route</p>
                <h1 class="page-title">{{ pathTitle }}</h1>
                <p class="page-subtitle">Complete all modules in this path to master the topic.</p>
            </div>
        </div>

        <!-- Overall Progress -->
        <div class="card">
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-slate-600 dark:text-platinum-400">Overall Progress</span>
                <span class="text-sm font-bold text-calm-lavender-600 dark:text-calm-lavender-400">{{ overallProgress
                    }}%</span>
            </div>
            <div
                class="h-2.5 bg-slate-100 dark:bg-abyss-700 rounded-full overflow-hidden border border-slate-200 dark:border-abyss-500">
                <div class="h-full bg-gradient-to-r from-calm-lavender-500 to-neon-pink-500 rounded-full transition-all duration-700"
                    :style="{ width: overallProgress + '%' }">
                </div>
            </div>
        </div>

        <!-- Modules List -->
        <div class="card overflow-hidden p-0">

            <!-- Loading -->
            <div v-if="isLoading" class="py-20 flex flex-col items-center gap-3">
                <div class="spinner"></div>
                <p class="loading-text">Loading learning path...</p>
            </div>

            <!-- Module Rows -->
            <div v-else class="divide-y divide-slate-100 dark:divide-abyss-600">
                <div v-for="(module, index) in modules" :key="module.id" class="module-row group">
                    <!-- Icon / Status -->
                    <div class="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border transition-colors"
                        :class="module.status === 'completed'
                            ? 'bg-calm-lavender-50 dark:bg-calm-lavender-900/20 border-calm-lavender-200 dark:border-calm-lavender-800/40'
                            : 'bg-slate-50 dark:bg-abyss-700 border-slate-200 dark:border-abyss-500'">
                        {{ module.icon || '📚' }}
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                        <p
                            class="text-sm font-semibold text-slate-800 dark:text-platinum-100 truncate leading-snug group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                            {{ module.name }}
                        </p>
                        <p class="text-xs text-platinum-500 dark:text-platinum-600 mt-0.5">
                            Module {{ index + 1 }} of {{ modules.length }}
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="shrink-0 flex items-center gap-3">
                        <span v-if="module.status === 'completed'" class="badge badge-success hidden sm:inline-flex">
                            Completed
                        </span>

                        <button :class="[
                            'module-btn',
                            module.status === 'completed' ? 'module-btn-review' : 'module-btn-start'
                        ]">
                            {{ module.status === 'completed' ? 'Review' : 'Start' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="!isLoading && modules.length === 0" class="py-20 text-center">
                <div
                    class="inline-flex p-4 bg-slate-50 dark:bg-abyss-700 rounded-2xl border border-slate-100 dark:border-abyss-500 mb-4">
                    <Route class="w-8 h-8 text-platinum-400 dark:text-platinum-600" />
                </div>
                <h3 class="text-base font-semibold text-slate-400 dark:text-platinum-600">Path is empty</h3>
                <p class="text-sm text-platinum-500 mt-1">No modules found in this learning path.</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Route, ArrowLeft as ArrowLeftIcon } from 'lucide-vue-next'
import api from '@/utils/api'

const route = useRoute()
const pathTitle = ref('Learning Path')
const overallProgress = ref(0)
const modules = ref([])
const isLoading = ref(true)

onMounted(async () => {
    const pathId = route.params.id
    try {
        const res = await api.get(`/api/v1/learning-paths/${pathId}`)
        if (res.data) {
            pathTitle.value = res.data.name || 'Learning Path'
            overallProgress.value = res.data.progress || 0
            modules.value = res.data.modules || []
        }
    } catch (error) {
        console.error('[v0] Failed to load learning path:', error.message)
    } finally {
        isLoading.value = false
    }
})
</script>

<style scoped>
@reference "@/style.css";

.page-wrapper {
    @apply space-y-5 text-slate-900 dark:text-white;
}

.page-header {
    @apply pb-5 border-b border-slate-200 dark:border-abyss-600;
}

.page-title {
    @apply font-madimione text-3xl text-slate-800 dark:text-platinum-100 leading-tight;
}

.page-subtitle {
    @apply font-mplusrounded text-sm text-platinum-600 dark:text-platinum-500;
}

.section-eyebrow {
    @apply text-xs font-semibold uppercase tracking-widest text-calm-lavender-600 dark:text-calm-lavender-400;
}

.back-btn {
    @apply flex items-center gap-2 text-xs font-medium text-platinum-500 hover:text-calm-lavender-600 dark:hover:text-calm-lavender-400 transition-colors;
}

.card {
    @apply bg-white dark:bg-abyss-600 border border-slate-200 dark:border-abyss-500 rounded-2xl p-5;
}

.module-row {
    @apply flex items-center gap-5 px-5 py-4 hover:bg-slate-50 dark:hover:bg-abyss-700 transition-colors;
}

.badge {
    @apply px-2.5 py-1 rounded-lg text-xs font-medium;
}

.badge-success {
    @apply bg-safety-teal-50 dark:bg-safety-teal-900/20 text-safety-teal-700 dark:text-safety-teal-400 border border-safety-teal-200 dark:border-safety-teal-800/40;
}

.module-btn {
    @apply px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150;
}

.module-btn-start {
    @apply bg-calm-lavender-600 hover:bg-calm-lavender-700 dark:bg-calm-lavender-700 dark:hover:bg-calm-lavender-600 text-white border border-calm-lavender-700;
}

.module-btn-review {
    @apply bg-slate-100 dark:bg-abyss-700 hover:bg-slate-200 dark:hover:bg-abyss-600 text-slate-600 dark:text-platinum-300 border border-slate-200 dark:border-abyss-500;
}

.spinner {
    @apply w-7 h-7 border-2 border-slate-200 dark:border-abyss-500 border-t-calm-lavender-500 rounded-full animate-spin;
}

.loading-text {
    @apply font-mplusrounded text-sm text-platinum-500;
}

.animate-in {
    animation: fadeSlideUp 0.4s ease-out forwards;
}

@keyframes fadeSlideUp {
    from {
        opacity: 0;
        transform: translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>