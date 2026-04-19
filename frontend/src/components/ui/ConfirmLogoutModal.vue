<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="isOpen"
                class="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-hidden font-['Poppins']">
                <div class="absolute inset-0 bg-[#020203]/95 backdrop-blur-md" @click="closeModal"></div>

                <div
                    class="relative bg-[#0d0d12] border border-white/10 rounded-[3rem] p-12 max-w-sm w-full shadow-[0_30px_70px_rgba(0,0,0,1)] overflow-hidden text-center flex flex-col items-center">
                    <div
                        class="absolute -top-12 -right-12 w-48 h-48 bg-red-600/15 rounded-full blur-3xl pointer-events-none animate-pulse">
                    </div>

                    <div class="relative z-10 space-y-10 w-full flex flex-col items-center">
                        <div
                            class="w-24 h-24 bg-gradient-to-br from-red-500 to-red-800 rounded-[2.5rem] flex items-center justify-center text-white shadow-[0_20px_40px_rgba(239,68,68,0.4),inset_0_2px_8px_rgba(255,255,255,0.3)] transition-transform hover:rotate-12 duration-700">
                            <LogOutIcon class="w-12 h-12" />
                        </div>

                        <div class="space-y-4">
                            <h3 class="text-3xl font-black uppercase tracking-tighter text-white leading-none">Sign Out?</h3>
                            <p class="text-sm font-medium text-gray-400 leading-relaxed text-center max-w-xs">
                                Your session will be ended. You'll need to sign back in to continue.
                            </p>
                        </div>

                        <div class="grid grid-cols-2 gap-5 w-full">
                            <button @click="closeModal" :disabled="isLoading"
                                class="px-6 py-5 bg-white/5 border border-white/5 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-95 outline-none disabled:opacity-50">
                                Cancel
                            </button>
                            <button @click="handleConfirm" :disabled="isLoading"
                                class="px-6 py-5 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 transition-all outline-none disabled:opacity-50 flex items-center justify-center">
                                <span v-if="!isLoading">Sign Out</span>
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
