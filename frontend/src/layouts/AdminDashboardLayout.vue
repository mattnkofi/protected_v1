<!-- src/layouts/AdminDashboardLayout.vue -->
<template>
    <div class="min-h-screen bg-gray-50 dark:bg-abyss-950">
        <!-- Mobile Sidebar Backdrop -->
        <transition name="fade">
            <div v-if="sidebarStore.isMobileOpen" @click="sidebarStore.closeMobile"
                class="fixed inset-0 bg-black/50 z-40 lg:hidden"></div>
        </transition>

        <!-- Sidebar -->
        <AdminSidebar />

        <!-- Main Content Area -->
        <div class="transition-all duration-300 ease-in-out" :class="sidebarStore.isExpanded ? 'lg:pl-72' : 'lg:pl-22'">
            <!-- Header -->
            <AdminHeader />

            <!-- Page Content -->
            <main class="p-4 sm:p-6 lg:p-8">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </main>
        </div>
    </div>
</template>

<script setup>
import { useSidebarStore } from '@/stores/stores';
import AdminSidebar from '@/components/admin/AdminSidebar.vue';
import AdminHeader from '@/components/admin/AdminHeader.vue';

const sidebarStore = useSidebarStore();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>