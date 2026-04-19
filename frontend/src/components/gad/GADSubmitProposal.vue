<template>
    <div class="page-wrapper animate-in font-mplusrounded">
            <header class="page-header">
                <div class="space-y-2">
                    <p class="section-eyebrow">HGDG Submit</p>
                    <h1 class="page-title">Submit <span class="brand-gradient-text">Proposal</span></h1>
                    <p class="page-subtitle">Capture scope, goals, and inclusive language checks.</p>
                </div>
                <div class="flex items-center gap-2 text-xs">
                    <span class="badge badge-lavender">Campuses: {{ campuses.length }}</span>
                    <span class="badge badge-lavender">Draft ready</span>
                </div>
            </header>

            <div class="grid grid-cols-1 lg:grid-cols-[1.3fr,0.7fr] gap-5">
                <div class="space-y-4">
                    <div class="card p-4">
                        <div class="grid gap-3 md:grid-cols-2">
                            <div>
                                <label class="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2">Campus</label>
                                <select v-model="form.campus_id" class="w-full rounded-md border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-calm-lavender-500">
                                    <option value="" disabled>Select campus...</option>
                                    <option v-for="campus in campuses" :key="campus.id" :value="campus.id">
                                        {{ campus.name }}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2">Title</label>
                                <input
                                    v-model="form.title"
                                    type="text"
                                    placeholder="Proposal title"
                                    class="w-full rounded-md border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-calm-lavender-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="card p-4">
                        <div class="flex items-center justify-between gap-3">
                            <label class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Description</label>
                            <button
                                @click="analyzeLanguage"
                                :disabled="!form.description"
                                class="btn-secondary text-xs px-3 py-1 disabled:opacity-50"
                            >
                                <Zap class="w-4 h-4" />
                                Analyze
                            </button>
                        </div>
                        <textarea
                            v-model="form.description"
                            rows="9"
                            placeholder="Describe objectives, beneficiaries, and gender outcomes..."
                            class="mt-3 w-full rounded-md border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-calm-lavender-500 resize-none"
                        />
                        <p class="mt-2 text-xs text-slate-500 dark:text-platinum-400">Tip: 100+ characters improves analysis quality.</p>
                    </div>

                    <div v-if="gflAnalysis" class="card p-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Language Check</h3>
                            <span class="text-xs text-slate-500 dark:text-platinum-400">Score / 100</span>
                        </div>
                        <div class="mt-3 grid gap-3 md:grid-cols-3">
                            <div class="rounded-md border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 p-3 text-center">
                                <p class="text-xs text-slate-500 dark:text-platinum-400">Score</p>
                                <p class="text-2xl font-semibold" :class="gflAnalysis.gflScore >= 70 ? 'text-emerald-300' : gflAnalysis.gflScore >= 50 ? 'text-amber-300' : 'text-rose-300'">
                                    {{ gflAnalysis.gflScore }}
                                </p>
                            </div>
                            <div class="rounded-md border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 p-3 text-center">
                                <p class="text-xs text-slate-500 dark:text-platinum-400">Issues</p>
                                <p class="text-2xl font-semibold text-amber-300">{{ gflAnalysis.totalIssues }}</p>
                            </div>
                            <div class="rounded-md border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 p-3 text-center">
                                <p class="text-xs text-slate-500 dark:text-platinum-400">Status</p>
                                <p class="text-sm font-semibold" :class="gflAnalysis.gflScore >= 70 ? 'text-emerald-300' : 'text-amber-300'">
                                    {{ gflAnalysis.gflScore >= 70 ? 'Clear' : 'Review' }}
                                </p>
                            </div>
                        </div>
                        <div v-if="gflAnalysis.issues.length > 0" class="mt-4 space-y-2">
                            <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">Top Suggestions</p>
                            <div v-for="(issue, idx) in gflAnalysis.issues.slice(0, 4)" :key="idx" class="rounded-md border border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-700 p-3">
                                <div class="flex items-center justify-between gap-3">
                                    <p class="text-sm font-semibold text-slate-700 dark:text-platinum-100">"{{ issue.term }}"</p>
                                    <span class="text-[10px] font-semibold uppercase" :class="issue.severity === 'high' ? 'text-rose-300' : issue.severity === 'medium' ? 'text-amber-300' : 'text-cyan-300'">
                                        {{ issue.severity }}
                                    </span>
                                </div>
                                <p class="text-xs text-slate-500 dark:text-platinum-400">{{ issue.message }}</p>
                                <p class="text-xs text-emerald-600 dark:text-emerald-300">Try: {{ issue.suggestion }}</p>
                            </div>
                        </div>
                        <div v-else class="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-200">
                            Excellent language quality. No issues detected.
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-3">
                        <button
                            @click="submitProposal"
                            :disabled="isSubmitting || !form.title || !form.description || !form.campus_id"
                            class="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span class="inline-flex items-center gap-2">
                                <Send class="w-4 h-4" />
                                {{ isSubmitting ? 'Submitting...' : 'Submit Proposal' }}
                            </span>
                        </button>
                        <button
                            @click="resetForm"
                            class="btn-secondary"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="card p-4">
                        <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-3">Quick Tips</h3>
                        <ul class="space-y-2 text-sm text-slate-600 dark:text-platinum-300">
                            <li>State gender-responsive goals clearly.</li>
                            <li>List measurable outcomes and metrics.</li>
                            <li>Specify target beneficiaries.</li>
                            <li>Use inclusive, neutral language.</li>
                        </ul>
                    </div>
                    <div class="card p-4">
                        <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-3">Before Submit</h3>
                        <ul class="space-y-2 text-sm text-slate-600 dark:text-platinum-300">
                            <li>Validate campus and title.</li>
                            <li>Run language analysis.</li>
                            <li>Prepare supporting document.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div v-if="successMessage" class="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-200">
                <div class="flex items-center gap-2">
                    <CheckCircle2 class="w-4 h-4" />
                    <span>{{ successMessage }}</span>
                </div>
                <p class="text-xs text-emerald-600/80 dark:text-emerald-300/80 mt-1">You can upload supporting documents next.</p>
            </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Zap, Send, CheckCircle2 } from 'lucide-vue-next';
import axios from '@/utils/api';

const form = ref({
    title: '',
    description: '',
    campus_id: ''
});

const campuses = ref([]);
const gflAnalysis = ref(null);
const isSubmitting = ref(false);
const successMessage = ref('');

onMounted(async () => {
    try {
        const response = await axios.get('/api/v1/gad/campuses');
        campuses.value = response.data.campuses;
    } catch (error) {
        console.error('Failed to load campuses:', error);
    }
});

const analyzeLanguage = async () => {
    try {
        const response = await axios.post('/api/v1/gad/analyze-language', {
            text: form.value.description
        });
        gflAnalysis.value = response.data.analysis;
    } catch (error) {
        console.error('Failed to analyze language:', error);
    }
};

const submitProposal = async () => {
    try {
        isSubmitting.value = true;
        const response = await axios.post('/api/v1/gad/proposals/submit', {
            title: form.value.title,
            description: form.value.description,
            campus_id: parseInt(form.value.campus_id)
        });

        successMessage.value = 'Proposal submitted successfully! Admin will review it soon.';
        resetForm();
        gflAnalysis.value = null;

        setTimeout(() => {
            successMessage.value = '';
        }, 5000);
    } catch (error) {
        console.error('Failed to submit proposal:', error);
    } finally {
        isSubmitting.value = false;
    }
};

const resetForm = () => {
    form.value = {
        title: '',
        description: '',
        campus_id: ''
    };
    gflAnalysis.value = null;
};
</script>
