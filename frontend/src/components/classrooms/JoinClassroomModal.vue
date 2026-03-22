<template>
  <div 
    class="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 dark:bg-[#020203]/80 backdrop-blur-md transition-all duration-500 custom-font-poppins" 
    @click.self="$emit('close')"
  >
    <div 
      class="relative bg-white/90 dark:bg-[#0d0d12]/90 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.8)] max-w-sm w-full text-center overflow-hidden transition-all duration-500 animate-in"
    >
      
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="mb-8">
        <h2 class="text-3xl font-[900] uppercase tracking-tighter italic text-slate-900 dark:text-white leading-none">
          Join <span class="bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent italic">Class</span>
        </h2>
        <p class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em] mt-3 italic">Establish Neural Link</p>
      </div>
      
      <div class="relative mb-10 group">
        <input 
          v-model="joinCode" 
          type="text" 
          maxlength="6" 
          placeholder="A1B2C3"
          class="w-full bg-slate-50 dark:bg-white/[0.03] border-b-2 border-slate-200 dark:border-purple-900 py-6 text-4xl font-[900] text-purple-600 dark:text-purple-400 text-center tracking-[0.4em] uppercase outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-white/[0.05] transition-all italic placeholder:text-slate-300 dark:placeholder:text-white/5 shadow-inner"
        />
        <div class="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-fuchsia-500 group-focus-within:w-full transition-all duration-700"></div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <button 
          @click="$emit('close')" 
          class="px-6 py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-[10px] font-[900] uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 italic"
        >
          Abort
        </button>
        
        <button 
          @click="handleJoin" 
          class="relative px-6 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-2xl text-[10px] font-[900] uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(124,58,237,0.5),inset_0_2px_4px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all italic"
        >
          Join Now
        </button>
      </div>

      <p class="mt-8 text-[8px] font-black text-slate-300 dark:text-gray-700 uppercase tracking-[0.4em] italic">
        Authorized Access Only
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['close', 'join']);
const joinCode = ref('');

const handleJoin = () => {
  if (joinCode.value.trim().length === 6) {
    emit('join', joinCode.value.toUpperCase().trim());
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700;1,900&display=swap');

.custom-font-poppins {
  font-family: 'Poppins', sans-serif !important;
}

.animate-in {
    animation: modalEntry 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modalEntry {
    from { 
      opacity: 0; 
      transform: scale(0.97) translateY(20px);
      filter: blur(10px);
    }
    to { 
      opacity: 1; 
      transform: scale(1) translateY(0);
      filter: blur(0);
    }
}

input {
  text-transform: uppercase;
}
</style>