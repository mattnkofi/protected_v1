<template>
  <div :class="['relative p-10 rounded-[3rem] border transition-all duration-700 font-[\'Poppins\'] overflow-hidden group hover:-translate-y-4', 
    'bg-white/40 dark:bg-white/[0.03] backdrop-blur-2xl border-white dark:border-white/10 shadow-2xl']">
    
    <div class="absolute -top-16 -right-16 w-48 h-48 bg-purple-600/20 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-1000"></div>
    <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-[40px] animate-pulse"></div>

    <div class="relative z-10 space-y-8">
      <div class="space-y-3">
        <h3 :class="['text-3xl font-[900] uppercase tracking-tighter leading-none transition-colors duration-500 italic', titleClass]">
          {{ title }}
        </h3>
        <div :class="['h-2 w-16 rounded-full transition-all duration-700 group-hover:w-28 shadow-lg', lineClass]"></div>
      </div>
      
      <ul class="space-y-6">
        <li v-for="(item, index) in items" :key="index" 
          class="flex items-start gap-4 text-slate-600 dark:text-slate-300 font-semibold group/item transition-all duration-300 hover:translate-x-3">
          
          <span :class="['flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black mt-0.5 shadow-xl transition-all duration-500 group-hover/item:rotate-12 group-hover/item:scale-110 relative overflow-hidden', badgeClass]">
            <svg class="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
            <div class="absolute top-1 left-1 w-2 h-2 bg-white/40 blur-[1px] rounded-full z-20"></div>
          </span>
          
          <span class="leading-snug opacity-90 group-hover:opacity-100 italic transition-opacity">{{ item }}</span>
        </li>
      </ul>
    </div>

    <div :class="['absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-700', lineClass]"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  variant: { 
    type: String, 
    default: 'purple',
    validator: (v) => ['purple', 'fuchsia', 'fuchsia'].includes(v)
  },
  items: { type: Array, required: true }
});

// Dynamic Title Shades
const titleClass = computed(() => {
  const titles = {
    purple: 'text-purple-600 dark:text-purple-300',
    fuchsia: 'text-fuchsia-600 dark:text-fuchsia-300',
    fuchsia: 'text-fuchsia-600 dark:text-fuchsia-300'
  };
  return titles[props.variant] || titles.purple;
});

// 3D Liquid Line Style
const lineClass = computed(() => {
  const lines = {
    purple: 'bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    fuchsia: 'bg-gradient-to-r from-fuchsia-500 to-violet-500 shadow-[0_0_20px_rgba(232,121,249,0.4)]',
    fuchsia: 'bg-gradient-to-r from-fuchsia-500 to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
  };
  return lines[props.variant] || lines.purple;
});

// 3D Liquid Gem Badge Style
const badgeClass = computed(() => {
  const badges = {
    purple: 'liquid-purple-gem',
    fuchsia: 'liquid-fuchsia-gem',
    fuchsia: 'liquid-fuchsia-gem'
  };
  return badges[props.variant] || badges.purple;
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;900&display=swap');

/* --- LIQUID GEM TEXTURES (3D Physics) --- */
.liquid-purple-gem {
  background: radial-gradient(circle at 35% 35%, #a855f7 0%, #6b21a8 55%, #2e1065 100%);
  box-shadow: inset -3px -3px 8px rgba(0,0,0,0.5), inset 3px 3px 6px rgba(255,255,255,0.3);
}

.liquid-fuchsia-gem {
  background: radial-gradient(circle at 35% 35%, #d946ef 0%, #a21caf 55%, #701a75 100%);
  box-shadow: inset -3px -3px 8px rgba(0,0,0,0.5), inset 3px 3px 6px rgba(255,255,255,0.3);
}

.liquid-fuchsia-gem {
  background: radial-gradient(circle at 35% 35%, #6366f1 0%, #4338ca 55%, #312e81 100%);
  box-shadow: inset -3px -3px 8px rgba(0,0,0,0.5), inset 3px 3px 6px rgba(255,255,255,0.3);
}

/* Physics & Motion */
div, li, span, h3 {
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-pulse {
    animation: pulse-glow 5s ease-in-out infinite;
}

@keyframes pulse-glow {
    0%, 100% { transform: scale(1); opacity: 0.1; }
    50% { transform: scale(1.1); opacity: 0.2; }
}
</style>