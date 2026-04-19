<template>
    <div class="page-wrapper animate-in font-mplusrounded">
            <header class="page-header">
                <div class="space-y-2">
                    <p class="section-eyebrow">HGDG Review</p>
                    <h1 class="page-title">Review <span class="brand-gradient-text">Proposal</span></h1>
                    <p class="page-subtitle">Provide feedback and score the proposal.</p>
                </div>
            </header>

        <!-- Document Viewer Modal -->
        <DocumentViewer
            :isOpen="showDocumentViewer"
            :documentUrl="documentUrl"
            :documentName="proposal?.file_key?.split('/').pop()"
            :proposalId="proposal?.id"
            @close="showDocumentViewer = false"
        />

            <div v-if="proposal" class="space-y-6">
            <!-- Proposal Details -->
            <div class="card space-y-6">
                <div>
                    <h2 class="text-2xl font-semibold text-slate-800 dark:text-platinum-100">{{ proposal.title }}</h2>
                    <div class="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600 dark:text-platinum-300 bg-slate-50 dark:bg-abyss-700 p-4 rounded-2xl border border-slate-200 dark:border-abyss-500">
                        <div>
                            <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-1">Submitted by</p>
                            <p class="font-semibold text-slate-700 dark:text-platinum-100">{{ proposal.user?.name }}</p>
                        </div>
                        <div>
                            <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-1">Campus</p>
                            <p class="font-semibold text-slate-700 dark:text-platinum-100">{{ proposal.campus?.name }}</p>
                        </div>
                        <div>
                            <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-1">Date</p>
                            <p class="font-semibold text-slate-700 dark:text-platinum-100">{{ formatDate(proposal.submission_date) }}</p>
                        </div>
                        <div>
                            <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-1">Status</p>
                            <p :class="getStatusColor(proposal.status)" class="font-semibold">{{ formatStatus(proposal.status) }}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-platinum-400 mb-3">Description</h3>
                    <p class="bg-slate-50 dark:bg-abyss-700 p-4 rounded-2xl border border-slate-200 dark:border-abyss-500 text-slate-700 dark:text-platinum-100 leading-relaxed">{{ proposal.description }}</p>
                </div>

                <!-- Uploaded Document Preview -->
                <div v-if="proposal.file_key" class="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <FileText class="w-5 h-5 text-cyan-300" />
                                <h3 class="text-sm font-semibold text-cyan-700 dark:text-cyan-200 uppercase tracking-[0.2em]">Supporting Document</h3>
                            </div>
                            <p class="text-xs text-cyan-700 dark:text-cyan-200 font-mono">{{ proposal.file_key.split('/').pop() }}</p>
                            <p class="text-xs text-slate-500 dark:text-platinum-400 mt-1">Uploaded: {{ formatDate(proposal.updated_at) }}</p>
                        </div>
                        <button 
                            @click="showDocumentViewer = true"
                            class="btn-primary text-xs px-4 py-2 whitespace-nowrap"
                        >
                            <Eye class="w-4 h-4" />
                            View Document
                        </button>
                    </div>
                </div>

                <!-- GFL Issues -->
                <div v-if="proposal.gfl_issues?.issues?.length > 0" class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <Search class="w-5 h-5 text-amber-300" />
                        <h3 class="text-sm font-semibold text-amber-700 dark:text-amber-200 uppercase tracking-[0.2em]">Gender-Fair Language Issues Detected</h3>
                    </div>
                    <div class="space-y-2">
                        <div v-for="(issue, idx) in proposal.gfl_issues.issues" :key="idx" class="text-sm">
                            <strong class="text-amber-700 dark:text-amber-200">"{{ issue.term }}"</strong> 
                            <span :class="['px-2 py-1 rounded text-xs font-bold', issue.severity === 'high' ? 'bg-rose-500/20 text-rose-300' : issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-blue-500/20 text-blue-300']">
                                {{ issue.severity }}
                            </span>
                            → <em class="text-emerald-600 dark:text-emerald-300">"{{ issue.suggestion }}"</em>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Scoring Section -->
            <div class="card space-y-6">
                <h2 class="text-2xl font-semibold">Evaluation Criteria</h2>
                
                <div v-if="criteria.length === 0" class="text-center py-8 text-slate-500 dark:text-platinum-400">
                    <p class="font-bold">Loading criteria...</p>
                </div>

                <div v-for="crit in criteria" :key="crit.id" class="p-4 bg-slate-50 dark:bg-abyss-700 border border-slate-200 dark:border-abyss-500 rounded-2xl">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <h3 class="font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-platinum-200">{{ crit.criteria_name }}</h3>
                            <p class="text-sm text-slate-500 dark:text-platinum-400 mt-1">{{ crit.description }}</p>
                        </div>
                        <span class="text-xs font-semibold bg-cyan-500/10 text-cyan-200 px-2 py-1 rounded-full border border-cyan-400/30">
                            Max: {{ crit.max_points }} pts
                        </span>
                    </div>

                    <div class="space-y-3">
                        <div>
                            <label class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2 block">Points Awarded</label>
                            <div class="flex items-center gap-4">
                                <input 
                                    type="range"
                                    v-model.number="scores[crit.id] || 0"
                                    :max="crit.max_points"
                                    min="0"
                                    step="1"
                                    class="flex-1 h-2 bg-slate-200 dark:bg-abyss-800 rounded-full cursor-pointer"
                                />
                                <span class="text-lg font-semibold text-cyan-300 min-w-12 text-right">
                                    {{ scores[crit.id] || 0 }}/{{ crit.max_points }}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2 block">Evaluator Comment</label>
                            <textarea 
                                v-model="comments[crit.id]"
                                rows="2"
                                placeholder="Provide specific feedback for this criterion (visible to facilitator)..."
                                class="w-full px-3 py-2 bg-white dark:bg-abyss-700 text-slate-700 dark:text-platinum-100 border border-slate-200 dark:border-abyss-500 rounded-xl placeholder-slate-400 dark:placeholder-platinum-500 focus:border-calm-lavender-500 focus:outline-none transition-all text-sm resize-none"
                            />
                            <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-platinum-400 mt-1">
                                <MessageSquare class="w-3 h-3" />
                                This comment will be sent to the facilitator
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Admin Feedback & Status -->
            <div class="card space-y-6">
                <h2 class="text-2xl font-semibold mb-4">Admin Decision & Feedback</h2>

                <div>
                    <label class="block text-sm font-semibold uppercase tracking-[0.2em] mb-3 text-slate-700 dark:text-platinum-200">Decision</label>
                    <select 
                        v-model="reviewStatus"
                        class="w-full px-4 py-3 bg-white dark:bg-abyss-700 text-slate-700 dark:text-platinum-100 border border-slate-200 dark:border-abyss-500 rounded-xl focus:border-calm-lavender-500 focus:outline-none transition-all"
                    >
                        <option value="under_review">Under Review (Evaluating)</option>
                        <option value="rejected_with_feedback">Needs Revision (Send Feedback)</option>
                        <option value="approved">Approved ✓</option>
                        <option value="approved_final">Approved Final ✓✓</option>
                    </select>
                    <p class="text-xs text-slate-500 dark:text-platinum-400 mt-2">
                        <strong>Needs Revision:</strong> Proposal requires changes. Facilitator will see feedback and can resubmit.
                    </p>
                </div>

                <div>
                    <label class="block text-sm font-semibold uppercase tracking-[0.2em] mb-3 flex items-center gap-2 text-slate-700 dark:text-platinum-200">
                        <PenTool class="w-5 h-5" />
                        Revision Comments (Visible to Facilitator)
                    </label>
                    <textarea 
                        v-model="adminFeedback"
                        rows="8"
                        placeholder="Provide detailed feedback, revisions needed, recommendations, or reasons for approval/rejection. This will be shown to the facilitator..."
                        class="w-full px-4 py-3 bg-white dark:bg-abyss-700 text-slate-700 dark:text-platinum-100 border border-slate-200 dark:border-abyss-500 rounded-xl placeholder-slate-400 dark:placeholder-platinum-500 focus:border-calm-lavender-500 focus:outline-none transition-all resize-none"
                    />
                    <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-platinum-400 mt-2">
                        <MessageSquare class="w-3 h-3" />
                        Facilitator will see this feedback when they review their proposal status
                    </div>
                </div>

                <!-- Decision Alert -->
                <div v-if="reviewStatus === 'rejected_with_feedback'" class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle class="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                    <p class="text-sm font-semibold text-amber-200">
                        This proposal needs revision. Make sure your feedback is clear and constructive.
                    </p>
                </div>
                <div v-if="reviewStatus.startsWith('approved')" class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 class="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                    <p class="text-sm font-semibold text-emerald-200">
                        Proposal is approved. Add any final recommendations below.
                    </p>
                </div>
            </div>

            <!-- Summary Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="stat-pill flex-col items-start gap-1.5 p-5 rounded-2xl">
                    <p class="stat-pill-label">Total Score</p>
                    <p class="stat-pill-value text-2xl text-cyan-600 dark:text-cyan-300">{{ calculateTotalScore }}</p>
                </div>
                <div class="stat-pill flex-col items-start gap-1.5 p-5 rounded-2xl">
                    <p class="stat-pill-label">Max Possible</p>
                    <p class="stat-pill-value text-2xl text-slate-600 dark:text-platinum-300">{{ calculateMaxScore }}</p>
                </div>
                <div class="stat-pill flex-col items-start gap-1.5 p-5 rounded-2xl">
                    <p class="stat-pill-label">Percentage</p>
                    <p class="stat-pill-value text-2xl text-amber-600 dark:text-amber-300">{{ calculatePercentage }}%</p>
                </div>
                <div class="stat-pill flex-col items-start gap-1.5 p-5 rounded-2xl">
                    <p class="stat-pill-label">Decision</p>
                    <p class="text-lg font-semibold" :class="getDecisionColor(reviewStatus)">{{ formatStatus(reviewStatus) }}</p>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4">
                <button 
                    @click="submitReview"
                    :disabled="isSubmitting"
                    class="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Check class="w-5 h-5" />
                    {{ isSubmitting ? 'Submitting...' : 'Submit Review & Send Feedback' }}
                </button>
                <button 
                    @click="$router.back()"
                    class="btn-secondary"
                >
                    Cancel
                </button>
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <p class="text-emerald-700 dark:text-emerald-200 font-semibold">{{ successMessage }}</p>
            </div>
        </div>

        <div v-else class="text-center py-12 text-slate-500 dark:text-platinum-400">
            <p class="text-lg font-semibold">Loading proposal...</p>
        </div>

        <!-- Document Viewer Modal -->
        <div 
            v-if="showDocumentViewer && documentUrl"
            class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            @click.self="showDocumentViewer = false"
        >
            <div class="bg-white dark:bg-abyss-800 rounded-2xl border border-slate-200 dark:border-abyss-600 w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div class="flex justify-between items-center p-6 border-b border-slate-200 dark:border-abyss-600">
                    <div>
                        <h3 class="text-lg font-semibold text-slate-800 dark:text-platinum-100 uppercase tracking-[0.2em]">Document Viewer</h3>
                        <p class="text-xs text-slate-500 dark:text-platinum-400">{{ proposal?.file_key?.split('/').pop() }}</p>
                    </div>
                    <button 
                        @click="showDocumentViewer = false"
                        class="text-slate-500 hover:text-slate-700 dark:text-platinum-400 dark:hover:text-platinum-100 transition-colors"
                    >
                        <X class="w-6 h-6" />
                    </button>
                </div>
                <div class="flex-1 overflow-auto">
                    <iframe 
                        v-if="isDocumentPDF"
                        :src="documentUrl + '#toolbar=1&navpanes=0&scrollbar=1'"
                        class="w-full h-full"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                        <div class="text-center">
                            <p class="text-slate-400 mb-4">Document Preview Not Available for This Format</p>
                            <button 
                                @click="openDocumentDownload"
                                class="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-slate-950 font-semibold rounded-lg transition-colors"
                            >
                                Download Document
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    </div>
</template>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '@/utils/api';
import DocumentViewer from '@/components/common/DocumentViewer.vue';
import { FileText, Search, AlertTriangle, CheckCircle2, AlertCircle, MessageSquare, PenTool, Check, X, Eye } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const proposal = ref(null);
const criteria = ref([]);
const scores = ref({});
const comments = ref({});
const reviewStatus = ref('under_review');
const adminFeedback = ref('');
const isSubmitting = ref(false);
const successMessage = ref('');
const showDocumentViewer = ref(false);
const documentUrl = ref('');

const calculateTotalScore = computed(() => {
    return Object.keys(scores.value).reduce((sum, key) => sum + (scores.value[key] || 0), 0);
});

const calculateMaxScore = computed(() => {
    return criteria.value.reduce((sum, crit) => sum + crit.max_points, 0);
});

const calculatePercentage = computed(() => {
    if (calculateMaxScore.value === 0) return 0;
    return Math.round((calculateTotalScore.value / calculateMaxScore.value) * 100);
});

const getStatusColor = (status) => {
    const colors = {
        'submitted': 'text-blue-700 dark:text-blue-400',
        'under_review': 'text-yellow-700 dark:text-yellow-400',
        'rejected_with_feedback': 'text-rose-700 dark:text-rose-400',
        'revised': 'text-orange-700 dark:text-orange-400',
        'approved': 'text-emerald-700 dark:text-emerald-400',
        'approved_final': 'text-teal-700 dark:text-teal-400'
    };
    return colors[status] || 'text-gray-700 dark:text-gray-400';
};

const formatStatus = (status) => {
    const statuses = {
        'submitted': 'Submitted',
        'under_review': 'Under Review',
        'rejected_with_feedback': 'Needs Revision',
        'revised': 'Revised',
        'approved': 'Approved',
        'approved_final': 'Approved Final'
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

onMounted(async () => {
    const proposalId = route.params.proposal_id;
    
    try {
        // Load proposal details
        const proposalRes = await axios.get(`/api/v1/gad/proposals/${proposalId}`);
        proposal.value = proposalRes.data.proposal;

        // Load scoring criteria
        const criteriaRes = await axios.get('/api/v1/gad/scoring-criteria');
        criteria.value = criteriaRes.data.criteria;

        // Initialize scores
        criteria.value.forEach(crit => {
            scores.value[crit.id] = 0;
            comments.value[crit.id] = '';
        });

        // Load document URL if available
        if (proposal.value.file_key) {
            await loadDocumentUrl();
        }
    } catch (error) {
        console.error('Failed to load proposal:', error);
    }
});

const loadDocumentUrl = async () => {
    try {
        const response = await axios.get(`/api/v1/gad/proposals/${proposal.value.id}/download-document`);
        if (response.data.success && response.data.document) {
            documentUrl.value = response.data.document.downloadUrl;
        }
    } catch (error) {
        console.error('Failed to load document URL:', error);
    }
};

const submitReview = async () => {
    if (!adminFeedback.value.trim() && reviewStatus.value === 'rejected_with_feedback') {
        alert('Please provide feedback when marking as "Needs Revision"');
        return;
    }

    try {
        isSubmitting.value = true;

        const reviewData = {
            status: reviewStatus.value,
            admin_feedback: adminFeedback.value,
            scores: criteria.value.map(crit => ({
                criteria_id: crit.id,
                points_awarded: scores.value[crit.id] || 0,
                comment: comments.value[crit.id] || ''
            }))
        };

        await axios.put(`/api/v1/gad/proposals/${proposal.value.id}/review`, reviewData);

        successMessage.value = 'Review submitted successfully! Facilitator has been notified.';
        
        setTimeout(() => {
            router.push('/admin/gad/proposals');
        }, 2000);
    } catch (error) {
        console.error('Failed to submit review:', error);
        alert('Failed to submit review: ' + (error.response?.data?.message || error.message));
    } finally {
        isSubmitting.value = false;
    }
};
</script>
