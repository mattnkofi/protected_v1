<template>
  <div class="page-wrapper animate-in font-mplusrounded">
      <header class="page-header">
        <div class="space-y-2">
          <p class="section-eyebrow">Campus Map</p>
          <h1 class="page-title">HGDG <span class="brand-gradient-text">Proposals</span></h1>
          <p class="page-subtitle">Organized by campus and status.</p>
        </div>
      </header>

      <div class="card p-4 flex gap-4 flex-wrap">
        <select
          v-model="statusFilter"
          class="px-4 py-2 bg-white dark:bg-abyss-700 border border-slate-200 dark:border-abyss-500 rounded-xl text-slate-700 dark:text-platinum-100 hover:border-calm-lavender-400 transition-colors"
        >
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected_with_feedback">Needs Revision</option>
        </select>

        <button
          @click="loadProposals"
          class="btn-primary"
        >
          Refresh
        </button>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin">
          <svg class="w-8 h-8 text-calm-lavender-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>

      <div v-else class="space-y-8">
        <div v-for="campus in campusesWithProposals" :key="campus.id" class="card p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-calm-lavender-100 dark:bg-cyan-500/10 rounded-xl border border-calm-lavender-200 dark:border-cyan-400/30">
              <span class="text-calm-lavender-700 dark:text-cyan-200 font-semibold text-sm">Campus</span>
            </div>
            <h2 class="text-2xl font-semibold text-slate-800 dark:text-platinum-100">{{ campus.name }}</h2>
          </div>

          <div v-if="campus.proposals.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="proposal in campus.proposals"
              :key="proposal.id"
              @click="selectProposal(proposal)"
              class="item-card !p-5 cursor-pointer hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700/60"
            >
              <h3 class="text-lg font-semibold text-slate-800 dark:text-platinum-100 mb-3 line-clamp-2">{{ proposal.title }}</h3>
              <div class="flex items-center gap-2 mb-4">
                <span :class="getStatusBadgeClass(proposal.status)" class="px-3 py-1 rounded-full text-xs font-semibold border">
                  {{ formatStatus(proposal.status) }}
                </span>
              </div>
              <div v-if="proposal.file_key" class="mb-4 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-500/30">
                <FileText class="w-4 h-4" />
                Document uploaded
              </div>
              <p class="text-xs text-slate-500 dark:text-platinum-400 mb-5">
                Submitted: {{ formatDate(proposal.submission_date) }}
              </p>
              <div class="flex gap-2 pt-4 border-t border-slate-200 dark:border-abyss-600">
                <button
                  @click.stop="selectProposal(proposal)"
                  class="btn-primary flex-1 justify-center text-xs"
                >
                  <Eye class="w-4 h-4" />
                  Details
                </button>
                <button
                  v-if="proposal.file_key"
                  @click.stop="viewDocument(proposal)"
                  class="px-3 py-2 bg-emerald-600 text-slate-950 text-xs font-semibold rounded-xl transition hover:opacity-90 flex items-center gap-1"
                >
                  <Eye class="w-4 h-4" />
                  Doc
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-slate-500 dark:text-platinum-400">
            No proposals for this campus yet
          </div>
        </div>
      </div>

      <div v-if="selectedProposal" class="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-abyss-800 border border-slate-200 dark:border-abyss-600 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="sticky top-0 flex justify-between items-center p-6 border-b border-slate-200 dark:border-abyss-600 bg-white/95 dark:bg-abyss-800/95 backdrop-blur-sm">
            <h2 class="text-2xl font-semibold text-slate-800 dark:text-platinum-100">{{ selectedProposal.title }}</h2>
            <button
              @click="selectedProposal = null"
              class="text-slate-500 hover:text-slate-700 dark:text-platinum-400 dark:hover:text-platinum-100 transition-all p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"
            >
              <X class="w-6 h-6" />
            </button>
          </div>

          <div class="p-6 space-y-6">
            <div class="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-abyss-600">
              <div>
                <p class="text-slate-500 dark:text-platinum-400 text-sm mb-1">Status</p>
                <p :class="getStatusBadgeClass(selectedProposal.status)" class="px-2 py-1 rounded text-sm font-semibold inline-block border">
                  {{ formatStatus(selectedProposal.status) }}
                </p>
              </div>
              <div>
                <p class="text-slate-500 dark:text-platinum-400 text-sm mb-1">Submitted</p>
                <p class="text-slate-700 dark:text-platinum-100">{{ formatDate(selectedProposal.submission_date) }}</p>
              </div>
            </div>

            <div>
              <p class="text-slate-500 dark:text-platinum-400 text-sm mb-2">Description</p>
              <p class="text-slate-700 dark:text-platinum-100 whitespace-pre-wrap">{{ selectedProposal.description }}</p>
            </div>

            <div v-if="selectedProposal.file_key" class="p-5 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 rounded-2xl">
              <div class="flex items-center gap-2 mb-3">
                <FileText class="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-200 uppercase tracking-[0.2em]">Document</p>
              </div>
              <p class="text-sm text-slate-700 dark:text-platinum-100 mb-4 font-mono bg-white/70 dark:bg-black/30 p-2 rounded">{{ selectedProposal.file_key.split('/').pop() }}</p>
              <button
                @click="viewDocument(selectedProposal)"
                class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-slate-950 font-semibold rounded-xl transition hover:opacity-90"
              >
                <Eye class="w-4 h-4" />
                View Document
              </button>
            </div>

            <ProposalComments :proposal_id="selectedProposal.id" />
          </div>

          <div class="sticky bottom-0 p-6 border-t border-slate-200 dark:border-abyss-600 bg-white/95 dark:bg-abyss-800/95 backdrop-blur-sm flex justify-end gap-3">
            <button
              @click="selectedProposal = null"
              class="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <DocumentViewer
        v-if="showDocumentViewer"
        :isOpen="showDocumentViewer"
        :documentUrl="documentUrl"
        :documentName="documentName"
        :proposalId="documentProposalId"
        @close="showDocumentViewer = false"
      />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/utils/api';
import DocumentViewer from '@/components/common/DocumentViewer.vue';
import ProposalComments from '@/components/gad/ProposalComments.vue';
import { Eye, X, FileText } from 'lucide-vue-next';

const loading = ref(false);
const proposals = ref([]);
const campuses = ref([]);
const statusFilter = ref('');
const selectedProposal = ref(null);
const showDocumentViewer = ref(false);
const documentUrl = ref('');
const documentName = ref('');
const documentProposalId = ref(null);

// Computed: Filter proposals by status and group by campus
const campusesWithProposals = computed(() => {
  return campuses.value
    .map(campus => ({
      ...campus,
      proposals: proposals.value.filter(p => {
        const matchesCampus = p.campus_id === campus.id;
        const matchesStatus = statusFilter.value === '' || p.status === statusFilter.value;
        return matchesCampus && matchesStatus;
      })
    }))
    .filter(c => c.proposals.length > 0);
});

// Load proposals from API
const loadProposals = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/api/v1/gad/proposals', {
      params: {
        ...(statusFilter.value && { status: statusFilter.value })
      }
    });

    if (response.data.success) {
      proposals.value = response.data.proposals || [];
    }
  } catch (error) {
    console.error('Failed to load proposals:', error);
  } finally {
    loading.value = false;
  }
};

// Load campuses
const loadCampuses = async () => {
  try {
    const response = await axios.get('/api/v1/gad/campuses');
    if (response.data.success) {
      campuses.value = response.data.campuses || [];
    }
  } catch (error) {
    console.error('Failed to load campuses:', error);
  }
};

// Select proposal for detail view
const selectProposal = (proposal) => {
  selectedProposal.value = proposal;
};

// View document
const viewDocument = async (proposal) => {
  try {
    const response = await axios.get(`/api/v1/gad/proposals/${proposal.id}/download-document`);
    if (response.data.success && response.data.document) {
      documentUrl.value = response.data.document.downloadUrl;
      documentName.value = proposal.file_key.split('/').pop();
      documentProposalId.value = proposal.id;
      showDocumentViewer.value = true;
    }
  } catch (error) {
    console.error('Failed to load document:', error);
  }
};

// Format status for display
const formatStatus = (status) => {
  const statusMap = {
    'submitted': 'Submitted',
    'under_review': 'Under Review',
    'approved': 'Approved',
    'rejected_with_feedback': 'Needs Revision',
    'revised': 'Revised',
    'approved_final': 'Approved (Final)'
  };
  return statusMap[status] || status;
};

// Get status badge styling
const getStatusBadgeClass = (status) => {
  const classes = {
    'submitted': 'bg-blue-500/10 text-blue-700 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800/50',
    'under_review': 'bg-yellow-500/10 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-800/50',
    'approved': 'bg-emerald-500/10 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-800/50',
    'approved_final': 'bg-green-500/10 text-green-700 border border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800/50',
    'rejected_with_feedback': 'bg-red-500/10 text-red-700 border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800/50',
    'revised': 'bg-orange-500/10 text-orange-700 border border-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-800/50'
  };
  return classes[status] || 'bg-gray-500/10 text-gray-700 border border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
};

// Format date
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Lifecycle
onMounted(() => {
  loadCampuses();
  loadProposals();
});
</script>
