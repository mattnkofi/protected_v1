<template>
    <Teleport to="body">
        <Transition name="confirm-fade">
            <div
                v-if="isOpen"
                class="fixed inset-0 z-[300] bg-abyss-950/60 backdrop-blur-sm
                       flex items-start justify-center pt-24 px-6 pb-6 overflow-y-auto"
                @click.self="onCancel"
            >
                <div class="confirm-shell animate-modal font-poppins">

                    <!-- Icon stamp -->
                    <div :class="['icon-stamp mx-auto mb-6', iconStampClass]">
                        <component :is="iconComponent" class="w-7 h-7" />
                    </div>

                    <!-- Copy -->
                    <div class="text-center space-y-2.5 mb-6">
                        <h3 class="font-madimione text-2xl text-abyss-800 dark:text-platinum-100 leading-tight">
                            {{ title }}
                        </h3>
                        <p class="font-poppins text-base text-platinum-700 dark:text-platinum-400 leading-relaxed px-2">
                            <!-- Slot for custom message, falls back to message prop -->
                            <slot>{{ message }}</slot>
                        </p>
                    </div>

                    <!-- Optional warning notice (shown for danger variant) -->
                    <div v-if="variant === 'danger' && warningText" class="warning-notice mb-7">
                        <p class="field-subtext !text-red-600 dark:!text-red-400 text-center">
                            {{ warningText }}
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3">
                        <button
                            type="button"
                            @click="onCancel"
                            class="btn-secondary flex-1 justify-center"
                            :class="cancelBtnClass"
                        >
                            {{ cancelLabel }}
                        </button>
                        <button
                            type="button"
                            @click="onConfirm"
                            :disabled="loading"
                            class="flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            :class="confirmBtnClass"
                        >
                            <component v-if="!loading" :is="iconComponent" class="w-4 h-4" />
                            <span v-if="loading" class="spinner !w-4 !h-4 !border-2 !border-white/30 !border-t-white"></span>
                            {{ loading ? loadingLabel : confirmLabel }}
                        </button>
                    </div>

                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-vue-next';

const props = defineProps({
    /** Controls visibility */
    isOpen:       { type: Boolean, default: false },

    /**
     * 'danger'  — red destructive (delete)
     * 'warning' — orange cautionary
     * 'info'    — lavender neutral confirmation
     */
    variant:      { type: String, default: 'danger' },

    /** Modal heading */
    title:        { type: String, default: 'Are you sure?' },

    /** Body text (overridden by default slot) */
    message:      { type: String, default: 'This action cannot be undone.' },

    /** Extra warning line shown only on danger variant */
    warningText:  { type: String, default: '' },

    cancelLabel:  { type: String, default: 'Cancel' },
    confirmLabel: { type: String, default: 'Confirm' },
    loadingLabel: { type: String, default: 'Processing…' },

    /** Show spinner + disable confirm button while async work runs */
    loading:      { type: Boolean, default: false },
});

const emit = defineEmits(['confirm', 'cancel']);

const onConfirm = () => emit('confirm');
const onCancel  = () => emit('cancel');

// ── Variant-driven computed styles ────────────────────────────

const iconComponent = computed(() => {
    if (props.variant === 'danger')  return Trash2;
    if (props.variant === 'warning') return AlertTriangle;
    return Info;
});

const iconStampClass = computed(() => ({
    'danger':  'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40 text-red-500 dark:text-red-400',
    'warning': 'bg-vawc-orange-50 dark:bg-vawc-orange-900/20 border-vawc-orange-200 dark:border-vawc-orange-800/40 text-vawc-orange-600 dark:text-vawc-orange-400',
    'info':    'bg-calm-lavender-50 dark:bg-calm-lavender-900/20 border-calm-lavender-200 dark:border-calm-lavender-800/40 text-calm-lavender-600 dark:text-calm-lavender-400',
}[props.variant]));

const confirmBtnClass = computed(() => ({
    'danger':  'btn-danger  btn-3d--danger',
    'warning': 'btn-primary btn-3d--warning',
    'info':    'btn-primary btn-3d',
}[props.variant]));

const cancelBtnClass = computed(() => 'btn-3d--secondary');
</script>

<style scoped>
@reference "@/style.css";

/* ═══════════════════════════════════════════════════════════
   CONFIRM SHELL  —  L1 layer, narrow width
   Light : platinum-100 on abyss-950/60 scrim
   Dark  : abyss-700  on abyss-950/60 scrim
═══════════════════════════════════════════════════════════ */
.confirm-shell {
    @apply relative w-full max-w-sm;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl p-8;
}

/* ── Icon stamp ───────────────────────────────────────────── */
.icon-stamp {
    @apply w-14 h-14 rounded-2xl flex items-center justify-center border-2;
}

/* ── Warning notice (danger variant only) ─────────────────── */
.warning-notice {
    @apply px-4 py-3 rounded-xl;
    @apply bg-red-50 dark:bg-red-900/10;
    @apply border-2 border-red-200 dark:border-red-800/30;
}

/* ═══════════════════════════════════════════════════════════
   FLAT-3D BUTTON MODIFIERS
═══════════════════════════════════════════════════════════ */
.btn-3d {
    @apply border-b-4 border-black/10 active:border-b active:translate-y-px;
}

.btn-3d--secondary {
    @apply border-b-4 border-platinum-400 dark:border-abyss-400
           active:border-b active:translate-y-px;
}

.btn-3d--danger {
    @apply border-b-4 border-red-700 dark:border-red-900
           active:border-b active:translate-y-px;
}

.btn-3d--warning {
    @apply border-b-4 border-vawc-orange-600 dark:border-vawc-orange-800
           active:border-b active:translate-y-px;
}

/* ═══════════════════════════════════════════════════════════
   ENTRY ANIMATION
═══════════════════════════════════════════════════════════ */
.animate-modal {
    animation: modalEntry 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modalEntry {
    from { opacity: 0; transform: scale(0.97) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
}

.confirm-fade-enter-active,
.confirm-fade-leave-active { transition: opacity 0.2s ease; }
.confirm-fade-enter-from,
.confirm-fade-leave-to     { opacity: 0; }
</style>
