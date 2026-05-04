<template>
  <section id="modules" class="landing-section bg-platinum-100 dark:bg-abyss-950 py-20 px-6">
    <div class="max-w-6xl mx-auto">

      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p class="font-mplusrounded text-xs font-bold uppercase tracking-[0.2em] text-calm-lavender-500 mb-2">Topics</p>
          <h2 class="font-madimione text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight">
            Featured Learning
          </h2>
        </div>
        <button class="bg-white dark:bg-abyss-700 border-2 border-slate-200 dark:border-abyss-500 border-b-[4px] px-5 py-2.5 rounded-xl font-averta font-semibold text-sm text-slate-600 dark:text-platinum-200 hover:-translate-y-0.5 active:border-b-[2px] active:translate-y-[2px] transition-all w-fit">
          View All Topics
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div class="bg-white dark:bg-abyss-700 border-2 border-slate-200 dark:border-abyss-500 border-b-[6px] p-6 rounded-2xl hover:border-calm-lavender-400 transition-colors cursor-pointer group">
          <div class="w-10 h-10 rounded-xl bg-calm-lavender-100 dark:bg-calm-lavender-900/30 flex items-center justify-center mb-4">
            <i class="fa-solid fa-book-open text-calm-lavender-600 dark:text-calm-lavender-400"></i>
          </div>
          <h4 class="font-madimione text-xl text-calm-lavender-600 dark:text-calm-lavender-400 mb-2 group-hover:text-calm-lavender-500">WGAD Awareness</h4>
          <p class="font-averta text-sm text-slate-500 dark:text-platinum-400 leading-relaxed">Understanding Gender and Development (WGAD) basics.</p>
        </div>

        <div class="bg-white dark:bg-abyss-700 border-2 border-slate-200 dark:border-abyss-500 border-b-[6px] p-6 rounded-2xl hover:border-vawc-orange-400 transition-colors cursor-pointer group">
          <div class="w-10 h-10 rounded-xl bg-vawc-orange-100 dark:bg-vawc-orange-900/30 flex items-center justify-center mb-4">
            <i class="fa-solid fa-scale-balanced text-vawc-orange-600 dark:text-vawc-orange-400"></i>
          </div>
          <h4 class="font-madimione text-xl text-vawc-orange-600 dark:text-vawc-orange-400 mb-2 group-hover:text-vawc-orange-500">Legal Rights</h4>
          <p class="font-averta text-sm text-slate-500 dark:text-platinum-400 leading-relaxed">VAWC: Know Your Rights and legal protections.</p>
        </div>

        <div class="bg-white dark:bg-abyss-700 border-2 border-slate-200 dark:border-abyss-500 border-b-[6px] p-6 rounded-2xl hover:border-neon-pink-400 transition-colors cursor-pointer group">
          <div class="w-10 h-10 rounded-xl bg-neon-pink-100 dark:bg-neon-pink-900/30 flex items-center justify-center mb-4">
            <i class="fa-solid fa-heart text-neon-pink-600 dark:text-neon-pink-400"></i>
          </div>
          <h4 class="font-madimione text-xl text-neon-pink-600 dark:text-neon-pink-400 mb-2 group-hover:text-neon-pink-500">Sex Ed</h4>
          <p class="font-averta text-sm text-slate-500 dark:text-platinum-400 leading-relaxed">Safe Relationships and understanding consent.</p>
        </div>

        <div class="bg-white dark:bg-abyss-700 border-2 border-slate-200 dark:border-abyss-500 border-b-[6px] p-6 rounded-2xl hover:border-safety-teal-400 transition-colors cursor-pointer group">
          <div class="w-10 h-10 rounded-xl bg-safety-teal-100 dark:bg-safety-teal-900/30 flex items-center justify-center mb-4">
            <i class="fa-solid fa-handshake text-safety-teal-600 dark:text-safety-teal-400"></i>
          </div>
          <h4 class="font-madimione text-xl text-safety-teal-600 dark:text-safety-teal-400 mb-2 group-hover:text-safety-teal-500">Support Systems</h4>
          <p class="font-averta text-sm text-slate-500 dark:text-platinum-400 leading-relaxed">How to access community services for help.</p>
        </div>

      </div>

      <div class="flex flex-col sm:flex-row items-center gap-4 justify-center border-t border-slate-200 dark:border-abyss-600 pt-10">

        <button
          @click="handleMainAction"
          class="font-averta font-bold text-sm uppercase tracking-wider px-6 py-3 rounded-xl bg-calm-lavender-500 hover:bg-calm-lavender-400 text-white border-2 border-calm-lavender-700 border-b-[4px] active:border-b-[2px] active:translate-y-[2px] transition-all flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          {{ authStore.isAuthenticated ? 'Go to My Dashboard' : 'Join the Community' }}
        </button>

        <a
          href="#features"
          class="font-averta font-semibold text-sm px-6 py-3 rounded-xl text-slate-600 dark:text-platinum-300 border-2 border-slate-200 dark:border-abyss-500 hover:border-calm-lavender-300 hover:text-calm-lavender-600 transition-all"
        >
          See what's inside
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router    = useRouter();
const authStore = useAuthStore();

const handleMainAction = () => {
  if (authStore.isAuthenticated) {
    const role = authStore.user?.role;
    if (role === 'admin') router.push({ name: 'admin.dashboard' });
    else if (['educator', 'moderator'].includes(role)) router.push({ name: 'facilitator.dashboard' });
    else router.push({ name: 'user.dashboard' });
  } else {
    router.push({ name: 'signup' });
  }
};
</script>