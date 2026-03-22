<script setup>
import { useRouter } from 'vue-router'
import { Ghost, ArrowLeft, Home } from 'lucide-vue-next'

const router = useRouter()

function goHome() {
    router.push({ path: '/' })
}

function goBack() {
    router.go(-1)
}
</script>

<template>
    <div class="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-6 bg-slate-50 dark:bg-[#06050a] custom-font-poppins selection:bg-purple-500/30 transition-colors duration-500">
        
        <div class="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
        <div class="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-600/5 dark:bg-fuchsia-600/10 rounded-full blur-[120px] animate-pulse delay-1000 pointer-events-none"></div>
        <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div class="relative z-10 max-w-lg w-full animate-in">
            <div class="bg-white/90 dark:bg-white/5 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[3.5rem] shadow-2xl dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden p-10 sm:p-14 text-center group transition-all duration-500 hover:border-purple-500/30">
                
                <div class="flex justify-center mb-10">
                    <div class="relative">
                        <div class="absolute -inset-4 bg-gradient-to-tr from-purple-600 to-fuchsia-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <Ghost class="w-24 h-24 text-purple-500 dark:text-purple-400 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700" :stroke-width="1.5" />
                    </div>
                </div>

                <h1 class="text-8xl font-[900] text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-4 italic">
                    4<span class="bg-gradient-to-r from-purple-500 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">0</span>4
                </h1>

                <h2 class="text-2xl font-[900] text-slate-900 dark:text-white uppercase tracking-tight mb-4 italic">
                    Lost in <span class="text-purple-600 dark:text-purple-500">Registry</span>
                </h2>

                <p class="text-[10px] text-slate-500 dark:text-gray-500 font-black uppercase tracking-widest italic leading-relaxed mb-12 max-w-xs mx-auto">
                    The node you are looking for has been purged or does not exist in these synchronization coordinates.
                </p>

                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <button @click="goHome"
                        class="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-500 text-white text-[10px] font-[900] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-purple-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-500 italic">
                        <Home class="w-4 h-4" />
                        Execute Return
                    </button>
                    
                    <button @click="goBack"
                        class="flex items-center justify-center px-8 py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 text-[10px] font-[900] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 hover:text-purple-600 dark:hover:text-white transition-all shadow-sm italic">
                        <ArrowLeft class="w-4 h-4 mr-2" />
                        Go Back
                    </button>
                </div>
            </div>

            <p class="mt-8 text-center text-[9px] font-black text-slate-400 dark:text-gray-700 uppercase tracking-[0.5em] italic">
                ProtectEd Registry // <span class="text-purple-600 dark:text-purple-600/50">Terminal Error 0x404</span>
            </p>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700;1,900&display=swap');

.custom-font-poppins {
    font-family: 'Poppins', sans-serif !important;
}

/* Institutional Entrance Animation */
.animate-in {
    animation: zoomEntry 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes zoomEntry {
    from { 
        opacity: 0; 
        transform: scale(0.95) translateY(20px);
        filter: blur(10px);
    }
    to { 
        opacity: 1; 
        transform: scale(1) translateY(0);
        filter: blur(0);
    }
}
</style>