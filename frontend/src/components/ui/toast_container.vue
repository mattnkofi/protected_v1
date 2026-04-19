<template>
    <Teleport to="body">
        <TransitionGroup name="toast" tag="div"
            class="fixed bottom-6 right-6 z-[300] flex flex-col gap-4 pointer-events-none custom-font-poppins">
            <Toast v-for="toast in toastStore.toasts" :key="toast.id" :toast="toast"
                class="pointer-events-auto hover:scale-[1.02] transition-transform duration-300" />
        </TransitionGroup>
    </Teleport>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'
import Toast from './Toast.vue'
import { TransitionGroup } from 'vue'

const toastStore = useToastStore()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700;1,900&display=swap');

.custom-font-poppins {
    font-family: 'Poppins', sans-serif !important;
}

/* Institutional Slide & Blur Animation */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
    opacity: 0;
    filter: blur(10px);
    transform: translateX(40px) scale(0.9);
}

.toast-leave-to {
    opacity: 0;
    filter: blur(4px);
    transform: translateX(20px) scale(0.95);
}

/* Smooth layout re-stacking when a toast is dismissed */
.toast-move {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
