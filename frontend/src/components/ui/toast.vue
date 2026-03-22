<template>
    <div
        class="pointer-events-auto relative flex w-full max-w-sm overflow-hidden rounded-[1.2rem] bg-white/80 dark:bg-[#0d0d12]/95 backdrop-blur-md transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-white/5 group custom-font-poppins"
    >
        <div class="absolute left-0 top-0 bottom-0 w-1" :class="currentStyle.barColor"></div>

        <div class="flex-1 p-4 pl-5">
            <div class="flex items-start gap-3">
                <div class="mt-0.5">
                    <component 
                        :is="currentStyle.icon" 
                        size="18" 
                        :class="currentStyle.iconColor" 
                        strokeWidth="3" 
                    />
                </div>

                <div class="flex-1 min-w-0">
                    <p class="text-[12px] font-[700] text-slate-900 dark:text-white/90 leading-tight tracking-tight uppercase italic">
                        {{ toast.message }}
                    </p>
                    <p class="text-[8px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest mt-1 italic">
                        Registry Update // {{ toast.type }}
                    </p>
                </div>
            </div>
        </div>

        <button 
            @click="handleClose" 
            class="flex items-center justify-center px-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group/btn border-l border-slate-100 dark:border-white/5"
            aria-label="Close"
        >
            <XIcon size="14" class="text-slate-300 dark:text-white/20 group-hover/btn:text-purple-600 dark:group-hover/btn:text-white transition-colors" />
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

// Institutional Theme Mapping
const themeConfig = {
    success: {
        icon: CheckCircle2,
        iconColor: 'text-purple-600 dark:text-purple-400',
        barColor: 'bg-purple-600'
    },
    error: {
        icon: AlertCircle,
        iconColor: 'text-red-500',
        barColor: 'bg-red-500'
    },
    warning: {
        icon: AlertTriangle,
        iconColor: 'text-amber-500',
        barColor: 'bg-amber-500'
    },
    info: {
        icon: Info,
        iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
        barColor: 'bg-fuchsia-600'
    }
}

const currentStyle = computed(() => themeConfig[props.toast.type] || themeConfig.info)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&display=swap');

.custom-font-poppins {
    font-family: 'Poppins', sans-serif !important;
}

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