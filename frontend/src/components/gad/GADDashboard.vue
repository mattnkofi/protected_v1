<template>
    <div class="page-wrapper animate-in font-mplusrounded">
            <header class="page-header">
                <div class="space-y-2">
                    <p class="section-eyebrow">HGDG Admin</p>
                    <h1 class="page-title">HGDG <span class="brand-gradient-text">Dashboard</span></h1>
                    <p class="page-subtitle">Monitor and manage all proposals.</p>
                </div>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="stat-pill flex-col items-start gap-1.5">
                    <p class="stat-pill-label">Total Proposals</p>
                    <p class="stat-pill-value text-2xl text-abyss-800 dark:text-platinum-100">{{ stats.totalProposals }}</p>
                </div>
                <div class="stat-pill flex-col items-start gap-1.5">
                    <p class="stat-pill-label">Approved</p>
                    <p class="stat-pill-value text-2xl text-emerald-600 dark:text-emerald-300">{{ stats.approvedProposals }}</p>
                </div>
                <div class="stat-pill flex-col items-start gap-1.5">
                    <p class="stat-pill-label">Pending Review</p>
                    <p class="stat-pill-value text-2xl text-amber-600 dark:text-amber-300">{{ stats.pendingProposals }}</p>
                </div>
                <div class="stat-pill flex-col items-start gap-1.5">
                    <p class="stat-pill-label">Needs Revision</p>
                    <p class="stat-pill-value text-2xl text-rose-600 dark:text-rose-300">{{ stats.rejectedProposals }}</p>
                </div>
            </div>

            <div class="card space-y-6">
                <div class="flex flex-wrap justify-between items-center gap-3">
                    <h2 class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-platinum-200">Pending Review</h2>
                    <button @click="loadStats" class="btn-secondary text-xs">
                        Refresh
                    </button>
                </div>

                <div v-if="pendingProposals.length > 0" class="space-y-4">
                    <div
                        v-for="proposal in pendingProposals"
                        :key="proposal.id"
                        @click="selectProposal(proposal)"
                        class="item-card !p-4 cursor-pointer hover:border-amber-200 dark:hover:border-amber-700/60"
                    >
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex-1">
                                <h3 class="font-semibold text-slate-800 dark:text-platinum-100">{{ proposal.title }}</h3>
                                <p class="text-xs text-slate-500 dark:text-platinum-400">{{ proposal.user?.name }} • {{ formatDate(proposal.submission_date) }}</p>
                            </div>
                            <button
                                @click.stop="$emit('review', proposal)"
                                class="btn-secondary text-xs px-3 py-1.5"
                            >
                                Review Now
                            </button>
                        </div>
                        <p class="text-sm text-slate-600 dark:text-platinum-300 line-clamp-2">{{ proposal.description }}</p>
                    </div>
                </div>
                <div v-else class="text-center py-8 text-slate-500 dark:text-platinum-400">
                    <p class="font-semibold">No pending proposals</p>
                </div>
            </div>

            <div class="card space-y-6">
                <h2 class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-platinum-200">Filter by Campus</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                        v-for="campus in campuses"
                        :key="campus.id"
                        @click="filterByCampus(campus.id)"
                        class="item-card !p-4 cursor-pointer hover:border-calm-lavender-200 dark:hover:border-calm-lavender-700/60"
                    >
                        <p class="font-semibold text-slate-800 dark:text-platinum-100">{{ campus.name }}</p>
                        <p class="text-xs text-slate-500 dark:text-platinum-400 mt-1">
                            {{ getCampusProposalCount(campus.id) }} proposals
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="selectedProposal" class="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                <div class="card max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h2 class="text-2xl font-semibold text-slate-800 dark:text-platinum-100">{{ selectedProposal.title }}</h2>
                            <p class="text-sm text-slate-500 dark:text-platinum-400">Submitted by {{ selectedProposal.user?.name }}</p>
                        </div>
                        <button @click="selectedProposal = null" class="text-slate-500 hover:text-slate-700 dark:text-platinum-400 dark:hover:text-platinum-100 text-xl">x</button>
                    </div>

                    <div class="space-y-6 mb-6">
                        <div>
                            <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2">Proposal Description</h3>
                            <p class="text-slate-700 dark:text-platinum-100 bg-slate-50 dark:bg-abyss-700 p-4 rounded-2xl border border-slate-200 dark:border-abyss-500">{{ selectedProposal.description }}</p>
                        </div>

                        <div v-if="selectedProposal.gfl_issues?.issues?.length > 0" class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                            <h3 class="text-xs font-semibold text-amber-700 dark:text-amber-200 uppercase tracking-[0.2em] mb-3">Gender-Fair Language Issues ({{ selectedProposal.gfl_issues.issues.length }})</h3>
                            <div class="space-y-2">
                                <div v-for="(issue, idx) in selectedProposal.gfl_issues.issues" :key="idx" class="text-sm">
                                    <strong class="text-amber-700 dark:text-amber-200">"{{ issue.term }}"</strong> -> <em class="text-emerald-600 dark:text-emerald-300">"{{ issue.suggestion }}"</em>
                                </div>
                            </div>
                        </div>

                        <div v-if="selectedProposal.admin_feedback" class="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4">
                            <h3 class="text-xs font-semibold text-cyan-700 dark:text-cyan-200 uppercase tracking-[0.2em] mb-2">Previous Feedback</h3>
                            <p class="text-slate-700 dark:text-platinum-100">{{ selectedProposal.admin_feedback }}</p>
                        </div>
                    </div>

                    <button @click="selectedProposal = null" class="btn-primary w-full justify-center">
                        Close
                    </button>
                </div>
            </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/utils/api';

const stats = ref({
    totalProposals: 0,
    approvedProposals: 0,
    pendingProposals: 0,
    rejectedProposals: 0
});

const campuses = ref([]);
const proposals = ref([]);
const pendingProposals = ref([]);
const selectedProposal = ref(null);

onMounted(() => {
    loadStats();
    loadCampuses();
    loadProposals();
});

const loadStats = async () => {
    try {
        const response = await axios.get('/api/v1/gad/dashboard/stats');
        stats.value = response.data.stats;
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
};

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
        const response = await axios.get('/api/v1/gad/proposals?limit=100');
        proposals.value = response.data.proposals;
        pendingProposals.value = proposals.value.filter(p => ['submitted', 'under_review'].includes(p.status)).slice(0, 5);
    } catch (error) {
        console.error('Failed to load proposals:', error);
    }
};

const selectProposal = (proposal) => {
    selectedProposal.value = proposal;
};

const filterByCampus = (campusId) => {
    // Navigate to proposals filtered by campus
    console.log('Filter by campus:', campusId);
};

const getCampusProposalCount = (campusId) => {
    return proposals.value.filter(p => p.campus_id === campusId).length;
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
</script>
