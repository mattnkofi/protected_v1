<!-- src\components\sidebar\sidebar_nav_dropdown.vue -->
<script setup>
import { computed, watch, ref } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
    // 🛑 The 'open' prop is no longer needed if the parent doesn't use v-model.
    // We keep it only if you might occasionally want to override internal control.
    // Since we want internal control, we rely on matchPaths.

    label: {
        type: String,
        required: true,
    },
    matchPaths: {
        type: Array,
        default: () => ([]),
    },
});

const route = useRoute();

// 1. Calculate the initial state based on the URL
const isCurrentRouteMatch = computed(() => {
    // Check if any of the provided match paths start with the current route's path
    return props.matchPaths.some(path => route.path.startsWith(path));
});

// 2. Local state for the dropdown's current status, initialized by the URL match
const isOpen = ref(isCurrentRouteMatch.value);

// 3. Simple internal toggle function
function toggleDropdown() {
    isOpen.value = !isOpen.value;
}
</script>

<template>
    <div class="relative">
        <a href="#" @click.prevent="toggleDropdown" class="flex items-center justify-between px-3 py-2 rounded-lg 
             transition-colors duration-150 dark:text-platinum-300 text-abyss-900 text-sm font-heading font-normal hover:bg-purple-100 dark:hover:bg-abyss-800
             group"
            :class="{ 'text-purple-800 dark:text-purple-500 text-sm font-heading font-normal': isOpen || isCurrentRouteMatch }">
            <div class="flex items-center gap-3">
                <slot name="icon" />
                <span>{{ label }}</span>
            </div>
            <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-90': isOpen }"
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd" />
            </svg>
        </a>

        <Transition name="expand">
            <div v-show="isOpen" class="pl-6 pt-1 pb-1 space-y-1">
                <slot />
            </div>
        </Transition>
    </div>
</template>
