<template>
    <div class="page-wrapper animate-in font-mplusrounded">
        <header class="page-header">
            <div class="space-y-2">
                <p class="section-eyebrow">Safety & Support</p>
                <h1 class="page-title">Purple Desk</h1>
                <p class="page-subtitle max-w-2xl">
                    Anonymous reporting space. You get a tracking code to check progress without revealing your identity.
                </p>
            </div>
            <div class="card max-w-xs">
                <p class="text-[10px] uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">Reminder</p>
                <p class="mt-1 text-xs text-slate-600 dark:text-platinum-300">If someone is in immediate danger, contact your campus security hotline first.</p>
            </div>
        </header>

            <section class="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">
                <div class="card">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-platinum-300">Submit Report</p>
                            <p class="mt-1 text-sm font-medium text-slate-700 dark:text-platinum-200">Share what happened. Keep it simple and factual.</p>
                        </div>
                        <span class="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-200">Anonymous</span>
                    </div>

                    <div class="mt-5 grid grid-cols-1 gap-4">
                        <div>
                            <label class="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2">Campus</label>
                            <select v-model="form.campus_id" class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-4 py-3 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-emerald-500">
                                <option value="">Select campus (optional)</option>
                                <option v-for="campus in campuses" :key="campus.id" :value="campus.id">
                                    {{ campus.name }}
                                </option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2">Category</label>
                            <select v-model="form.category" class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-4 py-3 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-emerald-500">
                                <option value="">Select category (optional)</option>
                                <option value="harassment">Harassment</option>
                                <option value="bullying">Bullying</option>
                                <option value="facility">Facility or safety concern</option>
                                <option value="mental-health">Mental health concern</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2">Report Details</label>
                            <textarea
                                v-model="form.message"
                                rows="6"
                                placeholder="Describe what happened..."
                                class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-4 py-3 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-emerald-500 resize-none"
                            />
                            <div class="mt-2 text-xs text-slate-500 dark:text-platinum-400">{{ messageCount }} characters</div>
                        </div>

                        <div class="flex flex-wrap gap-2">
                            <button
                                @click="submitReport"
                                :disabled="!form.message || isSubmitting"
                                class="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {{ isSubmitting ? 'Submitting...' : 'Submit Report' }}
                            </button>
                            <button @click="clearForm" class="btn-secondary border border-slate-300/80 dark:border-abyss-400/80 text-slate-700 dark:text-white">
                                Clear
                            </button>
                        </div>
                    </div>

                    <div v-if="trackingCode" class="mt-5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
                        <p class="text-xs uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-200">Tracking Code</p>
                        <div class="mt-2 flex flex-wrap items-center gap-3">
                            <span class="text-lg font-semibold text-emerald-800 dark:text-emerald-100">{{ trackingCode }}</span>
                            <button @click="copyTrackingCode" class="btn-secondary text-xs">Copy</button>
                        </div>
                        <p class="mt-2 text-xs text-emerald-700/80 dark:text-emerald-200/80">Save this code to check updates later.</p>
                    </div>
                    <p v-if="submitMessage" class="mt-4 text-sm text-emerald-600 dark:text-emerald-200">{{ submitMessage }}</p>
                </div>

                <div class="space-y-4">
                    <div class="card">
                        <p class="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-platinum-300">Check Status</p>
                        <p class="mt-2 text-sm text-slate-600 dark:text-platinum-300">Enter your tracking code to see the latest status.</p>

                        <div class="mt-4 space-y-3">
                            <input
                                v-model="statusQuery"
                                type="text"
                                placeholder="e.g. A1B2C3D4"
                                class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-4 py-3 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-emerald-500"
                            />
                            <button @click="checkStatus" :disabled="!statusQuery || isChecking" class="btn-primary w-full justify-center disabled:opacity-50">
                                {{ isChecking ? 'Checking...' : 'Check Status' }}
                            </button>
                        </div>

                        <div v-if="statusResult" class="mt-4 rounded-xl border border-cyan-400/40 bg-cyan-500/10 p-4 text-sm text-cyan-700 dark:text-cyan-200">
                            <p class="uppercase tracking-[0.2em] text-[10px] text-cyan-600/80">Status</p>
                            <p class="mt-2 font-semibold">{{ formatStatus(statusResult.status) }}</p>
                            <p class="mt-1 text-xs text-cyan-700/80 dark:text-cyan-200/80">Submitted: {{ formatDate(statusResult.submitted_at) }}</p>
                        </div>
                        <p v-if="statusError" class="mt-3 text-xs text-rose-600 dark:text-rose-300">{{ statusError }}</p>
                    </div>

                    <div class="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5 text-xs text-amber-700 dark:text-amber-200">
                        <p class="uppercase tracking-[0.2em] text-[10px] text-amber-600/80">Privacy Note</p>
                        <p class="mt-2">Reports are encrypted and reviewed only by authorized safety staff.</p>
                    </div>
                </div>
            </section>
    </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/utils/api';

const campuses = ref([]);
const form = ref({
    campus_id: '',
    category: '',
    message: ''
});
const isSubmitting = ref(false);
const submitMessage = ref('');
const trackingCode = ref('');

const statusQuery = ref('');
const statusResult = ref(null);
const statusError = ref('');
const isChecking = ref(false);

const messageCount = computed(() => form.value.message.length);

const fetchCampuses = async () => {
    try {
        const { data } = await api.get('/api/v1/gad/campuses');
        campuses.value = data.campuses || [];
    } catch (error) {
        campuses.value = [];
    }
};

const submitReport = async () => {
    try {
        isSubmitting.value = true;
        submitMessage.value = '';
        trackingCode.value = '';
        const payload = {
            message: form.value.message,
            campus_id: form.value.campus_id || null,
            category: form.value.category || null
        };
        const { data } = await api.post('/api/v1/purple-desk/reports', payload);
        trackingCode.value = data.tracking_code;
        submitMessage.value = data.message || 'Report submitted.';
    } catch (error) {
        submitMessage.value = error.response?.data?.message || 'Failed to submit report.';
    } finally {
        isSubmitting.value = false;
    }
};

const clearForm = () => {
    form.value = { campus_id: '', category: '', message: '' };
    submitMessage.value = '';
    trackingCode.value = '';
};

const checkStatus = async () => {
    try {
        isChecking.value = true;
        statusError.value = '';
        statusResult.value = null;
        const { data } = await api.get(`/api/v1/purple-desk/reports/status/${statusQuery.value.trim()}`);
        statusResult.value = data;
    } catch (error) {
        statusError.value = error.response?.data?.message || 'Unable to find that tracking code.';
    } finally {
        isChecking.value = false;
    }
};

const copyTrackingCode = async () => {
    try {
        await navigator.clipboard.writeText(trackingCode.value);
        submitMessage.value = 'Tracking code copied.';
    } catch (error) {
        submitMessage.value = 'Copy failed. Please select the code manually.';
    }
};

const formatStatus = (status) => {
    if (status === 'in_review') return 'Under Review';
    if (status === 'resolved') return 'Resolved';
    return 'Submitted';
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
};

onMounted(fetchCampuses);
</script>
