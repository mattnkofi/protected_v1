<template>
  <section id="impact" class="relative py-32 px-6 overflow-hidden transition-all duration-1000 bg-[#fdfcff] dark:bg-[#04020a] font-['Poppins',_sans-serif]">
    
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.04)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_50%_50%,#0f0524_0%,#04020a_100%)]"></div>
    
    <div v-for="(orb, i) in backgroundOrbs" :key="'impact-orb-'+i"
      class="absolute rounded-full liquid-orb-bg animate-float pointer-events-none"
      :style="{
        width: orb.size + 'px',
        height: orb.size + 'px',
        left: orb.left + '%',
        top: orb.top + '%',
        animationDelay: orb.delay + 's',
        opacity: orb.opacity,
        filter: `blur(${orb.blur}px)`,
        zIndex: 1
      }">
      <div class="absolute top-[15%] left-[15%] w-[35%] h-[35%] bg-white/20 blur-[6px] rounded-full"></div>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      
      <div class="text-center mb-28 space-y-6">
        <h2 class="text-5xl md:text-8xl font-[900] text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none drop-shadow-2xl">
          Real-World <span class="text-transparent bg-clip-text bg-gradient-to-br from-purple-600 via-fuchsia-500 to-fuchsia-600 dark:from-fuchsia-400 dark:via-purple-400 dark:to-fuchsia-300">Impact</span>
        </h2>
        
        <p class="text-base md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium italic leading-relaxed">
          Designed to educate, predict, and prevent violence through a technical and interactive awareness protocol.
        </p>
        
        <div class="h-2 w-40 liquid-3d-underline mx-auto rounded-full shadow-[0_10px_30px_rgba(168,85,247,0.4)]"></div>
      </div>

      <div class="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
        
        <div class="group relative p-12 rounded-[3.5rem] bg-white/40 dark:bg-white/[0.03] backdrop-blur-3xl border border-white dark:border-white/10 shadow-2xl hover:-translate-y-6 transition-all duration-700 overflow-hidden">
          
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>

          <h3 class="text-4xl font-[900] text-purple-600 dark:text-fuchsia-400 mb-12 uppercase italic tracking-tighter leading-none">
            Educational <br/> Excellence
          </h3>
          
          <ul class="space-y-8">
            <li v-for="(item, i) in [
              'Comprehensive GAD and VAWC education protocols',
              'Age-appropriate modules for technical learners',
              'Proven gamification for engagement and retention',
              'Interactive real-world decision-making scenarios'
            ]" :key="i" class="flex items-start gap-6 group/item transition-all duration-300 hover:translate-x-4">
              
              <div class="mt-1 flex-shrink-0 w-8 h-8 rounded-xl liquid-bullet shadow-xl transition-all group-hover/item:rotate-12 group-hover/item:scale-110 relative overflow-hidden">
                <div class="absolute top-1 left-1 w-2 h-2 bg-white/40 blur-[1px] rounded-full"></div>
              </div>

              <span class="text-lg font-semibold text-slate-500 dark:text-slate-300 italic group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {{ item }}
              </span>
            </li>
          </ul>
          
          <div class="absolute bottom-0 left-0 h-2 w-0 bg-gradient-to-r from-purple-500 to-fuchsia-500 group-hover:w-full transition-all duration-700 shadow-[0_0_30px_#a855f7]"></div>
        </div>

        <div class="group relative p-12 rounded-[3.5rem] bg-white/40 dark:bg-white/[0.03] backdrop-blur-3xl border border-white dark:border-white/10 shadow-2xl hover:-translate-y-6 transition-all duration-700 overflow-hidden">
          
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>

          <h3 class="text-4xl font-[900] text-purple-600 dark:text-fuchsia-400 mb-12 uppercase italic tracking-tighter leading-none">
            Prevention <br/> & Safety
          </h3>
          
          <ul class="space-y-8">
            <li v-for="(item, i) in [
              'Early detection of behavioral pattern anomalies',
              'AI-powered risk alerts for system administrators',
              'Protocol-driven timely intervention and support',
              'Aggregated insights for trend analysis and planning'
            ]" :key="i" class="flex items-start gap-6 group/item transition-all duration-300 hover:translate-x-4">
              
              <div class="mt-1 flex-shrink-0 w-8 h-8 rounded-xl liquid-bullet-fuchsia shadow-xl transition-all group-hover/item:rotate-12 group-hover/item:scale-110 relative overflow-hidden">
                <div class="absolute top-1 left-1 w-2 h-2 bg-white/40 blur-[1px] rounded-full"></div>
              </div>

              <span class="text-lg font-semibold text-slate-500 dark:text-slate-300 italic group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {{ item }}
              </span>
            </li>
          </ul>

          <div class="absolute bottom-0 left-0 h-2 w-0 bg-gradient-to-r from-fuchsia-500 to-purple-500 group-hover:w-full transition-all duration-700 shadow-[0_0_30px_#db2777]"></div>
        </div>

      </div>
    </div>

    <div v-for="n in 25" :key="'impact-p-'+n"
      class="absolute bg-purple-500/20 dark:bg-white/10 rounded-full animate-pulse pointer-events-none"
      :style="{
        width: Math.random() * 5 + 'px',
        height: Math.random() * 5 + 'px',
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDuration: (Math.random() * 5 + 2) + 's'
      }">
    </div>

  </section>
</template>

<script setup>
import { ref } from 'vue';

const backgroundOrbs = ref([
  { size: 500, left: -10, top: 10, delay: 0, opacity: 0.6, blur: 0 },
  { size: 350, left: 85, top: 40, delay: 2, opacity: 0.5, blur: 0 },
  { size: 220, left: 70, top: -5, delay: 4, opacity: 0.4, blur: 10 },
  { size: 160, left: 10, top: 75, delay: 1, opacity: 0.6, blur: 0 },
  { size: 280, left: 45, top: 85, delay: 3, opacity: 0.2, blur: 30 },
  { size: 140, left: 90, top: 5, delay: 2, opacity: 0.3, blur: 2 },
  { size: 120, left: 30, top: 15, delay: 5, opacity: 0.2, blur: 5 },
]);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800;900&display=swap');

/* --- 3D AMBIENT ORB PHYSICS --- */
.liquid-orb-bg {
  background: radial-gradient(circle at 35% 35%, #f3e8ff 0%, #a855f7 50%, #6b21a8 100%);
  box-shadow: 
    inset -10px -10px 30px rgba(0,0,0,0.1),
    inset 10px 10px 20px rgba(255,255,255,0.7),
    0 30px 60px rgba(168,85,247,0.15);
}

:where(.dark) .liquid-orb-bg {
  background: radial-gradient(circle at 35% 35%, #ff5eff 0%, #6e21ff 55%, #080518 100%);
  box-shadow: 
    inset -15px -15px 50px rgba(0,0,0,0.8),
    inset 15px 15px 30px rgba(255,255,255,0.15),
    0 40px 80px rgba(0,0,0,0.5);
}

/* --- 3D DECORATIVE UNDERLINE --- */
.liquid-3d-underline {
  background: radial-gradient(circle at 30% 30%, #f472b6 0%, #db2777 55%, #831843 100%);
  box-shadow: inset -2px -2px 5px rgba(0,0,0,0.4), inset 2px 2px 5px rgba(255,255,255,0.4);
}

/* --- VOLUMETRIC BULLETS --- */
.liquid-bullet {
  background: radial-gradient(circle at 35% 35%, #a855f7 0%, #6b21a8 55%, #2e1065 100%);
}

.liquid-bullet-fuchsia {
  background: radial-gradient(circle at 35% 35%, #d946ef 0%, #a21caf 55%, #701a75 100%);
}

/* Animations */
.animate-float {
  animation: float 15s infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  33% { transform: translate(30px, -45px) scale(1.05) rotate(4deg); }
  66% { transform: translate(-20px, 20px) scale(1) rotate(-2deg); }
}

section {
  transition: background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>