<template>
    <header
        class="sticky top-0 z-30 bg-white/90 dark:bg-[#06050a]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 custom-font-poppins transition-all duration-500">
        <div class="h-[2px] w-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 opacity-80"></div>

        <div class="flex items-center justify-between h-16 px-6 lg:px-10">
            <div class="flex items-center gap-5">
                <button @click="sidebarStore.toggleMobile"
                    class="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-black dark:text-white active:scale-95 transition-all">
                    <MenuIcon class="h-5 w-5" />
                </button>

                <nav
                    class="hidden sm:flex items-center space-x-3 text-sm font-black uppercase tracking-widest italic">
                    <router-link :to="{ name: 'admin.dashboard' }"
                        class="text-slate-400 hover:text-purple-600 dark:hover:text-fuchsia-500 transition-colors">
                        HOME
                    </router-link>
                    <ChevronRightIcon class="h-3.5 w-3.5 text-slate-300 dark:text-slate-700" />
                    <span class="text-purple-600 dark:text-fuchsia-400">
                        {{ currentPageTitle }}
                    </span>
                </nav>
            </div>

            <div class="flex items-center gap-3">
                <NotificationBell />
            </div>
        </div>
    </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSidebarStore } from '@/stores/stores';
import {
    MenuIcon,
    ChevronRightIcon
} from 'lucide-vue-next';
import NotificationBell from '@/components/ui/NotificationBell.vue';

const route = useRoute();
const sidebarStore = useSidebarStore();

const currentPageTitle = computed(() => route.meta.title || 'Dashboard');
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700;1,900&display=swap');

.custom-font-poppins {
    font-family: 'Poppins', sans-serif !important;
}

/* Ensure placeholder uses Poppins */
::placeholder {
    font-family: 'Poppins', sans-serif;
    letter-spacing: 0.025em;
}
</style>