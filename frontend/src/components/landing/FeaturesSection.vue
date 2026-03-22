<template>
  <section id="features" class="relative py-32 px-6 overflow-hidden transition-all duration-1000 bg-[#fdfcff] dark:bg-[#04020a] font-['Poppins',_sans-serif]">
    
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.04)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_50%_50%,#0f0524_0%,#04020a_100%)]"></div>
    
    <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none" 
      style="background-image: radial-gradient(#6b21a8 1.5px, transparent 1.5px); background-size: 50px 50px;">
    </div>
    
    <div v-for="(orb, i) in backgroundOrbs" :key="'feat-orb-'+i"
      class="absolute rounded-full liquid-sphere-bg animate-float pointer-events-none"
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
          Core <span class="text-transparent bg-clip-text bg-gradient-to-br from-purple-600 via-fuchsia-500 to-fuchsia-600 dark:from-fuchsia-400 dark:via-purple-400 dark:to-fuchsia-300">Protocols</span>
        </h2>
        
        <p class="text-base md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium italic leading-relaxed">
          Unlock the future of awareness. Professional, interactive modules designed to build elite life skills and support the community.
        </p>
        
        <div class="h-2 w-40 liquid-3d-underline mx-auto rounded-full shadow-[0_10px_30px_rgba(168,85,247,0.4)]"></div>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-12 relative z-20">
        <FeatureCard
          title="Gamified Learning"
          description="Interactive quizzes and challenges make learning about GAD and violence prevention engaging and professional."
          icon="M13 10V3L4 14h7v7l9-11h-7z"
        />
        <FeatureCard
          title="Personalized Paths"
          description="Content adapts based on your level, creating a customized learning journey tailored for high-end users."
          icon="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
        <FeatureCard
          title="Rewards System"
          description="Earn technical 3D badges and unlock achievements as you progress through the elite leaderboard."
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <FeatureCard
          title="AI-Powered Insights"
          description="Advanced AI analyzes behavioral patterns to provide early detection alerts and support for prevention."
          icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <FeatureCard
          title="Resource Library"
          description="Access technical guides and video materials tailored for your age group at your own professional pace."
          icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
        <FeatureCard
          title="Data Privacy"
          description="Your data is secure. We maintain strict compliance with ethical guidelines and industry privacy standards."
          icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </div>
    </div>

    <div v-for="n in 30" :key="'feat-p-'+n"
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
import { ref } from 'vue'
import FeatureCard from './FeatureCard.vue'

/** * Maximalist Orb Cluster Data */
const backgroundOrbs = ref([
  { size: 500, left: -10, top: 10, delay: 0, opacity: 0.6, blur: 0 },
  { size: 400, left: 85, top: 60, delay: 2, opacity: 0.5, blur: 0 },
  { size: 250, left: 70, top: -5, delay: 4, opacity: 0.4, blur: 10 },
  { size: 160, left: 5, top: 80, delay: 1, opacity: 0.6, blur: 0 },
  { size: 300, left: 45, top: 85, delay: 3, opacity: 0.2, blur: 30 },
  { size: 140, left: 90, top: 5, delay: 2, opacity: 0.3, blur: 2 },
  { size: 120, left: 30, top: 15, delay: 5, opacity: 0.2, blur: 5 },
  { size: 200, left: -5, top: 50, delay: 6, opacity: 0.1, blur: 40 },
])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800;900&display=swap');

/* --- MAXIMALIST BG SPHERES (3D Physics) --- */
.liquid-sphere-bg {
  background: radial-gradient(circle at 35% 35%, #f3e8ff 0%, #a855f7 50%, #6b21a8 100%);
  box-shadow: 
    inset -10px -10px 30px rgba(0,0,0,0.1),
    inset 10px 10px 20px rgba(255,255,255,0.7),
    0 30px 60px rgba(168,85,247,0.15);
}

:where(.dark) .liquid-sphere-bg {
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

/* --- ANIMATIONS --- */
.animate-float {
  animation: float 16s infinite ease-in-out;
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