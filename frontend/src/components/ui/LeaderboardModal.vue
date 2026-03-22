<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">

      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/50 transition-opacity" @click="close"></div>

      <!-- Modal Panel -->
      <div class="relative w-full max-w-5xl max-h-[90vh] bg-platinum-50 dark:bg-abyss-800 rounded-2xl border-2 border-platinum-200 dark:border-abyss-600 overflow-hidden flex flex-col animate-modal-in">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b-2 border-platinum-200 dark:border-abyss-600 bg-white dark:bg-abyss-700 shrink-0">
          <div class="flex items-center gap-3">
            <div class="card-icon-wrap">
              <Trophy class="w-4 h-4 text-calm-lavender-600 dark:text-calm-lavender-400" />
            </div>
            <div>
              <h2 class="font-bold text-lg text-slate-800 dark:text-platinum-100 leading-none">
                <span class="brand-gradient-text">Leaderboard</span>
              </h2>
              <p class="field-subtext mt-0.5">Class Rankings</p>
            </div>
          </div>

          <button @click="close"
            class="btn-secondary !p-2 !px-2">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto hide-scrollbar p-5 lg:p-6">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

            <!-- Leaderboard List -->
            <div class="lg:col-span-8">

              <!-- Loading -->
              <div v-if="loading" class="py-20 text-center">
                <div class="spinner mx-auto mb-4"></div>
                <p class="loading-text">Loading scores...</p>
              </div>

              <!-- List -->
              <div v-else class="space-y-2">
                <div v-for="(learner, index) in learners" :key="learner.id"
                  @click="selectedStudent = learner"
                  class="group flex items-center gap-4 p-3.5 rounded-xl bg-white dark:bg-abyss-700 border-2 cursor-pointer transition-all duration-200"
                  :class="selectedStudent?.id === learner.id
                    ? 'border-calm-lavender-400 dark:border-calm-lavender-600'
                    : 'border-platinum-200 dark:border-abyss-500 hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800'">

                  <!-- Rank -->
                  <div class="shrink-0 w-10 flex justify-center items-center">
                    <span v-if="index < 3">
                      <div v-if="index === 0" class="p-1.5 bg-yellow-50 dark:bg-yellow-400/10 rounded-lg border border-yellow-200 dark:border-yellow-400/20">
                        <Trophy class="w-4 h-4 text-yellow-500 fill-yellow-400" />
                      </div>
                      <div v-else-if="index === 1" class="p-1.5 bg-slate-100 dark:bg-slate-300/10 rounded-lg border border-slate-200 dark:border-slate-300/20">
                        <Medal class="w-4 h-4 text-slate-400 fill-slate-300" />
                      </div>
                      <div v-else class="p-1.5 bg-vawc-orange-50 dark:bg-amber-700/10 rounded-lg border border-vawc-orange-200 dark:border-amber-700/20">
                        <Medal class="w-4 h-4 text-vawc-orange-600 fill-vawc-orange-400" />
                      </div>
                    </span>
                    <span v-else class="text-sm font-medium text-platinum-500 dark:text-platinum-600 tabular-nums">
                      #{{ index + 1 }}
                    </span>
                  </div>

                  <!-- Student Info -->
                  <div class="flex-1 flex items-center gap-3 min-w-0">
                    <div class="avatar-md !bg-calm-lavender-100 dark:!bg-calm-lavender-900/30 !text-calm-lavender-700 dark:!text-calm-lavender-300 !border-calm-lavender-200 dark:!border-calm-lavender-800/40 shrink-0">
                      {{ learner.initials || learner.name?.charAt(0) }}
                    </div>
                    <div class="min-w-0">
                      <h3 class="font-semibold text-sm text-slate-800 dark:text-platinum-100 truncate group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                        {{ learner.name }}
                      </h3>
                      <span class="badge badge-lavender text-xs mt-0.5">Lvl {{ learner.level }}</span>
                    </div>
                  </div>

                  <!-- Score -->
                  <div class="text-right shrink-0">
                    <p class="font-bold text-base text-calm-lavender-600 dark:text-calm-lavender-400 tabular-nums leading-none">
                      {{ learner.points?.toLocaleString() }}
                    </p>
                    <p class="field-subtext text-center mt-0.5">XP</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Student Detail Sidebar -->
            <div class="lg:col-span-4 lg:sticky lg:top-0">
              <div class="card border-2 border-platinum-200 dark:border-abyss-500 min-h-[320px] flex flex-col justify-center">

                <!-- Selected Student -->
                <div v-if="selectedStudent" class="space-y-5 animate-fade-in">

                  <!-- Avatar + Name -->
                  <div class="text-center space-y-2">
                    <div class="mx-auto w-16 h-16 rounded-2xl bg-calm-lavender-100 dark:bg-calm-lavender-900/30 border-2 border-calm-lavender-200 dark:border-calm-lavender-800/40 flex items-center justify-center text-calm-lavender-700 dark:text-calm-lavender-300 text-xl font-bold uppercase">
                      {{ selectedStudent.initials || selectedStudent.name?.charAt(0) }}
                    </div>
                    <h2 class="font-bold text-base text-slate-800 dark:text-platinum-100">
                      {{ selectedStudent.name }}
                    </h2>
                  </div>

                  <!-- Stats Grid -->
                  <div class="grid grid-cols-2 gap-3">
                    <div class="info-row flex-col items-center justify-center text-center gap-1 py-3 rounded-xl">
                      <p class="font-bold text-lg text-calm-lavender-600 dark:text-calm-lavender-400 leading-none">
                        #{{ getRank(selectedStudent) }}
                      </p>
                      <p class="stat-pill-label mt-0.5">Rank</p>
                    </div>
                    <div class="info-row flex-col items-center justify-center text-center gap-1 py-3 rounded-xl">
                      <p class="font-bold text-lg text-neon-pink-600 dark:text-neon-pink-400 leading-none">
                        {{ selectedStudent.points?.toLocaleString() }}
                      </p>
                      <p class="stat-pill-label mt-0.5">Total XP</p>
                    </div>
                  </div>

                  <!-- Skills -->
                  <div class="space-y-2">
                    <p class="field-subtext text-center">Top Skills</p>
                    <div class="flex flex-wrap gap-2 justify-center">
                      <span v-for="skill in ['Fast Reader', 'Quiz Master', 'Top Learner']" :key="skill"
                        class="badge badge-lavender text-xs">
                        {{ skill }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Empty Prompt -->
                <div v-else class="flex flex-col items-center justify-center text-center space-y-3 py-8">
                  <div class="empty-state-icon">
                    <MousePointer2 class="w-6 h-6 text-platinum-400 animate-bounce" />
                  </div>
                  <p class="empty-state-title">No student selected</p>
                  <p class="empty-state-desc">Click on a student in the list to view their profile card.</p>
                </div>

              </div>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div class="shrink-0 px-6 py-3 border-t-2 border-platinum-200 dark:border-abyss-600 bg-white dark:bg-abyss-700 text-center">
          <p class="field-subtext">Stay kind · Study hard · Reach the top</p>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Trophy, X, MousePointer2, Medal } from 'lucide-vue-next'
import api from '@/utils/api'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const learners = ref([])
const selectedStudent = ref(null)
const loading = ref(true)

const close = () => {
  emit('close')
}

import { watch } from 'vue'
watch(() => props.isOpen, (newVal) => {
  if (newVal) fetchLeaderboard()
})

const getRank = (student) => {
    const index = learners.value.findIndex(l => l.id === student.id)
    return index !== -1 ? index + 1 : '?'
}

const fetchLeaderboard = async () => {
    loading.value = true
    try {
        const res = await api.get('/api/v1/quizzes/gamification/leaderboard')
        if (res.data?.learners) {
            learners.value = res.data.learners
            if (learners.value.length > 0) selectedStudent.value = learners.value[0]
        }
    } catch (error) {
        console.error('Failed to load leaderboard modal:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchLeaderboard()
})
</script>

<style scoped>
@reference "@/style.css";

.animate-modal-in {
  animation: modalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}

.modal-enter-active,
.modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from,
.modal-leave-to     { opacity: 0; }

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.animate-fade-in {
  animation: fadeSlideUp 0.3s ease forwards;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);   }
}
</style>