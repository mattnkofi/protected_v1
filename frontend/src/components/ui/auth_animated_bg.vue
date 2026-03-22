<template>
    <div class="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-slate-50 dark:bg-[#06050a] p-3 sm:p-4 md:p-0 transition-colors duration-500 font-poppins selection:bg-purple-500/30">

        <div class="relative w-full h-[30vh] md:h-full overflow-hidden rounded-[2rem] md:rounded-none">
            <div class="absolute inset-0 md:p-4 lg:p-6 bg-slate-50 dark:bg-[#06050a] transition-colors duration-500">
                <div class="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl">

                    <div class="absolute inset-0 animate-mesh-flow bg-[length:300%_300%] bg-gradient-to-br from-purple-600 via-fuchsia-700 to-purple-900 opacity-90 dark:opacity-100">
                    </div>

                    <svg class="absolute inset-0 h-full w-full opacity-60 mix-blend-overlay" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                        <defs>
                            <filter id="blur-soft" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" />
                            </filter>
                            <filter id="blur-heavy" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="8" />
                            </filter>
                        </defs>

                        <path class="animate-blob-1" fill="#c084fc" opacity="0.4"
                            filter="url(#blur-soft)"
                            d="M35.6,-48.2C44.3,-41.1,48.1,-28.4,50.7,-15.8C53.3,-3.2,54.7,9.3,50.8,20.4C46.9,31.5,37.7,41.2,26.7,47.8C15.7,54.4,2.9,57.9,-10.1,56C-23.1,54.1,-36.3,46.7,-45.8,35.8C-55.3,24.9,-61,10.4,-60.1,-3.5C-59.2,-17.4,-51.7,-30.7,-41.2,-38.2C-30.7,-45.7,-17.3,-47.4,-2.8,-43.5C11.7,-39.6,26.9,-55.3,35.6,-48.2Z"
                            transform="translate(25 35)" />

                        <path class="animate-blob-2" fill="#818cf8" opacity="0.25"
                            filter="url(#blur-heavy)"
                            d="M38.1,-52.1C49.1,-45.3,57.5,-33.5,61.4,-20.3C65.3,-7.1,64.7,7.4,59.3,20.1C53.9,32.8,43.6,43.7,31.5,50.6C19.4,57.5,5.5,60.4,-8.6,58.8C-22.7,57.2,-37,51.1,-47.4,40.9C-57.8,30.7,-64.3,16.4,-65,1.5C-65.7,-13.4,-60.6,-28.9,-51.1,-37.2C-41.6,-45.5,-27.7,-46.6,-15.5,-52.5C-3.3,-58.4,7.2,-58.9,38.1,-52.1Z"
                            transform="translate(85 20)" />

                        <path class="animate-blob-3" fill="#a855f7" opacity="0.3"
                            filter="url(#blur-soft)"
                            d="M42.2,-56.3C54.4,-48.9,64,-36.1,67.8,-21.8C71.6,-7.5,69.6,8.3,62.8,21.8C56.1,35.3,44.6,46.4,31.2,53.2C17.8,60,-1.4,62.5,-19.1,58.7C-36.8,54.9,-53,44.8,-61.6,30.3C-70.2,15.8,-71.2,-3.1,-66.4,-19.5C-61.6,-35.9,-51,-49.8,-37.6,-56.8C-24.2,-63.8,-8.1,-63.9,4.2,-69.7C16.5,-75.5,29.9,-63.7,42.2,-56.3Z"
                            transform="translate(70 85)" />
                    </svg>

                    <div class="relative z-10 flex h-full flex-col text-white p-8 md:p-12">
                        <div class="flex items-center justify-between">
                            <h2 class="text-[10px] font-black tracking-[0.3em] uppercase opacity-70 italic">Registry Node // Auth</h2>
                            <div class="hidden sm:flex items-center gap-3">
                                <router-link :to="{ name: 'signup' }"
                                    class="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all border border-white/10 italic">
                                    Join Registry
                                </router-link>
                                <router-link :to="{ name: 'login' }"
                                    class="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all border border-white/30 italic">
                                    Sign In
                                </router-link>
                            </div>
                        </div>

                        <div class="mt-auto space-y-4">
                            <div class="flex items-center gap-3">
                                <div class="h-1 w-12 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                                <span class="text-[10px] font-black uppercase tracking-[0.4em] italic opacity-80">Protected Systems</span>
                            </div>
                            <h1 class="text-5xl md:text-7xl font-[900] tracking-tighter uppercase italic leading-none drop-shadow-2xl">
                                Protect<span class="text-purple-300">Ed</span>
                            </h1>
                            <p class="mt-4 text-white/80 text-xs md:text-sm max-w-sm font-medium leading-relaxed italic uppercase tracking-tight">
                                Empowering organizations with secure, intelligent registry and document protection.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex items-center justify-center px-6 py-12 sm:px-10 md:px-16 bg-slate-50 dark:bg-[#06050a] transition-colors duration-500">
            <div class="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <slot />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Ultra-Slow Mesh Background Animation */
@keyframes mesh-flow {
    0% { background-position: 0% 0%; }
    50% { background-position: 100% 100%; }
    100% { background-position: 0% 0%; }
}

.animate-mesh-flow {
    animation: mesh-flow 25s ease-in-out infinite;
}

/* Organic Morphing and Drifting */
@keyframes morph-float-1 {
    0%, 100% { transform: translate(25px, 35px) rotate(0deg) scale(1); }
    50% { transform: translate(35px, 20px) rotate(15deg) scale(1.1); }
}

@keyframes morph-float-2 {
    0%, 100% { transform: translate(85px, 20px) rotate(0deg); }
    50% { transform: translate(70px, 35px) rotate(-20deg) scale(1.2); }
}

@keyframes morph-float-3 {
    0%, 100% { transform: translate(70px, 85px) scale(1) rotate(0deg); }
    50% { transform: translate(80px, 70px) scale(0.9) rotate(10deg); }
}

.animate-blob-1 { animation: morph-float-1 20s ease-in-out infinite; }
.animate-blob-2 { animation: morph-float-2 30s ease-in-out infinite; }
.animate-blob-3 { animation: morph-float-3 25s ease-in-out infinite; }

.font-poppins { font-family: 'Poppins', sans-serif !important; }
</style>