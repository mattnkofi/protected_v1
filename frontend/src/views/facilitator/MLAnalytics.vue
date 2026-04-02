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
              <th class="p-3">Quiz</th>
              <th class="p-3">Risk</th>
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
              <td class="p-3">{{ item.quiz?.title || '-' }}</td>
              <td class="p-3">
                <span :class="riskClass(item.overall_risk_level)" class="px-2 py-1 rounded-full text-xs font-bold">
                  {{ item.overall_risk_level }}
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
              <td colspan="8" class="p-6 text-center text-sm text-slate-500">No ML analysis results yet.</td>
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
          <p><strong>Quiz:</strong> {{ detail.quiz?.title || '-' }}</p>
          <p><strong>Risk:</strong> {{ detail.overall_risk_level }}</p>
          <p><strong>Category:</strong> {{ detail.dominant_category }}</p>
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
