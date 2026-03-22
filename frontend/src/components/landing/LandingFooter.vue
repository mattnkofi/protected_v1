<template>
  <footer class="relative py-28 px-8 overflow-hidden transition-all duration-1000
    bg-[#fdfcff] dark:bg-[#04020a] font-['Poppins',_sans-serif] border-t border-white dark:border-white/5">
    
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.06)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_50%_50%,#0f0524_0%,#04020a_100%)]"></div>
    
    <div v-for="(orb, i) in backgroundOrbs" :key="'bg-orb-'+i"
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
      <div class="absolute top-[15%] left-[15%] w-[35%] h-[35%] bg-white/20 blur-[5px] rounded-full"></div>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
        <div v-for="category in footerData" :key="category.title" class="space-y-8 group">
          <h4 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em] italic">
            {{ category.title }}
          </h4>
          
          <ul class="space-y-6">
            <li v-for="link in category.links" :key="link.name">
              <a :href="link.href" class="text-[11px] font-[900] text-slate-600 dark:text-slate-300 uppercase italic tracking-[0.2em] transition-all 
                hover:text-purple-600 dark:hover:text-fuchsia-400 hover:translate-x-3 flex items-center gap-4 group/link">
                
                <div class="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-white/5 border border-white/50 dark:border-white/10 shadow-sm 
                  group-hover/link:bg-purple-500 group-hover/link:shadow-[0_0_12px_#a855f7] transition-all duration-300"></div>
                
                {{ link.name }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="pt-16 border-t border-slate-200/50 dark:border-white/10 relative z-20">
        <div class="flex flex-col lg:flex-row items-center justify-between gap-16 text-center lg:text-left">
          
          <div class="space-y-5">
            <div class="flex items-center gap-4 justify-center lg:justify-start">
               <div class="h-10 w-10 rounded-xl liquid-3d-logo flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                 <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                 </svg>
                 <div class="absolute top-1 left-1 w-2 h-2 bg-white/40 blur-[1px] rounded-full"></div>
               </div>
               <span class="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none">
                 Protect<span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-500">Ed</span>
               </span>
            </div>
            
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-relaxed">
              © 2026 ProtectEd Protocol. Built for institutional awareness.
            </p>
          </div>
          
          <div class="flex flex-wrap justify-center gap-6 relative z-20">
            <a v-for="legal in ['Privacy Policy', 'Terms of Service', 'Cookie Protocol']" :key="legal" href="#" 
              class="px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 bg-white/40 dark:bg-white/[0.03] 
              border border-white dark:border-white/10 backdrop-blur-md shadow-sm transition-all hover:text-purple-600 dark:hover:text-white hover:-translate-y-1">
              {{ legal }}
            </a>
          </div>

        </div>
      </div>
    </div>

  </footer>
</template>

<script setup>
import { ref } from 'vue';

/** * Dynamic Orb Data Cluster for Maximalist Background
 * Organised by Size, Left, Top, Delay, Opacity, and Blur.
 */
const backgroundOrbs = ref([
  { size: 450, left: -8, top: -10, delay: 0, opacity: 0.6, blur: 0 },
  { size: 380, left: 85, top: 40, delay: 2, opacity: 0.5, blur: 0 },
  { size: 280, left: 65, top: -15, delay: 4, opacity: 0.4, blur: 10 },
  { size: 200, left: 5, top: 70, delay: 1, opacity: 0.6, blur: 0 },
  { size: 180, left: 40, top: 85, delay: 3, opacity: 0.2, blur: 20 },
  { size: 150, left: 30, top: 5, delay: 5, opacity: 0.3, blur: 2 },
  { size: 100, left: 90, top: 5, delay: 2, opacity: 0.4, blur: 0 },
  { size: 220, left: -5, top: 40, delay: 6, opacity: 0.1, blur: 40 },
]);

const footerData = [
  { 
    title: 'Protocol', 
    links: [{ name: 'Features', href: '#features' }, { name: 'Real-World Impact', href: '#impact' }] 
  },
  { 
    title: 'Structure', 
    links: [{ name: 'About Mission', href: '#about' }, { name: 'Support Center', href: '#' }] 
  },
  { 
    title: 'Compliance', 
    links: [{ name: 'Privacy Vault', href: '#' }, { name: 'Terms of Use', href: '#' }] 
  },
  { 
    title: 'Connect', 
    links: [{ name: 'Institutional Portal', href: '#' }, { name: 'Help Desk', href: '#' }] 
  }
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;900&display=swap');

/* --- MAXIMALIST BG SPHERES (3D Physics) --- */
.liquid-sphere-bg {
  /* Default Light Mode: Pearl Lavender */
  background: radial-gradient(circle at 35% 35%, #f3e8ff 0%, #a855f7 50%, #6b21a8 100%);
  box-shadow: 
    inset -10px -10px 30px rgba(0,0,0,0.1),
    inset 10px 10px 20px rgba(255,255,255,0.7),
    0 30px 60px rgba(168,85,247,0.15);
}

:where(.dark) .liquid-sphere-bg {
  /* Dark Mode: Deep Void Purple */
  background: radial-gradient(circle at 35% 35%, #ff5eff 0%, #6e21ff 55%, #080518 100%);
  box-shadow: 
    inset -15px -15px 50px rgba(0,0,0,0.8),
    inset 15px 15px 30px rgba(255,255,255,0.15),
    0 40px 80px rgba(0,0,0,0.5);
}

/* --- VOLUMETRIC LOGO --- */
.liquid-3d-logo {
  background: radial-gradient(circle at 35% 35%, #a855f7 0%, #6b21a8 55%, #2e1065 100%);
  box-shadow: inset -3px -3px 8px rgba(0,0,0,0.5), inset 3px 3px 6px rgba(255,255,255,0.3);
}

/* --- ANIMATIONS --- */
.animate-float {
  animation: float 16s infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  33% { transform: translate(30px, -45px) rotate(4deg) scale(1.05); }
  66% { transform: translate(-20px, 20px) rotate(-2deg) scale(1); }
}

.animate-float-delayed {
  animation: float 18s infinite ease-in-out reverse;
  animation-delay: 3s;
}

footer {
  transition: background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

a {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>