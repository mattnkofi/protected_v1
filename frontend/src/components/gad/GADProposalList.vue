<template>
    <div class="page-wrapper animate-in font-mplusrounded">
            <header class="page-header">
                <div class="space-y-2">
                    <p class="section-eyebrow">HGDG Portfolio</p>
                    <h1 class="page-title">HGDG <span class="brand-gradient-text">Proposals</span></h1>
                    <p class="page-subtitle">Track, refine, and upload evidence for each submission.</p>
                </div>
                <button
                    @click="$router.push('/gad/submit')"
                    class="btn-primary"
                >
                    <Plus class="h-5 w-5" />
                    New Proposal
                </button>
            </header>

            <div v-if="statusUpdateMessage" class="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                {{ statusUpdateMessage }}
            </div>
            <div v-if="statusUpdateError" class="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm font-semibold text-rose-700 dark:text-rose-200">
                {{ statusUpdateError }}
            </div>

            <div class="card">
                <div class="flex items-center justify-between">
                    <h2 class="text-xs uppercase tracking-[0.3em] text-slate-600 dark:text-platinum-300">Filters</h2>
                    <span class="text-xs text-slate-500 dark:text-platinum-400">{{ pagination.total }} results</span>
                </div>
                <div class="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2">Campus</label>
                        <select
                            v-model="filters.campus_id"
                            @change="loadProposals"
                            class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-calm-lavender-500 focus:ring-2 focus:ring-calm-lavender-500/20"
                        >
                            <option value="">All Campuses</option>
                            <option v-for="campus in campuses" :key="campus.id" :value="campus.id">
                                {{ campus.name }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2">Status</label>
                        <select
                            v-model="filters.status"
                            @change="loadProposals"
                            class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-calm-lavender-500 focus:ring-2 focus:ring-calm-lavender-500/20"
                        >
                            <option value="">All Statuses</option>
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="rejected_with_feedback">Needs Revision</option>
                            <option value="revised">Revised</option>
                            <option value="approved">Approved</option>
                            <option value="approved_final">Approved (Final)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2">Language</label>
                        <select
                            v-model="filters.gfl_status"
                            @change="loadProposals"
                            class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-calm-lavender-500 focus:ring-2 focus:ring-calm-lavender-500/20"
                        >
                            <option value="">All</option>
                            <option value="clear">Clear</option>
                            <option value="issues">Has Issues</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2">Search</label>
                        <input
                            v-model="filters.search"
                            @input="loadProposals"
                            type="text"
                            placeholder="Search proposals..."
                            class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-sm text-slate-700 dark:text-platinum-100 placeholder-slate-400 dark:placeholder-platinum-500 outline-none transition focus:border-calm-lavender-500 focus:ring-2 focus:ring-calm-lavender-500/20"
                        />
                    </div>
                </div>
            </div>

            <div class="space-y-4">
                <div v-if="proposals.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <button
                        v-for="proposal in proposals"
                        :key="proposal.id"
                        @click="selectProposal(proposal)"
                        class="item-card text-left p-6"
                    >
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700">
                                    <FileText class="h-6 w-6 text-slate-500 dark:text-platinum-300" />
                                </div>
                                <div class="min-w-0">
                                    <h3 class="text-lg font-semibold text-slate-800 dark:text-platinum-100 truncate">{{ proposal.title }}</h3>
                                    <p class="text-sm text-slate-500 dark:text-platinum-400 truncate">
                                        {{ proposal.user?.name }} • {{ proposal.campus?.name || 'All Campus' }}
                                    </p>
                                </div>
                            </div>
                            <span :class="['px-3 py-1.5 text-xs font-semibold rounded-full border', getStatusBadgeClass(proposal.status)]">
                                {{ formatStatus(proposal.status) }}
                            </span>
                        </div>

                        <div class="mt-4 grid grid-cols-2 gap-3">
                            <div class="rounded-xl border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 p-3">
                                <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Submitted</p>
                                <p class="mt-1 text-sm font-semibold text-slate-700 dark:text-platinum-100">{{ formatDate(proposal.submission_date) }}</p>
                            </div>
                            <div class="rounded-xl border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 p-3">
                                <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Language</p>
                                <div class="mt-1 flex items-center gap-2">
                                    <span class="h-2 w-2 rounded-full" :class="proposal.gfl_issues ? 'bg-amber-400' : 'bg-emerald-400'"></span>
                                    <p class="text-sm font-semibold" :class="proposal.gfl_issues ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-300'">
                                        {{ proposal.gfl_issues ? 'Review' : 'Clear' }}
                                    </p>
                                </div>
                            </div>
                            <div class="rounded-xl border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 p-3">
                                <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Document</p>
                                <p class="mt-1 text-sm font-semibold" :class="proposal.file_key ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-500 dark:text-platinum-400'">
                                    {{ proposal.file_key ? 'Attached' : 'None' }}
                                </p>
                            </div>
                            <div class="rounded-xl border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 p-3">
                                <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Comments</p>
                                <p class="mt-1 text-lg font-semibold text-amber-600 dark:text-amber-300">{{ getCommentCount(proposal.id) }}</p>
                            </div>
                        </div>

                        <p class="mt-4 text-sm text-slate-600 dark:text-platinum-300 line-clamp-2">{{ proposal.description }}</p>

                        <div v-if="isAdmin" class="mt-4 space-y-2" @click.stop>
                            <div class="flex flex-wrap items-center gap-2">
                                <button
                                    v-for="option in statusOptions"
                                    :key="option.value"
                                    class="btn-secondary text-[10px] px-3 py-1"
                                    :disabled="ensureStatusEdit(proposal).saving"
                                    @click.stop="requestStatusUpdate(proposal, option.value)"
                                >
                                    {{ option.label }}
                                </button>
                            </div>
                            <textarea
                                v-if="ensureStatusEdit(proposal).status === 'rejected_with_feedback'"
                                v-model="ensureStatusEdit(proposal).feedback"
                                @click.stop
                                rows="2"
                                placeholder="Feedback required for rejection"
                                class="w-full rounded-lg border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-2 py-1 text-xs text-slate-700 dark:text-platinum-100 outline-none transition focus:border-calm-lavender-500"
                            />
                        </div>
                    </button>
                </div>
                <div v-else class="rounded-2xl border border-dashed border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-800 p-6 text-center">
                    <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700">
                        <FileText class="h-7 w-7 text-slate-400 dark:text-platinum-400" />
                    </div>
                    <p class="text-slate-700 dark:text-platinum-200 font-semibold">No proposals yet</p>
                    <p class="mt-2 text-sm text-slate-500 dark:text-platinum-400">Create your first gender-responsive proposal.</p>
                    <button
                        @click="$router.push('/gad/submit')"
                        class="btn-secondary mt-4 text-xs"
                    >
                        Start Now
                    </button>
                </div>
            </div>

            <div v-if="pagination.pages > 1" class="flex flex-wrap justify-center gap-2 pt-4">
                <button
                    v-for="page in pagination.pages"
                    :key="page"
                    @click="filters.page = page; loadProposals()"
                    :class="['px-4 py-2 rounded-full text-xs font-semibold transition-all', page === pagination.page ? 'bg-calm-lavender-500/80 text-white shadow-[0_6px_20px_rgba(168,85,247,0.25)]' : 'border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 text-slate-600 dark:text-platinum-300 hover:border-calm-lavender-400']"
                >
                    {{ page }}
                </button>
            </div>

            <Transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div v-if="selectedProposal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4 backdrop-blur-md">
                    <Transition
                        enter-active-class="transition duration-300 ease-out"
                        enter-from-class="opacity-0 translate-y-4 scale-95"
                        enter-to-class="opacity-100 translate-y-0 scale-100"
                        leave-active-class="transition duration-200 ease-in"
                        leave-from-class="opacity-100 translate-y-0 scale-100"
                        leave-to-class="opacity-0 translate-y-4 scale-95"
                    >
                        <div class="max-w-3xl w-full max-h-[85vh] overflow-y-auto card p-8">
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <p class="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-platinum-400">Proposal detail</p>
                            <h2 class="mt-2 text-2xl font-semibold text-slate-800 dark:text-platinum-100">{{ selectedProposal.title }}</h2>
                        </div>
                        <button @click="selectedProposal = null" class="rounded-full border border-slate-200 dark:border-abyss-500 p-2 text-slate-500 dark:text-platinum-400 transition hover:border-slate-400 hover:text-slate-700 dark:hover:text-platinum-100">
                            <X class="h-5 w-5" />
                        </button>
                    </div>

                    <div class="mt-6 space-y-6">
                        <div>
                            <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Description</h3>
                            <p class="mt-3 rounded-2xl border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 p-4 text-sm text-slate-700 dark:text-platinum-200">
                                {{ selectedProposal.description }}
                            </p>
                        </div>

                        <div class="grid gap-4 sm:grid-cols-2">
                            <div class="rounded-2xl border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 p-4">
                                <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Status</p>
                                <span :class="['mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold', getStatusBadgeClass(selectedProposal.status)]">
                                    {{ formatStatus(selectedProposal.status) }}
                                </span>
                            </div>
                            <div class="rounded-2xl border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 p-4">
                                <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Campus</p>
                                <p class="mt-2 text-sm font-semibold text-slate-700 dark:text-platinum-200">{{ selectedProposal.campus?.name }}</p>
                            </div>
                        </div>

                        <div v-if="isAdmin && selectedStatusEdit" class="rounded-2xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 p-4 space-y-3">
                            <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Update Status</p>
                            <div class="flex flex-wrap items-center gap-3">
                                <button
                                    v-for="option in statusOptions"
                                    :key="option.value"
                                    class="btn-primary text-xs"
                                    :disabled="selectedStatusEdit.saving"
                                    @click="requestStatusUpdate(selectedProposal, option.value)"
                                >
                                    {{ option.label }}
                                </button>
                            </div>
                            <textarea
                                v-model="selectedStatusEdit.feedback"
                                rows="3"
                                placeholder="Feedback required for rejection"
                                class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-calm-lavender-500"
                            />
                        </div>

                        <div v-if="selectedProposal.file_key" class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                            <div class="flex items-center gap-3">
                                <div class="rounded-xl bg-emerald-500/20 p-2 text-emerald-200">
                                    <FileText class="h-5 w-5" />
                                </div>
                                <div>
                                    <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-100">Proposal document</p>
                                    <p class="text-xs text-emerald-600/80 dark:text-emerald-200/80">{{ selectedProposal.file_key.split('/').pop() }}</p>
                                </div>
                            </div>
                            <button
                                @click="viewDocument(selectedProposal)"
                                class="btn-primary mt-4 w-full justify-center"
                            >
                                View Document
                            </button>
                        </div>

                        <div v-if="selectedProposal.admin_feedback" class="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                            <h3 class="text-xs uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">WGAD Office Feedback</h3>
                            <p class="mt-2 text-sm text-slate-700 dark:text-platinum-100">{{ selectedProposal.admin_feedback }}</p>
                        </div>

                        <div v-if="selectedProposal.gfl_issues?.issues?.length > 0" class="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                            <h3 class="text-xs uppercase tracking-[0.2em] text-amber-700 dark:text-amber-200">Gender-fair language</h3>
                            <div class="mt-2 space-y-2 text-sm text-amber-700 dark:text-amber-100">
                                <div v-for="(issue, idx) in selectedProposal.gfl_issues.issues.slice(0, 3)" :key="idx">
                                    "{{ issue.term }}" -> <em>"{{ issue.suggestion }}"</em>
                                </div>
                            </div>
                        </div>

                        <div class="rounded-2xl border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 p-4">
                            <ProposalComments :proposal_id="selectedProposal.id" />
                        </div>

                        <div class="flex flex-wrap gap-3">
                            <button
                                @click="$router.push('/gad/upload')"
                                class="btn-primary flex-1 justify-center"
                            >
                                Upload or Update Document
                            </button>
                            <button
                                @click="selectedProposal = null"
                                class="btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                        </div>
                    </Transition>
                </div>
            </Transition>

            <DocumentViewer
                v-if="showDocumentViewer"
                :isOpen="showDocumentViewer"
                :documentUrl="documentUrl"
                :documentName="documentName"
                :proposalId="selectedProposalId"
                @close="showDocumentViewer = false"
            />

            <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div v-if="statusConfirm" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <Transition
                        enter-active-class="transition duration-200 ease-out"
                        enter-from-class="opacity-0 translate-y-3 scale-95"
                        enter-to-class="opacity-100 translate-y-0 scale-100"
                        leave-active-class="transition duration-150 ease-in"
                        leave-from-class="opacity-100 translate-y-0 scale-100"
                        leave-to-class="opacity-0 translate-y-3 scale-95"
                    >
                        <div class="w-full max-w-md rounded-2xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 p-6 shadow-2xl">
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-platinum-100">Confirm Status Change</h3>
                    <p class="mt-2 text-sm text-slate-600 dark:text-platinum-300">
                        Change status to <span class="font-semibold">{{ statusConfirm.label }}</span>?
                    </p>
                    <p v-if="statusConfirm.feedback" class="mt-3 text-xs text-slate-500 dark:text-platinum-400">
                        Feedback: "{{ statusConfirm.feedback }}"
                    </p>
                    <div class="mt-5 flex justify-end gap-2">
                        <button class="btn-secondary" @click="statusConfirm = null">Cancel</button>
                        <button class="btn-primary" @click="confirmStatusUpdate">Confirm</button>
                    </div>
                        </div>
                    </Transition>
                </div>
            </Transition>

            <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div v-if="isBusy" class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div class="rounded-2xl border border-slate-200/70 dark:border-abyss-600 bg-white/90 dark:bg-abyss-800/90 px-6 py-5 shadow-2xl">
                        <div class="flex items-center gap-3">
                            <div class="h-10 w-10 rounded-full border-2 border-calm-lavender-500/30 border-t-calm-lavender-500 animate-spin"></div>
                            <div>
                                <p class="text-sm font-semibold text-slate-800 dark:text-platinum-100">Updating</p>
                                <p class="text-xs text-slate-500 dark:text-platinum-400">Please wait while we save changes.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '@/utils/api';
import DocumentViewer from '@/components/common/DocumentViewer.vue';
import ProposalComments from '@/components/gad/ProposalComments.vue';
import { useAuthStore } from '@/stores/auth';
import { FileText, Eye, X, Plus } from 'lucide-vue-next';

const authStore = useAuthStore();
const isAdmin = computed(() => ['admin', 'moderator'].includes(authStore.user?.role));

const proposals = ref([]);
const campuses = ref([]);
const selectedProposal = ref(null);
const showDocumentViewer = ref(false);
const documentUrl = ref('');
const documentName = ref('');
const selectedProposalId = ref(null); // Track which proposal's document is being viewed
const commentCounts = ref({}); // Track comment counts per proposal
const statusEdits = ref({});
const statusUpdateMessage = ref('');
const statusUpdateError = ref('');
const statusConfirm = ref(null);
const isBusy = computed(() => Object.values(statusEdits.value).some(edit => edit?.saving));

const statusOptions = [
    { value: 'under_review', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected_with_feedback', label: 'Rejected' }
];

const filters = ref({
    campus_id: '',
    status: '',
    gfl_status: '',
    search: '',
    page: 1,
    limit: 10
});

const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
});

onMounted(() => {
    loadCampuses();
    loadProposals();
});

const loadCampuses = async () => {
    try {
        const response = await axios.get('/api/v1/gad/campuses');
        campuses.value = response.data.campuses;
    } catch (error) {
        console.error('Failed to load campuses:', error);
    }
};

const loadProposals = async () => {
    try {
        const params = new URLSearchParams();
        if (filters.value.campus_id) params.append('campus_id', filters.value.campus_id);
        if (filters.value.status) params.append('status', filters.value.status);
        if (filters.value.search) params.append('search', filters.value.search);
        params.append('page', filters.value.page);
        params.append('limit', filters.value.limit);

        const response = await axios.get(`/api/v1/gad/proposals?${params.toString()}`);
        proposals.value = response.data.proposals;
        pagination.value = response.data.pagination;

        statusEdits.value = {};
        
        // Load comment counts for all proposals
        loadCommentCountsForProposals();
    } catch (error) {
        console.error('Failed to load proposals:', error);
    }
};

const loadCommentCountsForProposals = async () => {
    try {
        for (const proposal of proposals.value) {
            try {
                const response = await axios.get(`/api/v1/gad/proposals/${proposal.id}/comments`);
                if (response.data.success) {
                    commentCounts.value[proposal.id] = response.data.comments?.length || 0;
                }
            } catch (error) {
                commentCounts.value[proposal.id] = 0;
            }
        }
    } catch (error) {
        console.error('Failed to load comment counts:', error);
    }
};

const getCommentCount = (proposalId) => {
    return commentCounts.value[proposalId] || 0;
};

const selectProposal = (proposal) => {
    selectedProposal.value = proposal;
    ensureStatusEdit(proposal);
};

const viewDocument = async (proposal) => {
    try {
        const response = await axios.get(`/api/v1/gad/proposals/${proposal.id}/download-document`);
        if (response.data.success && response.data.document) {
            documentUrl.value = response.data.document.downloadUrl;
            documentName.value = proposal.file_key.split('/').pop();
            selectedProposalId.value = proposal.id; // Store proposal ID for comments
            showDocumentViewer.value = true;
        }
    } catch (error) {
        console.error('Failed to load document:', error);
    }
};

const formatStatus = (status) => {
    const statuses = {
        'submitted': 'Submitted',
        'under_review': 'Under Review',
        'rejected_with_feedback': 'Needs Revision',
        'revised': 'Revised',
        'approved': 'Approved',
        'approved_final': 'Approved (Final)'
    };
    return statuses[status] || status;
};

const getStatusBadgeClass = (status) => {
    const classes = {
        'submitted': 'bg-blue-500/10 text-blue-700 border border-blue-200 dark:bg-blue-600/20 dark:text-blue-300 dark:border-blue-500/30',
        'under_review': 'bg-yellow-500/10 text-yellow-700 border border-yellow-200 dark:bg-yellow-600/20 dark:text-yellow-300 dark:border-yellow-500/30',
        'rejected_with_feedback': 'bg-orange-500/10 text-orange-700 border border-orange-200 dark:bg-orange-600/20 dark:text-orange-300 dark:border-orange-500/30',
        'revised': 'bg-purple-500/10 text-purple-700 border border-purple-200 dark:bg-purple-600/20 dark:text-purple-300 dark:border-purple-500/30',
        'approved': 'bg-emerald-500/10 text-emerald-700 border border-emerald-200 dark:bg-emerald-600/20 dark:text-emerald-300 dark:border-emerald-500/30',
        'approved_final': 'bg-green-500/10 text-green-700 border border-green-200 dark:bg-green-600/20 dark:text-green-300 dark:border-green-500/30'
    };
    return classes[status] || 'bg-gray-500/10 text-gray-700 border border-gray-200 dark:bg-gray-600/20 dark:text-gray-300 dark:border-gray-500/30';
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
};

const ensureStatusEdit = (proposal) => {
    if (!proposal) return null;
    if (!statusEdits.value[proposal.id]) {
        statusEdits.value[proposal.id] = {
            status: proposal.status,
            feedback: proposal.admin_feedback || '',
            saving: false
        };
    }
    return statusEdits.value[proposal.id];
};

const selectedStatusEdit = computed(() => {
    if (!selectedProposal.value) return null;
    return ensureStatusEdit(selectedProposal.value);
});

const isStatusDirty = (proposal) => {
    if (!proposal) return false;
    const edit = statusEdits.value[proposal.id];
    if (!edit) return false;
    const feedbackChanged = (edit.feedback || '').trim() !== (proposal.admin_feedback || '').trim();
    return edit.status !== proposal.status || feedbackChanged;
};

const requestStatusUpdate = (proposal, nextStatus = null) => {
    statusUpdateError.value = '';
    statusUpdateMessage.value = '';
    const edit = ensureStatusEdit(proposal);
    if (!edit) return;

    if (nextStatus) {
        edit.status = nextStatus;
    }

    if (edit.status === 'rejected_with_feedback' && !edit.feedback.trim()) {
        statusUpdateError.value = 'Feedback is required when rejecting a proposal.';
        return;
    }

    const label = statusOptions.find(option => option.value === edit.status)?.label || formatStatus(edit.status);
    statusConfirm.value = {
        proposalId: proposal.id,
        label,
        feedback: edit.feedback.trim()
    };
};

const confirmStatusUpdate = async () => {
    const confirmData = statusConfirm.value;
    if (!confirmData) return;

    const proposalId = confirmData.proposalId;
    const edit = statusEdits.value[proposalId];
    if (!edit) return;

    edit.saving = true;
    statusConfirm.value = null;

    try {
        const response = await axios.put(`/api/v1/gad/proposals/${proposalId}/status`, {
            status: edit.status,
            admin_feedback: edit.feedback || null
        });

        const updated = response.data?.proposal;
        const proposal = proposals.value.find(item => item.id === proposalId);
        if (proposal && updated) {
            proposal.status = updated.status;
            proposal.admin_feedback = updated.admin_feedback;
        } else if (proposal) {
            proposal.status = edit.status;
            proposal.admin_feedback = edit.feedback || null;
        }

        if (selectedProposal.value?.id === proposalId) {
            selectedProposal.value.status = edit.status;
            selectedProposal.value.admin_feedback = edit.feedback || null;
        }

        statusUpdateMessage.value = 'Status updated successfully.';
    } catch (error) {
        statusUpdateError.value = error.response?.data?.message || 'Failed to update status.';
    } finally {
        edit.saving = false;
    }
};
</script>
