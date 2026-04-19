<template>
    <div class="page-wrapper animate-in font-mplusrounded">
            <header class="page-header">
                <div class="space-y-2">
                    <p class="section-eyebrow">HGDG Upload</p>
                    <h1 class="page-title">Document <span class="brand-gradient-text">Upload</span></h1>
                    <p class="page-subtitle">Attach supporting documents to your HGDG proposals securely.</p>
                </div>
            </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Upload Section -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Step 1: Proposal Selection -->
                <div class="card">
                    <div class="flex items-center gap-3 mb-5">
                        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-calm-lavender-500/10 text-calm-lavender-600 dark:text-calm-lavender-400 text-xs font-semibold border border-calm-lavender-400/30">1</span>
                        <h2 class="text-base font-semibold text-slate-700 dark:text-platinum-200">Select Proposal</h2>
                    </div>
                    <select v-model="selectedProposalId" class="w-full px-4 py-3 bg-white dark:bg-abyss-700 text-slate-700 dark:text-platinum-100 border border-slate-200 dark:border-abyss-500 rounded-lg focus:border-calm-lavender-500 focus:outline-none focus:ring-1 focus:ring-calm-lavender-500/50 transition-colors text-sm appearance-none">
                        <option value="" disabled class="text-slate-400 dark:text-platinum-500">Choose a proposal to upload documents for...</option>
                        <option v-for="proposal in proposals" :key="proposal.id" :value="proposal.id">
                            {{ proposal.title }} — {{ proposal.campus?.name }}
                        </option>
                    </select>
                </div>

                <!-- Step 2: Proposal Details -->
                <div v-if="currentProposal" class="card">
                    <div class="flex items-center gap-3 mb-5">
                        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-calm-lavender-500/10 text-calm-lavender-600 dark:text-calm-lavender-400 text-xs font-semibold border border-calm-lavender-400/30">2</span>
                        <h2 class="text-base font-semibold text-slate-700 dark:text-platinum-200">Proposal Details</h2>
                    </div>
                    <div class="space-y-5">
                        <div class="p-5 bg-slate-50 dark:bg-abyss-700 rounded-lg border border-slate-200 dark:border-abyss-500">
                            <h3 class="text-sm font-semibold text-calm-lavender-600 dark:text-calm-lavender-300 mb-4">{{ currentProposal.title }}</h3>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p class="text-slate-500 dark:text-platinum-400 text-xs uppercase tracking-wider mb-1">Campus</p>
                                    <p class="font-medium text-slate-700 dark:text-platinum-200">{{ currentProposal.campus?.name }}</p>
                                </div>
                                <div>
                                    <p class="text-slate-500 dark:text-platinum-400 text-xs uppercase tracking-wider mb-1">Status</p>
                                    <span :class="getStatusColor(currentProposal.status)" class="px-2.5 py-1 rounded text-xs font-medium border">
                                        {{ formatStatus(currentProposal.status) }}
                                    </span>
                                </div>
                                <div>
                                    <p class="text-slate-500 dark:text-platinum-400 text-xs uppercase tracking-wider mb-1">Submitted</p>
                                    <p class="font-medium text-slate-700 dark:text-platinum-200">{{ formatDate(currentProposal.submission_date) }}</p>
                                </div>
                                <div>
                                    <p class="text-slate-500 dark:text-platinum-400 text-xs uppercase tracking-wider mb-1">Review Status</p>
                                    <p class="font-medium flex items-center gap-1.5" :class="currentProposal.reviewed_by ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'">
                                        <CheckCircle2 v-if="currentProposal.reviewed_by" class="w-3.5 h-3.5" />
                                        <span v-else class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        {{ currentProposal.reviewed_by ? 'Reviewed' : 'Pending' }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Current Document -->
                        <div v-if="currentProposal.file_key" class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-4">
                            <div class="p-2 rounded-md bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 mt-0.5">
                                <CheckCircle2 class="w-5 h-5" />
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-slate-700 dark:text-platinum-100">Document Uploaded</p>
                                <p class="text-xs text-slate-500 dark:text-platinum-400 mt-1 flex items-center gap-2">
                                    <FileIcon class="w-3.5 h-3.5" />
                                    {{ currentProposal.file_key.split('/').pop() }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 3: File Upload -->
                <div v-if="selectedProposalId" class="card">
                    <div class="flex items-center gap-3 mb-5">
                        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-calm-lavender-500/10 text-calm-lavender-600 dark:text-calm-lavender-400 text-xs font-semibold border border-calm-lavender-400/30">3</span>
                        <h2 class="text-base font-semibold text-slate-700 dark:text-platinum-200">Upload Document</h2>
                    </div>
                    
                    <!-- Drag & Drop Area -->
                    <div 
                        @dragover.prevent="isDragging = true"
                        @dragleave.prevent="isDragging = false"
                        @drop.prevent="handleDrop"
                        class="relative border-2 border-dashed rounded-xl p-10 transition-colors duration-200 ease-in-out cursor-pointer"
                        :class="isDragging 
                            ? 'border-calm-lavender-400 bg-calm-lavender-500/5' 
                            : 'border-slate-200 dark:border-abyss-500 bg-white/70 dark:bg-abyss-700/70 hover:border-slate-400 dark:hover:border-abyss-400'"
                    >
                        <input 
                            type="file"
                            @change="handleFileSelect"
                            accept=".pdf,.doc,.docx"
                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            ref="fileInput"
                            title="Choose a file to upload"
                        />
                        <div class="text-center flex flex-col items-center">
                            <div class="p-4 mb-4 rounded-full bg-slate-50 dark:bg-abyss-700 border border-slate-200 dark:border-abyss-500" :class="isDragging ? 'text-calm-lavender-500 border-calm-lavender-500/30 bg-calm-lavender-500/10' : 'text-slate-500 dark:text-platinum-400'">
                                <Upload class="w-6 h-6" />
                            </div>
                            <p class="text-sm font-medium text-slate-700 dark:text-platinum-200 mb-1">
                                {{ isDragging ? 'Release to drop file' : 'Click to browse or drag file here' }}
                            </p>
                            <p class="text-xs text-slate-500 dark:text-platinum-400">Supports PDF and DOCX (Max 50MB)</p>
                        </div>
                    </div>

                    <!-- File Preview -->
                    <div v-if="selectedFile" class="mt-5 p-4 bg-slate-50 dark:bg-abyss-700 border border-slate-200 dark:border-abyss-500 rounded-lg flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="p-2 border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 rounded text-calm-lavender-600 dark:text-calm-lavender-400">
                                <FileIcon class="w-5 h-5" />
                            </div>
                            <div class="flex flex-col">
                                <span class="text-sm font-medium text-slate-700 dark:text-platinum-100 truncate max-w-[200px] sm:max-w-xs">{{ selectedFile.name }}</span>
                                <span class="text-xs text-slate-500 dark:text-platinum-400 mt-0.5">{{ formatFileSize(selectedFile.size) }}</span>
                            </div>
                        </div>
                        <button 
                            @click="selectedFile = null"
                            class="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            title="Remove file"
                        >
                            <X class="w-4 h-4" />
                        </button>
                    </div>

                    <!-- Upload Button -->
                    <button 
                        @click="uploadDocument"
                        :disabled="!selectedFile || isUploading"
                        class="btn-primary w-full mt-6 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span v-if="isUploading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <Upload v-else class="w-4 h-4" />
                        {{ isUploading ? 'Uploading Document...' : 'Upload Document' }}
                    </button>
                </div>
            </div>

            <!-- Sidebar: Your Proposals -->
            <div class="card h-fit lg:sticky lg:top-8">
                <h2 class="text-sm font-semibold text-slate-700 dark:text-platinum-200 uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-abyss-500 pb-3">
                    <FileIcon class="w-4 h-4 text-slate-400 dark:text-platinum-400" />
                    Available Proposals
                </h2>
                <div class="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    <div v-if="proposals.length === 0" class="text-center py-10 px-4 text-slate-500 dark:text-platinum-400 bg-slate-50 dark:bg-abyss-700 rounded-lg border border-dashed border-slate-200 dark:border-abyss-500">
                        <FileIcon class="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p class="text-sm">No proposals found</p>
                    </div>
                    <div 
                        v-for="proposal in proposals"
                        :key="proposal.id"
                        @click="selectedProposalId = proposal.id"
                        class="p-3 bg-white dark:bg-abyss-700 border rounded-lg cursor-pointer transition-colors duration-150 flex flex-col gap-2"
                        :class="selectedProposalId == proposal.id ? 'border-calm-lavender-500/50 ring-1 ring-calm-lavender-500/20 bg-calm-lavender-500/10' : 'border-slate-200 dark:border-abyss-500 hover:border-slate-400 dark:hover:border-abyss-400'"
                    >
                        <div class="flex justify-between items-start gap-2">
                            <p class="text-sm font-medium text-slate-700 dark:text-platinum-200 leading-snug line-clamp-2" :class="selectedProposalId == proposal.id && 'text-calm-lavender-600 dark:text-calm-lavender-300'">{{ proposal.title }}</p>
                            <div class="mt-1">
                                <div v-if="proposal.file_key" class="w-2 h-2 rounded-full bg-emerald-500" title="Document uploaded"></div>
                                <div v-else class="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600" title="Missing document"></div>
                            </div>
                        </div>
                        <p class="text-xs text-slate-500 dark:text-platinum-400 font-medium">{{ proposal.campus?.name }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Notification Toasts -->
        <div class="fixed bottom-6 right-6 flex flex-col gap-3 z-50 max-w-sm pointer-events-none">
            <!-- Success Message -->
            <div v-if="successMessage" class="pointer-events-auto p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-lg flex items-start gap-3 transform transition-all duration-300">
                <CheckCircle2 class="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p class="text-sm font-medium text-emerald-700 dark:text-emerald-200">{{ successMessage }}</p>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="pointer-events-auto p-4 bg-rose-500/10 border border-rose-500/40 rounded-lg flex items-start gap-3 transform transition-all duration-300">
                <AlertCircle class="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <p class="text-sm font-medium text-rose-700 dark:text-rose-200">{{ errorMessage }}</p>
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
