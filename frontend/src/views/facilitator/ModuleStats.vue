<template>
  <div class="p-8 space-y-8 min-h-screen bg-slate-50 dark:bg-[#020203] text-black dark:text-white custom-font-poppins transition-colors duration-500">
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-8">
      <div>
        <button @click="$router.back()" class="flex items-center gap-2 mb-4 group text-black/50 dark:text-gray-500 hover:text-purple-600 dark:hover:text-white transition-colors">
          <ArrowLeftIcon size="16" class="group-hover:-translate-x-1 transition-transform" />
          <span class="text-[10px] font-black uppercase tracking-[0.2em]">Return to Hub</span>
        </button>
        <div class="flex items-center gap-3">
            <div class="h-1.5 w-10 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full shadow-[0_2px_10px_rgba(139,92,246,0.4)]"></div>
            <h1 class="text-3xl font-black uppercase tracking-tighter italic">Engagement Analytics</h1>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 shadow-[0_0_15px_rgba(139,92,246,0.3)]"></div>
    </div>

    <div v-else-if="error" class="bg-red-500/5 border border-red-500/20 p-10 rounded-[3rem] text-center shadow-xl">
      <div class="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogOutIcon class="text-red-500 w-8 h-8" />
      </div>
      <p class="text-red-600 dark:text-red-400 font-black uppercase tracking-widest text-xs">{{ error }}</p>
      <button @click="fetchStats" class="mt-6 px-8 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all">Retry Session</button>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div class="bg-white/80 dark:bg-[#0d0d12]/60 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-2xl transition-all hover:border-purple-500/20">
        <div class="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400 shadow-inner">
              <EyeIcon size="20" />
            </div>
            <h2 class="text-sm font-black uppercase tracking-[0.2em] text-black/40 dark:text-slate-500 italic">Content Viewers</h2>
          </div>
          <span class="px-4 py-1 bg-purple-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-purple-500/20">{{ stats.viewers.length }}</span>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-white/[0.02]">
                <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Faculty/Student</th>
                <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Access Log</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr v-for="viewer in stats.viewers" :key="viewer.id" class="hover:bg-purple-50/50 dark:hover:bg-white/[0.02] transition-all group">
                <td class="px-8 py-5">
                  <div class="flex items-center gap-4">
                    <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-[10px] font-black text-white shadow-md">
                        {{ viewer.user?.first_name[0] }}{{ viewer.user?.last_name[0] }}
                    </div>
                    <div class="flex flex-col">
                      <span class="font-black text-black dark:text-white text-sm uppercase tracking-tight">{{ viewer.user?.first_name }} {{ viewer.user?.last_name }}</span>
                      <span class="text-[10px] font-bold text-black/40 dark:text-slate-500 tracking-tighter">{{ viewer.user?.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-5 text-[10px] font-bold text-black/60 dark:text-slate-400 italic">{{ formatDate(viewer.viewed_at || viewer.created_at) }}</td>
              </tr>
              <tr v-if="stats.viewers.length === 0">
                <td colspan="2" class="px-8 py-14 text-center text-xs text-black/30 dark:text-slate-600 font-bold uppercase tracking-widest italic">No visual engagement detected</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-[#0d0d12]/60 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-2xl transition-all hover:border-fuchsia-500/20">
        <div class="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-fuchsia-500/10 rounded-2xl text-fuchsia-600 dark:text-fuchsia-400 shadow-inner">
              <ClipboardCheckIcon size="20" />
            </div>
            <h2 class="text-sm font-black uppercase tracking-[0.2em] text-black/40 dark:text-slate-500 italic">Quiz Participants</h2>
          </div>
          <span class="px-4 py-1 bg-fuchsia-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-fuchsia-500/20">{{ stats.takers.length }}</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-white/[0.02]">
                <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Participant</th>
                <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-slate-500 italic">Score Registry</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr v-for="taker in stats.takers" :key="taker.id" class="hover:bg-fuchsia-50/50 dark:hover:bg-white/[0.02] transition-all group">
                <td class="px-8 py-5">
                  <div class="flex items-center gap-4">
                    <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-[10px] font-black text-fuchsia-600 dark:text-fuchsia-400">
                        {{ taker.user?.first_name[0] }}{{ taker.user?.last_name[0] }}
                    </div>
                    <div class="flex flex-col">
                      <span class="font-black text-black dark:text-white text-sm uppercase tracking-tight">{{ taker.user?.first_name }} {{ taker.user?.last_name }}</span>
                      <span class="text-[10px] font-bold text-black/40 dark:text-slate-500 tracking-tighter">{{ taker.user?.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-5">
                  <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                        <span class="font-black text-fuchsia-600 dark:text-fuchsia-400 text-sm italic">{{ taker.score }} / {{ taker.total_questions }}</span>
                        <div class="h-1 w-8 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                            <div class="h-full bg-fuchsia-500" :style="{ width: (taker.score / taker.total_questions * 100) + '%' }"></div>
                        </div>
                    </div>
                    <span class="text-[9px] font-bold text-black/30 dark:text-slate-600 uppercase tracking-tighter mt-1">{{ formatDate(taker.created_at) }}</span>
                  </div>
                </td>
              </tr>
              <tr v-if="stats.takers.length === 0">
                <td colspan="2" class="px-8 py-14 text-center text-xs text-black/30 dark:text-slate-600 font-bold uppercase tracking-widest italic">No submission protocols initialized</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/utils/api';
import { Eye as EyeIcon, ClipboardCheck as ClipboardCheckIcon, ArrowLeft as ArrowLeftIcon, LogOut as LogOutIcon } from 'lucide-vue-next';

const route = useRoute();
const loading = ref(true);
const error = ref(null);
const stats = ref({ viewers: [], takers: [] });

const fetchStats = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await api.get(`/api/v1/modules/facilitator/module-stats/${route.params.id}`);
    if (data.success) {
      stats.value = {
        viewers: data.viewers || [],
        takers: data.takers || []
      };
    } else {
      error.value = data.message || "Protocol Failure: Could not synchronize module data.";
    }
  } catch (err) {
    console.error("Failed to load engagement stats:", err);
    error.value = err.response?.data?.message || "Connection Interrupted: Access to neural link lost.";
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return '---';
  return new Date(date).toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

onMounted(fetchStats);
</script>

<style scoped>
@reference "@/style.css";

@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700;1,900&display=swap');

.custom-font-poppins {
    font-family: 'Poppins', sans-serif !important;
}

/* 3D Pill and Table Transitions */
.animate-vessel {
  animation: vesselSlide 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes vesselSlide {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Custom Scrollbar */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-thumb { @apply bg-purple-600/20 rounded-full; }
</style>