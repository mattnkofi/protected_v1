<template>
  <section id="about" class="relative py-32 px-6 overflow-hidden transition-all duration-1000 bg-[#fdfcff] dark:bg-[#04020a] font-['Poppins',_sans-serif]">
    
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.04)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_50%_50%,#0f0524_0%,#04020a_100%)]"></div>
    
    <div v-for="(orb, i) in backgroundOrbs" :key="'about-orb-'+i"
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

    <div class="max-w-5xl mx-auto text-center space-y-16 relative z-10">
      
      <div class="space-y-6">
        <h2 class="text-6xl md:text-8xl font-[900] text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none drop-shadow-2xl">
          About <span class="text-transparent bg-clip-text bg-gradient-to-br from-purple-600 via-fuchsia-500 to-fuchsia-600 dark:from-fuchsia-400 dark:via-purple-400 dark:to-fuchsia-300">ProtectEd</span>
        </h2>
        <div class="h-2 w-40 liquid-3d-underline mx-auto rounded-full shadow-[0_10px_30px_rgba(168,85,247,0.4)]"></div>
      </div>

      <div class="space-y-12 text-lg md:text-2xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl mx-auto font-medium italic">
        <p class="transition-all duration-500 hover:text-slate-900 dark:hover:text-white hover:translate-y-[-8px]">
          ProtectEd is a cutting-edge platform that bridges the gap between interactive education and predictive intelligence. By combining gamified learning modules with AI-powered behavioral analysis, we create a unified system that educates, engages, and supports early intervention efforts in VAWC prevention.
        </p>

        <p class="transition-all duration-500 hover:text-slate-900 dark:hover:text-white hover:translate-y-[-8px]">
          Built specifically for educational institutions and VAWC prevention organizations, ProtectEd provides comprehensive tools for teaching critical life skills while simultaneously identifying and supporting at-risk individuals before issues escalate.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-12 justify-center pt-8">
        
        <router-link :to="{ name: 'signup' }" 
          class="btn-purple-liquid relative px-16 py-7 text-sm font-black uppercase tracking-[0.2em] text-white rounded-[2.5rem] transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden shadow-2xl">
          <span class="relative z-10 drop-shadow-lg">Join Community</span>
          <div class="absolute top-[10%] left-[10%] w-full h-full bg-gradient-to-br from-white/30 to-transparent opacity-50 blur-[2px]"></div>
        </router-link>

        <a href="#features" 
          class="relative px-16 py-7 text-sm font-black uppercase tracking-[0.2em] rounded-[2.5rem] transition-all duration-300
          bg-white/5 dark:bg-white/[0.03] text-slate-600 dark:text-white/80 border border-slate-200 dark:border-white/10 backdrop-blur-2xl
          shadow-[0_20px_40px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.2)] 
          hover:scale-105 hover:bg-white/10 hover:text-purple-500">
          Learn Protocols
        </a>
      </div>

    </div>

    <div v-for="n in 20" :key="'about-p-'+n"
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
  { size: 450, left: -10, top: -15, delay: 0, opacity: 0.6, blur: 0 },
  { size: 380, left: 80, top: 40, delay: 2, opacity: 0.5, blur: 0 },
  { size: 300, left: 70, top: 75, delay: 4, opacity: 0.4, blur: 15 },
  { size: 180, left: 5, top: 70, delay: 1, opacity: 0.6, blur: 0 },
  { size: 250, left: 40, top: 90, delay: 3, opacity: 0.2, blur: 25 },
  { size: 140, left: 85, top: 5, delay: 2, opacity: 0.3, blur: 2 },
  { size: 110, left: 25, top: 10, delay: 5, opacity: 0.2, blur: 5 },
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

/* --- VOLUMETRIC UNDERLINE --- */
.liquid-3d-underline {
  background: radial-gradient(circle at 30% 30%, #f472b6 0%, #db2777 55%, #831843 100%);
  box-shadow: inset -2px -2px 5px rgba(0,0,0,0.4), inset 2px 2px 5px rgba(255,255,255,0.4);
}

/* --- 3D LIQUID PURPLE BUTTON --- */
.btn-purple-liquid {
  background: radial-gradient(circle at 30% 30%, #7c3aed 0%, #4c1d95 55%, #1e1b4b 100%);
  box-shadow: 
    inset -10px -10px 20px rgba(0,0,0,0.5),
    inset 10px 10px 20px rgba(255,255,255,0.3),
    0 25px 50px rgba(76, 29, 149, 0.4);
}

:where(.dark) .btn-purple-liquid {
  background: radial-gradient(circle at 30% 30%, #a855f7 0%, #6d28d9 55%, #2e1065 100%);
}

/* --- ANIMATIONS --- */
.animate-float {
  animation: float 16s infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  33% { transform: translate(30px, -45px) scale(1.05) rotate(4deg); }
  66% { transform: translate(-20px, 20px) scale(1) rotate(-2deg); }
}
</style>