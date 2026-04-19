<template>
  <header
    class="sticky top-0 z-30 bg-white/90 dark:bg-[#06050a]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 custom-font-poppins transition-all duration-500"
  >
    <div class="h-[2px] w-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 opacity-80"></div>

    <div class="flex items-center justify-between h-16 px-6 lg:px-10">
      <div class="flex items-center gap-5">
        <button @click="sidebarStore.toggleMobile"
          class="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-black dark:text-white active:scale-95 transition-all"
        >
          <MenuIcon class="h-5 w-5" />
        </button>

        <nav class="hidden sm:flex items-center space-x-3 text-sm font-black uppercase tracking-widest">
          <router-link :to="{ name: 'facilitator.dashboard' }"
            class="text-slate-400 hover:text-purple-600 transition-colors font-poppins"
          >
            Home
          </router-link>
          <ChevronRightIcon class="h-3.5 w-3.5 text-slate-300 dark:text-slate-700" />
          <span class="text-purple-600 dark:text-purple-400">
            {{ currentPageTitle }}
          </span>
        </nav>
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-3">
        <NotificationBell :filterTypes="['classroom', 'quiz', 'system']"/>
      </div>
    </div>

    <transition name="modal-fade">
      <div v-if="showLogoutModal" 
        class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md"
      >
        <div class="bg-white dark:bg-[#0d0d12] border border-slate-200 dark:border-white/10 p-10 rounded-[2.5rem] max-w-sm w-full shadow-2xl animate-vessel relative overflow-hidden text-center">
          
          <div class="w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800/30 rounded-3xl flex items-center justify-center mb-6 mx-auto text-red-500 shadow-lg">
            <LogOutIcon class="h-10 w-10" />
          </div>
          
          <h3 class="text-2xl font-black text-black dark:text-white mb-3 font-poppins">Sign Out?</h3>
          <p class="text-slate-500 dark:text-slate-400 mb-10 text-sm font-medium font-poppins leading-relaxed">Are you sure you want to sign out of your account?</p>
          
          <div class="flex gap-3">
            <button @click="showLogoutModal = false"
              class="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm font-poppins transition-all hover:bg-slate-200 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
            >No</button>
            <button @click="handleLogout"
              class="flex-1 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-bold text-sm font-poppins transition-all shadow-lg hover:shadow-xl"
            >Sign Out</button>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSidebarStore } from '@/stores/stores';
import { useAuthStore } from '@/stores/auth';
import {
  MenuIcon,
  ChevronRightIcon,
  LogOutIcon
} from 'lucide-vue-next';
import NotificationBell from '@/components/ui/NotificationBell.vue';

const route = useRoute();
const router = useRouter();
const sidebarStore = useSidebarStore();
const authStore = useAuthStore();

const showLogoutModal = ref(false);

const currentPageTitle = computed(() => route.meta.title || 'Overview');

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push({ name: 'login' });
  } catch (error) {
    showLogoutModal.value = false;
  }
};
</script>

<style scoped>
.custom-font-poppins { font-family: 'Poppins', sans-serif !important; }

.btn-3d-purple {
  background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%);
  box-shadow: 0 8px 15px -4px rgba(124, 58, 237, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.btn-3d-red {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  box-shadow: 0 8px 15px -4px rgba(239, 68, 68, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.animate-vessel {
  animation: vesselSlide 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes vesselSlide {
  from { opacity: 0; transform: translateY(15px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.4s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
