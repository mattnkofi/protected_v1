<template>
    <div class="sidebar-container">
        <!-- Mobile overlay backdrop -->
        <Transition enter-active-class="transition-opacity duration-300"
            leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
            leave-to-class="opacity-0">
            <div v-if="isMobileShown" class="fixed inset-0 z-40 md:hidden bg-abyss-950/60"
                @click="sidebarStore.closeMobile()" />
        </Transition>

        <aside :class="[
            'fixed top-0 left-0 bottom-0 z-[60] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] custom-font-poppins',
            'container-bg',
            isHidden && 'hidden md:block translate-x-[-100%]',
            isIcon && 'w-22 md:block',
            isFull && 'w-72 md:block',
            isMobileShown && 'w-72 md:hidden shadow-calm-lavender-900/20'
        ]">
            <div class="h-full flex flex-col relative z-10">

                <!-- Logo / Brand -->
                <div :class="['flex items-center h-24 relative transition-all duration-500 border-b border-platinum-200 dark:border-abyss-600', isFull ? 'px-6' : 'justify-center px-0']">
                    <router-link :to="{ name: 'admin.dashboard' }" class="flex items-center gap-3 group/logo">
                        <div class="relative flex-shrink-0 transition-transform duration-500" :class="isIcon && 'scale-90'">
                            <div class="relative w-12 h-12 bg-gradient-to-br from-calm-lavender-600 via-neon-pink-500 to-calm-lavender-700 rounded-2xl flex items-center justify-center group-hover/logo:rotate-6 transition-all">
                                <ShieldCheckIcon class="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <Transition name="fade">
                            <div v-if="isFull" class="flex flex-col">
                                <h1 class="text-xl font-black tracking-tighter text-abyss-900 dark:text-platinum-50 leading-none uppercase">
                                    Protect<span class="bg-gradient-to-r from-calm-lavender-600 to-neon-pink-500 bg-clip-text text-transparent">Ed</span>
                                </h1>
                                <span class="text-[9px] font-black text-abyss-600 dark:text-platinum-400 uppercase tracking-[0.3em] mt-1 leading-none">
                                    Admin System
                                </span>
                            </div>
                        </Transition>
                    </router-link>
                </div>

                <!-- Section label + expand/collapse toggle -->
                <div :class="['flex items-center py-6 relative', isFull ? 'justify-between px-8' : 'justify-center px-0']">
                    <Transition name="fade">
                        <span v-if="isFull" class="text-[10px] font-black uppercase tracking-[0.2em] text-abyss-700 dark:text-platinum-400">
                            Main Menu
                        </span>
                    </Transition>
                    <button @click="sidebarStore.toggleExpanded()"
                        class="p-2 rounded-full container-bg-dark border border-platinum-200 dark:border-abyss-600 hover:border-calm-lavender-500/50 shadow-sm transition-all group">
                        <ChevronLeftIcon v-if="isFull" class="h-4 w-4 text-abyss-800 dark:text-platinum-200 group-hover:-translate-x-0.5 transition-transform" />
                        <ChevronRightIcon v-else class="h-4 w-4 text-abyss-800 dark:text-platinum-200 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>

                <!-- Nav items -->
                <nav class="flex-1 scroll-left-container custom-scrollbar relative py-2">
                    <div class="scroll-content space-y-1.5 pb-4 mt-2">

                        <div v-for="(item, index) in navItems" :key="index">
                            <button
                                @click="router.push({ name: item.route })"
                                :class="[
                                    'group relative flex items-center transition-all duration-300 py-1.5 ml-4 w-[calc(100%-1rem+1px)] rounded-l-2xl z-10 outline-none',
                                    route.name === item.route
                                        ? 'nav-active cursor-default'
                                        : 'bg-transparent hover:bg-platinum-200/50 dark:hover:bg-abyss-600/50 hover:translate-x-1'
                                ]">

                                <!-- Active corner cutouts -->
                                <div v-if="route.name === item.route"
                                    class="absolute bottom-full right-0 w-6 h-6 pointer-events-none z-10
                                           bg-[radial-gradient(circle_at_0_0,transparent_24px,var(--color-platinum-50)_24px)]
                                           dark:bg-[radial-gradient(circle_at_0_0,transparent_24px,var(--color-abyss-900)_24px)]">
                                </div>
                                <div v-if="route.name === item.route"
                                    class="absolute top-full right-0 w-6 h-6 pointer-events-none z-10
                                           bg-[radial-gradient(circle_at_0_100%,transparent_24px,var(--color-platinum-50)_24px)]
                                           dark:bg-[radial-gradient(circle_at_0_100%,transparent_24px,var(--color-abyss-900)_24px)]">
                                </div>

                                <div :class="['flex items-center gap-4 w-full h-full relative z-20', isIcon ? 'justify-center pr-2' : 'pl-3']">
                                    <!-- Icon -->
                                    <div class="w-10 h-10 rounded-[1.1rem] flex items-center justify-center transition-all duration-300 flex-shrink-0"
                                        :class="route.name === item.route
                                            ? 'bg-gradient-to-br from-calm-lavender-600 to-neon-pink-500 shadow-md scale-105'
                                            : 'bg-transparent group-hover:bg-platinum-200 dark:group-hover:bg-abyss-600/50'">
                                        <component :is="item.icon"
                                            class="w-5 h-5 stroke-[2.5] transition-colors duration-300"
                                            :class="route.name === item.route ? 'text-white fill-white/30' : `${item.color} ${item.fill}`" />
                                    </div>

                                    <!-- Label -->
                                    <div v-if="!isIcon" class="flex flex-col items-start pt-1">
                                        <span class="transition-colors duration-300 inline-block relative pb-1"
                                            :class="route.name === item.route ? 'sidebar-active-item-name sidebar-item-name' : 'sidebar-inactive-item-name sidebar-item-name sidebar-inactive-item-name-hover'">
                                            {{ item.name }}
                                            <span class="absolute bottom-0 left-0 h-[2.5px] rounded-full transition-all duration-300 bg-gradient-to-r from-calm-lavender-600 to-neon-pink-500"
                                                :class="route.name === item.route ? 'w-full opacity-100' : 'w-0 opacity-0'">
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </button>
                        </div>

                    </div>
                </nav>

                <!-- Profile trigger -->
                <div class="mt-auto p-4 relative border-t border-platinum-200 dark:border-abyss-600 container-bg">
                    <div ref="profileTriggerRef" @click="isUserMenuOpen = !isUserMenuOpen"
                        :class="['cursor-pointer flex items-center container-bg-dark border border-platinum-200 dark:border-abyss-600 p-2 rounded-[2rem] transition-all hover:border-calm-lavender-500/30 shadow-lg', isIcon ? 'w-14 h-14 justify-center p-0 mx-auto' : 'w-full justify-between gap-3']">

                        <div class="flex items-center gap-3 min-w-0" v-if="!isIcon">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-calm-lavender-600 via-neon-pink-500 to-calm-lavender-700 flex items-center justify-center text-[11px] font-black text-white shadow-md uppercase border border-white/20">
                                {{ userInitials }}
                            </div>
                            <div class="flex-1 min-w-0 text-left">
                                <p class="text-[12px] font-black text-abyss-900 dark:text-platinum-50 truncate uppercase tracking-tighter leading-none">
                                    {{ userName }}
                                </p>
                                <p class="text-[9px] font-black text-calm-lavender-600 dark:text-calm-lavender-400 uppercase tracking-widest leading-none mt-1">
                                    Administrator
                                </p>
                            </div>
                        </div>

                        <div class="text-abyss-800 dark:text-platinum-300 hover:text-calm-lavender-600 transition-colors p-1 pr-2">
                            <MoreVerticalIcon v-if="!isIcon" class="h-4 w-4" />
                            <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-neon-pink-500 to-calm-lavender-600 flex items-center justify-center text-[10px] font-black text-white uppercase shadow-md">
                                {{ userInitials }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Profile floating dropdown -->
        <Teleport to="body">
            <Transition name="slide-up">
                <div v-if="isUserMenuOpen" ref="profileDropdownRef"
                    class="fixed z-[100] w-56 container-bg-dark border border-platinum-200 dark:border-abyss-600 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden">
                    <button @click="navigate('profile')" class="menu-item">
                        <UserIcon class="h-4 w-4 text-calm-lavender-600" /> Account
                    </button>
                    <button @click="navigate('settings')" class="menu-item">
                        <SettingsIcon class="h-4 w-4 text-calm-lavender-600" /> Settings
                    </button>
                    <button @click="isLogoutModalOpen = true; isUserMenuOpen = false"
                        class="menu-item text-red-600 border-none hover:bg-red-50 dark:hover:bg-red-500/5">
                        <LogOutIcon class="h-4 w-4" /> Sign Out
                    </button>
                </div>
            </Transition>
        </Teleport>

        <ConfirmModal
            :is-open="isLogoutModalOpen"
            variant="warning"
            title="Sign out?"
            message="Your admin session will be ended. You'll need to sign back in to continue."
            confirm-label="Sign Out"
            cancel-label="Cancel"
            :loading="isLoggingOut"
            @confirm="handleLogout"
            @cancel="isLogoutModalOpen = false"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { computePosition, flip, shift, offset } from '@floating-ui/dom'
import { useAuthStore } from '@/stores/auth'
import { useSidebarStore } from '@/stores/stores'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import {
    ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
    Users as UsersIcon, BookOpen as BookOpenIcon, GraduationCap as GraduationCapIcon,
    ClipboardList as ClipboardListIcon, MoreVertical as MoreVerticalIcon,
    User as UserIcon, Settings as SettingsIcon, LogOut as LogOutIcon,
    LayoutDashboard as LayoutDashboardIcon, ShieldCheck as ShieldCheckIcon,
    Megaphone as MegaphoneIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const sidebarStore = useSidebarStore()

const isUserMenuOpen = ref(false)
const isLogoutModalOpen = ref(false)
const isLoggingOut = ref(false)
const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const profileTriggerRef = ref(null)
const profileDropdownRef = ref(null)

const navItems = [
    { name: 'Analytics',      route: 'admin.dashboard',     icon: LayoutDashboardIcon, color: 'text-calm-lavender-500', fill: 'fill-calm-lavender-500/20' },
    { name: 'Facilitators',   route: 'admin.facilitators',  icon: UsersIcon,           color: 'text-blue-500',          fill: 'fill-blue-500/20' },
    { name: 'Students',       route: 'admin.students',      icon: GraduationCapIcon,   color: 'text-emerald-500',       fill: 'fill-emerald-500/20' },
    { name: 'Reports',        route: 'admin.reports',       icon: ClipboardListIcon,   color: 'text-yellow-500',        fill: 'fill-yellow-500/20' },
    { name: 'Modules',        route: 'admin.modules',       icon: BookOpenIcon,        color: 'text-orange-500',        fill: 'fill-orange-500/20' },
    { name: 'Announcements',  route: 'admin.announcements', icon: MegaphoneIcon,       color: 'text-neon-pink-500',     fill: 'fill-neon-pink-500/20' },
]

const userName = computed(() => authStore.user?.name || authStore.user?.first_name || 'Admin')
const userInitials = computed(() => {
    const name = userName.value
    return name.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2)
})

const navigate = (routeName) => {
    isUserMenuOpen.value = false
    router.push({ name: routeName })
}

const handleLogout = async () => {
    isLoggingOut.value = true
    try { await authStore.logout(); router.push({ name: 'login' }) }
    catch (e) { console.error('Logout failed', e) }
    finally { isLoggingOut.value = false; isLogoutModalOpen.value = false }
}

const mode = computed(() => {
    if (width.value < 1024) return sidebarStore.isMobileOpen ? 'mobile-full' : 'hidden'
    return sidebarStore.isExpanded ? 'full' : 'icon'
})
const isHidden      = computed(() => mode.value === 'hidden')
const isMobileShown = computed(() => mode.value === 'mobile-full')
const isIcon        = computed(() => mode.value === 'icon')
const isFull        = computed(() => mode.value === 'full' || mode.value === 'mobile-full')

const reposition = async () => {
    if (!isUserMenuOpen.value) return
    await nextTick()
    const trigger = profileTriggerRef.value
    const dropdown = profileDropdownRef.value
    if (!trigger || !dropdown) return
    const { x, y } = await computePosition(trigger, dropdown, {
        placement: isFull.value ? 'top-start' : 'right-end',
        middleware: [offset(12), flip(), shift({ padding: 16 })],
    })
    Object.assign(dropdown.style, { left: `${x}px`, top: `${y}px` })
}

watch(isUserMenuOpen, (open) => { if (open) reposition() })
watch(isFull, () => { if (isUserMenuOpen.value) reposition() })

const onClickAway = (e) => {
    if (!isUserMenuOpen.value) return
    const clickedTrigger = profileTriggerRef.value?.contains(e.target)
    const clickedDropdown = profileDropdownRef.value?.contains(e.target)
    if (!clickedTrigger && !clickedDropdown) isUserMenuOpen.value = false
}

onMounted(async () => {
    if (typeof window !== 'undefined') {
        window.addEventListener('resize', () => { width.value = window.innerWidth; reposition() })
        window.addEventListener('click', onClickAway)
        window.addEventListener('scroll', reposition, true)
        if (!authStore.user) await authStore.fetchUser()
    }
})
onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('click', onClickAway)
        window.removeEventListener('scroll', reposition, true)
    }
})
</script>

<style scoped>
@reference "@/style.css";

.custom-font-poppins { font-family: 'Poppins', sans-serif !important; }

.scroll-left-container { direction: rtl; overflow-y: auto; overflow-x: visible; }
.scroll-content { direction: ltr; display: flex; flex-direction: column; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-platinum-300 dark:bg-abyss-600 rounded-full; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

.menu-item {
    @apply w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase hover:text-calm-lavender-600 hover:bg-calm-lavender-500/5 transition-all border-b border-platinum-200 dark:border-abyss-600 last:border-none;
    font-family: 'Poppins', sans-serif !important;
}

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(15px) scale(0.95); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>