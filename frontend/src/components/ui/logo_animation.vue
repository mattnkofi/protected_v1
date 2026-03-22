<template>
    <div class="flex flex-col items-center justify-center custom-font-poppins">
        <div class="logo-container mb-6 transform transition-all duration-700" :class="[animationClass, statusColorClass]">
            <svg class="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl" viewBox="0 0 500 416" xmlns="http://www.w3.org/2000/svg">
                <g class="transition-all duration-500">
                    <path
                        d="m0,0h159.81l91.66,295.44L340.78,0h159.22l-115.77,415.98h-14.08l35.15-337.61-99.19,337.61h-111.63L91.8,74.3l38.63,341.68h-12.33L0,0Z"
                        fill="currentColor" />
                    <polygon points="470.72 328.42 456.73 328.42 431.91 415.98 459.89 415.98 470.72 328.42"
                        fill="currentColor" />
                    <polygon points="27.73 328.42 41.72 328.42 66.54 415.98 38.56 415.98 27.73 328.42"
                        fill="currentColor" />
                    <polygon points="250 102.76 218.21 0 281.79 0 250 102.76" fill="currentColor" />
                </g>
            </svg>
        </div>
        
        <div class="flex flex-col items-center gap-1">
            <span class="text-2xl md:text-3xl font-[900] uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                Protect<span class="text-purple-600 dark:text-purple-500">Ed</span>
            </span>
            <div class="h-1 w-8 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full shadow-[0_2px_10px_rgba(139,92,246,0.4)]"></div>
            <p v-if="status === 'loading'" class="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-gray-600 mt-3 animate-pulse italic">
                Synchronizing Registry...
            </p>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    status: {
        type: String,
        default: 'loading' // 'loading', 'success', 'error'
    }
});

const animationClass = computed(() => {
    return props.status === 'loading' ? 'animate-neural-pulse' : 'scale-100 opacity-100';
});

const statusColorClass = computed(() => {
    if (props.status === 'error') {
        return 'text-rose-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]';
    }
    if (props.status === 'success') {
        return 'text-violet-500 drop-shadow-[0_0_15px_rgba(139,92,246,0.4)]';
    }
    // Default Institutional Purple
    return 'text-purple-600 dark:text-purple-500';
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700;1,900&display=swap');

.custom-font-poppins {
    font-family: 'Poppins', sans-serif !important;
}

/* Institutional Neural Pulse Animation */
@keyframes neural-pulse {
    0%, 100% {
        transform: scale(1);
        filter: drop-shadow(0 0 5px rgba(124, 58, 237, 0.3));
    }
    50% {
        transform: scale(1.08);
        filter: drop-shadow(0 0 20px rgba(124, 58, 237, 0.6)) drop-shadow(0 0 40px rgba(139, 92, 246, 0.2));
    }
}

.animate-neural-pulse {
    animation: neural-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* SVG currentColor ensures it works with tailwind text colors */
svg {
    fill: currentColor;
    transition: all 0.5s ease-in-out;
}
</style>