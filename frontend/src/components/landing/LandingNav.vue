<template>
  <nav class="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4 font-['Poppins',_sans-serif]">
    
    <div class="relative w-full max-w-5xl bg-white/10 dark:bg-white/[0.03] backdrop-blur-3xl border border-white/30 dark:border-white/10 rounded-[2.5rem] px-8 py-4 
      shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] 
      transition-all duration-500 hover:border-white/40 hover:scale-[1.01]">
      
      <div class="flex items-center justify-between">
        
        <router-link :to="{ name: 'home' }" class="flex items-center gap-4 group flex-shrink-0">
          <div class="relative h-11 w-11 rounded-2xl liquid-3d-nav flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
            <svg class="w-6 h-6 text-white drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            <div class="absolute top-[15%] left-[15%] w-[35%] h-[35%] bg-white/30 blur-[4px] rounded-full"></div>
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none">
              Protect<span class="text-purple-500">Ed</span>
            </span>
          </div>
        </router-link>

        <div class="hidden md:flex items-center gap-12">
          <a v-for="link in ['Home', 'Impact', 'About']" :key="link" 
             :href="'#' + link.toLowerCase()" 
             class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 dark:text-white/60 hover:text-purple-500 dark:hover:text-purple-400 transition-all relative group">
            {{ link }}
            <span class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_10px_#a855f7]"></span>
          </a>
        </div>

        <div class="flex items-center gap-6 flex-shrink-0">
          
          <router-link :to="{ name: 'login' }" 
            class="hidden sm:inline-block px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-white/80 
            backdrop-blur-md shadow-[0_10px_20px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.1)] 
            hover:bg-white/10 hover:text-purple-500 transition-all duration-300 active:scale-95">
            Sign In
          </router-link>
          
          <router-link :to="{ name: 'signup' }" 
            class="btn-purple-liquid relative px-10 py-3.5 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl 
            transition-all duration-300 hover:scale-110 hover:rotate-1 active:scale-95 overflow-hidden shadow-2xl">
            <span class="relative z-10 drop-shadow-lg">Join Now</span>
            <div class="absolute top-[10%] left-[10%] w-full h-full bg-gradient-to-br from-white/30 to-transparent opacity-50 blur-[2px]"></div>
          </router-link>
          
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* --- 3D LIQUID LOGO --- */
.liquid-3d-nav {
  background: radial-gradient(circle at 35% 35%, #a855f7 0%, #6b21a8 50%, #2e1065 100%);
  box-shadow: 
    inset -4px -4px 10px rgba(0,0,0,0.6),
    inset 4px 4px 8px rgba(255,255,255,0.3),
    0 10px 20px rgba(107, 33, 168, 0.3);
}

/* --- 3D VOLUMETRIC PURPLE BUTTON --- */
.btn-purple-liquid {
  background: radial-gradient(circle at 30% 30%, #7c3aed 0%, #4c1d95 55%, #1e1b4b 100%);
  box-shadow: 
    inset -6px -6px 15px rgba(0,0,0,0.7),
    inset 6px 6px 12px rgba(255,255,255,0.2),
    0 15px 30px rgba(76, 29, 149, 0.4);
}

:where(.dark) .btn-purple-liquid {
  background: radial-gradient(circle at 30% 30%, #a855f7 0%, #6d28d9 55%, #2e1065 100%);
}

/* Entrance Animation */
nav {
  animation: nav-drop 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes nav-drop {
  from { transform: translateY(-100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>