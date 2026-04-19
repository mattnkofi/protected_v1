<template>
  <div class="page-wrapper behavioral-reports">
    <header class="page-header">
      <div class="space-y-2">
        <p class="section-eyebrow">Admin Safety Desk</p>
        <h1 class="page-title tracking-wide">
          Behavioral <span class="brand-gradient-text">AI Reports</span>
        </h1>
        <p class="page-subtitle">
          AI survey readings with scale-based grading and printable summaries.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="refreshAll" :disabled="loading" class="btn-secondary btn-3d--secondary disabled:opacity-50">
          <RefreshCwIcon :class="['h-4 w-4', loading && 'animate-spin']" />
          <span>Refresh</span>
        </button>
        <button @click="printReport" class="btn-primary btn-3d">
          <PrinterIcon class="h-4 w-4" />
          <span>Print Report</span>
        </button>
      </div>
    </header>

    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="flex flex-col items-center gap-4">
        <div class="spinner"></div>
        <p class="loading-text">Loading behavioral reports...</p>
      </div>
    </div>

    <div v-else-if="error" class="card border-2 border-red-200 bg-red-50 text-red-700 p-5">
      {{ error }}
    </div>

    <template v-else>
      <section class="print-root space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="stat-tile">
            <p class="stat-label">Total Assessments</p>
            <p class="stat-value">{{ stats.totalAnalyses || 0 }}</p>
          </div>
          <div class="stat-tile">
            <p class="stat-label">Flagged</p>
            <p class="stat-value text-rose-600">{{ stats.flaggedCount || 0 }}</p>
          </div>
          <div class="stat-tile">
            <p class="stat-label">Avg Scale Score</p>
            <p class="stat-value">{{ stats.scaleAveragePercent || 0 }}%</p>
          </div>
          <div class="stat-tile">
            <p class="stat-label">Severe Risk</p>
            <p class="stat-value text-red-600">{{ severeCount }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="card border-2 border-slate-200 bg-white p-5 space-y-3">
            <h3 class="font-madimione text-base text-slate-800">Scale Reference</h3>
            <p class="text-xs text-slate-500">Each item scores 0-3. Grade is computed by total score / max score.</p>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="scale-pill">0-24%: Low</div>
              <div class="scale-pill">25-49%: Moderate</div>
              <div class="scale-pill">50-74%: High</div>
              <div class="scale-pill">75-100%: Severe</div>
            </div>
          </div>
          <div class="card border-2 border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 class="font-madimione text-base text-slate-800 mb-3">Risk Distribution</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div v-for="(count, level) in stats.riskDistribution" :key="level" class="risk-chip">
                <span class="risk-label">{{ level }}</span>
                <span class="risk-value">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card border-2 border-slate-200 bg-white p-4 print-hide">
          <div class="flex flex-wrap items-center gap-3">
            <select v-model="filters.riskLevel" @change="fetchResults(1)" class="filter-select">
              <option value="">All Risk Levels</option>
              <option value="Severe">Severe</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
            <label class="filter-checkbox">
              <input type="checkbox" v-model="filters.flaggedOnly" @change="fetchResults(1)" />
              Flagged only
            </label>
            <label class="filter-checkbox">
              <input type="checkbox" v-model="filters.unreviewedOnly" @change="fetchResults(1)" />
              Unreviewed only
            </label>
            <input
              v-model="filters.search"
              placeholder="Search student"
              class="filter-input"
            />
            <span class="ml-auto text-xs text-slate-500">{{ resultsMeta.total }} result(s)</span>
          </div>
        </div>

        <div class="overflow-auto rounded-2xl border border-slate-200 bg-white">
          <table class="w-full min-w-[980px]">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th class="p-3">Student</th>
                <th class="p-3">Risk</th>
                <th class="p-3">Scale Score</th>
                <th class="p-3">Grade</th>
                <th class="p-3">Flags</th>
                <th class="p-3">Status</th>
                <th class="p-3">Date</th>
                <th class="p-3 print-hide">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredResults" :key="item.id" class="border-b border-slate-100 text-sm">
                <td class="p-3">
                  <div class="font-semibold text-slate-800">{{ item.student?.name || 'Unknown' }}</div>
                  <div class="text-xs text-slate-500">{{ item.student?.email || '-' }}</div>
                </td>
                <td class="p-3">
                  <span :class="riskClass(item.overall_risk_level)" class="risk-badge">
                    {{ item.overall_risk_level }}
                  </span>
                </td>
                <td class="p-3">{{ formatScale(item.scale) }}</td>
                <td class="p-3">{{ item.scale?.grade || 'N/A' }}</td>
                <td class="p-3">{{ item.concerning_answers_count || 0 }}</td>
                <td class="p-3">{{ item.reviewed ? 'Reviewed' : 'Pending' }}</td>
                <td class="p-3">{{ formatDate(item.created_at) }}</td>
                <td class="p-3 print-hide">
                  <button @click="openDetail(item.id)" class="btn-mini">View</button>
                </td>
              </tr>
              <tr v-if="!filteredResults.length">
                <td colspan="8" class="p-6 text-center text-sm text-slate-500">No behavioral reports found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500 print-hide">
          <span>Page {{ resultsMeta.page }} of {{ resultsMeta.totalPages }}</span>
          <div class="flex items-center gap-2">
            <button @click="fetchResults(resultsMeta.page - 1)" :disabled="resultsMeta.page <= 1" class="btn-mini">Prev</button>
            <button @click="fetchResults(resultsMeta.page + 1)" :disabled="resultsMeta.page >= resultsMeta.totalPages" class="btn-mini">Next</button>
          </div>
        </div>

        <section v-if="detail" class="card border-2 border-slate-200 bg-white p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="section-eyebrow">Assessment Detail</p>
              <h2 class="font-madimione text-lg text-slate-800">{{ detail.student?.name || 'Unknown Student' }}</h2>
            </div>
            <button @click="detail = null" class="btn-mini print-hide">Close</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div class="detail-chip">
              <span class="detail-label">Risk</span>
              <span class="detail-value">{{ detail.overall_risk_level }}</span>
            </div>
            <div class="detail-chip">
              <span class="detail-label">Scale Grade</span>
              <span class="detail-value">{{ detail.scale?.grade || 'N/A' }}</span>
            </div>
            <div class="detail-chip">
              <span class="detail-label">Scale Score</span>
              <span class="detail-value">{{ formatScale(detail.scale) }}</span>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-xs uppercase tracking-wider text-slate-500">Per Answer Readings</p>
            <div v-for="(a, idx) in detail.analysis_results || []" :key="idx" class="answer-row">
              <div class="answer-index">Q{{ (a.question_index ?? idx) + 1 }}</div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-slate-800">{{ a.question_text || 'Question' }}</p>
                <p class="text-xs text-slate-600">Chosen: {{ a.selected_answer || a.answer_text }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-slate-500">Risk</p>
                <p class="text-sm font-semibold text-slate-700">{{ a.risk_level }}</p>
              </div>
            </div>
          </div>
        </section>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { Printer as PrinterIcon, RefreshCw as RefreshCwIcon } from 'lucide-vue-next';
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
  unreviewedOnly: false,
  search: ''
});

const severeCount = computed(() => stats.value.riskDistribution?.Severe || 0);

const filteredResults = computed(() => {
  const term = filters.search.trim().toLowerCase();
  if (!term) return results.value;
  return results.value.filter(item =>
    String(item.student?.name || '').toLowerCase().includes(term) ||
    String(item.student?.email || '').toLowerCase().includes(term)
  );
});

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-');

const formatScale = (scale) => {
  if (!scale) return 'N/A';
  const percent = Math.round((scale.percent || 0) * 100);
  return `${scale.totalScore}/${scale.maxScore} (${percent}%)`;
};

const riskClass = (risk) => {
  if (risk === 'Severe') return 'risk-severe';
  if (risk === 'High') return 'risk-high';
  if (risk === 'Moderate') return 'risk-moderate';
  return 'risk-low';
};

const fetchStats = async () => {
  const { data } = await api.get('/api/v1/admin/behavioral-reports/stats');
  if (!data.success) throw new Error(data.message || 'Failed to fetch stats');
  stats.value = data.stats || {};
};

const fetchResults = async (page = 1) => {
  if (page < 1) return;
  const params = new URLSearchParams({ page, limit: 20 });
  if (filters.riskLevel) params.append('riskLevel', filters.riskLevel);
  if (filters.flaggedOnly) params.append('flaggedOnly', 'true');
  if (filters.unreviewedOnly) params.append('reviewed', 'false');

  const { data } = await api.get(`/api/v1/admin/behavioral-reports/results?${params.toString()}`);
  if (!data.success) throw new Error(data.message || 'Failed to fetch results');

  results.value = data.results || [];
  resultsMeta.page = data.page || 1;
  resultsMeta.totalPages = data.totalPages || 1;
  resultsMeta.total = data.total || 0;
};

const openDetail = async (id) => {
  const { data } = await api.get(`/api/v1/admin/behavioral-reports/${id}`);
  if (!data.success) throw new Error(data.message || 'Failed to fetch detail');
  detail.value = data.result;
};

const refreshAll = async () => {
  loading.value = true;
  error.value = '';
  try {
    await Promise.all([fetchStats(), fetchResults(1)]);
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || 'Failed to load reports.';
  } finally {
    loading.value = false;
  }
};

const printReport = () => {
  window.print();
};

onMounted(refreshAll);
</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stat-tile {
  border: 2px solid #e2e8f0;
  border-radius: 1.5rem;
  padding: 1.25rem;
  background: #fff;
}

.stat-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #64748b;
  font-weight: 600;
}

.stat-value {
  font-family: 'Madimi One', sans-serif;
  font-size: 1.8rem;
  color: #0f172a;
  margin-top: 0.35rem;
}

.scale-pill {
  border: 1px dashed #cbd5f5;
  border-radius: 999px;
  padding: 0.35rem 0.6rem;
  background: #f8fafc;
  color: #475569;
  text-align: center;
}

.risk-chip {
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  padding: 0.75rem;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.risk-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #64748b;
}

.risk-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #111827;
}

.filter-select,
.filter-input {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  background: #fff;
}

.filter-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #475569;
}

.risk-badge {
  display: inline-flex;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
}

.risk-severe {
  background: #fee2e2;
  color: #b91c1c;
}

.risk-high {
  background: #ffedd5;
  color: #c2410c;
}

.risk-moderate {
  background: #fef3c7;
  color: #b45309;
}

.risk-low {
  background: #dcfce7;
  color: #166534;
}

.btn-mini {
  padding: 0.4rem 0.75rem;
  border-radius: 0.7rem;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 600;
}

.detail-chip {
  border-radius: 1rem;
  background: #f8fafc;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
}

.detail-label {
  display: block;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #64748b;
}

.detail-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}

.answer-row {
  display: flex;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1rem;
  background: #f8fafc;
}

.answer-index {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #475569;
}

@media print {
  .print-hide {
    display: none !important;
  }

  .page-wrapper {
    padding: 0 !important;
  }

  .stat-tile,
  .card,
  .answer-row {
    break-inside: avoid;
  }
}
</style>
