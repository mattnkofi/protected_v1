<template>
    <div class="min-h-screen bg-slate-50 dark:bg-abyss-900 custom-font-poppins text-black dark:text-white relative selection:bg-purple-500/30 transition-colors duration-500">
        
        
        <FacilitatorSidebar />

        <div class="relative z-10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] min-h-screen flex flex-col" 
             :class="sidebarStore.isExpanded ? 'lg:pl-72' : 'lg:pl-22'">
            
            <FacilitatorHeader />

            <main class="flex-1 p-4 lg:p-8 relative">
                <div class="max-w-[1600px] mx-auto w-full">
                    <router-view v-slot="{ Component }">
                        <transition name="layout-shift" mode="out-in">
                            <component :is="Component" />
                        </transition>
                    </router-view>
                </div>
            </main>

            <footer class="px-8 py-6 opacity-40">
                <div class="flex items-center gap-3">
                    <div class="h-px w-6 bg-slate-300 dark:bg-white/10"></div>
                    <p class="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
                        Authorized Console <span class="mx-2 text-slate-200">|</span> 
                        <span class="text-purple-600 dark:text-purple-400">ProtectEd Systems</span>
                    </p>
                </div>
            </footer>
        </div>
    </div>
</template>

<script setup>
import { useSidebarStore } from '@/stores/stores'; 
import FacilitatorSidebar from '@/components/facilitator/FacilitatorSidebar.vue';
import FacilitatorHeader from '@/components/facilitator/FacilitatorHeader.vue';

const sidebarStore = useSidebarStore();
</script>

<style scoped>
.custom-font-poppins { font-family: 'Poppins', sans-serif !important; }

/* SMOOTH TRANSITION BETWEEN VIEWS */
.layout-shift-enter-active,
.layout-shift-leave-active {
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.layout-shift-enter-from {
    opacity: 0;
    transform: scale(0.99) translateY(10px);
}

.layout-shift-leave-to {
    opacity: 0;
    transform: scale(1.01) translateY(-10px);
}

/* Optimization for dense layouts */
main {
    will-change: transform, opacity;
}
</style>