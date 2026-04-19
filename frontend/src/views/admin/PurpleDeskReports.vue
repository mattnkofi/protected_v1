<template>
    <div class="page-wrapper animate-in font-mplusrounded">
        <header class="page-header">
            <div class="space-y-2">
                <p class="section-eyebrow">Admin Safety Desk</p>
                <h1 class="page-title">Purple Desk Reports</h1>
                <p class="page-subtitle max-w-2xl">Review anonymous submissions and update their status.</p>
            </div>
            <div class="stat-pill">
                <span class="stat-pill-label">Reports</span>
                <span class="stat-pill-value">{{ reports.length }}</span>
            </div>
        </header>

        <section class="card">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p class="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-platinum-300">Filters</p>
                    <p class="mt-1 text-sm text-slate-600 dark:text-platinum-300">Filter by campus or status.</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <select v-model="filters.campus_id" class="rounded-lg border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-xs text-slate-700 dark:text-platinum-100">
                        <option value="">All campuses</option>
                        <option v-for="campus in campuses" :key="campus.id" :value="campus.id">
                            {{ campus.name }}
                        </option>
                    </select>
                    <select v-model="filters.status" class="rounded-lg border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-xs text-slate-700 dark:text-platinum-100">
                        <option value="">All status</option>
                        <option value="submitted">Submitted</option>
                        <option value="in_review">In Review</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    <button @click="fetchReports" class="btn-secondary text-xs">Refresh</button>
                </div>
            </div>

            <div v-if="isLoading" class="mt-4 space-y-2">
                <div v-for="i in 4" :key="i" class="h-16 rounded-xl bg-slate-100 dark:bg-abyss-700 animate-pulse" />
            </div>

            <div v-else-if="reports.length === 0" class="mt-4 rounded-xl border border-dashed border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-800 p-6 text-center text-sm text-slate-500 dark:text-platinum-400">
                No Purple Desk reports found.
            </div>

            <div v-else class="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div
                    v-for="report in reports"
                    :key="report.id"
                    class="item-card p-5"
                >
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Purple Desk</p>
                            <p class="mt-1 text-sm text-slate-600 dark:text-platinum-300">
                                {{ report.campus?.name || 'All Campus' }} - {{ formatDate(report.created_at) }}
                            </p>
                        </div>
                        <span class="rounded-full border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-800 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-300">
                            {{ report.status.replace('_', ' ') }}
                        </span>
                    </div>

                    <div class="mt-4 grid grid-cols-2 gap-3">
                        <div class="rounded-xl border border-slate-200/80 dark:border-abyss-500/80 bg-slate-50 dark:bg-abyss-800/70 p-3">
                            <div class="flex items-center gap-2">
                                <div class="h-9 w-9 rounded-lg border border-indigo-200/80 bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xs font-semibold">
                                    TC
                                </div>
                                <div>
                                    <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Tracking</p>
                                    <p class="text-sm font-semibold text-slate-800 dark:text-platinum-100">{{ report.tracking_code }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="rounded-xl border border-slate-200/80 dark:border-abyss-500/80 bg-slate-50 dark:bg-abyss-800/70 p-3">
                            <div class="flex items-center gap-2">
                                <div class="h-9 w-9 rounded-lg border border-emerald-200/80 bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs font-semibold">
                                    ST
                                </div>
                                <div>
                                    <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Status</p>
                                    <p class="text-sm font-semibold text-slate-800 dark:text-platinum-100">{{ report.status.replace('_', ' ') }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4 rounded-xl border border-slate-200/80 dark:border-abyss-500/80 bg-white dark:bg-abyss-800 p-4">
                        <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Report Message</p>
                        <p class="mt-2 text-sm text-slate-700 dark:text-platinum-200 leading-relaxed">
                            {{ report.report_message || 'Message unavailable.' }}
                        </p>
                    </div>

                    <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
                        <p class="text-xs text-slate-600 dark:text-platinum-300">Category: {{ report.category || 'Unspecified' }}</p>
                        <div class="flex items-center gap-2">
                            <button
                                @click="openDetails(report)"
                                class="btn-secondary text-xs px-3 py-2"
                            >
                                View Details
                            </button>
                            <select
                                v-model="statusEdits[report.id]"
                                class="rounded-lg border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-xs text-slate-700 dark:text-platinum-100"
                            >
                                <option value="submitted">Submitted</option>
                                <option value="in_review">In Review</option>
                                <option value="resolved">Resolved</option>
                            </select>
                            <button
                                @click="updateStatus(report.id)"
                                :disabled="isUpdating[report.id]"
                                class="btn-primary text-xs px-3 py-2 disabled:opacity-50"
                            >
                                {{ isUpdating[report.id] ? 'Saving...' : 'Save' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <p v-if="errorMessage" class="mt-4 text-xs text-rose-600 dark:text-rose-300">{{ errorMessage }}</p>
        </section>

        <transition name="fade">
            <div v-if="showDetails" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                <transition name="scale">
                    <div v-if="showDetails" class="w-full max-w-3xl rounded-2xl border border-slate-200/80 dark:border-abyss-500/80 bg-white dark:bg-abyss-900">
                        <div class="flex items-center justify-between border-b border-slate-200/80 dark:border-abyss-500/80 px-6 py-4">
                            <div>
                                <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Purple Desk Report</p>
                                <p class="text-lg font-semibold text-slate-900 dark:text-white">{{ selectedReport?.tracking_code }}</p>
                            </div>
                            <button @click="closeDetails" class="rounded-full border border-slate-200 dark:border-abyss-500 px-3 py-1 text-xs text-slate-600 dark:text-platinum-200">
                                Close
                            </button>
                        </div>
                        <div class="p-6 space-y-4">
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div class="rounded-xl border border-slate-200/80 dark:border-abyss-500/80 bg-slate-50 dark:bg-abyss-800/80 p-3">
                                    <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Campus</p>
                                    <p class="mt-1 text-sm font-semibold text-slate-800 dark:text-platinum-100">{{ selectedReport?.campus?.name || 'All Campus' }}</p>
                                </div>
                                <div class="rounded-xl border border-slate-200/80 dark:border-abyss-500/80 bg-slate-50 dark:bg-abyss-800/80 p-3">
                                    <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Status</p>
                                    <p class="mt-1 text-sm font-semibold text-slate-800 dark:text-platinum-100">{{ selectedReport?.status?.replace('_', ' ') }}</p>
                                </div>
                                <div class="rounded-xl border border-slate-200/80 dark:border-abyss-500/80 bg-slate-50 dark:bg-abyss-800/80 p-3">
                                    <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Submitted</p>
                                    <p class="mt-1 text-sm font-semibold text-slate-800 dark:text-platinum-100">{{ formatDate(selectedReport?.created_at) }}</p>
                                </div>
                            </div>
                            <div class="rounded-xl border border-slate-200/80 dark:border-abyss-500/80 bg-white dark:bg-abyss-800 p-4">
                                <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Message</p>
                                <p class="mt-2 text-sm text-slate-700 dark:text-platinum-200 whitespace-pre-line">
                                    {{ selectedReport?.report_message || 'Message unavailable.' }}
                                </p>
                            </div>
                            <div class="rounded-xl border border-slate-200/80 dark:border-abyss-500/80 bg-slate-50 dark:bg-abyss-800/80 p-3">
                                <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Category</p>
                                <p class="mt-1 text-sm font-semibold text-slate-800 dark:text-platinum-100">{{ selectedReport?.category || 'Unspecified' }}</p>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
    transition: transform 220ms ease, opacity 220ms ease;
}

.scale-enter-from,
.scale-leave-to {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
}
</style>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '@/utils/api';

const reports = ref([]);
const campuses = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');
const filters = ref({
    campus_id: '',
    status: ''
});
const statusEdits = ref({});
const isUpdating = ref({});
const showDetails = ref(false);
const selectedReport = ref(null);

const fetchCampuses = async () => {
    try {
        const { data } = await api.get('/api/v1/gad/campuses');
        campuses.value = data.campuses || [];
    } catch (error) {
        campuses.value = [];
    }
};

const fetchReports = async () => {
    try {
        isLoading.value = true;
        errorMessage.value = '';
        const params = {};
        if (filters.value.campus_id) params.campus_id = filters.value.campus_id;
        if (filters.value.status) params.status = filters.value.status;
        const { data } = await api.get('/api/v1/purple-desk/reports', { params });
        reports.value = data.reports || [];
        statusEdits.value = reports.value.reduce((acc, report) => {
            acc[report.id] = report.status;
            return acc;
        }, {});
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Failed to load reports.';
        reports.value = [];
    } finally {
        isLoading.value = false;
    }
};

const updateStatus = async (reportId) => {
    try {
        isUpdating.value[reportId] = true;
        await api.put(`/api/v1/purple-desk/reports/${reportId}/status`, {
            status: statusEdits.value[reportId]
        });
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Failed to update status.';
    } finally {
        isUpdating.value[reportId] = false;
    }
};

const openDetails = (report) => {
    selectedReport.value = report;
    showDetails.value = true;
};

const closeDetails = () => {
    showDetails.value = false;
    selectedReport.value = null;
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
};

watch(() => filters.value.campus_id, fetchReports);
watch(() => filters.value.status, fetchReports);

onMounted(() => {
    fetchCampuses();
    fetchReports();
});
</script>
