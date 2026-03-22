<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="isOpen"
                class="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-hidden font-['Poppins']">
                <div class="absolute inset-0 bg-[#020203]/95 backdrop-blur-md" @click="closeModal"></div>

                <div
                    class="relative bg-[#0d0d12] border border-white/10 rounded-[2.5rem] p-10 max-w-sm w-full shadow-[0_30px_70px_rgba(0,0,0,1)] overflow-hidden text-center flex flex-col items-center">
                    <div
                        class="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none">
                    </div>

                    <div class="relative z-10 space-y-8 w-full flex flex-col items-center">
                        <div
                            class="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-[1.8rem] flex items-center justify-center text-red-500 shadow-lg">
                            <LogOutIcon class="w-10 h-10" />
                        </div>

                        <div class="space-y-3">
                            <h3 class="text-2xl font-black uppercase tracking-tighter italic text-white">Log Out?</h3>
                            <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                                Are you sure you want to sign out of your account?
                            </p>
                        </div>

                        <div class="grid grid-cols-2 gap-4 w-full">
                            <button @click="closeModal" :disabled="isLoading"
                                class="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-95 outline-none disabled:opacity-50">
                                Cancel
                            </button>
                            <button @click="handleConfirm" :disabled="isLoading"
                                class="px-6 py-4 bg-gradient-to-r from-red-600 to-pink-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-900/20 hover:scale-105 active:scale-95 transition-all outline-none disabled:opacity-50 flex items-center justify-center">
                                <span v-if="!isLoading">Log Out</span>
                                <div v-else
                                    class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin">
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { LogOut as LogOutIcon } from 'lucide-vue-next';

defineProps({
    isOpen: {
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['close', 'confirm']);
const isLoading = ref(false);

const closeModal = () => {
    if (!isLoading.value) emit('close');
};

const handleConfirm = async () => {
    isLoading.value = true;
    try {
        await emit('confirm');
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>