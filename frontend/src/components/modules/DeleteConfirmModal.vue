<template>
    <div class="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div class="fixed inset-0 bg-slate-900/60 dark:bg-[#020203]/95 backdrop-blur-md transition-opacity" @click="$emit('cancel')"></div>

        <div class="relative bg-white dark:bg-[#0d0d12] border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl max-w-sm w-full p-10 animate-in font-['Poppins'] text-black dark:text-white overflow-hidden">
            
            <div class="relative flex items-center justify-center w-16 h-16 mx-auto mb-8">
                <div class="absolute inset-0 bg-red-500/10 rounded-full"></div>
                <div class="relative z-10 flex items-center justify-center w-full h-full bg-slate-50 dark:bg-white/5 border border-red-500/20 rounded-full text-red-500 shadow-inner">
                    <AlertTriangleIcon class="w-8 h-8" />
                </div>
            </div>

            <div class="text-center space-y-4 mb-10">
                <h3 class="text-xl font-black uppercase tracking-tighter italic leading-none">
                    Delete <span class="text-red-500">Unit?</span>
                </h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed px-2 italic">
                    Are you sure you want to remove <span class="text-purple-600 font-black">"{{ moduleTitle }}"</span>? 
                    This removal is permanent and cannot be reversed.
                </p>
            </div>

            <div class="flex gap-3">
                <button 
                    @click="$emit('cancel')"
                    class="flex-1 px-6 py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-black dark:hover:text-white transition-all italic"
                >
                    Dismiss
                </button>
                <button 
                    @click="$emit('confirm')"
                    class="btn-3d-red flex-1 px-6 py-4 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                    Confirm
                </button>
            </div>
            
            <p class="mt-8 text-center text-[7px] font-black text-slate-300 dark:text-slate-800 uppercase tracking-[0.4em]">System Termination Protocol</p>
        </div>
    </div>
</template>

<script setup>
import { AlertTriangle as AlertTriangleIcon } from 'lucide-vue-next';

defineProps({
    moduleTitle: { type: String, required: true }
});

defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
.btn-3d-red {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  box-shadow: 
    0 8px 16px -4px rgba(239, 68, 68, 0.3), 
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

@keyframes modalEntry {
    from { opacity: 0; transform: scale(0.98) translateY(15px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-in { animation: modalEntry 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
