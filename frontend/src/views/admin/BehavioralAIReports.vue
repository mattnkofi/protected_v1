<template>
  <div class="page-wrapper animate-in behavioral-assessment">
    <div class="assessment-glow" aria-hidden="true"></div>

    <header class="assessment-hero">
      <div class="hero-copy">
        <p class="hero-eyebrow">Behavioral Pattern & Risk Check</p>
        <h1 class="hero-title">Behavioral Pattern & Risk Check</h1>
        <p class="hero-subtitle">
          Pattern insights, scale grading, and printable summaries for the behavioral assessment pipeline.
        </p>
      </div>
      <div class="hero-actions">
        <button @click="refreshAll" :disabled="loading" class="action-btn action-btn--ghost">
          <RefreshCwIcon :class="['h-4 w-4', loading && 'animate-spin']" />
          <span>Refresh</span>
        </button>
        <button @click="printReport" class="action-btn action-btn--solid">
          <PrinterIcon class="h-4 w-4" />
          <span>Print Report</span>
        </button>
      </div>
    </header>

    <div v-if="loading" class="status-panel">
      <div class="status-content">
        <div class="spinner"></div>
        <p class="status-text">Loading behavioral reports...</p>
      </div>
    </div>

    <div v-else-if="error" class="status-panel status-panel--error">
      {{ error }}
    </div>

    <template v-else>
      <section class="print-root space-y-6">
        <div class="metric-grid">
          <div class="metric-card">
            <p class="metric-label">Total Assessments</p>
            <p class="metric-value">{{ stats.totalAnalyses || 0 }}</p>
          </div>
          <div class="metric-card">
            <p class="metric-label">Flagged</p>
            <p class="metric-value metric-value--rose">{{ stats.flaggedCount || 0 }}</p>
          </div>
          <div class="metric-card">
            <p class="metric-label">Avg Scale Score</p>
            <p class="metric-value">{{ scaleAveragePercent }}%</p>
          </div>
          <div class="metric-card">
            <p class="metric-label">Severe Risk</p>
            <p class="metric-value metric-value--red">{{ severeCount }}</p>
          </div>
        </div>

        <div class="insight-grid">
          <div class="insight-card">
            <div class="insight-header">
              <p class="insight-label">Scale Reference</p>
              <p class="insight-caption">Each item scores 0-3. Grade uses total score / max score.</p>
            </div>
            <div class="scale-pills">
              <div class="scale-pill">0-24%: Low</div>
              <div class="scale-pill">25-49%: Moderate</div>
              <div class="scale-pill">50-74%: High</div>
              <div class="scale-pill">75-100%: Severe</div>
            </div>
          </div>
          <div class="insight-card insight-card--wide">
            <div class="insight-header">
              <p class="insight-label">Risk Distribution</p>
              <p class="insight-caption">Weighted breakdown across submitted assessments.</p>
            </div>
            <div class="risk-grid">
              <div v-for="(count, level) in stats.riskDistribution" :key="level" class="risk-chip">
                <span class="risk-label">{{ level }}</span>
                <span class="risk-value">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="filter-panel print-hide">
          <div class="filter-row">
            <select v-model="filters.riskLevel" @change="fetchResults(1)" class="filter-select">
              <option value="">All Risk Levels</option>
              <option value="Severe">Severe</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
            <label class="filter-chip">
              <input type="checkbox" v-model="filters.flaggedOnly" @change="fetchResults(1)" />
              Flagged only
            </label>
            <label class="filter-chip">
              <input type="checkbox" v-model="filters.unreviewedOnly" @change="fetchResults(1)" />
              Unreviewed only
            </label>
            <input
              v-model="filters.search"
              placeholder="Search student"
              class="filter-input"
            />
            <span class="filter-count">{{ resultsMeta.total }} result(s)</span>
          </div>
        </div>

        <div class="result-grid">
          <article v-for="item in filteredResults" :key="item.id" class="result-card">
            <div class="result-header">
              <div>
                <p class="student-name">{{ item.student?.name || 'Unknown' }}</p>
                <p class="student-meta">{{ item.student?.email || '-' }}</p>
              </div>
              <span :class="riskClass(item.overall_risk_level)" class="risk-badge">
                {{ item.overall_risk_level }}
              </span>
            </div>

            <div class="result-metrics">
              <div>
                <p class="result-label">Scale Score</p>
                <p class="result-value">{{ formatScale(item) }}</p>
              </div>
              <div>
                <p class="result-label">Grade</p>
                <p class="result-value">{{ computeScale(item).grade }}</p>
              </div>
              <div>
                <p class="result-label">Flags</p>
                <p class="result-value">{{ item.concerning_answers_count || 0 }}</p>
              </div>
              <div>
                <p class="result-label">Status</p>
                <p class="result-value">{{ item.reviewed ? 'Reviewed' : 'Pending' }}</p>
              </div>
            </div>

            <div class="result-footer">
              <p class="result-date">{{ formatDate(item.created_at) }}</p>
              <button @click="openDetail(item.id)" class="btn-mini print-hide">View</button>
            </div>
          </article>

          <div v-if="!filteredResults.length" class="empty-row">No behavioral reports found.</div>
        </div>

        <div class="table-footer print-hide">
          <span>Page {{ resultsMeta.page }} of {{ resultsMeta.totalPages }}</span>
          <div class="table-actions">
            <button @click="fetchResults(resultsMeta.page - 1)" :disabled="resultsMeta.page <= 1" class="btn-mini">Prev</button>
            <button @click="fetchResults(resultsMeta.page + 1)" :disabled="resultsMeta.page >= resultsMeta.totalPages" class="btn-mini">Next</button>
          </div>
        </div>

        <section v-if="detail" class="detail-panel">
          <div class="detail-header">
            <div>
              <p class="detail-eyebrow">Assessment Detail</p>
              <h2 class="detail-title">{{ detail.student?.name || 'Unknown Student' }}</h2>
            </div>
            <button @click="detail = null" class="btn-mini print-hide">Close</button>
          </div>

          <div class="detail-grid">
            <div class="detail-chip">
              <span class="detail-label">Risk</span>
              <span class="detail-value">{{ detail.overall_risk_level }}</span>
            </div>
            <div class="detail-chip">
              <span class="detail-label">Scale Grade</span>
              <span class="detail-value">{{ computeScale(detail).grade }}</span>
            </div>
            <div class="detail-chip">
              <span class="detail-label">Scale Score</span>
              <span class="detail-value">{{ formatScale(detail) }}</span>
            </div>
          </div>

          <div class="answer-stack">
            <p class="answer-title">Per Answer Readings</p>
            <div v-for="(a, idx) in detail.analysis_results || []" :key="idx" class="answer-row">
              <div class="answer-index">Q{{ (a.question_index ?? idx) + 1 }}</div>
              <div class="flex-1">
                <p class="answer-question">{{ a.question_text || 'Question' }}</p>
                <p class="answer-meta">Chosen: {{ a.selected_answer || a.answer_text }}</p>
              </div>
              <div class="text-right">
                <p class="answer-risk-label">Risk</p>
                <p class="answer-risk-value">{{ a.risk_level }}</p>
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

const computeScale = (item) => {
  if (!item) return { totalScore: 0, maxScore: 0, percent: 0, grade: 'N/A' };
  const totalAnswers = Number(item.total_answers_analyzed ?? item.totalAnswersAnalyzed ?? 0) || 0;
  const concerning = Number(item.concerning_answers_count ?? item.concerningAnswersCount ?? 0) || 0;
  const percent = totalAnswers ? Math.round((concerning / totalAnswers) * 100) : 0;
  let grade = 'Low';
  if (percent >= 75) grade = 'Severe';
  else if (percent >= 50) grade = 'High';
  else if (percent >= 25) grade = 'Moderate';
  return { totalScore: concerning, maxScore: totalAnswers, percent, grade };
};

const formatScale = (item) => {
  const scale = computeScale(item);
  if (!scale.maxScore) return 'N/A';
  return `${scale.totalScore}/${scale.maxScore} (${scale.percent}%)`;
};

const scaleAveragePercent = computed(() => {
  if (!results.value.length) return 0;
  const total = results.value.reduce((sum, item) => sum + computeScale(item).percent, 0);
  return Math.round(total / results.value.length);
});

const riskClass = (risk) => {
  if (risk === 'Severe') return 'risk-severe';
  if (risk === 'High') return 'risk-high';
  if (risk === 'Moderate') return 'risk-moderate';
  return 'risk-low';
};

const fetchStats = async () => {
  const { data } = await api.get('/api/v1/ml-analysis/facilitator/stats');
  if (!data.success) throw new Error(data.message || 'Failed to fetch stats');
  stats.value = data.stats || {};
};

const fetchResults = async (page = 1) => {
  if (page < 1) return;
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
  gap: 1.75rem;
  position: relative;
}

.behavioral-assessment {
  --br-bg: #f6f2ee;
  --br-card: #fff7f1;
  --br-card-alt: #fefaf7;
  --br-ink: #1f1a16;
  --br-muted: #7c6f66;
  --br-border: #eadfd6;
  --br-accent: #f18f3b;
  --br-accent-2: #225c6b;
  --br-shadow: rgba(88, 68, 50, 0.16);
  background: radial-gradient(circle at top left, #fff1df 0%, #f6f2ee 45%, #f7f0ea 100%);
}

.assessment-glow {
  position: absolute;
  inset: -180px -120px auto auto;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(241, 143, 59, 0.22), transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.assessment-hero {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
  justify-content: space-between;
  padding: 1.5rem 1.75rem;
  border-radius: 1.75rem;
  background: linear-gradient(140deg, #fff7ef, #f6ebe2 70%);
  border: 1px solid var(--br-border);
  box-shadow: 0 18px 40px -30px var(--br-shadow);
}

.hero-copy {
  max-width: 620px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hero-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--br-accent-2);
}

.hero-title {
  font-family: 'Madimi One', sans-serif;
  font-size: clamp(2rem, 2.8vw, 2.8rem);
  color: var(--br-ink);
}

.hero-subtitle {
  color: var(--br-muted);
  font-size: 0.95rem;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.action-btn--ghost {
  background: transparent;
  border: 1px solid var(--br-border);
  color: var(--br-ink);
}

.action-btn--solid {
  background: linear-gradient(120deg, #f18f3b, #f6b85f);
  color: #1f1a16;
  border: none;
  box-shadow: 0 12px 20px -16px var(--br-shadow);
}

.action-btn:hover {
  transform: translateY(-1px);
}

.status-panel {
  border-radius: 1.25rem;
  border: 1px solid var(--br-border);
  background: var(--br-card);
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.status-panel--error {
  background: #fff1f1;
  color: #b11a1a;
  border-color: #f2c8c8;
}

.status-content {
  display: inline-flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
}

.status-text {
  font-weight: 600;
  color: var(--br-muted);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.metric-card {
  padding: 1.1rem 1.25rem;
  border-radius: 1.25rem;
  background: var(--br-card);
  border: 1px solid var(--br-border);
  box-shadow: 0 12px 24px -20px var(--br-shadow);
}

.metric-label {
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--br-muted);
}

.metric-value {
  font-family: 'Madimi One', sans-serif;
  font-size: 1.8rem;
  color: var(--br-ink);
  margin-top: 0.35rem;
}

.metric-value--rose {
  color: #c04a4a;
}

.metric-value--red {
  color: #b11a1a;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.insight-card {
  padding: 1.4rem 1.5rem;
  border-radius: 1.5rem;
  background: var(--br-card-alt);
  border: 1px solid var(--br-border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insight-card--wide {
  grid-column: span 2;
}

.insight-header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.insight-label {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--br-ink);
}

.insight-caption {
  font-size: 0.75rem;
  color: var(--br-muted);
}

.scale-pills {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.scale-pill {
  border: 1px dashed var(--br-border);
  border-radius: 999px;
  padding: 0.4rem 0.75rem;
  background: #fff;
  color: var(--br-muted);
  font-size: 0.7rem;
  text-align: center;
  font-weight: 600;
}

.risk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.65rem;
}

.risk-chip {
  border: 1px solid var(--br-border);
  border-radius: 1rem;
  padding: 0.75rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.risk-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--br-muted);
}

.risk-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--br-ink);
}

.filter-panel {
  padding: 0.9rem 1.1rem;
  border-radius: 1.2rem;
  background: var(--br-card);
  border: 1px solid var(--br-border);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}

.filter-select,
.filter-input {
  border: 1px solid var(--br-border);
  border-radius: 0.9rem;
  padding: 0.5rem 0.8rem;
  font-size: 0.85rem;
  background: #fff;
  color: var(--br-ink);
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--br-border);
  background: #fff;
  font-size: 0.75rem;
  color: var(--br-muted);
}

.filter-count {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--br-muted);
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.result-card {
  border-radius: 1.4rem;
  border: 1px solid var(--br-border);
  background: #fff;
  padding: 1.2rem 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 16px 30px -26px var(--br-shadow);
}

.result-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.student-name {
  font-weight: 700;
  color: var(--br-ink);
  font-size: 0.95rem;
}

.student-meta {
  font-size: 0.7rem;
  color: var(--br-muted);
}

.result-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.result-label {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.6rem;
  color: var(--br-muted);
  font-weight: 700;
}

.result-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--br-ink);
  margin-top: 0.2rem;
}

.result-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--br-muted);
}

.result-date {
  font-weight: 600;
}

.empty-row {
  text-align: center;
  padding: 1.5rem;
  color: var(--br-muted);
  font-size: 0.85rem;
  border-radius: 1.2rem;
  border: 1px dashed var(--br-border);
  background: #fff;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--br-muted);
}

.table-actions {
  display: inline-flex;
  gap: 0.5rem;
}

.risk-badge {
  display: inline-flex;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
}

.risk-severe {
  background: #ffe0d9;
  color: #b12a23;
}

.risk-high {
  background: #ffe6bf;
  color: #b25a10;
}

.risk-moderate {
  background: #fff0bf;
  color: #9b6b00;
}

.risk-low {
  background: #d8f3df;
  color: #1f6b3c;
}

.btn-mini {
  padding: 0.4rem 0.8rem;
  border-radius: 0.75rem;
  background: #fff1df;
  color: var(--br-ink);
  font-size: 0.72rem;
  font-weight: 700;
}

.detail-panel {
  border-radius: 1.5rem;
  border: 1px solid var(--br-border);
  background: var(--br-card-alt);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.detail-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.65rem;
  color: var(--br-muted);
  font-weight: 700;
}

.detail-title {
  font-family: 'Madimi One', sans-serif;
  font-size: 1.2rem;
  color: var(--br-ink);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.detail-chip {
  border-radius: 1rem;
  background: #fff;
  padding: 0.75rem 1rem;
  border: 1px solid var(--br-border);
}

.detail-label {
  display: block;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--br-muted);
}

.detail-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--br-ink);
}

.answer-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.answer-title {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.65rem;
  color: var(--br-muted);
  font-weight: 700;
}

.answer-row {
  display: flex;
  gap: 1rem;
  border: 1px solid var(--br-border);
  border-radius: 1rem;
  padding: 1rem;
  background: #fff;
}

.answer-index {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: #f3e6d8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #6b5845;
}

.answer-question {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--br-ink);
}

.answer-meta {
  font-size: 0.75rem;
  color: var(--br-muted);
}

.answer-risk-label {
  font-size: 0.7rem;
  color: var(--br-muted);
}

.answer-risk-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--br-ink);
}

@media (max-width: 768px) {
  .assessment-hero {
    padding: 1.25rem;
  }

  .filter-count {
    width: 100%;
    margin-left: 0;
  }

  .insight-card--wide {
    grid-column: span 1;
  }
}

@media print {
  .print-hide {
    display: none !important;
  }

  .page-wrapper {
    padding: 0 !important;
  }

  .metric-card,
  .insight-card,
  .detail-panel,
  .answer-row {
    break-inside: avoid;
  }
}
</style>
