<template>
    <div v-if="total > pageSize"
        class="flex items-center justify-between gap-4 pt-2 border-t border-platinum-200 dark:border-abyss-600">

        <!-- Result count -->
        <p class="field-subtext shrink-0">
            Showing
            <span class="font-medium text-slate-700 dark:text-platinum-200">
                {{ rangeStart }}–{{ rangeEnd }}
            </span>
            of
            <span class="font-medium text-slate-700 dark:text-platinum-200">{{ total }}</span>
            {{ itemLabel }}
        </p>

        <!-- Page controls -->
        <div class="flex items-center gap-1.5">

            <!-- Prev -->
            <button @click="emit('update:modelValue', modelValue - 1)" :disabled="modelValue === 1"
                class="flex items-center justify-center w-9 h-9 rounded-xl border-2 text-sm font-medium transition-all
                       border-platinum-200 dark:border-abyss-500 bg-white dark:bg-abyss-700
                       text-slate-500 dark:text-platinum-400
                       hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700 hover:text-calm-lavender-600 dark:hover:text-calm-lavender-400
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-platinum-200 dark:disabled:hover:border-abyss-500 disabled:hover:text-slate-500">
                <ChevronLeft class="w-4 h-4" />
            </button>

            <!-- Page numbers -->
            <button v-for="page in pageNumbers" :key="page"
                @click="emit('update:modelValue', page)"
                :class="['flex items-center justify-center w-9 h-9 rounded-xl border-2 text-sm font-medium transition-all',
                    page === modelValue
                        ? 'bg-calm-lavender-600 dark:bg-calm-lavender-700 border-calm-lavender-700 dark:border-calm-lavender-600 text-white'
                        : 'bg-white dark:bg-abyss-700 border-platinum-200 dark:border-abyss-500 text-slate-600 dark:text-platinum-300 hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700 hover:text-calm-lavender-600 dark:hover:text-calm-lavender-400']">
                {{ page }}
            </button>

            <!-- Next -->
            <button @click="emit('update:modelValue', modelValue + 1)" :disabled="modelValue === totalPages"
                class="flex items-center justify-center w-9 h-9 rounded-xl border-2 text-sm font-medium transition-all
                       border-platinum-200 dark:border-abyss-500 bg-white dark:bg-abyss-700
                       text-slate-500 dark:text-platinum-400
                       hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700 hover:text-calm-lavender-600 dark:hover:text-calm-lavender-400
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-platinum-200 dark:disabled:hover:border-abyss-500 disabled:hover:text-slate-500">
                <ChevronRight class="w-4 h-4" />
            </button>

        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
    /** Current page (v-model) */
    modelValue: {
        type: Number,
        required: true,
    },
    /** Total number of items */
    total: {
        type: Number,
        required: true,
    },
    /** Items per page */
    pageSize: {
        type: Number,
        default: 10,
    },
    /** Singular/plural label shown in the result count e.g. "rewards" */
    itemLabel: {
        type: String,
        default: 'items',
    },
});

const emit = defineEmits(['update:modelValue']);

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));

const rangeStart = computed(() => (props.modelValue - 1) * props.pageSize + 1);
const rangeEnd = computed(() => Math.min(props.modelValue * props.pageSize, props.total));

// Visible page numbers — max 5 buttons, centred on current page
const pageNumbers = computed(() => {
    const total = totalPages.value;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const current = props.modelValue;
    let start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});
</script>