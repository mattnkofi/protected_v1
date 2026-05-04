<template>
  <section id="dashboard" class="landing-section bg-white dark:bg-abyss-900 py-20 px-6">
    <div class="max-w-6xl mx-auto space-y-16">

      <div class="grid lg:grid-cols-2 gap-10 items-center">
        <div class="space-y-6">
          <p class="font-mplusrounded text-xs font-bold uppercase tracking-[0.2em] text-calm-lavender-500">Your Progress</p>
          <h2 class="font-madimione text-3xl md:text-5xl text-slate-900 dark:text-white tracking-tight">Your Advocacy Hub</h2>

          <div class="bg-calm-lavender-600 text-white border-2 border-calm-lavender-800 border-b-[6px] p-6 rounded-3xl relative">
            <div class="absolute -top-3 -left-3 bg-neon-pink-500 border-2 border-white rounded-full p-2 text-xl">
              <i class="fa-solid fa-lightbulb"></i>
            </div>
            <p class="font-averta text-lg font-semibold leading-relaxed ml-4">
              "Consent is a clear, voluntary, and enthusiastic agreement... It can be withdrawn at any time."
            </p>
            <p class="font-mplusrounded text-xs uppercase mt-4 opacity-80 tracking-wider ml-4">Daily Fact</p>
          </div>

          <div class="flex gap-4">
            <div class="flex-1 bg-white dark:bg-abyss-800 border-2 border-slate-200 dark:border-abyss-600 border-b-[6px] p-4 rounded-2xl text-center">
              <span class="block font-madimione text-3xl text-calm-lavender-600 dark:text-calm-lavender-400">Lvl 5</span>
              <span class="font-mplusrounded font-bold text-xs text-slate-400 uppercase tracking-widest mt-1">Progress</span>
            </div>
            <div class="flex-1 bg-white dark:bg-abyss-800 border-2 border-slate-200 dark:border-abyss-600 border-b-[6px] p-4 rounded-2xl text-center">
              <span class="block font-madimione text-3xl text-vawc-orange-500">12</span>
              <span class="font-mplusrounded font-bold text-xs text-slate-400 uppercase tracking-widest mt-1">Badges</span>
            </div>
          </div>
        </div>

        <div class="bg-platinum-50 dark:bg-abyss-800 border-2 border-slate-200 dark:border-abyss-600 border-b-[8px] rounded-3xl p-6 md:p-8">
          <div class="flex justify-between items-end mb-6">
            <h3 class="font-madimione text-2xl text-slate-800 dark:text-white uppercase tracking-wide">Global Rank</h3>
            <span class="font-madimione text-3xl text-calm-lavender-500">#42</span>
          </div>

          <div class="space-y-3">
            <div class="flex justify-between bg-white dark:bg-abyss-700 border-2 border-calm-lavender-300 dark:border-calm-lavender-700 border-b-[4px] p-4 rounded-2xl">
              <span class="font-averta font-semibold text-slate-800 dark:text-white">1. Jordan_CCS</span>
              <span class="font-averta font-bold text-calm-lavender-600 dark:text-calm-lavender-400">12,450 XP</span>
            </div>
            <div class="flex justify-between bg-slate-100 dark:bg-abyss-600 border-2 border-slate-200 dark:border-abyss-500 border-b-[4px] p-4 rounded-2xl">
              <span class="font-averta font-semibold text-slate-500 dark:text-platinum-400">2. Advocate_Aron</span>
              <span class="font-averta font-bold text-slate-500 dark:text-platinum-400">11,200 XP</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-safety-teal-500 border-2 border-safety-teal-700 border-b-[8px] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden">

        <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white opacity-10 rounded-full pointer-events-none"></div>

        <div class="max-w-xl relative z-10">
          <h2 class="font-madimione text-3xl md:text-5xl mb-4 tracking-tight">Have a question? <br/> Ask Lumina!</h2>
          <p class="font-averta text-base md:text-lg font-medium opacity-95 leading-relaxed">
            Your private AI companion for WGAD, VAWC, and Sex Ed questions. Secure, encrypted, and always online to help you understand your rights.
          </p>
        </div>

        <button
          @click="openLuminaChat"
          class="shrink-0 bg-white border-2 border-slate-200 border-b-[6px] hover:bg-slate-50 active:border-b-[2px] active:translate-y-[4px] text-safety-teal-600 font-madimione text-xl uppercase tracking-wider px-8 py-4 rounded-2xl transition-all relative z-10"
        >
          Chat Now
        </button>
      </div>

    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router    = useRouter();
const authStore = useAuthStore();

const openLuminaChat = () => {
  if (authStore.isAuthenticated) {
    const role = authStore.user?.role;
    if (role === 'admin') router.push({ name: 'admin.dashboard' });
    else if (['educator', 'moderator'].includes(role)) router.push({ name: 'facilitator.dashboard' });
    else router.push({ name: 'user.dashboard' });
  } else {
    router.push({ name: 'login' });
  }
};
</script>