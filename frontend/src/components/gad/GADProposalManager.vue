<template>
    <div class="page-wrapper animate-in font-mplusrounded">
            <DocumentViewer
                :isOpen="showDocumentViewer"
                :documentUrl="selectedDocumentUrl"
                :documentName="selectedDocumentName"
                :proposalId="selectedProposalId"
                :adminFeedback="selectedAdminFeedback"
                @close="closeDocumentViewer"
            />

            <header class="page-header">
                <div class="space-y-2">
                    <p class="section-eyebrow">HGDG Workspace</p>
                    <h1 class="page-title">Manage <span class="brand-gradient-text">Proposals</span></h1>
                    <p class="page-subtitle">Submit, upload proposals, and see HGDG feedback in one place.</p>
                </div>
                <span class="badge badge-lavender text-xs">
                    {{ filteredProposals.length }} proposals
                </span>
            </header>

            <div v-if="successMessage" class="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                <div class="flex items-center gap-3">
                    <CheckCircle class="w-5 h-5 text-emerald-500 dark:text-emerald-300 shrink-0" />
                    <p>{{ successMessage }}</p>
            </div>
            <div v-if="errorMessage" class="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm font-semibold text-rose-700 dark:text-rose-200">
                <div class="flex items-center gap-3">
                    <div class="w-5 h-5 text-rose-500 dark:text-rose-300 shrink-0">!</div>
                    <p>{{ errorMessage }}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-[1.05fr,1.5fr] gap-6">
                <div class="space-y-6">
                    <div class="card">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="flex h-8 w-8 items-center justify-center rounded-full border border-calm-lavender-400/40 bg-calm-lavender-500/10 text-xs font-semibold text-calm-lavender-700 dark:text-calm-lavender-200">01</div>
                                <h2 class="text-xs uppercase tracking-[0.3em] text-slate-600 dark:text-platinum-300">New Proposal</h2>
                            </div>
                        </div>

                        <div class="mt-5 space-y-4">
                            <div>
                                <label class="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2">Campus</label>
                                <select v-model="newProposal.campus_id" class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-4 py-3 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-calm-lavender-500">
                                    <option value="">Select a campus...</option>
                                    <option v-for="campus in campuses" :key="campus.id" :value="campus.id">
                                        {{ campus.name }}
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2">Title</label>
                                <input v-model="newProposal.title" type="text" placeholder="Enter proposal title..." class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-4 py-3 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-calm-lavender-500" />
                            </div>

                            <div>
                                <label class="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2">Description</label>
                                <textarea v-model="newProposal.description" rows="4" placeholder="Describe your gender-responsive initiative..." class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-4 py-3 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-calm-lavender-500 resize-none" />

                                <div v-if="newProposal.description" class="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                                    <div class="flex items-center gap-2 mb-2">
                                        <Search class="w-4 h-4 text-amber-300" />
                                        <p class="text-xs font-semibold text-amber-700 dark:text-amber-200 uppercase tracking-[0.2em]">Language Check</p>
                                    </div>
                                    <div v-if="previewAnalysis.issues.length > 0" class="text-xs space-y-1">
                                        <div v-for="issue in previewAnalysis.issues.slice(0, 2)" :key="`${issue.term}-${issue.severity}`" class="flex items-center gap-2">
                                            <span class="text-amber-700 dark:text-amber-200">"{{ issue.term }}"</span>
                                            <span :class="['px-2 py-0.5 rounded text-[10px] font-semibold uppercase', issue.severity === 'high' ? 'bg-rose-500/30 text-rose-700 dark:text-rose-200' : 'bg-yellow-500/30 text-yellow-700 dark:text-yellow-200']">
                                                {{ issue.severity }}
                                            </span>
                                        </div>
                                        <p v-if="previewAnalysis.issues.length > 2" class="text-slate-500 dark:text-platinum-400 text-xs">+{{ previewAnalysis.issues.length - 2 }} more</p>
                                    </div>
                                    <div v-else class="flex items-center gap-2 text-emerald-600 dark:text-emerald-300 text-xs font-semibold">
                                        <CheckCircle class="w-4 h-4" />
                                        Great language!
                                    </div>
                                </div>
                            </div>

                                <button
                                    @click="submitProposal"
                                    :disabled="!newProposal.campus_id || !newProposal.title || !newProposal.description || isSubmitting"
                                    class="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                {{ isSubmitting ? 'Submitting...' : 'Submit Proposal' }}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/10 text-xs font-semibold text-amber-700 dark:text-amber-200">02</div>
                            <h2 class="text-xs uppercase tracking-[0.3em] text-slate-600 dark:text-platinum-300">Your Proposals</h2>
                        </div>
                        <select v-model="selectedCampusFilter" class="rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-xs text-slate-700 dark:text-platinum-100">
                            <option value="">All campuses</option>
                            <option v-for="campus in campuses" :key="campus.id" :value="campus.id">
                                {{ campus.name }}
                            </option>
                        </select>
                    </div>

                    <div v-if="filteredProposals.length === 0" class="rounded-2xl border border-dashed border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-800 p-6 text-center">
                        <div class="w-16 h-16 bg-calm-lavender-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileIcon class="w-8 h-8 text-calm-lavender-500" />
                        </div>
                        <p class="text-slate-700 dark:text-platinum-200 font-semibold">No proposals yet</p>
                        <p class="text-xs text-slate-500 dark:text-platinum-400">Submit your first proposal to get started.</p>
                    </div>

                    <div v-for="proposal in filteredProposals" :key="proposal.id" class="item-card !p-6 space-y-4 hover:border-calm-lavender-200 dark:hover:border-calm-lavender-700/60">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1">
                                <h3 class="text-base font-semibold text-slate-800 dark:text-platinum-100 mb-1 line-clamp-2">{{ proposal.title }}</h3>
                                <p class="text-xs text-slate-500 dark:text-platinum-400">{{ proposal.campus?.name }} • {{ formatDate(proposal.submission_date) }}</p>
                            </div>
                            <span :class="['px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border', getStatusColor(proposal.status)]">
                                {{ formatStatus(proposal.status) }}
                            </span>
                        </div>

                        <div class="grid grid-cols-3 gap-3 text-xs border-t border-slate-200 dark:border-abyss-500 pt-4">
                            <div class="rounded-xl border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 p-3">
                                <p class="text-slate-500 dark:text-platinum-400 text-xs uppercase tracking-[0.2em]">Campus</p>
                                <p class="text-slate-700 dark:text-platinum-100 font-semibold truncate">{{ proposal.campus?.name || '—' }}</p>
                            </div>
                            <div class="rounded-xl border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 p-3">
                                <p class="text-slate-500 dark:text-platinum-400 text-xs uppercase tracking-[0.2em]">Language</p>
                                <p class="text-slate-700 dark:text-platinum-100 font-semibold">{{ proposal.gfl_score || '—' }}%</p>
                            </div>
                            <div class="rounded-xl border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 p-3">
                                <p class="text-slate-500 dark:text-platinum-400 text-xs uppercase tracking-[0.2em]">Document</p>
                                <p :class="['font-semibold', proposal.file_key ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500 dark:text-platinum-400']">
                                    {{ proposal.file_key ? 'Yes' : 'No' }}
                                </p>
                            </div>
                        </div>

                        <div v-if="proposal.total_score !== undefined" class="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-xs font-semibold text-cyan-700 dark:text-cyan-200 uppercase tracking-[0.2em]">Score</p>
                                    <p class="text-2xl font-semibold text-cyan-700 dark:text-cyan-100">{{ proposal.total_score }}/{{ proposal.max_score }}</p>
                                </div>
                                <div class="text-right">
                                    <div class="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                                        {{ Math.round((proposal.total_score / proposal.max_score) * 100) }}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="proposal.admin_feedback" class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                            <p class="text-xs font-semibold text-amber-700 dark:text-amber-200 uppercase tracking-[0.2em] mb-2">Admin Comments</p>
                            <p class="text-sm text-slate-700 dark:text-platinum-200 leading-relaxed">{{ proposal.admin_feedback }}</p>
                        </div>

                        <div class="border-t border-slate-200 dark:border-abyss-500 pt-4 space-y-3">
                            <div class="flex items-center justify-between">
                                <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Supporting Document</p>
                                <span v-if="proposal.file_key" class="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                                    <CheckCircle class="w-3 h-3" />
                                    Uploaded
                                </span>
                            </div>

                            <div v-if="proposal.file_key" class="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <FileIcon class="w-4 h-4 text-emerald-500 dark:text-emerald-300" />
                                    <div>
                                        <p class="text-xs text-emerald-700 dark:text-emerald-100 font-semibold">{{ proposal.file_key.split('/').pop() }}</p>
                                        <p class="text-xs text-slate-500 dark:text-platinum-400">{{ formatDate(proposal.updated_at) }}</p>
                                    </div>
                                </div>
                                <button
                                    @click="openDocumentViewer(proposal)"
                                    class="btn-secondary text-xs px-3 py-1"
                                >
                                    View
                                </button>
                            </div>

                            <div v-if="!proposal.file_key" class="space-y-2">
                                <div
                                    @dragover.prevent="activeDragProposal = proposal.id"
                                    @dragleave="activeDragProposal = null"
                                    @drop="handleDrop($event, proposal.id)"
                                    class="relative rounded-xl border border-dashed p-4 transition-all cursor-pointer text-center"
                                    :class="activeDragProposal === proposal.id ? 'border-calm-lavender-400/80 bg-calm-lavender-500/10' : 'border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 hover:border-slate-400 dark:hover:border-abyss-400'"
                                >
                                    <FileIcon class="w-5 h-5 mx-auto mb-1 text-calm-lavender-500" />
                                    <p class="text-xs font-semibold mb-1 text-slate-700 dark:text-platinum-200">Drop or click to upload</p>
                                    <p class="text-xs text-slate-500 dark:text-platinum-400">PDF/DOCX, max 50MB</p>
                                    <input
                                        type="file"
                                        @change="handleFileSelect($event, proposal.id)"
                                        accept=".pdf,.doc,.docx"
                                        class="absolute inset-0 opacity-0 cursor-pointer"
                                        :id="`file-input-${proposal.id}`"
                                    />
                                </div>

                                <div v-if="pendingFiles[proposal.id]" class="p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <FileIcon class="w-4 h-4 text-cyan-500 dark:text-cyan-300" />
                                        <div class="text-xs">
                                            <p class="font-semibold text-slate-700 dark:text-platinum-100">{{ pendingFiles[proposal.id].name }}</p>
                                            <p class="text-slate-500 dark:text-platinum-400">{{ formatFileSize(pendingFiles[proposal.id].size) }}</p>
                                        </div>
                                    </div>
                                    <button
                                        @click="pendingFiles[proposal.id] = null"
                                        class="text-slate-500 hover:text-slate-700 dark:text-platinum-400 dark:hover:text-platinum-100 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div class="flex gap-2">
                                    <button
                                        @click="$refs[`fileButton-${proposal.id}`]?.[0]?.click()"
                                        class="btn-secondary flex-1 text-xs"
                                    >
                                        Choose File
                                    </button>
                                    <button
                                        v-if="pendingFiles[proposal.id]"
                                        @click="uploadDocument(proposal.id)"
                                        :disabled="uploading[proposal.id]"
                                        class="btn-primary flex-1 text-xs justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {{ uploading[proposal.id] ? 'Uploading...' : 'Upload' }}
                                    </button>
                                </div>
                                <input
                                    :ref="`fileButton-${proposal.id}`"
                                    type="file"
                                    @change="handleFileSelect($event, proposal.id)"
                                    accept=".pdf,.doc,.docx"
                                    class="hidden"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

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
                            <p class="text-sm font-semibold text-slate-800 dark:text-platinum-100">Processing</p>
                            <p class="text-xs text-slate-500 dark:text-platinum-400">Please wait while we finish your request.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { FileIcon, Search, CheckCircle } from 'lucide-vue-next';
import axios from '@/utils/api';
import DocumentViewer from '@/components/common/DocumentViewer.vue';

// Form State
const newProposal = ref({
    campus_id: '',
    title: '',
    description: ''
});

const previewAnalysis = ref({ issues: [] });
const proposals = ref([]);
const campuses = ref([]);
const selectedCampusFilter = ref('');
const pendingFiles = ref({});
const uploading = ref({});
const activeDragProposal = ref(null);
const showDocumentViewer = ref(false);
const selectedDocumentUrl = ref('');
const selectedDocumentName = ref('');
const selectedProposalId = ref(null);
const selectedAdminFeedback = ref('');
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const fileInputs = ref({});

const isBusy = computed(() => {
    return isSubmitting.value || Object.values(uploading.value).some(Boolean);
});

const filteredProposals = computed(() => {
    if (!selectedCampusFilter.value) return proposals.value;
    return proposals.value.filter((proposal) => {
        const proposalCampus = proposal.campus_id || proposal.campus?.id;
        return String(proposalCampus) === String(selectedCampusFilter.value);
    });
});

const closeDocumentViewer = () => {
    showDocumentViewer.value = false;
    selectedDocumentUrl.value = '';
    selectedDocumentName.value = '';
    selectedProposalId.value = null;
    selectedAdminFeedback.value = '';
};

// Load initial data
onMounted(async () => {
    try {
        const [campusRes, proposalRes] = await Promise.all([
            axios.get('/api/v1/gad/campuses'),
            axios.get('/api/v1/gad/proposals?limit=100')
        ]);
        campuses.value = campusRes.data.campuses;
        proposals.value = proposalRes.data.proposals;
    } catch (error) {
        console.error('Failed to load data:', error);
        errorMessage.value = 'Failed to load proposals and campuses';
    }
});

// Analyze proposal text in real-time
const analyzePreview = async () => {
    if (newProposal.value.description.length < 10) {
        previewAnalysis.value = { issues: [] };
        return;
    }

    try {
        const response = await axios.post('/api/v1/gad/analyze-language', {
            text: newProposal.value.description
        });
        previewAnalysis.value = response.data;
    } catch (error) {
        console.error('Analysis failed:', error);
        previewAnalysis.value = { issues: [] };
    }
};

// Watch description for changes
import { watch } from 'vue';
watch(() => newProposal.value.description, analyzePreview);

// Submit new proposal
const submitProposal = async () => {
    if (!newProposal.value.campus_id || !newProposal.value.title || !newProposal.value.description) {
        errorMessage.value = 'Please fill in all fields';
        return;
    }

    try {
        isSubmitting.value = true;
        const response = await axios.post('/api/v1/gad/proposals/submit', {
            campus_id: newProposal.value.campus_id,
            title: newProposal.value.title,
            description: newProposal.value.description
        });

        proposals.value.unshift(response.data.proposal);
        successMessage.value = 'Proposal submitted successfully! Upload a document to provide more details.';
        newProposal.value = { campus_id: '', title: '', description: '' };
        previewAnalysis.value = { issues: [] };

        setTimeout(() => successMessage.value = '', 5000);
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Failed to submit proposal';
    } finally {
        isSubmitting.value = false;
    }
};

// File handling
const handleFileSelect = (event, proposalId) => {
    const file = event.target.files[0];
    if (file) {
        validateAndSetFile(file, proposalId);
    }
};

const handleDrop = (event, proposalId) => {
    event.preventDefault();
    activeDragProposal.value = null;
    const file = event.dataTransfer.files[0];
    if (file) {
        validateAndSetFile(file, proposalId);
    }
};

const validateAndSetFile = (file, proposalId) => {
    const maxSize = 50 * 1024 * 1024;
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
        errorMessage.value = 'Invalid file type. Only PDF and DOCX files are allowed.';
        return;
    }

    if (file.size > maxSize) {
        errorMessage.value = 'File is too large. Maximum size is 50MB.';
        return;
    }

    pendingFiles.value[proposalId] = file;
    errorMessage.value = '';
};

// Trigger file input when button is clicked
const triggerFileInput = (proposalId) => {
    const fileInput = fileInputs.value[proposalId];
    if (fileInput) {
        fileInput.click();
    }
};

// Upload document
const uploadDocument = async (proposalId) => {
    const file = pendingFiles.value[proposalId];
    if (!file) return;

    try {
        uploading.value[proposalId] = true;
        const formData = new FormData();
        formData.append('document', file);

        await axios.post(
            `/api/v1/gad/proposals/${proposalId}/upload-document`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        // Reload proposals
        const response = await axios.get('/api/v1/gad/proposals?limit=100');
        proposals.value = response.data.proposals;

        successMessage.value = `Document uploaded successfully!`;
        delete pendingFiles.value[proposalId];

        setTimeout(() => successMessage.value = '', 5000);
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Failed to upload document';
    } finally {
        uploading.value[proposalId] = false;
    }
};

const openDocumentViewer = async (proposal) => {
    try {
        if (!proposal.file_key) return;

        const response = await axios.get(`/api/v1/gad/proposals/${proposal.id}/download-document`);
        if (response.data.success && response.data.document) {
            selectedDocumentUrl.value = response.data.document.downloadUrl;
            selectedDocumentName.value = proposal.file_key.split('/').pop();
            selectedProposalId.value = proposal.id;
            selectedAdminFeedback.value = proposal.admin_feedback || '';
            showDocumentViewer.value = true;
        }
    } catch (error) {
        console.error('Failed to load document:', error);
        errorMessage.value = 'Failed to load document';
    }
};

// Formatting
const formatStatus = (status) => {
    const statuses = {
        'submitted': 'Submitted',
        'under_review': 'Under Review',
        'rejected_with_feedback': 'Needs Revision',
        'revised': 'Revised',
        'approved': 'Approved',
        'approved_final': 'Approved'
    };
    return statuses[status] || status;
};

const getStatusColor = (status) => {
    const colors = {
        'submitted': 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
        'under_review': 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
        'rejected_with_feedback': 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
        'revised': 'bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
        'approved': 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
        'approved_final': 'bg-emerald-600/10 text-emerald-700 dark:bg-emerald-600/30 dark:text-emerald-200'
    };
    return colors[status] || 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300';
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
</script>
