<template>
  <section class="min-h-[70vh] font-poppins">
    <div class="max-w-4xl mx-auto space-y-6">
      <header class="rounded-2xl border-2 p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40">
        <p class="text-[11px] uppercase tracking-[0.22em] font-semibold text-red-500">Early Intervention Tool</p>
        <h1 class="font-madimione text-3xl text-abyss-900 dark:text-platinum-50 mt-1">Behavioral Pattern & Risk Check</h1>
        <p class="text-sm text-platinum-700 dark:text-platinum-300 mt-2">
          This dedicated 34-item questionnaire is separate from gamified quizzes and screens four dimensions: possible victim indicators, risk indicators, violator tendencies, and general behavioral indicators.
        </p>
      </header>

      <div v-if="loading" class="rounded-2xl border-2 p-8 text-center bg-platinum-100 dark:bg-abyss-700 border-platinum-300 dark:border-abyss-600">
        <p class="text-sm text-platinum-600 dark:text-platinum-400">Loading assessment questionnaire...</p>
      </div>

      <div v-else-if="error" class="rounded-2xl border-2 p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40">
        <p class="text-sm text-red-600 dark:text-red-300">{{ error }}</p>
      </div>

      <form v-else @submit.prevent="submitAssessment" class="space-y-4">
        <section
          v-for="section in groupedQuestions"
          :key="section.key"
          class="rounded-2xl border-2 p-5 bg-platinum-100 dark:bg-abyss-700 border-platinum-300 dark:border-abyss-600"
        >
          <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <p class="text-xs uppercase tracking-wider text-calm-lavender-600 dark:text-calm-lavender-400 font-semibold">
                Screening Dimension
              </p>
              <h2 class="text-lg font-semibold text-abyss-800 dark:text-platinum-100 mt-1">
                {{ section.label }}
              </h2>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full border bg-white dark:bg-abyss-800 border-platinum-200 dark:border-abyss-600 text-platinum-600 dark:text-platinum-300">
              {{ section.questions.length }} items
            </span>
          </div>

          <article
            v-for="item in section.questions"
            :key="item.id || item.questionIndex"
            class="rounded-xl border px-4 py-4 bg-white/70 dark:bg-abyss-800 border-platinum-200 dark:border-abyss-600"
          >
            <p class="text-xs uppercase tracking-wider text-calm-lavender-600 dark:text-calm-lavender-400 font-semibold">
              Question {{ item.questionIndex + 1 }}
            </p>
            <h3 class="text-base font-semibold text-abyss-800 dark:text-platinum-100 mt-1">{{ item.question }}</h3>

            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                v-for="(option, optionIndex) in item.options"
                :key="`${item.id || item.questionIndex}-${optionIndex}`"
                class="flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer transition-colors"
                :class="selectedIndex(item.questionIndex) === optionIndex
                  ? 'bg-calm-lavender-50 dark:bg-calm-lavender-900/20 border-calm-lavender-300 dark:border-calm-lavender-700'
                  : 'bg-white dark:bg-abyss-800 border-platinum-200 dark:border-abyss-600 hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700'"
              >
                <input
                  type="radio"
                  :name="`q-${item.questionIndex}`"
                  :value="optionIndex"
                  v-model.number="answers[item.questionIndex].selectedOptionIndex"
                  class="accent-calm-lavender-600"
                />
                <span class="text-sm text-abyss-700 dark:text-platinum-200">{{ option }}</span>
              </label>
            </div>
          </article>
        </section>

        <div class="rounded-2xl border-2 p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40">
          <p class="text-xs text-amber-700 dark:text-amber-300">
            This tool supports early intervention and guidance. It does not replace immediate emergency support when safety is at risk.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="submit"
            :disabled="submitting || !isComplete"
            class="px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-calm-lavender-600 to-neon-pink-500 border border-calm-lavender-700 disabled:opacity-50"
          >
            {{ submitting ? 'Submitting Assessment...' : 'Submit Assessment' }}
          </button>
          <p v-if="!isComplete" class="text-xs text-platinum-500 dark:text-platinum-400">Answer all questions to submit.</p>
        </div>
      </form>

      <section v-if="result" class="rounded-2xl border-2 p-6 bg-safety-teal-50 dark:bg-safety-teal-900/20 border-safety-teal-200 dark:border-safety-teal-700/40">
        <h3 class="font-semibold text-abyss-800 dark:text-platinum-100">Assessment submitted</h3>
        <p class="text-sm text-platinum-700 dark:text-platinum-300 mt-1">
          ML risk level: <span class="font-semibold">{{ result.mlResult?.overall_risk_level || 'N/A' }}</span>
        </p>
        <p class="text-sm text-platinum-700 dark:text-platinum-300 mt-1">
          Alert status: <span class="font-semibold">{{ result.alertCreated ? 'Early-support alert created' : 'No new alert created' }}</span>
        </p>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import api from '@/utils/api';

const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const assessment = ref(null);
const questions = ref([]);
const answers = ref([]);
const result = ref(null);

const groupedQuestions = computed(() => {
  const sections = [];
  const sectionMap = new Map();

  questions.value.forEach((question, questionIndex) => {
    const label = question.dimensionLabel || 'General';
    if (!sectionMap.has(label)) {
      const section = {
        key: question.dimension || label.toLowerCase().replace(/\s+/g, '-'),
        label,
        questions: []
      };
      sectionMap.set(label, section);
      sections.push(section);
    }

    sectionMap.get(label).questions.push({ ...question, questionIndex });
  });

  return sections;
});

const isComplete = computed(() =>
  answers.value.length > 0 && answers.value.every(a => Number.isInteger(a.selectedOptionIndex))
);

const selectedIndex = (index) => answers.value[index]?.selectedOptionIndex ?? null;

const loadQuestionnaire = async () => {
  loading.value = true;
  error.value = '';

  try {
    const { data } = await api.get('/api/v1/ml-analysis/assessment/questionnaire');
    assessment.value = data.assessment;
    questions.value = Array.isArray(data.assessment?.questions) ? data.assessment.questions : [];
    if (Array.isArray(data.assessment?.sections) && data.assessment.sections.length) {
      assessment.value.sections = data.assessment.sections;
    }
    answers.value = questions.value.map((q) => ({
      questionId: q.id,
      selectedOptionIndex: null,
      selectedAnswer: ''
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
  error.value = '';

  try {
    const payloadAnswers = answers.value.map((a, index) => {
      const q = questions.value[index];
      const selected = q?.options?.[a.selectedOptionIndex] || '';
      return {
        questionId: q?.id,
        question: q?.question,
        selectedOptionIndex: a.selectedOptionIndex,
        selectedAnswer: selected
      };
    });

    const { data } = await api.post('/api/v1/ml-analysis/assessment/submit', {
      quizId: assessment.value?.id,
      answers: payloadAnswers
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
