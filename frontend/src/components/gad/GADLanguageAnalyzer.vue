<template>
    <div class="page-wrapper animate-in font-mplusrounded">
            <header class="page-header">
                <div class="space-y-2">
                    <p class="section-eyebrow">Language Analysis</p>
                    <h1 class="page-title">GFL Language Analysis</h1>
                    <p class="page-subtitle max-w-2xl">
                        Analyze your text for inclusive language and clear, actionable recommendations.
                    </p>
                </div>
                <div class="flex flex-wrap items-center gap-2 text-xs">
                    <span class="badge badge-lavender">Words: {{ wordCount }}</span>
                    <span class="badge badge-lavender">Chars: {{ inputText.length }}</span>
                    <button @click="loadSample" class="btn-secondary text-xs px-3 py-1.5">Load Sample</button>
                </div>
            </header>

            <section class="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5">
                <div class="space-y-4">
                    <div class="card">
                        <div class="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p class="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-platinum-300">Draft Input</p>
                                <p class="mt-1 text-sm font-medium text-slate-700 dark:text-platinum-200">Paste or type the text you want to review.</p>
                            </div>
                            <div class="flex flex-wrap gap-2 text-xs">
                                <span class="rounded-md border border-rose-400/70 bg-rose-500/10 px-3 py-1 text-rose-700 dark:text-rose-200">
                                    High: {{ analysisResult ? analysisResult.summary.bySeverity.high : 0 }}
                                </span>
                                <span class="rounded-md border border-amber-400/70 bg-amber-500/10 px-3 py-1 text-amber-700 dark:text-amber-200">
                                    Medium: {{ analysisResult ? analysisResult.summary.bySeverity.medium : 0 }}
                                </span>
                                <span class="rounded-md border border-cyan-400/70 bg-cyan-500/10 px-3 py-1 text-cyan-700 dark:text-cyan-200">
                                    Low: {{ analysisResult ? analysisResult.summary.bySeverity.low : 0 }}
                                </span>
                            </div>
                        </div>
                        <textarea
                            v-model="inputText"
                            rows="10"
                            placeholder="Paste text to analyze..."
                            class="mt-5 w-full rounded-xl border border-slate-300 dark:border-abyss-400 bg-white dark:bg-abyss-700 px-4 py-3 text-sm text-slate-800 dark:text-platinum-100 outline-none transition-all duration-200 ease-out focus:border-calm-lavender-500 resize-none"
                        />
                        <div class="mt-4 flex flex-wrap gap-2">
                            <button
                                @click="analyzeText"
                                :disabled="!inputText || isAnalyzing"
                                class="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {{ isAnalyzing ? 'Analyzing...' : 'Analyze Text' }}
                            </button>
                            <button
                                @click="clearText"
                                class="btn-secondary border border-slate-300/80 dark:border-abyss-400/80 text-slate-700 dark:text-white transition-all duration-200 ease-out"
                            >
                                Clear Text
                            </button>
                        </div>
                    </div>

                    <div class="card">
                        <p class="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-platinum-300">Filters</p>
                        <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
                            <button
                                @click="selectedSeverity = 'all'; selectedIssueIndex = 0"
                                class="rounded-lg border px-3 py-2 text-left transition-all duration-200 ease-out"
                                :class="selectedSeverity === 'all' ? 'border-slate-500 bg-slate-100 dark:bg-abyss-700 text-slate-700 dark:text-platinum-100' : 'border-slate-300/80 dark:border-abyss-500/70 text-slate-600 dark:text-platinum-300'"
                            >
                                All Severities
                            </button>
                            <button
                                @click="selectedSeverity = 'high'; selectedIssueIndex = 0"
                                class="rounded-lg border px-3 py-2 text-left transition-all duration-200 ease-out"
                                :class="selectedSeverity === 'high' ? 'border-rose-400 bg-rose-500/10 text-rose-200' : 'border-rose-300/40 text-rose-300/70'"
                            >
                                High Severity
                            </button>
                            <button
                                @click="selectedSeverity = 'medium'; selectedIssueIndex = 0"
                                class="rounded-lg border px-3 py-2 text-left transition-all duration-200 ease-out"
                                :class="selectedSeverity === 'medium' ? 'border-amber-400 bg-amber-500/10 text-amber-200' : 'border-amber-300/40 text-amber-300/70'"
                            >
                                Medium Severity
                            </button>
                            <button
                                @click="selectedSeverity = 'low'; selectedIssueIndex = 0"
                                class="rounded-lg border px-3 py-2 text-left transition-all duration-200 ease-out"
                                :class="selectedSeverity === 'low' ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200' : 'border-cyan-300/40 text-cyan-300/70'"
                            >
                                Low Severity
                            </button>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="card">
                            <p class="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-platinum-300">Overall Score</p>
                            <div class="mt-4 flex items-end justify-between gap-3">
                                <div class="text-5xl font-semibold" :class="analysisResult ? getScoreColor(analysisResult.gflScore) : 'text-slate-300'">
                                    {{ analysisResult ? analysisResult.gflScore : '--' }}
                                </div>
                                <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500">GFL Score</p>
                            </div>
                            <div class="mt-4 h-2.5 rounded-md bg-slate-200 dark:bg-abyss-700">
                                <div
                                    class="h-2.5 rounded-md transition-all"
                                    :style="{ width: analysisResult ? analysisResult.gflScore + '%' : '0%' }"
                                    :class="analysisResult ? getScoreBarColor(analysisResult.gflScore) : 'bg-slate-300'"
                                />
                            </div>
                        </div>

                        <div class="card">
                            <p class="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-platinum-300">Assessment Status</p>
                            <div class="mt-4 rounded-lg border border-slate-300/80 dark:border-abyss-400/90 bg-slate-50 dark:bg-abyss-700/70 p-3 text-xs text-slate-700 dark:text-platinum-200">
                                <p class="uppercase tracking-[0.2em] text-[10px] text-slate-500">Summary</p>
                                <p class="mt-2">
                                    {{ analysisResult ? (analysisResult.gflScore >= 80 ? 'Excellent language quality.' : analysisResult.gflScore >= 60 ? 'Moderate risk. Review the suggestions.' : 'High risk. Address critical terms.') : 'Waiting for analysis.' }}
                                </p>
                            </div>
                            <div class="mt-3 rounded-lg border border-slate-300/80 dark:border-abyss-400/90 bg-white/95 dark:bg-abyss-800/85 p-3 text-xs text-slate-700 dark:text-platinum-200">
                                <p class="uppercase tracking-[0.2em] text-[10px] text-slate-500">Guidance</p>
                                <p class="mt-2">Use neutral titles, avoid gendered roles, and choose inclusive phrasing.</p>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <p class="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-platinum-300">Highlighted Finding</p>
                        <transition name="fade-slide" mode="out-in">
                            <div v-if="selectedIssue" key="highlighted" class="mt-4 space-y-3">
                                <div class="rounded-lg border border-slate-300/80 dark:border-abyss-400/90 bg-slate-50 dark:bg-abyss-700 p-4 transition-all duration-200 ease-out">
                                    <p class="text-sm font-semibold text-slate-800 dark:text-platinum-100">{{ selectedIssue.term }}</p>
                                    <p class="text-xs text-slate-600 dark:text-platinum-300">{{ selectedIssue.message }}</p>
                                </div>
                                <div class="rounded-lg border border-emerald-400/70 bg-emerald-500/20 p-4 text-xs text-emerald-100 transition-all duration-200 ease-out">
                                    Recommendation: {{ selectedIssue.suggestion }}
                                </div>
                                <div class="rounded-lg border border-slate-300/80 dark:border-abyss-400/90 bg-white dark:bg-abyss-800 p-4 text-xs text-slate-600 dark:text-platinum-300 transition-all duration-200 ease-out">
                                    <p class="mb-1 uppercase tracking-[0.2em] text-[10px] text-slate-500">Context</p>
                                    <span>{{ selectedIssue.context.before }}</span><span class="font-semibold text-rose-300">{{ selectedIssue.term }}</span><span>{{ selectedIssue.context.after }}</span>
                                </div>
                            </div>
                            <div v-else key="empty" class="mt-3 text-sm text-slate-600 dark:text-platinum-300">
                                Select an item to view the details.
                            </div>
                        </transition>
                    </div>
                </div>
            </section>

            <section class="card">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h2 class="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-platinum-300">Findings</h2>
                    <p class="text-xs text-slate-600">Select an item to update the highlighted finding.</p>
                </div>
                <div v-if="analysisResult && filteredIssues.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
                    <button
                        v-for="(issue, idx) in filteredIssues"
                        :key="idx"
                        @click="selectedIssueIndex = idx"
                        class="text-left rounded-lg border bg-slate-50 dark:bg-abyss-800/80 px-3 py-3 transition-all duration-200 ease-out hover:-translate-y-0.5"
                        :class="[
                            selectedIssueIndex === idx ? 'border-calm-lavender-400/70' : 'border-slate-300/80 dark:border-abyss-500/60',
                            issue.severity === 'high' ? 'hover:border-rose-400/70' : issue.severity === 'medium' ? 'hover:border-amber-400/70' : 'hover:border-cyan-400/70'
                        ]"
                    >
                        <div class="flex items-center justify-between gap-2">
                            <div class="min-w-0">
                                <p class="text-sm font-semibold text-slate-800 dark:text-platinum-100 truncate">{{ issue.term }}</p>
                                <p class="text-[11px] text-slate-600 dark:text-platinum-300">{{ issue.message }}</p>
                            </div>
                            <span class="text-[10px] font-semibold uppercase" :class="issue.severity === 'high' ? 'text-rose-200' : issue.severity === 'medium' ? 'text-amber-200' : 'text-cyan-200'">
                                {{ issue.severity }}
                            </span>
                        </div>
                        <div class="mt-1.5 text-[11px] text-emerald-700 dark:text-emerald-200">Recommendation: {{ issue.suggestion }}</div>
                        <div class="mt-1 text-[10px] text-slate-500">Position: {{ issue.position.start }}-{{ issue.position.end }}</div>
                    </button>
                </div>
                <div v-else class="rounded-lg border border-emerald-500/40 bg-emerald-500/15 p-4 text-sm text-emerald-700 dark:text-emerald-100 transition-all duration-200 ease-out">
                    No issues were detected for the selected severity.
                </div>
            </section>
    </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: opacity 200ms ease, transform 200ms ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(6px);
}
</style>

<script setup>
import { ref, computed } from 'vue';
import axios from '@/utils/api';

const inputText = ref('');
const analysisResult = ref(null);
const isAnalyzing = ref(false);

const wordCount = computed(() => {
    return inputText.value.trim().split(/\s+/).filter(word => word.length > 0).length;
});

const analyzeText = async () => {
    try {
        isAnalyzing.value = true;
        const response = await axios.post('/api/v1/gad/analyze-language', {
            text: inputText.value
        });
        analysisResult.value = response.data.analysis;
        selectedSeverity.value = 'all';
        selectedIssueIndex.value = 0;
    } catch (error) {
        console.error('Failed to analyze text:', error);
    } finally {
        isAnalyzing.value = false;
    }
};

const clearText = () => {
    inputText.value = '';
    analysisResult.value = null;
    selectedIssueIndex.value = 0;
};

const loadSample = () => {
    inputText.value = 'The chairman asked every student if he could submit his report by Friday. The fireman said the workman will assist the spokeswoman.';
    analysisResult.value = null;
    selectedIssueIndex.value = 0;
    selectedSeverity.value = 'all';
};

const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-rose-400';
};

const getScoreBarColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-rose-500';
};

const selectedSeverity = ref('all');
const selectedIssueIndex = ref(0);

const filteredIssues = computed(() => {
    if (!analysisResult.value) return [];
    if (selectedSeverity.value === 'all') return analysisResult.value.issues;
    return analysisResult.value.issues.filter(issue => issue.severity === selectedSeverity.value);
});

const selectedIssue = computed(() => {
    if (filteredIssues.value.length === 0) return null;
    if (selectedIssueIndex.value < 0 || selectedIssueIndex.value >= filteredIssues.value.length) return filteredIssues.value[0];
    return filteredIssues.value[selectedIssueIndex.value];
});
</script>
