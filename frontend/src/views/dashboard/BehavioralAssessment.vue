<template>
  <section class="page-wrapper">
    <div class="max-w-4xl mx-auto space-y-5">

      <!-- ── Header Banner ───────────────────────────────────────── -->
      <header class="rounded-2xl border-2 border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/20 overflow-hidden">
        <div class="p-6">
          <div class="flex items-start gap-4">

            <!-- Icon badge -->
            <div class="shrink-0 p-2.5 rounded-xl
                        bg-red-100 dark:bg-red-900/30
                        border border-red-200 dark:border-red-800/40">
              <ClipboardListIcon class="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>

            <div class="flex-1 min-w-0">
              <p class="section-eyebrow text-red-600 dark:text-red-400">Early Intervention Tool</p>
              <h1 class="page-title mt-1">Behavioral Pattern &amp; Risk Check</h1>
              <p class="font-mplusrounded text-sm font-normal leading-relaxed
                         text-slate-600 dark:text-platinum-300 mt-2">
                This dedicated questionnaire is separate from gamified quizzes and is
                used for behavioral screening and support recommendations.
              </p>
            </div>
          </div>
        </div>

        <!-- Progress strip -->
        <div v-if="!loading && !error && questions.length > 0" class="px-6 pb-5">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-dosis text-[11px] font-semibold uppercase tracking-widest
                          text-red-500 dark:text-red-400">
              Progress
            </span>
            <span class="font-dosis text-[11px] font-semibold
                          text-red-500 dark:text-red-400">
              {{ answeredCount }} / {{ questions.length }} answered
            </span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressPct + '%' }" />
          </div>
        </div>
      </header>

      <!-- ── Loading ─────────────────────────────────────────────── -->
      <div
        v-if="loading"
        class="card border-2 border-platinum-300 dark:border-abyss-500 text-center py-12"
      >
        <div class="spinner mx-auto mb-3" />
        <p class="loading-text">Loading assessment questionnaire…</p>
      </div>

      <!-- ── Error ───────────────────────────────────────────────── -->
      <div
        v-else-if="error"
        class="card border-2 border-red-200 dark:border-red-800/40
               bg-red-50 dark:bg-red-950/20 flex items-start gap-3"
      >
        <div class="shrink-0 p-1.5 rounded-lg
                    bg-red-100 dark:bg-red-900/40
                    border border-red-200 dark:border-red-700/40">
          <AlertCircleIcon class="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
        </div>
        <p class="font-mplusrounded text-sm leading-relaxed text-red-600 dark:text-red-300">
          {{ error }}
        </p>
      </div>

      <!-- ── Form ────────────────────────────────────────────────── -->
      <form v-else @submit.prevent="submitAssessment" class="space-y-4">

        <!-- Question cards -->
        <article
          v-for="(q, index) in questions"
          :key="q.id || index"
          class="card border-2 transition-all duration-200"
          :class="selectedIndex(index) !== null
            ? 'border-calm-lavender-200 dark:border-calm-lavender-800/50'
            : 'border-slate-200 dark:border-abyss-500'"
        >

          <!-- Question header row -->
          <div class="flex items-start gap-3 mb-4">
            <div
              class="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border transition-colors duration-200"
              :class="selectedIndex(index) !== null
                ? 'bg-calm-lavender-100 dark:bg-calm-lavender-900/30 border-calm-lavender-300 dark:border-calm-lavender-700'
                : 'bg-slate-100 dark:bg-abyss-500 border-slate-200 dark:border-abyss-400'"
            >
              <span
                class="font-dosis text-[11px] font-bold"
                :class="selectedIndex(index) !== null
                  ? 'text-calm-lavender-600 dark:text-calm-lavender-400'
                  : 'text-platinum-500 dark:text-platinum-500'"
              >{{ index + 1 }}</span>
            </div>

            <div class="flex-1 min-w-0">
              <p class="section-eyebrow mb-0.5">Question {{ index + 1 }}</p>
              <h2 class="font-madimione text-base text-slate-800 dark:text-platinum-100 leading-snug">
                {{ q.question }}
              </h2>
            </div>
          </div>

          <!-- Answer options -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label
              v-for="(option, optionIndex) in q.options"
              :key="`${q.id || index}-${optionIndex}`"
              class="flex items-center gap-3 rounded-xl border-2 px-3.5 py-2.5
                     cursor-pointer transition-all duration-150"
              :class="selectedIndex(index) === optionIndex
                ? 'bg-calm-lavender-50 dark:bg-calm-lavender-900/20 border-calm-lavender-300 dark:border-calm-lavender-700'
                : 'bg-slate-50 dark:bg-abyss-700 border-slate-200 dark:border-abyss-400 hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/60'"
            >
              <input
                type="radio"
                :name="`q-${index}`"
                :value="optionIndex"
                v-model.number="answers[index].selectedOptionIndex"
                class="accent-calm-lavender-600 shrink-0"
              />
              <span class="font-mplusrounded text-sm leading-snug
                            text-slate-700 dark:text-platinum-200">
                {{ option }}
              </span>
            </label>
          </div>
        </article>

        <!-- ── Safety Notice ──────────────────────────────────── -->
        <div class="card border-2 border-amber-200 dark:border-amber-700/40
                    bg-amber-50 dark:bg-amber-900/20 flex items-start gap-3">
          <div class="shrink-0 p-1.5 rounded-lg
                      bg-amber-100 dark:bg-amber-900/40
                      border border-amber-200 dark:border-amber-700/40">
            <AlertTriangleIcon class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <p class="font-mplusrounded text-xs leading-relaxed text-amber-700 dark:text-amber-300">
            This tool supports early intervention and guidance. It does not replace
            immediate emergency support when safety is at risk.
          </p>
        </div>

        <!-- ── Submit Row ─────────────────────────────────────── -->
        <div class="flex items-center gap-3 pt-1">
          <button
            type="submit"
            :disabled="submitting || !isComplete"
            class="btn-primary btn-3d disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ClipboardListIcon v-if="!submitting" class="w-4 h-4" />
            <span class="main-button-text">
              {{ submitting ? 'Submitting Assessment…' : 'Submit Assessment' }}
            </span>
          </button>

          <p v-if="!isComplete" class="field-subtext">
            Answer all {{ questions.length }} questions to submit.
          </p>
        </div>
      </form>

      <!-- ── Result ──────────────────────────────────────────────── -->
      <section
        v-if="result"
        class="card border-2 border-safety-teal-200 dark:border-safety-teal-700/40
               bg-safety-teal-50 dark:bg-safety-teal-900/20 animate-in"
      >
        <!-- Result header -->
        <div class="flex items-start gap-3 mb-4">
          <div class="shrink-0 p-2 rounded-xl
                      bg-safety-teal-100 dark:bg-safety-teal-900/40
                      border border-safety-teal-200 dark:border-safety-teal-700/40">
            <CheckCircleIcon class="w-4 h-4 text-safety-teal-600 dark:text-safety-teal-400" />
          </div>
          <div>
            <p class="section-eyebrow text-safety-teal-600 dark:text-safety-teal-400">
              Assessment Complete
            </p>
            <h3 class="font-madimione text-lg text-slate-800 dark:text-platinum-100 mt-0.5">
              Your responses have been recorded
            </h3>
          </div>
        </div>

        <!-- Result data rows -->
        <div class="space-y-2">
          <div class="info-row">
            <span class="info-label">ML Risk Level</span>
            <span class="badge badge-teal">
              {{ result.mlResult?.overall_risk_level || 'N/A' }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Alert Status</span>
            <span
              class="badge"
              :class="result.alertCreated ? 'badge-orange' : 'badge-muted'"
            >
              {{ result.alertCreated ? 'Early-support alert created' : 'No new alert created' }}
            </span>
          </div>
        </div>

        <div v-if="studentRecommendation" class="mt-5 rounded-2xl border border-safety-teal-200/80 dark:border-safety-teal-700/50 bg-white/80 dark:bg-abyss-800/50 p-4 space-y-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="section-eyebrow text-safety-teal-600 dark:text-safety-teal-300">Student Recommendation</p>
              <p class="mt-1 text-sm text-slate-700 dark:text-platinum-200">
                {{ studentRecommendation.summary }}
              </p>
            </div>
            <span class="badge" :class="studentRecommendation.seminarRecommended ? 'badge-orange' : 'badge-muted'">
              {{ studentRecommendation.seminarRecommended ? 'Seminar recommended' : 'Monitor and self-check' }}
            </span>
          </div>

          <div class="rounded-xl border border-slate-200/80 dark:border-abyss-600 bg-slate-50/70 dark:bg-abyss-900/40 p-4">
            <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500">Why this appeared</p>
            <p class="mt-2 text-sm leading-relaxed text-slate-700 dark:text-platinum-200">
              {{ studentRecommendation.recommendationText }}
            </p>
            <div v-if="studentRecommendation.reasonParts?.length" class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="(reason, index) in studentRecommendation.reasonParts"
                :key="index"
                class="inline-flex items-center rounded-full border border-slate-200 dark:border-abyss-600 bg-white dark:bg-abyss-800 px-3 py-1 text-xs text-slate-600 dark:text-platinum-200"
              >
                {{ reason }}
              </span>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-xl border border-slate-200/80 dark:border-abyss-600 bg-slate-50/70 dark:bg-abyss-900/40 p-4">
              <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500">Risk Breakdown</p>
              <div class="mt-3 space-y-2">
                <div v-for="item in studentRiskBreakdown" :key="item.level" class="space-y-1">
                  <div class="flex items-center justify-between text-xs text-slate-600 dark:text-platinum-300">
                    <span>{{ item.level }}</span>
                    <span>{{ item.count }}</span>
                  </div>
                  <div class="h-2 rounded-full bg-slate-200 dark:bg-abyss-700 overflow-hidden">
                    <div
                      class="h-full rounded-full bg-safety-teal-500 transition-all duration-300"
                      :style="{ width: `${riskBarWidth(item.count)}%` }"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-xl border border-slate-200/80 dark:border-abyss-600 bg-slate-50/70 dark:bg-abyss-900/40 p-4">
              <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500">Quick Note</p>
              <p class="mt-2 text-sm leading-relaxed text-slate-700 dark:text-platinum-200">
                {{ studentRecommendation.note }}
              </p>
              <p class="mt-3 text-sm leading-relaxed text-slate-700 dark:text-platinum-200">
                If the pattern is tied to family conflict, pressure, or feeling unsafe, use the support seminar or facilitator follow-up to talk through what is happening.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import api from '@/utils/api';
import {
  AlertCircle as AlertCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  ClipboardList as ClipboardListIcon,
} from 'lucide-vue-next';

/* ── State ──────────────────────────────────────────────────────── */
const loading    = ref(true);
const submitting = ref(false);
const error      = ref('');
const assessment = ref(null);
const questions  = ref([]);
const answers    = ref([]);
const result     = ref(null);

const studentRecommendation = computed(() =>
  result.value?.studentRecommendation || result.value?.guidance?.latestAssessmentAnalysis?.studentRecommendation || null
);

const studentRiskBreakdown = computed(() => {
  const breakdown = studentRecommendation.value?.riskBreakdown;
  if (Array.isArray(breakdown) && breakdown.length) return breakdown;

  const analysisResults = Array.isArray(result.value?.mlResult?.analysis_results)
    ? result.value.mlResult.analysis_results
    : [];

  const counts = analysisResults.reduce((acc, item) => {
    const key = String(item?.risk_level || 'Low');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return ['Low', 'Moderate', 'High', 'Severe'].map(level => ({
    level,
    count: counts[level] || 0
  }));
});

const maxRiskCount = computed(() => Math.max(1, ...studentRiskBreakdown.value.map(item => item.count || 0)));

/* ── Computed ───────────────────────────────────────────────────── */
const isComplete = computed(() =>
  answers.value.length > 0 &&
  answers.value.every(a => Number.isInteger(a.selectedOptionIndex))
);

const answeredCount = computed(() =>
  answers.value.filter(a => Number.isInteger(a.selectedOptionIndex)).length
);

const progressPct = computed(() =>
  questions.value.length > 0
    ? Math.round((answeredCount.value / questions.value.length) * 100)
    : 0
);

const selectedIndex = (index) => answers.value[index]?.selectedOptionIndex ?? null;

const riskBarWidth = (count) => Math.round(((count || 0) / maxRiskCount.value) * 100);

/* ── API ─────────────────────────────────────────────────────────── */
const loadQuestionnaire = async () => {
  loading.value = true;
  error.value   = '';
  try {
    const { data } = await api.get('/api/v1/ml-analysis/assessment/questionnaire');
    assessment.value = data.assessment;
    questions.value  = Array.isArray(data.assessment?.questions)
      ? data.assessment.questions
      : [];
    answers.value = questions.value.map((q) => ({
      questionId:          q.id,
      selectedOptionIndex: null,
      selectedAnswer:      '',
    }));
  } catch (err) {
    error.value = err?.response?.data?.message || 'Failed to load assessment questionnaire.';
  } finally {
    loading.value = false;
  }
};

const submitAssessment = async () => {
  if (!isComplete.value || submitting.value) return;
  submitting.value = true;
  error.value      = '';
  try {
    const payloadAnswers = answers.value.map((a, index) => {
      const q        = questions.value[index];
      const selected = q?.options?.[a.selectedOptionIndex] || '';
      return {
        questionId:          q?.id,
        question:            q?.question,
        selectedOptionIndex: a.selectedOptionIndex,
        selectedAnswer:      selected,
      };
    });
    const { data } = await api.post('/api/v1/ml-analysis/assessment/submit', {
      quizId:  assessment.value?.id,
      answers: payloadAnswers,
    });
    result.value = data?.data || null;
  } catch (err) {
    error.value = err?.response?.data?.message || 'Failed to submit assessment.';
  } finally {
    submitting.value = false;
  }
};

onMounted(loadQuestionnaire);
</script>

<style scoped>
@reference "@/style.css";

.btn-3d {
  @apply border-b-4 border-black/10 active:border-b active:translate-y-px;
}
</style>