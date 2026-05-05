<template>
  <div class="p-6 md:p-8 space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-black uppercase tracking-tight">AI Analytics</h1>
        <p class="text-xs uppercase tracking-[0.2em] text-slate-500 mt-1">ML analysis of behavioral assessment responses</p>
      </div>
      <button
        @click="refreshAll"
        class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-calm-lavender-600 text-white hover:bg-calm-lavender-700 transition-colors"
      >
        Refresh
      </button>
    </div>

    <div v-if="loading" class="p-6 rounded-2xl border border-slate-200 dark:border-abyss-600 text-sm text-slate-500">
      Loading analytics...
    </div>

    <div v-else-if="error" class="p-6 rounded-2xl border border-red-300 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
      {{ error }}
    </div>

    <template v-else>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 rounded-2xl border border-slate-200 dark:border-abyss-600 bg-white dark:bg-abyss-800/60">
          <p class="text-[10px] uppercase tracking-wider text-slate-500">Total Analyses</p>
          <p class="text-2xl font-black mt-1">{{ stats.totalAnalyses || 0 }}</p>
        </div>
        <div class="p-4 rounded-2xl border border-slate-200 dark:border-abyss-600 bg-white dark:bg-abyss-800/60">
          <p class="text-[10px] uppercase tracking-wider text-slate-500">Flagged</p>
          <p class="text-2xl font-black mt-1 text-red-500">{{ stats.flaggedCount || 0 }}</p>
        </div>
        <div class="p-4 rounded-2xl border border-slate-200 dark:border-abyss-600 bg-white dark:bg-abyss-800/60">
          <p class="text-[10px] uppercase tracking-wider text-slate-500">Needs Review</p>
          <p class="text-2xl font-black mt-1 text-amber-500">{{ stats.unreviewedCount || 0 }}</p>
        </div>
        <div class="p-4 rounded-2xl border border-slate-200 dark:border-abyss-600 bg-white dark:bg-abyss-800/60">
          <p class="text-[10px] uppercase tracking-wider text-slate-500">Reviewed</p>
          <p class="text-2xl font-black mt-1 text-emerald-500">{{ reviewedCount }}</p>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="p-4 rounded-2xl border border-slate-200 dark:border-abyss-600 bg-white dark:bg-abyss-800/60">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[10px] uppercase tracking-wider text-slate-500">Age Range Stress</p>
              <p class="text-sm text-slate-600 dark:text-platinum-300 mt-1">High and severe cases grouped by age band.</p>
            </div>
            <span class="px-2 py-1 rounded-full text-[10px] uppercase tracking-wider bg-slate-100 dark:bg-abyss-700 text-slate-600 dark:text-platinum-300">
              {{ ageRangeGraph.length }} bands
            </span>
          </div>

          <div class="mt-4 space-y-3">
            <div v-for="band in ageRangeGraph" :key="band.label" class="space-y-1">
              <div class="flex items-center justify-between text-xs text-slate-600 dark:text-platinum-300">
                <span>{{ band.label }}</span>
                <span>{{ band.stressCount }} stressed of {{ band.total }}</span>
              </div>
              <div class="h-2 rounded-full bg-slate-200 dark:bg-abyss-700 overflow-hidden">
                <div class="h-full rounded-full bg-calm-lavender-500 transition-all duration-300" :style="{ width: `${barWidth(band.stressCount, band.maxStress)}%` }" />
              </div>
              <p class="text-[11px] text-slate-500 dark:text-platinum-400">{{ band.severeRate }}% high/severe among this band</p>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-2xl border border-slate-200 dark:border-abyss-600 bg-white dark:bg-abyss-800/60">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[10px] uppercase tracking-wider text-slate-500">Usual Reasons</p>
              <p class="text-sm text-slate-600 dark:text-platinum-300 mt-1">Most common stress themes found in the assessments.</p>
            </div>
            <span v-if="topReason" class="px-2 py-1 rounded-full text-[10px] uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200">
              Top: {{ topReason.label }}
            </span>
          </div>

          <div class="mt-4 space-y-3">
            <div v-for="reason in reasonGraph" :key="reason.key" class="space-y-1 rounded-xl border border-slate-200/80 dark:border-abyss-700/80 bg-slate-50 dark:bg-abyss-900/30 p-3">
              <div class="flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-platinum-300">
                <div>
                  <p class="font-semibold text-slate-700 dark:text-platinum-200">{{ reason.label }}</p>
                  <p class="text-[11px] text-slate-500 dark:text-platinum-400">Example: {{ reason.example }}</p>
                </div>
                <span class="font-bold">{{ reason.count }}</span>
              </div>
              <div class="h-2 rounded-full bg-slate-200 dark:bg-abyss-700 overflow-hidden">
                <div class="h-full rounded-full bg-amber-500 transition-all duration-300" :style="{ width: `${barWidth(reason.count, maxReasonCount)}%` }" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 rounded-2xl border border-slate-200 dark:border-abyss-600 bg-white dark:bg-abyss-800/60">
        <div class="flex flex-wrap gap-3 items-center">
          <select v-model="filters.riskLevel" @change="fetchResults(1)" class="px-3 py-2 rounded-lg border border-slate-200 dark:border-abyss-600 text-sm bg-transparent">
            <option value="">All Risk Levels</option>
            <option value="Severe">Severe</option>
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>
          <label class="text-sm flex items-center gap-2">
            <input type="checkbox" v-model="filters.flaggedOnly" @change="fetchResults(1)" />
            Flagged only
          </label>
          <label class="text-sm flex items-center gap-2">
            <input type="checkbox" v-model="filters.unreviewedOnly" @change="fetchResults(1)" />
            Unreviewed only
          </label>
          <span class="ml-auto text-xs text-slate-500">{{ resultsMeta.total }} result(s)</span>
        </div>
      </div>

      <div class="overflow-auto rounded-2xl border border-slate-200 dark:border-abyss-600 bg-white dark:bg-abyss-800/60">
        <table class="w-full min-w-[900px]">
          <thead>
            <tr class="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-abyss-600">
              <th class="p-3">Student</th>
              <th class="p-3">Age Range</th>
              <th class="p-3">Quiz</th>
              <th class="p-3">Risk</th>
              <th class="p-3">Prediction</th>
              <th class="p-3">Category</th>
              <th class="p-3">Flags</th>
              <th class="p-3">Status</th>
              <th class="p-3">Date</th>
              <th class="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in results"
              :key="item.id"
              class="border-b border-slate-100 dark:border-abyss-700 text-sm"
            >
              <td class="p-3">{{ item.student?.name || 'Unknown' }}</td>
              <td class="p-3 text-xs text-slate-600 dark:text-platinum-300">{{ ageBandLabel(item.student_birthdate || item.student?.profile?.date_of_birth) }}</td>
              <td class="p-3">{{ item.quiz?.title || '-' }}</td>
              <td class="p-3">
                <span :class="riskClass(item.overall_risk_level)" class="px-2 py-1 rounded-full text-xs font-bold">
                  {{ item.overall_risk_level }}
                </span>
              </td>
              <td class="p-3">
                <span :class="predictionClass(item)" class="px-2 py-1 rounded-full text-xs font-bold">
                  {{ predictionLabel(item) }}
                </span>
              </td>
              <td class="p-3">{{ item.dominant_category }}</td>
              <td class="p-3">{{ item.concerning_answers_count || 0 }}</td>
              <td class="p-3">{{ item.reviewed ? 'Reviewed' : 'Pending' }}</td>
              <td class="p-3">{{ formatDate(item.created_at) }}</td>
              <td class="p-3">
                <button
                  @click="openDetail(item.id)"
                  class="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-abyss-700 hover:bg-slate-200 dark:hover:bg-abyss-600"
                >
                  View
                </button>
              </td>
            </tr>
            <tr v-if="!results.length">
              <td colspan="10" class="p-6 text-center text-sm text-slate-500">No ML analysis results yet.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="detail" class="p-4 rounded-2xl border border-slate-200 dark:border-abyss-600 bg-white dark:bg-abyss-800/60 space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="font-black uppercase tracking-wide">Analysis Detail</h2>
          <button @click="detail = null" class="text-xs text-slate-500 hover:text-slate-700">Close</button>
        </div>

        <div class="text-sm">
          <p><strong>Student:</strong> {{ detail.student?.name || 'Unknown' }}</p>
          <p><strong>Age Range:</strong> {{ ageBandLabel(detail.student_birthdate || detail.student?.profile?.date_of_birth) }}</p>
          <p><strong>Quiz:</strong> {{ detail.quiz?.title || '-' }}</p>
          <p><strong>Risk:</strong> {{ detail.overall_risk_level }}</p>
          <p><strong>Prediction:</strong> {{ predictionLabel(detail) }}</p>
          <p><strong>Category:</strong> {{ detail.dominant_category }}</p>
          <p class="mt-2 text-xs uppercase tracking-wider text-slate-500">Prediction Summary</p>
          <p class="text-sm text-slate-700 dark:text-platinum-200">{{ predictionSummary(detail) }}</p>
        </div>

        <div class="space-y-2">
          <p class="text-xs uppercase tracking-wider text-slate-500">Per Answer</p>
          <div
            v-for="(a, idx) in detail.analysis_results || []"
            :key="idx"
            class="p-3 rounded-xl border border-slate-200 dark:border-abyss-700"
          >
            <p v-if="a.question_text" class="text-sm"><strong>Question:</strong> {{ a.question_text }}</p>
            <p class="text-sm"><strong>Chosen Answer:</strong> {{ a.selected_answer || a.answer_text }}</p>
            <p class="text-xs mt-1"><strong>Category:</strong> {{ a.category }} | <strong>Risk:</strong> {{ a.risk_level }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import api from '@/utils/api';

const loading = ref(true);
const error = ref('');
const stats = ref({});
const results = ref([]);
const detail = ref(null);

const resultsMeta = reactive({ page: 1, totalPages: 1, total: 0 });
const filters = reactive({
  riskLevel: '',
  flaggedOnly: false,
  unreviewedOnly: false
});

const reviewedCount = computed(() => {
  const total = stats.value.totalAnalyses || 0;
  const pending = stats.value.unreviewedCount || 0;
  return Math.max(0, total - pending);
});

const formatDate = (d) => (d ? new Date(d).toLocaleString() : '-');

const riskClass = (risk) => {
  if (risk === 'Severe') return 'bg-red-100 text-red-700';
  if (risk === 'High') return 'bg-orange-100 text-orange-700';
  if (risk === 'Moderate') return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
};

const predictionLabel = (item) => {
  const risk = String(item?.overall_risk_level || 'Low');
  if (['High', 'Severe'].includes(risk) || item?.flags_detected) return 'Seminar recommended';
  if (risk === 'Moderate') return 'Monitor closely';
  return 'Low intervention';
};

const predictionClass = (item) => {
  const label = predictionLabel(item);
  if (label === 'Seminar recommended') return 'bg-red-100 text-red-700';
  if (label === 'Monitor closely') return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
};

const predictionSummary = (item) => {
  const risk = String(item?.overall_risk_level || 'Low');
  const category = item?.dominant_category || 'neutral pattern';
  if (['High', 'Severe'].includes(risk) || item?.flags_detected) {
    return `The model predicts elevated stress indicators. The main pattern is ${category}, so a support seminar or facilitator follow-up is recommended.`;
  }
  if (risk === 'Moderate') {
    return `The model predicts moderate stress indicators. The main pattern is ${category}, so closer monitoring and a check-in are advised.`;
  }
  return `The model predicts low stress indicators. The main pattern is ${category}, so regular monitoring and self-checks are enough for now.`;
};

const ageBandLabel = (dateOfBirth) => {
  if (!dateOfBirth) return 'Unknown';
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return 'Unknown';

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  if (age < 13) return 'Below 13';
  if (age <= 15) return '13-15';
  if (age <= 18) return '16-18';
  if (age <= 24) return '19-24';
  if (age <= 34) return '25-34';
  if (age <= 44) return '35-44';
  return '45+';
};

const ageRangeGraph = computed(() => {
  const rows = Array.isArray(stats.value.ageRangeDistribution) ? stats.value.ageRangeDistribution : [];
  const maxStress = Math.max(1, ...rows.map(row => row.severeOrHigh || row.flagged || 0));

  return rows.map((row) => ({
    label: row.label,
    total: row.total || 0,
    stressCount: row.severeOrHigh || row.flagged || 0,
    severeRate: row.severeRate || 0,
    maxStress
  }));
});

const reasonGraph = computed(() => Array.isArray(stats.value.reasonBreakdown) ? stats.value.reasonBreakdown : []);
const topReason = computed(() => reasonGraph.value[0] || null);
const maxReasonCount = computed(() => Math.max(1, ...reasonGraph.value.map(row => row.count || 0)));

const barWidth = (count, maxCount) => Math.round(((count || 0) / Math.max(1, maxCount || 0)) * 100);

const fetchStats = async () => {
  const { data } = await api.get('/api/v1/ml-analysis/facilitator/stats');
  if (!data.success) throw new Error(data.message || 'Failed to fetch stats');
  stats.value = data.stats || {};
};

const fetchResults = async (page = 1) => {
  const params = new URLSearchParams({ page, limit: 20 });
  if (filters.riskLevel) params.append('riskLevel', filters.riskLevel);
  if (filters.flaggedOnly) params.append('flaggedOnly', 'true');
  if (filters.unreviewedOnly) params.append('reviewed', 'false');

  const { data } = await api.get(`/api/v1/ml-analysis/facilitator/results?${params.toString()}`);
  if (!data.success) throw new Error(data.message || 'Failed to fetch results');

  results.value = data.results || [];
  resultsMeta.page = data.page || 1;
  resultsMeta.totalPages = data.totalPages || 1;
  resultsMeta.total = data.total || 0;
};

const openDetail = async (id) => {
  const { data } = await api.get(`/api/v1/ml-analysis/${id}`);
  if (!data.success) throw new Error(data.message || 'Failed to fetch detail');
  detail.value = data.result;
};

const refreshAll = async () => {
  loading.value = true;
  error.value = '';
  try {
    await Promise.all([fetchStats(), fetchResults(1)]);
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || 'Failed to load analytics.';
  } finally {
    loading.value = false;
  }
};

onMounted(refreshAll);
</script>
