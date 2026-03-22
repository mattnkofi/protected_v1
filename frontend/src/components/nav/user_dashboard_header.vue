<template>
  <header
    class="sticky top-0 z-30 bg-white/90 dark:bg-[#06050a]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 custom-font-poppins transition-all duration-500">
    <div class="h-[2px] w-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 opacity-80"></div>

    <div class="flex items-center justify-between h-16 px-6 lg:px-10">

      <!-- Left: hamburger (mobile only) + breadcrumb -->
      <div class="flex items-center gap-5">
        <button @click="sidebarStore.toggleMobile()"
          class="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-black dark:text-white active:scale-95 transition-all">
          <MenuIcon class="h-5 w-5" />
        </button>

        <nav class="hidden sm:flex items-center space-x-3 text-sm font-black uppercase tracking-widest italic">
          <!-- @TODO Fix Navigation -->
          <router-link :to="{ name: 'user.dashboard' }" class="text-slate-400 hover:text-purple-600 transition-colors">
            Home
          </router-link>
          <ChevronRightIcon class="h-3.5 w-3.5 text-slate-300 dark:text-slate-700" />
          <span class="text-purple-600 dark:text-purple-400">
            {{ currentPageTitle }}
          </span>
        </nav>
      </div>

      <!-- Right: notification bell always visible; profile dropdown only on mobile (sidebar handles it on desktop) -->
      <div class="flex items-center gap-3">
        <NotificationBell />
        <!-- Profile dropdown shown only when sidebar is hidden (mobile breakpoint) -->
        <div class="lg:hidden">
          <ProfileDropdown />
        </div>
      </div>

    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSidebarStore } from '@/stores/stores';
import { MenuIcon, ChevronRightIcon } from 'lucide-vue-next';
import NotificationBell from '@/components/ui/NotificationBell.vue';
import ProfileDropdown from '@/components/nav/user_profile_dropdown.vue';

const route = useRoute();
const sidebarStore = useSidebarStore();

const currentPageTitle = computed(() => route.meta.title || 'Overview');
</script>

<style scoped>
.custom-font-poppins {
  font-family: 'Poppins', sans-serif !important;
}
</style>