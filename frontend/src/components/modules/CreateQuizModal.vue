<template>
    <!-- ── Overlay ──────────────────────────────────────────────────
         Block scroll container — modal never cropped on short screens
    ─────────────────────────────────────────────────────────────── -->
    <div
        v-if="isOpen"
        class="fixed inset-0 z-[150] bg-abyss-950/60 backdrop-blur-sm overflow-y-auto py-10 px-4"
        @click.self="$emit('close')"
    >
        <!-- ── Modal shell ──────────────────────────────────────
             L1 layer : platinum-100 / abyss-700
             border-2 border-platinum-300 = stamped boundary
             max-w-7xl — wide canvas for the question grid
        ─────────────────────────────────────────────────────── -->
        <div class="modal-shell animate-modal font-poppins">

            <!-- ── HEADER ─────────────────────────────────────── -->
            <header class="modal-header">
                <div class="flex items-center gap-4">
                    <div class="ds-icon-badge ds-icon-badge--lavender">
                        <ZapIcon class="w-4 h-4" />
                    </div>
                    <div>
                        <p class="section-eyebrow">Quiz Builder</p>
                        <h2 class="font-madimione text-2xl text-abyss-800 dark:text-platinum-100 leading-tight">
                            Create a <span class="brand-gradient-text">Quiz Game</span>
                        </h2>
                    </div>
                </div>
                <button @click="$emit('close')" class="close-btn" aria-label="Close">
                    <XIcon class="w-4 h-4" />
                </button>
            </header>

            <!-- ── BODY ───────────────────────────────────────── -->
            <div class="modal-body custom-scrollbar">

                <!-- Config row ─────────────────────────────────
                     Quiz mode + time limit
                ─────────────────────────────────────────────── -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

                    <div class="space-y-1.5 md:col-span-2">
                        <label class="field-label">Quiz Mode</label>
                        <div class="ds-select-wrap">
                            <select v-model="form.quiz_type" class="ds-select">
                                <option value="time_attack">⏱ Time Attack</option>
                                <option value="streak">🔥 Streak Master</option>
                                <option value="boss_battle">⚔️ Boss Battle</option>
                            </select>
                            <ChevronDownIcon class="ds-select-icon" />
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="field-label">Seconds Per Item</label>
                        <input
                            type="number"
                            v-model="form.time_limit"
                            min="5"
                            max="300"
                            class="input-field placeholder:text-platinum-700 dark:placeholder:text-platinum-400"
                        />
                    </div>

                </div>

                <!-- Question grid ──────────────────────────────
                     Question cards = L2 inset: platinum-200 / abyss-600
                     Add tile = dashed invite at same depth
                ─────────────────────────────────────────────── -->
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">

                    <!-- Question card -->
                    <div
                        v-for="(q, index) in form.questions_data"
                        :key="index"
                        class="q-card"
                    >
                        <!-- Card header -->
                        <div class="flex items-center justify-between mb-5">
                            <div class="flex items-center gap-3">
                                <span class="q-index-badge">#{{ index + 1 }}</span>
                                <span class="font-semibold text-sm text-abyss-800 dark:text-platinum-200">
                                    Question
                                </span>
                            </div>
                            <button
                                @click="removeQuestion(index)"
                                class="remove-btn"
                                title="Remove question"
                            >
                                <XIcon class="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <!-- Question text -->
                        <div class="space-y-1.5 mb-4">
                            <label class="field-label">Question Text</label>
                            <textarea
                                v-model="q.question"
                                rows="2"
                                placeholder="Enter your question here…"
                                class="input-field resize-none placeholder:text-platinum-700 dark:placeholder:text-platinum-400"
                            ></textarea>
                        </div>

                        <!-- Answer choices ──────────────────────
                             L3 deepest inset inside question card
                        ───────────────────────────────────────── -->
                        <div class="space-y-1.5">
                            <label class="field-label">
                                Answer Choices
                                <span class="field-subtext !inline ml-1">(tap the dot to mark correct)</span>
                            </label>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <label
                                    v-for="(opt, optIdx) in 4"
                                    :key="optIdx"
                                    :class="[
                                        'option-row cursor-pointer',
                                        q.correctAnswer === optIdx
                                            ? 'option-row--correct'
                                            : 'option-row--default'
                                    ]"
                                >
                                    <!-- Hidden native radio -->
                                    <input
                                        type="radio"
                                        :name="'correct-' + index"
                                        :value="optIdx"
                                        v-model="q.correctAnswer"
                                        class="sr-only"
                                    />
                                    <!-- Custom radio dot -->
                                    <span
                                        :class="[
                                            'radio-dot shrink-0',
                                            q.correctAnswer === optIdx
                                                ? 'radio-dot--active'
                                                : 'radio-dot--idle'
                                        ]"
                                    ></span>
                                    <!-- Option text input -->
                                    <input
                                        v-model="q.options[optIdx]"
                                        :placeholder="'Choice ' + (optIdx + 1)"
                                        class="w-full bg-transparent border-none outline-none
                                               text-sm font-medium text-abyss-800 dark:text-platinum-200
                                               placeholder:text-platinum-600 dark:placeholder:text-platinum-500"
                                        @click.stop
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Add question tile -->
                    <button
                        @click="addQuestion"
                        class="add-question-tile group"
                    >
                        <div class="ds-icon-badge ds-icon-badge--lavender !p-3 mb-3">
                            <PlusIcon class="w-5 h-5" />
                        </div>
                        <span class="font-semibold text-base text-platinum-600 dark:text-platinum-400
                                     group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400
                                     transition-colors">
                            Add Question
                        </span>
                        <span class="field-subtext mt-1">Click to add a new item</span>
                    </button>

                </div>
            </div>

            <!-- ── FOOTER ─────────────────────────────────────── -->
            <footer class="modal-footer">
                <button
                    type="button"
                    @click="$emit('close')"
                    class="btn-secondary btn-3d--secondary justify-center"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    @click="handleSave"
                    class="btn-primary btn-3d justify-center"
                >
                    <ZapIcon class="w-4 h-4" />
                    Publish Quiz
                </button>
            </footer>

        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useQuizStore } from '@/stores/quiz';
import {
    X as XIcon,
    Zap as ZapIcon,
    ChevronDown as ChevronDownIcon,
    Plus as PlusIcon
} from 'lucide-vue-next';

const props = defineProps(['isOpen', 'moduleId']);
const emit = defineEmits(['close', 'saved']);
const quizStore = useQuizStore();

const form = reactive({
    module_id: props.moduleId,
    title: 'Module Reviewer',
    quiz_type: 'time_attack',
    time_limit: 30,
    questions_data: []
});

const addQuestion = () => {
    form.questions_data.push({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
};

const removeQuestion = (index) => form.questions_data.splice(index, 1);

const handleSave = async () => {
    await quizStore.createQuiz({ ...form, module_id: props.moduleId });
    emit('saved');
    emit('close');
};
</script>

<style scoped>
@reference "@/style.css";

/* ═══════════════════════════════════════════════════════════
   MODAL SHELL  —  L1 layer
   Light : platinum-100 on abyss-950/60 scrim
   Dark  : abyss-700  on abyss-950/60 scrim
═══════════════════════════════════════════════════════════ */
.modal-shell {
    @apply relative w-full max-w-7xl mx-auto flex flex-col;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl overflow-hidden;
}

/* ── Header  (L2 — richer than shell) ────────────────────── */
.modal-header {
    @apply flex items-center justify-between shrink-0;
    @apply px-7 py-5;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-b-2 border-platinum-300 dark:border-abyss-500;
}

/* ── Scrollable body ──────────────────────────────────────── */
.modal-body {
    @apply flex-1 overflow-y-auto px-7 py-6;
}

/* ── Footer  (L2 — mirrors header) ───────────────────────── */
.modal-footer {
    @apply flex items-center justify-end gap-3 shrink-0;
    @apply px-7 py-5;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-t-2 border-platinum-300 dark:border-abyss-500;
}

/* ── Close button ─────────────────────────────────────────── */
.close-btn {
    @apply p-2 rounded-xl shrink-0 transition-all duration-150;
    @apply bg-platinum-300 dark:bg-abyss-500;
    @apply border-2 border-platinum-300 dark:border-abyss-400;
    @apply text-platinum-600 dark:text-platinum-400;
    @apply hover:bg-red-50 dark:hover:bg-red-900/20;
    @apply hover:border-red-200 dark:hover:border-red-800/40;
    @apply hover:text-red-500 dark:hover:text-red-400;
}

/* ═══════════════════════════════════════════════════════════
   ICON BADGE
═══════════════════════════════════════════════════════════ */
.ds-icon-badge {
    @apply p-2.5 rounded-xl border-2 shrink-0 flex items-center justify-center;
}

.ds-icon-badge--lavender {
    @apply bg-calm-lavender-50 dark:bg-calm-lavender-900/20;
    @apply border-calm-lavender-200 dark:border-calm-lavender-800/40;
    @apply text-calm-lavender-600 dark:text-calm-lavender-400;
}

/* ═══════════════════════════════════════════════════════════
   SELECT  —  L2 inset: platinum-200 / abyss-600
═══════════════════════════════════════════════════════════ */
.ds-select-wrap {
    @apply relative;
}

.ds-select {
    @apply w-full appearance-none cursor-pointer transition-all duration-150;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700;
    @apply text-abyss-800 dark:text-platinum-200;
    @apply font-medium text-sm;
    @apply rounded-xl px-4 py-3 pr-10;
    @apply focus:outline-none focus:ring-2 focus:ring-calm-lavender-400/40 focus:border-calm-lavender-400;
}

.ds-select-icon {
    @apply absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none;
    @apply w-4 h-4 text-platinum-500 dark:text-platinum-400;
}

/* ═══════════════════════════════════════════════════════════
   QUESTION CARD  —  L2 inset: platinum-200 / abyss-600
═══════════════════════════════════════════════════════════ */
.q-card {
    @apply p-5 rounded-xl transition-all duration-200;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/60;
}

/* Question index badge */
.q-index-badge {
    @apply inline-flex items-center justify-center w-7 h-7 rounded-lg;
    @apply bg-calm-lavender-100 dark:bg-calm-lavender-900/30;
    @apply border-2 border-calm-lavender-200 dark:border-calm-lavender-800/40;
    @apply text-calm-lavender-700 dark:text-calm-lavender-400;
    @apply text-xs font-bold;
}

/* Remove question button */
.remove-btn {
    @apply p-2 rounded-xl transition-all duration-150;
    @apply bg-platinum-100 dark:bg-abyss-500;
    @apply border-2 border-platinum-300 dark:border-abyss-400;
    @apply text-platinum-500 dark:text-platinum-400;
    @apply hover:bg-red-50 dark:hover:bg-red-900/20;
    @apply hover:border-red-200 dark:hover:border-red-800/40;
    @apply hover:text-red-500 dark:hover:text-red-400;
}

/* ═══════════════════════════════════════════════════════════
   ANSWER OPTION ROW  —  L3 deepest inset
   Default : platinum-50 / abyss-700
   Correct : calm-lavender tint + accent border
═══════════════════════════════════════════════════════════ */
.option-row {
    @apply flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150;
    @apply border-2;
}

.option-row--default {
    @apply bg-platinum-50 dark:bg-abyss-700;
    @apply border-platinum-300 dark:border-abyss-500;
    @apply hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/50;
}

.option-row--correct {
    @apply bg-calm-lavender-50 dark:bg-calm-lavender-900/20;
    @apply border-calm-lavender-300 dark:border-calm-lavender-700;
}

/* Custom radio dot */
.radio-dot {
    @apply w-4 h-4 rounded-full border-2 shrink-0 transition-all duration-150 flex items-center justify-center;
}

.radio-dot--idle {
    @apply border-platinum-400 dark:border-abyss-400 bg-transparent;
}

.radio-dot--active {
    @apply border-calm-lavender-500 bg-calm-lavender-500;
    box-shadow: inset 0 0 0 3px white;
}

/* ═══════════════════════════════════════════════════════════
   ADD QUESTION TILE  —  dashed invite card, same L2 depth
═══════════════════════════════════════════════════════════ */
.add-question-tile {
    @apply w-full min-h-[220px] flex flex-col items-center justify-center gap-1;
    @apply rounded-xl border-2 border-dashed transition-all duration-200;
    @apply bg-platinum-200/50 dark:bg-abyss-600/50;
    @apply border-platinum-400 dark:border-abyss-400;
    @apply hover:bg-calm-lavender-50 dark:hover:bg-calm-lavender-900/10;
    @apply hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700;
}

/* ═══════════════════════════════════════════════════════════
   FLAT-3D BUTTON MODIFIERS
═══════════════════════════════════════════════════════════ */
.btn-3d {
    @apply border-b-4 border-black/10 active:border-b active:translate-y-px;
}

.btn-3d--secondary {
    @apply border-b-4 border-platinum-400 dark:border-abyss-400 active:border-b active:translate-y-px;
}

/* ═══════════════════════════════════════════════════════════
   MODAL ENTRY ANIMATION  —  no blur filter
═══════════════════════════════════════════════════════════ */
.animate-modal {
    animation: modalEntry 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modalEntry {
    from { opacity: 0; transform: scale(0.97) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* ── Scrollbar ───────────────────────────────────────────── */
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply rounded-full bg-platinum-300 dark:bg-abyss-500;
}

/* ── Select option colors (browser default override) ─────── */
select option {
    @apply bg-platinum-50 text-abyss-800;
}

.dark select option {
    @apply bg-abyss-600 text-platinum-100;
}
</style>