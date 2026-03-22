<template>
    <div class="module-sidebar h-full flex flex-col custom-font-poppins text-black dark:text-white bg-white dark:bg-[#0a0a0f] transition-colors duration-500">
        
        <div class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]">
            <div class="flex items-center gap-3">
                <div class="h-4 w-1 bg-purple-600 rounded-full"></div>
                <h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Unit Summary</h2>
            </div>
            <button 
                @click="$emit('close')"
                class="p-2 text-slate-400 hover:text-purple-600 lg:hidden transition-all"
            >
                <XIcon class="w-4 h-4" />
            </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            <div class="space-y-6">
                <div>
                    <h3 class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Topic Type</h3>
                    <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
                        <div class="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                        <span class="text-[10px] font-[900] uppercase tracking-widest text-purple-600 dark:text-purple-400">
                            {{ formatCategory(module.category) }}
                        </span>
                    </div>
                </div>

                <div>
                    <h3 class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Difficulty</h3>
                    <div class="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                        <div class="flex gap-1">
                            <div 
                                v-for="i in 3" 
                                :key="i"
                                class="w-6 h-1.5 rounded-full transition-all duration-500"
                                :class="getDifficultyColor(i)"
                            ></div>
                        </div>
                        <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                            {{ module.difficulty_level }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2rem] p-5 space-y-4 shadow-sm relative overflow-hidden">
                <h3 class="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Asset Metrics</h3>
                
                <div class="flex items-center justify-between p-4 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl group transition-all hover:border-purple-600/30">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-purple-500/10 rounded-lg text-purple-600 group-hover:scale-110 transition-transform">
                            <EyeIcon class="w-4 h-4" />
                        </div>
                        <span class="text-[10px] font-black text-slate-400 uppercase">Reads</span>
                    </div>
                    <span class="text-lg font-[900] italic tracking-tighter">{{ module.view_count || 0 }}</span>
                </div>
            </div>

            <div v-if="module.tags && module.tags.length > 0">
                <h3 class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Registry Tags</h3>
                <div class="flex flex-wrap gap-2">
                    <span 
                        v-for="tag in module.tags" 
                        :key="tag"
                        class="px-3 py-1 bg-slate-100 dark:bg-[#0d0d12] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all cursor-default"
                    >
                        {{ tag }}
                    </span>
                </div>
            </div>

            <div v-if="module.creator">
                <h3 class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Authorized By</h3>
                <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[2rem] shadow-inner">
                    <div class="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                        {{ getInitials(module.creator.name) }}
                    </div>
                    <div class="min-w-0">
                        <p class="text-[10px] font-[900] uppercase tracking-tight truncate italic">{{ module.creator.name }}</p>
                        <p class="text-[8px] font-bold text-slate-400 lowercase truncate">{{ module.creator.email }}</p>
                    </div>
                </div>
            </div>

            <div class="pt-6 border-t border-slate-100 dark:border-white/5 space-y-2">
                <div v-for="log in [
                    { label: 'Published', date: module.published_at },
                    { label: 'Created', date: module.created_at }
                ]" :key="log.label" class="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                    <span v-if="log.date" class="text-slate-400 italic">{{ log.label }}</span>
                    <span v-if="log.date" class="text-slate-500">{{ formatDate(log.date) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { X as XIcon, Eye as EyeIcon } from 'lucide-vue-next';

const props = defineProps({
    module: { type: Object, required: true }
});

defineEmits(['close']);

const formatCategory = (category) => {
    const map = {
        'gad': 'Institutional',
        'sexual_health': 'Health',
        'vawc': 'Safety',
        'general': 'Standard'
    };
    return map[category] || category.toUpperCase();
};

const getDifficultyColor = (level) => {
    const diff = props.module.difficulty_level?.toLowerCase();
    
    if (diff === 'beginner') {
        return level === 1 ? 'bg-purple-600' : 'bg-slate-200 dark:bg-white/10';
    }
    if (diff === 'intermediate') {
        return level <= 2 ? 'bg-purple-600' : 'bg-slate-200 dark:bg-white/10';
    }
    if (diff === 'advanced') {
        return 'bg-purple-600';
    }
    return 'bg-slate-200 dark:bg-white/10';
};

const getInitials = (name) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (ds) => {
    if (!ds) return 'N/A';
    return new Date(ds).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric' 
    });
};
</script>

<style scoped>
.custom-font-poppins { font-family: 'Poppins', sans-serif !important; }

.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(124, 58, 237, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(124, 58, 237, 0.3); }

/* Remove default blue highlighting on mobile */
div { -webkit-tap-highlight-color: transparent; }
</style>