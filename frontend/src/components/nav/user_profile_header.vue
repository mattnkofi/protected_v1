<template>
    <header
        class="sticky top-0 z-30 bg-white/90 dark:bg-[#06050a]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 custom-font-poppins transition-all duration-500">
        <div class="h-[2px] w-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 opacity-80"></div>

        <div class="flex items-center justify-between h-16 px-6 lg:px-10 max-w-5xl mx-auto w-full">

            <!-- Left: back to dashboard + page title -->
            <div class="flex items-center gap-5">
                <router-link :to="{ name: 'user.dashboard' }"
                    class="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-platinum-300 hover:text-calm-lavender-600 dark:hover:text-calm-lavender-400 active:scale-95 transition-all">
                    <LayoutDashboardIcon class="h-4 w-4" />
                </router-link>

                <nav
                    class="hidden sm:flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest italic">
                    <router-link :to="{ name: 'user.dashboard' }"
                        class="text-slate-400 hover:text-purple-600 transition-colors">
                        Dashboard
                    </router-link>
                    <ChevronRightIcon class="h-2.5 w-2.5 text-slate-300 dark:text-slate-700" />
                    <span class="text-purple-600 dark:text-purple-400">
                        {{ currentPageTitle }}
                    </span>
                </nav>
            </div>

            <!-- Right: notification bell + profile dropdown -->
            <div class="flex items-center gap-3">
                <NotificationBell />
                <ProfileDropdown />
            </div>
        </div>
    </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { LayoutDashboard as LayoutDashboardIcon, ChevronRight as ChevronRightIcon } from 'lucide-vue-next';
import NotificationBell from '@/components/ui/NotificationBell.vue';
import ProfileDropdown from '@/components/nav/user_profile_dropdown.vue';

const route = useRoute();
const currentPageTitle = computed(() => route.meta.title || 'Account');
</script>

<style scoped>
.custom-font-poppins {
    font-family: 'Poppins', sans-serif !important;
}
</style>