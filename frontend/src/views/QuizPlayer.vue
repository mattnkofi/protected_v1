<template>
  <div :class="['quiz-arena min-h-screen font-poppins overflow-hidden relative transition-colors duration-500',
    isDark ? 'bg-abyss-900 text-white' : 'bg-slate-50 text-slate-900']">

    <!-- Subtle ambient bg (no blur, no glow) -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div :class="['absolute top-0 right-0 w-80 h-80 rounded-full opacity-10',
        isDark ? 'bg-calm-lavender-700' : 'bg-calm-lavender-200']" style="filter: blur(80px);"></div>
      <div :class="['absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10',
        isDark ? 'bg-neon-pink-800' : 'bg-neon-pink-100']" style="filter: blur(80px);"></div>

      <!-- Floating particles (brand color, subtle) -->
      <div v-for="i in 12" :key="'p-' + i"
        :class="['absolute rounded-full', isDark ? 'bg-calm-lavender-500/50' : 'bg-calm-lavender-400/40']"
        :style="getParticleStyle(i)"></div>
    </div>

    <!-- Theme Toggle -->
    <button @click="toggleTheme"
      :class="['fixed top-4 right-4 z-[100] p-2.5 rounded-xl border transition-all group',
        isDark ? 'bg-abyss-700 border-abyss-500 hover:border-calm-lavender-600' : 'bg-white border-slate-200 hover:border-calm-lavender-400']">
      <SunIcon v-if="isDark" class="w-5 h-5 text-amber-400" />
      <MoonIcon v-else class="w-5 h-5 text-calm-lavender-600" />
    </button>

    <!-- Screen Flash -->
    <Transition name="flash">
      <div v-if="screenFlash" :class="['fixed inset-0 z-50 pointer-events-none',
        screenFlash === 'correct' ? 'bg-safety-teal-400/20' : 'bg-red-500/25']"></div>
    </Transition>

    <!-- Score Popups -->
    <TransitionGroup name="score-pop">
      <div v-for="popup in scorePopups" :key="popup.id" class="fixed z-50 pointer-events-none select-none"
        :style="{ left: popup.x + 'px', top: popup.y + 'px' }">
        <div :class="['text-3xl font-bold', popup.type === 'correct' ? 'text-calm-lavender-400' : 'text-red-400']">
          {{ popup.text }}
        </div>
        <div v-if="popup.combo" class="text-lg font-bold text-amber-400">
          {{ popup.combo }}x Combo!
        </div>
      </div>
    </TransitionGroup>

    <!-- ===== LOADING ===== -->
    <div v-if="loading" class="relative z-10 min-h-screen flex flex-col items-center justify-center gap-5">
      <div :class="['w-16 h-16 rounded-2xl border-2 flex items-center justify-center',
        isDark ? 'bg-abyss-700 border-calm-lavender-700' : 'bg-white border-calm-lavender-200']">
        <ZapIcon class="w-8 h-8 text-calm-lavender-500 animate-pulse" />
      </div>
      <div class="text-center">
        <h2 :class="['font-madimione text-2xl', isDark ? 'text-platinum-100' : 'text-slate-800']">
          Loading <span class="brand-gradient-text">Quiz</span>
        </h2>
        <div class="flex items-center justify-center gap-1.5 mt-3">
          <div v-for="n in 3" :key="n" :class="['w-2 h-2 rounded-full bg-calm-lavender-500 animate-bounce']"
            :style="`animation-delay: ${(n - 1) * 0.12}s`"></div>
        </div>
      </div>
    </div>

    <!-- ===== MAIN QUIZ ===== -->
    <div v-else-if="quiz && currentQuestion && !isFinished"
      :class="['relative z-10 min-h-screen flex flex-col', { 'animate-shake': isShaking }]">

      <!-- Review Mode Banner -->
      <div v-if="isReviewMode" :class="['border-b py-2.5 text-center',
        isDark ? 'bg-amber-900/20 border-amber-700/30' : 'bg-amber-50 border-amber-200']">
        <div class="flex items-center justify-center gap-2">
          <BookOpenIcon class="w-4 h-4 text-amber-500" />
          <p class="text-xs font-semibold text-amber-600 dark:text-amber-400">Practice Mode — No XP earned</p>
        </div>
      </div>

      <!-- ===== HEADER ===== -->
      <header :class="['sticky top-0 z-40 border-b',
        isDark ? 'bg-abyss-900/95 border-abyss-700' : 'bg-white/95 border-slate-200']">
        <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

          <!-- Exit -->
          <button @click="triggerBack"
            :class="['p-2 rounded-xl border transition-all group',
              isDark ? 'bg-abyss-700 border-abyss-500 hover:border-red-700 hover:bg-red-900/30' : 'bg-slate-50 border-slate-200 hover:border-red-200 hover:bg-red-50']">
            <XIcon
              :class="['w-5 h-5 transition-colors', isDark ? 'text-platinum-400 group-hover:text-red-400' : 'text-slate-500 group-hover:text-red-500']" />
          </button>

          <!-- Mode Label -->
          <div :class="['px-4 py-2 rounded-xl border flex items-center gap-2',
            isDark ? 'bg-abyss-700 border-abyss-500' : 'bg-slate-50 border-slate-200']">
            <component :is="modeIcon" :class="['w-4 h-4', modeIconColor]" />
            <span :class="['text-sm font-medium', isDark ? 'text-platinum-200' : 'text-slate-700']">{{ modeLabel
              }}</span>
          </div>

          <!-- Stats Row -->
          <div class="flex items-center gap-2">
            <!-- Timer -->
            <div v-if="quiz.quiz_type === 'time_attack'"
              :class="['flex items-center gap-2 px-3 py-2 rounded-xl border',
                timeLeft <= 10 ? 'bg-red-500/10 border-red-400' : (isDark ? 'bg-abyss-700 border-abyss-500' : 'bg-slate-50 border-slate-200')]">
              <div class="relative w-7 h-7">
                <svg class="w-full h-full" style="transform: rotate(-90deg);">
                  <circle cx="50%" cy="50%" r="40%" stroke-width="3" fill="none"
                    :class="isDark ? 'stroke-abyss-500' : 'stroke-slate-200'" />
                  <circle cx="50%" cy="50%" r="40%" stroke-width="3" fill="none"
                    :class="timeLeft <= 10 ? 'stroke-red-500' : 'stroke-calm-lavender-500'" stroke-linecap="round"
                    :stroke-dasharray="100" :stroke-dashoffset="100 - (100 * (timeLeft / (quiz.time_limit || 30)))"
                    class="transition-all duration-1000" />
                </svg>
                <ClockIcon :class="['absolute top-1/2 left-1/2 w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2',
                  timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-calm-lavender-500']" />
              </div>
              <span
                :class="['text-lg font-bold tabular-nums', timeLeft <= 10 ? 'text-red-500' : (isDark ? 'text-white' : 'text-slate-800')]">
                {{ timeLeft }}s
              </span>
            </div>

            <!-- Streak -->
            <div v-if="quiz.quiz_type === 'streak'"
              :class="['flex items-center gap-2 px-3 py-2 rounded-xl border',
                streakCount >= 3 ? 'bg-vawc-orange-50 dark:bg-vawc-orange-900/20 border-vawc-orange-300 dark:border-vawc-orange-700' : (isDark ? 'bg-abyss-700 border-abyss-500' : 'bg-slate-50 border-slate-200')]">
              <FlameIcon
                :class="['w-5 h-5', streakCount >= 3 ? 'text-vawc-orange-500 animate-bounce' : 'text-calm-lavender-500']" />
              <span
                :class="['text-lg font-bold', streakCount >= 3 ? 'text-vawc-orange-500' : (isDark ? 'text-white' : 'text-slate-800')]">
                x{{ streakCount }}
              </span>
            </div>

            <!-- Score -->
            <div :class="['flex items-center gap-2 px-3 py-2 rounded-xl border',
              isDark ? 'bg-abyss-700 border-abyss-500' : 'bg-slate-50 border-slate-200']">
              <SparklesIcon class="w-4 h-4 text-calm-lavender-500" />
              <span :class="['text-lg font-bold', isDark ? 'text-white' : 'text-slate-800']">{{ score }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Boss HP -->
      <div v-if="quiz.quiz_type === 'boss_battle'" class="px-4 py-4">
        <div class="max-w-2xl mx-auto">
          <div :class="['relative p-3.5 rounded-2xl border overflow-hidden',
            isDark ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200']">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <SkullIcon class="w-5 h-5 text-red-500" />
                <span :class="['text-sm font-semibold', isDark ? 'text-red-400' : 'text-red-600']">Boss HP</span>
              </div>
              <span :class="['text-base font-bold', isDark ? 'text-red-400' : 'text-red-600']">{{ Math.round(bossHP)
                }}%</span>
            </div>
            <div :class="['h-3 rounded-full overflow-hidden', isDark ? 'bg-abyss-700' : 'bg-red-100']">
              <div
                class="h-full bg-gradient-to-r from-red-500 to-vawc-orange-500 rounded-full transition-all duration-500"
                :style="{ width: bossHP + '%' }"></div>
            </div>
            <Transition name="damage-pop">
              <div v-if="showBossDamage" class="absolute -top-5 right-4 text-xl font-bold text-amber-400">
                -{{ lastBossDamage }}%
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- ===== MAIN GAME AREA ===== -->
      <main class="flex-1 flex flex-col items-center justify-center px-4 py-6">

        <!-- Progress -->
        <div class="w-full max-w-3xl mb-6">
          <div class="flex items-center justify-between mb-2">
            <span :class="['text-sm font-medium', isDark ? 'text-platinum-400' : 'text-slate-600']">
              Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions_data.length }}
            </span>
            <Transition name="combo-pop">
              <div v-if="comboCount >= 2" :class="['px-2.5 py-1 rounded-lg border text-sm font-semibold text-amber-500',
                isDark ? 'bg-amber-900/20 border-amber-700/30' : 'bg-amber-50 border-amber-200']">
                {{ comboCount }}x Combo!
              </div>
            </Transition>
          </div>
          <div :class="['h-2 rounded-full overflow-hidden border',
            isDark ? 'bg-abyss-700 border-abyss-600' : 'bg-slate-100 border-slate-200']">
            <div
              class="h-full bg-gradient-to-r from-calm-lavender-500 to-neon-pink-400 rounded-full transition-all duration-700"
              :style="{ width: ((currentQuestionIndex + 1) / quiz.questions_data.length) * 100 + '%' }"></div>
          </div>
        </div>

        <!-- Question Card -->
        <Transition :name="transitionName" mode="out-in">
          <div :key="currentQuestionIndex" class="w-full max-w-3xl">

            <!-- Question -->
            <div :class="['rounded-2xl border-2 overflow-hidden mb-5 transition-all',
              isDark ? 'bg-abyss-700 border-abyss-500' : 'bg-white border-slate-200',
              feedbackBorderClass]">

              <div class="h-1 bg-gradient-to-r from-calm-lavender-500 to-neon-pink-400"></div>

              <div class="p-6 md:p-8">
                <div class="flex items-center gap-3 mb-5">
                  <div :class="['w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold',
                    'bg-gradient-to-br from-calm-lavender-500 to-neon-pink-500']">
                    {{ currentQuestionIndex + 1 }}
                  </div>
                  <div>
                    <p
                      :class="['text-xs font-semibold uppercase tracking-wide', isDark ? 'text-calm-lavender-400' : 'text-calm-lavender-600']">
                      {{ modeLabel }}
                    </p>
                    <p class="text-xs text-platinum-500">Answer correctly to score!</p>
                  </div>
                </div>

                <h2
                  :class="['text-xl md:text-2xl font-medium leading-relaxed', isDark ? 'text-platinum-100' : 'text-slate-800']">
                  {{ currentQuestion.question }}
                </h2>
              </div>
            </div>

            <!-- Answer Options -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button v-for="(option, index) in currentQuestion.options" :key="index"
                @click="handleAnswerSelection($event, index)" :disabled="selectedAnswer !== null" :class="['answer-btn group relative text-left rounded-xl border-2 overflow-hidden transition-all duration-200',
                  getOptionClass(index)]">

                <div class="p-4 flex items-center gap-3">
                  <div :class="['w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all shrink-0',
                    getOptionLetterClass(index)]">
                    {{ String.fromCharCode(65 + index) }}
                  </div>
                  <span :class="['font-medium text-sm flex-1', isDark ? 'text-platinum-200' : 'text-slate-700']">
                    {{ option }}
                  </span>

                  <Transition name="icon-pop">
                    <div v-if="selectedAnswer !== null && index === currentQuestion.correctAnswer"
                      class="w-8 h-8 bg-safety-teal-500 rounded-lg flex items-center justify-center shrink-0">
                      <CheckIcon class="w-4 h-4 text-white" />
                    </div>
                    <div v-else-if="selectedAnswer === index && index !== currentQuestion.correctAnswer"
                      class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
                      <XIcon class="w-4 h-4 text-white" />
                    </div>
                  </Transition>
                </div>
              </button>
            </div>
          </div>
        </Transition>
      </main>
    </div>

    <!-- ===== RESULTS SCREEN ===== -->
    <div v-else-if="isFinished" class="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">

      <!-- Confetti -->
      <div v-if="scorePercentage >= 70" class="fixed inset-0 pointer-events-none overflow-hidden">
        <div v-for="i in 50" :key="'conf-' + i" :class="['confetti absolute', confettiColors[i % confettiColors.length]]"
          :style="getConfettiStyle(i)"></div>
      </div>

      <!-- Results Card -->
      <div class="max-w-md w-full animate-in">
        <div :class="['rounded-2xl border-2 overflow-hidden',
          isDark ? 'bg-abyss-700 border-abyss-500' : 'bg-white border-slate-200']">

          <!-- Trophy Section -->
          <div class="h-1 bg-gradient-to-r from-calm-lavender-500 to-neon-pink-400"></div>
          <div class="relative py-10 flex items-center justify-center">
            <div :class="['w-24 h-24 rounded-2xl flex items-center justify-center text-white', resultIconClass]">
              <TrophyIcon v-if="scorePercentage >= 90" class="w-12 h-12" />
              <MedalIcon v-else-if="scorePercentage >= 70" class="w-12 h-12" />
              <StarIcon v-else-if="scorePercentage >= 50" class="w-12 h-12" />
              <TargetIcon v-else class="w-12 h-12" />
            </div>
          </div>

          <div class="px-6 pb-7 text-center">
            <h1 :class="['font-madimione text-3xl mb-1', isDark ? 'text-platinum-100' : 'text-slate-800']">
              {{ resultTitle }}
            </h1>
            <p :class="['text-sm mb-6', isDark ? 'text-platinum-500' : 'text-slate-500']">{{ resultSubtitle }}</p>

            <!-- XP Display -->
            <div :class="['rounded-xl border p-5 mb-6',
              isDark ? 'bg-abyss-800 border-abyss-600' : 'bg-slate-50 border-slate-200']">
              <p v-if="!isReviewMode" class="text-4xl font-bold brand-gradient-text">+{{ score }}</p>
              <p v-else :class="['text-3xl font-bold', isDark ? 'text-calm-lavender-400' : 'text-calm-lavender-600']">{{
                score }}</p>
              <p :class="['text-xs font-medium uppercase tracking-widest mt-1',
                isReviewMode ? 'text-amber-500' : 'text-calm-lavender-500']">
                {{ isReviewMode ? 'Practice Score' : 'Experience Points Earned' }}
              </p>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-2 mb-6">
              <div
                :class="['rounded-xl border p-3',
                  isDark ? 'bg-safety-teal-900/20 border-safety-teal-800/30' : 'bg-safety-teal-50 border-safety-teal-200']">
                <p class="text-xl font-bold text-safety-teal-500">{{ correctAnswers }}</p>
                <p class="text-[10px] font-medium uppercase text-safety-teal-500/60">Correct</p>
              </div>
              <div :class="['rounded-xl border p-3',
                isDark ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-200']">
                <p class="text-xl font-bold text-red-500">{{ quiz.questions_data.length - correctAnswers }}</p>
                <p class="text-[10px] font-medium uppercase text-red-500/60">Wrong</p>
              </div>
              <div
                :class="['rounded-xl border p-3',
                  isDark ? 'bg-calm-lavender-900/20 border-calm-lavender-800/30' : 'bg-calm-lavender-50 border-calm-lavender-200']">
                <p class="text-xl font-bold text-calm-lavender-500">{{ formatTime(totalTimeTaken) }}</p>
                <p class="text-[10px] font-medium uppercase text-calm-lavender-500/60">Time</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-3">
              <button @click="router.push({ name: 'user.modules' })"
                :class="['flex-1 py-3 rounded-xl border text-sm font-medium transition-all hover:-translate-y-0.5',
                  isDark ? 'bg-abyss-700 border-abyss-500 text-platinum-300 hover:border-calm-lavender-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-calm-lavender-300']">
                <ArrowLeftIcon class="inline w-4 h-4 mr-1.5" /> Back to Library
              </button>
              <button @click="router.push({ name: 'user.rewards-shop' })"
                class="flex-1 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-calm-lavender-600 to-neon-pink-500 border border-calm-lavender-700 hover:-translate-y-0.5 transition-all">
                <GiftIcon class="inline w-4 h-4 mr-1.5" /> View Rewards
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== EXIT MODAL ===== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isBackModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" @click="resumeQuiz"></div>
          <div :class="['relative max-w-sm w-full rounded-2xl border-2 p-7 text-center',
            isDark ? 'bg-abyss-700 border-abyss-500' : 'bg-white border-slate-200']">
            <div
              class="inline-flex p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30 mb-4">
              <AlertTriangleIcon class="w-8 h-8 text-amber-500" />
            </div>
            <h3 :class="['font-semibold text-lg mb-1', isDark ? 'text-platinum-100' : 'text-slate-800']">Exit Quiz?</h3>
            <p :class="['text-sm mb-6', isDark ? 'text-platinum-500' : 'text-slate-500']">Your progress will be lost.
            </p>
            <div class="flex gap-3">
              <button @click="resumeQuiz"
                :class="['flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all',
                  isDark ? 'bg-abyss-700 border-abyss-500 text-platinum-300' : 'bg-slate-50 border-slate-200 text-slate-700']">
                Continue
              </button>
              <button @click="confirmExit"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">
                Exit
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/utils/api';
import { useAuthStore } from '@/stores/auth';
import {
  Clock as ClockIcon, Trophy as TrophyIcon, Flame as FlameIcon, Skull as SkullIcon,
  Star as StarIcon, Target as TargetIcon, X as XIcon, Check as CheckIcon,
  AlertTriangle as AlertTriangleIcon, ArrowLeft as ArrowLeftIcon, BookOpen as BookOpenIcon,
  Gift as GiftIcon, Zap as ZapIcon, Sparkles as SparklesIcon, Medal as MedalIcon,
  Sun as SunIcon, Moon as MoonIcon
} from 'lucide-vue-next';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const isDark = ref(true);
const checkTheme = () => { isDark.value = document.documentElement.classList.contains('dark'); };
const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark', isDark.value);
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
};

const quiz = ref(null);
const loading = ref(true);
const isReviewMode = ref(false);
const currentQuestionIndex = ref(0);
const score = ref(0);
const correctAnswers = ref(0);
const timeLeft = ref(0);
const totalTimeTaken = ref(0);
const isFinished = ref(false);
const selectedAnswer = ref(null);
const isBackModalOpen = ref(false);
const streakCount = ref(0);
const comboCount = ref(0);
const bossHP = ref(100);
const isShaking = ref(false);
const screenFlash = ref(null);
const scorePopups = ref([]);
const showBossDamage = ref(false);
const lastBossDamage = ref(0);
const feedbackBorderClass = ref('');
const transitionName = ref('slide-right');
let timer = null;
let popupId = 0;
let themeObserver = null;

const confettiColors = ['bg-calm-lavender-500', 'bg-neon-pink-500', 'bg-safety-teal-400', 'bg-amber-400', 'bg-calm-lavender-400', 'bg-neon-pink-400'];

const currentQuestion = computed(() => quiz.value?.questions_data?.[currentQuestionIndex.value] || null);
const scorePercentage = computed(() => quiz.value ? Math.round((correctAnswers.value / quiz.value.questions_data.length) * 100) : 0);

const modeIcon = computed(() => {
  if (quiz.value?.quiz_type === 'boss_battle') return SkullIcon;
  if (quiz.value?.quiz_type === 'streak') return FlameIcon;
  return ClockIcon;
});
const modeIconColor = computed(() => {
  if (quiz.value?.quiz_type === 'boss_battle') return 'text-red-500';
  if (quiz.value?.quiz_type === 'streak') return 'text-vawc-orange-500';
  return 'text-calm-lavender-500';
});
const modeLabel = computed(() => {
  if (quiz.value?.quiz_type === 'boss_battle') return 'Boss Battle';
  if (quiz.value?.quiz_type === 'streak') return 'Streak';
  return 'Time Attack';
});

const resultTitle = computed(() => {
  if (scorePercentage.value >= 90) return 'Legendary!';
  if (scorePercentage.value >= 70) return 'Excellent!';
  if (scorePercentage.value >= 50) return 'Good job!';
  return 'Keep going!';
});
const resultSubtitle = computed(() => {
  if (scorePercentage.value >= 90) return 'You absolutely dominated this one!';
  if (scorePercentage.value >= 70) return 'Outstanding performance!';
  if (scorePercentage.value >= 50) return 'You passed — keep it up!';
  return 'Review the material and try again.';
});
const resultIconClass = computed(() => {
  if (scorePercentage.value >= 70) return 'bg-gradient-to-br from-amber-400 to-vawc-orange-500';
  if (scorePercentage.value >= 50) return 'bg-gradient-to-br from-calm-lavender-500 to-neon-pink-500';
  return 'bg-gradient-to-br from-slate-300 to-slate-400';
});

const getParticleStyle = (i) => ({
  width: `${3 + (i % 3)}px`,
  height: `${3 + (i % 3)}px`,
  bottom: '-20px',
  left: `${(i * 8) % 100}%`,
  animationDelay: `${i * 0.4}s`,
  animationDuration: `${5 + (i % 4)}s`
});
const getConfettiStyle = (i) => ({
  left: `${(i * 2) % 100}%`,
  width: `${6 + (i % 4) * 2}px`,
  height: `${6 + (i % 3) * 2}px`,
  animationDelay: `${i * 0.06}s`,
  animationDuration: `${2.5 + (i % 2) * 0.5}s`
});
const formatTime = (s) => { const m = Math.floor(s / 60); return m > 0 ? `${m}m ${s % 60}s` : `${s}s`; };

const startTimer = () => {
  if (timer) clearInterval(timer);
  timeLeft.value = quiz.value?.time_limit || 30;
  timer = setInterval(() => {
    if (timeLeft.value > 0) { timeLeft.value--; totalTimeTaken.value++; }
    else handleAnswerSelection(null, -1);
  }, 1000);
};

const triggerEffects = (type) => {
  screenFlash.value = type;
  setTimeout(() => screenFlash.value = null, 200);
  if (type === 'wrong') {
    isShaking.value = true;
    setTimeout(() => isShaking.value = false, 400);
  }
};

const addScorePopup = (event, text, type, combo = null) => {
  const id = ++popupId;
  const rect = event?.target?.getBoundingClientRect?.();
  scorePopups.value.push({ id, text, type, combo, x: rect?.left ?? window.innerWidth / 2, y: rect?.top ?? window.innerHeight / 2 });
  setTimeout(() => scorePopups.value = scorePopups.value.filter(p => p.id !== id), 1200);
};

const handleAnswerSelection = (event, index) => {
  if (selectedAnswer.value !== null) return;
  if (timer) clearInterval(timer);
  selectedAnswer.value = index;

  const isCorrect = index === currentQuestion.value.correctAnswer;

  if (isCorrect) {
    correctAnswers.value++;
    comboCount.value++;
    triggerEffects('correct');
    feedbackBorderClass.value = 'border-safety-teal-400 dark:border-safety-teal-600';

    let points = quiz.value.points_per_question || 10;

    if (quiz.value.quiz_type === 'streak') {
      streakCount.value++;
      points += streakCount.value * 5;
    } else if (quiz.value.quiz_type === 'boss_battle') {
      const damage = 100 / quiz.value.questions_data.length;
      lastBossDamage.value = Math.round(damage);
      showBossDamage.value = true;
      setTimeout(() => { showBossDamage.value = false; }, 800);
      bossHP.value = Math.max(0, bossHP.value - damage);
    }

    if (comboCount.value >= 3) points += comboCount.value * 2;
    score.value += points;
    addScorePopup(event, `+${points}`, 'correct', comboCount.value >= 2 ? comboCount.value : null);
  } else {
    triggerEffects('wrong');
    feedbackBorderClass.value = 'border-red-400 dark:border-red-600';
    comboCount.value = 0;
    streakCount.value = 0;
    addScorePopup(event, 'Miss', 'wrong');
  }

  setTimeout(() => {
    selectedAnswer.value = null;
    feedbackBorderClass.value = '';
    if (currentQuestionIndex.value < quiz.value.questions_data.length - 1) {
      currentQuestionIndex.value++;
      startTimer();
    } else finishQuiz();
  }, 1500);
};

const getOptionClass = (index) => {
  const base = isDark.value ? 'bg-abyss-700 border-abyss-500' : 'bg-white border-slate-200';
  if (selectedAnswer.value === null) return `${base} hover:-translate-y-0.5 hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700 cursor-pointer`;
  if (index === currentQuestion.value.correctAnswer) return isDark.value ? 'bg-safety-teal-900/30 border-safety-teal-500' : 'bg-safety-teal-50 border-safety-teal-400';
  if (selectedAnswer.value === index) return isDark.value ? 'bg-red-900/30 border-red-500' : 'bg-red-50 border-red-400';
  return `${base} opacity-40`;
};

const getOptionLetterClass = (index) => {
  if (selectedAnswer.value === null) return isDark.value
    ? 'bg-abyss-600 text-platinum-400 group-hover:bg-calm-lavender-800 group-hover:text-calm-lavender-300'
    : 'bg-slate-100 text-slate-500 group-hover:bg-calm-lavender-100 group-hover:text-calm-lavender-600';
  if (index === currentQuestion.value.correctAnswer) return 'bg-safety-teal-500 text-white';
  if (selectedAnswer.value === index) return 'bg-red-500 text-white';
  return isDark.value ? 'bg-abyss-600 text-platinum-500' : 'bg-slate-100 text-slate-400';
};

const finishQuiz = async () => {
  isFinished.value = true;
  if (timer) clearInterval(timer);
  if (!isReviewMode.value) {
    try {
      await api.post(`/api/v1/quizzes/${quiz.value.id}/submit`, {
        pointsEarned: score.value, correctCount: correctAnswers.value,
        totalQuestions: quiz.value.questions_data.length, timeTaken: totalTimeTaken.value
      });
      await authStore.fetchUser();
    } catch (err) { console.error("Submit failed", err); }
  }
};

const triggerBack = () => { if (timer) clearInterval(timer); isBackModalOpen.value = true; };
const resumeQuiz = () => { isBackModalOpen.value = false; startTimer(); };
const confirmExit = () => router.push({ name: 'user.modules' });

const checkAttempt = async () => {
  try { return (await api.get(`/api/v1/quizzes/${route.params.id}/check-attempt`)).data.attempted || false; }
  catch { return false; }
};

onMounted(async () => {
  checkTheme();
  themeObserver = new MutationObserver(checkTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  try {
    if (await checkAttempt()) isReviewMode.value = true;
    quiz.value = (await api.get(`/api/v1/quizzes/${route.params.id}`)).data.quiz;
    loading.value = false;
    await nextTick();
    startTimer();
  } catch (err) { console.error(err); loading.value = false; }
});

onUnmounted(() => { clearInterval(timer); if (themeObserver) themeObserver.disconnect(); });
</script>

<style scoped>
.brand-gradient-text {
  background: linear-gradient(to right, #9333ea, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Particles float up */
@keyframes float-up {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }

  10% {
    opacity: 0.8;
  }

  90% {
    opacity: 0.6;
  }

  100% {
    transform: translateY(-100vh) scale(0.5);
    opacity: 0;
  }
}

.animate-float-up {
  animation: float-up linear infinite;
}

/* Shake */
@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-6px);
  }

  75% {
    transform: translateX(6px);
  }
}

.animate-shake {
  animation: shake 0.35s ease-in-out;
}

/* Confetti fall */
@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }

  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.confetti {
  animation: confetti-fall 3s ease-in-out infinite;
  border-radius: 2px;
}

/* Entry animation */
.animate-in {
  animation: entry 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes entry {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transitions */
.flash-enter-active,
.flash-leave-active {
  transition: opacity 0.15s;
}

.flash-enter-from,
.flash-leave-to {
  opacity: 0;
}

.score-pop-enter-active {
  animation: score-pop 1.2s ease-out forwards;
}

.score-pop-leave-active {
  opacity: 0;
}

@keyframes score-pop {
  0% {
    transform: translateY(0) scale(0.5);
    opacity: 0;
  }

  20% {
    transform: translateY(-25px) scale(1.3);
    opacity: 1;
  }

  100% {
    transform: translateY(-100px) scale(1);
    opacity: 0;
  }
}

.icon-pop-enter-active {
  animation: icon-pop 0.25s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes icon-pop {
  0% {
    transform: scale(0);
  }

  100% {
    transform: scale(1);
  }
}

.combo-pop-enter-active {
  animation: combo-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.combo-pop-leave-active {
  transition: all 0.15s;
}

.combo-pop-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@keyframes combo-pop {
  0% {
    transform: scale(0);
  }

  100% {
    transform: scale(1);
  }
}

.damage-pop-enter-active {
  animation: damage-pop 0.4s ease-out;
}

.damage-pop-leave-active {
  transition: opacity 0.2s;
}

.damage-pop-leave-to {
  opacity: 0;
}

@keyframes damage-pop {
  0% {
    transform: scale(0) translateY(8px);
    opacity: 0;
  }

  50% {
    transform: scale(1.2) translateY(-8px);
    opacity: 1;
  }

  100% {
    transform: scale(1) translateY(0);
  }
}

.slide-right-enter-active {
  transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-right-leave-active {
  transition: all 0.25s ease-in;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.97);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-40px) scale(0.97);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>