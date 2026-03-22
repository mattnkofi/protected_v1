<template>
    <!-- ── Overlay ──────────────────────────────────────────────
         backdrop-blur-sm scrim — gentle blur + solid dim.
    ─────────────────────────────────────────────────────────── -->
    <div
        class="modal-overlay !z-[200] !bg-abyss-950/60 backdrop-blur-sm !items-start !overflow-y-auto py-10"
        @click.self="$emit('close')"
    >
        <!-- ── Modal panel ─────────────────────────────────────
             L1 layer: platinum-100 / abyss-700
             border-2 border-platinum-300 — "stamped" boundary
        ────────────────────────────────────────────────────── -->
        <div class="modal-shell animate-modal mx-auto">

            <!-- Header ───────────────────────────────────────── -->
            <div class="shrink-0 mb-7">
                <p class="section-eyebrow mb-2">New Classroom</p>
                <h2 class="font-madimione text-3xl text-abyss-800 dark:text-platinum-100 leading-tight">
                    Create a <span class="brand-gradient-text">Classroom</span>
                </h2>
                <p class="field-subtext mt-1.5">
                    Fill in the details below. A unique join code will be generated automatically.
                </p>
            </div>

            <!-- Form ──────────────────────────────────────────── -->
            <form
                @submit.prevent="handleSubmit"
                class="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-1"
            >
                <!-- Classroom name -->
                <div class="space-y-1.5">
                    <label class="field-label">
                        Classroom Name <span class="text-red-400">*</span>
                    </label>
                    <input
                        v-model="form.name"
                        type="text"
                        required
                        placeholder="e.g. Grade 10 — Cybersecurity"
                        class="input-field"
                    />
                </div>

                <!-- Description -->
                <div class="space-y-1.5">
                    <label class="field-label">Description</label>
                    <textarea
                        v-model="form.description"
                        rows="3"
                        placeholder="Enter classroom objectives or a short description…"
                        class="input-field resize-none"
                    ></textarea>
                    <p class="field-subtext">Optional — helps students understand the classroom purpose.</p>
                </div>

                <!-- Info notice ────────────────────────────────
                     L2 inset tile: platinum-200 / abyss-600
                ─────────────────────────────────────────────── -->
                <div class="info-notice">
                    <div class="info-notice__icon">
                        <InfoIcon class="w-4 h-4" />
                    </div>
                    <p class="field-subtext !text-calm-lavender-700 dark:!text-calm-lavender-300">
                        A unique 6-character access code will be auto-generated once the classroom is created.
                    </p>
                </div>
            </form>

            <!-- Actions ──────────────────────────────────────── -->
            <div class="shrink-0 grid grid-cols-2 gap-3 pt-6 border-t-2 border-platinum-200 dark:border-abyss-600 mt-6">
                <button
                    type="button"
                    @click="$emit('close')"
                    class="btn-secondary btn-3d--secondary justify-center"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    @click="handleSubmit"
                    :disabled="props.loading"
                    class="btn-primary btn-3d justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>{{ props.loading ? 'Creating…' : 'Create Classroom' }}</span>
                    <ZapIcon v-if="!props.loading" class="w-4 h-4" />
                </button>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { Info as InfoIcon, Zap as ZapIcon } from 'lucide-vue-next';

const emit = defineEmits(['close', 'created']);
const props = defineProps({ loading: Boolean });

const form = ref({
    name: '',
    description: ''
});

const handleSubmit = () => {
    if (form.value.name?.trim()) {
        emit('created', { ...form.value });
    }
};
</script>

<style scoped>
@reference "@/style.css";

/* ── Modal shell ────────────────────────────────────────────
   L1: platinum-100 panel on the abyss-950/60 scrim
   border-2 border-platinum-300 = "stamped" tactile boundary
   Dark counterpart: abyss-700 on abyss-950/60 scrim
──────────────────────────────────────────────────────────── */
.modal-shell {
    @apply relative w-full max-w-lg flex flex-col;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl p-7;
}

/* ── Info notice (L2 inset) ─────────────────────────────────
   platinum-200 on platinum-100 panel  →  visible depth step
   abyss-600   on abyss-700   panel    →  subtle depth step
──────────────────────────────────────────────────────────── */
.info-notice {
    @apply flex items-start gap-3 p-4 rounded-xl;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-2 border-calm-lavender-200 dark:border-calm-lavender-800/40;
}

.info-notice__icon {
    @apply p-2 rounded-lg shrink-0 flex items-center justify-center;
    @apply bg-calm-lavender-100 dark:bg-calm-lavender-900/30;
    @apply border border-calm-lavender-200 dark:border-calm-lavender-800/40;
    @apply text-calm-lavender-600 dark:text-calm-lavender-400;
}

/* ── Flat-3D button modifiers ───────────────────────────────
   Adds border-b-4 "press depth" on top of the global
   .btn-primary / .btn-secondary from style.css
──────────────────────────────────────────────────────────── */
.btn-3d {
    @apply border-b-4 border-black/10 active:border-b active:translate-y-px;
}

.btn-3d--secondary {
    @apply border-b-4 border-platinum-400 dark:border-abyss-400 active:border-b active:translate-y-px;
}

/* ── Modal entry animation ──────────────────────────────────
   Clean scale+fade — no blur filter
──────────────────────────────────────────────────────────── */
.animate-modal {
    animation: modalEntry 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modalEntry {
    from {
        opacity: 0;
        transform: scale(0.97) translateY(16px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

/* ── Scrollbar ──────────────────────────────────────────────*/
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply rounded-full bg-platinum-300 dark:bg-abyss-500;
}
</style>