<template>
    <div class="min-h-screen bg-slate-950 text-slate-100 font-['Dosis'] relative overflow-hidden">
        <div class="pointer-events-none absolute inset-0">
            <div class="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"></div>
            <div class="absolute top-1/4 -right-36 h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-3xl"></div>
            <div class="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl"></div>
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,116,144,0.15),transparent_45%)]"></div>
        </div>

        <div class="relative px-3 py-6 lg:px-8">
            <div class="grid gap-6 lg:grid-cols-[1.25fr,0.75fr] lg:items-end">
                <div class="space-y-4">
                    <div class="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
                        Secure WGAD Vault
                    </div>
                    <div class="flex items-start gap-4">
                        <div class="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-3 shadow-[0_0_40px_rgba(56,189,248,0.12)]">
                            <FileIcon class="h-7 w-7 text-cyan-300" />
                        </div>
                        <div>
                            <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-50">Document Upload Studio</h1>
                            <p class="mt-2 max-w-xl text-sm text-slate-300">
                                Redesign your submission flow: select a proposal, review its status, and upload evidence with a single secure drop.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="rounded-2xl border border-slate-800/70 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-950/80 p-4 shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs uppercase tracking-widest text-slate-400">Active Selection</p>
                            <p class="mt-1 text-sm font-semibold text-slate-100">
                                {{ currentProposal ? currentProposal.title : 'No proposal selected' }}
                            </p>
                        </div>
                        <div class="rounded-full border border-slate-700/70 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
                            {{ selectedFile ? 'Ready to upload' : 'Awaiting file' }}
                        </div>
                    </div>
                    <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                        <span class="rounded-full border border-slate-800/70 bg-slate-900/70 px-2.5 py-1">PDF or DOCX</span>
                        <span class="rounded-full border border-slate-800/70 bg-slate-900/70 px-2.5 py-1">Max 50MB</span>
                        <span class="rounded-full border border-slate-800/70 bg-slate-900/70 px-2.5 py-1">Tracked revisions</span>
                    </div>
                </div>
            </div>

            <div class="mt-10 grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
                <div class="space-y-6">
                    <div class="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-6 shadow-[0_0_60px_rgba(15,23,42,0.6)]">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 text-xs font-semibold text-amber-200">01</div>
                                <h2 class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">Choose Proposal</h2>
                            </div>
                            <div class="text-xs text-slate-400">Step 1 of 3</div>
                        </div>
                        <div class="mt-4">
                            <select v-model="selectedProposalId" class="w-full rounded-xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 shadow-inner outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20">
                                <option value="" disabled class="text-slate-500">Select a proposal to continue...</option>
                                <option v-for="proposal in proposals" :key="proposal.id" :value="proposal.id">
                                    {{ proposal.title }} - {{ proposal.campus?.name }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div v-if="currentProposal" class="rounded-2xl border border-slate-800/70 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 p-6 shadow-lg">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 text-xs font-semibold text-cyan-200">02</div>
                                <h2 class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">Proposal Snapshot</h2>
                            </div>
                            <span :class="getStatusColor(currentProposal.status)" class="rounded-full border px-3 py-1 text-xs font-semibold">
                                {{ formatStatus(currentProposal.status) }}
                            </span>
                        </div>
                        <div class="mt-5 grid gap-4 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5">
                            <div class="flex items-start justify-between gap-3">
                                <div>
                                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Proposal</p>
                                    <p class="mt-1 text-base font-semibold text-slate-100">{{ currentProposal.title }}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Submitted</p>
                                    <p class="mt-1 text-sm text-slate-200">{{ formatDate(currentProposal.submission_date) }}</p>
                                </div>
                            </div>
                            <div class="grid gap-4 sm:grid-cols-3 text-sm">
                                <div class="rounded-xl border border-slate-800/70 bg-slate-900/60 p-3">
                                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Campus</p>
                                    <p class="mt-1 text-sm font-semibold text-slate-200">{{ currentProposal.campus?.name }}</p>
                                </div>
                                <div class="rounded-xl border border-slate-800/70 bg-slate-900/60 p-3">
                                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Review</p>
                                    <p class="mt-1 flex items-center gap-2 text-sm font-semibold" :class="currentProposal.reviewed_by ? 'text-emerald-300' : 'text-amber-300'">
                                        <CheckCircle2 v-if="currentProposal.reviewed_by" class="h-4 w-4" />
                                        <span v-else class="h-2 w-2 rounded-full bg-amber-300"></span>
                                        {{ currentProposal.reviewed_by ? 'Reviewed' : 'Pending' }}
                                    </p>
                                </div>
                                <div class="rounded-xl border border-slate-800/70 bg-slate-900/60 p-3">
                                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Document</p>
                                    <p class="mt-1 text-sm font-semibold text-slate-200">
                                        {{ currentProposal.file_key ? 'Uploaded' : 'Missing' }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div v-if="currentProposal.file_key" class="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                            <div class="rounded-full bg-emerald-500/20 p-2 text-emerald-300">
                                <CheckCircle2 class="h-5 w-5" />
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-emerald-100">Document Uploaded</p>
                                <p class="mt-1 flex items-center gap-2 text-xs text-emerald-200/80">
                                    <FileIcon class="h-3.5 w-3.5" />
                                    {{ currentProposal.file_key.split('/').pop() }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div v-if="selectedProposalId" class="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-6 shadow-lg">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="flex h-8 w-8 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 text-xs font-semibold text-rose-200">03</div>
                                <h2 class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">Upload Evidence</h2>
                            </div>
                            <div class="text-xs text-slate-400">Step 3 of 3</div>
                        </div>

                        <div
                            @dragover.prevent="isDragging = true"
                            @dragleave.prevent="isDragging = false"
                            @drop.prevent="handleDrop"
                            class="mt-5 relative rounded-2xl border border-dashed p-10 transition-all duration-200"
                            :class="isDragging
                                ? 'border-cyan-400/80 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.2)]'
                                : 'border-slate-700/80 bg-slate-950/60 hover:border-slate-500/80 hover:bg-slate-950/80'"
                        >
                            <input
                                type="file"
                                @change="handleFileSelect"
                                accept=".pdf,.doc,.docx"
                                class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                ref="fileInput"
                                title="Choose a file to upload"
                            />
                            <div class="flex flex-col items-center text-center">
                                <div class="rounded-full border border-slate-700/70 bg-slate-900/70 p-4" :class="isDragging ? 'text-cyan-300 border-cyan-400/40 bg-cyan-500/10' : 'text-slate-400'">
                                    <Upload class="h-6 w-6" />
                                </div>
                                <p class="mt-4 text-sm font-semibold text-slate-100">
                                    {{ isDragging ? 'Release to drop file' : 'Drop file here or click to browse' }}
                                </p>
                                <p class="mt-1 text-xs text-slate-400">PDF or DOCX. Max 50MB.</p>
                            </div>
                        </div>

                        <div v-if="selectedFile" class="mt-5 flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
                            <div class="flex items-center gap-3">
                                <div class="rounded-xl border border-slate-700/70 bg-slate-900/70 p-2 text-cyan-300">
                                    <FileIcon class="h-5 w-5" />
                                </div>
                                <div>
                                    <p class="max-w-[200px] truncate text-sm font-semibold text-slate-100 sm:max-w-xs">{{ selectedFile.name }}</p>
                                    <p class="text-xs text-slate-400">{{ formatFileSize(selectedFile.size) }}</p>
                                </div>
                            </div>
                            <button
                                @click="selectedFile = null"
                                class="rounded-full border border-slate-700/70 p-2 text-slate-400 transition hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-rose-300"
                                title="Remove file"
                            >
                                <X class="h-4 w-4" />
                            </button>
                        </div>

                        <button
                            @click="uploadDocument"
                            :disabled="!selectedFile || isUploading"
                            class="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_30px_rgba(14,116,144,0.35)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span v-if="isUploading" class="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/40 border-t-slate-950"></span>
                            <Upload v-else class="h-4 w-4" />
                            {{ isUploading ? 'Uploading Document...' : 'Upload Document' }}
                        </button>
                    </div>
                </div>

                <div class="space-y-6">
                    <div class="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-5 shadow-lg">
                        <div class="flex items-center justify-between border-b border-slate-800/70 pb-3">
                            <div class="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-300">
                                <FileIcon class="h-4 w-4 text-cyan-300" />
                                Proposals Ledger
                            </div>
                            <span class="text-xs text-slate-500">{{ proposals.length }} total</span>
                        </div>
                        <div class="mt-4 space-y-3 max-h-[520px] overflow-y-auto pr-1">
                            <div v-if="proposals.length === 0" class="rounded-2xl border border-dashed border-slate-800/70 bg-slate-950/60 p-6 text-center text-sm text-slate-400">
                                <FileIcon class="mx-auto mb-2 h-7 w-7 opacity-60" />
                                No proposals available.
                            </div>
                            <button
                                v-for="proposal in proposals"
                                :key="proposal.id"
                                @click="selectedProposalId = proposal.id"
                                class="w-full rounded-2xl border border-slate-800/70 bg-slate-950/50 p-4 text-left transition"
                                :class="selectedProposalId == proposal.id ? 'border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.18)]' : 'hover:border-slate-600/80 hover:bg-slate-900/70'"
                            >
                                <div class="flex items-start justify-between gap-3">
                                    <p class="line-clamp-2 text-sm font-semibold" :class="selectedProposalId == proposal.id ? 'text-cyan-200' : 'text-slate-100'">{{ proposal.title }}</p>
                                    <span class="mt-1 flex h-2.5 w-2.5 items-center justify-center rounded-full" :class="proposal.file_key ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'bg-slate-600'" title="Document status"></span>
                                </div>
                                <div class="mt-3 flex items-center justify-between text-xs text-slate-400">
                                    <span>{{ proposal.campus?.name }}</span>
                                    <span>{{ proposal.file_key ? 'Document uploaded' : 'Needs document' }}</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div class="rounded-2xl border border-slate-800/70 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-5 text-sm text-slate-300">
                        <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Upload Tips</p>
                        <ul class="mt-3 space-y-2 text-sm">
                            <li>Keep filenames short and descriptive.</li>
                            <li>Make sure the document matches the proposal status.</li>
                            <li>Re-uploading replaces the previous file.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="fixed bottom-6 right-6 z-50 flex max-w-sm flex-col gap-3 pointer-events-none">
                <div v-if="successMessage" class="pointer-events-auto flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/80 p-4 shadow-lg">
                    <CheckCircle2 class="mt-0.5 h-5 w-5 text-emerald-300" />
                    <p class="text-sm font-semibold text-emerald-100">{{ successMessage }}</p>
                </div>
                <div v-if="errorMessage" class="pointer-events-auto flex items-start gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/80 p-4 shadow-lg">
                    <AlertCircle class="mt-0.5 h-5 w-5 text-rose-300" />
                    <p class="text-sm font-semibold text-rose-100">{{ errorMessage }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { FileIcon, CheckCircle2, Upload, X, AlertCircle } from 'lucide-vue-next';
import axios from '@/utils/api';

const selectedProposalId = ref('');
const selectedFile = ref(null);
const proposals = ref([]);
const isDragging = ref(false);
const isUploading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const currentProposal = computed(() => {
    return proposals.value.find(p => p.id === parseInt(selectedProposalId.value));
});

onMounted(async () => {
    try {
        const response = await axios.get('/api/v1/gad/proposals?limit=100');
        proposals.value = response.data.proposals;
    } catch (error) {
        console.error('Failed to load proposals:', error);
        errorMessage.value = 'Failed to load your proposals';
    }
});

const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        validateAndSetFile(file);
    }
};

const handleDrop = (event) => {
    event.preventDefault();
    isDragging.value = false;
    const file = event.dataTransfer.files[0];
    if (file) {
        validateAndSetFile(file);
    }
};

const validateAndSetFile = (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
        errorMessage.value = 'Invalid file type. Please upload a PDF or DOCX file.';
        return;
    }

    if (file.size > maxSize) {
        errorMessage.value = `File is too large. Maximum size is 50MB.`;
        return;
    }

    selectedFile.value = file;
    errorMessage.value = '';
};

const uploadDocument = async () => {
    if (!selectedFile.value || !selectedProposalId.value) {
        errorMessage.value = 'Please select a proposal and file';
        return;
    }

    try {
        isUploading.value = true;
        const formData = new FormData();
        formData.append('document', selectedFile.value);

        const response = await axios.post(
            `/api/v1/gad/proposals/${selectedProposalId.value}/upload-document`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        successMessage.value = `Document "${selectedFile.value.name}" uploaded successfully!`;
        selectedFile.value = null;

        // Reload proposals
        const proposalsRes = await axios.get('/api/v1/gad/proposals?limit=100');
        proposals.value = proposalsRes.data.proposals;

        setTimeout(() => successMessage.value = '', 5000);
    } catch (error) {
        console.error('Upload failed:', error);
        errorMessage.value = error.response?.data?.message || 'Failed to upload document';
    } finally {
        isUploading.value = false;
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

const getStatusColor = (status) => {
    const colors = {
        'submitted': 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
        'under_review': 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
        'rejected_with_feedback': 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
        'revised': 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
        'approved': 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
        'approved_final': 'bg-emerald-600/10 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-200'
    };
    return colors[status] || 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300';
};
</script>
