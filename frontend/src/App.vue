<template>
  <div class="min-h-screen bg-[#020203] font-['Poppins'] text-white antialiased relative">
    
    <AIChatbot />

    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <ToastContainer />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia'; // Import ito para sa reactivity
import { useAuthStore } from '@/stores/auth';
import ToastContainer from '@/components/ui/toast_container.vue';
import AIChatbot from '@/components/ui/AIChatbot.vue';

const authStore = useAuthStore();
// Gamitin ang storeToRefs para ma-detect ng Vue kapag nag-login/logout ka
const { isLoggedIn } = storeToRefs(authStore);

onMounted(async () => {
    // I-restore ang session kapag ni-refresh ang page
    if (!authStore.user) {
        await authStore.restoreSession();
    }
});
</script>

<style>
/* Siguraduhin na ang transition ay hindi nakaka-block sa UI */
.page-enter-active, .page-leave-active {
  transition: opacity 0.2s ease;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
}
</style>