<template>
  <div class="group relative p-10 rounded-[3rem] transition-all duration-500 font-['Poppins'] overflow-hidden
    bg-white/40 dark:bg-white/[0.03] backdrop-blur-2xl border border-white dark:border-white/10
    shadow-[0_20px_40px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1)]
    dark:shadow-[0_30px_60px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)]
    hover:-translate-y-4 hover:shadow-[0_40px_80px_rgba(124,58,237,0.2)]">
    
    <div class="relative w-20 h-20 mb-10 rounded-[2rem] flex items-center justify-center transition-all duration-700
      liquid-gem-icon shadow-xl group-hover:scale-110 group-hover:rotate-6">
      
      <div class="absolute top-[15%] left-[15%] w-[35%] h-[35%] bg-white/30 blur-[4px] rounded-full opacity-60"></div>
      
      <svg class="w-10 h-10 text-white drop-shadow-md transition-transform duration-500 group-hover:scale-110" 
        fill="none" 
        stroke="currentColor" 
        :viewBox="viewBox">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" :d="icon" />
      </svg>
    </div>

    <h3 class="text-xl font-[900] text-slate-800 dark:text-white mb-4 uppercase tracking-[0.2em] italic transition-all
      group-hover:text-purple-600 dark:group-hover:text-fuchsia-400">
      {{ title }}
    </h3>
    
    <p class="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed italic transition-colors
      group-hover:text-slate-700 dark:group-hover:text-slate-200">
      {{ description }}
    </p>

    <div class="mt-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
      <div class="flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-fuchsia-500 animate-ping"></div>
        <span class="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 dark:text-fuchsia-400">Initialize Module</span>
      </div>
      <div class="h-1 w-12 liquid-gem-icon rounded-full"></div>
    </div>

    <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  viewBox: { type: String, default: '0 0 24 24' }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;900&display=swap');

/* --- LIQUID GEM PHYSICS --- */
.liquid-gem-icon {
  background: radial-gradient(circle at 35% 35%, #a855f7 0%, #6b21a8 55%, #2e1065 100%);
  box-shadow: 
    inset -4px -4px 12px rgba(0,0,0,0.5),
    inset 4px 4px 10px rgba(255,255,255,0.3),
    0 15px 30px rgba(107, 33, 168, 0.3);
}

/* Dark mode adjustment for deeper depth */
:where(.dark) .liquid-gem-icon {
  background: radial-gradient(circle at 35% 35%, #d810ff 0%, #7d12ff 55%, #150240 100%);
}

/* Smooth Physics Transitions */
div, svg, h3, p {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

h3 {
  text-shadow: 0 10px 20px rgba(0,0,0,0.05);
}

:where(.dark) h3 {
  text-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
</style>