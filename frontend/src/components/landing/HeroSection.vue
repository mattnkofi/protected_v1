<template>
  <section class="relative min-h-screen w-full flex flex-col items-center justify-start overflow-x-hidden transition-all duration-700 
    bg-[#fdfcff] dark:bg-[#04020a] font-['Poppins',_sans-serif] text-slate-900 dark:text-white selection:bg-fuchsia-500/30 py-24">
    
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.06)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_50%_50%,#0f0524_0%,#04020a_100%)]"></div>
    
    <div v-for="(orb, i) in orbs" :key="i"
      class="absolute rounded-full liquid-sphere animate-float pointer-events-none"
      :style="{
        width: orb.size + 'px',
        height: orb.size + 'px',
        left: orb.left + '%',
        top: orb.top + '%',
        animationDelay: orb.delay + 's',
        opacity: orb.opacity,
        filter: `blur(${orb.blur}px)`,
        zIndex: 5
      }">
      <div class="absolute top-[12%] left-[12%] w-[30%] h-[30%] rounded-full bg-gradient-to-br from-white/30 to-transparent blur-[6px]"></div>
    </div>

    <div class="relative z-30 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center mt-12 mb-24">
      <h1 class="text-6xl md:text-8xl font-extrabold tracking-tight leading-[1.05] mb-8">
        Learn. Grow. <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-br from-purple-600 via-fuchsia-500 to-fuchsia-600 
          dark:from-fuchsia-400 dark:via-purple-400 dark:to-fuchsia-300">
          Be Yourself.
        </span>
      </h1>
      
      <p class="text-base md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium italic">
        A safe space for students to lead with respect. Explore interactive lessons and build a world where everyone wins.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-10 w-full">
        <router-link :to="{ name: 'signup' }" 
          class="btn-3d-pink group relative w-full sm:w-auto px-16 py-6 text-white font-black uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-110 active:scale-95 text-[11px] overflow-hidden">
          <span class="relative z-10 drop-shadow-md">Join the Journey</span>
          <div class="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-40"></div>
        </router-link>

        <button class="btn-3d-fuchsia group relative w-full sm:w-auto px-16 py-6 text-white font-black uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-110 active:scale-95 text-[11px] overflow-hidden">
          <span class="relative z-10 drop-shadow-md">Explore Hub</span>
          <div class="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-20"></div>
        </button>
      </div>
    </div>

    <div class="relative z-30 w-full max-w-4xl mx-auto px-6 space-y-32">
      
      <div v-for="(step, idx) in steps" :key="idx" 
        class="flex flex-col md:flex-row items-center gap-12 group"
        :class="idx % 2 !== 0 ? 'md:flex-row-reverse' : ''">
        
        <div class="relative w-40 h-40 flex-shrink-0">
          <div class="absolute inset-0 rounded-full liquid-sphere opacity-20 blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <div class="absolute inset-0 rounded-full liquid-sphere flex items-center justify-center border border-white/20 shadow-2xl transition-transform duration-500 group-hover:rotate-12">
            <span class="text-4xl font-black italic">{{ idx + 1 }}</span>
          </div>
        </div>

        <div class="flex-1 text-center md:text-left" :class="idx % 2 !== 0 ? 'md:text-right' : ''">
          <h3 class="text-3xl font-black mb-4 uppercase tracking-tighter text-purple-600 dark:text-fuchsia-400 group-hover:translate-x-2 transition-transform duration-500">
            {{ step.title }}
          </h3>
          <p class="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-md" :class="idx % 2 !== 0 ? 'mr-0 ml-auto' : ''">
            {{ step.desc }}
          </p>
          <div class="mt-6 flex gap-3 justify-center" :class="idx % 2 !== 0 ? 'md:justify-end' : 'md:justify-start'">
             <span v-for="tag in step.tags" :key="tag" class="text-[10px] font-bold uppercase py-1 px-3 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500">
              #{{ tag }}
             </span>
          </div>
        </div>
      </div>

    </div>

    <div v-for="n in 30" :key="'p-'+n"
      class="absolute bg-purple-400/30 dark:bg-white/10 rounded-full animate-pulse pointer-events-none"
      :style="{
        width: Math.random() * 4 + 'px',
        height: Math.random() * 4 + 'px',
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDuration: (Math.random() * 4 + 2) + 's'
      }">
    </div>

  </section>
</template>

<script setup>
import { ref } from 'vue';

const orbs = ref([
  { size: 500, left: -5, top: 10, delay: 0, opacity: 0.6, blur: 0 },
  { size: 400, left: 80, top: 20, delay: 2, opacity: 0.5, blur: 0 },
  { size: 300, left: 70, top: 60, delay: 4, opacity: 0.4, blur: 15 },
  { size: 150, left: 10, top: 80, delay: 1, opacity: 0.6, blur: 0 },
]);

const steps = [
  { 
    title: "The Foundation", 
    desc: "Uncover the core principles of rights and equality. Explore guided modules that break down the laws protecting every student on campus.",
    tags: ["Knowledge", "Rights"]
  },
  { 
    title: "Scenario Mastery", 
    desc: "Test your judgment in gamified simulations. Navigate complex campus situations by applying legal standards to reach the best outcome.",
    tags: ["Gamified", "Scenarios"]
  },
  { 
    title: "Empowered Action", 
    desc: "Turn your knowledge into impact. Earn leadership badges as you champion a safer, more inclusive environment for your community.",
    tags: ["Advocacy", "Leadership"]
  }
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,600;0,800;1,500&display=swap');

.liquid-sphere {
  background: radial-gradient(circle at 35% 35%, #f3e8ff 0%, #a855f7 50%, #6b21a8 100%);
  box-shadow: inset -10px -10px 30px rgba(0,0,0,0.1), inset 10px 10px 20px rgba(255,255,255,0.7), 0 30px 60px rgba(168,85,247,0.15);
}

:where(.dark) .liquid-sphere {
  background: radial-gradient(circle at 35% 35%, #ff5eff 0%, #6e21ff 55%, #080518 100%);
  box-shadow: inset -15px -15px 50px rgba(0,0,0,0.8), inset 15px 15px 30px rgba(255,255,255,0.15), 0 40px 80px rgba(0,0,0,0.5);
}

.btn-3d-pink {
  background: radial-gradient(circle at 30% 30%, #f472b6 0%, #db2777 55%, #831843 100%);
  box-shadow: inset -8px -8px 15px rgba(0,0,0,0.5), inset 8px 8px 15px rgba(255,255,255,0.3), 0 15px 30px rgba(219,39,119,0.3);
}

.btn-3d-fuchsia {
  background: radial-gradient(circle at 30% 30%, #818cf8 0%, #4f46e5 55%, #312e81 100%);
  box-shadow: inset -8px -8px 15px rgba(0,0,0,0.5), inset 8px 8px 15px rgba(255,255,255,0.2), 0 15px 30px rgba(79,70,229,0.3);
}

.animate-float {
  animation: float 14s infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(25px, -35px) rotate(4deg); }
}
</style>