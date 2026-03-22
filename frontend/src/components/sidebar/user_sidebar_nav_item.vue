<!-- src/components/sidebar/sidebar_nav_item.vue -->
<script setup>
import { computed } from 'vue'
import { RouterLink, useLink } from 'vue-router'

const props = defineProps({
    to: { type: [String, Object], required: true },
    exact: { type: Boolean, default: false },
    badge: { type: [String, Number, null], default: null },
    title: { type: String, default: '' }
})

// useLink gives you router-aware reactivity for free
const { isActive, isExactActive } = useLink({ to: props.to })

const activeClass = computed(() =>
    (props.exact ? isExactActive.value : isActive.value)
        ? 'border border-0 border-l-4 dark:border-platinum-300 border-abyss-900 dark:text-platinum-300 bg-purple-300 dark:bg-purple-800 text-abyss-900 text-sm font-heading font-normal hover:bg-purple-100 dark:hover:bg-purple-600'
        : 'dark:text-platinum-300 text-abyss-900 text-sm font-heading font-normal'
)
const ariaCurrent = computed(() =>
    (props.exact ? isExactActive.value : isActive.value) ? 'page' : undefined
)
</script>

<template>
    <RouterLink :to="to"
        class="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-sun-100 dark:hover:bg-abyss-800"
        :class="activeClass" :aria-current="ariaCurrent">
        <slot name="icon" />
        <span class="flex-1 truncate font-body">
            {{ title }}
            <slot />
        </span>

        <!-- Badge slot with fallback to prop -->
        <span v-if="badge !== null || $slots.badge"
            class="rounded-full px-2 py-0.5 text-xs font-medium text-abyss-900 bg-sun-500">
            <slot name="badge">{{ badge }}</slot>
        </span>
    </RouterLink>
</template>
