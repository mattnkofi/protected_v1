<template>
    <div class="page-wrapper animate-in">

        <!-- Page Header -->
        <div class="page-header">
            <div class="space-y-1.5">
                <button @click="router.back()" class="back-btn group mb-2">
                    <ArrowLeftIcon class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Go back</span>
                </button>
                <p class="section-eyebrow">Class Rankings</p>
                <h1 class="page-title">
                    <span class="brand-gradient-text">Leaderboard</span>
                </h1>
                <p class="page-subtitle">See where you stand among your classmates!</p>
            </div>

            <div
                class="hidden lg:flex items-center gap-3 px-5 py-3 bg-white dark:bg-abyss-600 border border-slate-200 dark:border-abyss-500 rounded-2xl">
                <div
                    class="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                    <Trophy class="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <p class="text-sm font-semibold text-slate-700 dark:text-platinum-200 leading-snug">Top Learners</p>
                    <p class="text-xs text-platinum-500 dark:text-platinum-600">Updated daily</p>
                </div>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

            <!-- Leaderboard List -->
            <main class="lg:col-span-8 order-2 lg:order-1">
                <div class="card">

                    <!-- Header Row -->
                    <div
                        class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-abyss-600">
                        <div class="flex items-center gap-2">
                            <Users class="w-4 h-4 text-calm-lavender-500 dark:text-calm-lavender-400" />
                            <span class="text-sm font-medium text-slate-700 dark:text-platinum-200">All Students</span>
                        </div>
                        <ChevronRightIcon class="w-4 h-4 text-platinum-400" />
                    </div>

                    <!-- Loading -->
                    <div v-if="isLoading" class="py-20 flex flex-col items-center gap-3">
                        <div class="spinner"></div>
                        <p class="loading-text">Loading rankings...</p>
                    </div>

                    <!-- List -->
                    <div v-else class="space-y-2">
                        <div v-for="(learner, index) in learners" :key="learner.id" @click="selectedStudent = learner"
                            class="learner-row group"
                            :class="selectedStudent?.id === learner.id ? 'learner-row-active' : ''"
                            :style="{ animationDelay: `${index * 30}ms` }">
                            <!-- Rank -->
                            <div class="flex-shrink-0 w-10 flex justify-center">
                                <div v-if="index < 3">
                                    <div v-if="index === 0"
                                        class="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
                                        <Trophy class="w-4 h-4 text-amber-500 fill-amber-500" />
                                    </div>
                                    <div v-else-if="index === 1"
                                        class="p-1.5 bg-slate-100 dark:bg-abyss-600 rounded-lg border border-slate-200 dark:border-abyss-500">
                                        <Medal class="w-4 h-4 text-slate-400 fill-slate-300" />
                                    </div>
                                    <div v-else
                                        class="p-1.5 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                        <Medal class="w-4 h-4 text-amber-700 fill-amber-700/60" />
                                    </div>
                                </div>
                                <span v-else class="text-sm font-medium text-platinum-400 dark:text-platinum-600">
                                    {{ index + 1 }}
                                </span>
                            </div>

                            <!-- Avatar + Name -->
                            <div class="flex items-center gap-3 flex-1">
                                <div class="relative">
                                    <div
                                        class="w-9 h-9 rounded-xl bg-gradient-to-br from-calm-lavender-500 to-neon-pink-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                        {{ learner.initials || learner.name?.charAt(0) || 'U' }}
                                    </div>
                                    <div v-if="index === 0"
                                        class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border border-white dark:border-abyss-600 flex items-center justify-center">
                                        <Star class="w-2 h-2 text-white fill-current" />
                                    </div>
                                </div>
                                <div>
                                    <p
                                        class="text-sm font-medium text-slate-700 dark:text-platinum-200 group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                                        {{ learner.name }}
                                    </p>
                                    <span class="text-xs text-calm-lavender-500 dark:text-calm-lavender-500">Lv. {{
                                        learner.level }}</span>
                                </div>
                            </div>

                            <!-- XP -->
                            <div
                                class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-abyss-700 rounded-lg border border-slate-100 dark:border-abyss-500 group-hover:border-calm-lavender-200 dark:group-hover:border-calm-lavender-800/50 transition-colors">
                                <Star class="w-3 h-3 text-amber-400 shrink-0" />
                                <span class="text-sm font-semibold text-slate-700 dark:text-platinum-200">{{
                                    learner.points }}</span>
                                <span class="text-xs text-platinum-500 font-medium">XP</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <!-- Sidebar Detail Panel -->
            <aside class="lg:col-span-4 order-1 lg:order-2 lg:sticky lg:top-6">
                <div class="card min-h-[360px] flex flex-col">

                    <!-- Selected Student -->
                    <div v-if="selectedStudent" class="space-y-5 animate-in flex-1 flex flex-col">
                        <div class="text-center">
                            <div class="relative w-16 h-16 mx-auto mb-3">
                                <div
                                    class="w-full h-full rounded-2xl bg-gradient-to-br from-calm-lavender-500 to-neon-pink-500 flex items-center justify-center text-white text-2xl font-semibold">
                                    {{ selectedStudent.initials || selectedStudent.name?.charAt(0) || 'U' }}
                                </div>
                                <div v-if="getRankIndex(selectedStudent) === 0"
                                    class="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white dark:bg-abyss-600 rounded-xl flex items-center justify-center border border-slate-100 dark:border-abyss-500">
                                    🔥
                                </div>
                            </div>
                            <h3 class="font-semibold text-base text-slate-800 dark:text-platinum-100">{{
                                selectedStudent.name }}</h3>
                            <p class="text-xs text-platinum-500 mt-0.5">Class Learner</p>
                        </div>

                        <div class="h-px bg-slate-100 dark:bg-abyss-600"></div>

                        <div class="grid grid-cols-2 gap-3">
                            <div class="stat-card">
                                <div class="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 w-fit mx-auto mb-2">
                                    <Trophy class="w-3.5 h-3.5 text-amber-500" />
                                </div>
                                <p class="text-base font-bold text-slate-800 dark:text-platinum-100 text-center">
                                    {{ getRank(selectedStudent) }}
                                </p>
                                <p class="text-xs text-platinum-500 text-center mt-0.5">Class Rank</p>
                            </div>
                            <div class="stat-card">
                                <div
                                    class="p-2 rounded-lg bg-calm-lavender-50 dark:bg-calm-lavender-900/20 w-fit mx-auto mb-2">
                                    <Star class="w-3.5 h-3.5 text-calm-lavender-500" />
                                </div>
                                <p class="text-base font-bold text-slate-800 dark:text-platinum-100 text-center">
                                    {{ selectedStudent.points }}
                                </p>
                                <p class="text-xs text-platinum-500 text-center mt-0.5">Total XP</p>
                            </div>
                        </div>

                        <div>
                            <p class="text-xs font-medium text-platinum-500 mb-2">Top Skills</p>
                            <div class="flex flex-wrap gap-1.5">
                                <span
                                    v-for="skill in (selectedStudent.skills || ['Fast Reader', 'Quiz Master', 'Early Bird'])"
                                    :key="skill"
                                    class="px-2.5 py-1 bg-slate-50 dark:bg-abyss-700 border border-slate-200 dark:border-abyss-500 rounded-lg text-xs font-medium text-platinum-600 dark:text-platinum-400">
                                    {{ skill }}
                                </span>
                            </div>
                        </div>

                        <div class="mt-auto">
                            <button @click="selectedStudent = null"
                                class="btn-secondary w-full justify-center text-center">
                                Clear
                            </button>
                        </div>
                    </div>

                    <!-- Empty selection -->
                    <div v-else class="flex-1 flex flex-col items-center justify-center text-center gap-3 py-10">
                        <div
                            class="p-3.5 bg-slate-50 dark:bg-abyss-700 border border-slate-100 dark:border-abyss-500 rounded-2xl">
                            <MousePointer2 class="w-5 h-5 text-platinum-400 dark:text-platinum-600 animate-bounce" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-500 dark:text-platinum-500">Select a student</p>
                            <p class="text-xs text-platinum-500 dark:text-platinum-600 mt-0.5 max-w-[160px] mx-auto">
                                Click any name in the list to see their details.
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-platinum-500 dark:text-platinum-600 mt-4">
            Keep learning and stay kind to your classmates 💜
        </p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    Trophy, Users, Star,
    ArrowLeft as ArrowLeftIcon,
    ChevronRight as ChevronRightIcon,
    MousePointer2,
    Medal
} from 'lucide-vue-next'
import api from '@/utils/api'

const router = useRouter()
const learners = ref([])
const selectedStudent = ref(null)
const isLoading = ref(true)

const getRank = (student) => {
    const index = learners.value.findIndex(l => l.id === student.id)
    return index !== -1 ? `#${index + 1}` : 'N/A'
}

const getRankIndex = (student) => {
    return learners.value.findIndex(l => l.id === student.id)
}

onMounted(async () => {
    try {
        const res = await api.get('/api/v1/quizzes/gamification/leaderboard')
        if (res.data?.learners) {
            learners.value = res.data.learners
            if (learners.value.length > 0) {
                selectedStudent.value = learners.value[0]
            }
        }
    } catch (error) {
        console.error('[v0] Failed to load leaderboard:', error.message)
    } finally {
        isLoading.value = false
    }
})
</script>

<style scoped>
@reference "@/style.css";

.page-wrapper {
    @apply space-y-6 text-slate-900 dark:text-white;
}

.page-header {
    @apply flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-6 border-b border-slate-200 dark:border-abyss-600;
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

.brand-gradient-text {
    @apply bg-gradient-to-r from-calm-lavender-600 to-neon-pink-500 bg-clip-text text-transparent;
}

.back-btn {
    @apply flex items-center gap-2 text-xs font-medium text-platinum-500 hover:text-calm-lavender-600 dark:hover:text-calm-lavender-400 transition-colors;
}

.card {
    @apply bg-white dark:bg-abyss-600 border border-slate-200 dark:border-abyss-500 rounded-2xl p-5;
}

.learner-row {
    @apply flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-abyss-700 border border-transparent hover:border-slate-100 dark:hover:border-abyss-500 transition-all duration-150 cursor-pointer;
}

.learner-row-active {
    @apply bg-calm-lavender-50 dark:bg-calm-lavender-900/20 border-calm-lavender-200 dark:border-calm-lavender-800/40;
}

.stat-card {
    @apply p-3.5 bg-slate-50 dark:bg-abyss-700 border border-slate-100 dark:border-abyss-500 rounded-xl;
}

.spinner {
    @apply w-7 h-7 border-2 border-slate-200 dark:border-abyss-500 border-t-calm-lavender-500 rounded-full animate-spin;
}

.loading-text {
    @apply font-mplusrounded text-sm text-platinum-500;
}

.btn-secondary {
    @apply flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-abyss-700 hover:bg-slate-200 dark:hover:bg-abyss-600 text-slate-600 dark:text-platinum-300 font-medium text-sm border border-slate-200 dark:border-abyss-500 transition-all;
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