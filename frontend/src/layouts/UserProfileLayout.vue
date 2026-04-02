<template>
    <div class="min-h-screen container-bg relative selection:bg-purple-500/30 transition-colors duration-500">

        <!-- Header (no sidebar offset needed) -->
        <ProfileHeader />

        <!-- Page content -->
        <main class="flex flex-col container-bg-dark">
            <div class="max-w-5xl mx-auto w-full flex-1 px-4 md:px-8 lg:px-10 py-8 animate-in">
                <router-view v-slot="{ Component }">
                    <transition name="page-shift" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </div>

            <footer class="py-8 px-4 md:px-8 lg:px-10 opacity-40">
                <div class="max-w-5xl mx-auto">
                    <p class="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
                        Academic Console <span class="mx-2 text-slate-200 dark:text-white/10">|</span>
                        <span class="text-purple-600 dark:text-purple-400">ProtectEd Registry System</span>
                    </p>
                </div>
            </footer>
        </main>
    </div>
</template>

<script setup>
import ProfileHeader from '@/components/nav/user_profile_header.vue'
</script>

<style scoped>
.animate-in {
    animation: layoutEntry 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes layoutEntry {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.page-shift-enter-active,
.page-shift-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-shift-enter-from {
    opacity: 0;
    transform: scale(0.99) translateY(8px);
}

.page-shift-leave-to {
    opacity: 0;
    transform: scale(1.01) translateY(-8px);
}
</style>