<template>
    <div
        class="pointer-events-auto relative flex w-full max-w-sm overflow-hidden rounded-2xl bg-white dark:bg-abyss-600 transition-all duration-300 shadow-lg dark:shadow-2xl border border-slate-200 dark:border-abyss-500 group">
        <!-- Colored accent bar with rounded ends -->
        <div class="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-xl" :class="currentStyle.barColor"></div>

        <div class="flex-1 p-5 pl-5">
            <div class="flex items-start gap-3">
                <div class="mt-0.5 shrink-0 p-2 rounded-lg" :class="currentStyle.iconBg">
                    <component :is="currentStyle.icon" size="18" :class="currentStyle.iconColor" strokeWidth="2.5" />
                </div>

                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-abyss-800 dark:text-platinum-100 leading-tight">
                        {{ toast.message }}
                    </p>
                    <p
                        class="text-xs font-medium text-platinum-600 dark:text-platinum-500 uppercase tracking-wide mt-1">
                        {{ toast.type }}
                    </p>
                </div>
            </div>
        </div>

        <button @click="handleClose"
            class="flex items-center justify-center px-4 hover:bg-slate-50 dark:hover:bg-abyss-500 transition-colors group/btn border-l border-slate-200 dark:border-abyss-500 shrink-0"
            aria-label="Close notification">
            <XIcon size="16"
                class="text-platinum-600 dark:text-platinum-400 group-hover/btn:text-calm-lavender-600 dark:group-hover/btn:text-calm-lavender-400 transition-colors" />
        </button>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    X as XIcon
} from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
const props = defineProps({
    toast: {
        type: Object,
        required: true
    }
})

const handleClose = () => {
    toastStore.removeToast(props.toast.id)
}
// Semantic Theme Mapping
const themeConfig = {
    success: {
        icon: CheckCircle2,
        iconColor: 'text-green-600 dark:text-green-400',
        iconBg: 'bg-green-50 dark:bg-green-900/30',
        barColor: 'bg-green-600'
    },
    error: {
        icon: AlertCircle,
        iconColor: 'text-red-600 dark:text-red-400',
        iconBg: 'bg-red-50 dark:bg-red-900/30',
        barColor: 'bg-red-600'
    },
    warning: {
        icon: AlertTriangle,
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        iconBg: 'bg-yellow-50 dark:bg-yellow-900/30',
        barColor: 'bg-yellow-600'
    },
    info: {
        icon: Info,
        iconColor: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-50 dark:bg-blue-900/30',
        barColor: 'bg-blue-600'
    }
}

const currentStyle = computed(() => themeConfig[props.toast.type] || themeConfig.info)
</script>

<style scoped>
@keyframes slideIn {
    from {
        transform: translateX(30px) scale(0.95);
        opacity: 0;
        filter: blur(8px);
    }

    to {
        transform: translateX(0) scale(1);
        opacity: 1;
        filter: blur(0);
    }
}

.pointer-events-auto {
    animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
